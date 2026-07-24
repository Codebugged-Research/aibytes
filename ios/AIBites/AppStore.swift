import Foundation
import SwiftUI

/// Single source of truth for auth + progress + curriculum.
/// Progress is cached in UserDefaults (offline-first) and synced to the backend
/// whenever a token exists. Streak/completion logic mirrors the web MVP's storage.js.
@MainActor
final class AppStore: ObservableObject {
    @Published var onboarded: Bool
    @Published var user: User?
    @Published var progress: Progress
    @Published var curriculum: Curriculum = Curriculum(app: "AIBites", units: []) {
        didSet { rebuildOrderedUnits() }
    }
    @Published var voiceEnabled = false          // session-only, opt-in (matches MVP)
    @Published var theme: String {               // "light" | "dark" (web theme.js)
        didSet { UserDefaults.standard.set(theme, forKey: "aiquest_theme") }
    }
    @Published var notifsSeen: Bool {
        didSet { UserDefaults.standard.set(notifsSeen, forKey: "aiquest_notifs_seen") }
    }
    /// Streak value preserved when a day is missed, so it can be restored via
    /// the unfreeze flow. 0 means the streak is healthy (nothing to restore).
    @Published var frozenStreak: Int {
        didSet { UserDefaults.standard.set(frozenStreak, forKey: "aiquest_frozen_streak") }
    }
    /// Role-based path — a single Roles id, or nil for "no role picked"
    /// (nothing filtered).
    @Published var rolePref: String? {
        didSet {
            UserDefaults.standard.set(rolePref, forKey: "aiquest_role_pref")
            rebuildOrderedUnits()
        }
    }

    /// The active role's metadata (icon/label), or nil if none picked.
    var activeRole: Role? { Roles.byId(rolePref) }

    /// Cached result of Roles.filter — rebuilt only when curriculum or
    /// rolePref actually change, instead of on every access (this was
    /// previously a computed property recalculated on every SwiftUI render
    /// pass and on every completeLesson() call, which showed up as jank).
    private(set) var orderedUnits: [Unit] = []
    private(set) var orderedLessons: [String] = []

    private func rebuildOrderedUnits() {
        orderedUnits = Roles.filter(curriculum.units, roleId: rolePref)
        orderedLessons = orderedUnits.flatMap { $0.lessons.map(\.id) }
    }

    private var token: String?
    private let d = UserDefaults.standard

    init() {
        notifsSeen = UserDefaults.standard.bool(forKey: "aiquest_notifs_seen")
        frozenStreak = UserDefaults.standard.integer(forKey: "aiquest_frozen_streak")
        rolePref = UserDefaults.standard.string(forKey: "aiquest_role_pref")
        if UITest.flag("RESET") {
            let ud = UserDefaults.standard
            for key in ["aiquest_token", "aiquest_user", "aiquest_progress", "aiquest_onboarded"] {
                ud.removeObject(forKey: key)
            }
        }
        onboarded = d.bool(forKey: "aiquest_onboarded")
        token = d.string(forKey: "aiquest_token")
        user = Self.decode(d.data(forKey: "aiquest_user"))
        progress = Self.decode(d.data(forKey: "aiquest_progress")) ?? .empty
        theme = UITest.str("THEME") ?? d.string(forKey: "aiquest_theme") ?? "light"
        if UITest.flag("ONBOARDED") {
            onboarded = true
            token = nil
            user = User(id: -1, email: "alex@example.com", name: "Alex Kim",
                        authMethod: "phone", phone: nil)
            progress = .empty
        }
    }

    func loadCurriculum() async { curriculum = await API.curriculum() }

    // MARK: Auth

    func completeOnboarding(email: String, name: String, method: String, phone: String?) async {
        do {
            let res = try await API.auth(email: email, name: name, method: method, phone: phone)
            token = res.token
            user = res.user
            progress = res.progress
            persistAuth()
        } catch {
            // Offline fallback: still let the user in with a local profile.
            user = User(id: -1, email: email, name: name, authMethod: method, phone: phone)
        }
        onboarded = true
        d.set(true, forKey: "aiquest_onboarded")
        persistProgress()
    }

    /// Apply an AuthResponse that's already been verified server-side (Google,
    /// future Apple) — no client-supplied identity to trust, just apply it.
    func applyAuth(_ res: AuthResponse) {
        token = res.token
        user = res.user
        progress = res.progress
        persistAuth()
        onboarded = true
        d.set(true, forKey: "aiquest_onboarded")
        persistProgress()
    }

    func logout() {
        token = nil; user = nil; onboarded = false; progress = .empty
        ["aiquest_token", "aiquest_user", "aiquest_progress", "aiquest_onboarded"]
            .forEach { d.removeObject(forKey: $0) }
    }

    // MARK: Progress (mirrors storage.js)

    var xp: Int { progress.xp }
    var level: Int { progress.xp / 20 + 1 }

    func isCompleted(_ id: String) -> Bool { progress.completedLessons.contains(id) }


    func isLocked(_ id: String) -> Bool {
        // ponytail: all lessons unlocked for now; restore sequential gating by reverting this to the prevDone check
        return false
    }

    func point(for id: String) -> LessonPoint {
        progress.lessonProgress[id] ?? LessonPoint(segmentIndex: 0, exerciseIndex: 0)
    }

    func saveLessonPoint(_ id: String, seg: Int, ex: Int) {
        progress.lessonProgress[id] = LessonPoint(segmentIndex: seg, exerciseIndex: ex)
        persistProgress()
    }

    /// Marks a lesson complete, awards XP, updates streak, advances current lesson.
    func completeLesson(_ id: String, xpEarned: Int) {
        guard !isCompleted(id) else { return }
        progress.completedLessons.append(id)
        progress.xp += xpEarned
        updateStreak()
        let order = orderedLessons
        if let idx = order.firstIndex(of: id), idx + 1 < order.count {
            progress.currentLesson = order[idx + 1]
        }
        progress.lessonProgress.removeValue(forKey: id)
        persistProgress()
    }

    private func updateStreak() {
        let today = Self.todayString()
        if progress.lastLessonDate == today { return }
        let cal = Calendar.current
        let yesterday = Self.dateString(cal.date(byAdding: .day, value: -1, to: Date())!)
        if progress.lastLessonDate == yesterday {
            progress.streak += 1                 // continued — streak grows
        } else {
            // A day was missed. Preserve the broken streak so it can be restored
            // via the unfreeze flow, then start today as a fresh 1-day streak.
            if progress.streak > 1 { frozenStreak = progress.streak }
            progress.streak = 1
        }
        progress.lastLessonDate = today
    }

    // MARK: Streak unfreeze

    static let unfreezeCost = 15

    /// True only when there's a broken streak worth restoring and the user can afford it.
    var canUnfreeze: Bool { frozenStreak > 1 && progress.xp >= Self.unfreezeCost }

    /// Spend XP to restore the broken streak (adds today's day on top).
    func unfreezeStreak() {
        guard canUnfreeze else { return }
        progress.xp -= Self.unfreezeCost
        progress.streak = frozenStreak
        frozenStreak = 0
        persistProgress()
    }

    /// Let the broken streak go — dismiss the frozen state, keep the fresh streak.
    func dismissFreeze() { frozenStreak = 0 }

    func resetProgress() {
        progress = .empty
        frozenStreak = 0
        persistProgress()
    }

    /// Persist after an external mutation of `progress` (e.g. streak unfreeze).
    func persistFromExternal() { persistProgress() }

    // MARK: Persistence

    private func persistAuth() {
        d.set(token, forKey: "aiquest_token")
        d.set(Self.encode(user), forKey: "aiquest_user")
    }

    private func persistProgress() {
        d.set(Self.encode(progress), forKey: "aiquest_progress")
        syncProgress()
    }

    private func syncProgress() {
        guard let token else { return }
        let snapshot = progress
        Task {
            if let saved = try? await API.putProgress(snapshot, token: token) {
                self.progress = saved
                self.d.set(Self.encode(saved), forKey: "aiquest_progress")
            }
        }
    }

    // MARK: Utils

    /// Matches JS `new Date().toDateString()` — e.g. "Thu Jul 02 2026".
    static func todayString() -> String { dateString(Date()) }
    static func dateString(_ date: Date) -> String {
        let f = DateFormatter()
        f.locale = Locale(identifier: "en_US")
        f.dateFormat = "EEE MMM dd yyyy"
        return f.string(from: date)
    }

    private static func encode<T: Encodable>(_ v: T?) -> Data? {
        guard let v else { return nil }
        return try? JSONEncoder().encode(v)
    }
    private static func decode<T: Decodable>(_ data: Data?) -> T? {
        guard let data else { return nil }
        return try? JSONDecoder().decode(T.self, from: data)
    }
}

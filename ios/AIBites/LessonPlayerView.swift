import SwiftUI
import UIKit

/// The lesson engine. Walks teach cards then practice/boss exercises, tracks
/// hearts + earned XP, narrates cards on demand, and posts completion to the store.
/// Presented as a full-screen cover, so it owns its own top bar + footer.
struct LessonPlayerView: View {
    @EnvironmentObject var store: AppStore
    @StateObject private var narrator = Narrator()
    let lessonId: String
    let onClose: () -> Void
    var onContinueLearning: (() -> Void)? = nil

    @State private var lesson: Lesson?
    @State private var segIndex = 0            // index into segments
    @State private var cardIndex = 0           // teach: card; practice/boss: exercise
    @State private var totalHearts = 3
    @State private var hearts = 3
    @State private var earnedXP = 0
    @State private var selected: String?       // selected option / word id
    @State private var revealed = false        // answer checked?
    @State private var isCorrect = false
    @State private var finished = false         // completion screen
    @State private var failed = false           // out-of-hearts screen

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()
            if let lesson {
                if finished {
                    fitOrScroll { completion(lesson) }
                } else if failed {
                    fitOrScroll { failScreen() }
                } else {
                    VStack(spacing: 0) {
                        topBar(lesson)
                        content(lesson)
                        footer(lesson)
                    }
                }
            } else {
                Mascot(mood: .thinking, size: 96)
            }
        }
        .task {
            let l = await API.lesson(lessonId)
            await MainActor.run {
                lesson = l
                totalHearts = l?.hearts ?? 3
                hearts = l?.hearts ?? 3
                applyUITestJump()
            }
        }
    }

    /// DEBUG screenshot harness — jump straight to a given lesson state.
    private func applyUITestJump() {
        guard UITest.active else { return }
        segIndex = UITest.int("SEG") ?? segIndex
        cardIndex = UITest.int("CARD") ?? cardIndex
        if let sel = UITest.str("SELECT") { selected = sel }
        earnedXP = UITest.int("EARNED") ?? earnedXP
        hearts = UITest.int("HEARTS") ?? hearts
        if UITest.flag("REVEAL"), selected != nil { check() }
        if UITest.flag("FINISHED") { finished = true }
        if UITest.flag("FAILED") { failed = true }
    }

    /// Centres content on any screen tall enough; scrolls on small iPhones
    /// instead of clipping (completion/fail stacks are ~620pt tall).
    private func fitOrScroll<C: View>(@ViewBuilder _ content: () -> C) -> some View {
        let inner = content()
        return GeometryReader { geo in
            ScrollView {
                inner
                    .padding(.vertical, 16)
                    .frame(maxWidth: .infinity, minHeight: geo.size.height)
            }
        }
    }

    // MARK: derived

    private var segment: Segment? { lesson?.segments[safe: segIndex] }
    private var isTeach: Bool { segment?.type == "teach" }
    private var cards: [Card] { segment?.cards ?? [] }
    private var exercises: [Exercise] { segment?.exercises ?? [] }
    private var currentCard: Card? { cards[safe: cardIndex] }
    private var currentExercise: Exercise? { exercises[safe: cardIndex] }

    /// 0…1 across all segments+items for the progress bar (mirrors web math).
    private var progress: Double {
        guard let lesson, !lesson.segments.isEmpty else { return 0 }
        let total = Double(isTeach ? cards.count : exercises.count)
        let within = total > 0 ? Double(cardIndex) / total : 0
        return (Double(segIndex) + within) / Double(lesson.segments.count)
    }

    // MARK: sections

    private func topBar(_ lesson: Lesson) -> some View {
        VStack(spacing: 12) {
            HStack {
                Button {
                    narrator.stop()
                    onClose()
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 15, weight: .bold))
                        .foregroundColor(Theme.ink)
                        .frame(width: 36, height: 36)
                        .background(Theme.card)
                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                        .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .stroke(Theme.slate200, lineWidth: 1))
                }

                Spacer()

                Text(lesson.title.uppercased())
                    .font(Theme.inter(10, .bold))
                    .tracking(0.8)
                    .foregroundColor(Theme.inkFaint)
                    .lineLimit(1)

                Spacer()

                HStack(spacing: 4) {
                    ForEach(0..<totalHearts, id: \.self) { i in
                        Image(systemName: "heart.fill")
                            .font(.system(size: 15))
                            .foregroundColor(i < hearts ? Theme.red : Theme.slate200)
                    }
                }
            }

            ProgressBarView(value: progress, fill: Theme.violet, track: Theme.slate100, height: 8)
        }
        .padding(.horizontal, 20)
        .padding(.top, 14)
        .padding(.bottom, 12)
    }

    @ViewBuilder
    private func content(_ lesson: Lesson) -> some View {
        // The web's phone frame is shorter, so its card visually fills the content
        // area. On the taller device we centre the card in the space between the
        // header and footer (no dead bottom gap); it scrolls when taller.
        GeometryReader { geo in
            ScrollView {
                VStack(spacing: 24) {
                    if isTeach, let card = currentCard {
                        // Teach card stretches to fill the space between the
                        // header and the footer — no dead gap above or below.
                        TeachCardView(card: card, narrator: narrator,
                                      voiceEnabled: $store.voiceEnabled)
                            .frame(maxHeight: .infinity)
                    } else if let ex = currentExercise {
                        // Exercises start from the top of the screen
                        ExerciseView(exercise: ex, selected: $selected,
                                     revealed: revealed, isCorrect: isCorrect)
                    }
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 20)
                .frame(minWidth: 0, maxWidth: .infinity, minHeight: geo.size.height, alignment: .top)
                .id("\(segIndex)-\(cardIndex)")
            }
        }
    }

    @ViewBuilder
    private func footer(_ lesson: Lesson) -> some View {
        VStack(spacing: 0) {
            // Feedback panel (after reveal on an exercise)
            if !isTeach && revealed {
                feedbackPanel(lesson)
            }
            Button(action: primaryAction) {
                Text(buttonLabel.uppercased())
                    .font(Theme.inter(14, .black))
                    .tracking(0.8)
                    .foregroundColor(buttonEnabled ? .white : Theme.inkFaint)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(buttonColor)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            }
            .disabled(!buttonEnabled)
            .padding(.horizontal, 20)
            .padding(.vertical, 16)
        }
        .frame(maxWidth: .infinity)
        .background(
            footerBg
                .clipShape(RoundedCorners(radius: 24, corners: [.topLeft, .topRight]))
                .overlay(alignment: .top) {
                    RoundedCorners(radius: 24, corners: [.topLeft, .topRight])
                        .stroke(footerBorder, lineWidth: 1)
                }
                .ignoresSafeArea(edges: .bottom)
        )
    }

    private func feedbackPanel(_ lesson: Lesson) -> some View {
        Group {
            if isCorrect {
                HStack(alignment: .top, spacing: 12) {
                    Mascot(mood: .celebrate, size: 52, glow: false)
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Amazing!")
                            .font(Theme.inter(20, .black))
                            .foregroundColor(Theme.emerald700)    // emerald-700
                        Text("+\(currentExercise?.xp ?? 0) XP earned")
                            .font(Theme.inter(12, .bold))
                            .foregroundColor(Theme.emerald)
                    }
                    Spacer(minLength: 0)
                }
            } else {
                // Web: mascot + "Incorrect" in a row, explanation below full width
                VStack(alignment: .leading, spacing: 8) {
                    HStack(spacing: 12) {
                        Mascot(mood: .sad, size: 52, glow: false)
                        Text("Incorrect")
                            .font(Theme.inter(20, .black))
                            .foregroundColor(Theme.red600)    // red-600
                        Spacer(minLength: 0)
                    }
                    if let explain = currentExercise?.explain, !explain.isEmpty {
                        Text(explain)
                            .font(Theme.inter(12, .semibold))
                            .foregroundColor(Theme.inkSoft)
                            .lineSpacing(4)
                            .fixedSize(horizontal: false, vertical: true)
                            .padding(.leading, 4)
                    }
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 20)
        .padding(.bottom, 4)
    }

    private var footerBg: Color {
        guard !isTeach && revealed else { return Theme.bg }
        return isCorrect ? Theme.tintEmerald : Theme.rose50  // rose-50
    }

    private var footerBorder: Color {
        guard !isTeach && revealed else { return .clear }
        return isCorrect ? Theme.tintEmeraldB : Theme.red200 // emerald-200 / red-200
    }

    private var buttonLabel: String {
        if isTeach { return "Continue" }
        if !revealed { return "Check" }
        return isCorrect ? "Continue" : "Got it"
    }

    private var buttonEnabled: Bool {
        if isTeach { return true }
        if !revealed { return selected != nil }
        return true
    }

    private var buttonColor: Color {
        if !buttonEnabled { return Theme.slate100 }
        if !isTeach && revealed { return isCorrect ? Theme.emerald : Theme.red }
        return Theme.violet
    }

    // MARK: completion / fail

    private func completion(_ lesson: Lesson) -> some View {
        let totalXP = lesson.xp + earnedXP
        return VStack(spacing: 24) {
            Mascot(mood: .celebrate, size: 124)

            VStack(spacing: 8) {
                Text("Lesson Complete!")
                    .font(Theme.head(30))
                    .foregroundColor(Theme.ink)
                HStack(spacing: 8) {
                    Image(systemName: "bolt.fill").font(.system(size: 16)).foregroundColor(Theme.violet)
                    Text("+\(totalXP) XP")
                        .font(Theme.inter(20, .black))
                        .foregroundColor(Theme.slate700)       // slate-700
                }
            }

            if hearts > 0 {
                HStack(spacing: 6) {
                    ForEach(0..<totalHearts, id: \.self) { i in
                        Image(systemName: "heart.fill")
                            .font(.system(size: 16))
                            .foregroundColor(i < hearts ? Theme.red : Theme.slate200)
                    }
                    if hearts == totalHearts {
                        Text("Perfect!")
                            .font(Theme.inter(12, .black))
                            .foregroundColor(Theme.inkSoft)
                            .padding(.leading, 4)
                    }
                }
            }

            VStack(alignment: .leading, spacing: 8) {
                HStack(spacing: 8) {
                    Image(systemName: "bolt.fill").font(.system(size: 16))
                        .foregroundColor(Theme.violet600)       // violet-600
                    Text("Key Takeaway")
                        .font(Theme.inter(14, .heavy))
                        .foregroundColor(Theme.ink)
                }
                Text(lesson.concept)
                    .font(Theme.inter(12, .semibold))
                    .foregroundColor(Theme.slate600)           // slate-600
                    .lineSpacing(4)
                    .fixedSize(horizontal: false, vertical: true)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
            .padding(20)
            .background(LinearGradient(colors: [Theme.tintViolet, Theme.indigo50],
                                       startPoint: .topLeading, endPoint: .bottomTrailing))
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(Theme.tintVioletB, lineWidth: 1))

            VStack(spacing: 12) {
                DarkButton(title: "Continue Learning") { (onContinueLearning ?? onClose)() }
                SecondaryButton(title: "Back to Home") { onClose() }
            }
            .padding(.top, 8)
        }
        .padding(.horizontal, 24)
    }

    private func failScreen() -> some View {
        VStack(spacing: 24) {
            Mascot(mood: .sad, size: 124)
            VStack(spacing: 8) {
                Text("Out of hearts!")
                    .font(Theme.head(30))
                    .foregroundColor(Theme.ink)
                Text("No worries — mistakes are how you learn. Give this bite another go.")
                    .font(Theme.inter(13, .medium))
                    .foregroundColor(Theme.inkSoft)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 16)
            }
            HStack(spacing: 6) {
                ForEach(0..<totalHearts, id: \.self) { _ in
                    Image(systemName: "heart.fill")
                        .font(.system(size: 16))
                        .foregroundColor(Theme.slate200)
                }
            }
            VStack(spacing: 12) {
                DarkButton(title: "Try again", icon: "arrow.counterclockwise") { restart() }
                SecondaryButton(title: "Back to Home") { onClose() }
            }
            .padding(.top, 8)
        }
        .padding(.horizontal, 24)
    }

    // MARK: flow

    private func primaryAction() {
        guard let lesson else { return }
        if isTeach {
            advanceItem(lesson)
        } else if !revealed {
            check()
        } else {
            advanceItem(lesson)
        }
    }

    private func check() {
        guard let ex = currentExercise, let sel = selected else { return }
        let correct: Bool
        if ex.type == "fill_blank" {
            correct = sel == ex.blank
        } else {
            correct = ex.options?.first { $0.id == sel }?.correct ?? false
        }
        isCorrect = correct
        revealed = true
        narrator.stop()
        if correct {
            earnedXP += ex.xp
        } else {
            hearts = max(0, hearts - 1)
        }
    }

    private func advanceItem(_ lesson: Lesson) {
        // Out of hearts -> fail screen.
        if !isTeach && revealed && hearts == 0 {
            failed = true
            return
        }
        let count = isTeach ? cards.count : exercises.count
        if cardIndex < count - 1 {
            cardIndex += 1
            resetExercise()
        } else {
            nextSegment(lesson)
        }
    }

    private func nextSegment(_ lesson: Lesson) {
        narrator.stop()
        if segIndex < lesson.segments.count - 1 {
            segIndex += 1
            cardIndex = 0
            resetExercise()
            store.saveLessonPoint(lessonId, seg: segIndex, ex: 0)
        } else {
            store.completeLesson(lessonId, xpEarned: earnedXP)
            finished = true
        }
    }

    private func resetExercise() {
        selected = nil
        revealed = false
        isCorrect = false
    }

    private func restart() {
        failed = false
        finished = false
        segIndex = 0
        cardIndex = 0
        hearts = totalHearts
        earnedXP = 0
        resetExercise()
    }
}

// Rounds only selected corners (top corners of the footer sheet).
struct RoundedCorners: Shape {
    var radius: CGFloat = 0
    var corners: UIRectCorner = .allCorners
    func path(in rect: CGRect) -> Path {
        Path(UIBezierPath(roundedRect: rect, byRoundingCorners: corners,
                          cornerRadii: CGSize(width: radius, height: radius)).cgPath)
    }
}

extension Array {
    subscript(safe i: Int) -> Element? { indices.contains(i) ? self[i] : nil }
}

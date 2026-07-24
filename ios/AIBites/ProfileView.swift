import SwiftUI

/// Account page — full parity with web Profile.js:
/// gradient profile card with pulsing ring + initials avatar, STATISTICS section
/// (3 gradient-icon stat rows), inline-expand Reset Progress confirm, Appearance
/// toggle row, and Log Out. Light theme, Theme.bg, no NavigationView.
struct ProfileView: View {
    @EnvironmentObject var store: AppStore

    @State private var showReset = false
    @State private var avatarPopped = false
    @State private var ringPulse = false
    @State private var showLearningFocus = false

    // #FFE27C avatar + amber-200 border + amber-300→violet-400 ring
    private let avatarFill = Color(hex: 0xFFE27C)
    private let amber200   = Color(hex: 0xFDE68A)
    private let amber300   = Color(hex: 0xFCD34D)

    private var displayName: String {
        let name = (store.user?.name ?? "").trimmingCharacters(in: .whitespaces)
        return name.isEmpty ? "AI Learner" : name
    }

    private var initials: String {
        let parts = displayName.split(separator: " ").filter { !$0.isEmpty }
        if parts.count >= 2 { return "\(parts[0].prefix(1))\(parts[1].prefix(1))".uppercased() }
        if let first = parts.first { return String(first.prefix(2)).uppercased() }
        return "AI"
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                header
                profileCard
                statistics
                resetSection
                learningFocusRow
                appearanceRow
                logoutButton
            }
            .padding(.horizontal, 24).padding(.top, 6).padding(.bottom, 120)
        }
        .background(Theme.bg)
        .sheet(isPresented: $showLearningFocus) { LearningFocusView().environmentObject(store) }
    }

    // MARK: header

    private var header: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text("Profile").font(Theme.head(30)).foregroundColor(Theme.ink)
            Text("Track your learning progress")
                .font(Theme.body(14)).foregroundColor(Theme.inkFaint)
        }
    }

    // MARK: profile card (violet→indigo tint gradient)

    private var profileCard: some View {
        VStack(spacing: 12) {
            ZStack {
                // Outer animated glow ring (amber-300 → violet-400)
                Circle()
                    .fill(LinearGradient(colors: [amber300, Theme.violet400],
                                         startPoint: .topLeading, endPoint: .bottomTrailing))
                    .frame(width: 80, height: 80)
                    .scaleEffect(ringPulse ? 1.18 : 1.0)
                    .opacity(ringPulse ? 0.5 : 0.3)
                    .animation(.easeInOut(duration: 2.5).repeatForever(autoreverses: true), value: ringPulse)

                // Avatar
                Circle().fill(avatarFill)
                    .frame(width: 80, height: 80)
                    .overlay(Circle().stroke(amber200, lineWidth: 2))
                    .overlay(Text(initials).font(Theme.head(24)).foregroundColor(Theme.ink))
                    .shadow(color: .black.opacity(0.12), radius: 6, y: 3)
                    .scaleEffect(avatarPopped ? 1.25 : 1.0)
                    .animation(.spring(response: 0.35, dampingFraction: 0.45), value: avatarPopped)
                    .onTapGesture {
                        avatarPopped = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.6) { avatarPopped = false }
                    }
            }
            .frame(width: 80, height: 80)

            VStack(spacing: 4) {
                Text(displayName).font(Theme.head(20)).foregroundColor(Theme.ink)
                HStack(spacing: 6) {
                    Image(systemName: "checkmark.shield.fill")
                        .font(.system(size: 11, weight: .bold)).foregroundColor(Theme.violet500)
                    Text("FOUNDATION EXPLORER")
                        .font(Theme.outfit(11, .heavy)).foregroundColor(Theme.violet500)
                        .kerning(0.6)
                }
            }
        }
        .frame(maxWidth: .infinity)
        .padding(20)
        .background(LinearGradient(colors: [Theme.tintViolet, Theme.indigo50],
                                   startPoint: .topLeading, endPoint: .bottomTrailing))
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous)
            .stroke(Theme.tintVioletB, lineWidth: 1))
        .shadow(color: .black.opacity(0.03), radius: 8, y: 2)
        .onAppear { ringPulse = true }
    }

    // MARK: statistics

    private var statistics: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("STATISTICS")
                .font(Theme.outfit(12, .heavy)).foregroundColor(Theme.ink950)
                .kerning(0.6).padding(.leading, 4)

            statRow(icon: "flame.fill", label: "Day Streak", value: store.progress.streak,
                    gradient: Theme.gOrange, tint: Theme.tintOrange, tintB: Theme.tintOrangeB)
            statRow(icon: "bolt.fill", label: "Total XP", value: store.xp,
                    gradient: Theme.gViolet, tint: Theme.tintViolet, tintB: Theme.tintVioletB)
            statRow(icon: "rosette", label: "Completed Lessons",
                    value: store.progress.completedLessons.count,
                    gradient: Theme.gEmerald, tint: Theme.tintEmerald, tintB: Theme.tintEmeraldB)
        }
    }

    private func statRow(icon: String, label: String, value: Int,
                         gradient: LinearGradient, tint: Color, tintB: Color) -> some View {
        HStack {
            HStack(spacing: 16) {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(gradient)
                    .frame(width: 44, height: 44)
                    .overlay(Image(systemName: icon)
                        .font(.system(size: 18, weight: .bold)).foregroundColor(.white))
                    .shadow(color: .black.opacity(0.06), radius: 4, y: 2)
                Text(label).font(Theme.label(14)).foregroundColor(Theme.ink)
            }
            Spacer()
            Text("\(value)").font(Theme.head(24)).foregroundColor(Theme.ink)
        }
        .padding(16)
        .background(LinearGradient(colors: [tint, tintB],
                                   startPoint: .topLeading, endPoint: .bottomTrailing))
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous).stroke(tintB, lineWidth: 1))
        .shadow(color: .black.opacity(0.03), radius: 8, y: 2)
    }

    // MARK: reset (inline-expand confirm)

    private var resetSection: some View {
        VStack(spacing: 12) {
            Button {
                withAnimation(.spring(response: 0.32, dampingFraction: 0.8)) { showReset.toggle() }
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "arrow.counterclockwise")
                        .font(.system(size: 15, weight: .bold))
                        .rotationEffect(.degrees(showReset ? 180 : 0))
                    Text("Reset Progress").font(Theme.outfit(14, .bold))
                    Image(systemName: "chevron.right")
                        .font(.system(size: 13, weight: .bold))
                        .rotationEffect(.degrees(showReset ? 90 : 0))
                }
                .foregroundColor(Theme.inkSoft)
                .frame(maxWidth: .infinity).padding(.vertical, 14)
                .background(Theme.card)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(Theme.border, lineWidth: 1))
                .shadow(color: .black.opacity(0.03), radius: 6, y: 2)
            }

            if showReset {
                Button { store.resetProgress() } label: {
                    HStack(spacing: 8) {
                        Image(systemName: "exclamationmark.circle.fill")
                            .font(.system(size: 15, weight: .bold))
                        Text("Confirm Reset — Cannot be undone")
                            .font(Theme.outfit(14, .bold))
                    }
                    .foregroundColor(.white)
                    .frame(maxWidth: .infinity).padding(.vertical, 16)
                    .background(Theme.red)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }
                .transition(.move(edge: .top).combined(with: .opacity))
            }
        }
        .padding(.top, 2)
    }

    // MARK: learning focus

    private var learningFocusRow: some View {
        Button { showLearningFocus = true } label: {
            HStack(spacing: 12) {
                Circle().fill(Theme.slate50)
                    .frame(width: 36, height: 36)
                    .overlay(Image(systemName: "target")
                        .font(.system(size: 15, weight: .semibold)).foregroundColor(Theme.violet))
                VStack(alignment: .leading, spacing: 2) {
                    Text("Your Role").font(Theme.outfit(14, .bold)).foregroundColor(Theme.ink)
                    Text("Change your role anytime").font(Theme.inter(12, .medium)).foregroundColor(Theme.inkFaint)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .bold)).foregroundColor(Theme.inkFaint)
            }
            .padding(.horizontal, 16).padding(.vertical, 12)
            .background(Theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(Theme.border, lineWidth: 1))
            .shadow(color: .black.opacity(0.03), radius: 6, y: 2)
        }
        .buttonStyle(.plain)
    }

    // MARK: appearance

    private var appearanceRow: some View {
        HStack(spacing: 12) {
            Circle().fill(Theme.slate50)
                .frame(width: 36, height: 36)
                .overlay(Image(systemName: "paintpalette")
                    .font(.system(size: 15, weight: .semibold)).foregroundColor(Theme.slate700))
            VStack(alignment: .leading, spacing: 2) {
                Text("Appearance").font(Theme.outfit(14, .bold)).foregroundColor(Theme.ink)
                Text("Light or dark theme").font(Theme.inter(12, .medium)).foregroundColor(Theme.inkFaint)
            }
            Spacer()
            Toggle("", isOn: Binding(
                get: { store.theme == "dark" },
                set: { isDark in
                    withAnimation(.easeInOut(duration: 0.25)) {
                        store.theme = isDark ? "dark" : "light"
                    }
                }
            )).labelsHidden().tint(Theme.violet)
        }
        .padding(.horizontal, 16).padding(.vertical, 12)
        .background(Theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(Theme.border, lineWidth: 1))
        .shadow(color: .black.opacity(0.03), radius: 6, y: 2)
    }

    // MARK: log out

    private var logoutButton: some View {
        Button { store.logout() } label: {
            HStack(spacing: 8) {
                Image(systemName: "rectangle.portrait.and.arrow.right")
                    .font(.system(size: 15, weight: .bold))
                Text("Log Out").font(Theme.outfit(14, .bold))
            }
            .foregroundColor(Theme.red)
            .frame(maxWidth: .infinity).padding(.vertical, 14)
            .background(Theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(Theme.border, lineWidth: 1))
            .shadow(color: .black.opacity(0.03), radius: 6, y: 2)
        }
    }
}

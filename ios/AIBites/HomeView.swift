import SwiftUI

/// Home dashboard — full parity with web Home.js:
/// greeting + "Let's start" pill, Byte coach, gradient Level bar, 3 colored stat
/// cards (Streak/XP/Lessons), Habit Tracker with connector line, AI Course progress.
struct HomeView: View {
    @EnvironmentObject var store: AppStore
    let startLesson: (String) -> Void
    let goPath: () -> Void

    @State private var showUnfreeze = false
    @State private var glowPulse = false
    @State private var shimmer = false
    @State private var habitGlow = false

    private var firstName: String {
        (store.user?.name ?? "").trimmingCharacters(in: .whitespaces)
            .split(separator: " ").first.map(String.init) ?? "there"
    }
    private var completed: Int { store.progress.completedLessons.count }
    private var total: Int { max(store.orderedLessons.count, 15) }
    private var xp: Int { store.xp }
    private var streak: Int { store.progress.streak }

    // Weekday demo streak data (matches web)
    private let weekDays: [(day: String, active: Bool, today: Bool, label: String)] = [
        ("M", true, false, "Mon"), ("T", true, false, "Tue"), ("W", true, false, "Wed"),
        ("T", false, true, "Thu"), ("F", false, false, "Fri"),
        ("S", false, false, "Sat"), ("S", false, false, "Sun"),
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                greeting
                MascotCoach(mood: .wave, size: 58, message: coachMessage)
                levelBar
                statsGrid
                habitTracker
                progressSection
            }
            .padding(.horizontal, 24).padding(.top, 4).padding(.bottom, 120)
        }
        .background(Theme.bg)
        .onAppear {
            // Prompt to restore a broken streak (or the UI-test hook).
            if store.frozenStreak > 1 || UITest.flag("UNFREEZE") { showUnfreeze = true }
        }
        // Web shows this as a full-screen overlay, not a half sheet
        .fullScreenCover(isPresented: $showUnfreeze) {
            StreakUnfreezeView(currentStreak: max(store.frozenStreak, streak),
                               canAfford: store.canUnfreeze) {
                store.unfreezeStreak()          // spends 15 XP, restores the streak
                showUnfreeze = false
            } onClose: {
                store.dismissFreeze()           // let the broken streak go
                showUnfreeze = false
            }
        }
    }

    // MARK: greeting + CTA

    private var greeting: some View {
        HStack {
            (Text("Hey, ").font(Theme.head(24)).foregroundColor(Theme.ink)
             + Text("\(firstName) 👋").font(Theme.head(24)).foregroundColor(Theme.ink))
            Spacer()
            Button { goPath() } label: {
                HStack(spacing: 4) {
                    Image(systemName: "sparkles").font(.system(size: 10)).foregroundColor(Theme.violet400)
                    Text("Let's start").font(Theme.inter(11, .black))
                    Image(systemName: "chevron.right").font(.system(size: 9, weight: .black))
                }
                .foregroundColor(Theme.dyn(0xFFFFFF, 0x0F172A))
                .padding(.horizontal, 14).padding(.vertical, 8)
                .background(Theme.ink)
                .overlay(                                   // shimmer sheen sweep
                    GeometryReader { geo in
                        LinearGradient(colors: [.clear, .white.opacity(0.22), .clear],
                                       startPoint: .leading, endPoint: .trailing)
                            .frame(width: geo.size.width * 0.6)
                            .rotationEffect(.degrees(-20))
                            .offset(x: shimmer ? geo.size.width * 1.2 : -geo.size.width * 0.8)
                    }
                )
                .clipShape(Capsule())
                .background(                                // breathing blurred glow
                    Capsule().fill(Theme.violet.opacity(0.35))
                        .blur(radius: 8)
                        .scaleEffect(glowPulse ? 1.12 : 0.95)
                        .opacity(glowPulse ? 0.75 : 0.4)
                )
            }
            .onAppear {
                withAnimation(.easeInOut(duration: 2.2).repeatForever(autoreverses: true)) { glowPulse = true }
                withAnimation(.easeInOut(duration: 2.2).repeatForever(autoreverses: false).delay(1)) { shimmer = true }
            }
        }
    }

    private var coachMessage: String {
        if xp == 0 { return "Hi, I'm Byte! Let's start your first AI bite." }
        if completed >= total { return "You finished every bite! Fancy a refresher?" }
        if streak > 1 { return "\(streak)-day streak! Keep it sharp — one bite today?" }
        return "Welcome back! \(completed) bite\(completed == 1 ? "" : "s") down. One more?"
    }

    // MARK: level bar

    private var levelBar: some View {
        let level = xp / 20 + 1
        let levelXP = xp % 20
        return CardBox {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    HStack(spacing: 6) {
                        ZStack {
                            Circle().fill(Theme.gViolet).frame(width: 24, height: 24)
                            Image(systemName: "bolt.fill").font(.system(size: 11)).foregroundColor(.white)
                        }
                        Text("Level \(level)").font(Theme.inter(12, .black)).foregroundColor(Theme.ink)
                    }
                    Spacer()
                    Text("\(levelXP) / 20 XP").font(Theme.inter(10, .bold)).foregroundColor(Theme.inkFaint)
                }
                ProgressBarView(value: Double(levelXP) / 20.0)
            }
        }
    }

    // MARK: stats grid

    private var statsGrid: some View {
        HStack(spacing: 12) {
            statCard(bg: Theme.tintOrange, border: Theme.tintOrangeB, icon: "flame.fill",
                     tint: Theme.orange, value: "\(streak)", label: "Streak") {
                         if store.frozenStreak > 1 { showUnfreeze = true }
                     }
            statCard(bg: Theme.tintViolet, border: Theme.tintVioletB, icon: "bolt.fill",
                     tint: Theme.violet, value: "\(xp)", label: "Total XP") {}
            statCard(bg: Theme.tintEmerald, border: Theme.tintEmeraldB, icon: "rosette",
                     tint: Theme.emerald, value: "\(completed)/\(total)", label: "Lessons") {}
        }
    }

    private func statCard(bg: Color, border: Color, icon: String, tint: Color,
                          value: String, label: String, tap: @escaping () -> Void) -> some View {
        Button(action: tap) {
            VStack(spacing: 5) {
                Image(systemName: icon).font(.system(size: 20, weight: .bold)).foregroundColor(tint)
                Text(value).font(Theme.inter(20, .heavy)).foregroundColor(Theme.ink)
                Text(label.uppercased()).font(Theme.inter(10, .heavy))
                    .foregroundColor(Theme.inkFaint).tracking(0.5)
            }
            .frame(maxWidth: .infinity).padding(.vertical, 16)
            .background(bg).clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous).stroke(border, lineWidth: 1))
        }
    }

    // MARK: habit tracker

    private var habitTracker: some View {
        Button { if store.frozenStreak > 1 { showUnfreeze = true } } label: {
            CardBox {
                VStack(alignment: .leading, spacing: 16) {
                    HStack {
                        Text("Habit Tracker").font(Theme.inter(14, .heavy)).foregroundColor(Theme.ink)
                        Spacer()
                        Text("3 DAY STREAK ACTIVE")
                            .font(Theme.inter(10, .black)).foregroundColor(Theme.orange).tracking(0.5)
                    }
                    VStack(spacing: 8) {
                        // Circles row (fixed height) with the connector line through their centers
                        ZStack {
                            GeometryReader { geo in
                                let cellW = geo.size.width / 7
                                let cx: (Int) -> CGFloat = { cellW * (CGFloat($0) + 0.5) }
                                // full gray track from first to last circle center
                                Capsule().fill(Theme.slate100)
                                    .frame(width: cx(6) - cx(0), height: 2)
                                    .position(x: (cx(0) + cx(6)) / 2, y: 16)
                                // orange progress from Mon center to Thu (today) center
                                Capsule().fill(Theme.gOrange)
                                    .frame(width: cx(3) - cx(0), height: 2)
                                    .position(x: (cx(0) + cx(3)) / 2, y: 16)
                            }
                            HStack(spacing: 0) {
                                ForEach(Array(weekDays.enumerated()), id: \.offset) { _, wd in
                                    dayCircle(wd).frame(maxWidth: .infinity)
                                }
                            }
                        }
                        .frame(height: 32)
                        // Labels row, aligned under each circle
                        HStack(spacing: 0) {
                            ForEach(Array(weekDays.enumerated()), id: \.offset) { _, wd in
                                Text(wd.label.uppercased())
                                    .font(Theme.inter(9, .bold)).foregroundColor(Theme.inkFaint)
                                    .frame(maxWidth: .infinity)
                            }
                        }
                    }
                }
            }
            .shadow(color: Theme.violet.opacity(habitGlow ? 0.65 : 0.35), radius: habitGlow ? 14 : 6)
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 2).repeatForever(autoreverses: true)) { habitGlow = true }
        }
    }

    private func dayCircle(_ wd: (day: String, active: Bool, today: Bool, label: String)) -> some View {
        ZStack {
            Circle()
                .fill(wd.active ? AnyShapeStyle(Theme.gOrange) : AnyShapeStyle(Theme.card))
                .frame(width: 32, height: 32)
                .overlay(Circle().stroke(wd.active ? Color.clear : (wd.today ? Theme.orange : Theme.slate200),
                                         lineWidth: 2))
            if wd.active {
                Image(systemName: "checkmark").font(.system(size: 13, weight: .black)).foregroundColor(.white)
            } else {
                Text(wd.day).font(Theme.inter(10, .heavy))
                    .foregroundColor(wd.today ? Theme.orange : Theme.inkFaint)
            }
        }
    }

    // MARK: progress section

    private var progressSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("YOUR PROGRESS").font(Theme.outfit(12, .heavy))
                    .foregroundColor(Theme.ink950).tracking(0.5)
                Spacer()
                Image(systemName: "chart.line.uptrend.xyaxis").font(.system(size: 14, weight: .bold))
                    .foregroundColor(Theme.violet)
            }
            CardBox {
                VStack(alignment: .leading, spacing: 12) {
                    HStack {
                        Text("AI Course").font(Theme.inter(14, .heavy)).foregroundColor(Theme.ink)
                        Spacer()
                        Text("\(Int(Double(completed) / Double(total) * 100))%")
                            .font(Theme.inter(12, .black)).foregroundColor(Theme.violet)
                    }
                    ProgressBarView(value: Double(completed) / Double(total))
                    HStack {
                        Text("\(completed) of \(total) completed")
                            .font(Theme.inter(12)).foregroundColor(Theme.inkFaint)
                        Spacer()
                        if completed > 0 {
                            Text("Keep going!").font(Theme.inter(12, .bold)).foregroundColor(Theme.emerald600)
                        }
                    }
                }
            }
        }
    }
}

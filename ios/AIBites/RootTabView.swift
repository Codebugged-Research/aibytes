import SwiftUI

/// App shell: persistent brand header (logo + tagline + notification bell) over
/// a scrollable content area, with a custom bottom nav and a floating Ask-Byte
/// button. Mirrors the web Layout.js.
struct RootTabView: View {
    @EnvironmentObject var store: AppStore
    @State private var tab: Tab = .home
    @State private var showChat = false
    @State private var lessonId: String?
    @State private var showNotifs = false
    @State private var fabPulse = false
    @State private var dragX: CGFloat?          // finger x while dragging the glass pill
    @State private var hoverIdx: Int?           // tab under the pill mid-drag (for haptics)

    enum Tab: Int { case home, leaderboard, path, account }

    var body: some View {
        ZStack(alignment: .bottom) {
            Theme.bg.ignoresSafeArea()

            VStack(spacing: 0) {
                header
                content
            }

            bottomNav

            // Floating Ask-Byte button
            Button { showChat = true } label: {
                ZStack {
                    // pulsing violet ring
                    Circle().stroke(Theme.violet.opacity(0.4), lineWidth: 2)
                        .frame(width: 56, height: 56)
                        .scaleEffect(fabPulse ? 1.35 : 1)
                        .opacity(fabPulse ? 0 : 0.5)
                    // white circle w/ violet border + shadow
                    Circle().fill(Theme.card)
                        .frame(width: 56, height: 56)
                        .overlay(Circle().stroke(Theme.violet.opacity(0.15), lineWidth: 1))
                        .shadow(color: Theme.violet.opacity(0.35), radius: 10, y: 4)
                    Mascot(mood: .happy, size: 46, glow: false)
                    // emerald status dot
                    Circle().fill(Theme.emerald).frame(width: 12, height: 12)
                        .overlay(Circle().stroke(.white, lineWidth: 2))
                        .offset(x: 19, y: 19)
                }
            }
            .frame(width: 56, height: 56)
            .padding(.trailing, 18)
            .padding(.bottom, 92)
            .frame(maxWidth: .infinity, alignment: .trailing)
            .onAppear {
                withAnimation(.easeOut(duration: 1.8).repeatForever(autoreverses: false)) { fabPulse = true }
            }
        }
        .onAppear {
            guard UITest.active else { return }
            switch UITest.str("TAB") {
            case "leaderboard": tab = .leaderboard
            case "path":        tab = .path
            case "account":     tab = .account
            default: break
            }
            if let id = UITest.str("LESSON") { lessonId = id }
        }
        .fullScreenCover(item: Binding(get: { lessonId.map { LessonRef(id: $0) } },
                                       set: { lessonId = $0?.id })) { ref in
            LessonPlayerView(lessonId: ref.id,
                             onClose: { lessonId = nil; tab = .home },
                             onContinueLearning: { lessonId = nil; tab = .path })
                .environmentObject(store)
        }
        .sheet(isPresented: $showChat) { ByteChatView().environmentObject(store) }
        .sheet(isPresented: $showNotifs) {
            NotificationsView(openChat: { showNotifs = false; showChat = true },
                              goPath: { showNotifs = false; tab = .path })
                .presentationDetents([.medium, .large])
        }
    }

    // MARK: header

    private var header: some View {
        HStack {
            HStack(spacing: 12) {
                Image("logo").resizable().scaledToFit().frame(width: 44, height: 44)
                VStack(alignment: .leading, spacing: 1) {
                    Text("AIBites").font(Theme.title(20)).foregroundColor(Theme.ink)
                    Text("Bite. Learn. Repeat.")
                        .font(Theme.outfit(10, .semibold))
                        .foregroundColor(Theme.inkFaint).tracking(0.5)
                }
            }
            Spacer()
            Button {
                store.notifsSeen = true
                showNotifs = true
            } label: {
                ZStack(alignment: .topTrailing) {
                    Image(systemName: "bell").font(.system(size: 19, weight: .medium))
                        .foregroundColor(Theme.ink)
                        .frame(width: 44, height: 44)
                        .background(Theme.card).clipShape(Circle())
                        .overlay(Circle().stroke(Theme.slate100, lineWidth: 1))
                        .shadow(color: .black.opacity(0.04), radius: 2, y: 1)
                    if !store.notifsSeen {
                        Circle().fill(Theme.emerald).frame(width: 10, height: 10)
                            .overlay(Circle().stroke(.white, lineWidth: 2))
                            .offset(x: -8, y: 8)
                    }
                }
            }
        }
        .padding(.horizontal, 24).padding(.top, 8).padding(.bottom, 12)
        .background(Theme.bg)
    }

    @ViewBuilder
    private var content: some View {
        switch tab {
        case .home:        HomeView(startLesson: start, goPath: { tab = .path })
        case .leaderboard: LeaderboardView()
        case .path:        PathView(startLesson: start)
        case .account:     ProfileView()
        }
    }

    // MARK: bottom nav

    private let tabItems: [(tab: Tab, on: String, off: String)] = [
        (.home, "house.fill", "house"),
        (.leaderboard, "trophy.fill", "trophy"),
        (.path, "point.topleft.down.to.point.bottomright.curvepath.fill",
         "point.topleft.down.to.point.bottomright.curvepath"),
        (.account, "person.fill", "person"),
    ]

    /// WhatsApp-style draggable liquid-glass tab bar: the pill tracks the finger,
    /// ticks as it crosses each tab, and snaps to the nearest one on release.
    private var bottomNav: some View {
        GeometryReader { geo in
            let w = geo.size.width
            let count = CGFloat(tabItems.count)
            let cellW = w / count
            let restX = cellW * (CGFloat(tab.rawValue) + 0.5)
            let pillX = dragX.map { min(max($0, 32), w - 32) } ?? restX
            let hovered = dragX != nil
                ? Int(min(max(pillX / cellW, 0), count - 1))
                : tab.rawValue

            ZStack {
                TabSelectionGlass()
                    .frame(width: 64, height: 42)
                    .scaleEffect(dragX == nil ? 1 : 1.12)
                    .position(x: pillX, y: geo.size.height / 2)

                HStack(spacing: 0) {
                    ForEach(Array(tabItems.enumerated()), id: \.offset) { i, item in
                        Image(systemName: hovered == i ? item.on : item.off)
                            .font(.system(size: 26, weight: .regular))
                            .foregroundColor(hovered == i ? Theme.ink : Theme.inkFaint)
                            .frame(maxWidth: .infinity)
                    }
                }
                .allowsHitTesting(false)
            }
            .contentShape(Rectangle())
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { v in
                        withAnimation(.interactiveSpring(response: 0.25, dampingFraction: 0.8)) {
                            dragX = v.location.x
                        }
                        let idx = Int(min(max(v.location.x / cellW, 0), count - 1))
                        if idx != hoverIdx {
                            hoverIdx = idx
                            UIImpactFeedbackGenerator(style: .light).impactOccurred()
                        }
                    }
                    .onEnded { v in
                        let idx = Int(min(max(v.location.x / cellW, 0), count - 1))
                        withAnimation(.spring(response: 0.4, dampingFraction: 0.75)) {
                            tab = Tab(rawValue: idx) ?? .home
                            dragX = nil
                        }
                        hoverIdx = nil
                    }
            )
        }
        .frame(height: 46)
        .padding(.horizontal, 20).padding(.vertical, 8)
        .modifier(LiquidGlassBar())
        .padding(.horizontal, 16).padding(.bottom, 6)
    }

    private func start(_ id: String) { lessonId = id }
}

struct LessonRef: Identifiable { let id: String }

/// The raised liquid-glass capsule that sits on the selected tab.
/// Drawn explicitly (native glassEffect is invisible over the near-white bar):
/// gradient lens body, inner bottom shading for depth, bright specular top rim,
/// a subtle chromatic fringe, and a soft drop shadow.
private struct TabSelectionGlass: View {
    var body: some View {
        ZStack {
            // Lens body — slightly darker than the bar so it reads on white
            Capsule()
                .fill(LinearGradient(colors: [Theme.dyn(0xFFFFFF, 0x2E2E3A), Theme.dyn(0xE3E7EE, 0x1E1E28)],
                                     startPoint: .top, endPoint: .bottom))
            // Inner shading at the bottom (lens depth)
            Capsule()
                .fill(LinearGradient(colors: [.clear, Theme.dyn(0xC3CBD9, 0x0E0E14).opacity(0.6)],
                                     startPoint: .center, endPoint: .bottom))
                .blur(radius: 2.5)
                .padding(3)
            // Specular top highlight
            Capsule()
                .strokeBorder(LinearGradient(colors: [.white, .white.opacity(0.05)],
                                             startPoint: .top, endPoint: .bottom),
                              lineWidth: 1.6)
            // Chromatic fringe around the rim
            Capsule()
                .strokeBorder(AngularGradient(colors: [
                    Color(hex: 0x9DB8FF).opacity(0.55),
                    Color(hex: 0xFFC9A8).opacity(0.45),
                    Color(hex: 0xE7B9FF).opacity(0.40),
                    Color(hex: 0x9DB8FF).opacity(0.55),
                ], center: .center, angle: .degrees(-30)),
                              lineWidth: 1)
                .blur(radius: 0.6)
        }
        .compositingGroup()
        .shadow(color: .black.opacity(0.16), radius: 7, y: 4)
        .shadow(color: .black.opacity(0.06), radius: 1.5, y: 1)
    }
}

/// Apple Liquid Glass for the tab bar. Uses the native iOS 26 `.glassEffect`
/// (blurs + refracts content behind it); falls back to a frosted `.ultraThinMaterial`
/// capsule with a bright rim on iOS 17–25.
private struct LiquidGlassBar: ViewModifier {
    func body(content: Content) -> some View {
        if #available(iOS 26.0, *) {
            // `.clear` glass — fully transparent lens, content shows through
            content
                .glassEffect(.clear.interactive(), in: .rect(cornerRadius: 28, style: .continuous))
                .shadow(color: .black.opacity(0.08), radius: 14, y: 5)
        } else {
            // Light translucent fallback: faint white wash + soft rim, no heavy frost
            content
                .background(
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .fill(Color.white.opacity(0.30))
                        .background(.ultraThinMaterial.opacity(0.55),
                                    in: RoundedRectangle(cornerRadius: 28, style: .continuous))
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 28, style: .continuous)
                        .stroke(
                            LinearGradient(colors: [.white.opacity(0.7), .white.opacity(0.15)],
                                           startPoint: .topLeading, endPoint: .bottomTrailing),
                            lineWidth: 1)
                )
                .shadow(color: .black.opacity(0.10), radius: 14, y: 5)
        }
    }
}

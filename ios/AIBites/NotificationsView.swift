import SwiftUI

/// Ported from web `NotificationBell.js` panel content — a notifications list.
/// Shell provides the header/nav; this is scroll content with its own title +
/// close affordance (dismiss works when presented as a sheet, no-op otherwise).
struct NotificationsView: View {
    var frozenStreak: Int = 0
    let openChat: () -> Void
    let goPath: () -> Void
    var goUnfreeze: () -> Void = {}
    @Environment(\.dismiss) private var dismiss

    private struct Item: Identifiable {
        let id = UUID()
        let icon: String
        let tint: Color
        let bg: Color
        let title: String
        let body: String
        let time: String
        let action: () -> Void
    }

    private var items: [Item] {
        var list: [Item] = []
        // Streak-frozen alert — shown first, only when a streak is recoverable.
        if frozenStreak > 1 {
            list.append(Item(icon: "snowflake", tint: Theme.sky, bg: Theme.tintViolet,
                title: "Don't worry — your streak is frozen!",
                body: "You missed a day, but your \(frozenStreak)-day streak isn't lost. Tap here → then tap the ice crystal to spend 15 XP and restore it.",
                time: "now", action: goUnfreeze))
        }
        list.append(contentsOf: [
            Item(icon: "flame.fill", tint: Theme.orange500, bg: Theme.tintOrange,
                 title: "Keep your streak alive",
                 body: "You're on a streak — do today's bite to keep it!",
                 time: "now", action: goPath),
            Item(icon: "rosette", tint: Theme.emerald, bg: Theme.tintEmerald,
                 title: "Lesson unlocked",
                 body: "A new AI bite is ready for you on your path.",
                 time: "2h", action: goPath),
            Item(icon: "sparkles", tint: Theme.violet500, bg: Theme.tintViolet,
                 title: "A tip from Byte",
                 body: "Tap to ask Byte about any concept.",
                 time: "1d", action: openChat),
        ])
        return list
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                HStack {
                    Text("Notifications")
                        .font(Theme.head(20)).foregroundColor(Theme.ink)
                    Spacer()
                    Button(action: { dismiss() }) {
                        Image(systemName: "xmark")
                            .font(.system(size: 15, weight: .bold))
                            .foregroundColor(Theme.inkFaint)
                            .frame(width: 32, height: 32)
                            .background(Theme.slate100)
                            .clipShape(Circle())
                    }
                    .accessibilityLabel("Close")
                }
                .padding(.horizontal, 4)
                .padding(.top, 8)
                .padding(.bottom, 14)

                CardBox {
                    VStack(spacing: 0) {
                        ForEach(Array(items.enumerated()), id: \.element.id) { idx, item in
                            Button(action: item.action) { row(item) }
                                .buttonStyle(.plain)
                            if idx < items.count - 1 {
                                Rectangle().fill(Theme.slate100).frame(height: 1)
                            }
                        }
                    }
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 4)
            .padding(.bottom, 120)
        }
        .background(Theme.bg.ignoresSafeArea())
    }

    private func row(_ item: Item) -> some View {
        HStack(alignment: .top, spacing: 12) {
            ZStack {
                Circle().fill(item.bg)
                Image(systemName: item.icon)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(item.tint)
            }
            .frame(width: 36, height: 36)

            VStack(alignment: .leading, spacing: 3) {
                HStack(alignment: .firstTextBaseline) {
                    Text(item.title)
                        .font(Theme.title(14)).foregroundColor(Theme.ink)
                        .lineLimit(1)
                    Spacer(minLength: 8)
                    Text(item.time)
                        .font(Theme.inter(10, .semibold))
                        .foregroundColor(Theme.inkFaint)
                }
                Text(item.body)
                    .font(Theme.body(12)).foregroundColor(Theme.inkSoft)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Image(systemName: "chevron.right")
                .font(.system(size: 13, weight: .bold))
                .foregroundColor(Theme.slate200)
                .padding(.top, 2)
        }
        .padding(.vertical, 12)
        .contentShape(Rectangle())
    }
}

/// 1:1 port of web `StreakUnfreeze.js` — full-screen frozen-streak experience.
/// Tap the floating ice crystal: it shakes, shatters into shards, and the fire
/// inside roars to life with "STREAK RESTORED!". Byte reacts along the way.
struct StreakUnfreezeView: View {
    let currentStreak: Int
    var canAfford: Bool = true       // enough XP to pay the 15-XP unfreeze cost
    let onUnfreeze: () -> Void       // fired after the fire celebration (web: 2.4s)
    let onClose: () -> Void

    private enum Phase { case frozen, breaking, unfrozen }
    @State private var phase: Phase = .frozen
    @State private var bob = false
    @State private var shardsFly = false
    @State private var ringPulse = false
    @State private var flameWiggle = false
    @State private var sparklesRise = false
    @State private var pulseText = false

    var body: some View {
        ZStack {
            LinearGradient(colors: [Color(hex: 0x1D5AD6), Color(hex: 0x0F3691)],
                           startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            if phase == .unfrozen { risingSparkles }

            VStack(spacing: 40) {
                crystalArea
                    .frame(width: 256, height: 256)
                statusText
                Mascot(mood: phase == .unfrozen ? .celebrate : phase == .breaking ? .happy : .sleepy,
                       size: 108)
            }
            .padding(.horizontal, 24)

            // The web overlay has no exit; on iOS a discreet close is needed.
            if phase == .frozen {
                VStack {
                    HStack {
                        Spacer()
                        Button(action: onClose) {
                            Image(systemName: "xmark")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(.white.opacity(0.55))
                                .frame(width: 40, height: 40)
                        }
                    }
                    Spacer()
                }
                .padding(.horizontal, 12).padding(.top, 8)
            }
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 3).repeatForever(autoreverses: true)) { bob = true }
            withAnimation(.easeInOut(duration: 0.7).repeatForever(autoreverses: true)) { pulseText = true }
        }
    }

    // MARK: crystal / fire

    private var crystalArea: some View {
        ZStack {
            // Ice shards explosion
            if phase == .breaking {
                ForEach(0..<16, id: \.self) { i in
                    let angle = Double(i) / 16 * 2 * .pi + (Double((i * 13) % 10) - 5) * 0.04
                    let dist = 80.0 + Double((i * 29) % 120)
                    IceShard()
                        .fill(Color(hex: 0xBAE6FD).opacity(0.9))
                        .frame(width: 26, height: 26)
                        .scaleEffect(shardsFly ? 0.1 : 0.4 + Double((i * 17) % 8) / 10)
                        .rotationEffect(.degrees(shardsFly ? Double((i * 47) % 360) : 0))
                        .offset(x: shardsFly ? cos(angle) * dist : 0,
                                y: shardsFly ? sin(angle) * dist : 0)
                        .opacity(shardsFly ? 0 : 1)
                }
            }

            Group {
                if phase == .unfrozen {
                    fire
                } else {
                    ice
                }
            }
            .offset(y: phase == .frozen ? (bob ? -6 : 0) : 0)
            .onTapGesture { tapUnfreeze() }
        }
    }

    private var ice: some View {
        ZStack {
            Circle().fill(Color(hex: 0x38BDF8).opacity(0.30))
                .frame(width: 190, height: 190).blur(radius: 34)
            IceCrystal()
                .frame(width: 150, height: 170)
                .shadow(color: Color(hex: 0x0EA5E9).opacity(0.4), radius: 14, y: 4)
        }
    }

    private var fire: some View {
        ZStack {
            Circle().fill(Theme.orange500.opacity(0.40))
                .frame(width: 210, height: 210).blur(radius: 36)
            Circle()
                .stroke(Color(hex: 0xFB923C).opacity(0.6), lineWidth: 4)
                .frame(width: 186, height: 186)
                .scaleEffect(ringPulse ? 1.25 : 1)
                .opacity(ringPulse ? 0 : 0.6)
            Circle()
                .fill(LinearGradient(colors: [Theme.amber500, Theme.red600],
                                     startPoint: .topLeading, endPoint: .bottomTrailing))
                .frame(width: 154, height: 154)
                .shadow(color: Theme.red.opacity(0.6), radius: 24, y: 10)
            Image(systemName: "flame.fill")
                .font(.system(size: 78))
                .foregroundColor(.white)
                .rotationEffect(.degrees(flameWiggle ? 4 : -4))
                .scaleEffect(flameWiggle ? 1.08 : 1)
        }
    }

    // MARK: text

    @ViewBuilder
    private var statusText: some View {
        switch phase {
        case .frozen:
            VStack(spacing: 6) {
                Text("Your \(currentStreak)-day streak is frozen!")
                    .font(Theme.head(22)).foregroundColor(.white)
                Text(canAfford
                     ? "Tap the ice to restore it for 15 XP."
                     : "You need 15 XP to restore it — earn more in a lesson first.")
                    .font(Theme.inter(12, .semibold))
                    .foregroundColor(Color(hex: 0xBAE6FD).opacity(0.85))
            }
            .multilineTextAlignment(.center)
        case .breaking:
            Text("Unleashing heat...")
                .font(Theme.head(24)).foregroundColor(Color(hex: 0xBAE6FD))
                .opacity(pulseText ? 0.5 : 1)
        case .unfrozen:
            VStack(spacing: 8) {
                HStack(spacing: 6) {
                    Image(systemName: "sparkles").font(.system(size: 16))
                    Text("STREAK RESTORED!")
                        .font(Theme.inter(11, .black)).tracking(1.2)
                }
                .foregroundColor(Color(hex: 0xFCD34D))
                Text("\(currentStreak + 1) Days Active!")
                    .font(Theme.head(36))
                    .foregroundStyle(LinearGradient(
                        colors: [Color(hex: 0xFDE68A), Color(hex: 0xFDBA74), Color(hex: 0xF87171)],
                        startPoint: .leading, endPoint: .trailing))
                Text("Awesome! Keep up the daily momentum to learn AI.")
                    .font(Theme.inter(12, .medium))
                    .foregroundColor(Color(hex: 0xFED7AA))
            }
            .multilineTextAlignment(.center)
        }
    }

    private var risingSparkles: some View {
        GeometryReader { geo in
            ForEach(0..<10, id: \.self) { i in
                let size = 4.0 + Double((i * 31) % 8)
                let x = geo.size.width * (Double((i * 37) % 100) / 100)
                Circle()
                    .fill(Color(hex: 0xFB923C).opacity(0.6))
                    .frame(width: size, height: size)
                    .position(x: x, y: geo.size.height * 0.9)
                    .offset(y: sparklesRise ? -geo.size.height * 0.75 : 0)
                    .opacity(sparklesRise ? 0 : 0.9)
                    .animation(.easeOut(duration: 2 + Double(i % 3) * 0.5)
                        .repeatForever(autoreverses: false)
                        .delay(Double(i) * 0.15), value: sparklesRise)
            }
        }
        .ignoresSafeArea()
        .allowsHitTesting(false)
    }

    private func tapUnfreeze() {
        guard phase == .frozen, canAfford else { return }
        phase = .breaking
        withAnimation(.easeOut(duration: 0.8)) { shardsFly = true }
        UIImpactFeedbackGenerator(style: .heavy).impactOccurred()
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.6)) { phase = .unfrozen }
            withAnimation(.easeOut(duration: 1.8).repeatForever(autoreverses: false)) { ringPulse = true }
            withAnimation(.easeInOut(duration: 0.6).repeatForever(autoreverses: true)) { flameWiggle = true }
            sparklesRise = true
            UINotificationFeedbackGenerator().notificationOccurred(.success)
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.4) { onUnfreeze() }
    }
}

/// The web's ice-crystal SVG (150×170 viewBox) ported to SwiftUI paths:
/// frosted shield outline, facet lines, frozen blue flame, highlight spark.
private struct IceCrystal: View {
    var body: some View {
        Canvas { ctx, size in
            let sx = size.width / 150, sy = size.height / 170
            func p(_ x: CGFloat, _ y: CGFloat) -> CGPoint { CGPoint(x: x * sx, y: y * sy) }

            // Outer shield
            var outer = Path()
            outer.move(to: p(75, 10))
            outer.addCurve(to: p(125, 80), control1: p(75, 10), control2: p(115, 50))
            outer.addCurve(to: p(118, 135), control1: p(132, 101), control2: p(128, 122))
            outer.addCurve(to: p(75, 155), control1: p(108, 148), control2: p(93, 155))
            outer.addCurve(to: p(32, 135), control1: p(57, 155), control2: p(42, 148))
            outer.addCurve(to: p(25, 80), control1: p(22, 122), control2: p(18, 101))
            outer.addCurve(to: p(75, 10), control1: p(35, 50), control2: p(75, 10))
            outer.closeSubpath()
            ctx.fill(outer, with: .color(Color(hex: 0xE0F2FE).opacity(0.45)))
            ctx.stroke(outer, with: .color(Color(hex: 0xBAE6FD)),
                       style: StrokeStyle(lineWidth: 4 * sx, lineJoin: .round))

            // Facet lines
            let facets: [(CGPoint, CGPoint)] = [
                (p(75, 10), p(75, 55)), (p(25, 80), p(50, 90)), (p(125, 80), p(100, 90)),
                (p(32, 135), p(58, 125)), (p(118, 135), p(92, 125)),
            ]
            for (a, b) in facets {
                var line = Path(); line.move(to: a); line.addLine(to: b)
                ctx.stroke(line, with: .color(.white.opacity(0.6)), lineWidth: 2 * sx)
            }

            // Frozen flame inside
            var flame = Path()
            flame.move(to: p(75, 35))
            flame.addCurve(to: p(100, 90), control1: p(75, 35), control2: p(100, 68))
            flame.addCurve(to: p(75, 115), control1: p(100, 103.8), control2: p(88.8, 115))
            flame.addCurve(to: p(50, 90), control1: p(61.2, 115), control2: p(50, 103.8))
            flame.addCurve(to: p(75, 35), control1: p(50, 68), control2: p(75, 35))
            flame.closeSubpath()
            ctx.fill(flame, with: .color(Color(hex: 0x0EA5E9).opacity(0.85)))

            // Highlight spark (8×8 rotated 45°)
            var spark = Path(CGRect(x: -4 * sx, y: -4 * sy, width: 8 * sx, height: 8 * sy))
            spark = spark.applying(CGAffineTransform(rotationAngle: .pi / 4))
            spark = spark.applying(CGAffineTransform(translationX: 84 * sx, y: 59 * sy))
            ctx.fill(spark, with: .color(.white))
        }
    }
}

/// Pentagon ice shard (web clip-path: 50% 0, 100% 38%, 82% 100%, 18% 100%, 0 38%).
private struct IceShard: Shape {
    func path(in r: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: r.midX, y: r.minY))
        p.addLine(to: CGPoint(x: r.maxX, y: r.minY + r.height * 0.38))
        p.addLine(to: CGPoint(x: r.minX + r.width * 0.82, y: r.maxY))
        p.addLine(to: CGPoint(x: r.minX + r.width * 0.18, y: r.maxY))
        p.addLine(to: CGPoint(x: r.minX, y: r.minY + r.height * 0.38))
        p.closeSubpath()
        return p
    }
}

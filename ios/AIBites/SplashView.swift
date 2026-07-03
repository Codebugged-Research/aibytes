import SwiftUI

/// Launch splash — 1:1 port of the web SplashScreen.js:
/// dark neural gradient, white logo card with spinning dashed rings + breathing
/// blue glow, Byte peeking from the corner, "AI"(blue)+"Bites"(white) wordmark,
/// typing tagline, loading bar with % → "Ready!", cycling AI tips, 5 pulsing dots.
struct SplashView: View {
    let onDone: () -> Void

    private static let tagline = "Master AI in 10 minutes"
    private static let tips = [
        "Neural networks learn from examples...",
        "GPT = Generative Pre-trained Transformer",
        "LLMs predict the next word, one at a time",
        "AI sees images as grids of numbers",
    ]

    @State private var appear = false
    @State private var pulse = false
    @State private var spin = false
    @State private var progress: Double = 0
    @State private var typedCount = 0
    @State private var showCursor = true
    @State private var tipIdx = 0

    private var done: Bool { progress >= 100 }

    var body: some View {
        ZStack {
            // 160deg #07060f → #0b0922 → #11093a
            LinearGradient(colors: [Color(hex: 0x07060F), Color(hex: 0x0B0922), Color(hex: 0x11093A)],
                           startPoint: .top, endPoint: .bottom)
                .ignoresSafeArea()

            // Ambient colour blobs (stand-in for the particle canvas)
            RadialGradient(colors: [Color(hex: 0x2D5AC8).opacity(0.18), .clear],
                           center: UnitPoint(x: 0.05, y: 0.15), startRadius: 4, endRadius: 300)
                .scaleEffect(pulse ? 1.12 : 0.92)
                .ignoresSafeArea()
            RadialGradient(colors: [Color(hex: 0x3C64DC).opacity(0.14), .clear],
                           center: UnitPoint(x: 0.95, y: 0.9), startRadius: 4, endRadius: 260)
                .scaleEffect(pulse ? 0.92 : 1.12)
                .ignoresSafeArea()
            RadialGradient(colors: [Color(hex: 0x643CC8).opacity(0.10), .clear],
                           center: UnitPoint(x: 0.62, y: 0.58), startRadius: 4, endRadius: 200)
                .scaleEffect(pulse ? 1.3 : 1.0)
                .ignoresSafeArea()

            VStack(spacing: 28) {
                logoHero
                wordmark
                loadingSection
                dots
            }
            .padding(.horizontal, 32)
            .frame(maxWidth: 400)
        }
        .onAppear { start() }
    }

    // MARK: logo hero

    private var logoHero: some View {
        ZStack {
            // Slow-spinning dashed rings
            RoundedRectangle(cornerRadius: 40, style: .continuous)
                .stroke(Color(hex: 0x648CFF).opacity(0.22),
                        style: StrokeStyle(lineWidth: 2, dash: [7, 7]))
                .frame(width: 152, height: 152)
                .rotationEffect(.degrees(spin ? 360 : 0))
                .animation(.linear(duration: 14).repeatForever(autoreverses: false), value: spin)
            RoundedRectangle(cornerRadius: 48, style: .continuous)
                .stroke(Color(hex: 0x648CFF).opacity(0.12),
                        style: StrokeStyle(lineWidth: 1, dash: [6, 8]))
                .frame(width: 176, height: 176)
                .rotationEffect(.degrees(spin ? -360 : 0))
                .animation(.linear(duration: 20).repeatForever(autoreverses: false), value: spin)

            // Breathing blue glow behind the card
            RoundedRectangle(cornerRadius: 32, style: .continuous)
                .fill(LinearGradient(colors: [Color(hex: 0x1A3A9F), Color(hex: 0x2D55CC)],
                                     startPoint: .topLeading, endPoint: .bottomTrailing))
                .frame(width: 128, height: 128)
                .blur(radius: 24)
                .opacity(pulse ? 0.8 : 0.45)
                .scaleEffect(pulse ? 1.18 : 1.0)

            // White logo card
            Image("logo")
                .resizable().interpolation(.high).scaledToFit()
                .frame(width: 88, height: 88)
                .padding(14)
                .background(Color.white)
                .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
                .shadow(color: .black.opacity(0.4), radius: 24, y: 12)

            // Byte peeks in from the corner
            Mascot(mood: .wave, size: 64)
                .offset(x: 58 + 34 - 32, y: 58 + 28 - 32)
                .opacity(appear ? 1 : 0)
                .scaleEffect(appear ? 1 : 0)
        }
        .frame(width: 176, height: 176)
        .scaleEffect(appear ? 1 : 0.82)
        .opacity(appear ? 1 : 0)
    }

    // MARK: wordmark + tagline

    private var wordmark: some View {
        VStack(spacing: 12) {
            HStack(spacing: 0) {
                Text("AI").foregroundColor(Color(hex: 0x93C5FD))
                Text("Bites").foregroundColor(.white)
            }
            .font(Theme.outfit(48, .black))
            .tracking(-1)
            .opacity(appear ? 1 : 0)
            .offset(y: appear ? 0 : 24)

            // Typing tagline with blinking cursor
            HStack(spacing: 1) {
                Text(String(Self.tagline.prefix(typedCount)).uppercased())
                    .font(Theme.inter(12, .bold))
                    .tracking(2.2)
                    .foregroundColor(Color(hex: 0x93C5FD).opacity(0.7))
                if showCursor {
                    Text("|")
                        .font(Theme.inter(12, .bold))
                        .foregroundColor(Color(hex: 0x93C5FD).opacity(pulse ? 0.2 : 0.7))
                }
            }
            .frame(height: 20)
        }
    }

    // MARK: loading

    private var loadingSection: some View {
        VStack(spacing: 12) {
            ZStack(alignment: .leading) {
                Capsule().fill(Color.white.opacity(0.07))
                Capsule()
                    .fill(LinearGradient(colors: [Color(hex: 0x1D4ED8), Color(hex: 0x60A5FA)],
                                         startPoint: .leading, endPoint: .trailing))
                    .frame(width: 176 * progress / 100)
            }
            .frame(width: 176, height: 4)

            if done {
                HStack(spacing: 8) {
                    ZStack {
                        Circle().fill(Color(hex: 0x34D399)).frame(width: 16, height: 16)
                        Image(systemName: "checkmark")
                            .font(.system(size: 8, weight: .black)).foregroundColor(.white)
                    }
                    Text("READY!")
                        .font(Theme.inter(12, .black)).tracking(2)
                        .foregroundColor(Color(hex: 0x34D399))
                }
            } else {
                Text("\(Int(progress))%")
                    .font(Theme.inter(10, .bold)).tracking(2)
                    .foregroundColor(Color(hex: 0x60A5FA).opacity(0.5))
            }

            Text(Self.tips[tipIdx])
                .font(Theme.inter(10, .medium))
                .foregroundColor(Color(hex: 0x93C5FD).opacity(0.45))
        }
        .opacity(appear ? 1 : 0)
    }

    private var dots: some View {
        HStack(spacing: 8) {
            ForEach(0..<5, id: \.self) { i in
                Circle()
                    .fill(Color(hex: 0x60A5FA).opacity(0.35))
                    .frame(width: 6, height: 6)
                    .scaleEffect(pulse ? 1.7 : 1.0)
                    .animation(.easeInOut(duration: 0.65).repeatForever(autoreverses: true)
                        .delay(Double(i) * 0.18), value: pulse)
            }
        }
        .opacity(appear ? 1 : 0)
    }

    // MARK: timeline (mirrors the web: bar fills over 1.6s, done at 2.5s)

    private func start() {
        spin = true
        withAnimation(.spring(response: 0.7, dampingFraction: 0.72)) { appear = true }
        withAnimation(.easeInOut(duration: 0.55).repeatForever(autoreverses: true)) { pulse = true }

        // progress: +step every 28ms → full in ~1.6s
        let step = 100.0 / (1600.0 / 28.0)
        Timer.scheduledTimer(withTimeInterval: 0.028, repeats: true) { t in
            DispatchQueue.main.async {
                progress = min(progress + step, 100)
                if progress >= 100 { t.invalidate() }
            }
        }

        // typing starts at 1.1s, 40ms/char; cursor hides 0.7s after finish
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.1) {
            Timer.scheduledTimer(withTimeInterval: 0.04, repeats: true) { t in
                DispatchQueue.main.async {
                    typedCount += 1
                    if typedCount >= Self.tagline.count {
                        t.invalidate()
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.7) { showCursor = false }
                    }
                }
            }
        }

        // cycle tips every 1.1s
        Timer.scheduledTimer(withTimeInterval: 1.1, repeats: true) { _ in
            DispatchQueue.main.async { tipIdx = (tipIdx + 1) % Self.tips.count }
        }

        DispatchQueue.main.asyncAfter(deadline: .now() + 2.5, execute: onDone)
    }
}

import SwiftUI

/// Byte — the AIBites mascot. Branded PNG artwork mapped to moods, with a gentle
/// float and a real eye-blink (closed-eye frame cross-faded over the open one).
/// Ported 1:1 from the web Mascot.js (moods, float profiles, durations).
enum Mood: String {
    case idle, wave, happy, celebrate, thinking, sad, sleepy, talking

    var base: String {
        switch self {
        case .idle, .wave:       return "wave"
        case .happy, .celebrate: return "celebrate"
        case .thinking:          return "thinking"
        case .sad, .sleepy:      return "sad"
        case .talking:           return "talking"
        }
    }
    /// nil => no blink frame (e.g. sleepy already closed)
    var blink: String? {
        switch self {
        case .sleepy: return nil
        default:      return base + "-blink"
        }
    }
    var floatY: CGFloat {
        switch self {
        case .celebrate: return 10
        case .happy:     return 7
        case .wave, .idle: return 5
        case .talking:   return 4
        case .thinking:  return 3
        case .sad, .sleepy: return 2
        }
    }
    var floatDur: Double {
        switch self {
        case .idle: return 3;  case .wave: return 2.6; case .happy: return 1.9
        case .celebrate: return 1.1; case .thinking: return 3.2
        case .sad: return 2.8; case .sleepy: return 3.8; case .talking: return 2.4
        }
    }
}

struct Mascot: View {
    var mood: Mood = .idle
    var size: CGFloat = 96
    var glow: Bool = true

    @State private var blinking = false
    @State private var floatUp = false
    private let blinkTimer = Timer.publish(every: 3.6, on: .main, in: .common).autoconnect()

    var body: some View {
        ZStack {
            if glow {
                // Web: radial-gradient(circle at 50% 46%, rgba(124,92,255,0.38) → 0 at 68%),
                // inset 4%, blur 8, pulsing 0.45–0.8 opacity (static mid-value here).
                Circle()
                    .fill(RadialGradient(
                        colors: [Color(hex: 0x7C5CFF).opacity(0.38), Color(hex: 0x7C5CFF).opacity(0)],
                        center: UnitPoint(x: 0.5, y: 0.46),
                        startRadius: 0, endRadius: size * 0.44))
                    .frame(width: size * 0.92, height: size * 0.92)
                    .blur(radius: 8)
                    .opacity(0.62)
            }
            Image(blinking && mood.blink != nil ? mood.blink! : mood.base)
                .resizable().interpolation(.high).scaledToFit()
                .frame(width: size, height: size)
        }
        .frame(width: size, height: size)
        .offset(y: floatUp ? -mood.floatY : mood.floatY * 0.4)
        .animation(.easeInOut(duration: mood.floatDur).repeatForever(autoreverses: true), value: floatUp)
        .onAppear { floatUp = true }
        .onReceive(blinkTimer) { _ in
            guard mood.blink != nil else { return }
            withAnimation(.linear(duration: 0.08)) { blinking = true }
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.16) {
                withAnimation(.linear(duration: 0.08)) { blinking = false }
            }
        }
    }
}

/// MascotCoach — Byte + a speech bubble with a tail, used for guidance.
struct MascotCoach: View {
    var mood: Mood = .wave
    var size: CGFloat = 58
    let message: String
    var body: some View {
        HStack(alignment: .center, spacing: 10) {
            Mascot(mood: mood, size: size, glow: false)
            HStack {
                Text(message)
                    .font(Theme.body(13)).foregroundColor(Theme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 0)
            }
            .padding(.horizontal, 16).padding(.vertical, 10)
            .background(Theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(Theme.tintVioletB, lineWidth: 1))
            .shadow(color: Theme.tintVioletB.opacity(0.6), radius: 4, y: 2)
        }
    }
}

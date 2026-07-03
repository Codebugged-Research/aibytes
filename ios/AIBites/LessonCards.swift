import SwiftUI

// HTMLText lives in Narrator.swift — reused here for rich body + narration text.

/// A single teach card: kind badge + opt-in narration pill, icon, title,
/// rich body (renders <strong>/<em>/<br>), and an optional compare panel.
struct TeachCardView: View {
    let card: Card
    @ObservedObject var narrator: Narrator
    @Binding var voiceEnabled: Bool
    @State private var ringPulse = false

    private static let kindLabel: [String: String] = [
        "hook": "Did you know?", "definition": "Definition", "analogy": "Analogy",
        "example": "Example", "mythbust": "Myth Buster", "visual": "Compare",
        "compare": "Compare",
    ]

    private var kindText: String {
        let k = card.kind ?? ""
        return Self.kindLabel[k] ?? k
    }

    /// Tag-free narration: title then body.
    private var narrationText: String {
        [HTMLText.plain(card.title ?? ""), HTMLText.plain(card.body ?? "")]
            .filter { !$0.isEmpty }
            .joined(separator: ". ")
    }


    var body: some View {
        CardBox {
            VStack(alignment: .leading, spacing: 26) {
                // Top row: kind badge (left) + voice toggle (right)
                HStack {
                    Text(kindText.uppercased())
                        .font(Theme.inter(10, .heavy)).tracking(1.0)
                        .foregroundColor(Theme.violet600)
                        .padding(.horizontal, 10).padding(.vertical, 2)
                        .background(Theme.tintViolet)
                        .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
                        .overlay(RoundedRectangle(cornerRadius: 8, style: .continuous)
                            .stroke(Theme.tintVioletB, lineWidth: 1))
                    Spacer()
                    Button {
                        if voiceEnabled { voiceEnabled = false; narrator.stop() }
                        else { voiceEnabled = true; narrator.speak(narrationText) }
                    } label: {
                        Image(systemName: voiceEnabled ? "speaker.wave.2.fill" : "speaker.slash.fill")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(voiceEnabled ? Theme.inkSoft : .white)
                            .frame(width: 32, height: 32)
                            .background(voiceEnabled ? Theme.slate50 : Theme.violet)
                            .clipShape(Circle())
                            .overlay(Circle().stroke(voiceEnabled ? Theme.slate200 : Theme.violet, lineWidth: 1))
                    }
                }

                // Byte the mascot — tap to play; thinking idle, talking while reading
                VStack(spacing: 4) {
                    ZStack {
                        if narrator.speaking {
                            Circle().stroke(Theme.violet.opacity(0.35), lineWidth: 2)
                                .frame(width: 164, height: 164)
                                .scaleEffect(ringPulse ? 1.3 : 1).opacity(ringPulse ? 0 : 0.5)
                        }
                        Mascot(mood: narrator.speaking ? .talking : .thinking, size: 156)
                            .onTapGesture { voiceEnabled = true; narrator.speak(narrationText) }
                    }
                    Text(narrator.speaking ? "BYTE IS READING…" : (voiceEnabled ? "TAP BYTE TO REPLAY" : "TAP TO HEAR BYTE"))
                        .font(Theme.inter(10, .bold)).tracking(0.8)
                        .foregroundColor(Theme.inkFaint)
                }
                .frame(maxWidth: .infinity)
                .padding(.top, 6)
                .onAppear {
                    withAnimation(.easeOut(duration: 1.1).repeatForever(autoreverses: false)) { ringPulse = true }
                }

                // Title (centered, leading-tight)
                if let title = card.title, !title.isEmpty {
                    Text(HTMLText.plain(title))
                        .font(Theme.outfit(24, .heavy)).foregroundColor(Theme.ink)
                        .lineSpacing(3)
                        .multilineTextAlignment(.center).frame(maxWidth: .infinity)
                }

                // Rich body (<strong>/<em>/<br>)
                if let body = card.body, !body.isEmpty {
                    Text(HTMLText.attributed(body, size: 16))
                        .font(Theme.inter(16, .medium)).foregroundColor(Theme.inkSoft)
                        .lineSpacing(8)
                        .fixedSize(horizontal: false, vertical: true)
                        .frame(maxWidth: .infinity, alignment: .leading)
                }

                // Compare panel
                if let compare = card.compare {
                    HStack(spacing: 16) {
                        comparePane(compare.left)
                        comparePane(compare.right)
                    }
                    .padding(.top, 2)
                }

                Spacer(minLength: 0)
            }
        }
    }

    private func comparePane(_ side: CompareSide) -> some View {
        VStack(spacing: 12) {
            Text(side.tag.uppercased())
                .font(Theme.inter(10, .heavy))
                .tracking(1.0)
                .foregroundColor(Theme.inkFaint)
            Image(systemName: Icons.symbol(side.emoji))
                .font(.system(size: 26, weight: .semibold))
                .foregroundColor(Theme.slate700)
            Text(HTMLText.plain(side.text))
                .font(Theme.inter(12, .bold))
                .foregroundColor(Theme.slate700)
                .multilineTextAlignment(.center)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(16)
        .frame(maxWidth: .infinity)
        .background(Theme.slate50)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous)
            .stroke(Theme.slate200, lineWidth: 1))
    }
}

/// Renders any of the four exercise types. `selected` is the chosen option/word
/// id; after `revealed`, the correct option colours green, a wrong pick red.
struct ExerciseView: View {
    let exercise: Exercise
    @Binding var selected: String?
    let revealed: Bool
    let isCorrect: Bool

    private var badge: String {
        switch exercise.type {
        case "true_false": return "True or False"
        case "fill_blank": return "Fill in the Blank"
        case "boss":       return "Final Challenge"
        default:           return "Question"
        }
    }

    var body: some View {
        VStack(spacing: 20) {
            // Prompt panel (violet→indigo gradient)
            VStack(alignment: .leading, spacing: 12) {
                Text(badge.uppercased())
                    .font(Theme.inter(10, .heavy))
                    .tracking(1.0)
                    .foregroundColor(Theme.violet700)
                    .padding(.horizontal, 10).padding(.vertical, 2)
                    .background(Theme.tintVioletB.opacity(0.6))
                    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))

                Text(exercise.prompt)
                    .font(Theme.inter(18, .heavy))
                    .foregroundColor(Theme.ink)
                    .lineSpacing(3)
                    .fixedSize(horizontal: false, vertical: true)
                    .frame(maxWidth: .infinity, alignment: .leading)

                if let sentence = exercise.sentence, !sentence.isEmpty {
                    Text(sentence)
                        .font(Theme.inter(14, .medium))
                        .italic()
                        .foregroundColor(Theme.inkSoft)
                        .padding(.leading, 14)
                        .overlay(Rectangle().fill(Theme.violet)
                            .frame(width: 2), alignment: .leading)
                }
            }
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                LinearGradient(colors: [Theme.tintViolet, Theme.indigo50],
                               startPoint: .topLeading, endPoint: .bottomTrailing)
            )
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(Theme.tintVioletB, lineWidth: 1))

            // Options / word chips
            if exercise.type == "fill_blank" {
                fillBlank
            } else {
                optionsList
            }
        }
    }

    private var optionsList: some View {
        VStack(spacing: 10) {
            ForEach(exercise.options ?? []) { opt in
                optionButton(id: opt.id, text: opt.text, correct: opt.correct)
            }
        }
    }

    private var fillBlank: some View {
        VStack(spacing: 10) {
            ForEach(exercise.words ?? [], id: \.self) { word in
                optionButton(id: word, text: word, correct: word == exercise.blank)
            }
        }
    }

    /// One option row. Web only recolours the SELECTED option after checking
    /// (green if it was right, red if wrong) — unselected rows keep the default look.
    @ViewBuilder
    private func optionButton(id: String, text: String, correct: Bool) -> some View {
        let isSelected = selected == id
        let showCorrect = revealed && isSelected && correct
        let showWrong = revealed && isSelected && !correct

        let border: Color = showCorrect ? Theme.emerald
            : showWrong ? Theme.red
            : isSelected ? Theme.violet
            : Theme.slate200
        let bg: Color = showCorrect ? Theme.tintEmerald
            : showWrong ? Theme.rose50                       // rose-50
            : isSelected ? Theme.tintViolet
            : Theme.card
        let fg: Color = showCorrect ? Theme.emerald900           // emerald-900
            : showWrong ? Theme.red950                       // red-950
            : isSelected ? Theme.violet900                      // violet-900
            : Theme.slate700                                   // slate-700
        let dotBorder: Color = showCorrect ? Theme.emerald
            : showWrong ? Theme.red
            : isSelected ? Theme.violet
            : Theme.slate300                                   // slate-300

        Button {
            if !revealed { selected = id }
        } label: {
            HStack(spacing: 12) {
                ZStack {
                    Circle().stroke(dotBorder, lineWidth: 2)
                        .background(Circle().fill(
                            showCorrect ? Theme.emerald
                            : showWrong ? Theme.red
                            : isSelected ? Theme.violet
                            : Theme.card))
                        .frame(width: 20, height: 20)
                    if showCorrect || (isSelected && !revealed) {
                        Image(systemName: "checkmark")
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(.white)
                    } else if showWrong {
                        Image(systemName: "xmark")
                            .font(.system(size: 11, weight: .black))
                            .foregroundColor(.white)
                    }
                }
                Text(text)
                    .font(Theme.inter(14, .heavy))
                    .foregroundColor(fg)
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 0)
            }
            .padding(16)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(bg)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(border, lineWidth: 2))
            .shadow(color: .black.opacity(0.03), radius: 3, y: 1)
        }
        .disabled(revealed)
    }
}

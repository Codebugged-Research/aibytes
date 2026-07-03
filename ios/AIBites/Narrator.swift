import Foundation
import AVFoundation
import SwiftUI

/// Native text-to-speech for teach cards. Uses AVSpeechSynthesizer (the reliable
/// native path — the web MVP fought with WKWebView's flaky speechSynthesis).
/// Opt-in: nothing speaks until the user taps to enable, matching the MVP.
@MainActor
final class Narrator: NSObject, ObservableObject, AVSpeechSynthesizerDelegate {
    @Published var speaking = false
    private let synth = AVSpeechSynthesizer()

    override init() {
        super.init()
        synth.delegate = self
        try? AVAudioSession.sharedInstance().setCategory(.playback, options: [.mixWithOthers])
    }

    /// Prefer a female English voice for Byte (falls back to system default).
    private var voice: AVSpeechSynthesisVoice? {
        let english = AVSpeechSynthesisVoice.speechVoices().filter { $0.language.hasPrefix("en") }
        let femaleNames = ["Samantha", "Karen", "Moira", "Tessa", "Fiona", "Serena", "Nicky", "Ava"]
        if let f = english.first(where: { v in femaleNames.contains { v.name.contains($0) } }) { return f }
        if let f = english.first(where: { $0.gender == .female }) { return f }
        return english.first ?? AVSpeechSynthesisVoice(language: "en-US")
    }

    func speak(_ text: String) {
        stop()
        let u = AVSpeechUtterance(string: text)
        u.voice = voice
        u.rate = AVSpeechUtteranceDefaultSpeechRate
        u.pitchMultiplier = 1.05
        synth.speak(u)
        speaking = true
    }

    func stop() {
        if synth.isSpeaking { synth.stopSpeaking(at: .immediate) }
        speaking = false
    }

    nonisolated func speechSynthesizer(_ s: AVSpeechSynthesizer, didFinish u: AVSpeechUtterance) {
        Task { @MainActor in self.speaking = false }
    }
    nonisolated func speechSynthesizer(_ s: AVSpeechSynthesizer, didCancel u: AVSpeechUtterance) {
        Task { @MainActor in self.speaking = false }
    }
}

/// Renders the lesson HTML (`<strong>`, `<em>`, `<br>`) into an AttributedString,
/// and strips tags for a clean TTS string.
enum HTMLText {
    /// Web teach-card body: Inter 14 medium slate-500, with <strong> runs bold
    /// slate-700 and <em> italic (KWord token styling).
    static func attributed(_ html: String, size: CGFloat = 14) -> AttributedString {
        let cleaned = html.replacingOccurrences(of: "<br><br>", with: "\n\n")
                          .replacingOccurrences(of: "<br>", with: "\n")
        guard let data = cleaned.data(using: .utf8),
              let ns = try? NSAttributedString(
                data: data,
                options: [.documentType: NSAttributedString.DocumentType.html,
                          .characterEncoding: String.Encoding.utf8.rawValue],
                documentAttributes: nil)
        else { return AttributedString(plain(html)) }

        var out = AttributedString("")
        ns.enumerateAttributes(in: NSRange(location: 0, length: ns.length)) { attrs, range, _ in
            let text = ns.attributedSubstring(from: range).string
            var seg = AttributedString(text)
            let traits = (attrs[.font] as? UIFont)?.fontDescriptor.symbolicTraits ?? []
            let bold = traits.contains(.traitBold)
            var font: Font = .custom("Inter", size: size).weight(bold ? .bold : .medium)
            if traits.contains(.traitItalic) { font = font.italic() }
            seg.font = font
            seg.foregroundColor = bold ? Theme.slate700 : Theme.inkSoft
            out += seg
        }
        while out.characters.last == "\n" { out.characters.removeLast() }
        return out
    }

    /// Tag-free plain text for narration.
    static func plain(_ html: String) -> String {
        html.replacingOccurrences(of: "<[^>]+>", with: "", options: .regularExpression)
            .replacingOccurrences(of: "&amp;", with: "&")
            .replacingOccurrences(of: "&quot;", with: "\"")
            .trimmingCharacters(in: .whitespacesAndNewlines)
    }
}

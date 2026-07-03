import SwiftUI

/// Maps lesson/unit emoji to clean SF Symbols — mirrors the web app's icons.js.
/// Falls back to "sparkles" (never a question mark) for anything unmapped.
enum Icons {
    static let map: [String: String] = [
        "🥉": "rosette",
        "🧠": "brain",
        "🍰": "square.3.layers.3d",
        "🎯": "target",
        "📱": "iphone",
        "🐶": "pawprint.fill",
        "📷": "camera.fill",
        "🤖": "cpu",
        "⚖️": "scalemass",
        "📊": "chart.bar.fill",
        "🧩": "puzzlepiece.fill",
        "🌍": "globe",
        "🎬": "film.fill",
        "👤": "person.fill",
        "❌": "xmark.circle.fill",
        "✅": "checkmark.circle.fill",
        "🎉": "sparkles",
        "🕰️": "clock.fill",
        "🤔": "brain.head.profile",
        "📦": "shippingbox",
        "🗂️": "folder.fill",
        "🗄️": "cylinder.split.1x2.fill",
        "📡": "dot.radiowaves.left.and.right",
        "🗃️": "archivebox.fill",
        "🔎": "magnifyingglass",
        "🧹": "sparkles",
        "🕵️": "eye.fill",
        "📈": "chart.line.uptrend.xyaxis",
        "💡": "lightbulb.fill",
    ]

    static func symbol(_ emoji: String) -> String {
        map[emoji.trimmingCharacters(in: .whitespaces)] ?? "sparkles"
    }
}

import SwiftUI

/// Broad learning-focus categories for the "what do you want to learn?" survey
/// — Swift port of the web utils/topics.js. Each category maps to the
/// curriculum unit ids (including their mini-project units) that belong to
/// it. Unit 0 (Orientation) is intentionally excluded — it always stays
/// first regardless of preference.
struct TopicCategory: Identifiable {
    let id: String
    let label: String
    let icon: String
    let unitIds: Set<Int>
}

enum Topics {
    static let categories: [TopicCategory] = [
        TopicCategory(id: "ml", label: "Machine Learning", icon: "🤖",
                      unitIds: Set(1...55)),
        TopicCategory(id: "dl", label: "Deep Learning", icon: "🧠",
                      unitIds: Set(56...88).union([535, 536])),
        TopicCategory(id: "cv", label: "Computer Vision", icon: "👁️",
                      unitIds: Set(89...200).union([537, 538])),
        TopicCategory(id: "nlp", label: "NLP & Language Models", icon: "💬",
                      unitIds: Set(221...299).union(Set(345...404)).union([541, 542, 545, 546])),
        TopicCategory(id: "genai", label: "Generative AI", icon: "🎨",
                      unitIds: Set(201...220).union(Set(300...344)).union([539, 540, 543, 544])),
        TopicCategory(id: "llmapp", label: "LLM Engineering", icon: "🔌",
                      unitIds: Set(405...479).union([547, 548])),
        TopicCategory(id: "agents", label: "AI Agents", icon: "⚡",
                      unitIds: Set(480...534).union([549, 550])),
    ]

    private static let unitToCategory: [Int: String] = {
        var map: [Int: String] = [:]
        for cat in categories { for id in cat.unitIds { map[id] = cat.id } }
        return map
    }()

    static func category(forUnit id: Int) -> String? { unitToCategory[id] }

    /// Reorders units so the learner's chosen categories lead (in their
    /// original relative order), then everything else (also in original
    /// order). Uncategorized units (Orientation) always lead. No selection
    /// => no-op, original order preserved.
    static func reorder(_ units: [Unit], selected: Set<String>) -> [Unit] {
        guard !selected.isEmpty else { return units }
        var uncategorized: [Unit] = []
        var prioritized: [Unit] = []
        var rest: [Unit] = []
        for u in units {
            if let cat = category(forUnit: u.id) {
                if selected.contains(cat) { prioritized.append(u) } else { rest.append(u) }
            } else {
                uncategorized.append(u)
            }
        }
        return uncategorized + prioritized + rest
    }
}

/// A single selectable topic chip — icon + label, violet border/tint + a
/// checkmark badge when active. Shared by OnboardingView's topics step and
/// LearningFocusView (Profile > Learning Focus).
struct TopicChip: View {
    let category: TopicCategory
    let isOn: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(alignment: .leading, spacing: 6) {
                Text(category.icon).font(.system(size: 26))
                Text(category.label)
                    .font(Theme.outfit(12, .bold))
                    .foregroundColor(Theme.slate800)
                    .multilineTextAlignment(.leading)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(14)
            .background(isOn ? Theme.tintViolet : Theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(isOn ? Theme.violet : Theme.border, lineWidth: 2))
            .overlay(alignment: .topTrailing) {
                if isOn {
                    Circle().fill(Theme.violet).frame(width: 16, height: 16)
                        .overlay(Image(systemName: "checkmark")
                            .font(.system(size: 9, weight: .heavy)).foregroundColor(.white))
                        .padding(8)
                }
            }
        }
        .buttonStyle(.plain)
    }
}

/// 2-column grid of all topic chips — controlled by `selected` (category ids).
struct TopicChipGrid: View {
    let selected: Set<String>
    let onToggle: (String) -> Void

    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible(), spacing: 10), GridItem(.flexible(), spacing: 10)], spacing: 10) {
            ForEach(Topics.categories) { cat in
                TopicChip(category: cat, isOn: selected.contains(cat.id)) { onToggle(cat.id) }
            }
        }
    }
}

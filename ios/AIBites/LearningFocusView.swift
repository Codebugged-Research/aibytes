import SwiftUI

/// Sheet presented from Profile > Learning Focus — lets the learner revisit
/// and change the topic-priority survey they saw during onboarding.
struct LearningFocusView: View {
    @EnvironmentObject var store: AppStore
    @Environment(\.dismiss) private var dismiss
    @State private var selected: Set<String> = []

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Learning focus").font(Theme.head(24)).foregroundColor(Theme.ink)
                        Text("Pick your focus areas — we'll bring those lessons forward on your path. Leave everything unselected to learn in the original order.")
                            .font(Theme.body(14)).foregroundColor(Theme.inkSoft)
                    }

                    TopicChipGrid(selected: selected) { id in
                        if selected.contains(id) { selected.remove(id) } else { selected.insert(id) }
                    }

                    PrimaryButton(title: "Save") {
                        store.topicPrefs = Array(selected)
                        dismiss()
                    }
                }
                .padding(20)
            }
            .background(Theme.bg)
            .navigationTitle("")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close") { dismiss() }
                }
            }
            .onAppear { selected = Set(store.topicPrefs) }
        }
    }
}

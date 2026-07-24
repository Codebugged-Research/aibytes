import SwiftUI

/// Sheet presented from Profile > Your Role — lets the learner revisit
/// and change the role they picked during onboarding.
struct LearningFocusView: View {
    @EnvironmentObject var store: AppStore
    @Environment(\.dismiss) private var dismiss
    @State private var role: String? = nil

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text("Your role").font(Theme.head(24)).foregroundColor(Theme.ink)
                        Text("Pick a role to filter your path down to what matters for your work. Leave unselected to see every lesson.")
                            .font(Theme.body(14)).foregroundColor(Theme.inkSoft)
                    }

                    RoleList(selected: role) { role = $0 }

                    PrimaryButton(title: "Save") {
                        store.rolePref = role
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
            .onAppear {
                role = store.rolePref
            }
        }
    }
}

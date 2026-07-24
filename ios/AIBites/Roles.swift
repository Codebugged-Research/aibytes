import SwiftUI

/// Role-based learning paths — Swift port of the web utils/roles.js. Unlike
/// TopicCategory (which only reorders), a Role FILTERS the curriculum down
/// to a curated unit whitelist: someone who picks "Project Manager"
/// shouldn't have to scroll past 55 units of classical ML math to find
/// what's relevant to their job. `unitIds == nil` means "no filter" (the
/// Student role, and the "no role picked" default).
struct Role: Identifiable {
    let id: String
    let label: String
    let icon: String
    let unitIds: Set<Int>?
}

enum Roles {
    static let all: [Role] = [
        Role(id: "pm", label: "Project Manager", icon: "📋", unitIds: Set(
            [0, 1, 2] + Array(3...8) + [28, 29, 30] + [51, 52, 53]
            + Array(345...349) + Array(355...359) + Array(370...374)
            + Array(480...484) + Array(530...534) + [199, 297, 342]
        )),
        Role(id: "product", label: "Product Manager", icon: "🧭", unitIds: Set(
            [0] + Array(3...8) + [201, 202, 203, 204] + [300] + Array(315...319) + Array(330...339)
            + Array(345...349) + Array(355...359) + Array(400...404) + Array(455...459) + [465, 466, 467]
            + Array(480...484) + Array(530...534) + [199, 297, 342]
        )),
        Role(id: "analyst", label: "Data Analyst", icon: "📊", unitIds: Set(
            [0, 1, 2] + Array(3...55) + Array(370...374)
        )),
        Role(id: "datasci", label: "Data Scientist", icon: "🔬", unitIds: Set(
            Array(0...55) + Array(56...88) + Array(89...96) + Array(221...299) + Array(300...344) + Array(345...404)
        )),
        Role(id: "aidev", label: "AI App Developer", icon: "🧩", unitIds: Set(
            Array(0...8) + Array(345...404) + Array(405...479) + Array(480...534) + Array(545...550)
        )),
        Role(id: "designer", label: "Designer (Creative AI)", icon: "🎨", unitIds: Set(
            [0] + [3, 4, 5, 6] + [201, 202, 203, 204, 213, 214, 215] + Array(300...344)
            + Array(370...374) + [539, 540, 543, 544]
        )),
        Role(id: "exec", label: "Executive / Founder", icon: "💼", unitIds: Set(
            [0, 1, 2] + Array(3...8) + [300] + Array(315...319) + Array(345...349) + Array(400...404)
            + Array(480...484) + Array(530...534) + [51, 52, 53] + Array(395...399) + Array(475...479)
            + [199, 297, 342]
        )),
        Role(id: "marketing", label: "Marketing / Content", icon: "📣", unitIds: Set(
            [0] + [3, 4, 5] + Array(345...349) + Array(355...359) + Array(405...419) + Array(330...339)
            + [541, 542, 543, 544] + [297, 342]
        )),
        Role(id: "sales", label: "Sales / Solutions Engineer", icon: "🤝", unitIds: Set(
            [0] + Array(3...8) + Array(345...349) + Array(400...404) + Array(455...472)
            + Array(480...484) + Array(530...534) + Array(395...399) + [199, 297, 342]
        )),
        Role(id: "student", label: "Student (Learn Everything)", icon: "🎓", unitIds: nil),
    ]

    static func byId(_ id: String?) -> Role? {
        guard let id else { return nil }
        return all.first { $0.id == id }
    }

    /// Filters units to a role's whitelist. Applies only when a role is
    /// picked (non-nil unitIds) AND showAll is false — the two gates that
    /// decide whether filtering happens at all.
    static func filter(_ units: [Unit], roleId: String?, showAll: Bool) -> [Unit] {
        guard let role = byId(roleId), let allowed = role.unitIds, !showAll else { return units }
        return units.filter { allowed.contains($0.id) }
    }
}

/// A single selectable role row — radio semantics (single-select), unlike
/// TopicChip's multi-select checkmark grid. Shared by OnboardingView's role
/// step and LearningFocusView (Profile > Learning Focus).
struct RoleRow: View {
    let role: Role
    let isOn: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Text(role.icon).font(.system(size: 20))
                Text(role.label)
                    .font(Theme.outfit(14, .bold))
                    .foregroundColor(Theme.slate800)
                    .frame(maxWidth: .infinity, alignment: .leading)
                if isOn {
                    Circle().fill(Theme.violet).frame(width: 20, height: 20)
                        .overlay(Image(systemName: "checkmark")
                            .font(.system(size: 11, weight: .heavy)).foregroundColor(.white))
                }
            }
            .padding(.horizontal, 16).padding(.vertical, 12)
            .background(isOn ? Theme.tintViolet : Theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(isOn ? Theme.violet : Theme.border, lineWidth: 2))
        }
        .buttonStyle(.plain)
    }
}

/// Single-select list of all roles. `selected` is a role id or nil; picking
/// the already-selected role clears it back to nil (no role = show everything).
struct RoleList: View {
    let selected: String?
    let onSelect: (String?) -> Void

    var body: some View {
        VStack(spacing: 8) {
            ForEach(Roles.all) { role in
                let active = selected == role.id
                RoleRow(role: role, isOn: active) { onSelect(active ? nil : role.id) }
            }
        }
    }
}

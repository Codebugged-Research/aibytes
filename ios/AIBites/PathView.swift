import SwiftUI

/// Curriculum path — full parity with web Path.js: gradient unit headers with
/// progress bars, a timeline of lesson nodes (icon + connector + number badge),
/// and done / current / locked states with START / LOCKED badges.
struct PathView: View {
    @EnvironmentObject var store: AppStore
    let startLesson: (String) -> Void
    @State private var nodePulse = false

    private var units: [Unit] { store.orderedUnits }
    private var ordered: [String] { store.orderedLessons }

    private enum NodeState { case done, current, locked }
    private func state(_ id: String) -> NodeState {
        if store.isCompleted(id) { return .done }
        return store.isLocked(id) ? .locked : .current
    }

    var body: some View {
        ScrollView {
            VStack(spacing: 0) {
                if let role = store.activeRole {
                    roleBanner(role)
                }
                ForEach(Array(units.enumerated()), id: \.element.id) { ui, unit in
                    unitSection(unit, index: ui)
                }
            }
            .padding(.bottom, 120)
        }
        .background(Theme.bg)
        .onAppear {
            withAnimation(.easeOut(duration: 2).repeatForever(autoreverses: false)) { nodePulse = true }
        }
    }

    private func roleBanner(_ role: Role) -> some View {
        HStack(spacing: 8) {
            Text(role.icon).font(.system(size: 18))
            VStack(alignment: .leading, spacing: 1) {
                Text("YOUR PATH").font(Theme.outfit(9, .bold)).foregroundColor(Theme.violet).tracking(1)
                Text(role.label).font(Theme.outfit(13, .bold)).foregroundColor(Theme.slate800)
            }
            Spacer()
        }
        .padding(.horizontal, 16).padding(.vertical, 12)
        .background(Theme.tintViolet)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(Theme.violet.opacity(0.15), lineWidth: 1))
        .padding(.horizontal, 16).padding(.top, 16).padding(.bottom, 4)
    }

    private func unitSection(_ unit: Unit, index: Int) -> some View {
        let done = unit.lessons.filter { store.isCompleted($0.id) }.count
        let pct = unit.lessons.isEmpty ? 0 : Double(done) / Double(unit.lessons.count)
        return VStack(spacing: 0) {
            // gradient header
            VStack(alignment: .leading, spacing: 14) {
                HStack(spacing: 12) {
                    RoundedRectangle(cornerRadius: 12, style: .continuous).fill(.white.opacity(0.2))
                        .frame(width: 40, height: 40)
                        .overlay(Image(systemName: Icons.symbol(unit.tierIcon))
                            .font(.system(size: 20)).foregroundColor(.white))
                    VStack(alignment: .leading, spacing: 2) {
                        Text(unit.tier.uppercased()).font(Theme.inter(10, .bold))
                            .foregroundColor(.white.opacity(0.65)).tracking(0.5)
                        Text(unit.title).font(Theme.inter(16, .black)).foregroundColor(.white)
                    }
                    Spacer()
                }
                VStack(spacing: 6) {
                    HStack {
                        HStack(spacing: 6) {
                            Image(systemName: "star.fill").font(.system(size: 10)).foregroundColor(.yellow)
                            Text("\(done) / \(unit.lessons.count) complete")
                                .font(Theme.inter(12, .bold)).foregroundColor(.white.opacity(0.7))
                        }
                        Spacer()
                        Text("\(Int(pct * 100))%").font(Theme.inter(12, .bold))
                            .foregroundColor(.white.opacity(0.7))
                    }
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            Capsule().fill(.white.opacity(0.2))
                            Capsule().fill(.white.opacity(0.8)).frame(width: geo.size.width * pct)
                        }
                    }.frame(height: 6)
                }
            }
            .padding(.horizontal, 24).padding(.vertical, 20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Theme.unitGradient(index))

            // lessons
            VStack(spacing: 0) {
                ForEach(Array(unit.lessons.enumerated()), id: \.element.id) { li, lesson in
                    lessonRow(lesson, number: li + 1, isLast: li == unit.lessons.count - 1)
                }
            }
            .padding(.horizontal, 16).padding(.top, 16).padding(.bottom, 8)
        }
    }

    private func lessonRow(_ lesson: LessonMeta, number: Int, isLast: Bool) -> some View {
        let st = state(lesson.id)
        return HStack(alignment: .top, spacing: 12) {
            // node + connector
            VStack(spacing: 0) {
                ZStack(alignment: .topLeading) {
                    Button { if st != .locked { startLesson(lesson.id) } } label: {
                        ZStack {
                            // Current node: two pulsing rings radiating behind it (matches web)
                            if st == .current {
                                RoundedRectangle(cornerRadius: 16, style: .continuous)
                                    .stroke(Theme.violet, lineWidth: 2)
                                    .frame(width: 48, height: 48)
                                    .scaleEffect(nodePulse ? 1.4 : 1)
                                    .opacity(nodePulse ? 0 : 0.6)
                                RoundedRectangle(cornerRadius: 16, style: .continuous)
                                    .stroke(Theme.violet400, lineWidth: 1)
                                    .frame(width: 48, height: 48)
                                    .scaleEffect(nodePulse ? 1.7 : 1)
                                    .opacity(nodePulse ? 0 : 0.3)
                            }
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .fill(nodeFill(st))
                                .frame(width: 48, height: 48)
                                .shadow(color: nodeShadow(st), radius: 6, y: 2)
                                .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous)
                                    .stroke(st == .locked ? Theme.slate200 : .clear, lineWidth: 2))
                            switch st {
                            case .done:    Image(systemName: "checkmark").font(.system(size: 22, weight: .black)).foregroundColor(.white)
                            case .locked:  Image(systemName: "lock").font(.system(size: 17, weight: .medium)).foregroundColor(Theme.inkFaint)
                            case .current: Image(systemName: Icons.symbol(lesson.icon)).font(.system(size: 20)).foregroundColor(.white)
                            }
                        }
                    }
                    .disabled(st == .locked)
                    // number badge
                    Text("\(number)")
                        .font(Theme.inter(8, .black))
                        .foregroundColor(st == .locked ? Theme.inkFaint : .white)
                        .frame(width: 16, height: 16)
                        .background(Circle().fill(st == .done ? Theme.emerald : st == .current ? Theme.violet : Theme.slate200))
                        .offset(x: -6, y: -6)
                }
                if !isLast {
                    Rectangle().fill(st == .done ? Theme.violet400 : Theme.slate200)
                        .frame(width: 2).frame(minHeight: 20).padding(.vertical, 6)
                }
            }
            .frame(width: 52)

            // card
            Button { if st != .locked { startLesson(lesson.id) } } label: {
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("LESSON \(number)").font(Theme.inter(10, .black))
                            .foregroundColor(st == .done ? Theme.emerald : st == .current ? Theme.violet : Theme.inkFaint)
                            .tracking(0.5)
                        Text(lesson.title).font(Theme.inter(14, .heavy))
                            .foregroundColor(st == .locked ? Theme.inkFaint : (st == .done ? Theme.inkSoft : Theme.ink))
                            .lineLimit(2).multilineTextAlignment(.leading)
                    }
                    Spacer(minLength: 6)
                    badge(st)
                }
                .padding(.horizontal, 16).padding(.vertical, 14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(cardFill(st))
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(cardStroke(st), lineWidth: 1))
                .opacity(st == .locked ? 0.6 : 1)
            }
            .disabled(st == .locked)
            .padding(.bottom, 12)
        }
    }

    @ViewBuilder private func badge(_ st: NodeState) -> some View {
        switch st {
        case .done:
            HStack(spacing: 2) {
                Image(systemName: "bolt.fill").font(.system(size: 9)).foregroundColor(Theme.yellow)
                Text("+10").font(Theme.inter(9, .black)).foregroundColor(Theme.amber500)
            }
            .padding(.horizontal, 8).padding(.vertical, 4)
            .background(Theme.tintYellow).clipShape(Capsule())
        case .current:
            HStack(spacing: 2) {
                Text("START").font(Theme.inter(11, .black))
                Image(systemName: "chevron.right").font(.system(size: 9, weight: .black))
            }.foregroundColor(Theme.violet)
        case .locked:
            HStack(spacing: 2) {
                Image(systemName: "lock").font(.system(size: 10, weight: .bold))
                Text("LOCKED").font(Theme.inter(10, .black))
            }.foregroundColor(Theme.inkFaint)
        }
    }

    private func nodeFill(_ s: NodeState) -> AnyShapeStyle { switch s {
    case .done:    return AnyShapeStyle(Theme.gEmerald)
    case .current: return AnyShapeStyle(Theme.gViolet)
    case .locked:  return AnyShapeStyle(Theme.card)
    }
         }
    private func nodeShadow(_ s: NodeState) -> Color { switch s { case .done: return Theme.emerald.opacity(0.2); case .current: return Theme.violet.opacity(0.3); case .locked: return .clear }
         }
    private func cardFill(_ s: NodeState) -> Color { switch s { case .done: return Theme.tintEmerald; case .current: return Theme.card; case .locked: return Theme.card }
         }
    private func cardStroke(_ s: NodeState) -> Color { switch s { case .done: return Theme.tintEmeraldB; case .current: return Theme.violet.opacity(0.3); case .locked: return Theme.slate100 }
         }
}

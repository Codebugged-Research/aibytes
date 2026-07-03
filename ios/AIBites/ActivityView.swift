import SwiftUI

/// Recent activity feed — filterable list of learning events + weekly output
/// card. Ported 1:1 from web `pages/Activity.js`.
struct ActivityView: View {
    @State private var filter = "all"

    private let filters = ["all", "success", "failed"]

    private let activities: [Act] = [
        Act(title: "What is AI, really?", date: "18 Jun", method: "Completed Lesson 1",
            xp: "+15 XP", status: .success, tag: nil,
            symbol: "book.fill", tileBG: 0xEDE9FE, tileFG: 0x6D28D9),        // violet-100 / 700
        Act(title: "AI vs ML vs Deep Learning", date: "17 Jun", method: "Completed Lesson 2",
            xp: "+15 XP", status: .success, tag: nil,
            symbol: "book.fill", tileBG: 0xE0E7FF, tileFG: 0x4338CA),        // indigo-100 / 700
        Act(title: "Foundations Practice Quiz", date: "16 Jun", method: "Practice Session",
            xp: "+5 XP", status: .success, tag: nil,
            symbol: "star.fill", tileBG: 0xFEF3C7, tileFG: 0xB45309),        // amber-100 / 700
        Act(title: "Narrow vs General AI", date: "15 Jun", method: "Attempted Challenge",
            xp: "0 XP", status: .failed, tag: "FAILED",
            symbol: "target", tileBG: 0xFEE2E2, tileFG: 0xDC2626),           // red-100 / 600
        Act(title: "Intro to Prompt Engineering", date: "14 Jun", method: "In Progress",
            xp: "—", status: .inprog, tag: "IN PROGRESS",
            symbol: "bolt.fill", tileBG: 0xE0F2FE, tileFG: 0x0369A1)         // sky-100 / 700
    ]

    private var filtered: [Act] {
        filter == "all" ? activities : activities.filter { $0.status.rawValue == filter }
    }

    private var totalXP: Int {
        activities.filter { $0.status == .success }
            .reduce(0) { $0 + (Int($1.xp.filter(\.isNumber)) ?? 0) }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                // Header
                VStack(alignment: .leading, spacing: 4) {
                    Text("Recent activity")
                        .font(Theme.head(30)).foregroundColor(Theme.ink)
                    Text("Review your learning accomplishments")
                        .font(Theme.body(14)).foregroundColor(Theme.inkFaint)
                }

                // Filter chips
                HStack(spacing: 8) {
                    ForEach(filters, id: \.self) { f in
                        chip(f)
                    }
                }

                // Activity list
                VStack(spacing: 0) {
                    ForEach(filtered) { act in
                        row(act)
                        if act.id != filtered.last?.id {
                            Divider().background(Theme.slate100)
                        }
                    }
                    if filtered.isEmpty {
                        VStack(spacing: 12) {
                            Image(systemName: "exclamationmark.circle")
                                .font(.system(size: 32, weight: .light))
                            Text("No activity found").font(Theme.label(12))
                        }
                        .foregroundColor(Theme.inkFaint)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 40)
                    }
                }
                .animation(.easeInOut(duration: 0.25), value: filter)

                // Weekly Overview card
                CardBox(bg: Theme.tintViolet, borderColor: Theme.tintVioletB) {
                    HStack {
                        HStack(spacing: 12) {
                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .fill(Theme.violet)
                                .frame(width: 40, height: 40)
                                .overlay(Image(systemName: "chart.line.uptrend.xyaxis")
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(.white))
                                .shadow(color: .black.opacity(0.06), radius: 3, y: 1)
                            VStack(alignment: .leading, spacing: 2) {
                                Text("WEEKLY OUTPUT")
                                    .font(Theme.outfit(12, .black))
                                    .tracking(0.6).foregroundColor(Theme.ink)
                                Text("Aggregating learning rate")
                                    .font(Theme.inter(10, .medium))
                                    .foregroundColor(Theme.inkFaint)
                            }
                        }
                        Spacer()
                        Text("\(totalXP) XP")
                            .font(Theme.head(20)).foregroundColor(Theme.violet)
                    }
                }
            }
            .padding(.horizontal, 24)
            .padding(.top, 8)
            .padding(.bottom, 120)
        }
        .background(Theme.bg)
    }

    // MARK: - Rows

    private func chip(_ f: String) -> some View {
        let active = filter == f
        return Text(f.uppercased())
            .font(Theme.outfit(10, .heavy))
            .tracking(0.8)
            .foregroundColor(active ? .white : Theme.inkSoft)
            .padding(.horizontal, 12).padding(.vertical, 6)
            .background(active ? Theme.ink : Theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(active ? .clear : Theme.slate200, lineWidth: 1))
            .shadow(color: .black.opacity(active ? 0.12 : 0), radius: 4, y: 2)
            .onTapGesture { filter = f }
    }

    private func row(_ act: Act) -> some View {
        HStack {
            HStack(spacing: 14) {
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .fill(Color(hex: act.tileBG))
                    .frame(width: 44, height: 44)
                    .overlay(Image(systemName: act.symbol)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(Color(hex: act.tileFG)))
                    .shadow(color: .black.opacity(0.05), radius: 3, y: 1)

                VStack(alignment: .leading, spacing: 3) {
                    HStack(spacing: 8) {
                        Text(act.title)
                            .font(Theme.outfit(14, .heavy))
                            .foregroundColor(Theme.ink)
                        if let tag = act.tag {
                            Text(tag)
                                .font(Theme.outfit(8, .black))
                                .tracking(0.6)
                                .foregroundColor(act.status == .failed ? Theme.red : Theme.amber500)
                                .padding(.horizontal, 6).padding(.vertical, 2)
                                .background(act.status == .failed
                                    ? Color(hex: 0xFEF2F2) : Color(hex: 0xFFFBEB))
                                .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
                                .overlay(RoundedRectangle(cornerRadius: 6, style: .continuous)
                                    .stroke(act.status == .failed
                                        ? Color(hex: 0xFEE2E2) : Color(hex: 0xFEF3C7), lineWidth: 1))
                        }
                    }
                    Text("\(act.date) · \(act.method)")
                        .font(Theme.inter(12, .medium))
                        .foregroundColor(Theme.inkFaint)
                }
            }
            Spacer()
            Text(act.xp)
                .font(Theme.outfit(14, .heavy))
                .foregroundColor(xpColor(act.status))
        }
        .padding(.vertical, 12)
    }

    private func xpColor(_ s: Act.Status) -> Color {
        switch s {
        case .success: return Theme.emerald600
        case .failed:  return Color(hex: 0xF87171)   // red-400
        case .inprog:  return Theme.inkFaint         // slate-400
        }
    }

    // MARK: - Model (static demo data — not part of shared Models)

    private struct Act: Identifiable {
        enum Status: String { case success, failed, inprog }
        let id = UUID()
        let title, date, method, xp: String
        let status: Status
        let tag: String?
        let symbol: String
        let tileBG, tileFG: UInt
    }
}

#Preview { ActivityView() }

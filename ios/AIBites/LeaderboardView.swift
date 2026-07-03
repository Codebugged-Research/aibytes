import SwiftUI

/// Bronze League leaderboard — the user ranked against 12 static demo peers by
/// streak or XP. Ported 1:1 from web `Leaderboard.js` (gradient header + podium
/// + ranked rows). Peers are static; the "you" row is live from the store.
struct LeaderboardView: View {
    @EnvironmentObject var store: AppStore
    @State private var tab: Tab = .streak

    enum Tab { case streak, xp }

    // ── Static mock league data ──────────────────────────────────────────────
    private static let mock: [LeaderboardEntry] = [
        LeaderboardEntry(id: "m1",  name: "Alex Chen", initials: "AC", color: 0x6248FF, streak: 45, xp: 890),
        LeaderboardEntry(id: "m2",  name: "Priya M.",  initials: "PM", color: 0xF59E0B, streak: 38, xp: 760),
        LeaderboardEntry(id: "m3",  name: "Jordan K.", initials: "JK", color: 0x10B981, streak: 31, xp: 620),
        LeaderboardEntry(id: "m4",  name: "Sam W.",    initials: "SW", color: 0xEF4444, streak: 22, xp: 440),
        LeaderboardEntry(id: "m5",  name: "Maria L.",  initials: "ML", color: 0x3B82F6, streak: 18, xp: 360),
        LeaderboardEntry(id: "m6",  name: "Kevin T.",  initials: "KT", color: 0x8B5CF6, streak: 14, xp: 280),
        LeaderboardEntry(id: "m7",  name: "Nina R.",   initials: "NR", color: 0xEC4899, streak: 11, xp: 220),
        LeaderboardEntry(id: "m8",  name: "Omar F.",   initials: "OF", color: 0x14B8A6, streak:  7, xp: 140),
        LeaderboardEntry(id: "m9",  name: "Lily Z.",   initials: "LZ", color: 0xF97316, streak:  5, xp: 100),
        LeaderboardEntry(id: "m10", name: "Chris A.",  initials: "CA", color: 0x06B6D4, streak:  3, xp:  60),
        LeaderboardEntry(id: "m11", name: "Emma B.",   initials: "EB", color: 0xA855F7, streak:  2, xp:  40),
        LeaderboardEntry(id: "m12", name: "Raj S.",    initials: "RS", color: 0x64748B, streak:  1, xp:  20),
    ]

    private var youEntry: LeaderboardEntry {
        LeaderboardEntry(id: "you", name: "You", initials: "You", color: 0x6248FF,
              streak: store.progress.streak, xp: store.xp)
    }

    private var sorted: [LeaderboardEntry] {
        (Self.mock + [youEntry]).sorted { a, b in
            switch tab {
            case .streak: return a.streak != b.streak ? a.streak > b.streak : a.xp > b.xp
            case .xp:     return a.xp != b.xp ? a.xp > b.xp : a.streak > b.streak
            }
        }
    }

    private var youRank: Int { (sorted.firstIndex { $0.id == "you" } ?? 0) + 1 }
    private func rank(of e: LeaderboardEntry) -> Int { (sorted.firstIndex { $0.id == e.id } ?? 0) + 1 }

    var body: some View {
        ScrollView {
            VStack(spacing: 16) {
                header
                tabSwitcher.padding(.horizontal, 20)
                list.id(tab)   // fade-in re-triggers on tab change
            }
            .padding(.bottom, 120)
        }
        .background(Theme.bg)
    }

    // ── Header ───────────────────────────────────────────────────────────────
    private var header: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                HStack(spacing: 8) {
                    Image(systemName: "trophy.fill").font(.system(size: 20))
                        .foregroundColor(Theme.yellow.opacity(0.95))
                    Text("Bronze League").font(Theme.head(16)).foregroundColor(.white)
                }
                Spacer()
                PulsePill(text: "XP resets Sunday")
            }
            .padding(.bottom, 4)

            Text("Top 3 advance to Silver League →")
                .font(Theme.inter(11)).foregroundColor(.white.opacity(0.7))

            // Your rank highlight
            HStack(spacing: 8) {
                HStack(spacing: 4) {
                    Group {
                        if youRank <= 3 {
                            Image(systemName: "crown.fill").foregroundColor(Color(hex: 0xFDE047))
                        } else if youRank <= 10 {
                            Image(systemName: "chevron.up").foregroundColor(Color(hex: 0x6EE7B7))
                        } else {
                            Image(systemName: "chevron.down").foregroundColor(Color(hex: 0xFCA5A5))
                        }
                    }.font(.system(size: 13, weight: .bold))
                    Text("#\(youRank)").font(Theme.head(14)).foregroundColor(.white)
                }
                Text("Your rank").font(Theme.inter(12)).foregroundColor(.white.opacity(0.8))
                Spacer()
                HStack(spacing: 10) {
                    HStack(spacing: 4) {
                        Image(systemName: "flame.fill").font(.system(size: 11))
                            .foregroundColor(Color(hex: 0xFDBA74))
                        Text("\(store.progress.streak)d")
                    }
                    HStack(spacing: 4) {
                        Image(systemName: "bolt.fill").font(.system(size: 11))
                            .foregroundColor(Color(hex: 0xDDD6FE))
                        Text("\(store.xp) XP")
                    }
                }
                .font(Theme.outfit(12, .heavy)).foregroundColor(.white)
            }
            .padding(.horizontal, 12).padding(.vertical, 8)
            .background(Color.white.opacity(0.15))
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .padding(.top, 12)
        }
        .padding(.horizontal, 20).padding(.top, 20).padding(.bottom, 16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Theme.gViolet)
    }

    // ── Tab switcher ───────────────────────────────────────────────────────────
    private var tabSwitcher: some View {
        HStack(spacing: 8) {
            tabButton(.streak, "Streak", "flame.fill")
            tabButton(.xp, "XP", "bolt.fill")
        }
    }

    private func tabButton(_ t: Tab, _ label: String, _ icon: String) -> some View {
        let active = tab == t
        return Button { withAnimation(.easeInOut(duration: 0.18)) { tab = t } } label: {
            HStack(spacing: 6) {
                Image(systemName: icon).font(.system(size: 12))
                    .foregroundColor(active ? .white : Theme.inkFaint)
                Text(label).font(Theme.outfit(12, .heavy))
                    .foregroundColor(active ? .white : Theme.inkSoft)
            }
            .frame(maxWidth: .infinity).padding(.vertical, 10)
            .background(active ? Theme.ink : Theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(active ? Color.clear : Theme.border, lineWidth: 1))
        }
        .buttonStyle(.plain)
    }

    // ── List: podium + rows ──────────────────────────────────────────────────
    private var list: some View {
        let top3 = Array(sorted.prefix(3))
        let podiumOrder = [top3[safe: 1], top3[safe: 0], top3[safe: 2]].compactMap { $0 }
        let rest = Array(sorted.dropFirst(3).prefix(10))
        let youInRest = rest.contains { $0.id == "you" }

        return VStack(spacing: 0) {
            // Podium
            HStack(alignment: .bottom, spacing: 12) {
                ForEach(podiumOrder) { e in
                    PodiumCard(entry: e, rank: rank(of: e))
                }
            }
            .padding(.horizontal, 16).padding(.top, 12).padding(.bottom, 4)

            // Divider
            Rectangle().fill(Theme.slate200).frame(height: 1)
                .padding(.horizontal, 20).padding(.vertical, 12)

            // Rows #4+
            VStack(spacing: 8) {
                ForEach(rest) { e in
                    LeaderRow(entry: e, rank: rank(of: e), tab: tab)
                }
            }
            .padding(.horizontal, 16)

            // Sticky "you" card if outside top 13
            if youInRest && youRank > 13 {
                VStack(spacing: 8) {
                    Rectangle().fill(Theme.slate200).frame(height: 1)
                    LeaderRow(entry: youEntry, rank: youRank, tab: tab)
                }
                .padding(.horizontal, 16).padding(.top, 12)
            }
        }
        .transition(.opacity)
    }
}

// ── Pulsing "Resets Sun" pill ─────────────────────────────────────────────────
private struct PulsePill: View {
    let text: String
    @State private var dim = false
    var body: some View {
        Text(text)
            .font(Theme.outfit(10, .bold))
            .foregroundColor(.white.opacity(0.7))
            .lineLimit(1).fixedSize()
            .padding(.horizontal, 10).padding(.vertical, 4)
            .background(Color.white.opacity(0.1))
            .clipShape(Capsule())
            .opacity(dim ? 0.6 : 1)
            .onAppear {
                withAnimation(.easeInOut(duration: 1).repeatForever(autoreverses: true)) { dim = true }
            }
    }
}

// ── Medal styling ───────────────────────────────────────────────────────────
private enum Medal {
    /// Gradient colors for ranks 1/2/3; nil for others.
    static func gradient(_ rank: Int) -> [Color]? {
        switch rank {
        case 1: return [Color(hex: 0xFACC15), Color(hex: 0xF59E0B)]  // gold: yellow-400 → amber-500
        case 2: return [Theme.slate300, Color(hex: 0x94A3B8)]  // silver: slate-300 → slate-400
        case 3: return [Color(hex: 0xD97706), Color(hex: 0xB45309)]  // bronze: amber-600 → amber-700
        default: return nil
        }
    }
}

// ── Avatar ────────────────────────────────────────────────────────────────────
private struct LBAvatar: View {
    let initials: String
    let color: UInt
    let size: CGFloat
    let isYou: Bool

    var body: some View {
        ZStack {
            if isYou {
                Circle().fill(Theme.gViolet)
            } else {
                Circle().fill(Color(hex: color))
            }
            Text(isYou ? "You" : initials)
                .font(Theme.outfit(size * 0.35, .black))
                .foregroundColor(.white)
        }
        .frame(width: size, height: size)
        // ponytail: approximates web's "0 0 0 2px #fff, 0 0 0 4px #6248FF" double ring
        .overlay(isYou ? Circle().strokeBorder(.white, lineWidth: 2) : nil)
        .background(isYou ? Circle().fill(Theme.violet).padding(-2) : nil)
    }
}

// ── Rank badge ──────────────────────────────────────────────────────────────
private struct RankBadge: View {
    let rank: Int
    var body: some View {
        Group {
            if let g = Medal.gradient(rank) {
                ZStack {
                    Circle().fill(LinearGradient(colors: g, startPoint: .topLeading, endPoint: .bottomTrailing))
                    if rank == 1 {
                        Image(systemName: "crown.fill").font(.system(size: 13)).foregroundColor(.white)
                    } else {
                        Text("\(rank)").font(Theme.outfit(11, .black)).foregroundColor(.white)
                    }
                }
            } else {
                ZStack {
                    Circle().fill(Theme.slate100)
                    Text("\(rank)").font(Theme.outfit(11, .black)).foregroundColor(Theme.inkSoft)
                }
            }
        }
        .frame(width: 28, height: 28)
    }
}

// ── Single leaderboard row ────────────────────────────────────────────────────
private struct LeaderRow: View {
    let entry: LeaderboardEntry
    let rank: Int
    let tab: LeaderboardView.Tab

    var body: some View {
        let isYou = entry.id == "you"
        HStack(spacing: 12) {
            RankBadge(rank: rank)
            LBAvatar(initials: entry.initials, color: entry.color, size: 38, isYou: isYou)

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(entry.name)
                        .font(Theme.outfit(14, .heavy))
                        .foregroundColor(isYou ? Theme.violet700 : Theme.ink)
                        .lineLimit(1)
                    if isYou {
                        Text("YOU").font(Theme.outfit(9, .black)).foregroundColor(.white)
                            .padding(.horizontal, 6).padding(.vertical, 2)
                            .background(Theme.violet600).clipShape(Capsule())
                    }
                }
                // Secondary stat
                HStack(spacing: 3) {
                    if tab == .streak {
                        Image(systemName: "bolt.fill").font(.system(size: 9)).foregroundColor(Theme.violet400)
                        Text("\(entry.xp) XP")
                    } else {
                        Image(systemName: "flame.fill").font(.system(size: 9)).foregroundColor(Theme.orange)
                        Text("\(entry.streak)d streak")
                    }
                }
                .font(Theme.inter(10, .medium)).foregroundColor(Theme.inkFaint)
            }
            Spacer(minLength: 0)

            // Primary stat
            VStack(alignment: .trailing, spacing: 0) {
                HStack(spacing: 4) {
                    if tab == .streak {
                        Image(systemName: "flame.fill").font(.system(size: 14, weight: .bold))
                            .foregroundColor(Theme.orange500)
                        Text("\(entry.streak)").font(Theme.outfit(16, .black))
                            .foregroundColor(isYou ? Theme.violet700 : Theme.ink)
                    } else {
                        Image(systemName: "bolt.fill").font(.system(size: 14, weight: .bold))
                            .foregroundColor(Theme.violet500)
                        Text("\(entry.xp)").font(Theme.outfit(16, .black))
                            .foregroundColor(isYou ? Theme.violet700 : Theme.ink)
                    }
                }
                Text(tab == .streak ? "days" : "XP")
                    .font(Theme.inter(9, .medium)).foregroundColor(Theme.inkFaint)
            }
        }
        .padding(.horizontal, 16).padding(.vertical, 12)
        .background(isYou ? Theme.violetSoft : Theme.card)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous)
            .stroke(isYou ? Theme.violet : Theme.slate100, lineWidth: 1))
    }
}

// ── Top-3 Podium card ─────────────────────────────────────────────────────────
private struct PodiumCard: View {
    let entry: LeaderboardEntry
    let rank: Int
    @State private var floatUp = false

    var body: some View {
        let isYou = entry.id == "you"
        let height: CGFloat = rank == 1 ? 76 : rank == 2 ? 58 : 46
        let g = Medal.gradient(rank) ?? [Theme.slate200, Theme.slate200]

        return VStack(spacing: 8) {
            if rank == 1 {
                Image(systemName: "crown.fill").font(.system(size: 22))
                    .foregroundColor(Theme.yellow)
                    .offset(y: floatUp ? -4 : 0)
                    .onAppear {
                        withAnimation(.easeInOut(duration: 0.9).repeatForever(autoreverses: true)) {
                            floatUp = true
                        }
                    }
            }
            LBAvatar(initials: entry.initials, color: entry.color,
                     size: rank == 1 ? 52 : 44, isYou: isYou)
            VStack(spacing: 2) {
                Text(isYou ? "You" : String(entry.name.split(separator: " ").first ?? ""))
                    .font(Theme.outfit(11, .heavy)).foregroundColor(Theme.ink)
                HStack(spacing: 2) {
                    Image(systemName: "flame.fill").font(.system(size: 9)).foregroundColor(Theme.orange500)
                    Text("\(entry.streak)d").font(Theme.outfit(10, .black))
                        .foregroundColor(Theme.slate700)
                }
            }
            // Pillar
            ZStack(alignment: .top) {
                UnevenRoundedRectangle(topLeadingRadius: 12, topTrailingRadius: 12, style: .continuous)
                    .fill(LinearGradient(colors: g, startPoint: .top, endPoint: .bottom))
                Text("\(rank)").font(Theme.outfit(20, .black))
                    .foregroundColor(.white.opacity(0.9)).padding(.top, 8)
            }
            .frame(width: 80, height: height)
        }
    }
}

private struct LeaderboardEntry: Identifiable {
    let id: String
    let name: String
    let initials: String
    let color: UInt
    let streak: Int
    let xp: Int
}

import SwiftUI
import UIKit

/// AIBites design tokens — violet "AI spark" brand ported from the web MVP
/// (Tailwind slate/violet/orange/emerald palette). Every surface/text token is
/// dynamic: light values match the web exactly; dark values are the slate-night
/// equivalents, switched automatically by the color scheme.
enum Theme {
    /// Dynamic colour: `light` in light mode, `dark` in dark mode.
    static func dyn(_ light: UInt, _ dark: UInt) -> Color {
        Color(UIColor { trait in
            trait.userInterfaceStyle == .dark ? UIColor(hex: dark) : UIColor(hex: light)
        })
    }

    // Brand
    static let violet     = Color(hex: 0x6248FF)
    static let violet500  = Color(hex: 0x8B5CF6)
    static let violet400  = Color(hex: 0xA78BFA)
    static let violetSoft = Color(hex: 0x6248FF).opacity(0.10)

    // Surfaces
    static let bg         = dyn(0xF8FAFC, 0x0B0B0F)   // slate-50 / near-black
    static let card       = dyn(0xFFFFFF, 0x16161D)
    static let border     = dyn(0xE2E8F0, 0x262631)   // slate-200
    static let border150  = dyn(0xE9EEF4, 0x20202A)

    // Text
    static let ink        = dyn(0x0F172A, 0xF1F5F9)   // slate-900
    static let ink950     = dyn(0x020617, 0xF8FAFC)
    static let inkSoft    = dyn(0x64748B, 0x94A3B8)   // slate-500
    static let inkFaint   = dyn(0x94A3B8, 0x64748B)   // slate-400
    static let slate200   = dyn(0xE2E8F0, 0x2A2A36)
    static let slate100   = dyn(0xF1F5F9, 0x1E1E27)
    static let slate50    = dyn(0xF8FAFC, 0x191921)

    // Secondary text / accents used inline across screens
    static let slate800   = dyn(0x1E293B, 0xE2E8F0)   // input text
    static let slate700   = dyn(0x334155, 0xCBD5E1)   // strong body
    static let slate600   = dyn(0x475569, 0xB0BCCC)
    static let slate300   = dyn(0xCBD5E1, 0x3A3A47)   // idle option dot
    static let violet600  = dyn(0x7C3AED, 0xA78BFA)
    static let violet700  = dyn(0x6D28D9, 0xB5A0FA)
    static let violet900  = dyn(0x4C1D95, 0xC4B5FD)
    static let emerald900 = dyn(0x064E3B, 0x6EE7B7)
    static let emerald700 = dyn(0x047857, 0x34D399)
    static let red950     = dyn(0x450A0A, 0xFCA5A5)
    static let red600     = dyn(0xDC2626, 0xF87171)
    static let rose50     = dyn(0xFFF1F2, 0x2A1418)
    static let red200     = dyn(0xFECACA, 0x4A2028)
    static let indigo50   = dyn(0xEEF2FF, 0x1C2138)

    // Accents
    static let orange     = Color(hex: 0xFF6B35)
    static let orange500  = Color(hex: 0xF97316)
    static let amber500   = Color(hex: 0xF59E0B)
    static let emerald    = Color(hex: 0x10B981)
    static let emerald600 = dyn(0x059669, 0x34D399)
    static let teal500    = Color(hex: 0x14B8A6)
    static let red        = Color(hex: 0xEF4444)
    static let yellow     = Color(hex: 0xF59E0B)
    static let sky        = Color(hex: 0x0EA5E9)
    static let indigo     = Color(hex: 0x6366F1)

    // Tint backgrounds (stat cards etc.)
    static let tintOrange  = dyn(0xFFF4F0, 0x2A1B12)
    static let tintOrangeB = dyn(0xFFEDD5, 0x3A2417)
    static let tintViolet  = dyn(0xF5F3FF, 0x201A33)
    static let tintVioletB = dyn(0xEDE9FE, 0x2E2547)
    static let tintEmerald = dyn(0xECFDF5, 0x102419)
    static let tintEmeraldB = dyn(0xD1FAE5, 0x1B3A2B)
    static let tintYellow  = dyn(0xFEF9C3, 0x2E2A12)

    // Gradients
    static let gViolet   = LinearGradient(colors: [Color(hex: 0x6248FF), Color(hex: 0x8B5CF6)], startPoint: .topLeading, endPoint: .bottomTrailing)
    static let gBlue     = LinearGradient(colors: [Color(hex: 0x0EA5E9), Color(hex: 0x6366F1)], startPoint: .topLeading, endPoint: .bottomTrailing)
    static let gGreen    = LinearGradient(colors: [Color(hex: 0x10B981), Color(hex: 0x0EA5E9)], startPoint: .topLeading, endPoint: .bottomTrailing)
    static let gOrange   = LinearGradient(colors: [Color(hex: 0xF97316), Color(hex: 0xF59E0B)], startPoint: .topLeading, endPoint: .bottomTrailing)
    static let gEmerald  = LinearGradient(colors: [Color(hex: 0x34D399), Color(hex: 0x14B8A6)], startPoint: .topLeading, endPoint: .bottomTrailing)

    static func unitGradient(_ i: Int) -> LinearGradient {
        [gViolet, gBlue, gGreen][i % 3]
    }

    // Fonts — system rounded for headings/titles, standard system for body/labels.
    static func head(_ size: CGFloat) -> Font { .system(size: size, weight: .black, design: .rounded) }
    static func title(_ size: CGFloat) -> Font { .system(size: size, weight: .bold, design: .rounded) }
    static func body(_ size: CGFloat) -> Font { .system(size: size, weight: .medium) }
    static func label(_ size: CGFloat) -> Font { .system(size: size, weight: .heavy) }

    /// Outfit surrogate -> maps to native system rounded.
    static func outfit(_ size: CGFloat, _ weight: Font.Weight = .bold) -> Font {
        .system(size: size, weight: weight, design: .rounded)
    }
    /// Inter surrogate -> maps to standard system font.
    static func inter(_ size: CGFloat, _ weight: Font.Weight = .medium) -> Font {
        .system(size: size, weight: weight)
    }
}

extension Color {
    init(hex: UInt, alpha: Double = 1) {
        self.init(.sRGB,
                  red:   Double((hex >> 16) & 0xFF) / 255,
                  green: Double((hex >> 8) & 0xFF) / 255,
                  blue:  Double(hex & 0xFF) / 255,
                  opacity: alpha)
    }
}

extension UIColor {
    convenience init(hex: UInt) {
        self.init(red:   CGFloat((hex >> 16) & 0xFF) / 255,
                  green: CGFloat((hex >> 8) & 0xFF) / 255,
                  blue:  CGFloat(hex & 0xFF) / 255,
                  alpha: 1)
    }
}

// MARK: - Reusable components

/// White card container with soft border + shadow (mirrors ui-components Card:
/// rounded-2xl = 16, p-5 = 20, border slate-200).
struct CardBox<Content: View>: View {
    var bg: Color = Theme.card
    var borderColor: Color = Theme.border
    var padding: CGFloat = 20
    @ViewBuilder let content: Content
    var body: some View {
        content
            .padding(padding)
            .background(bg)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(borderColor, lineWidth: 1))
            .shadow(color: .black.opacity(0.03), radius: 8, y: 2)
    }
}

/// Primary violet pill button (web onboarding primary: Inter bold 14, py-3.5,
/// rounded-2xl, disabled at 40% opacity).
struct PrimaryButton: View {
    let title: String
    var enabled: Bool = true
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(Theme.inter(14, .bold)).foregroundColor(.white)
                .frame(maxWidth: .infinity).padding(.vertical, 14)
                .background(Theme.violet)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .opacity(enabled ? 1 : 0.4)
        }
        .disabled(!enabled)
    }
}

/// Dark primary button (web ui-components Button primary: slate-900, rounded-xl,
/// Inter bold 14, py-4).
struct DarkButton: View {
    let title: String
    var icon: String? = nil
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                if let icon {
                    Image(systemName: icon).font(.system(size: 14, weight: .bold))
                }
                Text(title).font(Theme.inter(14, .bold))
            }
            .foregroundColor(Theme.dyn(0xFFFFFF, 0x0F172A))
            .frame(maxWidth: .infinity).padding(.vertical, 16)
            .background(Theme.ink)
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        }
    }
}

/// Secondary button (web: white, border slate-200, text slate-700).
struct SecondaryButton: View {
    let title: String
    let action: () -> Void
    var body: some View {
        Button(action: action) {
            Text(title).font(Theme.inter(14, .bold))
                .foregroundColor(Theme.slate700)
                .frame(maxWidth: .infinity).padding(.vertical, 16)
                .background(Theme.card)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(Theme.border, lineWidth: 1))
        }
    }
}

/// Thin solid progress bar (web ui-components ProgressBar: violet-600 on slate-100).
struct ProgressBarView: View {
    let value: Double     // 0...1
    var fill: Color = Color(hex: 0x7C3AED)   // violet-600
    var track: Color = Theme.slate100
    var height: CGFloat = 8
    var body: some View {
        GeometryReader { geo in
            ZStack(alignment: .leading) {
                Capsule().fill(track)
                Capsule().fill(fill)
                    .frame(width: max(0, min(1, value)) * geo.size.width)
            }
        }
        .frame(height: height)
    }
}

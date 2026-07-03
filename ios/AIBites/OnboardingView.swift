import SwiftUI

/// Onboarding — mirrors the web Onboarding.js flow:
/// welcome → (phone | email) → OTP (demo: any 6 digits) → details → success,
/// plus a Google/Apple OAuth shortcut (loading → success). OAuth/OTP simulated
/// client-side. Combines first+last into `name` and calls store.completeOnboarding.
struct OnboardingView: View {
    @EnvironmentObject var store: AppStore
    enum Step: String { case welcome, phone, email, otp, details, loading, success }

    // UITest.* is inert unless the DEBUG screenshot harness sets UITEST_ env vars.
    @State private var step: Step = UITest.str("STEP").flatMap(Step.init(rawValue:)) ?? .welcome
    @State private var method = UITest.str("METHOD") ?? "email"   // email | phone | google | apple
    @State private var provider = "google"       // label for the loading screen
    @State private var phone = UITest.str("PHONE") ?? ""
    @State private var email = UITest.str("EMAIL") ?? ""
    @State private var otp = ""
    @State private var first = UITest.str("FIRST") ?? ""
    @State private var last = UITest.str("LAST") ?? ""
    @State private var resend = UITest.int("RESEND") ?? 0
    @State private var burst = false
    @FocusState private var otpFocused: Bool

    private let cc = "+91"                        // web default (dialForIso 'IN')

    private var emailValid: Bool {
        let r = #"^\S+@\S+\.\S+$"#
        return email.trimmingCharacters(in: .whitespaces).range(of: r, options: .regularExpression) != nil
    }
    private var phoneDigits: String { phone.filter(\.isNumber) }
    private var detailsValid: Bool {
        !first.trimmingCharacters(in: .whitespaces).isEmpty
            && !last.trimmingCharacters(in: .whitespaces).isEmpty
            && (method == "phone" ? emailValid : true)
    }

    private var byteMood: Mood { step == .success ? .celebrate : .wave }

    var body: some View {
        ZStack {
            Theme.bg.ignoresSafeArea()

            // Soft brand glow accents
            RadialGradient(colors: [Theme.violet.opacity(0.12), .clear],
                           center: .topTrailing, startRadius: 4, endRadius: 260)
                .ignoresSafeArea()
            RadialGradient(colors: [Theme.violet.opacity(0.08), .clear],
                           center: .bottomLeading, startRadius: 4, endRadius: 260)
                .ignoresSafeArea()

            Group {
                if step == .welcome {
                    // Welcome fills the whole screen: flexible gaps grow on big
                    // phones and shrink on small ones; scrolls on tiny screens.
                    GeometryReader { geo in
                        ScrollView {
                            welcome
                                .frame(maxWidth: 460)
                                .padding(.horizontal, 32)
                                .frame(maxWidth: .infinity, minHeight: geo.size.height)
                        }
                    }
                    .transition(.asymmetric(insertion: .move(edge: .trailing).combined(with: .opacity),
                                            removal: .move(edge: .leading).combined(with: .opacity)))
                } else {
                    // Centred on any screen; scrolls when the keyboard squeezes
                    // small displays instead of pushing content off-screen.
                    GeometryReader { geo in
                        ScrollView {
                            VStack(spacing: 0) {
                                Spacer(minLength: 28)

                                // Byte welcomes the user (celebrates on success)
                                ZStack {
                                    if step == .success { successBurst }
                                    Mascot(mood: byteMood, size: 148)
                                }
                                .padding(.bottom, 20)   // keep Byte snug against the form

                                // Step content
                                Group {
                                    switch step {
                                    case .phone:    phoneStep
                                    case .email:    emailStep
                                    case .otp:      otpStep
                                    case .details:  detailsStep
                                    case .loading:  loadingStep
                                    default:        successStep
                                    }
                                }
                                .frame(maxWidth: 460)
                                .padding(.horizontal, 32)
                                .transition(.asymmetric(insertion: .move(edge: .trailing).combined(with: .opacity),
                                                        removal: .move(edge: .leading).combined(with: .opacity)))

                                Spacer(minLength: 28)
                            }
                            .frame(maxWidth: .infinity, minHeight: geo.size.height)
                        }
                        .scrollBounceBehavior(.basedOnSize)
                    }
                }
            }
            .animation(.easeOut(duration: 0.32), value: step)

            // Light/dark toggle — web: fixed top-5 right-5 above all steps
            ThemeToggleButton()
                .padding(.top, 8).padding(.trailing, 20)
                .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
        }

        .onReceive(Timer.publish(every: 1, on: .main, in: .common).autoconnect()) { _ in
            if step == .otp && resend > 0 { resend -= 1 }
        }
    }

    // MARK: Steps

    private var welcome: some View {
        VStack(spacing: 0) {
            Spacer(minLength: 16)
            Mascot(mood: .wave, size: 148)
                .padding(.bottom, 16)
            VStack(spacing: 12) {
                Text("Hi, I'm Byte — your AI guide")
                    .font(Theme.inter(11, .bold))
                    .foregroundColor(Theme.violet600)
                    .padding(.horizontal, 12).padding(.vertical, 5)
                    .background(Theme.tintViolet)
                    .overlay(Capsule().stroke(Theme.tintVioletB, lineWidth: 1))
                    .clipShape(Capsule())

                HStack(spacing: 0) {
                    Text("Welcome to ").font(Theme.head(30)).foregroundColor(Theme.ink)
                    Text("AIBites").font(Theme.head(30))
                        .foregroundStyle(LinearGradient(
                            colors: [Color(hex: 0x6248FF), Color(hex: 0x8B5CF6)],
                            startPoint: .leading, endPoint: .trailing))
                }

                Text("Master AI in fun 5-minute bites. Pick how you'd like to sign up.")
                    .font(Theme.body(14)).foregroundColor(Theme.inkSoft)
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 8)
            }

            Spacer(minLength: 24)

            VStack(spacing: 10) {
                // Google — white pill with border
                authButton(bg: Theme.card, fg: Theme.ink, border: Theme.border) {
                    method = "google"; provider = "google"; startOAuth()
                } label: {
                    HStack(spacing: 12) {
                        GoogleGlyph().frame(width: 19, height: 19)
                        Text("Continue with Google")
                    }
                }
                // Apple — dark pill
                authButton(bg: Theme.ink, fg: Theme.dyn(0xFFFFFF, 0x0F172A), border: .clear) {
                    method = "apple"; provider = "apple"; startOAuth()
                } label: {
                    HStack(spacing: 10) {
                        Image(systemName: "apple.logo").font(.system(size: 17))
                        Text("Continue with Apple")
                    }
                }

                divider

                // Phone — white pill, violet outlined icon (web lucide Phone)
                authButton(bg: Theme.card, fg: Theme.ink, border: Theme.border) {
                    method = "phone"; go(.phone)
                } label: {
                    HStack(spacing: 10) {
                        Image(systemName: "phone").font(.system(size: 15, weight: .medium)).foregroundColor(Theme.violet)
                        Text("Continue with phone")
                    }
                }
                // Email — white pill, violet outlined icon (web lucide Mail)
                authButton(bg: Theme.card, fg: Theme.ink, border: Theme.border) {
                    method = "email"; go(.email)
                } label: {
                    HStack(spacing: 10) {
                        Image(systemName: "envelope").font(.system(size: 15, weight: .medium)).foregroundColor(Theme.violet)
                        Text("Continue with email")
                    }
                }
            }

            Spacer(minLength: 18)

            Text("By continuing you agree to our Terms & Privacy Policy.")
                .font(Theme.inter(10)).foregroundColor(Theme.inkFaint)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 16)

            Spacer(minLength: 10)
        }
    }

    private var phoneStep: some View {
        stepScaffold(title: "Enter your phone",
                     subtitle: "We'll text you a 6-digit code.",
                     onBack: { go(.welcome) }) {
            // Joined pill: flag + chevron | divider | input (web PhoneField)
            HStack(spacing: 0) {
                HStack(spacing: 6) {
                    AsyncImage(url: URL(string: "https://flagcdn.com/w40/in.png")) { img in
                        img.resizable().scaledToFill()
                    } placeholder: {
                        Rectangle().fill(Theme.slate100)
                    }
                    .frame(width: 24, height: 16)
                    .clipShape(RoundedRectangle(cornerRadius: 2))
                    Image(systemName: "chevron.down")
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundColor(Theme.inkFaint)
                }
                .padding(.leading, 14).padding(.trailing, 10)

                Rectangle().fill(Theme.border).frame(width: 1, height: 44)

                TextField("", text: $phone,
                          prompt: Text("Phone number").foregroundColor(Theme.inkFaint))
                    .keyboardType(.numberPad)
                    .font(Theme.inter(14, .semibold))
                    .foregroundColor(Theme.slate800)
                    .padding(.horizontal, 12).padding(.vertical, 12)
            }
            .background(Theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(Theme.border, lineWidth: 1))

            PrimaryButton(title: "Send code", enabled: phoneDigits.count >= 6) { sendCode() }
        }
    }

    private var emailStep: some View {
        stepScaffold(title: "Enter your email",
                     subtitle: "We'll email you a 6-digit code.",
                     onBack: { go(.welcome) }) {
            // Custom placeholder: iOS link-detects "name@example.com" in a prompt
            // and paints it blue — draw it ourselves in slate-400 instead.
            ZStack(alignment: .leading) {
                TextField("", text: $email)
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .textFieldStyle(OnbFieldStyle())
                if email.isEmpty {
                    // verbatim: stops SwiftUI's markdown auto-linking the address
                    Text(verbatim: "name@example.com")
                        .font(Theme.inter(14, .semibold))
                        .foregroundColor(Theme.inkFaint)
                        .padding(.leading, 16)
                        .allowsHitTesting(false)
                }
            }
            PrimaryButton(title: "Send code", enabled: emailValid) { sendCode() }
        }
    }

    private var otpStep: some View {
        stepScaffold(title: "Verify your identity",
                     subtitle: method == "phone" ? "Code sent to \(cc) \(phone)" : "Code sent to \(email)",
                     onBack: { go(method == "phone" ? .phone : .email) }) {
            // Six digit boxes over a hidden capture field
            ZStack {
                TextField("", text: $otp)
                    .keyboardType(.numberPad)
                    .focused($otpFocused)
                    .foregroundColor(.clear)
                    .accentColor(.clear)
                    .onChange(of: otp) { _, v in
                        otp = String(v.filter(\.isNumber).prefix(6))
                        if otp.count == 6 {
                            DispatchQueue.main.asyncAfter(deadline: .now() + 0.22) {
                                if otp.count == 6 { go(.details) }   // demo: any 6 accepted
                            }
                        }
                    }
                    .opacity(0.02)

                HStack(spacing: 8) {
                    ForEach(0..<6, id: \.self) { i in
                        let chars = Array(otp)
                        let filled = i < chars.count
                        Text(filled ? String(chars[i]) : "")
                            .font(Theme.inter(20, .black)).foregroundColor(Theme.ink)
                            .frame(width: 44, height: 48)
                            .background(Theme.card)
                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                            .overlay(RoundedRectangle(cornerRadius: 12, style: .continuous)
                                .stroke(i == chars.count && otpFocused ? Theme.violet : Theme.border,
                                        lineWidth: 2))
                    }
                }
                .fixedSize()
                .allowsHitTesting(false)
            }
            .contentShape(Rectangle())
            .onTapGesture { otpFocused = true }

            Text("Demo — enter any 6 digits")
                .font(Theme.inter(10)).foregroundColor(Theme.inkFaint)

            Group {
                if resend > 0 {
                    Text("Resend code in \(resend)s")
                        .font(Theme.inter(12, .semibold)).foregroundColor(Theme.inkFaint)
                } else {
                    Button { resend = 30 } label: {
                        Text("Resend code")
                            .font(Theme.inter(12, .bold)).foregroundColor(Theme.violet)
                    }
                }
            }
        }
        .onAppear {
            otp = ""
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.25) { otpFocused = true }
        }
    }

    private var detailsStep: some View {
        stepScaffold(title: "Almost there!",
                     subtitle: "Tell Byte what to call you.",
                     onBack: nil) {
            TextField("", text: $first,
                      prompt: Text("First Name").foregroundColor(Theme.inkFaint))
                .textFieldStyle(OnbFieldStyle())
            TextField("", text: $last,
                      prompt: Text("Last Name").foregroundColor(Theme.inkFaint))
                .textFieldStyle(OnbFieldStyle())
            if method == "phone" {
                TextField("", text: $email,
                          prompt: Text("Email Address").foregroundColor(Theme.inkFaint))
                    .keyboardType(.emailAddress)
                    .textInputAutocapitalization(.never)
                    .autocorrectionDisabled()
                    .textFieldStyle(OnbFieldStyle())
            }
            PrimaryButton(title: "Continue", enabled: detailsValid) { completeDetails() }
        }
    }

    private var loadingStep: some View {
        VStack(spacing: 14) {
            ProgressView().tint(Theme.violet).scaleEffect(1.3)
            Text("Connecting to \(provider == "apple" ? "Apple" : "Google")…")
                .font(Theme.inter(14, .semibold)).foregroundColor(Theme.inkSoft)
        }
        .padding(.top, 2)
    }

    private var successStep: some View {
        VStack(spacing: 12) {
            Label("Verified", systemImage: "checkmark.shield")
                .font(Theme.inter(11, .black))
                .textCase(.uppercase)
                .foregroundColor(Theme.emerald600)
                .padding(.horizontal, 12).padding(.vertical, 5)
                .background(Theme.tintEmerald)
                .overlay(Capsule().stroke(Theme.tintEmeraldB, lineWidth: 1))
                .clipShape(Capsule())

            Text("You're all set!").font(Theme.head(30)).foregroundColor(Theme.ink)
            Text("Byte can't wait to teach you. Let's dive in.")
                .font(Theme.body(14)).foregroundColor(Theme.inkSoft)
                .multilineTextAlignment(.center)
        }
    }

    // MARK: Success particle burst

    private var successBurst: some View {
        let colors: [Color] = [Theme.violet, Color(hex: 0x22D3EE), Theme.violet500,
                               Theme.emerald, Color(hex: 0xEC4899), Color(hex: 0xF59E0B)]
        return ZStack {
            ForEach(0..<22, id: \.self) { i in
                let angle = Double(i) / 22 * 2 * .pi
                // deterministic pseudo-random spread, mirrors web's 90 + rand*50
                let dist = 90.0 + Double((i * 37) % 50)
                Circle()
                    .fill(colors[i % colors.count])
                    .frame(width: 8, height: 8)
                    .offset(x: burst ? cos(angle) * dist : 0,
                            y: burst ? sin(angle) * dist : 0)
                    .opacity(burst ? 0 : 1)
                    .scaleEffect(burst ? 0 : 1)
            }
        }
        .onAppear {
            burst = false
            withAnimation(.easeOut(duration: 0.9)) { burst = true }
        }
    }

    // MARK: Flow

    private func go(_ s: Step) { withAnimation { step = s } }

    private func startOAuth() {
        go(.loading)
        // Simulated OAuth → mock account → straight to success (web skips details).
        email = provider == "apple" ? "you@icloud.com" : "you@gmail.com"
        first = "Learner"; last = ""
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            finish(name: "Learner", phone: nil)
        }
    }

    private func sendCode() {
        otp = ""
        resend = 30
        go(.otp)
    }

    private func completeDetails() {
        guard detailsValid else { return }
        let name = "\(first.trimmingCharacters(in: .whitespaces)) \(last.trimmingCharacters(in: .whitespaces))"
            .trimmingCharacters(in: .whitespaces)
        finish(name: name, phone: method == "phone" ? "\(cc) \(phone)" : nil)
    }

    private func finish(name: String, phone: String?) {
        go(.success)
        // Show the celebration, then flip onboarded (unmounts this view).
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.2) {
            Task {
                await store.completeOnboarding(
                    email: email.trimmingCharacters(in: .whitespaces),
                    name: name, method: method, phone: phone)
            }
        }
    }

    // MARK: Building blocks

    @ViewBuilder
    private func stepScaffold<C: View>(title: String, subtitle: String,
                                       onBack: (() -> Void)?,
                                       @ViewBuilder content: () -> C) -> some View {
        VStack(spacing: 22) {
            if let onBack {
                HStack {
                    Button(action: onBack) {
                        HStack(spacing: 4) {
                            Image(systemName: "arrow.left").font(.system(size: 13, weight: .bold))
                            Text("Back").font(Theme.inter(12, .bold))
                        }
                        .foregroundColor(Theme.inkFaint)
                    }
                    Spacer()
                }
            }
            VStack(spacing: 6) {
                Text(title).font(Theme.head(24)).foregroundColor(Theme.ink)
                    .multilineTextAlignment(.center)
                Text(subtitle).font(Theme.body(14)).foregroundColor(Theme.inkSoft)
                    .multilineTextAlignment(.center)
            }
            content()
        }
    }

    private func authButton<L: View>(bg: Color, fg: Color, border: Color,
                                     action: @escaping () -> Void,
                                     @ViewBuilder label: () -> L) -> some View {
        Button(action: action) {
            label()
                .font(Theme.inter(14, .bold))
                .foregroundColor(fg)
                .frame(maxWidth: .infinity).padding(.vertical, 14)
                .background(bg)
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(border, lineWidth: 1))
        }
        .buttonStyle(.plain)
    }

    private var divider: some View {
        HStack(spacing: 12) {
            Rectangle().fill(Theme.border).frame(height: 1)
            Text("or").font(Theme.outfit(10, .bold))
                .textCase(.uppercase)
                .foregroundColor(Theme.inkFaint)
            Rectangle().fill(Theme.border).frame(height: 1)
        }
        .padding(.vertical, 2)
    }
}

/// Port of web ThemeToggle.js — white circle, moon in light mode / sun in dark.
struct ThemeToggleButton: View {
    @EnvironmentObject var store: AppStore
    var body: some View {
        let dark = store.theme == "dark"
        Button {
            withAnimation(.easeInOut(duration: 0.25)) {
                store.theme = dark ? "light" : "dark"
            }
        } label: {
            Image(systemName: dark ? "sun.max" : "moon")
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(Theme.slate700)
                .frame(width: 36, height: 36)
                .background(Theme.card)
                .clipShape(Circle())
                .overlay(Circle().stroke(Theme.border, lineWidth: 1))
                .shadow(color: .black.opacity(0.06), radius: 3, y: 1)
        }
        .buttonStyle(.plain)
    }
}

/// Official multi-colour Google "G" mark — rasterised from the same SVG the web uses.
private struct GoogleGlyph: View {
    var body: some View {
        Image("google-g").resizable().interpolation(.high).scaledToFit()
    }
}

/// White rounded input field (light onboarding surfaces).
struct OnbFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .font(Theme.inter(14, .semibold))
            .foregroundColor(Theme.slate800)
            .tint(Theme.violet)
            .padding(.horizontal, 16).padding(.vertical, 12)
            .background(Theme.card)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(Theme.border, lineWidth: 1))
    }
}

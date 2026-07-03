import SwiftUI

/// Ask-Byte chat. Streams replies from the backend proxy (/api/chat) so the
/// OpenAI key never ships in the app. The assistant avatar is ALWAYS the
/// "talking" Byte symbol (never the waving hi-mascot on answers).
struct ByteChatView: View {
    @EnvironmentObject var store: AppStore
    @Environment(\.dismiss) private var dismiss

    @State private var messages: [ChatMessage] = []
    @State private var input = ""
    @State private var loading = false
    @State private var streaming = false

    private let suggestions = [
        "What is AI, really?",
        "Explain machine learning simply",
        "AI vs ML — what\u{2019}s the difference?",
        "Give me a tip to remember this",
    ]

    var body: some View {
        VStack(spacing: 0) {
            header
            messageList
            inputBar
        }
        .background(Theme.bg)
    }

    // MARK: header

    private var header: some View {
        HStack(spacing: 12) {
            Mascot(mood: .talking, size: 40, glow: false)
            VStack(alignment: .leading, spacing: 2) {
                Text("Ask Byte")
                    .font(Theme.outfit(14, .heavy))
                    .foregroundColor(Theme.ink)
                HStack(spacing: 5) {
                    Circle().fill(Theme.emerald).frame(width: 6, height: 6)
                    Text("Your AI tutor")
                        .font(Theme.outfit(11, .bold))
                        .foregroundColor(Theme.emerald)
                }
            }
            Spacer()
            Button { dismiss() } label: {
                Image(systemName: "xmark")
                    .font(.system(size: 15, weight: .bold))
                    .foregroundColor(Theme.inkSoft)
                    .frame(width: 36, height: 36)
                    .background(Theme.slate50)
                    .clipShape(Circle())
                    .overlay(Circle().stroke(Theme.slate200, lineWidth: 1))
            }
        }
        .padding(.horizontal, 16).padding(.vertical, 12)
        .background(Theme.card)
        .overlay(Rectangle().fill(Theme.slate100).frame(height: 1), alignment: .bottom)
    }

    // MARK: messages

    private var messageList: some View {
        ScrollViewReader { proxy in
            ScrollView {
                LazyVStack(spacing: 14) {
                    if messages.isEmpty && !loading {
                        emptyState
                    }
                    ForEach(Array(messages.enumerated()), id: \.element.id) { idx, m in
                        if m.role == "user" {
                            userBubble(m)
                        } else {
                            byteBubble(m, isLast: idx == messages.count - 1)
                        }
                    }
                    if loading {
                        thinkingRow
                    }
                    Color.clear.frame(height: 1).id("bottom")
                }
                .padding(.horizontal, 16).padding(.vertical, 16)
            }
            .onChange(of: messages.count) { _ in scrollToBottom(proxy) }
            .onChange(of: loading) { _ in scrollToBottom(proxy) }
            .onChange(of: streaming) { _ in scrollToBottom(proxy) }
        }
    }

    private func scrollToBottom(_ proxy: ScrollViewProxy) {
        withAnimation(.easeOut(duration: 0.25)) { proxy.scrollTo("bottom", anchor: .bottom) }
    }

    private var emptyState: some View {
        VStack(spacing: 0) {
            Mascot(mood: .wave, size: 92)
            Text("Hi, I\u{2019}m Byte!")
                .font(Theme.outfit(16, .heavy))
                .foregroundColor(Theme.ink)
                .padding(.top, 8)
            Text("Ask me anything about AI, data, or your lessons.")
                .font(Theme.inter(14, .medium))
                .foregroundColor(Theme.inkSoft)
                .multilineTextAlignment(.center)
                .padding(.top, 4).padding(.horizontal, 16)

            VStack(spacing: 10) {
                ForEach(suggestions, id: \.self) { s in
                    Button { send(s) } label: {
                        Text(s)
                            .font(Theme.outfit(12, .bold))
                            .foregroundColor(Theme.violet500)
                            .padding(.horizontal, 14).padding(.vertical, 9)
                            .background(Theme.tintViolet)
                            .clipShape(Capsule())
                            .overlay(Capsule().stroke(Theme.tintVioletB, lineWidth: 1))
                            .fixedSize()
                    }
                }
            }
            .padding(.top, 20)
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 24).padding(.bottom, 8)
    }

    private func userBubble(_ m: ChatMessage) -> some View {
        HStack {
            Spacer(minLength: 48)
            Text(m.content)
                .font(Theme.inter(14, .medium))
                .foregroundColor(.white)
                .padding(.horizontal, 14).padding(.vertical, 10)
                .background(Theme.violet)
                .clipShape(RoundedCorners(radius: 18, corners: [.topLeft, .topRight, .bottomLeft]))
        }
    }

    // Assistant avatar is ALWAYS the talking mascot (never wave).
    private func byteBubble(_ m: ChatMessage, isLast: Bool) -> some View {
        HStack(alignment: .bottom, spacing: 8) {
            Mascot(mood: .talking, size: 34, glow: false)
            HStack(alignment: .bottom, spacing: 2) {
                Text(m.content)
                    .font(Theme.inter(14, .medium))
                    .foregroundColor(Theme.ink)
                    .fixedSize(horizontal: false, vertical: true)
                if streaming && isLast {
                    CaretView()
                }
            }
            .padding(.horizontal, 14).padding(.vertical, 10)
            .background(Theme.card)
            .clipShape(RoundedCorners(radius: 18, corners: [.topLeft, .topRight, .bottomRight]))
            .overlay(RoundedCorners(radius: 18, corners: [.topLeft, .topRight, .bottomRight])
                .stroke(Theme.border, lineWidth: 1))
            Spacer(minLength: 48)
        }
    }

    private var thinkingRow: some View {
        HStack(alignment: .bottom, spacing: 8) {
            Mascot(mood: .thinking, size: 34, glow: false)
            ThinkingDots()
                .padding(.horizontal, 16).padding(.vertical, 10)
                .background(Theme.card)
                .clipShape(RoundedCorners(radius: 18, corners: [.topLeft, .topRight, .bottomRight]))
                .overlay(RoundedCorners(radius: 18, corners: [.topLeft, .topRight, .bottomRight])
                    .stroke(Theme.border, lineWidth: 1))
            Spacer(minLength: 48)
        }
    }

    // MARK: input

    private var inputBar: some View {
        HStack(spacing: 10) {
            TextField("Ask Byte anything…", text: $input)
                .font(Theme.inter(14, .medium))
                .padding(.horizontal, 16).padding(.vertical, 12)
                .background(Theme.slate50).clipShape(Capsule())
                .overlay(Capsule().stroke(Theme.slate200, lineWidth: 1))
                .onSubmit { send() }
            Button { send() } label: {
                Image(systemName: "paperplane.fill")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundColor(.white)
                    .frame(width: 44, height: 44).background(Theme.violet).clipShape(Circle())
            }
            .disabled(sendDisabled)
            .opacity(sendDisabled ? 0.4 : 1)
        }
        .padding(.horizontal, 12).padding(.vertical, 10)
        .background(Theme.card)
        .overlay(Rectangle().fill(Theme.slate100).frame(height: 1), alignment: .top)
    }

    private var sendDisabled: Bool {
        input.trimmingCharacters(in: .whitespaces).isEmpty || loading || streaming
    }

    // MARK: send

    private func send(_ text: String? = nil) {
        let content = (text ?? input).trimmingCharacters(in: .whitespaces)
        guard !content.isEmpty, !loading, !streaming else { return }
        input = ""
        messages.append(ChatMessage(role: "user", content: content))
        loading = true
        let history = messages
        var started = false

        Task {
            await API.chatStream(history) { full in
                Task { @MainActor in
                    if !started {
                        started = true; loading = false; streaming = true
                        messages.append(ChatMessage(role: "assistant", content: full))
                    } else {
                        messages[messages.count - 1].content = full
                    }
                }
            }
            await MainActor.run { loading = false; streaming = false }
        }
    }
}

/// Three bouncing dots shown while Byte is thinking.
private struct ThinkingDots: View {
    @State private var phase = false
    var body: some View {
        HStack(spacing: 5) {
            ForEach(0..<3, id: \.self) { i in
                Circle().fill(Theme.violet400)
                    .frame(width: 6, height: 6)
                    .offset(y: phase ? -4 : 0)
                    .animation(.easeInOut(duration: 0.6).repeatForever()
                        .delay(Double(i) * 0.15), value: phase)
            }
        }
        .onAppear { phase = true }
    }
}

/// Blinking caret shown at the end of the streaming assistant message.
private struct CaretView: View {
    @State private var on = true
    var body: some View {
        Rectangle().fill(Theme.violet500)
            .frame(width: 2, height: 14)
            .opacity(on ? 1 : 0)
            .animation(.easeInOut(duration: 0.8).repeatForever(), value: on)
            .onAppear { on = false }
    }
}

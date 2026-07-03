import Foundation

/// Talks to the AIBites FastAPI backend. Base URL is configurable so you can
/// point at localhost in the simulator or a deployed host later.
enum API {
    /// Simulator can reach the Mac's localhost directly. On a physical device,
    /// change this to your Mac's LAN IP (e.g. http://192.168.1.20:8000).
    static var baseURL = "http://127.0.0.1:8000"

    struct APIError: Error { let message: String }

    // MARK: Curriculum / lessons (bundled JSON is the offline fallback)

    static func curriculum() async -> Curriculum {
        if let c: Curriculum = try? await get("/api/curriculum") { return c }
        return bundled("index.json") ?? Curriculum(app: "AIBites", units: [])
    }

    static func lesson(_ id: String) async -> Lesson? {
        if let l: Lesson = try? await get("/api/lessons/\(id)") { return l }
        return bundled("\(id).json")
    }

    // MARK: Auth / progress

    static func auth(email: String, name: String, method: String, phone: String?) async throws -> AuthResponse {
        try await post("/api/auth", body: [
            "email": email, "name": name, "authMethod": method,
            "phone": phone as Any,
        ])
    }

    static func putProgress(_ p: Progress, token: String) async throws -> Progress {
        let body: [String: Any] = [
            "xp": p.xp, "streak": p.streak,
            "lastLessonDate": p.lastLessonDate as Any,
            "currentLesson": p.currentLesson,
            "completedLessons": p.completedLessons,
            "lessonProgress": p.lessonProgress.mapValues {
                ["segmentIndex": $0.segmentIndex, "exerciseIndex": $0.exerciseIndex]
            },
        ]
        return try await send("PUT", "/api/progress", body: body, token: token)
    }

    // MARK: - Low-level helpers

    private static func get<T: Decodable>(_ path: String) async throws -> T {
        guard let url = URL(string: baseURL + path) else { throw APIError(message: "bad url") }
        let (data, resp) = try await URLSession.shared.data(from: url)
        guard (resp as? HTTPURLResponse)?.statusCode == 200 else { throw APIError(message: "http") }
        return try JSONDecoder().decode(T.self, from: data)
    }

    private static func post<T: Decodable>(_ path: String, body: [String: Any]) async throws -> T {
        try await send("POST", path, body: body, token: nil)
    }

    private static func send<T: Decodable>(_ method: String, _ path: String,
                                           body: [String: Any], token: String?) async throws -> T {
        guard let url = URL(string: baseURL + path) else { throw APIError(message: "bad url") }
        var req = URLRequest(url: url)
        req.httpMethod = method
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        if let token { req.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization") }
        req.httpBody = try JSONSerialization.data(withJSONObject: body)
        let (data, resp) = try await URLSession.shared.data(for: req)
        guard (resp as? HTTPURLResponse)?.statusCode == 200 else {
            throw APIError(message: "http \((resp as? HTTPURLResponse)?.statusCode ?? -1)")
        }
        return try JSONDecoder().decode(T.self, from: data)
    }

    private static func bundled<T: Decodable>(_ file: String) -> T? {
        let name = (file as NSString).deletingPathExtension
        guard let url = Bundle.main.url(forResource: name, withExtension: "json"),
              let data = try? Data(contentsOf: url) else { return nil }
        return try? JSONDecoder().decode(T.self, from: data)
    }

    // MARK: - Streaming chat (SSE from /api/chat)

    /// Streams Byte's reply. `onDelta` fires per token chunk with the full text so far.
    static func chatStream(_ messages: [ChatMessage],
                           onDelta: @escaping (String) -> Void) async {
        guard let url = URL(string: baseURL + "/api/chat") else { return }
        var req = URLRequest(url: url)
        req.httpMethod = "POST"
        req.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let payload = ["messages": messages.map { ["role": $0.role, "content": $0.content] }]
        req.httpBody = try? JSONSerialization.data(withJSONObject: payload)

        var full = ""
        do {
            let (bytes, resp) = try await URLSession.shared.bytes(for: req)
            guard (resp as? HTTPURLResponse)?.statusCode == 200 else {
                onDelta("Hmm, I couldn't reach my brain just now. Give it another try in a moment!")
                return
            }
            for try await line in bytes.lines {
                let t = line.trimmingCharacters(in: .whitespaces)
                guard t.hasPrefix("data:") else { continue }
                let body = String(t.dropFirst(5)).trimmingCharacters(in: .whitespaces)
                if body == "[DONE]" { break }
                if let d = body.data(using: .utf8),
                   let obj = try? JSONSerialization.jsonObject(with: d) as? [String: Any],
                   let delta = obj["delta"] as? String {
                    full += delta
                    onDelta(full)
                }
            }
        } catch {
            if full.isEmpty {
                onDelta("I'm having trouble connecting right now. Check your internet and try again!")
            }
        }
    }
}

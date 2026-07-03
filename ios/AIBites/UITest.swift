import Foundation

/// DEBUG-only launch-environment harness for deterministic screenshot capture.
/// Set `UITEST_*` variables (via `SIMCTL_CHILD_UITEST_*` on `simctl launch`) to
/// jump the app straight to a given screen state. Inert in release builds.
enum UITest {
    #if DEBUG
    static var active: Bool {
        ProcessInfo.processInfo.environment.keys.contains { $0.hasPrefix("UITEST_") }
    }
    static func str(_ key: String) -> String? {
        ProcessInfo.processInfo.environment["UITEST_" + key]
    }
    #else
    static var active: Bool { false }
    static func str(_ key: String) -> String? { nil }
    #endif

    static func flag(_ key: String) -> Bool { str(key) == "1" }
    static func int(_ key: String) -> Int? { str(key).flatMap(Int.init) }
}

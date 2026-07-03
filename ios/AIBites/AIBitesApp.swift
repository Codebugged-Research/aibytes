import SwiftUI

@main
struct AIBitesApp: App {
    @StateObject private var store = AppStore()
    @State private var showSplash = !UITest.flag("SKIP_SPLASH")

    var body: some Scene {
        WindowGroup {
            ZStack {
                Theme.bg.ignoresSafeArea()

                if showSplash {
                    SplashView { showSplash = false }
                        .transition(.opacity)
                } else if !store.onboarded {
                    OnboardingView()
                        .environmentObject(store)
                        .transition(.opacity)
                } else {
                    RootTabView()
                        .environmentObject(store)
                        .transition(.opacity)
                }
            }
            .animation(.easeInOut(duration: 0.4), value: showSplash)
            .animation(.easeInOut(duration: 0.4), value: store.onboarded)
            .task { await store.loadCurriculum() }
            .preferredColorScheme(store.theme == "dark" ? .dark : .light)
        }
    }
}

# AIBites — Native iOS App (SwiftUI)

Native Swift/SwiftUI rewrite of the AIBites MVP. Talks to the FastAPI + PostgreSQL
backend (curriculum, lessons, auth, progress, and the OpenAI chat proxy so the
API key stays server-side).

---

## What's here

```
ios/
├── project.yml              # XcodeGen project definition
├── AIBites.xcodeproj        # generated Xcode project (regenerate with `xcodegen`)
└── AIBites/
    ├── AIBitesApp.swift      # @main entry, splash→onboarding→tabs routing
    ├── Models.swift          # Codable models (curriculum, lesson, auth, progress, chat)
    ├── API.swift             # backend client + SSE streaming chat
    ├── AppStore.swift        # ObservableObject state: auth, progress, streak logic
    ├── DesignSystem.swift    # colors, fonts, PrimaryButton, CardBox, ProgressBar
    ├── Mascot.swift          # Byte mascot (blink + float) + MascotCoach bubble
    ├── Narrator.swift        # native AVSpeechSynthesizer TTS + HTML→text
    ├── SplashView.swift
    ├── OnboardingView.swift  # Google/Apple/phone/email → OTP → name → success
    ├── RootTabView.swift      # Home/Path/Leaderboard/Account + floating Ask-Byte
    ├── HomeView.swift         # greeting, XP/level, streak, weekly habit tracker
    ├── PathView.swift         # units + lesson locking
    ├── LeaderboardView.swift
    ├── ProfileView.swift      # stats, reset progress, log out
    ├── LessonPlayerView.swift # lesson engine (teach → practice → boss → complete)
    ├── LessonCards.swift      # teach card + all 4 exercise types
    ├── ByteChatView.swift     # chat via backend streaming proxy
    ├── Assets.xcassets/       # 10 mascot images + accent color
    ├── Lessons/               # 16 lesson JSON files (offline fallback)
    └── Info.plist
```

---

## Run it (one-time setup)

### 1. Install Xcode
From the **Mac App Store** (free, ~7 GB). After install, run once:
```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

### 2. Start the backend (chat + progress + Postgres)
```bash
# Postgres (once): brew services start postgresql@16 && createdb aibites
cd backend
./venv/bin/uvicorn server:app --host 127.0.0.1 --port 8000
```
The OpenAI key lives in `backend/.env` (`OPENAI_API_KEY=…`) — never in the app.

### 3. Open + run the app
```bash
cd ios
open AIBites.xcodeproj
```
In Xcode: pick an **iPhone 15/16 simulator** → press **▶ (Run)**.

> The simulator reaches the Mac's `localhost:8000` directly, so it works as-is.
> **On a physical iPhone:** set `API.baseURL` in `API.swift` to your Mac's LAN IP
> (e.g. `http://192.168.1.20:8000`) and sign the app with your Apple ID under
> *Signing & Capabilities*.

### Regenerating the project
If you add/rename Swift files, regenerate the `.xcodeproj`:
```bash
brew install xcodegen   # once
cd ios && xcodegen generate
```

---

## Feature parity with the web MVP

| MVP feature | iOS status |
|---|---|
| Splash | ✅ `SplashView` |
| Onboarding (Google/Apple/phone/email, OTP, first+last name) | ✅ `OnboardingView` (OAuth/OTP simulated) |
| Home: greeting coach, XP/level, streak, weekly habit tracker | ✅ `HomeView` |
| Path with sequential lesson locking | ✅ `PathView` |
| Lesson player: teach cards (hook/definition/analogy/example/mythbust/visual) | ✅ `LessonCards` |
| Exercises: true_false, multiple_choice, fill_blank, spot_the_ai | ✅ all four |
| Hearts, earned XP, completion screen | ✅ `LessonPlayerView` |
| Card narration (opt-in) | ✅ native `AVSpeechSynthesizer` (female voice) |
| Leaderboard | ✅ `LeaderboardView` (live user XP vs demo peers) |
| Profile: stats, reset, log out | ✅ `ProfileView` |
| Ask-Byte chat (streaming, mascot = talking symbol) | ✅ `ByteChatView` via backend proxy |
| Progress persistence | ✅ UserDefaults + Postgres sync |

## Notes / deliberate simplifications
- **OAuth/OTP are simulated** client-side (any 6 digits verify), same as the MVP demo. Wiring real Google/Apple sign-in + SMS is a backend follow-up.
- **Leaderboard peers are static demo data**; only your row is live. A real leaderboard needs a backend endpoint.
- **Chat key is server-side** (in `backend/.env`) — the app talks only to `/api/chat`.

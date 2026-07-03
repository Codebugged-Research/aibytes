# Pixel-parity pass: web → iOS (login → assessment)

Method: headless Chrome at 402×874@3x (identical to iPhone 17 sim) drove the real
web flow; simulator captured the same 17 states via a DEBUG launch-env harness.
Side-by-side pairs in scratchpad/pairs/.

## Discrepancies found (web = source of truth)

### Onboarding (all steps)
- [x] iOS state-jump harness froze step transitions mid-flight → set initial @State instead of onAppear
- [x] Buttons/labels use Outfit — web body font is Inter (headings only are Outfit)
- [x] Google icon: single-color G → multicolor brand G (web SVG)
- [x] Phone/email icons filled → outlined (web lucide), back arrow chevron → arrow
- [x] Phone step: separate "+91" box → web joined pill: flag + chevron + divider + input
- [x] OTP digits font/size, focus ring on first empty box
- [x] Email placeholder rendered blue → slate-400 prompt color
- [x] "Welcome to AIBites" — AIBites gradient (#6248FF→#8B5CF6) not flat violet
- [x] Success burst particle count/distance/duration matched to web (22, 90–140, 0.9s)
- [ ] Theme toggle (moon, top-right) exists on web onboarding — NOT ported (needs full dark theme; flagged)

### Mascot
- [x] Glow far too strong → web radial (124,92,255,0.38→0 at 68%), inset 4%, blur 8
- [x] Coach bubble violet tint → white bg + violet-100 border + violet shadow

### Home / shell
- [x] Bell icon filled + orange dot → outline bell + emerald dot w/ white ring
- [x] Tagline font Inter → Outfit semibold (web sets Outfit explicitly)
- [x] Nav icons 24 → 26
- [x] Inter for all non-heading labels (stat values/labels, Habit Tracker, AI Course, Let's start)
- [x] Progress bars: gradient → solid (web violet-600 home, #6248FF lesson)

### Path
- [x] Unit icon container radius 14 → 12 (web rounded-xl)
- [x] Current-node brain glyph: SF brain.head.profile (white circle look) → "brain" outline
- [x] Locked node lock.fill → lock (outline)
- [x] Non-heading fonts Outfit → Inter (tier, title, LESSON N, lesson title, badges)

### Lesson player
- [x] Content vertically centered → web top-aligned (pt-6)
- [x] Footer floats with bottom gap → full-bleed into home-indicator area + top border
- [x] Wrong-answer reveal also highlighted the correct option → web highlights ONLY the selection
- [x] Wrong-answer feedback: explanation beside mascot → below the row, full width
- [x] Completion: "Claim reward" → web's two buttons (Continue Learning dark / Back to Home secondary)
- [x] Fail screen: violet Try again → web dark primary w/ rotate icon
- [x] Feedback colors: emerald-700/red-600, exercise card radius 20→16 & padding 20
- [x] Option text colors per state (slate-700 / violet-900 / emerald-900 / red-950), dot border slate-300
- [x] Prompt/labels/buttons Outfit → Inter; chips capsule → rounded-8
- [x] Progress bar solid #6248FF

### Splash
- [x] iOS splash was a different design (violet mascot hero) → rewrote SplashView.swift as a
      1:1 port of SplashScreen.js: white logo card + spinning dashed rings + breathing blue
      glow, Byte peeking from the corner, "AI"(blue-300)+"Bites"(white) 48px wordmark, typing
      tagline, 176px loading bar with % → "Ready!", cycling AI tips, 5 pulsing dots

## Review

NOTE: per user feedback, lesson content is vertically centred between header and footer on iOS (the web frame is shorter, so its card visually fills; literal top-alignment left a large gap on the taller device).

Re-captured all 17 screens after fixes — pairs (web left / iOS right) saved in
`tasks/parity-pairs/`. Screens now match the web within font-rendering tolerance.

Known/accepted differences:
- iOS shows the OS status bar + home indicator (web mobile viewport has neither), so
  content sits ~15–25 pt lower on screens that respect the safe area. Onboarding now
  ignores safe areas to centre exactly like the web.
- Web onboarding has a working dark-mode toggle (moon, top-right). Not ported — the iOS
  theme is light-only; porting means building the full dark palette. Flagged for a decision.
- SF Symbols vs lucide: a few glyphs are near-equivalents, not identical outlines
  (volume-x, route tab icon, shield-check).
- Web splash barely renders in `npm start` builds (React StrictMode double-effect marks it
  as shown) — iOS port was verified against SplashScreen.js source instead.

Tooling added (DEBUG-only, inert in Release): `ios/AIBites/UITest.swift` + `UITEST_*`
launch-env hooks in AIBitesApp/AppStore/OnboardingView/RootTabView/LessonPlayerView allow
jumping straight to any screen state for screenshot capture
(`SIMCTL_CHILD_UITEST_STEP=otp xcrun simctl launch booted com.aibites.app`).
Capture scripts (headless-Chrome CDP driver for web, simctl driver for iOS) live in the
session scratchpad: capture-web.mjs / capture-ios.sh / cdp.mjs.
project.yml: added SWIFT_ACTIVE_COMPILATION_CONDITIONS=DEBUG for Debug config (was missing,
so `#if DEBUG` code never compiled).

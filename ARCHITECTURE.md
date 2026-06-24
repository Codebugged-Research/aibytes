# AIBites — Technical Architecture

## Overview

AIBites is a Duolingo-style mobile web app for learning AI/data concepts. It is a **100% frontend SPA** — lesson content is served as static JSON files from the public folder; there is no active backend dependency.

---

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| UI Framework | React | 19 |
| Routing | React Router DOM | 7 |
| Animation | Framer Motion | 11 |
| Styling | Tailwind CSS | 3 |
| Icons | Lucide React | 0.516 |
| Build Tool | CRACO (on top of CRA) | 7 |
| Data Fetching | Native `fetch` | — |
| Server-side Query Setup | TanStack Query (QueryClient only) | 5 |

---

## Directory Structure

```
aibytes/
├── frontend/
│   ├── public/
│   │   └── lessons/              # Static lesson content (16 JSON files)
│   │       ├── index.json        # Curriculum index (units + lesson metadata)
│   │       ├── u0-l1.json … u0-l5.json
│   │       ├── u1-l1.json … u1-l5.json
│   │       └── u2-l1.json … u2-l5.json
│   └── src/
│       ├── App.js                # Root: error boundary, router, splash gate
│       ├── index.js              # ReactDOM root, QueryClientProvider
│       ├── components/
│       │   ├── Layout.js         # Shell: top header + bottom nav + <Outlet>
│       │   ├── PhoneWrapper.js   # Responsive: phone chrome (desktop) / full-screen (mobile)
│       │   ├── SplashScreen.js   # Animated intro with particle canvas
│       │   ├── Skeleton.js       # Loading shimmer primitives
│       │   ├── StreakUnfreeze.js # Streak recovery modal
│       │   ├── StartLearningTransition.js  # Animated lesson entry transition
│       │   └── ui-components.js  # Button, Card, ProgressBar primitives
│       ├── pages/
│       │   ├── Home.js           # Dashboard: XP bar, stats, habit tracker, progress
│       │   ├── Path.js           # Multi-unit lesson map
│       │   ├── LessonPlayer.js   # Core lesson engine (teach + exercise + completion)
│       │   ├── Profile.js        # User stats + progress reset
│       │   ├── Activity.js       # Activity feed
│       │   └── Leaderboard.js    # Leaderboard
│       ├── hooks/
│       │   ├── useData.js        # Data fetching: curriculum + individual lessons
│       │   └── useProgress.js    # Reactive XP + streak from localStorage
│       └── utils/
│           ├── storage.js        # localStorage read/write (all user state)
│           └── icons.js          # Emoji → Lucide icon mapping
├── lessons/                      # Source of truth for lesson JSON (synced to public/)
└── backend/                      # FastAPI server (not active — kept for future use)
    └── data/                     # Synced copy of lesson JSON files
```

---

## Application Shell

```
PhoneWrapper
└── App (ErrorBoundary + BrowserRouter)
    ├── SplashScreen          (session-once, blocks routes until dismissed)
    └── Routes
        ├── Layout            (/ /path /activity /leaderboard /profile)
        │   ├── Header        (logo + bell)
        │   ├── <Outlet>      (scrollable content area)
        │   └── BottomNav     (4-tab nav)
        └── LessonPlayer      (/lesson/:lessonId — full-screen, outside Layout)
```

**PhoneWrapper** is responsive:
- **≥ 640 px (desktop/tablet):** renders a `375×780px` phone frame with Dynamic Island, status bar, and home indicator — useful for demos.
- **< 640 px (real mobile):** skips all chrome and renders the app full-screen.

---

## Data Layer

### Lesson Content (Static JSON)

All content lives in `frontend/public/lessons/`. No network call to an external server.

**`index.json`** — curriculum map fetched once on app load:
```json
{
  "units": [
    { "id": 0, "title": "Orientation", "tier": "Foundations", "tierIcon": "🥉",
      "lessons": [{ "id": "u0-l1", "title": "...", "icon": "🧠" }, ...] },
    { "id": 1, "title": "Data Foundations", ... },
    { "id": 2, "title": "Data Analytics", ... }
  ]
}
```

**`u{unit}-l{lesson}.json`** — full lesson content fetched when a lesson is opened:
```json
{
  "id": "u0-l1",
  "unit": 0,
  "day": 1,
  "tier": "Foundations",
  "title": "What is AI, really?",
  "icon": "🧠",
  "concept": "...",
  "xp": 15,
  "hearts": 3,
  "estMinutes": 7,
  "segments": [ ... ]
}
```

### Segment & Exercise Schema

Each lesson has a `segments` array. The LessonPlayer iterates segments in order:

| Segment type | Description |
|---|---|
| `warmup` | 1 recap exercise before teaching begins |
| `teach` | Array of `cards` (hook, definition, analogy, example, mythbust, visual/compare) |
| `practice` | Array of exercises |
| `boss` | Final challenge exercise — higher XP |

Exercise types used across lessons:

| Type | Description |
|---|---|
| `multiple_choice` | Pick one correct option |
| `true_false` | Binary true/false |
| `fill_blank` | Word bank, tap to fill a sentence gap |
| `spot_the_ai` | Identify which option is an AI use-case |

### Data Fetching Hooks (`src/hooks/useData.js`)

```
useCurriculum()
  → fetch /lessons/index.json
  → fallback: hardcoded 3-unit, 15-lesson object
  → returns { curriculum, loading }

useLesson(lessonId)
  → fetch /lessons/{lessonId}.json
  → returns { lesson, loading, error }
```

No caching layer — each lesson is fetched fresh when its route mounts. TanStack Query's `QueryClient` is wired at the root but not yet used in these hooks.

---

## State Management

All user state lives in **`localStorage`** — no global store (no Redux, Zustand, or Context).

| Key | Type | Purpose |
|---|---|---|
| `aiquest_xp` | number | Total XP accumulated |
| `aiquest_streak` | number | Current day streak |
| `aiquest_last_date` | string | Date of last lesson (for streak logic) |
| `aiquest_completed` | JSON array | List of completed lesson IDs |
| `aiquest_current` | string | Next lesson ID to continue |
| `aiquest_lesson_progress` | JSON object | Per-lesson segment/exercise index |

**`useProgress` hook** provides reactive `xp` and `streak` by reading localStorage on mount and exposing a `refreshProgress()` function that pages call after awarding XP.

---

## Curriculum Structure

| Unit | ID | Tier | Lessons |
|---|---|---|---|
| Orientation | 0 | Foundations 🥉 | u0-l1 → u0-l5 |
| Data Foundations | 1 | Data Foundations 📦 | u1-l1 → u1-l5 |
| Data Analytics | 2 | Data Analytics 📊 | u2-l1 → u2-l5 |

**15 lessons total**, 5 per unit, sequential within unit. All lessons are currently unlocked (no prerequisite gate active).

---

## LessonPlayer Engine

The core gameplay loop lives entirely in `LessonPlayer.js`.

```
Lesson loaded
    │
    ▼
currentSegment = segments[currentSegmentIndex]
    │
    ├── type === 'teach'
    │       Cards rendered one at a time (TeachCard)
    │       CONTINUE button advances card index → then next segment
    │
    └── type === 'practice' | 'warmup' | 'boss'
            ExerciseCard rendered
            User selects answer → CHECK reveals correct/wrong
            Wrong: loses 1 heart, screen shake, red flash
            Correct: gains XP, particle burst, green flash, combo streak
            GOT IT / CONTINUE → next exercise → next segment
    │
    ▼
Last segment complete
    → markLessonComplete(lessonId, earnedXP)   [localStorage]
    → setCurrentLesson(nextLessonId)           [localStorage]
    → Completion screen (XP summary, concept, hearts remaining)
```

**Cross-unit navigation** after completing the last lesson in a unit automatically advances to the first lesson of the next unit (`u{n}-l5` → `u{n+1}-l1`).

---

## Gamification System

| Mechanic | Implementation |
|---|---|
| **XP** | Awarded per correct exercise (2 XP default, 5 XP boss). Stored cumulatively. Level = `floor(xp / 20) + 1` |
| **Hearts** | 3 per lesson session, decremented on wrong answers. Lives in component state only (not persisted) |
| **Streak** | Incremented when a lesson is completed on a new calendar day. Breaks if a day is missed |
| **Streak Unfreeze** | Modal (`StreakUnfreeze.js`) lets user recover a broken streak at a cost (+15 XP consumed) |
| **Combo** | Correct-answer streak tracked in LessonPlayer state; badge shown at 2+ in a row |

---

## Routing

| Path | Component | Layout |
|---|---|---|
| `/` | `Home` | Inside Layout |
| `/path` | `Path` | Inside Layout |
| `/activity` | `Activity` | Inside Layout |
| `/leaderboard` | `Leaderboard` | Inside Layout |
| `/profile` | `Profile` | Inside Layout |
| `/lesson/:lessonId` | `LessonPlayer` | Full-screen (no Layout) |

`SplashScreen` is rendered once per browser session (tracked via `sessionStorage`) and blocks all routes until its animation completes.

---

## Animation Strategy

Framer Motion is used throughout for a polished mobile feel:

- **Page transitions:** opacity + Y-slide on mount, managed by `AnimatePresence`
- **Lesson content:** slide-in from right (`x: 28 → 0`), slide-out left on advance
- **Correct answer:** particle burst (16 radial particles), green flash overlay
- **Wrong answer:** horizontal shake (`x` keyframes), red flash overlay, heart animation
- **Completion screen:** trophy scale-in with radial particles
- **Splash screen:** canvas particle animation (neural-network aesthetic) + staggered text

---

## Responsiveness

| Breakpoint | Behaviour |
|---|---|
| `< 640px` | Full-screen app, no phone chrome — native app feel on real devices |
| `≥ 640px` | Centered `375×780px` phone frame with mock status bar — demo/desktop mode |

Detection is done via `window.innerWidth` with a resize listener in `PhoneWrapper`.

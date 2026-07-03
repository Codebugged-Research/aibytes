# AIBites iOS — Shared API Contract (use these EXACTLY; do not invent names)

Target: iOS 17, SwiftUI. Files live in `ios/AIBites/`. One screen per file.
Match the web source pixel-faithfully (colors, spacing, order, badges, animations).

## Theme (DesignSystem.swift)
Colors (all `Color`): `Theme.violet, violet500, violet400, violetSoft, bg, card, border, border150, ink, ink950, inkSoft, inkFaint, slate200, slate100, slate50, orange, orange500, amber500, emerald, emerald600, teal500, red, yellow, sky, indigo`
Tint bgs: `tintOrange, tintOrangeB, tintViolet, tintVioletB, tintEmerald, tintEmeraldB, tintYellow`
Gradients (`LinearGradient`): `gViolet, gBlue, gGreen, gOrange, gEmerald`; `Theme.unitGradient(Int)`
Fonts: `Theme.head(_:CGFloat)` black rounded, `Theme.title(_:)` bold rounded, `Theme.body(_:)` medium, `Theme.label(_:)` heavy
`Color(hex: 0xRRGGBB)` initializer exists.
Components: `CardBox { ... }` (opt `bg:`, `borderColor:`), `PrimaryButton(title:enabled:action:)`,
`ProgressBarView(value: Double 0...1, gradient:, track:, height:)`.

## Mascot (Mascot.swift)
`Mascot(mood: Mood, size: CGFloat, glow: Bool)` — Mood: `.idle .wave .happy .celebrate .thinking .sad .sleepy .talking`
`MascotCoach(mood:size:message:)`

## Icons (Icons.swift)
`Icons.symbol("🧠") -> "brain.head.profile"` (SF Symbol name string). Use for lesson/unit emoji.

## Models (Models.swift)
`Curriculum{app,units:[Unit]}`, `Unit{id:Int,title,tier,tierIcon,lessons:[LessonMeta]}`,
`LessonMeta{id,title,icon}`, `Lesson{id,unit,day,tier,tierIcon,title,icon,concept,xp,hearts,estMinutes,segments:[Segment]}`,
`Segment{type,cards:[Card]?,exercises:[Exercise]?}`, `Card{kind,icon,title,body,compare:Compare?}`,
`Compare{left,right:CompareSide}`, `CompareSide{emoji,tag,text}`,
`Exercise{id,type,xp,prompt,options:[Option]?,explain,sentence?,blank?,words?}`, `Option{id,text,correct}`,
`User{id,email,name,authMethod,phone}`, `Progress{xp,streak,lastLessonDate?,currentLesson,completedLessons:[String],lessonProgress:[String:LessonPoint]}`,
`ChatMessage{id,role,content}`

## AppStore (AppStore.swift) — `@EnvironmentObject var store: AppStore`
`store.user: User?`, `store.progress: Progress`, `store.curriculum`, `store.xp`, `store.level`,
`store.orderedLessons: [String]`, `store.isCompleted(id)`, `store.isLocked(id)`, `store.voiceEnabled`,
`store.completeLesson(id, xpEarned:)`, `store.saveLessonPoint(id, seg:, ex:)`, `store.resetProgress()`,
`store.logout()`, `store.persistFromExternal()`, `store.point(for:)`.

## API (API.swift)
`await API.lesson(id) -> Lesson?`, `await API.chatStream(messages, onDelta: { full in })`

## Rules
- Light theme, `Theme.bg` background. Match web fonts via `Theme.head/title/body`.
- Screens render INSIDE a shell that already provides the top brand header + bottom nav. So a page is just its scroll content (no nav bar, no header logo) UNLESS it's a full gradient-header page (Leaderboard has its own in-content gradient header — keep it).
- Do NOT add `NavigationView`. Return a `ScrollView`/`VStack`. Bottom content padding 120.
- Parse-check mentally; use only the APIs above.

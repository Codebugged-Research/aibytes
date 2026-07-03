
## 2026-07-03 — Pixel parity vs. taller screens
When porting web → iOS "exactly", literal top-alignment can look worse on a taller
device: the web phone frame (max-h 780) makes content *appear* to fill the screen.
The user wants the perceived fill, not the literal alignment — centre lesson content
in the space between header and footer on iOS. Rule: when the reference viewport and
the target screen differ in height, ask which the user wants preserved: alignment or
fill. Default to fill for card-style content.

---
title: Gamme v0.1 spec
type: spec
tags: [gamme, design-system, android, tutti, pastille]
---

# Gamme v0.1: the settled spec

*Iris, 2026-10-28. Settled from `spec-draft.md` (the full proposal, kept as history) after Erwann's go (« Go pour Gamme, MIT ok, après F-Droid ») and Maya's packaging analysis. This file is what the kit's first version contains and how each app takes it. The draft stays the reference for everything v0.1 leaves out (sheets, messages, menus, top bars, copy rules): those are the direction, not yet the kit.*

Shape (Maya, see the decision note beside this file): source-only kit, MIT, package `app.beansontoast.design`, copied into a `:design` module per app, a sync script that stamps the version and a check that fails on drift. Colour **values** stay per app; the kit fixes what each role **means**, plus shape, spacing, motion, type and the components below.

**Toolchain floor.** The kit compiles against the oldest app: pastille, Compose BOM 2024.10.01 (Compose UI 1.7, Material3 1.3.1), Kotlin 2.0.21, AGP 8.7, minSdk 28. So: no Material 3 Expressive APIs (`MotionScheme`, `ButtonGroup`, the expressive list items), no `HapticFeedbackType` beyond `LongPress` and `TextHandleMove` (haptics go through `View.performHapticFeedback`), dynamic colour behind an API 31 check. Every signature below uses only APIs present in Material3 1.3.

**The kit holds no user-facing strings.** Every label, reason and detail comes from the caller, so each app keeps its own locales and copy tests. Its glyphs are decorative to TalkBack.

---

## 1. The six divergences, settled

| # | Topic | tutti today | pastille today | Gamme v0.1 | Why |
| --- | --- | --- | --- | --- | --- |
| 1 | Row icon | 20 dp glyph in a 40 dp `secondaryContainer` disc | 24 dp plain glyph, `onSurfaceVariant`, in a 36 dp slot | **24 dp plain glyph in a 24 dp slot, `onSurfaceVariant` (`error` when destructive), no tile** | A disc on every row doubles each row's weight and spends the "selected" colour on decoration. |
| 2 | Row min height | 64 dp | 56 dp | **56 dp minimum; the content sets the rest** (a title-plus-detail row lands at 68 dp from its own padding and lines) | 64 was sized for the 40 dp disc; without it, 56 is Material's one-line floor and two-line rows grow honestly. |
| 3 | Disabled | Title, detail and trailing at 0.6, reason as the detail | 0.38 on title and detail, reason optional | **Title and glyph at 0.6; the reason line at full `onSurfaceVariant`, led by the warning glyph; the control uses Material's own disabled colours, never faded twice. A row can only be disabled by passing its reason** (`unavailable: String`). | 0.38 makes the reason unreadable, and an API where "disabled" and "why" are one parameter makes a silent dead control impossible to write. |
| 4 | Group title inset | 32 dp from the screen edge | 4 dp in from the card (20 dp from the screen edge) | **32 dp from the screen edge** (16 page margin + 16 row padding), aligned with the rows' leading edge, glyph or text; a heading to TalkBack | It lines up with whatever a row starts with, glyph or not, so it never floats in a group with no glyphs. |
| 5 | Group construction | Clipped `Column`, `spacedBy(2.dp)`, each row paints `surfaceContainer` | `Surface` in `surfaceContainer`, rows separated by a 2 dp `Spacer` painted `surface` | **tutti's: the group clips a `Column` to `large` (20 dp), rows 2 dp apart, each row paints its own `surfaceContainer`; the gap is transparent** | A painted spacer has to repeat the ground's colour and goes wrong on true black, a tonal band or dynamic colour; a real gap can't. |
| 6 | Settle spring | `snappy` 0.8 / 600 with slight overshoot | critically damped, 800 | **Both, by job: `settle` = damping 1.0, stiffness 800 for anything that moves the page; `snappy` = damping 0.8, stiffness 600 only for a control changing its own shape** | A page that overshoots reads as wobbly; a key or tile that does reads as alive. |

Two smaller corrections to the draft, found while writing the APIs:

- **Glyph size in chips is 18 dp**, not 20: it is Material's own `FilterChipDefaults.IconSize` and `SegmentedButtonDefaults.IconSize`, and pastille's chip already draws 18.
- **The leading column holds each row's glyph and nothing else** (Erwann, 2026-10-28: « La colonne de gauche c'est pour les icônes de chaque menu, pas plus »). A row's values (chips, radio options, sliders, previews) start at the text column, never under the glyphs.
- **A group either aligns all its rows to a glyph slot or none.** A glyph-less row in a group with glyphs keeps the empty 24 dp slot, so text starts at 56 dp throughout; a group with no glyphs starts text at 16 dp.

---

## 2. Tokens

All in `app.beansontoast.design`. Values are exact; the comments say where each is used.

### 2.1 Colour roles (meanings; values per app)

| Role | Means | Rule |
| --- | --- | --- |
| `primary` / `onPrimary` | **On** | A switch's checked track, a toggle that is on, links. Never a selection, never a label colour. |
| `secondaryContainer` / `onSecondaryContainer` | **Selected** | A selected chip or segment, the extended FAB. Never decoration (no tiles behind glyphs). |
| `primaryContainer` | Emphasis, sparingly | The "Done" disc on top of its tick, a "Recommended" card. Never a selection. |
| `surface` = `background` | The ground | Screens and the 2 dp gap between grouped rows. |
| `surfaceContainer` | A group or card | Settings rows, list cards. |
| `surfaceContainerHigh` | A quiet control | An unselected chip, the empty-state disc. |
| `onSurface` | Text and icons on the ground | Provided as `LocalContentColor` at the theme root; group headings. |
| `onSurfaceVariant` | Quiet text and glyphs | Detail and reason lines, row glyphs, chevrons, marks at rest. |
| `outline` | A boundary that must read (3:1) | The dashed "not known" ring. |
| `error` | Destructive | Title and glyph of a destructive row only. A failure is the warning glyph and words, never red alone. |

Contrast floor, per app, light and dark: text 4.5:1, a state or boundary 3:1.

### 2.2 Shape

```kotlin
val GammeShapes = Shapes(
    extraSmall = RoundedCornerShape(8.dp),  // value tags, thumbnails; Material: text fields, menus
    small = RoundedCornerShape(12.dp),      // menus (the app's own), Material: assist/filter chips
    medium = RoundedCornerShape(16.dp),     // list cards, inner cards
    large = RoundedCornerShape(20.dp),      // settings groups (outer corners), Material: extended FAB
    extraLarge = RoundedCornerShape(28.dp), // sheets' top corners, dialogs (Material's own)
)
```

Material's defaults are 4 / 8 / 12 / 16 / 28: adopting the theme changes the corners of every stock Material component that reads them (listed per app in §5).

### 2.3 Spacing and sizes

```kotlin
object GammeSpace {
    val hair = 2.dp   // between rows in a group
    val xs = 4.dp     // title to its detail line
    val s = 8.dp      // heading to its group; between chips; between list cards
    val m = 12.dp     // row vertical padding
    val l = 16.dp     // page margin; row horizontal padding; glyph to text
    val xl = 24.dp    // above a group heading
    val xxl = 32.dp   // empty state's side padding
}

object GammeSize {
    val target = 48.dp        // every touch target, whatever the visual
    val rowMin = 56.dp        // a settings row's minimum height
    val rowGlyph = 24.dp      // a row's leading glyph and its slot
    val rowInset = 56.dp      // row text from the card edge when the group has glyphs (16 + 24 + 16)
    val headingInset = 32.dp  // a group heading from the screen edge
    val mark = 16.dp          // a state mark, and the warning glyph of a reason line
    val markGap = 6.dp        // mark to its words
    val chipHeight = 36.dp    // visual; the target stays 48
    val chipGlyph = 18.dp
    val chipPadding = 14.dp   // horizontal, inside a chip
    val emptyDisc = 56.dp
    val emptyGlyph = 28.dp
}

object GammeAlpha {
    const val DISABLED = 0.6f // title and glyph of an unavailable row; never the reason line
}
```

### 2.4 Type

Material 3's default scale and weights (the system face, no custom font), with two additions:

```kotlin
private const val TABULAR = "tnum"

fun gammeTypography(base: Typography = Typography()): Typography = base.copy(
    labelLarge = base.labelLarge.copy(fontFeatureSettings = TABULAR),
    labelMedium = base.labelMedium.copy(fontFeatureSettings = TABULAR),
    labelSmall = base.labelSmall.copy(fontFeatureSettings = TABULAR),
    bodySmall = base.bodySmall.copy(fontFeatureSettings = TABULAR),
)

/** Tabular figures for a larger number that changes under a finger (a volume level). */
fun TextStyle.tabular(): TextStyle = copy(fontFeatureSettings = TABULAR)
```

Uses: group heading `titleSmall` (500) in `onSurface`; row title `bodyLarge`; detail and reason `bodyMedium`; chip `labelLarge`, **SemiBold (600) only when selected**, the one non-colour weight cue. No Bold anywhere.

### 2.5 Motion

```kotlin
object GammeMotion {
    const val SHORT = 150        // a fade
    const val EXIT = 120         // the outgoing half of a transition, first
    const val MEDIUM = 250       // the ceiling for anything the user waits through
    const val REDUCED_OUT = 90   // reduced motion: outgoing fade
    const val REDUCED_IN = 120   // reduced motion: incoming fade (about 210 ms in all)

    val Emphasized = CubicBezierEasing(0.2f, 0f, 0f, 1f)
    val EmphasizedDecelerate = CubicBezierEasing(0.05f, 0.7f, 0.1f, 1f)
    val EmphasizedAccelerate = CubicBezierEasing(0.3f, 0f, 0.8f, 0.15f)

    /** A press landing (~65 ms, no overshoot). */
    fun <T> press(): SpringSpec<T> = spring(dampingRatio = 1f, stiffness = Spring.StiffnessHigh)
    /** Anything that moves the page: screens, rows, a chip's fill (~235 ms, no overshoot). */
    fun <T> settle(): SpringSpec<T> = spring(dampingRatio = 1f, stiffness = 800f)
    /** A control changing its own shape: a key, a tile turning on. Slight overshoot. */
    fun <T> snappy(): SpringSpec<T> = spring(dampingRatio = 0.8f, stiffness = 600f)
    /** At most once a screen: a success landing. */
    fun <T> bouncy(): SpringSpec<T> = spring(dampingRatio = 0.6f, stiffness = 400f)
}
```

Under reduced motion every movement becomes an opacity fade (`REDUCED_OUT` then `REDUCED_IN`), sizes snap, haptics stay.

### 2.6 Haptics

One in v0.1, inside `SwitchRow`: **select** = `view.performHapticFeedback(HapticFeedbackConstants.VIRTUAL_KEY)` (tutti's mapping), which honours the system's touch-feedback setting. The rest of tutti's vocabulary (tick, bump, reject) joins the kit with the components that need it.

### 2.7 Glyphs

Vector drawables in the kit's `res/drawable`, prefixed `gamme_` (the app's `:design` build file sets `resourcePrefix = "gamme_"`), from Material Symbols Rounded, filled, at 24 dp viewports. Components take a `Painter`, so an app can pass `painterResource(R.drawable.x)` or, during migration, `rememberVectorPainter(Icons.Rounded.X)`.

| Drawable | Used by |
| --- | --- |
| `gamme_check` | Switch thumb; a selected chip with no glyph of its own |
| `gamme_check_circle` | Mark: Done |
| `gamme_ring` | Mark: Not yet |
| `gamme_sync` | Mark: On its way (never spins in v0.1) |
| `gamme_moon` | Mark: Resting |
| `gamme_warning` | Mark: Needs a look; every reason and notice line |
| `gamme_ring_dashed` | Mark: Not known (taken from tutti's own) |
| `gamme_chevron_end` | Row that opens something (`autoMirrored="true"`) |

Material Symbols are Apache 2.0: the kit keeps a `NOTICE` for them beside its MIT licence.

---

## 3. Components (v0.1)

Only what both apps use today. Signatures as they should look in the kit; bodies are the implementer's, within the rules under each.

### 3.1 Theme

```kotlin
@Immutable
class GammeColors(val light: ColorScheme, val dark: ColorScheme)

val LocalReducedMotion = compositionLocalOf { false }

@Composable
fun GammeTheme(
    colors: GammeColors,
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false,
    trueBlack: Boolean = false,
    content: @Composable () -> Unit,
)

/** True while the system's animator duration scale is 0, read live. */
@Composable
fun rememberReducedMotion(): Boolean
```

- Scheme: `dynamicLightColorScheme` / `dynamicDarkColorScheme` when `dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S`, else the app's `colors`. An app with no brand passes Material's baseline (`lightColorScheme()`, `darkColorScheme()`), never system defaults.
- `trueBlack` applies in dark only: `background` and `surface` become `Color.Black`; containers keep their steps.
- `MaterialTheme(colorScheme, shapes = GammeShapes, typography = gammeTypography())`, then provides `LocalContentColor` = `colorScheme.onSurface` (pastille's fix: untinted icons outside a `Surface` were black on dark) and `LocalReducedMotion` = `rememberReducedMotion()`.
- `rememberReducedMotion` registers a `ContentObserver` on `Settings.Global.getUriFor(ANIMATOR_DURATION_SCALE)` in a `DisposableEffect` and unregisters on dispose (tutti's behaviour), so the setting takes effect without a restart.
- Window background, true-black persistence and the in-app theme choice stay in each app.

### 3.2 SettingsGroup

```kotlin
@Composable
fun SettingsGroup(
    title: String?,
    modifier: Modifier = Modifier,
    glyphs: Boolean = false,
    footnote: String? = null,
    content: @Composable ColumnScope.() -> Unit,
)
```

- Heading: `titleSmall`, `onSurface`, `semantics { heading() }`, padded `start = 32.dp, end = 32.dp, top = 24.dp, bottom = 8.dp` (the group itself takes no margin; only the card is inset 16 dp), so it sits 32 dp from the screen edge.
- Card: `Column(Modifier.padding(horizontal = 16.dp).fillMaxWidth().clip(MaterialTheme.shapes.large), verticalArrangement = Arrangement.spacedBy(2.dp))`; nothing painted behind it.
- `glyphs = true` when any row in the group has a glyph: it provides the slot to every row so their text lines up at 56 dp.
- `footnote`: `bodySmall`, `onSurfaceVariant`, under the card at the heading's inset, 8 dp above.

### 3.3 SettingsRow

```kotlin
@Composable
fun SettingsRow(
    title: String,
    modifier: Modifier = Modifier,
    detail: String? = null,
    detailMaxLines: Int = Int.MAX_VALUE,
    state: MarkState? = null,
    icon: Painter? = null,
    notice: String? = null,
    unavailable: String? = null,
    destructive: Boolean = false,
    selected: Boolean? = null,
    opens: Boolean = false,
    onClick: (() -> Unit)? = null,
    footer: (@Composable () -> Unit)? = null,
    trailing: (@Composable () -> Unit)? = null,
)
```

- **Frame:** paints `surfaceContainer`, `heightIn(min = 56.dp)`, `padding(horizontal = 16.dp, vertical = 12.dp)`; leading slot 24 dp, 16 dp to the text; trailing 16 dp after it. The whole row is the one target.
- **Lines:** title `bodyLarge`; then exactly one of, in this order: `unavailable` (reason line), `notice` (reason line), `detail` (led by `StateMark(state)` when `state` is set). A reason line is `gamme_warning` at 16 dp + 6 dp + the words, `bodyMedium`, full `onSurfaceVariant`, never faded. `footer` goes under the lines.
- **Read-only** (`onClick == null && selected == null`): no `clickable`, no ripple, no chevron, full contrast; `semantics(mergeDescendants = true) {}` so TalkBack reads it as one.
- **Unavailable** (`unavailable != null`): the row is `clickable(enabled = false)`, so TalkBack says "disabled" and reads the reason with it; title and glyph at `GammeAlpha.DISABLED`. There is no `enabled` parameter: the reason is the switch.
- **Notice:** the setting is inactive for a reason outside the app; the row stays enabled and its control keeps the user's preference.
- **Destructive:** title and glyph in `error`. Its verb says what goes ("Empty bin").
- **Selected** (non-null): the row is a radio, `Modifier.selectable(selected, role = Role.RadioButton)`; the leading slot draws `RadioButton(selected, onClick = null)` (20 dp + 2 dp padding = the 24 dp slot). `icon` is ignored.
- **Opens:** draws `gamme_chevron_end` (24 dp, `onSurfaceVariant`) as the trailing control; only for a row that opens a screen, menu or system picker. Not combined with `trailing`.
- `onClick` rows get `Role.Button`.

### 3.4 SwitchRow

```kotlin
@Composable
fun SwitchRow(
    title: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
    detail: String? = null,
    state: MarkState? = null,
    icon: Painter? = null,
    notice: String? = null,
    unavailable: String? = null,
    footer: (@Composable () -> Unit)? = null,
)
```

- The row is the only target: `Modifier.toggleable(value = checked, enabled = unavailable == null, role = Role.Switch)`, which plays the **select** haptic, then calls `onCheckedChange`.
- The switch draws state only: `Switch(checked, onCheckedChange = null, enabled = unavailable == null, thumbContent = gamme_check when checked)`. With `onCheckedChange = null` it takes no clicks and is not a second TalkBack target (the bug in tutti's `SwitchRow` today).
- Same lines, reason and fade rules as `SettingsRow`; the switch is not faded by the row (Material's disabled colours are its one fade).

### 3.5 StateMark

```kotlin
enum class MarkState { Done, NotYet, OnItsWay, Resting, NeedsALook, NotKnown }

@Composable
fun StateMark(state: MarkState, modifier: Modifier = Modifier)
```

| State | Glyph | Tint |
| --- | --- | --- |
| `Done` | `gamme_check_circle` | `onSurface` |
| `NotYet` | `gamme_ring` | `onSurfaceVariant` |
| `OnItsWay` | `gamme_sync` | `onSurfaceVariant` |
| `Resting` | `gamme_moon` | `onSurfaceVariant` |
| `NeedsALook` | `gamme_warning` | `onSurfaceVariant` |
| `NotKnown` | `gamme_ring_dashed` | `outline` |

16 dp, decorative (`contentDescription = null`); the words beside it carry the state. All six ship in v0.1 although pastille needs three: a state vocabulary split between the kit and an app is the drift the sync check can't see.

### 3.6 EmptyState

```kotlin
@Immutable
class GammeAction(val label: String, val onClick: () -> Unit)

@Composable
fun EmptyState(
    title: String,
    icon: Painter,
    modifier: Modifier = Modifier,
    detail: String? = null,
    action: GammeAction? = null,
)
```

- A 56 dp `surfaceContainerHigh` disc with a 28 dp glyph in `onSurfaceVariant`; 16 dp; `title` in `titleMedium`, a heading; 4 dp; `detail` in `bodyMedium`, `onSurfaceVariant`; 20 dp; at most one `FilledTonalButton`. Centred, 32 dp side padding, 40 dp vertical (pastille's values).
- No action when the screen already has one (the FAB). Never shown before the data has loaded.

### 3.7 SelectChip

```kotlin
@Composable
fun SelectChip(
    selected: Boolean,
    onClick: () -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    icon: Painter? = null,
    iconWhenUnselected: Boolean = false,
    role: Role = Role.Tab,
)
```

- A pill (`CircleShape`), 36 dp tall in a 48 dp target (`minimumInteractiveComponentSize()`), 14 dp horizontal padding, `labelLarge`.
- Unselected: `surfaceContainerHigh`, `onSurfaceVariant` content, glyph only if `iconWhenUnselected`. Selected: `secondaryContainer`, `onSecondaryContainer`, glyph shown (`icon`, or `gamme_check` when there is none), SemiBold label.
- **Width never changes:** both faces are laid out on top of each other in one `Box`, the widest sets the size, and only their opacity moves (`settle`, a fade either way under reduced motion); the hidden face is `clearAndSetSemantics {}`.
- Semantics: `Modifier.selectable(selected, role = role, onClick = onClick)`; `Role.RadioButton` for a single choice in a form, `Role.Tab` (default) for a filter row over a list.

### 3.8 Not in v0.1

Sheet, passing message, menu, top bar, segmented control wrapper, toggle and action chips, list card, extended FAB rules, banner, press/focus indication, `RevealRow`, the copy tests. Each app keeps its own until the second app needs the same thing; the draft holds their direction.

---

## 4. Rulings the kit carries across every app

- **No tiles behind glyphs.** A glyph is plain and monochrome; the selection colour is never decoration.
- **`primary` means on, `secondaryContainer` means selected**, and neither is borrowed for anything else (a label, a heading, a selected segment in `primaryContainer`).
- **Every disabled control says why**, in words at full contrast beside it; the API cannot express disabled without a reason. Read-only is not disabled.

### Field notes from Erwann's reviews (2026-10-27/28), now rules

Each comes from something he saw on his phone in tutti or pastille; the app is named only as the source.

**Layout**
- **The leading column holds each row's glyph and nothing else.** A row's values (chips, radios, sliders, previews) start at the text column.
- **Nothing jumps.** A selected chip or segment keeps its width (lay out both looks, fade between them); a screen draws its content only once the first read lands (no "empty" flash); headers keep a fixed height. (pastille list, folder chips)
- **A card's trailing items share one vertical axis**, centred on the title line: time and action together, never a time on one line and a button floating below it. (pastille snippet card)
- **An add affordance inside a chip row is a chip of the same height and centre**, not a differently shaped button. (pastille folder row)
- **The first group header is never clipped** under the top bar; scroll content starts below the bar's inset. (pastille Settings)
- **The keyboard never hides the thing you're typing into.** The field, its helper or counter and its primary action stay together above the IME; decoration gives way only when space is genuinely short; one owner per inset. (tutti pairing code)

**Controls**
- **A segmented control with four or more options carries no per-option glyphs**; the selected option's check is enough. If labels still don't breathe at 360 dp, use wrapping chips. Two-way controls may carry glyphs (Snippets | Stickers). (pastille Height)
- **Glyphs match what they describe**: a landscape option shows a landscape device; a preview follows the option being changed. (pastille Height)
- **Selection never rests on fill alone**, in chips and segments too: a check or a glyph swap, without reflow. (pastille keyboard chips)
- **Full lists inline when the choice matters**: if a setting picks one of the user's own things (keyboards), show the whole list as visible radios, not a hidden dropdown, with unavailable items listed and a way to enable them. (pastille Switch back to)
- **Lists of system things match the system's own set and grouping** (e.g. every enabled keyboard with its languages, as Android's picker shows), minus the app itself. (pastille vs the system keyboard picker)

**Menus and navigation**
- **An overflow menu is short and doesn't duplicate Settings**: only actions for the screen in front of you, grouped by meaning, one glyph family and tint, the 12 dp menu shape with an inset from the edge. Things that are settings live in Settings. (pastille ⋮ menu)
- **A menu follows the mode on screen**: actions that don't apply to the current tab aren't offered there. (pastille Stickers tab)
- **Tools on the leading side, content tabs on the trailing side** of a toolbar, so the tabs sit under the thumb (Gboard's convention). (pastille keyboard)
- **The most immediate content comes first** (the clipboard before saved items); the surface reopens where the user left it and never jumps on its own. (pastille keyboard)
- **A context shows only what belongs to it**: a playback sheet holds playback (captions, audio track, time), not sound settings. (tutti playback sheet)

**Metaphors**
- **Right always means later on a timeline.** A display-only timeline doesn't invite a drag (an upright bar marker, not a round handle). A jog wheel behaves like a physical wheel: ticks follow the finger, and the direction matches that metaphor; it says in words which key it is sending. (tutti scrub strip)

**State**
- **Hold the last confirmed state through transient gaps**: "no answer yet" is not "nothing there"; keep what was last confirmed for a short grace window and clear it at once on a confirmed change. Never show stale data indefinitely. (tutti now-playing card)
- **Connected or on states carry a mark** (check circle or empty ring), across the whole app. (tutti)

**Colour and icons**
- **No untinted icons**: the theme provides `onSurface` as the content colour app-wide, so an icon on a plain background is never drawn black on dark. (pastille editor header)
- **One icon family, one weight, one tint per surface.** (pastille ⋮ menu)

**Copy**
- **Subtitles are values or one short sentence (≤14 words)**; an explanatory note goes on one line under the control it explains. (pastille Show in the keyboard)
- **Names say what the thing is**: "Clipboard", not "Recent", when it holds copies rather than recently used items. (pastille keyboard)

**Showing work**
- Every visual change is shown with a real render or a screenshot of the build; a drawing is labelled a mock-up.

---

## 5. Adoption

Order (Erwann, 2026-10-28): the kit repo, then **pastille after its first F-Droid release, in a later tag**, then **tutti**. Each adoption: copy the kit into `:design` with the sync script, wrap the app in `GammeTheme`, swap the components below, delete the app's copies, then the app's full check (tests, lint, build) and before/after screenshots at phone size, light and dark.

### 5.1 pastille

**Swaps**

- `ui/theme/Theme.kt`: wrap in `GammeTheme(colors = GammeColors(PastilleLight, PastilleDark), dynamicColor = false, trueBlack = false)`; drop its own `LocalContentColor` provision; drop the comment and any code that makes `primaryContainer` the selected segment (segments go back to Material's `secondaryContainer`).
- `ui/SettingsGroup.kt`: `SettingsGroup` → kit's (`glyphs = true` where rows have icons); `SettingsRow(subtitle, icon: ImageVector, leading, enabled)` → kit's (`detail`, `icon = rememberVectorPainter(...)`, radio rows via `selected`, `enabled = false` → `unavailable = "<reason>"`); `PastilleSwitch` + row toggle in `modifier` → `SwitchRow`; `SettingsIconTile`, `SettingsHairline`, `SettingsChevron` (→ `opens = true`) deleted; `SettingsTextInset` 72 → `GammeSize.rowInset` (56) wherever something aligns to it (`SettingsRowDetail` stays in the app).
- `ui/FolderChip.kt` → `SelectChip` (same look and the same no-reflow overlay; the glyph goes 18 dp as today).
- `ui/EmptyState.kt` → kit's `EmptyState`. The keyboard panel's private empty state stays: the IME has its own palette and is outside v0.1.
- `ime/PastilleMotion.kt`: its critically damped 800 spring → `GammeMotion.settle()`; its once-per-activity reduced-motion read → `LocalReducedMotion`.
- Every disabled row today needs a reason string to compile.

**What visibly changes**

- Row text starts 16 dp further left (72 → 56 from the card's edge): the glyph slot narrows from 36 to 24 dp and the gap from 20 to 16 dp.
- Group headings move from 20 dp to 32 dp from the screen edge.
- Disabled rows fade to 0.6 instead of 0.38 and carry a warning-led reason line at full contrast.
- The selected half of Snippets | Stickers and other segments turns `secondaryContainer` instead of `primaryContainer`.
- Theme shapes: filter, assist and input chips 8 → 12 dp corners; text fields and stock `DropdownMenu`s 4 → 8 dp; the extended FAB 16 → 20 dp; its one stock `Card` 12 → 16 dp.
- Switch rows: a click haptic, one TalkBack target with the switch role. Reduced motion now follows the setting live.

### 5.2 tutti

**Swaps**

- `ui/theme`: wrap in `GammeTheme(colors = GammeColors(lightColorScheme(), darkColorScheme()), dynamicColor = <the user's setting, default on>, trueBlack = <the user's setting>)`; `WindowBackground` stays in the app.
- `ui/common/SettingsCards.kt`: `SettingsGroup`, `SettingsRow`, `StateMark`, `OpensChevron`, `RowIcon`, `Notice`, `LocalRowSurface` → kit. Parameters: `mark: Boolean?` → `state` (`true` → `Done`, `false` → `NotYet`); `enabled = false` plus a detail → `unavailable = <that detail>`; `icon: @DrawableRes Int` → `painterResource(icon)`; `role` dropped (radios via `selected`, switches via `SwitchRow`). `RevealRow` stays in tutti.
- `ui/common/Controls.kt` `SwitchRow(label, supporting, reason)` → kit's (`title`, `detail`, `unavailable`). The switch stops being clickable on its own: **fixes the double TalkBack target**.
- `TuttiMenu`: it reads `shapes.medium`, which becomes 16 dp; point it at `shapes.small` (12 dp) to keep its look.
- `ui/common/Digits` `.tabular()` → the kit's; `ReducedMotion` → the kit's (same behaviour); `ui/motion/Motion.kt` springs → `GammeMotion` (its own durations stay).
- `ConnMark` and other screens that draw state glyphs move to `StateMark` where they mean the same state.

**What visibly changes: Erwann sees these before tutti adopts.** Every settings screen moves; within the 2026-10-25 delegation, but shown first because it is a shipped app's look.

- The tonal discs behind every settings glyph go; glyphs are plain 24 dp in `onSurfaceVariant`.
- Row text starts 16 dp further left (72 → 56 from the card's edge).
- One-line rows get 8 dp shorter (64 → 56 dp), so settings lists are denser; two-line rows barely change.
- A disabled row's reason line no longer fades: full contrast, led by the warning glyph. A disabled switch is faded once (Material's colours), not twice.
- Theme shapes: text fields 4 → 8 dp corners (12 fields), assist, filter and input chips 8 → 12 dp, the extended FAB 16 → 20 dp, the stock `DropdownMenu` 4 → 8 dp.
- Tabular figures on every label style (times, counts and levels hold their width).
- The kit's state marks are Rounded beside tutti's own baseline-filled glyphs until its icon pass (draft open point 4).

Proposed before/after set for Erwann: Settings hub, one category screen, TV settings, a screen with a disabled row and one with a notice, at 412×915, light and dark.

---

## 6. Open points

1. **Name.** "Gamme" is still a working title (the repo is already named `gamme`).
2. **Dynamic colour defaults and true black for pastille:** unchanged from the draft (tutti on, pastille off; true black not offered in pastille). Erwann's call if the family should agree.
3. **tutti's icon family** (117 baseline-filled drawables to Rounded): Maya's estimate; until then the mix in §5.2 stands.
4. **tutti's before/after** (§5.2) goes to Erwann before tutti adopts.

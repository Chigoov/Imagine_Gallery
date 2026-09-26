# 11_DESIGN_SYSTEM.md
# Design System — Private Photo Fantasy Board

Version: 1.0
Target: Desktop Web, Mobile Web, PWA, Native Wrapper

---

# 1. Design Objective

Aplikasi harus terasa:

- private,
- immersive,
- calm,
- modern,
- minimal,
- photo-first,
- low distraction.

Player harus terasa seperti kanvas visual, bukan dashboard.

---

# 2. Visual Direction

Default direction:

```text
Dark Minimal
Soft Glass Controls
Large Edge-to-Edge Photos
Subtle Motion
Low Contrast Chrome
High Contrast Focus Elements
```

Avoid:

- neon berlebihan,
- terlalu banyak gradient,
- border di setiap elemen,
- ikon tanpa hierarchy,
- terlalu banyak teks saat session aktif.

---

# 3. Color Tokens

Gunakan design tokens, bukan hardcoded colors.

Suggested semantic tokens:

```text
--bg-app
--bg-surface
--bg-elevated
--bg-player
--bg-overlay

--text-primary
--text-secondary
--text-muted

--border-subtle
--border-strong

--accent
--accent-hover
--accent-soft

--danger
--warning
--success

--pin-active
--favorite-active
```

Default theme should be near-black, not pure black everywhere.

Example direction:

```text
App background     #0F1012
Surface            #17181C
Elevated           #1E2025
Player background  #090A0B
Primary text       #F5F5F6
Secondary text     #B8BBC2
Muted text         #7C808A
```

Accent final color remains open for branding.

---

# 4. Typography

Recommended family:
- modern sans-serif,
- highly legible,
- neutral.

Hierarchy:

```text
Display / Hero    28–36
Page Title        24–28
Section Title     18–22
Body              14–16
Caption           12–13
Micro Label       11–12
```

Player timer:
```text
tabular numerals
```

---

# 5. Spacing Scale

Use consistent 4px scale.

```text
4
8
12
16
20
24
32
40
48
64
```

Default page horizontal padding:

```text
Desktop 24–32
Tablet 20–24
Mobile 16
```

---

# 6. Radius

Suggested:

```text
Small      8
Medium    12
Large     16
XL        20
Pill      999
```

Photo slots:
```text
8–16 depending context
```

---

# 7. Shadow

Use sparingly.

```text
Surface shadow
Overlay shadow
Floating control shadow
```

Player should not use heavy card shadows.

---

# 8. Glass Surfaces

Allowed for:
- player controls,
- floating action bar,
- modal overlays.

Rules:
- moderate blur,
- dark translucent base,
- enough contrast,
- no excessive glassmorphism.

---

# 9. Iconography

Use one consistent icon set.

Icons required:

```text
Home
Library
Collections
Calendar
Settings
Play
Pause
Next
Previous
Pin
Unpin
Replace
Like
Favorite
Keep
Hide
More
Search
Filter
Fullscreen
Back
Lock
Unlock
Add
Delete
Edit
```

---

# 10. Button Types

## Primary

Used for:
```text
Start Session
Save
Confirm
```

## Secondary

Used for:
```text
Preview
Cancel
Continue
```

## Ghost

Used for:
```text
toolbar controls
secondary actions
```

## Icon Button

Used heavily in Player.

---

# 11. Button States

Every button needs:

```text
default
hover
pressed
focus
disabled
loading
```

Touch targets:
```text
>= 44x44 px mobile
```

---

# 12. Photo Slot

PhotoSlot is a core component.

Props conceptually:

```text
photo
slotIndex
pinned
selected
loading
missing
fitMode
actionsVisible
```

States:

```text
normal
hovered
focused
pinned
missing
loading
error
```

---

# 13. Pin Badge

Pinned state must be easy to recognize.

Recommended:
- small top-right badge,
- low visual weight,
- accent or warm neutral.

Do not cover subject.

---

# 14. Player Control Bar

Contains:

```text
Previous
Play/Pause
Next
Photo Count
Timer
More
Fullscreen
End Session
```

Desktop:
centered floating bar.

Mobile:
bottom control bar.

---

# 15. Collection Card

Contains:
```text
Cover preview
Collection name
Photo count
Optional quick start
```

---

# 16. Calendar Day

States:

```text
default
today
has-session
selected
disabled
```

Information:
- day number,
- small count or intensity indicator.

---

# 17. Session Card

Contains:
```text
start-end
duration
optional mode/layout
```

Do not display unnecessary private detail in summary.

---

# 18. Modal

Use for:
- destructive confirmations,
- desktop Keep,
- rename.

Avoid modal stacking.

---

# 19. Bottom Sheet

Mobile preferred for:
```text
Keep
Collection picker
More actions
Session settings
```

---

# 20. Toast

Use for:
```text
Liked
Saved
Added to collection
Hidden
Restored
```

Toast duration:
```text
1.5–3 seconds
```

---

# 21. Player Background

Default:
```text
near-black
```

Options:
```text
Black
Charcoal
Blurred Photo
Custom Neutral
```

---

# 22. Image Fit

Visual control:
```text
Cover
Contain
```

Smart Crop later.

---

# 23. Focus Mode

Background:
```text
near-black
```

Controls:
- hidden after inactivity,
- appear on interaction.

---

# 24. Desktop Layout Grid

App shell:
```text
sidebar 220–260px
content flexible
```

Player fullscreen:
```text
no sidebar
```

---

# 25. Mobile Layout

Bottom navigation:
```text
56–72px
```

Player:
- controls close to thumb zone,
- avoid top-heavy interaction.

---

# 26. Breakpoints

Suggested:

```text
xs  <480
sm  480–767
md  768–1023
lg  1024–1279
xl  1280–1535
2xl >=1536
```

---

# 27. Empty States

Tone:
- concise,
- neutral,
- actionable.

Example:
```text
No photos yet.
Add a folder or select photos to begin.
```

---

# 28. Error States

Never expose stack traces.

Show:
```text
what happened
what remains safe
what user can do next
```

---

# 29. Accessibility

Required:
- semantic buttons,
- keyboard support,
- visible focus ring,
- contrast,
- screen-reader labels,
- reduced-motion preference.

---

# 30. Reduced Motion

If OS requests reduced motion:
- remove zoom-heavy transitions,
- shorten fades,
- avoid parallax.

---

# 31. Design Tokens

Store centrally:

```text
colors
spacing
radius
typography
elevation
motion
z-index
```

Do not duplicate token values across components.

---

# 32. Core Component Inventory

```text
AppShell
DesktopSidebar
MobileBottomNav
TopBar
PhotoGrid
PhotoSlot
PhotoActionBar
PlayerControlBar
PinBadge
SessionTimer
CollectionCard
PhotoCard
FilterChip
SearchBar
BottomSheet
Modal
Toast
CalendarMonth
CalendarDay
SessionCard
StatCard
LockScreen
EmptyState
ErrorState
```

---

# 33. Design Lock Criteria

Design system is locked when:
- accent selected,
- typography selected,
- Player states approved,
- mobile control placement approved,
- Pin state approved,
- Calendar density approved,
- modal/bottom-sheet patterns approved.

# 12_HIGH_FIDELITY_UI_SPEC.md
# High-Fidelity UI Specification — Private Photo Fantasy Board

Version: 1.0

---

# 1. Purpose

Dokumen ini menerjemahkan wireframe V1 menjadi spesifikasi visual yang cukup detail untuk implementasi.

---

# 2. Home — Desktop

## Structure

```text
Top Bar
Sidebar
Main Content
```

Main Content sections:

```text
Today Summary
Primary Actions
Continue Session
Recent Collections
Calendar Preview
```

## Today Summary

Two or three stat cards:
```text
Sessions Today
Fantasy Time
App Usage (only if enabled)
```

## Primary CTA

```text
START SESSION
```

Must be visually dominant.

---

# 3. Home — Mobile

Order:

```text
Header
Today Summary
Start Session
Continue Session
Recent Collections
Calendar Preview
Bottom Navigation
```

Avoid horizontal scrolling except collection carousel.

---

# 4. Start Session — Desktop

Two-column layout:

```text
LEFT
configuration

RIGHT
live preview
```

Configuration:

```text
Source
Photos 1–5
Auto/Manual
Interval
Layout
Shuffle
Background
Advanced
```

Preview updates live.

---

# 5. Start Session — Mobile

Single column.

Use:
- segmented controls,
- compact selects,
- bottom sticky Start button.

Advanced options collapsed.

---

# 6. Player Desktop — Default State

Photos occupy:
```text
85–95% of visual area
```

Controls:
- floating bottom center,
- fade after inactivity.

Top:
- minimal session status,
- optional exit/end button.

---

# 7. Player Desktop — Hover State

When hovering one slot:

show:
```text
Like
Favorite
Keep
Pin
Replace
More
```

Action bar placement:
- bottom inside slot,
- translucent background.

---

# 8. Player Mobile — Default State

Controls visible only at bottom.

Tap photo:
- reveal photo actions or enter Focus depending setting.

Recommended default:
```text
single tap = show controls
second tap / explicit focus = focus
```

Double tap:
```text
Like
```

---

# 9. Player Photo Count Layouts

## 1 Photo

Desktop/mobile:
single centered/full surface.

## 2 Photos

Desktop:
horizontal split.

Mobile portrait:
vertical split.

## 3 Photos

Desktop:
one large + two stacked.

Mobile:
one large top + two bottom.

## 4 Photos

2x2 grid.

## 5 Photos

Desktop:
dynamic mosaic.

Mobile:
one large + four compact OR 2+3 layout based viewport.

---

# 10. Pin Visual

Pinned photo:
- small filled Pin badge,
- subtle outline around slot,
- no major color wash.

Pinned slot persists visually through transitions.

---

# 11. Replace Visual

Replace icon appears:
- on hover desktop,
- in action bar mobile.

On click:
- slot performs localized crossfade,
- other slots stay static.

---

# 12. Like

Like state:
```text
outline heart → filled heart
```

Feedback:
```text
small toast or micro-animation
```

No large celebratory animation.

---

# 13. Favorite

Favorite state:
```text
outline star → filled star
```

Should visually differ from Like.

---

# 14. Keep

Keep opens destination picker.

After success:
```text
Saved
```

Keep icon may change to checked state.

---

# 15. Hide

Hide placed under More to reduce accidental use.

Requires confirmation only if configured.

Default:
- action + Undo toast.

---

# 16. Focus Mode

Photo centered.

Desktop:
- side margins,
- top-left Back,
- bottom floating action bar.

Mobile:
- full-screen image,
- pinch zoom,
- bottom actions.

Controls auto-hide.

---

# 17. Library — Desktop

Use masonry-like or uniform adaptive grid.

Default:
uniform grid recommended for predictability.

Card shows:
- image,
- minimal overlay for state.

Hover:
- quick actions.

---

# 18. Library — Mobile

2–4 columns depending width.

Long press:
- selection mode.

---

# 19. Multi-Select Mode

For:
```text
Add to Collection
Hide
Favorite
Keep
```

Selected thumbnails get clear selection mark.

---

# 20. Collection Detail

Header:
```text
Collection Name
Photo Count
Start Session
More
```

Cover can use first/selected photo.

---

# 21. Saved Composition Page

Grid of composition previews.

Each card:
```text
mini layout preview
name
photo count
last used
```

Actions:
```text
Open
Rename
Delete
```

---

# 22. Calendar — Month

Use full month grid.

Each day:
```text
day number
session indicator
optional count
```

Today:
distinct ring.

Selected:
stronger surface.

---

# 23. Calendar — Day Detail

Header:
```text
Date
Session Count
Total Time
```

Session list below.

Manual Add button sticky on mobile.

---

# 24. Statistics

Cards:
```text
Sessions
Total Time
Active Days
Average Session
```

Charts should be minimal.

No gamified streak score.

---

# 25. Settings

Group sections:
```text
Player
Session
Library
Privacy
Backup
Advanced
```

Each item:
- label,
- value/control,
- short helper text only where needed.

---

# 26. App Lock

Minimal screen:
```text
App mark
Enter PIN
Biometric button if available
```

No private collection preview behind lock.

---

# 27. Empty States

Illustration not required.

Prefer:
```text
icon
one-line title
one-line explanation
CTA
```

---

# 28. Loading

Library:
skeleton cards.

Player:
retain old image until next decoded.

Avoid:
full-screen spinner during normal photo change.

---

# 29. Motion

Recommended:

```text
Photo crossfade: 220ms
Replace slot: 180–220ms
Control fade: 140ms
Modal: 180ms
Bottom sheet: 220ms
```

---

# 30. Player Inactivity

Desktop:
controls hide after ~2–3 sec inactivity.

Mobile:
controls hide after ~3 sec.

Any pointer/touch:
show controls again.

---

# 31. Session Timer Display

Timer refers to:
```text
time until next photo change
```

Session duration is available in menu/summary, not necessarily constantly visible.

---

# 32. Session Summary

After End:

```text
Duration
Photos Viewed
Liked
Favorites
Kept
```

CTA:
```text
Home
New Session
View Calendar
```

---

# 33. Responsive Behavior

Priority:
- preserve photo aspect experience,
- keep controls reachable,
- avoid tiny multi-photo slots.

At very small mobile widths:
5-photo mode may use scroll-free compact mosaic.

---

# 34. Desktop Keyboard Hints

Optional tooltip:
```text
Space Pause
→ Next
P Pin
```

Do not permanently display hints.

---

# 35. Privacy Visual

If Privacy Screen enabled:
background app snapshot becomes:
```text
neutral dark card + app icon
```

No photos.

---

# 36. High-Fidelity Acceptance

UI is ready for implementation when:
- all screens have component mapping,
- responsive layouts specified,
- hover/tap states specified,
- Pin visually unambiguous,
- Replace clearly localized,
- calendar information hierarchy approved,
- privacy states approved.

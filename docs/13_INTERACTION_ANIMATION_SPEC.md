# 13_INTERACTION_ANIMATION_SPEC.md
# Interaction & Motion Specification — Private Photo Fantasy Board

Version: 1.0

---

# 1. Principle

Motion should clarify state changes, not entertain.

Keywords:
```text
fast
subtle
predictable
localized
```

---

# 2. Player Transition

Default:
```text
Crossfade
```

Duration:
```text
220ms
```

Pinned slot:
```text
no transition
```

Unpinned slot:
```text
crossfade only
```

---

# 3. Replace One

Sequence:
```text
click Replace
↓
slot slightly dims
↓
next image already preloaded
↓
crossfade old → new
↓
actions remain available
```

Other slots:
```text
no movement
```

---

# 4. Pin

On Pin:
```text
badge appears
subtle 120ms scale/fade
```

No bouncing.

On Unpin:
```text
badge fades
```

---

# 5. Like

Like:
```text
icon fill transition 120ms
```

Optional tiny scale:
```text
1.00 → 1.08 → 1.00
```

---

# 6. Favorite

Same style as Like but no celebratory effect.

---

# 7. Keep

On success:
```text
icon → check
toast: Saved
```

---

# 8. Hide

On Hide:
```text
slot fades
replacement enters
toast with Undo
```

---

# 9. Focus Mode Enter

Desktop:
```text
photo expands/fades into focused surface
```

Mobile:
```text
simple fade/scale
```

Duration:
```text
180–240ms
```

---

# 10. Focus Mode Exit

Reverse animation.

Restore exact prior display state.

---

# 11. Player Controls

Inactivity:
```text
fade out
```

Pointer/touch:
```text
fade in 120–160ms
```

Controls must not shift layout.

---

# 12. Bottom Sheet

Enter:
```text
slide up 220ms
```

Exit:
```text
slide down 180ms
```

Backdrop fade:
```text
160ms
```

---

# 13. Modal

Scale:
```text
0.98 → 1.00
```

Fade:
```text
160–200ms
```

---

# 14. Navigation

Page transitions:
minimal.

Avoid full-screen animated transitions on desktop.

Mobile:
small fade/slide allowed.

---

# 15. Calendar Selection

Select date:
```text
surface state transition 120ms
```

No large animation.

---

# 16. Session Start

When user taps Start:
```text
validate
preload first display
fade configuration out
fade Player in
start timer after first display ready
```

Timer must not start before first visual state is ready.

---

# 17. Session End

Sequence:
```text
stop timer
freeze display
fade controls
show summary
```

---

# 18. Error Motion

No shake unless input-specific.

Use:
- inline error,
- toast,
- subtle focus.

---

# 19. Reduced Motion

When `prefers-reduced-motion`:
```text
replace crossfade with near-instant fade
disable scale
disable animated layout movement
```

---

# 20. Gesture Arbitration

Mobile:
- pinch zoom in Focus Mode overrides swipe navigation,
- horizontal swipe in Player changes display,
- vertical scroll not used in fullscreen Player.

---

# 21. Double Tap

Double tap:
```text
Like
```

Only if gesture enabled.

Feedback:
small heart indicator.

---

# 22. Long Press

Long press:
```text
open More Actions
```

Do not trigger browser selection/context menu where app wrapper permits.

---

# 23. Keyboard Timing

Holding arrow key:
do not rapidly skip uncontrolled.

Use:
```text
debounce / repeat limit
```

---

# 24. Preload Failure

If next photo not ready:
```text
keep current image
delay swap
```

Never show blank slot.

---

# 25. Localized Transition Rule

Any action targeting one slot:
```text
only that slot animates
```

Global Next:
```text
all unpinned slots animate
```

Pinned slots remain visually stable.

---

# 26. Motion Acceptance

Motion system is approved when:
- no jarring layout shifts,
- pinned slots remain stable,
- replace feels localized,
- controls do not obscure photos,
- reduced-motion works,
- session timer timing is not visually misleading.

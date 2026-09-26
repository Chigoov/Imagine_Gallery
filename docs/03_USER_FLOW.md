# 03_USER_FLOW.md
# User Flow — Private Photo Fantasy Board

## 1. Tujuan

Dokumen ini mendefinisikan alur pengguna dari membuka aplikasi sampai menyelesaikan session.

Fokus:
- jelas untuk UI/UX designer,
- jelas untuk frontend developer,
- jelas untuk AI coding agent,
- meminimalkan ambiguity.

---

# 2. Global Navigation

Desktop:
```text
HOME
LIBRARY
COLLECTIONS
PLAYER
CALENDAR
SETTINGS
```

Mobile:
```text
Home | Player | Library | Calendar
```

Settings diakses melalui profile/menu.

---

# 3. First Launch Flow

```text
OPEN APP
  ↓
Welcome
  ↓
Choose Privacy Mode
  ├── Local Only
  └── Sync Later
  ↓
Set App Lock? (optional)
  ↓
Add Photo Source
  ├── Select Folder
  ├── Select Photos
  └── Skip
  ↓
HOME
```

Prinsip:
- onboarding pendek,
- tidak memaksa account,
- tidak meminta semua permission sekaligus.

---

# 4. Home Flow

```text
HOME
├── Today Summary
├── Start Session
├── Continue Session
├── Recent Collections
├── Quick Add Photos
└── Calendar Shortcut
```

Today Summary:
```text
Sessions Today
Fantasy Time
App Usage (optional)
```

---

# 5. Add Photo Source Flow

```text
Home / Library
  ↓
Add Source
  ↓
Choose:
  ├── Folder
  ├── Files
  └── App Library
  ↓
Scan
  ↓
Preview Detected Photos
  ↓
Confirm
  ↓
Index Metadata
  ↓
Library Updated
```

Error:
```text
Permission denied
Folder unavailable
No supported images
Duplicate source
```

---

# 6. Create Collection Flow

```text
LIBRARY
  ↓
Collections
  ↓
+ New Collection
  ↓
Name
  ↓
Optional Description
  ↓
Create
  ↓
Add Photos
```

---

# 7. Start Session Flow

```text
HOME
  ↓
START SESSION
  ↓
Select Source
  ├── Collection
  ├── Favorites
  ├── Liked
  ├── All Photos
  └── Multiple Sources
  ↓
Session Setup
  ├── Photo Count 1–5
  ├── Auto / Manual
  ├── Interval
  ├── Layout
  ├── Shuffle Mode
  └── Background
  ↓
Preview
  ↓
START
  ↓
PLAYER
```

---

# 8. Player Main Flow

```text
PLAYER
  ├── Like
  ├── Favorite
  ├── Keep
  ├── Hide
  ├── Pin
  ├── Replace
  ├── Focus
  ├── Previous
  ├── Next
  ├── Play/Pause
  ├── Change Photo Count
  ├── Save Composition
  └── End Session
```

---

# 9. Pin Flow

```text
Photo Slot
  ↓
Pin
  ↓
Slot marked pinned
  ↓
Next / Auto
  ↓
Pinned photo remains
```

Unpin:
```text
Pinned Slot
  ↓
Unpin
  ↓
Current photo remains
  ↓
Eligible to change on next refresh
```

---

# 10. Replace One Photo Flow

```text
Slot
  ↓
Replace
  ↓
Select next candidate from active queue
  ↓
Only this slot changes
  ↓
Create new history state
```

Pinned slot:
```text
Pinned Slot
  ↓
Replace
  ↓
Replace current photo
  ↓
Keep slot pinned
```

---

# 11. Like Flow

```text
Photo
  ↓
Like
  ↓
Persist immediately
  ↓
Show:
Liked ✓
Add to Collection? (optional)
```

---

# 12. Keep Flow

```text
Photo
  ↓
Keep
  ↓
Choose Collection
  ↓
Choose Naming Rule
  ↓
Copy to App Library
  ↓
Persist metadata
  ↓
Saved ✓
```

If already kept:
```text
Already Saved
├── Add to another collection
├── Save duplicate anyway
└── Cancel
```

---

# 13. Hide Flow

```text
Photo
  ↓
Hide
  ↓
Remove from active pool
  ↓
Replace slot immediately
  ↓
Photo available in Hidden
```

---

# 14. Focus Mode Flow

```text
Tap / Click Photo
  ↓
Pause Player Timer
  ↓
Open Large Photo
  ↓
Actions:
Like / Favorite / Keep / Pin / Zoom
  ↓
Back
  ↓
Resume timer
```

---

# 15. Save Composition Flow

```text
Current Display
  ↓
Save Composition
  ↓
Name Composition
  ↓
Save:
- Photo IDs
- Positions
- Layout
- Pin States
- Background
  ↓
Saved Compositions
```

---

# 16. Session End Flow

```text
END SESSION
  ↓
Stop Timer
  ↓
Calculate Duration
  ↓
Persist Session
  ↓
Update Calendar
  ↓
Show Session Summary
```

Summary:
```text
Duration
Photos Viewed
Likes
Favorites
Kept
Pinned Peak
```

---

# 17. Background Flow

```text
Player Active
  ↓
App Background
  ↓
BACKGROUND_GRACE
  ↓
Return before timeout?
  ├── Yes → Resume
  └── No → End Session automatically
```

Default grace:
```text
2 minutes
```

---

# 18. Calendar Flow

```text
CALENDAR
  ↓
Select Date
  ↓
Daily Detail
  ├── Session Count
  ├── Total Duration
  ├── Session List
  └── Manual Entry
```

---

# 19. Manual Calendar Entry Flow

```text
Calendar
  ↓
+ Add
  ↓
Date
  ↓
Count
  ↓
Optional:
Time / Duration / Notes
  ↓
Save
  ↓
Update Daily Summary
```

---

# 20. Continue Session Flow

```text
HOME
  ↓
Continue Session
  ↓
Restore:
- Source
- Queue
- Current index
- Current slots
- Pin states
- Mode
- Interval
  ↓
PLAYER
```

---

# 21. Missing File Flow

```text
Open Photo
  ↓
Source Missing
  ↓
Options:
Locate File
Remove Reference
Ignore
```

---

# 22. Backup Flow

```text
SETTINGS
  ↓
Backup
  ↓
Choose:
Metadata Only
Metadata + Kept Photos
  ↓
Export
```

Restore:
```text
Import Backup
  ↓
Validate Version
  ↓
Preview
  ↓
Restore
```

---

# 23. Mobile Gesture Flow

```text
Swipe Left    → Next
Swipe Right   → Previous
Double Tap    → Like
Single Tap    → Show Controls / Focus
Long Press    → More Actions
```

Gestures can be disabled.

---

# 24. Desktop Shortcut Flow

```text
Space        → Play/Pause
Right Arrow  → Next
Left Arrow   → Previous
1–5          → Photo Count
P            → Pin selected
L            → Like selected
F            → Fullscreen
Esc          → Back
```

---

# 25. Primary Happy Path

```text
Open App
↓
Choose Collection
↓
Start 4-photo Session
↓
Pin Photo A
↓
Replace Photo C
↓
Like Photo D
↓
Keep Photo D
↓
Next
↓
End Session
↓
Calendar Updated
```

---

# 26. Core Flow Definition

Aplikasi dinyatakan usable jika happy path di atas dapat dilakukan tanpa user kehilangan:
- pin state,
- session state,
- collection state,
- timer,
- calendar data.

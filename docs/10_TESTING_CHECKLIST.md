# 10_TESTING_CHECKLIST.md
# Testing Checklist — Private Photo Fantasy Board

Version: 1.0

---

# 1. Test Priorities

Critical:
```text
Original File Safety
Pin
Replace One
No Repeat Shuffle
Session Duration
Calendar Aggregation
Persistence
```

High:
```text
Collections
Keep
Hide
Resume Session
Responsive Player
Backup
```

Normal:
```text
Transitions
Visual polish
Optional gestures
```

---

# 2. Source Tests

- [ ] Select supported photo files.
- [ ] Select folder where supported.
- [ ] Ignore unsupported files.
- [ ] Handle empty folder.
- [ ] Handle permission denied.
- [ ] Handle permission revoked later.
- [ ] Reopen known source.
- [ ] Detect missing source.
- [ ] Source removal does not delete physical files.
- [ ] Original filenames remain unchanged.

---

# 3. Library Tests

- [ ] Thumbnail grid loads.
- [ ] Large library scroll remains responsive.
- [ ] Like filter works.
- [ ] Favorite filter works.
- [ ] Kept filter works.
- [ ] Hidden filter works.
- [ ] Missing photo state renders.
- [ ] Search returns expected results.
- [ ] Reload preserves metadata.

---

# 4. Collection Tests

- [ ] Create collection.
- [ ] Rename collection.
- [ ] Delete collection.
- [ ] Deleting collection keeps photos.
- [ ] Add one photo.
- [ ] Add multiple photos.
- [ ] Remove photo from collection.
- [ ] Same photo exists in multiple collections.
- [ ] Removing from one collection keeps other memberships.

---

# 5. Player Count Tests

For each:
```text
1
2
3
4
5
```

- [ ] Correct number of slots.
- [ ] Desktop layout valid.
- [ ] Mobile layout valid.
- [ ] No duplicate photo in same screen.
- [ ] Change count while session active.
- [ ] Pinned photos prioritized when reducing count.

---

# 6. Pin Tests

- [ ] Pin one slot.
- [ ] Manual Next keeps pinned photo.
- [ ] Auto Next keeps pinned photo.
- [ ] Replace All keeps pinned photo.
- [ ] Pin several slots.
- [ ] All slots pinned causes no unwanted replacement.
- [ ] Unpin keeps current photo until next change.
- [ ] Replace pinned slot works.
- [ ] Replaced pinned slot remains pinned.
- [ ] Unpin All works.
- [ ] End Session clears temporary pins.
- [ ] Saved Composition restores saved pin states.

---

# 7. Replace One Tests

- [ ] Replace changes one slot only.
- [ ] Other slots remain identical.
- [ ] Other pinned slots remain pinned.
- [ ] New photo is not already visible.
- [ ] Hidden photo never selected.
- [ ] Filter-excluded photo never selected.
- [ ] Replace creates history state.
- [ ] Replace behaves correctly near end of queue.

---

# 8. Like Tests

- [ ] Like toggles on.
- [ ] Like persists instantly.
- [ ] Unlike works.
- [ ] Liked filter updates.
- [ ] Like does not duplicate file.
- [ ] Like remains after reload.

---

# 9. Favorite Tests

- [ ] Favorite toggles.
- [ ] Favorite works without Like.
- [ ] Favorites source works.
- [ ] Favorite persists after reload.

---

# 10. Keep Tests

- [ ] Keep copies photo to app storage.
- [ ] Original remains untouched.
- [ ] Choose destination collection.
- [ ] Original filename naming works.
- [ ] Collection-number naming works.
- [ ] Date-number naming works.
- [ ] Naming collision handled.
- [ ] Already-kept detection works.
- [ ] Add existing kept photo to another collection.
- [ ] Storage-full error handled.

---

# 11. Hide Tests

- [ ] Hide sets state.
- [ ] Hidden photo disappears from active queue.
- [ ] Hidden current photo replaced immediately.
- [ ] Hidden pinned photo loses active display.
- [ ] Hidden page shows item.
- [ ] Restore returns photo to eligible pool.

---

# 12. No Repeat Tests

- [ ] Queue includes all eligible photos once.
- [ ] No duplicate before cycle ends.
- [ ] New cycle reshuffles.
- [ ] Current display excluded from duplicate selection.
- [ ] Pinned photos excluded from candidate duplication.
- [ ] Small pool edge cases work.
- [ ] Pool smaller than slot count handled gracefully.

---

# 13. Pure Shuffle Tests

- [ ] Hidden excluded.
- [ ] Current visible excluded.
- [ ] Filters respected.
- [ ] No crash on one-photo pool.

---

# 14. Auto Mode Tests

- [ ] Timer starts.
- [ ] Next occurs at configured interval.
- [ ] Pause works.
- [ ] Resume works.
- [ ] Pin respected.
- [ ] Focus Mode pauses as defined.
- [ ] No blank flash during change.

---

# 15. Manual Mode Tests

- [ ] No auto transition.
- [ ] Next works.
- [ ] Previous works.
- [ ] Swipe works on mobile.
- [ ] Pin respected.

---

# 16. History Tests

- [ ] Previous restores prior photos.
- [ ] Previous restores prior positions.
- [ ] Previous restores pin states.
- [ ] History bounded to configured depth.
- [ ] Branch after state-changing action behaves correctly.

---

# 17. Focus Mode Tests

- [ ] Opens correct photo.
- [ ] Player timer pauses.
- [ ] Zoom works.
- [ ] Like works.
- [ ] Favorite works.
- [ ] Keep works.
- [ ] Pin works.
- [ ] Back returns to same display.
- [ ] Timer resumes correctly.

---

# 18. Session Start Tests

- [ ] Session starts with valid pool.
- [ ] Empty pool blocked.
- [ ] Source filter correct.
- [ ] Start time persisted.
- [ ] Initial display valid.

---

# 19. Session End Tests

- [ ] End button closes active session.
- [ ] End time persisted.
- [ ] Duration calculated.
- [ ] Calendar updated.
- [ ] Temporary pin cleared.
- [ ] Session summary correct.

---

# 20. Background Timer Tests

Default 120 sec:
- [ ] Background enters grace state.
- [ ] Return before timeout resumes.
- [ ] Timeout ends session.
- [ ] End time uses background start + grace.
- [ ] Pause-immediately setting works.
- [ ] 5-minute rule works.
- [ ] Keep-counting setting works.

---

# 21. Calendar Tests

- [ ] Automatic session creates entry.
- [ ] Daily count correct.
- [ ] Daily duration correct.
- [ ] Multiple sessions aggregate.
- [ ] Manual count adds.
- [ ] Manual duration adds when provided.
- [ ] Manual entry without duration does not inflate duration.
- [ ] Delete session recalculates daily aggregate.
- [ ] Day detail matches source sessions.

---

# 22. Statistics Tests

- [ ] Weekly count correct.
- [ ] Monthly count correct.
- [ ] Active days correct.
- [ ] Average excludes unknown-duration manual entries.
- [ ] Timezone/date boundaries handled.

---

# 23. Saved Composition Tests

- [ ] Save current display.
- [ ] Save layout.
- [ ] Save pin states.
- [ ] Load composition.
- [ ] Missing photo handled.
- [ ] Replace Missing works.
- [ ] Delete composition works.

---

# 24. Session Preset Tests

- [ ] Create preset.
- [ ] Load preset.
- [ ] Correct photo count.
- [ ] Correct interval.
- [ ] Correct shuffle mode.
- [ ] Correct layout mode.
- [ ] Delete preset.

---

# 25. Persistence Tests

After reload:
- [ ] Likes remain.
- [ ] Favorites remain.
- [ ] Hidden remain.
- [ ] Collections remain.
- [ ] Calendar remains.
- [ ] Settings remain.
- [ ] Saved compositions remain.

---

# 26. Crash Recovery

Simulate interruption:
- [ ] Active session snapshot stored.
- [ ] App offers resume.
- [ ] Queue restored.
- [ ] Current slots restored.
- [ ] Pin states restored.
- [ ] No duplicate corrupted entries.

---

# 27. Backup Tests

- [ ] Export metadata.
- [ ] Backup has schema version.
- [ ] Restore valid backup.
- [ ] Reject invalid backup.
- [ ] Reject unsupported schema.
- [ ] Preview restore.
- [ ] Existing data handling explicit.
- [ ] Original source files not altered.

---

# 28. Privacy Tests

- [ ] Sync off by default.
- [ ] Public sharing absent/off.
- [ ] App usage tracking off by default.
- [ ] App lock works.
- [ ] Lock after inactivity works.
- [ ] PIN not stored plaintext.
- [ ] Logs contain no full photo paths.
- [ ] Logs contain no notes.
- [ ] Kept cloud object not publicly accessible.
- [ ] Notification does not expose private content.

---

# 29. Responsive Tests

Desktop:
- [ ] 1024px.
- [ ] 1280px.
- [ ] 1440px+.

Tablet:
- [ ] 768–1023px.

Mobile:
- [ ] narrow portrait.
- [ ] standard portrait.
- [ ] landscape.

Player:
- [ ] 1–5 layouts never overflow.
- [ ] controls reachable.
- [ ] no critical control clipped.

---

# 30. Mobile Gesture Tests

- [ ] Swipe left.
- [ ] Swipe right.
- [ ] Double tap.
- [ ] Long press.
- [ ] Gestures can be disabled.
- [ ] Gesture does not conflict with image zoom.

---

# 31. Keyboard Tests

- [ ] Space.
- [ ] Left.
- [ ] Right.
- [ ] 1–5.
- [ ] P.
- [ ] L.
- [ ] F.
- [ ] Esc.
- [ ] Inputs do not accidentally trigger shortcuts while typing.

---

# 32. Performance Tests

Test with:
```text
1,000 photos
5,000 photos
10,000 photos
20,000 references
```

Check:
- [ ] initial indexing manageable.
- [ ] library does not freeze.
- [ ] player transition smooth.
- [ ] memory does not continuously leak.
- [ ] thumbnails lazy load.
- [ ] originals not all decoded at once.

---

# 33. Accessibility Tests

- [ ] keyboard navigation.
- [ ] visible focus state.
- [ ] icons have accessible labels.
- [ ] controls not color-only.
- [ ] touch target size.
- [ ] dialogs trap focus correctly.
- [ ] escape closes appropriate dialog.

---

# 34. Destructive Action Tests

- [ ] collection deletion warns appropriately.
- [ ] kept file deletion confirms.
- [ ] reset app confirms.
- [ ] no operation silently deletes original source.

---

# 35. Release Blocking Failures

Do not release if:
```text
Pin changes unexpectedly
Original files can be deleted accidentally
Session duration is materially wrong
Calendar totals are wrong
Private cloud objects are public
Reload loses core metadata
Player duplicates photo in same screen
```

---

# 36. V1 Acceptance Test

End-to-end:

```text
Add folder
→ create collection
→ start 4-photo session
→ pin slot 1
→ replace slot 3
→ like slot 4
→ keep slot 4
→ auto next
→ verify slot 1 remains
→ end session
→ open calendar
→ verify count + duration
→ reload
→ verify metadata persists
```

This flow must pass on:
```text
desktop browser
mobile viewport
```

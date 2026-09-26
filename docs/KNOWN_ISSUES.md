# KNOWN_ISSUES.md
# Known Issues & Environmental Considerations
## Private Photo Fantasy Board

**Last Updated:** September 23, 2026 (Post-V1 Quality Gate Audit)

---

### 1. Browser File System Access API Compatibility
- **Description:** `window.showDirectoryPicker()` is native in Chromium-based browsers (Chrome, Edge, Brave) on desktop, but is not supported on Firefox or iOS Safari.
- **Mitigation Implemented:** Dual-mode fallback implemented in `AddSourceModal.tsx`. If `showDirectoryPicker` is unavailable, the application falls back automatically to standard multi-file picker / drag-and-drop input without error or user interruption.

### 2. High Resolution Image Memory Footprint
- **Description:** Loading dozens of raw uncompressed 40MB camera photos simultaneously in DOM could cause browser memory pressure.
- **Mitigation Implemented:** Player strictly renders only 1 to 5 active slots. For large libraries, canvas thumbnail generation downscales previews to 320px for grid view. Raw binary image buffers are never stored in Dexie tables.

### 3. Native Background Execution in Web Browsers
- **Description:** Mobile web browsers may throttle timers when tabs are backgrounded.
- **Mitigation Implemented:** Rather than relying solely on active `setInterval` while backgrounded, `SessionTimerEngine` records absolute timestamps (`Date.now()`) on background entry and computes elapsed time accurately upon resume within the 120-second grace window.

### 4. High-DPI Display Scaling on Sub-Pixel Borders
- **Description:** On displays with fractional scale factors (e.g. 125% or 150% Windows scaling), 1px border lines may exhibit minor anti-aliasing variations.
- **Mitigation Implemented:** The player slot containers use `ring-2` with `ring-offset-1` rather than standalone CSS borders to ensure crisp outline geometry across arbitrary DPI scales.

### 5. Multi-Tab Session Synchronization
- **Description:** Running concurrent sessions across multiple browser tabs is deliberately discouraged for local-first single-user workflows.
- **Mitigation Implemented:** Dexie transactions isolate database mutations, and session state is scoped to the active browser tab to prevent cross-tab state corruption.

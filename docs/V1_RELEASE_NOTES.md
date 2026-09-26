# Release Notes Status — Private Photo Fantasy Board

**Release status:** Draft only. No V1 release candidate has been accepted or published.

## Current code changes

- Fresh installations start with an empty local library instead of fabricated photos and activity.
- IndexedDB migration clears identifiable demo rows and expired runtime image URLs while preserving other metadata.
- Photo import creates local previews; explicit Keep stores an app-owned copy. Source files remain read-only in the inspected code paths.
- Player history refreshes current photo state, and slot-count changes reject counts larger than the eligible photo source.
- Session records and their calendar entry save together. Backup restore persists as a local metadata merge and does not include photo bytes or PIN credentials.
- App reset states that it clears app-owned kept copies while leaving original source files untouched.
- Added an opt-in source for public Google Drive photo links with local link metadata, direct image loading from Google, and app-only link removal. Private links/folders and Google account login are not included.
- Service worker requests are limited to the app's own origin.

## Verification

- Automated tests: 74/74 passed.
- Production build: passed.
- Local desktop smoke check: passed for the empty-library screen.
- Real-photo workflow, live Drive rendering, physical-device, encrypted-backup, and complete responsive UAT: not verified.
- Android debug APK 1.1.0 (versionCode 2) built successfully after directing Java's temporary Unix-domain socket path to `C:\jtmp`. This is a locally signed debug package, not a Play Store release.

See `V1_RELEASE_READINESS.md` before making a release decision.

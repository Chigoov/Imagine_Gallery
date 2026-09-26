# 07_PRIVACY_SECURITY.md
# Privacy & Security Specification — Private Photo Fantasy Board

Version: 1.0
Priority: Critical

---

# 1. Security Philosophy

Produk ini menyimpan data pribadi dan koleksi foto yang dapat bersifat sensitif.

Prinsip utama:
```text
Private by Default
Local First
Minimum Data
Explicit Consent
Non-Destructive
Least Privilege
```

---

# 2. Default Privacy State

On first launch:
```text
Cloud Sync      OFF
Public Sharing  OFF
Analytics       OFF or Minimal
App Usage Track OFF
Notifications   Minimal
```

---

# 3. Local-Only Mode

Local-only must support:
```text
Photo Library
Collections
Player
Pin
Replace
Like
Favorite
Keep Local
Hide
Session Timer
Calendar
Settings
Backup Local
```

No account required.

## 3.1 Optional public Google Drive image links

The app may display a user-provided Drive image link only after the user opts in to that source. It supports public file links set to “Anyone with the link”; private/account-only files and folders are not supported in this flow.

- No Google sign-in, OAuth token, Drive API key, proxy, or upload is used.
- The browser requests the image directly from Google; Google receives those requests and the referrer is suppressed.
- A share URL/resource key is stored as local photo metadata and can be present in a JSON metadata backup. Anyone with the share link may access the file.
- Removing a link removes the app reference only. The Drive file is unchanged.
- Keep requires adding the image as a local file first; a remote Drive image is not copied by this feature.
- Link access can be revoked by changing the Drive sharing setting. Rendering can fail if Drive does not return the image inline.

---

# 4. Sync Mode

Sync must be opt-in.

Before enabling:
show clearly what may sync:
```text
Likes
Favorites
Collections
Tags
Calendar
Settings
Saved Compositions
Kept Photos
```

Source photos remain local unless explicitly kept/uploaded.

---

# 5. Sensitive Data Classes

## High sensitivity
```text
Photo files
Kept photos
Calendar notes
Collection names
Session history
Saved compositions
```

## Medium sensitivity
```text
Likes
Favorites
Usage duration
App settings
```

## Low sensitivity
```text
App version
Device type
Crash metadata without content
```

---

# 6. Data Minimization

Do not collect:
- unnecessary filenames,
- raw local paths on server,
- thumbnails for analytics,
- calendar notes in analytics,
- image content for telemetry.

---

# 7. Local Filesystem Safety

App must never:
- delete source photos by default,
- rename original files by default,
- move original files without explicit action.

All destructive actions require:
```text
explicit confirmation
```

---

# 8. App Lock

V1:
```text
PIN or password
```

V1.5+:
```text
Biometric unlock
```

Requirements:
- lock after configurable inactivity,
- lock when app reopens if enabled,
- never store raw PIN/password.

---

# 9. Credential Storage

Web:
- secure browser credential/session storage,
- httpOnly secure cookies preferred for web auth where applicable.

Mobile:
- OS secure storage / Keychain / Keystore.

Never store plaintext credentials in ordinary SQLite/IndexedDB.

---

# 10. Encryption

## At Rest

Server:
```text
database encryption at infrastructure layer
private object storage
```

Future vault:
```text
client-side encrypted file payloads
```

## In Transit

Cloud communication:
```text
HTTPS/TLS only
```

---

# 11. Private Object Storage

Kept photos stored in cloud:
- private bucket,
- no public URL,
- signed temporary access,
- ownership validation.

---

# 12. Metadata Privacy

Optional Keep flow:
```text
Strip EXIF
Strip GPS
Preserve Orientation
```

Default should avoid exposing unnecessary location metadata during upload.

---

# 13. Notification Privacy

Do not show:
- photo filenames,
- collection names,
- detailed session notes,
- private activity descriptions.

Preferred:
```text
Personal activity updated
```

or no notification.

---

# 14. Recent Apps Privacy

Mobile:
when app goes background:
```text
show neutral or blurred snapshot
```

If platform supports secure flag:
use it for sensitive screens.

---

# 15. Screenshot Policy

V1:
screenshots allowed by default.

Optional setting:
```text
Block screenshots on sensitive screens
```

Only where platform supports it.

---

# 16. Panic Exit

V2 feature.

Action:
```text
Stop session
Clear visible photo state
Open neutral screen
```

Must not:
- delete data,
- destroy session history unless configured.

---

# 17. Discreet Mode

Optional V2.

Can modify:
```text
App display name
Neutral icon
Neutral home screen
Neutral notifications
```

Within platform constraints.

---

# 18. Calendar Privacy

Calendar is local/private by default.

Calendar sync:
opt-in.

Notes:
- never required,
- should not appear in notification previews,
- should be encrypted in advanced mode.

---

# 19. Backup Security

Backup options:
```text
Metadata Only
Metadata + Kept Photos
Encrypted Backup
```

Encrypted backup:
- user-defined passphrase,
- key derived locally,
- never store passphrase in backup.

---

# 20. Restore Security

Before restore:
```text
Validate schema
Validate integrity
Preview impact
Require confirmation
```

---

# 21. Authentication Sessions

For sync account:
- short-lived access token,
- refresh mechanism,
- revoke device,
- sign out all sessions.

---

# 22. Device Management

Sync mode should later provide:
```text
Current Device
Other Devices
Last Active
Revoke Access
```

---

# 23. Permission Strategy

Ask only when needed.

Example:
```text
Photo access → when adding photos
Folder access → when selecting folder
Notifications → only if feature enabled
Biometric → only when app lock configured
```

No permission wall on first launch.

---

# 24. Logging Rules

Never log:
```text
photo binary
full filesystem path
calendar note content
collection private names
auth token
password
PIN
encryption key
```

Safe logs:
```text
error code
app version
anonymous performance metrics
```

---

# 25. Analytics

Default:
```text
disabled or privacy-minimal
```

If enabled:
track:
```text
screen load time
crash event
generic feature usage
```

Do not track:
```text
which photo
which collection
session notes
image metadata
```

---

# 26. Session Privacy

Session history should be deletable independently.

User can:
```text
Delete one session
Delete date history
Clear all session history
```

Calendar aggregates must recalculate after deletion.

---

# 27. Data Deletion

Local:
```text
Clear metadata
Clear kept files
Clear calendar
Reset app
```

Cloud:
```text
Delete account data
Delete kept objects
Delete sync metadata
```

Deletion should be explicit and scoped.

---

# 28. Retention

Local:
user controls retention.

Cloud:
retain only while account/sync active unless user deletes sooner.

No unnecessary indefinite telemetry retention.

---

# 29. Threat Model

Main threats:
```text
Unauthorized local access
Leaked cloud object URL
Stolen auth session
Accidental source deletion
Sensitive preview in recent apps
Backup exposure
Sync conflict causing data loss
```

---

# 30. Security Controls by Threat

Unauthorized local access:
```text
App Lock
Biometric
Privacy Screen
```

Cloud leakage:
```text
Private storage
Signed URLs
Ownership checks
TLS
```

Accidental deletion:
```text
Non-destructive defaults
Confirmation
Backup
```

Sync loss:
```text
Versioning
Conflict handling
Tombstones
Backup
```

---

# 31. Local Database Security

V1:
standard local database.

V2:
optional encrypted database.

Sensitive fields candidates:
```text
notes
collection names
session metadata
```

---

# 32. File Naming Privacy

If Keep photo uses custom naming:
warn that filenames may reveal private collection names if exported.

Offer:
```text
Private internal filename
Display name only
```

Recommended internal:
```text
UUID-based filename
```

Display name can remain user-friendly.

---

# 33. Internal vs Display Filename

Recommended:
```text
internal_file = UUID.jpg
display_name = Collection-A_001.jpg
```

Benefits:
- fewer filename collisions,
- less privacy leakage,
- easier sync.

---

# 34. Sync Conflict Security

Never silently delete newer data because of stale client state.

Use:
```text
version
updated_at
device_id
deleted_at
```

---

# 35. Secure Defaults Summary

```text
Local Only        ON
Cloud Sync        OFF
Public Sharing    OFF
Analytics         OFF
App Usage Track   OFF
Original Delete   NEVER automatic
EXIF Upload       minimize
Private Storage   ON
```

---

# 36. Security Acceptance Checklist

Before release:
- no public photo bucket,
- no plaintext PIN,
- no full path in logs,
- no automatic source deletion,
- sync ownership tests pass,
- backup import validates schema,
- app lock works,
- background privacy tested,
- calendar data can be deleted,
- account logout invalidates remote session where applicable.

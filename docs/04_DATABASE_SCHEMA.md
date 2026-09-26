# 04_DATABASE_SCHEMA.md
# Database Schema — Private Photo Fantasy Board

## 1. Tujuan

Dokumen ini mendefinisikan skema database konseptual untuk versi awal.

Arsitektur diarahkan agar bisa mendukung:
- local-first,
- offline,
- sync optional,
- web,
- mobile.

---

# 2. Entity Overview

```text
User
Device
Photo
PhotoSource
Collection
PhotoCollection
Tag
PhotoTag
Session
SessionDisplayState
SessionSlot
CalendarEntry
SavedComposition
SavedCompositionSlot
SessionPreset
Setting
BackupRecord
```

---

# 3. User

```sql
User
----
id                  UUID PK
email               TEXT NULL
display_name        TEXT NULL
privacy_mode        TEXT NOT NULL
sync_enabled        BOOLEAN DEFAULT false
created_at          DATETIME
updated_at          DATETIME
```

Privacy mode:
```text
local_only
sync_enabled
```

---

# 4. Device

```sql
Device
------
id                  UUID PK
user_id             UUID NULL FK User
device_name         TEXT
device_type         TEXT
platform            TEXT
last_seen_at        DATETIME
created_at          DATETIME
```

device_type:
```text
desktop
mobile
tablet
web
```

---

# 5. PhotoSource

```sql
PhotoSource
-----------
id                  UUID PK
user_id             UUID NULL
device_id           UUID NULL
source_type         TEXT NOT NULL
display_name        TEXT
root_path           TEXT NULL
permission_state    TEXT
available           BOOLEAN DEFAULT true
created_at          DATETIME
updated_at          DATETIME
```

source_type:
```text
local_folder
local_file
app_storage
cloud_storage
mobile_gallery
```

---

# 6. Photo

```sql
Photo
-----
id                  UUID PK
user_id             UUID NULL
source_id           UUID NULL FK PhotoSource

original_filename   TEXT
display_name        TEXT
relative_path       TEXT NULL
internal_path       TEXT NULL

mime_type           TEXT
file_size           INTEGER NULL
width               INTEGER NULL
height              INTEGER NULL
orientation         TEXT NULL

content_hash        TEXT NULL
perceptual_hash     TEXT NULL

liked               BOOLEAN DEFAULT false
favorite            BOOLEAN DEFAULT false
hidden              BOOLEAN DEFAULT false
kept                BOOLEAN DEFAULT false
missing             BOOLEAN DEFAULT false

view_count          INTEGER DEFAULT 0
last_viewed_at      DATETIME NULL
first_seen_at       DATETIME
created_at          DATETIME
updated_at          DATETIME
```

orientation:
```text
portrait
landscape
square
unknown
```

---

# 7. Collection

```sql
Collection
----------
id                  UUID PK
user_id             UUID NULL
name                TEXT NOT NULL
description         TEXT NULL
cover_photo_id      UUID NULL
sort_order          INTEGER DEFAULT 0
created_at          DATETIME
updated_at          DATETIME
```

---

# 8. PhotoCollection

Many-to-many.

```sql
PhotoCollection
---------------
photo_id            UUID FK Photo
collection_id       UUID FK Collection
added_at            DATETIME

PRIMARY KEY(photo_id, collection_id)
```

---

# 9. Tag

```sql
Tag
---
id                  UUID PK
user_id             UUID NULL
name                TEXT NOT NULL
created_at          DATETIME
```

---

# 10. PhotoTag

```sql
PhotoTag
--------
photo_id            UUID FK Photo
tag_id              UUID FK Tag
created_at          DATETIME

PRIMARY KEY(photo_id, tag_id)
```

---

# 11. Session

```sql
Session
-------
id                  UUID PK
user_id             UUID NULL
device_id           UUID NULL

status              TEXT NOT NULL
mode                TEXT NOT NULL
shuffle_mode        TEXT NOT NULL
layout_mode         TEXT NOT NULL

photo_count         INTEGER NOT NULL
interval_seconds    INTEGER NULL

started_at          DATETIME
ended_at            DATETIME NULL
duration_seconds    INTEGER DEFAULT 0

background_rule     TEXT
background_grace    INTEGER DEFAULT 120

photos_viewed       INTEGER DEFAULT 0
likes_count         INTEGER DEFAULT 0
favorites_count     INTEGER DEFAULT 0
kept_count          INTEGER DEFAULT 0

created_at          DATETIME
updated_at          DATETIME
```

status:
```text
active
paused
background_grace
ended
abandoned
```

mode:
```text
auto
manual
```

---

# 12. SessionSource

```sql
SessionSource
-------------
id                  UUID PK
session_id          UUID FK Session
source_kind         TEXT
source_ref_id       UUID NULL
created_at          DATETIME
```

source_kind:
```text
collection
favorites
liked
all_photos
photo_source
```

---

# 13. SessionDisplayState

Mewakili satu layar/tampilan pada player.

```sql
SessionDisplayState
-------------------
id                  UUID PK
session_id          UUID FK Session
state_index         INTEGER
layout_key          TEXT
created_at          DATETIME
```

---

# 14. SessionSlot

```sql
SessionSlot
-----------
id                  UUID PK
display_state_id    UUID FK SessionDisplayState
slot_index          INTEGER
photo_id            UUID FK Photo
pinned              BOOLEAN DEFAULT false
created_at          DATETIME
```

Unique:
```text
(display_state_id, slot_index)
```

---

# 15. PhotoEvent

Untuk event penting selama session.

```sql
PhotoEvent
----------
id                  UUID PK
session_id          UUID FK Session
photo_id            UUID FK Photo
event_type          TEXT
slot_index          INTEGER NULL
created_at          DATETIME
```

event_type:
```text
view
like
unlike
favorite
unfavorite
keep
hide
pin
unpin
replace
focus
```

---

# 16. CalendarEntry

```sql
CalendarEntry
-------------
id                  UUID PK
user_id             UUID NULL
session_id          UUID NULL FK Session

entry_date          DATE NOT NULL
manual              BOOLEAN DEFAULT false

count_value         INTEGER DEFAULT 1
started_at          DATETIME NULL
ended_at            DATETIME NULL
duration_seconds    INTEGER NULL
notes               TEXT NULL

created_at          DATETIME
updated_at          DATETIME
```

---

# 17. DailyAggregate

Opsional untuk cache performa.

```sql
DailyAggregate
--------------
user_id             UUID NULL
entry_date          DATE
session_count       INTEGER DEFAULT 0
total_duration      INTEGER DEFAULT 0
known_duration_count INTEGER DEFAULT 0
updated_at          DATETIME

PRIMARY KEY(user_id, entry_date)
```

---

# 18. SavedComposition

```sql
SavedComposition
----------------
id                  UUID PK
user_id             UUID NULL
name                TEXT NOT NULL
layout_key          TEXT
background_key      TEXT
photo_count         INTEGER
created_at          DATETIME
updated_at          DATETIME
```

---

# 19. SavedCompositionSlot

```sql
SavedCompositionSlot
--------------------
composition_id      UUID FK SavedComposition
slot_index          INTEGER
photo_id            UUID FK Photo
pinned              BOOLEAN DEFAULT false

PRIMARY KEY(composition_id, slot_index)
```

---

# 20. SessionPreset

```sql
SessionPreset
-------------
id                  UUID PK
user_id             UUID NULL
name                TEXT NOT NULL

photo_count         INTEGER
mode                TEXT
interval_seconds    INTEGER
layout_mode         TEXT
shuffle_mode        TEXT
background_key      TEXT

created_at          DATETIME
updated_at          DATETIME
```

---

# 21. PresetSource

```sql
PresetSource
------------
preset_id           UUID FK SessionPreset
source_kind         TEXT
source_ref_id       UUID NULL
```

---

# 22. FileNamingRule

```sql
FileNamingRule
--------------
id                  UUID PK
user_id             UUID NULL
name                TEXT
template            TEXT
is_default          BOOLEAN DEFAULT false
created_at          DATETIME
```

Template:
```text
{original}
{collection}_{number}
{collection}_{date}_{number}
```

---

# 23. AppSetting

```sql
AppSetting
----------
id                  UUID PK
user_id             UUID NULL
device_id           UUID NULL
setting_key         TEXT
setting_value       JSON
updated_at          DATETIME
```

Device-specific setting diperbolehkan.

---

# 24. AppUsageSession

Opsional.

```sql
AppUsageSession
---------------
id                  UUID PK
user_id             UUID NULL
device_id           UUID NULL
started_at          DATETIME
ended_at            DATETIME NULL
duration_seconds    INTEGER NULL
```

---

# 25. BackupRecord

```sql
BackupRecord
------------
id                  UUID PK
user_id             UUID NULL
schema_version      INTEGER
created_at          DATETIME
file_reference      TEXT NULL
status              TEXT
```

---

# 26. SyncState

Untuk future sync.

```sql
SyncState
---------
entity_type         TEXT
entity_id           UUID
device_id           UUID
version             INTEGER
last_synced_at      DATETIME
dirty               BOOLEAN DEFAULT false
```

---

# 27. Index Recommendations

```sql
Photo(source_id)
Photo(liked)
Photo(favorite)
Photo(hidden)
Photo(kept)
Photo(last_viewed_at)

PhotoCollection(collection_id)
PhotoCollection(photo_id)

Session(started_at)
Session(status)

CalendarEntry(entry_date)
CalendarEntry(session_id)

PhotoEvent(session_id)
PhotoEvent(photo_id)
```

---

# 28. Local Database Recommendation

Web/PWA:
```text
IndexedDB
```

Native/mobile wrapper:
```text
SQLite
```

Server sync:
```text
PostgreSQL
```

Skema logis harus tetap konsisten.

---

# 29. Sync Design Principle

Server tidak harus menyimpan semua Source Photo.

Server hanya wajib menyimpan:
```text
metadata
collections
likes
favorites
calendar
settings
kept photo references / objects
```

---

# 30. Deletion Rules

Collection deletion:
```text
delete relation
keep photos
```

Photo reference deletion:
```text
delete app metadata
keep original file
```

Kept photo deletion:
```text
require confirmation
delete internal copy
```

---

# 31. Integrity Rules

- satu slot hanya memiliki satu photo,
- satu photo tidak boleh muncul dua kali pada display state yang sama,
- photo hidden tidak boleh masuk new queue,
- pinned photo tetap valid selama source tersedia,
- missing file tidak boleh membuat app crash.

---

# 32. Schema Versioning

Semua database lokal dan backup harus memiliki:
```text
schema_version
```

Migration wajib incremental.

---

# 33. V1 Required Tables

Minimum:
```text
PhotoSource
Photo
Collection
PhotoCollection
Session
SessionDisplayState
SessionSlot
CalendarEntry
SavedComposition
SavedCompositionSlot
SessionPreset
AppSetting
```

---

# 34. V2 Tables

Tambahan:
```text
Tag
PhotoTag
PhotoEvent
DailyAggregate
AppUsageSession
SyncState
BackupRecord
```

---

# 35. Security Notes

Jangan simpan:
- password plaintext,
- biometric data,
- encryption key plaintext dalam database biasa.

Sensitive local fields dapat dienkripsi di versi lanjutan.


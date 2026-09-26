# 06_API_SPECIFICATION.md
# API Specification — Private Photo Fantasy Board

Version: 1.0
Target: Web / PWA / Mobile
Architecture: Local-First with Optional Sync

---

# 1. Tujuan

Dokumen ini mendefinisikan kontrak API konseptual antara:

- frontend,
- local data layer,
- optional cloud backend,
- sync engine,
- storage service.

Catatan:
V1 tidak wajib menggunakan server untuk seluruh fitur.
Sebagian besar operasi dapat berjalan lokal.

---

# 2. API Domains

```text
/auth
/devices
/photo-sources
/photos
/collections
/tags
/sessions
/calendar
/compositions
/presets
/settings
/backups
/sync
```

---

# 3. Authentication Strategy

V1 local-only:
```text
No account required
```

Sync mode:
```text
Email / OAuth / Passwordless
```

Recommended:
```text
Passwordless email or OAuth
```

API auth:
```text
Bearer token
```

---

# 4. General Response Shape

Success:
```json
{
  "ok": true,
  "data": {}
}
```

Error:
```json
{
  "ok": false,
  "error": {
    "code": "PHOTO_NOT_FOUND",
    "message": "Photo not found"
  }
}
```

---

# 5. Pagination

Standard:
```text
cursor-based pagination
```

Example request:
```text
GET /photos?limit=50&cursor=abc
```

Response:
```json
{
  "items": [],
  "next_cursor": "def"
}
```

---

# 6. Photo Source API

## GET /photo-sources

Returns available registered sources.

## POST /photo-sources

Create a new logical source record.

Request:
```json
{
  "source_type": "local_folder",
  "display_name": "Collection A"
}
```

Note:
Physical filesystem access is handled client-side.
The server should not receive a local path unless explicitly required for sync metadata.

## DELETE /photo-sources/{id}

Removes source reference only.

Does not delete physical source files.

---

# 7. Photo API

## GET /photos

Filters:
```text
collection_id
liked
favorite
hidden
kept
orientation
search
source_id
```

Example:
```text
GET /photos?liked=true&hidden=false
```

## GET /photos/{id}

Returns metadata.

## PATCH /photos/{id}

Allowed fields:
```text
display_name
liked
favorite
hidden
```

## DELETE /photos/{id}

Deletes app reference.

Physical source file deletion is forbidden by default.

---

# 8. Photo Action Endpoints

## POST /photos/{id}/like

```json
{
  "liked": true
}
```

## POST /photos/{id}/favorite

```json
{
  "favorite": true
}
```

## POST /photos/{id}/hide

```json
{
  "hidden": true
}
```

## POST /photos/{id}/keep

For sync/server storage only.

Response:
```json
{
  "kept": true,
  "storage_id": "..."
}
```

Local-only keep is handled by device storage layer.

---

# 9. Collection API

## GET /collections

## POST /collections

Request:
```json
{
  "name": "Collection A",
  "description": ""
}
```

## GET /collections/{id}

## PATCH /collections/{id}

## DELETE /collections/{id}

Collection deletion never deletes photos.

---

# 10. Collection Membership

## POST /collections/{id}/photos

```json
{
  "photo_ids": ["id1", "id2"]
}
```

## DELETE /collections/{id}/photos/{photo_id}

Removes relationship only.

---

# 11. Session API

## POST /sessions

Request:
```json
{
  "mode": "auto",
  "shuffle_mode": "no_repeat",
  "layout_mode": "dynamic",
  "photo_count": 4,
  "interval_seconds": 7,
  "sources": [
    {
      "kind": "collection",
      "id": "collection-id"
    }
  ]
}
```

Response:
```json
{
  "session_id": "...",
  "status": "active",
  "started_at": "..."
}
```

---

# 12. Session State

## GET /sessions/{id}

## PATCH /sessions/{id}

Allowed:
```text
status
photo_count
interval_seconds
layout_mode
shuffle_mode
```

---

# 13. Session End

## POST /sessions/{id}/end

Request:
```json
{
  "ended_at": "...",
  "duration_seconds": 1234
}
```

Server validates:
```text
duration >= 0
ended_at >= started_at
```

---

# 14. Session Display State

## POST /sessions/{id}/states

Request:
```json
{
  "state_index": 12,
  "layout_key": "grid_4",
  "slots": [
    {"slot_index": 0, "photo_id": "a", "pinned": true},
    {"slot_index": 1, "photo_id": "b", "pinned": false}
  ]
}
```

Use primarily for:
- resume,
- history sync,
- saved session state.

Local mode may store this only locally.

---

# 15. Session Events

## POST /sessions/{id}/events

Request:
```json
{
  "photo_id": "photo-id",
  "event_type": "pin",
  "slot_index": 0,
  "created_at": "..."
}
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

# 16. Calendar API

## GET /calendar

Query:
```text
from
to
```

## GET /calendar/{date}

Returns:
```text
session_count
total_duration
entries
```

## POST /calendar/manual-entry

Request:
```json
{
  "entry_date": "2026-09-23",
  "count_value": 1,
  "duration_seconds": 1200,
  "notes": null
}
```

## DELETE /calendar/entries/{id}

Only removes selected calendar entry.

---

# 17. Statistics API

## GET /stats/daily

## GET /stats/weekly

## GET /stats/monthly

Response shape:
```json
{
  "sessions": 12,
  "total_duration_seconds": 14400,
  "active_days": 6,
  "average_session_seconds": 1200
}
```

---

# 18. Saved Composition API

## GET /compositions

## POST /compositions

Request:
```json
{
  "name": "Composition 01",
  "layout_key": "mosaic_5",
  "background_key": "black",
  "slots": [
    {"slot_index": 0, "photo_id": "a", "pinned": true}
  ]
}
```

## PATCH /compositions/{id}

## DELETE /compositions/{id}

---

# 19. Session Preset API

## GET /presets

## POST /presets

Request:
```json
{
  "name": "Preset A",
  "photo_count": 3,
  "mode": "auto",
  "interval_seconds": 8,
  "layout_mode": "dynamic",
  "shuffle_mode": "no_repeat",
  "background_key": "black"
}
```

## PATCH /presets/{id}

## DELETE /presets/{id}

---

# 20. Settings API

## GET /settings

## PATCH /settings

Suggested keys:
```text
default_photo_count
default_interval
default_shuffle_mode
background_timeout
history_depth
privacy_mode
app_usage_tracking
theme
```

---

# 21. Backup API

## POST /backups/export

Options:
```json
{
  "include_metadata": true,
  "include_kept_photos": false
}
```

## POST /backups/import

Must:
- validate schema version,
- validate user scope,
- preview changes,
- require confirmation before destructive overwrite.

---

# 22. Sync API

## POST /sync/push

Push local changes.

## POST /sync/pull

Pull remote changes.

## POST /sync/resolve

Resolve conflict.

Conflict strategy:
```text
last-write-wins for simple preferences
merge for collections/tags
manual or version-aware merge for complex entities
```

---

# 23. Sync Entity Versioning

Each syncable entity should include:
```text
version
updated_at
deleted_at nullable
device_id
```

---

# 24. File Upload API

Only for:
```text
Kept Photos
Optional Backup
Optional Sync Assets
```

Never automatically upload all source photos.

Suggested:
```text
signed upload URLs
```

---

# 25. Local API Layer

For local-only mode, expose the same service interface internally.

Example conceptual interface:
```ts
photoService.list()
photoService.like(id)
collectionService.create()
sessionService.start()
calendarService.getDay()
```

This keeps frontend independent from local/cloud implementation.

---

# 26. Error Codes

Suggested:
```text
SOURCE_UNAVAILABLE
PHOTO_NOT_FOUND
PHOTO_MISSING
COLLECTION_NOT_FOUND
SESSION_NOT_FOUND
INVALID_SESSION_STATE
PERMISSION_DENIED
STORAGE_FULL
SYNC_CONFLICT
BACKUP_INVALID
UNSUPPORTED_SCHEMA
AUTH_REQUIRED
RATE_LIMITED
```

---

# 27. Security Rules

- never trust client ownership fields,
- validate entity ownership server-side,
- never expose local filesystem path publicly,
- use signed object access for private kept photos,
- avoid logging filenames and private collection names,
- rate-limit auth and sync endpoints.

---

# 28. API Versioning

Start:
```text
/api/v1
```

Breaking changes:
```text
/api/v2
```

---

# 29. V1 Required APIs

If server sync is implemented:
```text
auth
collections
photos metadata
sessions
calendar
settings
sync
kept-photo upload
```

Local-only V1 can use service-layer equivalents without HTTP.

---

# 30. Definition of API Ready

API layer is ready when:
- service contracts are typed,
- ownership checks exist,
- error codes are consistent,
- local and cloud adapters share a compatible interface,
- session/calendar flow is covered,
- sync does not require uploading all source photos.

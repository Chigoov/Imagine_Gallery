# Public Google Drive Photo Links — Feature Addendum

This is an optional online photo source alongside the local-first library. It does not turn on account sync.

## Included behavior

- Accept one or more Google Drive **file** links from `drive.google.com` (`/file/d/...`, `/open?id=...`, or `/uc?id=...`). Reject folders, non-HTTPS URLs, and other hosts.
- Require the user to acknowledge that images are requested directly from Google and that anyone with the link may be able to access the file.
- Preserve `resourcekey` when converting a share link to an image preview URL.
- Store the share URL and photo metadata in local IndexedDB. Load the image from Google only when the browser displays it; do not proxy, upload, or request a Google login.
- Let the user remove the app's photo reference without changing the Drive file.
- Require a local file before Keep can save an app-owned copy.

## Limits and verification

- Public links only; private Drive files and folders are out of scope for this flow.
- A valid share page does not guarantee Drive will serve the file inline as an image. Revoked access, unsupported content, or Drive response changes can prevent display.
- The JSON metadata backup can include share URLs/resource keys. The backup is not encrypted.
- Automated checks cover URL validation, key preservation, metadata persistence, and app-only removal. Verify rendering using an actual user-provided public image link before relying on it.

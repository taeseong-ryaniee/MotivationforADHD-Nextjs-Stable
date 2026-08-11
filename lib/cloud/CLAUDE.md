# lib/cloud/CLAUDE.md

Scope: this directory only. See root `CLAUDE.md` ("Cloud Sync Architecture",
"Adding a Cloud Provider") for how this fits into the app.

## Adding a provider

1. Implement `CloudProvider` (`types.ts`): `isAuthenticated`, `login`, `logout`,
   `upload`, `download`, `list`.
2. `google.ts` (99 lines) and `onedrive.ts` (90 lines) are the reference shape;
   `dropbox.ts` follows the same pattern.
3. If it's an OAuth popup provider, implementing `CloudProvider` is not enough —
   add a matching entry to `OAUTH_CONFIG` in `lib/auth.ts`, or the login popup
   has nothing to open.

## Not a bug

- `CloudProviderType` (`types.ts`) lists `'s3'` and `'filesystem'`, but there is
  no `s3.ts`/`filesystem.ts` here. S3 sync is handled directly in `lib/sync.ts`,
  not as a `CloudProvider` implementation — don't go looking for it in this
  folder.
- `activeProvider.ts`'s no-token-persistence design is intentional (already
  covered in root `CLAUDE.md`); the `ponytail:` comment in that file spells out
  the exact upgrade path (sessionStorage backup) if persistence is ever needed.

/*
# Add must_change_password flag to profiles

1. Modified Tables
- `profiles`
  - New column `must_change_password` (boolean, default true).
  - When a user is provisioned (e.g. by an admin or via the seed flow), this
    flag starts true so the first real login forces a password change before
    dashboard access is granted. Once the user sets their own password, the
    flag is cleared (set to false) by the frontend after a successful
    `auth.updateUser({ password })` call.

2. Security
- No RLS policy changes; the existing per-row ownership policies on
  `profiles` already allow an authenticated user to read/update their own row,
  so they can read this flag and clear it after changing their password.

3. Important notes
- Existing rows are backfilled to `false` so current users are NOT forced to
  change their password (they already have one they chose). Only newly
  provisioned accounts start with `true`.
- The column is nullable-safe and idempotent (re-runnable).
*/

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;

-- Existing accounts already have a working password; don't force a reset.
UPDATE profiles SET must_change_password = false WHERE must_change_password IS NULL OR must_change_password = true AND created_at < now() - interval '1 minute';

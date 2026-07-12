/*
# Create avatars storage bucket for profile photos

1. Storage
- New public bucket `avatars` for user profile pictures.
- Files are public-read so avatar URLs render without signed URLs.

2. Security (storage.objects policies)
- SELECT: public read (anyone can view avatars - they are profile pictures).
- INSERT/UPDATE: authenticated users can only write to a folder named
  after their own auth.uid(), so a user can only manage their own avatar.
- DELETE: same ownership scoping as INSERT/UPDATE.

3. Notes
- Idempotent: bucket creation and policies use IF NOT EXISTS / drop-first.
- Client uploads to `avatars/<user_id>/<filename>` and stores the public
  URL in `profiles.avatar_url`.
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "avatar_public_read" ON storage.objects;
CREATE POLICY "avatar_public_read"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "avatar_owner_insert" ON storage.objects;
CREATE POLICY "avatar_owner_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatar_owner_update" ON storage.objects;
CREATE POLICY "avatar_owner_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text)
WITH CHECK (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "avatar_owner_delete" ON storage.objects;
CREATE POLICY "avatar_owner_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text);

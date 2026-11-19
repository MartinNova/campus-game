-- Pictures in chats. Run once after 20261118020000_padel_requests.sql (Supabase SQL Editor).
-- See docs/accounts.md.

-- A message is text, a picture, or both.
alter table public.messages add column image_path text;
alter table public.messages alter column body set default '';
alter table public.messages drop constraint messages_body_check;
alter table public.messages add constraint messages_content_check check (
  char_length(btrim(body)) <= 1000
  and (char_length(btrim(body)) >= 1 or image_path is not null)
);

-- The picture must sit in the sender's folder for this chat: <sender>/<recipient>/<file>.
alter table public.messages add constraint messages_image_path_check check (
  image_path is null
  or image_path like sender_id::text || '/' || recipient_id::text || '/%'
);

-- Private bucket: pictures load through short-lived signed links. Max. 2 MB, JPEG only
-- (the app resizes every picture before sending).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('message-images', 'message-images', false, 2097152, array['image/jpeg']);

-- Only the two people in a chat can see its pictures; only the sender can upload or remove.
create policy "Chat members view chat pictures"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'message-images'
    and (select auth.uid())::text in ((storage.foldername(name))[1], (storage.foldername(name))[2])
  );
create policy "Senders upload chat pictures"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'message-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Senders remove chat pictures"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'message-images'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

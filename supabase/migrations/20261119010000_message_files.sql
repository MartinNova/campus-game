-- Files in chats (PDF, Office, text, ZIP). Run once after 20261119000000_message_images.sql
-- (Supabase SQL Editor). See docs/accounts.md.

alter table public.messages
  add column file_path text,
  add column file_name text check (char_length(file_name) <= 255),
  add column file_size integer check (file_size between 1 and 10485760),
  add column file_type text;

-- A message is text, a picture, a file, or text plus one attachment.
alter table public.messages drop constraint messages_content_check;
alter table public.messages add constraint messages_content_check check (
  char_length(btrim(body)) <= 1000
  and (char_length(btrim(body)) >= 1 or image_path is not null or file_path is not null)
);

-- File details come together, and the file sits in the sender's folder for this chat.
alter table public.messages add constraint messages_file_check check (
  (file_path is null and file_name is null and file_size is null and file_type is null)
  or (
    file_path is not null and file_name is not null and file_size is not null
    and file_type is not null
    and file_path like sender_id::text || '/' || recipient_id::text || '/%'
  )
);

-- Private bucket: files download through short-lived signed links. Max. 10 MB.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'message-files', 'message-files', false, 10485760,
  array[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    'application/zip'
  ]
);

-- Only the two people in a chat can download its files; only the sender can upload or remove.
create policy "Chat members download chat files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'message-files'
    and (select auth.uid())::text in ((storage.foldername(name))[1], (storage.foldername(name))[2])
  );
create policy "Senders upload chat files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'message-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
create policy "Senders remove chat files"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'message-files'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

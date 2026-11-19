-- Group chats (like WhatsApp groups): name, picture, members with admins.
-- Run once after 20261119010000_message_files.sql (Supabase SQL Editor). See docs/accounts.md.

create table public.chat_groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 1 and 50),
  -- Picture in the private `group-photos` bucket: <group id>/<file>.jpg
  photo_path text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  check (photo_path is null or photo_path like id::text || '/%')
);

create table public.chat_group_members (
  group_id uuid not null references public.chat_groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  -- Messages after this are unread for the member.
  last_read_at timestamptz not null default 'epoch',
  primary key (group_id, user_id)
);

create index chat_group_members_user_idx on public.chat_group_members (user_id);

create table public.group_messages (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.chat_groups (id) on delete cascade,
  sender_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null default '',
  image_path text,
  file_path text,
  file_name text check (char_length(file_name) <= 255),
  file_size integer check (file_size between 1 and 10485760),
  file_type text,
  created_at timestamptz not null default now(),
  -- Text, a picture, a file, or text plus one attachment.
  check (
    char_length(btrim(body)) <= 1000
    and (char_length(btrim(body)) >= 1 or image_path is not null or file_path is not null)
  ),
  -- Attachments sit in the sender's folder of this group: groups/<group>/<sender>/...
  check (image_path is null or image_path like 'groups/' || group_id::text || '/' || sender_id::text || '/%'),
  check (
    (file_path is null and file_name is null and file_size is null and file_type is null)
    or (
      file_path is not null and file_name is not null and file_size is not null
      and file_type is not null
      and file_path like 'groups/' || group_id::text || '/' || sender_id::text || '/%'
    )
  )
);

create index group_messages_group_idx on public.group_messages (group_id, created_at desc);

-- Membership checks used by the policies. `security definer` so a policy on
-- chat_group_members can ask about chat_group_members without looping.
create function public.is_chat_group_member(target_group uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.chat_group_members
    where group_id = target_group and user_id = (select auth.uid())
  );
$$;

create function public.is_chat_group_admin(target_group uuid)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.chat_group_members
    where group_id = target_group and user_id = (select auth.uid()) and role = 'admin'
  );
$$;

alter table public.chat_groups enable row level security;
alter table public.chat_group_members enable row level security;
alter table public.group_messages enable row level security;

-- Groups: members see them, admins rename them or change the picture.
-- Creating and adding members only through the functions below.
grant select on public.chat_groups to authenticated;
grant update (name, photo_path) on public.chat_groups to authenticated;
create policy "Members see their groups"
  on public.chat_groups for select to authenticated
  using (public.is_chat_group_member(id));
create policy "Admins edit their groups"
  on public.chat_groups for update to authenticated
  using (public.is_chat_group_admin(id))
  with check (public.is_chat_group_admin(id));

-- Members: see who's in your groups; mark your own chat as read; admins remove others,
-- anyone can leave. Roles change only through set_chat_group_admin().
grant select, delete on public.chat_group_members to authenticated;
grant update (last_read_at) on public.chat_group_members to authenticated;
create policy "Members see members of their groups"
  on public.chat_group_members for select to authenticated
  using (public.is_chat_group_member(group_id));
create policy "Members mark their chat as read"
  on public.chat_group_members for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Leave a group or remove members as admin"
  on public.chat_group_members for delete to authenticated
  using (user_id = (select auth.uid()) or public.is_chat_group_admin(group_id));

-- Messages: members read and write; nobody edits or deletes.
grant select, insert on public.group_messages to authenticated;
create policy "Members read group messages"
  on public.group_messages for select to authenticated
  using (public.is_chat_group_member(group_id));
create policy "Members send as themselves"
  on public.group_messages for insert to authenticated
  with check (sender_id = (select auth.uid()) and public.is_chat_group_member(group_id));

-- Create a group with you as admin and the given people as members, in one step.
create function public.create_chat_group(group_name text, member_ids uuid[])
returns uuid language plpgsql security definer set search_path = '' as $$
declare
  me uuid := (select auth.uid());
  new_id uuid;
begin
  if me is null then raise exception 'Not signed in'; end if;
  if coalesce(array_length(member_ids, 1), 0) = 0 then
    raise exception 'Add at least one person.';
  end if;
  if array_length(member_ids, 1) + 1 > 50 then
    raise exception 'A group can have at most 50 members.';
  end if;
  insert into public.chat_groups (name, created_by) values (btrim(group_name), me)
    returning id into new_id;
  insert into public.chat_group_members (group_id, user_id, role, last_read_at)
    values (new_id, me, 'admin', now());
  insert into public.chat_group_members (group_id, user_id)
    select new_id, p.id from public.profiles p
    where p.id = any (member_ids) and p.id <> me
    on conflict do nothing;
  return new_id;
end;
$$;

-- Admins add people.
create function public.add_chat_group_members(target_group uuid, member_ids uuid[])
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_chat_group_admin(target_group) then
    raise exception 'Only admins can add people.';
  end if;
  insert into public.chat_group_members (group_id, user_id)
    select target_group, p.id from public.profiles p where p.id = any (member_ids)
    on conflict do nothing;
  if (select count(*) from public.chat_group_members where group_id = target_group) > 50 then
    raise exception 'A group can have at most 50 members.';
  end if;
end;
$$;

-- Admins make others admin or take it back; a group always keeps one admin.
create function public.set_chat_group_admin(target_group uuid, target_user uuid, make_admin boolean)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not public.is_chat_group_admin(target_group) then
    raise exception 'Only admins can change admins.';
  end if;
  update public.chat_group_members
    set role = case when make_admin then 'admin' else 'member' end
    where group_id = target_group and user_id = target_user;
  if not exists (
    select 1 from public.chat_group_members where group_id = target_group and role = 'admin'
  ) then
    raise exception 'A group needs at least one admin.';
  end if;
end;
$$;

grant execute on function public.create_chat_group(text, uuid[]) to authenticated;
grant execute on function public.add_chat_group_members(uuid, uuid[]) to authenticated;
grant execute on function public.set_chat_group_admin(uuid, uuid, boolean) to authenticated;
revoke execute on function public.create_chat_group(text, uuid[]) from anon, public;
revoke execute on function public.add_chat_group_members(uuid, uuid[]) from anon, public;
revoke execute on function public.set_chat_group_admin(uuid, uuid, boolean) from anon, public;

-- When someone leaves: if no admin is left, the longest member becomes admin;
-- when the last person leaves, the group is deleted (with its messages).
create function public.after_chat_group_member_removed()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from public.chat_group_members where group_id = old.group_id) then
    delete from public.chat_groups where id = old.group_id;
  elsif not exists (
    select 1 from public.chat_group_members where group_id = old.group_id and role = 'admin'
  ) then
    update public.chat_group_members set role = 'admin'
      where group_id = old.group_id
        and user_id = (
          select user_id from public.chat_group_members
          where group_id = old.group_id order by joined_at limit 1
        );
  end if;
  return null;
end;
$$;

create trigger chat_group_member_removed
  after delete on public.chat_group_members
  for each row execute function public.after_chat_group_member_removed();

-- Group pictures: private bucket, members can see them, admins change them. Max. 2 MB, JPEG.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('group-photos', 'group-photos', false, 2097152, array['image/jpeg']);

create policy "Members view group pictures"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'group-photos'
    and public.is_chat_group_member(((storage.foldername(name))[1])::uuid)
  );
create policy "Admins upload group pictures"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'group-photos'
    and (select auth.uid()) is not null
    and public.is_chat_group_admin(((storage.foldername(name))[1])::uuid)
  );
create policy "Admins remove group pictures"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'group-photos'
    and public.is_chat_group_admin(((storage.foldername(name))[1])::uuid)
  );

-- Pictures and files sent in groups use the chat buckets under groups/<group>/<sender>/...
create policy "Group members view group chat pictures"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'message-images'
    and (storage.foldername(name))[1] = 'groups'
    and public.is_chat_group_member(((storage.foldername(name))[2])::uuid)
  );
create policy "Group members upload group chat pictures"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'message-images'
    and (storage.foldername(name))[1] = 'groups'
    and (storage.foldername(name))[3] = (select auth.uid())::text
    and public.is_chat_group_member(((storage.foldername(name))[2])::uuid)
  );
create policy "Group members download group chat files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'message-files'
    and (storage.foldername(name))[1] = 'groups'
    and public.is_chat_group_member(((storage.foldername(name))[2])::uuid)
  );
create policy "Group members upload group chat files"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'message-files'
    and (storage.foldername(name))[1] = 'groups'
    and (storage.foldername(name))[3] = (select auth.uid())::text
    and public.is_chat_group_member(((storage.foldername(name))[2])::uuid)
  );
create policy "Senders remove group chat uploads"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('message-images', 'message-files')
    and (storage.foldername(name))[1] = 'groups'
    and (storage.foldername(name))[3] = (select auth.uid())::text
  );

-- Live updates (Realtime respects the policies above).
alter publication supabase_realtime add table public.chat_groups;
alter publication supabase_realtime add table public.chat_group_members;
alter publication supabase_realtime add table public.group_messages;

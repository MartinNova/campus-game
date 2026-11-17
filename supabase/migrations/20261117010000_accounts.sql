-- Accounts with e-mail + password, username, profile picture and settings.
-- Run once after 20261117000000_profiles.sql (Supabase SQL Editor). See docs/accounts.md.

-- 1. New profile fields --------------------------------------------------------

alter table public.profiles
  add column username text unique check (username ~ '^[a-z0-9_.]{3,20}$'),
  add column avatar_url text not null default '',
  add column country text not null default '' check (country ~ '^([A-Z]{2})?$'),
  add column languages text[] not null default '{}',
  add column instagram text not null default '' check (char_length(instagram) <= 60),
  add column linkedin text not null default '' check (char_length(linkedin) <= 200),
  add column study_start text not null default '' check (study_start ~ '^(\d{4}-\d{2})?$'),
  add column study_end text not null default '' check (study_end ~ '^(\d{4}-\d{2})?$'),
  add column study_status text not null default ''
    check (study_status in ('', 'regular', 'exchange', 'double-degree')),
  add column visibility text not null default 'everyone'
    check (visibility in ('everyone', 'private')),
  add column show_in_suggestions boolean not null default true,
  add column availability_days text[] not null default '{}',
  add column availability_times text[] not null default '{}';

-- Students may edit these columns of their own row (e-mail and student number stay read-only).
grant update (
  username, avatar_url, country, languages, instagram, linkedin,
  study_start, study_end, study_status, visibility, show_in_suggestions,
  availability_days, availability_times
) on public.profiles to authenticated;

-- 2. Privacy: private profiles are only visible to their owner -------------------

drop policy "Signed-in users can read profiles" on public.profiles;

create policy "Signed-in users can read public profiles and their own"
  on public.profiles for select to authenticated
  using (visibility = 'everyone' or (select auth.uid()) = id);

-- 3. Sign-up: any e-mail, username from the sign-up form -------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  full_name text := trim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''));
  local_part text := split_part(coalesce(new.email, ''), '@', 1);
  domain text := lower(split_part(coalesce(new.email, ''), '@', 2));
  wanted text := lower(coalesce(new.raw_user_meta_data ->> 'username', ''));
  base text;
  final_username text;
begin
  -- Use the chosen username if it is valid and free, otherwise derive one from the e-mail.
  if wanted ~ '^[a-z0-9_.]{3,20}$'
     and not exists (select 1 from public.profiles where username = wanted) then
    final_username := wanted;
  else
    base := left(regexp_replace(lower(local_part), '[^a-z0-9_.]', '', 'g'), 14);
    if char_length(base) < 3 then base := 'student'; end if;
    final_username := base || '_' || substr(md5(new.id::text), 1, 5);
  end if;

  insert into public.profiles (id, email, username, first_name, last_name, student_id)
  values (
    new.id,
    new.email,
    final_username,
    case when full_name ~ '\s' then regexp_replace(full_name, '\s+\S+$', '') else full_name end,
    case when full_name ~ '\s' then regexp_replace(full_name, '^.*\s', '') else '' end,
    -- Nova student e-mails start with the student number.
    case when domain = 'novasbe.pt' and local_part ~ '^\d+$' then local_part else '' end
  );
  return new;
end;
$$;

-- 4. Helpers the app calls -------------------------------------------------------

-- Lets the sign-up form check a username before an account exists (no other data exposed).
create function public.username_available(name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (select 1 from public.profiles where username = lower(name));
$$;

grant execute on function public.username_available(text) to anon, authenticated;

-- "Delete my account": removes the login; the profile row follows via on delete cascade.
create function public.delete_my_account()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;

-- 5. Profile pictures --------------------------------------------------------------

-- Public bucket: pictures load via their URL; max. 2 MB, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Each user may only manage files in their own folder: avatars/<user id>/...
create policy "Users can see their own avatar files"
  on storage.objects for select to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can upload their own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can replace their own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can delete their own avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

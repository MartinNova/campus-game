-- Rooms & flats: listings for free rooms and for students looking for one.
-- Run once after 20261117020000_padel_friends.sql (Supabase SQL Editor). See docs/accounts.md.

-- 1. Listings ----------------------------------------------------------------------

create table public.room_listings (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('offer', 'wanted')),
  title text not null check (char_length(title) between 5 and 80),
  room_type text not null check (room_type in ('room', 'shared', 'studio', 'flat')),
  area text not null check (char_length(area) between 1 and 60),
  rent int not null check (rent between 1 and 5000),
  bills_included boolean not null default false,
  available_from date not null,
  available_until date check (available_until is null or available_until > available_from),
  description text not null default '' check (char_length(description) <= 1000),
  photos text[] not null default '{}' check (coalesce(array_length(photos, 1), 0) <= 4),
  created_by uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.room_listings enable row level security;
grant select, insert, delete on public.room_listings to authenticated;

create policy "Signed-in users see all listings"
  on public.room_listings for select to authenticated using (true);
create policy "Users post listings as themselves"
  on public.room_listings for insert to authenticated
  with check ((select auth.uid()) = created_by);
create policy "Users can delete their own listings"
  on public.room_listings for delete to authenticated
  using ((select auth.uid()) = created_by);

-- 2. Photos ------------------------------------------------------------------------

-- Public bucket: photos load via their URL; max. 2 MB each, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('room-photos', 'room-photos', true, 2097152, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- Each user may only manage files in their own folder: room-photos/<user id>/...
create policy "Users can see their own room photo files"
  on storage.objects for select to authenticated
  using (bucket_id = 'room-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can upload their own room photos"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'room-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users can delete their own room photos"
  on storage.objects for delete to authenticated
  using (bucket_id = 'room-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- 3. Live updates: new listings appear on other devices right away ------------------

alter publication supabase_realtime add table public.room_listings;

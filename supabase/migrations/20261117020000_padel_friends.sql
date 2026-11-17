-- Shared padel matches and the Friends (people) directory.
-- Run once after 20261117010000_accounts.sql (Supabase SQL Editor). See docs/accounts.md.

-- 1. Privacy: other students may read profiles, but not your e-mail address ----

revoke select on public.profiles from authenticated;
grant select (
  id, student_id, username, first_name, last_name, avatar_url, bio, country, languages,
  instagram, linkedin, program, study_start, study_end, study_status, sports, padel_level,
  availability_days, availability_times, visibility, show_in_suggestions, created_at, updated_at
) on public.profiles to authenticated;

-- 2. Padel matches --------------------------------------------------------------

create table public.padel_matches (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  time text not null check (time ~ '^\d{2}:\d{2}$'),
  duration_minutes int not null default 90 check (duration_minutes between 30 and 240),
  location text not null check (char_length(location) between 1 and 100),
  level numeric(2, 1) not null check (level between 1 and 7),
  max_players int not null default 4 check (max_players = 4),
  -- Friends the creator brings who are not on the app.
  guest_count int not null default 0 check (guest_count between 0 and 2),
  description text not null default '' check (char_length(description) <= 200),
  created_by uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.padel_match_players (
  match_id uuid not null references public.padel_matches (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (match_id, user_id)
);

alter table public.padel_matches enable row level security;
alter table public.padel_match_players enable row level security;

grant select, insert, delete on public.padel_matches to authenticated;
grant select, insert, delete on public.padel_match_players to authenticated;

create policy "Signed-in users see all matches"
  on public.padel_matches for select to authenticated using (true);
create policy "Users post matches as themselves"
  on public.padel_matches for insert to authenticated
  with check ((select auth.uid()) = created_by);
create policy "Creators can cancel their matches"
  on public.padel_matches for delete to authenticated
  using ((select auth.uid()) = created_by);

create policy "Signed-in users see who plays"
  on public.padel_match_players for select to authenticated using (true);
create policy "Users join as themselves"
  on public.padel_match_players for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "Users can leave, except the creator"
  on public.padel_match_players for delete to authenticated
  using (
    (select auth.uid()) = user_id
    and not exists (
      select 1 from public.padel_matches m
      where m.id = match_id and m.created_by = (select auth.uid())
    )
  );

-- The creator is always the first player.
create function public.padel_add_creator()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.padel_match_players (match_id, user_id) values (new.id, new.created_by);
  return new;
end;
$$;

create trigger padel_matches_add_creator
  after insert on public.padel_matches
  for each row execute function public.padel_add_creator();

-- No joining a full court, even if two people click at the same moment.
create function public.padel_check_capacity()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  m public.padel_matches;
  taken int;
begin
  select * into m from public.padel_matches where id = new.match_id for update;
  select count(*) into taken from public.padel_match_players where match_id = new.match_id;
  if taken + m.guest_count >= m.max_players then
    raise exception 'This match is already full.';
  end if;
  return new;
end;
$$;

create trigger padel_players_check_capacity
  before insert on public.padel_match_players
  for each row execute function public.padel_check_capacity();

-- 3. Live updates: other devices see new matches and players right away -------

alter publication supabase_realtime add table public.padel_matches, public.padel_match_players;

-- Padel join requests: instead of joining straight away, players ask the organiser,
-- who accepts or declines. Run once after 20261118010000_messages.sql (Supabase SQL Editor).

create table public.padel_join_requests (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.padel_matches (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  note text not null default '' check (char_length(note) <= 200),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'declined')),
  created_at timestamptz not null default now(),
  unique (match_id, user_id)
);

alter table public.padel_join_requests enable row level security;
grant select, insert, delete on public.padel_join_requests to authenticated;

-- You see your own requests; the organiser sees all requests for their match.
create policy "Requesters and organisers see requests"
  on public.padel_join_requests for select to authenticated
  using (
    (select auth.uid()) = user_id
    or exists (
      select 1 from public.padel_matches m
      where m.id = match_id and m.created_by = (select auth.uid())
    )
  );

-- Only as yourself, only "pending", and not for your own match.
create policy "Users ask to join as themselves"
  on public.padel_join_requests for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'pending'
    and not exists (
      select 1 from public.padel_matches m
      where m.id = match_id and m.created_by = (select auth.uid())
    )
  );

-- Take back a pending request, or clear an accepted one after leaving. A "no" stays.
create policy "Users withdraw their own requests"
  on public.padel_join_requests for delete to authenticated
  using ((select auth.uid()) = user_id and status in ('pending', 'accepted'));

-- Joining now only works through an accepted request (see the function below).
drop policy "Users join as themselves" on public.padel_match_players;

-- The organiser answers a request. Accepting adds the player; the capacity trigger
-- from 20261117020000_padel_friends.sql still refuses a full court.
create function public.padel_respond_to_request(request_id uuid, accept boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.padel_join_requests;
begin
  select * into r from public.padel_join_requests where id = request_id for update;
  if not found then
    raise exception 'This request no longer exists.';
  end if;
  if not exists (
    select 1 from public.padel_matches m
    where m.id = r.match_id and m.created_by = (select auth.uid())
  ) then
    raise exception 'Only the organiser can answer requests.';
  end if;
  if r.status <> 'pending' then
    raise exception 'This request was already answered.';
  end if;

  if accept then
    insert into public.padel_match_players (match_id, user_id) values (r.match_id, r.user_id);
  end if;
  update public.padel_join_requests
    set status = case when accept then 'accepted' else 'declined' end
    where id = request_id;
end;
$$;

revoke execute on function public.padel_respond_to_request(uuid, boolean) from public, anon;
grant execute on function public.padel_respond_to_request(uuid, boolean) to authenticated;

-- Live updates: organisers see new requests, players see the answer right away.
alter publication supabase_realtime add table public.padel_join_requests;

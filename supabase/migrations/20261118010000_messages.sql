-- Direct messages between two students.
-- Run once after 20261118000000_rooms.sql (Supabase SQL Editor). See docs/accounts.md.

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now(),
  read_at timestamptz,
  check (sender_id <> recipient_id)
);

create index messages_recipient_idx on public.messages (recipient_id, created_at desc);
create index messages_sender_idx on public.messages (sender_id, created_at desc);

alter table public.messages enable row level security;

-- Only the two people in a chat can read it. Nobody can edit or delete messages;
-- the recipient may only set read_at.
grant select, insert on public.messages to authenticated;
grant update (read_at) on public.messages to authenticated;

create policy "Users read their own chats"
  on public.messages for select to authenticated
  using ((select auth.uid()) in (sender_id, recipient_id));
create policy "Users send messages as themselves"
  on public.messages for insert to authenticated
  with check ((select auth.uid()) = sender_id);
create policy "Recipients mark messages as read"
  on public.messages for update to authenticated
  using ((select auth.uid()) = recipient_id)
  with check ((select auth.uid()) = recipient_id);

-- Live updates: new messages appear without reloading (Realtime respects the policies above).
alter publication supabase_realtime add table public.messages;

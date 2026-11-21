-- Long-press on a message, like WhatsApp: react with an emoji, reply, forward, delete.
-- Run once after 20261121000000_student_count.sql (Supabase SQL Editor). See docs/accounts.md.

-- Replies point to the message they answer; "Forwarded" is shown above forwarded messages.
alter table public.messages
  add column reply_to_id uuid references public.messages (id) on delete set null,
  add column forwarded boolean not null default false;
alter table public.group_messages
  add column reply_to_id uuid references public.group_messages (id) on delete set null,
  add column forwarded boolean not null default false;

-- Senders may delete their own messages (for everyone). Nobody may edit them.
grant delete on public.messages to authenticated;
create policy "Senders delete their messages"
  on public.messages for delete to authenticated
  using ((select auth.uid()) = sender_id);

grant delete on public.group_messages to authenticated;
create policy "Senders delete their group messages"
  on public.group_messages for delete to authenticated
  using ((select auth.uid()) = sender_id);

-- One reaction per person and message; reacting again replaces it.
create table public.message_reactions (
  message_id uuid not null references public.messages (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 16),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id)
);

create table public.group_message_reactions (
  message_id uuid not null references public.group_messages (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  emoji text not null check (char_length(emoji) between 1 and 16),
  created_at timestamptz not null default now(),
  primary key (message_id, user_id)
);

alter table public.message_reactions enable row level security;
alter table public.group_message_reactions enable row level security;

grant select, insert, delete on public.message_reactions to authenticated;
grant update (emoji) on public.message_reactions to authenticated;
grant select, insert, delete on public.group_message_reactions to authenticated;
grant update (emoji) on public.group_message_reactions to authenticated;

-- You see reactions on messages you can see (the messages' own policies decide that),
-- and you only react as yourself.
create policy "See reactions in your chats"
  on public.message_reactions for select to authenticated
  using (exists (select 1 from public.messages m where m.id = message_id));
create policy "React as yourself"
  on public.message_reactions for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.messages m where m.id = message_id)
  );
create policy "Change your reaction"
  on public.message_reactions for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Remove your reaction"
  on public.message_reactions for delete to authenticated
  using (user_id = (select auth.uid()));

create policy "See reactions in your groups"
  on public.group_message_reactions for select to authenticated
  using (exists (select 1 from public.group_messages m where m.id = message_id));
create policy "React in your groups as yourself"
  on public.group_message_reactions for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and exists (select 1 from public.group_messages m where m.id = message_id)
  );
create policy "Change your group reaction"
  on public.group_message_reactions for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
create policy "Remove your group reaction"
  on public.group_message_reactions for delete to authenticated
  using (user_id = (select auth.uid()));

-- Live updates: reactions appear without reloading.
alter publication supabase_realtime add table public.message_reactions;
alter publication supabase_realtime add table public.group_message_reactions;

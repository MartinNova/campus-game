-- Student profiles for "Sign in with Microsoft".
-- Run once in the Supabase dashboard (SQL Editor) or with `supabase db push`.
-- See docs/microsoft-login.md.

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  first_name text not null default '',
  last_name text not null default '',
  student_id text not null default '',
  program text not null default '',
  sports text[] not null default '{}',
  padel_level numeric(2, 1) check (padel_level between 1 and 7),
  bio text not null default '' check (char_length(bio) <= 300),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- New Supabase projects don't expose tables to the Data API automatically,
-- so allow signed-in users explicitly. The policies below still decide which rows.
grant select on public.profiles to authenticated;

-- Every signed-in student can see the others (names in padel matches, later: friends).
create policy "Signed-in users can read profiles"
  on public.profiles for select to authenticated
  using (true);

-- You can only edit your own profile ...
create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- ... and only these columns: e-mail and student number always come from Microsoft.
revoke update on public.profiles from authenticated;
grant update (first_name, last_name, program, sports, padel_level, bio)
  on public.profiles to authenticated;

-- Keep updated_at current.
create function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_touch_updated_at
  before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Create the profile on the first sign-in, using name and e-mail from Microsoft.
-- Also the last line of defence: only Nova accounts get in (change the domain here if needed).
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  full_name text := trim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''));
  local_part text := split_part(coalesce(new.email, ''), '@', 1);
begin
  if lower(split_part(coalesce(new.email, ''), '@', 2)) <> 'novasbe.pt' then
    raise exception 'Only Nova SBE accounts can sign up';
  end if;

  insert into public.profiles (id, email, first_name, last_name, student_id)
  values (
    new.id,
    new.email,
    case when full_name ~ '\s' then regexp_replace(full_name, '\s+\S+$', '') else full_name end,
    case when full_name ~ '\s' then regexp_replace(full_name, '^.*\s', '') else '' end,
    case when local_part ~ '^\d+$' then local_part else '' end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

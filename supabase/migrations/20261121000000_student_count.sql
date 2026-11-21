-- How many students have an account, for "34 Nova students are already here" on the
-- welcome screen. Returns only a number: no names, no other data.
-- Run once in the Supabase SQL Editor. Safe to run before or after deploying the app.

create function public.student_count()
returns integer
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::integer from public.profiles;
$$;

-- Signed-out visitors see the welcome screen, so they may ask for the number.
revoke execute on function public.student_count() from public;
grant execute on function public.student_count() to anon, authenticated;

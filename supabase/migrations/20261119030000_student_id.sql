-- Student ID (Nova student number) in Settings, private to each student.
-- Run once AFTER the app version with the Student ID field is deployed (Supabase SQL Editor),
-- because older app versions still read student_id directly. See docs/accounts.md.

-- Other students can no longer read anyone's student number.
revoke select (student_id) on public.profiles from authenticated;

-- Read your own student number.
create function public.my_student_id()
returns text language sql stable security definer set search_path = '' as $$
  select student_id from public.profiles where id = (select auth.uid());
$$;

-- Change your own student number: digits only (4-10), or empty.
create function public.set_my_student_id(new_student_id text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if (select auth.uid()) is null then raise exception 'Not signed in'; end if;
  if coalesce(new_student_id, '') !~ '^([0-9]{4,10})?$' then
    raise exception 'Student ID: numbers only, e.g. 79109.';
  end if;
  update public.profiles set student_id = coalesce(new_student_id, '')
    where id = (select auth.uid());
end;
$$;

grant execute on function public.my_student_id() to authenticated;
grant execute on function public.set_my_student_id(text) to authenticated;
revoke execute on function public.my_student_id() from anon, public;
revoke execute on function public.set_my_student_id(text) from anon, public;

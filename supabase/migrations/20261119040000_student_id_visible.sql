-- Student ID visible on profiles again: other signed-in students may read it (like name and
-- programme). Changing it still only works for your own row via set_my_student_id().
-- Run once in the Supabase SQL Editor. Safe to run before or after deploying the app.

grant select (student_id) on public.profiles to authenticated;

import { getSupabase } from "@/lib/supabase/client";
import { AUTH_MODE } from "@/lib/supabase/config";
import { userService } from "./user.service";

/**
 * How many students have an account (welcome screen). null = unknown, e.g. before the
 * migration 20261121000000_student_count.sql has run; the screen then just leaves it out.
 */
export async function getStudentCount(): Promise<number | null> {
  if (AUTH_MODE !== "accounts") return (await userService.listUsers()).length;
  const { data, error } = await getSupabase().rpc("student_count");
  return error || typeof data !== "number" ? null : data;
}

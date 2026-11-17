import type { Profile, ProfileUpdate } from "@/types/profile";
import type { User } from "@/types/user";

/** One row of the `profiles` table (supabase/migrations/*_profiles.sql). */
export interface ProfileRow {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  student_id: string;
  program: string;
  sports: string[];
  padel_level: number | null;
  bio: string;
}

export const PROFILE_COLUMNS =
  "id, email, first_name, last_name, student_id, program, sports, padel_level, bio";

export function rowToProfile(row: ProfileRow): Profile {
  return {
    userId: row.id,
    email: row.email,
    firstName: row.first_name,
    lastName: row.last_name,
    studentId: row.student_id,
    program: row.program,
    sports: row.sports ?? [],
    // Postgres numeric can arrive as a string.
    padelLevel: row.padel_level === null ? null : Number(row.padel_level),
    bio: row.bio,
  };
}

export function rowToUser(row: ProfileRow): User {
  return {
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    studentId: row.student_id,
    role: "student",
    email: row.email,
  };
}

/** Only the columns a student may change (the database enforces the same). */
export function updateToRow(update: ProfileUpdate) {
  return {
    first_name: update.firstName.trim(),
    last_name: update.lastName.trim(),
    program: update.program,
    sports: update.sports,
    padel_level: update.padelLevel,
    bio: update.bio.trim(),
  };
}

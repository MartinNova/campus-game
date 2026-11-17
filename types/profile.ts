/**
 * Student profile: data contract.
 * Created automatically on the first Microsoft sign-in (see supabase/migrations),
 * the student fills in the rest on /profile. In demo mode it lives in localStorage.
 */

export const PROGRAMS = ["Bachelor", "Master", "MBA", "Exchange", "PhD", "Other"] as const;

export const SPORT_INTERESTS = [
  "Padel",
  "Surf",
  "Gym",
  "Yoga",
  "Running",
  "Football",
  "Beach volleyball",
  "Tennis",
] as const;

export interface Profile {
  /** Same id as the user (auth user id in Supabase). */
  userId: string;
  firstName: string;
  lastName: string;
  /** From Microsoft, not editable. Empty for demo accounts. */
  email: string;
  /** From the Nova e-mail, not editable. */
  studentId: string;
  /** One of PROGRAMS, or "" if not set yet. */
  program: string;
  /** Values from SPORT_INTERESTS. */
  sports: string[];
  /** Lower bound of a padel level band (see types/padel.ts), or null. */
  padelLevel: number | null;
  /** Short intro, max. 300 characters. */
  bio: string;
}

/** The fields a student may change themselves. */
export type ProfileUpdate = Pick<
  Profile,
  "firstName" | "lastName" | "program" | "sports" | "padelLevel" | "bio"
>;

export const BIO_MAX_LENGTH = 300;

export interface ProfileService {
  getProfile(userId: string): Promise<Profile | null>;
  updateProfile(userId: string, update: ProfileUpdate): Promise<Profile>;
}

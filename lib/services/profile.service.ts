import { readJSON, writeJSON } from "@/lib/storage";
import { getSupabase } from "@/lib/supabase/client";
import { AUTH_MODE } from "@/lib/supabase/config";
import {
  PROFILE_COLUMNS,
  rowToProfile,
  updateToRow,
  type ProfileRow,
} from "@/lib/supabase/profiles";
import {
  BIO_MAX_LENGTH,
  type Profile,
  type ProfileService,
  type ProfileUpdate,
} from "@/types/profile";
import { userService } from "./user.service";

const PROFILES_KEY = "profiles";

/** Returns an error message, or null if the update is valid. */
export function validateProfileUpdate(update: ProfileUpdate): string | null {
  if (!update.firstName.trim()) return "Please enter your first name.";
  if (update.bio.length > BIO_MAX_LENGTH)
    return `Keep your intro under ${BIO_MAX_LENGTH} characters.`;
  return null;
}

/** Demo mode: base data from the mock user, edits stored per user in localStorage. */
const demoProfileService: ProfileService = {
  async getProfile(userId) {
    const user = (await userService.listUsers()).find((u) => u.id === userId);
    if (!user) return null;
    const defaults: ProfileUpdate = {
      firstName: user.firstName,
      lastName: user.lastName,
      program: "",
      sports: [],
      padelLevel: null,
      bio: "",
    };
    const saved = readJSON<Record<string, ProfileUpdate>>(PROFILES_KEY, {})[userId];
    return { userId, email: user.email ?? "", studentId: user.studentId, ...defaults, ...saved };
  },
  async updateProfile(userId, update) {
    const error = validateProfileUpdate(update);
    if (error) throw new Error(error);
    const all = readJSON<Record<string, ProfileUpdate>>(PROFILES_KEY, {});
    writeJSON(PROFILES_KEY, { ...all, [userId]: update });
    return (await this.getProfile(userId)) as Profile;
  },
};

/** Microsoft mode: the `profiles` table. Row level security only lets you edit your own row. */
const supabaseProfileService: ProfileService = {
  async getProfile(userId) {
    const { data, error } = await getSupabase()
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return data ? rowToProfile(data as ProfileRow) : null;
  },
  async updateProfile(userId, update) {
    const error = validateProfileUpdate(update);
    if (error) throw new Error(error);
    const { data, error: dbError } = await getSupabase()
      .from("profiles")
      .update(updateToRow(update))
      .eq("id", userId)
      .select(PROFILE_COLUMNS)
      .single();
    if (dbError) throw dbError;
    return rowToProfile(data as ProfileRow);
  },
};

export const profileService: ProfileService =
  AUTH_MODE === "microsoft" ? supabaseProfileService : demoProfileService;

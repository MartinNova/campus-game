import { validateProfileUpdate } from "@/lib/profile/profile-rules";
import { readJSON, writeJSON } from "@/lib/storage";
import { getSupabase } from "@/lib/supabase/client";
import { AUTH_MODE } from "@/lib/supabase/config";
import {
  PROFILE_COLUMNS,
  rowToProfile,
  updateToRow,
  type ProfileRow,
} from "@/lib/supabase/profiles";
import type { Profile, ProfileService, ProfileUpdate } from "@/types/profile";
import { userService } from "./user.service";

const PROFILES_KEY = "profiles";
const AVATAR_BUCKET = "avatars";

/** Demo mode: base data from the mock user, edits stored per user in localStorage. */
const demoProfileService: ProfileService = {
  async getProfile(userId) {
    const user = (await userService.listUsers()).find((u) => u.id === userId);
    if (!user) return null;
    const defaults: ProfileUpdate = {
      studentId: user.studentId,
      username: `${user.firstName}.${user.lastName}`.toLowerCase().replace(/[^a-z0-9_.]/g, ""),
      firstName: user.firstName,
      lastName: user.lastName,
      avatarUrl: "",
      bio: "",
      country: "",
      languages: [],
      instagram: "",
      linkedin: "",
      program: "",
      studyStart: "",
      studyEnd: "",
      studyStatus: "",
      sports: [],
      padelLevel: null,
      availabilityDays: [],
      availabilityTimes: [],
      visibility: "everyone",
      showInSuggestions: true,
    };
    const saved = readJSON<Record<string, Partial<ProfileUpdate>>>(PROFILES_KEY, {})[userId];
    return { userId, email: user.email ?? "", ...defaults, ...saved };
  },
  async getProfileByUsername(username) {
    const all = await this.listProfiles();
    return all.find((p) => p.username === username.toLowerCase()) ?? null;
  },
  async listProfiles() {
    const users = await userService.listUsers();
    const profiles = await Promise.all(users.map((u) => this.getProfile(u.id)));
    return profiles.filter((p): p is Profile => p !== null && p.visibility === "everyone");
  },
  async updateProfile(userId, update) {
    const error = validateProfileUpdate(update);
    if (error) throw new Error(error);
    const all = readJSON<Record<string, ProfileUpdate>>(PROFILES_KEY, {});
    writeJSON(PROFILES_KEY, { ...all, [userId]: update });
    return (await this.getProfile(userId)) as Profile;
  },
  async uploadAvatar(_userId, image) {
    // No file storage in demo mode: keep the (small, resized) picture as a data URL.
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Could not read the picture."));
      reader.readAsDataURL(image);
    });
  },
};

/** Your own student number; other students' numbers are not readable (see migrations). */
async function myStudentId(): Promise<string> {
  const { data, error } = await getSupabase().rpc("my_student_id");
  // Before the student ID migration runs the function doesn't exist yet: show it as empty.
  return error ? "" : ((data as string | null) ?? "");
}

/** Your own e-mail comes from the login; other students' e-mails are not readable. */
async function emailIfMine(userId: string): Promise<string> {
  const {
    data: { session },
  } = await getSupabase().auth.getSession();
  return session?.user.id === userId ? (session.user.email ?? "") : "";
}

/** Accounts mode: the `profiles` table and the `avatars` bucket. RLS only allows editing your own row. */
const supabaseProfileService: ProfileService = {
  async getProfile(userId) {
    const { data, error } = await getSupabase()
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const email = await emailIfMine(userId);
    // Only for yourself (the e-mail is only known for your own profile).
    return rowToProfile(data as unknown as ProfileRow, email, email ? await myStudentId() : "");
  },
  async getProfileByUsername(username) {
    const { data, error } = await getSupabase()
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("username", username.toLowerCase())
      .maybeSingle();
    if (error) throw error;
    return data ? rowToProfile(data as unknown as ProfileRow) : null;
  },
  async listProfiles() {
    const { data, error } = await getSupabase()
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("visibility", "everyone")
      .order("first_name");
    if (error) throw error;
    return (data as unknown as ProfileRow[]).map((row) => rowToProfile(row));
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
    // 23505 = unique violation, i.e. the username is taken.
    if (dbError?.code === "23505") throw new Error("This username is already taken.");
    if (dbError) throw dbError;
    const studentId = update.studentId.trim();
    if (studentId !== (await myStudentId())) {
      const { error: idError } = await getSupabase().rpc("set_my_student_id", {
        new_student_id: studentId,
      });
      if (idError) throw new Error("Could not save your student ID. Please try again.");
    }
    return rowToProfile(data as unknown as ProfileRow, await emailIfMine(userId), studentId);
  },
  async uploadAvatar(userId, image) {
    // New file name each time, so browsers don't show the old cached picture.
    const path = `${userId}/avatar-${Date.now()}.jpg`;
    const bucket = getSupabase().storage.from(AVATAR_BUCKET);
    const { error } = await bucket.upload(path, image, { contentType: "image/jpeg" });
    if (error) throw new Error("Could not upload the picture. Please try a smaller image.");
    // Clean up older pictures of this user.
    const { data: files } = await bucket.list(userId);
    const old = (files ?? []).map((f) => `${userId}/${f.name}`).filter((p) => p !== path);
    if (old.length) await bucket.remove(old);
    return bucket.getPublicUrl(path).data.publicUrl;
  },
};

export const profileService: ProfileService =
  AUTH_MODE === "accounts" ? supabaseProfileService : demoProfileService;

import { DEMO_USERS, TEAM_PLACEHOLDERS } from "@/data/users.mock";
import { splitName, studentIdFromEmail } from "@/lib/auth/nova-account";
import { readJSON, writeJSON } from "@/lib/storage";
import { getSupabase } from "@/lib/supabase/client";
import { AUTH_MODE } from "@/lib/supabase/config";
import { PROFILE_COLUMNS, rowToUser, type ProfileRow } from "@/lib/supabase/profiles";
import type { AuthService, User, UserService } from "@/types/user";

const CURRENT_USER_KEY = "current-user-id";

/**
 * Parses NEXT_PUBLIC_TEAM_MEMBERS, e.g. "Jane Doe:12345,John Smith:67890".
 * Everything before the last space is the first name(s); invalid entries are skipped.
 */
export function parseTeamMembers(raw: string | undefined): User[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .flatMap((entry, i) => {
      const [name, studentId] = entry.split(":").map((s) => s?.trim());
      if (!name || !studentId) return [];
      const parts = name.split(/\s+/);
      const lastName = parts.length > 1 ? parts.pop()! : "";
      return [
        {
          id: `team-${i + 1}`,
          firstName: parts.join(" "),
          lastName,
          studentId,
          role: "team" as const,
        },
      ];
    });
}

function allUsers(): User[] {
  const team = parseTeamMembers(process.env.NEXT_PUBLIC_TEAM_MEMBERS);
  return [...(team.length > 0 ? team : TEAM_PLACEHOLDERS), ...DEMO_USERS];
}

/** Demo login: mock users, the chosen account is remembered in localStorage. */
const demoUserService: UserService = {
  async listUsers() {
    return allUsers();
  },
  async getCurrentUser() {
    const users = allUsers();
    const id = readJSON<string | null>(CURRENT_USER_KEY, null);
    return users.find((u) => u.id === id) ?? users[0] ?? null;
  },
  async setCurrentUser(userId) {
    writeJSON(CURRENT_USER_KEY, userId);
  },
};

/** Real accounts: the signed-in Supabase user and everyone's profile. */
const supabaseUserService: UserService = {
  async listUsers() {
    const { data, error } = await getSupabase().from("profiles").select(PROFILE_COLUMNS);
    if (error) throw error;
    return (data as ProfileRow[]).map(rowToUser);
  },
  async getCurrentUser() {
    const supabase = getSupabase();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase
      .from("profiles")
      .select(PROFILE_COLUMNS)
      .eq("id", user.id)
      .maybeSingle();
    if (data) return rowToUser(data as ProfileRow);
    // Profile row not there yet (e.g. migration not run): fall back to the Microsoft data.
    const email = user.email ?? "";
    return {
      id: user.id,
      ...splitName(user.user_metadata?.full_name ?? user.user_metadata?.name),
      studentId: studentIdFromEmail(email),
      role: "student",
      email,
    };
  },
  async setCurrentUser() {
    // Real accounts can't be switched; sign out and in again instead.
  },
};

export const userService: UserService =
  AUTH_MODE === "microsoft" ? supabaseUserService : demoUserService;

/** Sign in / out with Microsoft. `null` in demo mode. */
export const authService: AuthService | null =
  AUTH_MODE === "microsoft"
    ? {
        async signInWithMicrosoft() {
          const { error } = await getSupabase().auth.signInWithOAuth({
            provider: "azure",
            options: {
              // "email" is needed, otherwise Microsoft doesn't send the address.
              scopes: "openid profile email",
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });
          if (error) throw error;
        },
        async signOut() {
          await getSupabase().auth.signOut();
        },
        onChange(listener) {
          const { data } = getSupabase().auth.onAuthStateChange((event) => {
            if (event === "SIGNED_IN" || event === "SIGNED_OUT") listener();
          });
          return () => data.subscription.unsubscribe();
        },
      }
    : null;

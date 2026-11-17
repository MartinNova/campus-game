import { DEMO_USERS, TEAM_PLACEHOLDERS } from "@/data/users.mock";
import { readJSON, writeJSON } from "@/lib/storage";
import type { User, UserService } from "@/types/user";

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

/** Mock implementation (localStorage). Swap for a Supabase version later. */
export const userService: UserService = {
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

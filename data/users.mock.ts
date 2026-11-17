import type { User } from "@/types/user";

/**
 * Accounts for the demo. No real login yet: you switch accounts in the header.
 *
 * TEAM accounts: placeholders in the public repo. To show real names and
 * student IDs locally (e.g. for the presentation), set NEXT_PUBLIC_TEAM_MEMBERS
 * in .env.local (see .env.example). Real personal data never goes into Git.
 *
 * DEMO accounts: fictional students, so matches etc. look realistic.
 */
export const TEAM_PLACEHOLDERS: User[] = [1, 2, 3, 4].map((n) => ({
  id: `team-${n}`,
  firstName: "Team",
  lastName: `Member ${n}`,
  studentId: `0000${n}`,
  role: "team",
}));

export const DEMO_USERS: User[] = [
  { id: "demo-1", firstName: "Sofia", lastName: "Almeida", studentId: "90001", role: "demo" },
  { id: "demo-2", firstName: "Lukas", lastName: "Weber", studentId: "90002", role: "demo" },
  { id: "demo-3", firstName: "Inês", lastName: "Carvalho", studentId: "90003", role: "demo" },
  { id: "demo-4", firstName: "Marco", lastName: "Rossi", studentId: "90004", role: "demo" },
  { id: "demo-5", firstName: "Chloé", lastName: "Martin", studentId: "90005", role: "demo" },
  { id: "demo-6", firstName: "João", lastName: "Silva", studentId: "90006", role: "demo" },
];

export type UserRole = "team" | "demo";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  /** Nova SBE student number. */
  studentId: string;
  /** "team" = one of the four project members, "demo" = fictional test account. */
  role: UserRole;
}

/**
 * Contract for user data. Today: mock data + localStorage ("demo login").
 * Later: Supabase Auth. Components only talk to this interface.
 */
export interface UserService {
  listUsers(): Promise<User[]>;
  getCurrentUser(): Promise<User | null>;
  setCurrentUser(userId: string): Promise<void>;
}

export function fullName(user: Pick<User, "firstName" | "lastName">): string {
  return `${user.firstName} ${user.lastName}`;
}

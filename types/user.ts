export type UserRole = "team" | "demo" | "student";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  /** Nova SBE student number. */
  studentId: string;
  /**
   * "team" = one of the four project members, "demo" = fictional test account,
   * "student" = real Nova account (Microsoft sign-in).
   */
  role: UserRole;
  /** Nova e-mail, only for real accounts. */
  email?: string;
}

/**
 * Contract for user data. Demo mode: mock data + localStorage ("demo login").
 * Microsoft mode: Supabase Auth + profiles table. Components only talk to this interface.
 */
export interface UserService {
  listUsers(): Promise<User[]>;
  getCurrentUser(): Promise<User | null>;
  setCurrentUser(userId: string): Promise<void>;
}

/** Real sign-in with the Nova Microsoft 365 account. Only exists when Supabase is configured. */
export interface AuthService {
  signInWithMicrosoft(): Promise<void>;
  signOut(): Promise<void>;
  /** Calls `listener` whenever the user signs in or out. Returns an unsubscribe function. */
  onChange(listener: () => void): () => void;
}

export function fullName(user: Pick<User, "firstName" | "lastName">): string {
  return `${user.firstName} ${user.lastName}`;
}

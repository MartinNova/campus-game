export type UserRole = "team" | "demo" | "student";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  /** Nova SBE student number. */
  studentId: string;
  /**
   * "team" = one of the four project members, "demo" = fictional test account,
   * "student" = real account (e-mail + password or Microsoft).
   */
  role: UserRole;
  /** Login e-mail, only for real accounts. */
  email?: string;
  /** Unique handle, e.g. "till.f" (real accounts). */
  username?: string;
  /** Profile picture URL; empty or missing = show initials. */
  avatarUrl?: string;
}

/**
 * Contract for user data. Demo mode: mock data + localStorage ("demo login").
 * Accounts mode: Supabase Auth + profiles table. Components only talk to this interface.
 */
export interface UserService {
  listUsers(): Promise<User[]>;
  getCurrentUser(): Promise<User | null>;
  setCurrentUser(userId: string): Promise<void>;
}

export interface SignUpInput {
  email: string;
  password: string;
  username: string;
}

/** Real accounts. Only exists when Supabase is configured. */
export interface AuthService {
  signIn(email: string, password: string): Promise<void>;
  /** `needsConfirmation` = Supabase sent a confirmation e-mail before the first sign-in. */
  signUp(input: SignUpInput): Promise<{ needsConfirmation: boolean }>;
  signInWithMicrosoft(): Promise<void>;
  signOut(): Promise<void>;
  isUsernameAvailable(username: string): Promise<boolean>;
  /** Supabase sends a confirmation link to the new address. */
  changeEmail(email: string): Promise<void>;
  changePassword(password: string): Promise<void>;
  /** Deletes the login, profile and profile picture for good. */
  deleteAccount(): Promise<void>;
  /** Calls `listener` whenever the user signs in or out. Returns an unsubscribe function. */
  onChange(listener: () => void): () => void;
}

export function fullName(user: Pick<User, "firstName" | "lastName">): string {
  return `${user.firstName} ${user.lastName}`;
}

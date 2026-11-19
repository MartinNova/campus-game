/** Supabase Auth error codes -> short, friendly messages for the sign-in form. */
const MESSAGES: Record<string, string> = {
  invalid_credentials: "E-mail or password is wrong.",
  email_not_confirmed: "Please confirm your e-mail first (check your inbox).",
  user_already_exists: "There is already an account with this e-mail. Sign in instead.",
  weak_password: "Please choose a stronger password.",
  over_email_send_rate_limit: "Too many e-mails sent. Please try again in a few minutes.",
};

/** Turns Supabase's English error codes into short, friendly messages. */
export function friendlyAuthError(error: { message: string; code?: string }): Error {
  return new Error((error.code && MESSAGES[error.code]) || error.message);
}

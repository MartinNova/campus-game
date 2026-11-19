import { RESET_PASSWORD_PATH } from "@/lib/auth/password-reset";
import { getSupabase } from "@/lib/supabase/client";
import { AUTH_MODE } from "@/lib/supabase/config";
import { friendlyAuthError as friendly } from "@/lib/auth/auth-errors";
import type { AuthService } from "@/types/user";

const AVATAR_BUCKET = "avatars";

/** Real accounts with Supabase Auth. `null` in demo mode. */
export const authService: AuthService | null =
  AUTH_MODE === "accounts"
    ? {
        async signIn(email, password) {
          const { error } = await getSupabase().auth.signInWithPassword({
            email: email.trim(),
            password,
          });
          if (error) throw friendly(error);
        },
        async signUp({ email, password, username }) {
          const { data, error } = await getSupabase().auth.signUp({
            email: email.trim(),
            password,
            options: {
              // Read by the database trigger that creates the profile.
              data: { username },
              emailRedirectTo: `${window.location.origin}/auth/callback`,
            },
          });
          if (error) throw friendly(error);
          return { needsConfirmation: data.session === null };
        },
        async signInWithMicrosoft() {
          const { error } = await getSupabase().auth.signInWithOAuth({
            provider: "azure",
            options: {
              // "email" is needed, otherwise Microsoft doesn't send the address.
              scopes: "openid profile email",
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });
          if (error) throw friendly(error);
        },
        async signOut() {
          await getSupabase().auth.signOut();
        },
        async isUsernameAvailable(username) {
          const { data, error } = await getSupabase().rpc("username_available", {
            name: username,
          });
          if (error) throw friendly(error);
          return data === true;
        },
        async changeEmail(email) {
          const { error } = await getSupabase().auth.updateUser(
            { email: email.trim() },
            { emailRedirectTo: `${window.location.origin}/auth/callback` },
          );
          if (error) throw friendly(error);
        },
        async changePassword(password) {
          const { error } = await getSupabase().auth.updateUser({ password });
          if (error) throw friendly(error);
        },
        async requestPasswordReset(email) {
          const { error } = await getSupabase().auth.resetPasswordForEmail(email.trim(), {
            redirectTo: `${window.location.origin}/auth/callback?next=${RESET_PASSWORD_PATH}`,
          });
          if (error) throw friendly(error);
        },
        async deleteAccount() {
          const supabase = getSupabase();
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;
          // Remove the profile pictures first; the database can't delete storage files.
          const { data: files } = await supabase.storage.from(AVATAR_BUCKET).list(user.id);
          if (files?.length) {
            await supabase.storage
              .from(AVATAR_BUCKET)
              .remove(files.map((f) => `${user.id}/${f.name}`));
          }
          const { error } = await supabase.rpc("delete_my_account");
          if (error) throw friendly(error);
          await supabase.auth.signOut();
        },
        onChange(listener) {
          const { data } = getSupabase().auth.onAuthStateChange((event) => {
            if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
              listener();
            }
          });
          return () => data.subscription.unsubscribe();
        },
      }
    : null;

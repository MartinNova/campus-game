import { NextResponse, type NextRequest } from "next/server";
import { isAllowedEmail } from "@/lib/auth/nova-account";
import { safeNextPath } from "@/lib/auth/password-reset";
import { ALLOWED_EMAIL_DOMAINS, isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Links from Supabase land here: the confirmation e-mail after sign-up, an
 * e-mail change, a password reset or the Microsoft sign-in. We swap the one-time
 * code for a session cookie, check the e-mail domain (if restricted) and open
 * ?next= (only paths inside the app) or your area.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const fail = (reason: string) => NextResponse.redirect(`${origin}/login?login_error=${reason}`);

  if (!isSupabaseConfigured || !code) return fail("missing_code");

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return fail("exchange_failed");

  if (!isAllowedEmail(data.user.email, ALLOWED_EMAIL_DOMAINS)) {
    await supabase.auth.signOut();
    return fail("not_allowed");
  }

  return NextResponse.redirect(`${origin}${safeNextPath(searchParams.get("next"))}`);
}

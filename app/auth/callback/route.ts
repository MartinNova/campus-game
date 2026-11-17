import { NextResponse, type NextRequest } from "next/server";
import { isAllowedEmail } from "@/lib/auth/nova-account";
import { ALLOWED_EMAIL_DOMAINS, isSupabaseConfigured } from "@/lib/supabase/config";
import { getSupabaseServer } from "@/lib/supabase/server";

/**
 * Microsoft sends the user back here after sign-in (via Supabase).
 * We swap the one-time code for a session cookie, check the e-mail domain
 * and continue to the profile page.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const fail = (reason: string) => NextResponse.redirect(`${origin}/profile?login_error=${reason}`);

  if (!isSupabaseConfigured || !code) return fail("missing_code");

  const supabase = await getSupabaseServer();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return fail("exchange_failed");

  if (!isAllowedEmail(data.user.email, ALLOWED_EMAIL_DOMAINS)) {
    await supabase.auth.signOut();
    return fail("not_nova");
  }

  return NextResponse.redirect(`${origin}/profile`);
}

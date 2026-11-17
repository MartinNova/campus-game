# Accounts (e-mail + password)

Students create an account with e-mail, username and password, add a profile
picture and fill in their settings. Supabase handles login, database and file
storage. Without the Supabase keys in `.env.local` the app keeps the demo login.

| Page        | What it does                                                                              |
| ----------- | ----------------------------------------------------------------------------------------- |
| `/login`    | Sign in or create an account                                                              |
| `/profile`  | "Your area": your profile card (picture, programme, year, interests)                      |
| `/settings` | Profile, studies at Nova, sports & free time, privacy, account (e-mail, password, delete) |

The header shows **Sign in** when signed out, otherwise the settings gear and your picture.

## One-time setup (Supabase)

1. Create a free project on [supabase.com](https://supabase.com), region EU.
2. **SQL Editor** → run both files in `supabase/migrations/`, oldest first:
   1. `20261117000000_profiles.sql` (profiles table)
   2. `20261117010000_accounts.sql` (username, picture, settings, `avatars` bucket)
3. **Authentication → Sign In / Providers → Email**: enabled (default).
   - For a live demo, turn **Confirm email** off: Supabase's built-in mail server only
     sends a few e-mails per hour. With it on, new users must click a link first.
4. **Authentication → URL Configuration**: Site URL `http://localhost:3000`,
   Redirect URLs `http://localhost:3000/auth/callback` (add the deployed URL later).
5. **Project Settings → API Keys**: copy the Project URL and the publishable / `anon` key.

```bash
cp .env.example .env.local   # fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev                  # restart after changing .env.local
```

The `anon` key is meant for the browser; access is protected by row level security.
Never put the `service_role` key into the app or the repo.

## Who can see what

- Signed-in users see profiles with visibility "All students on the app" and always their own.
- Everyone can only edit their own profile; e-mail and student number can't be edited.
- Profile pictures are public by URL (bucket `avatars`), each user can only upload to their own folder.
- "Delete account" removes the login, profile and pictures for good.

## Options

| Variable                            | Effect                                                                                               |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS` | e.g. `novasbe.pt`: only these addresses may sign in. Empty = everyone.                               |
| `NEXT_PUBLIC_MICROSOFT_LOGIN`       | `true` adds "Sign in with Microsoft" ([docs/microsoft-login.md](microsoft-login.md), needs Nova IT). |

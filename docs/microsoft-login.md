# Sign in with Microsoft (Nova account)

> Optional extra to the normal accounts ([docs/accounts.md](accounts.md)). Turn it on with
> `NEXT_PUBLIC_MICROSOFT_LOGIN=true` once the Azure app registration exists.
> Status 17.11.2026: Nova blocks app registrations for students, so this needs Nova IT.

Students sign in with their `@novasbe.pt` Microsoft 365 account. Supabase handles
the login and stores the profiles. Without the Supabase keys in `.env.local` the
app simply keeps the demo login, so this setup is only needed once, by one person.

```
Browser ──"Sign in with Microsoft"──▶ Supabase Auth ──▶ Microsoft (Nova tenant)
   ▲                                                         │
   └──── /auth/callback (session cookie, domain check) ◀─────┘
```

What we read from Microsoft: name and e-mail only (`openid profile email`).
The student number is taken from the e-mail (`79109@novasbe.pt` → `79109`).

## 1. Supabase project

1. Create a free project on [supabase.com](https://supabase.com), region **EU** (e.g. Frankfurt).
2. **SQL Editor** → paste and run `supabase/migrations/20261117000000_profiles.sql`.
   This creates the `profiles` table, its access rules and the trigger that
   creates a profile on the first sign-in (only for `@novasbe.pt`).
3. **Project Settings → API**: copy the Project URL and the `anon` / publishable key.

## 2. App registration at Microsoft

Students usually can't register apps inside the Nova tenant, so use a personal
Microsoft account on [portal.azure.com](https://portal.azure.com) (free):

1. **Microsoft Entra ID → App registrations → New registration**
   - Name: `Nova Campus App`
   - Supported account types: **Accounts in any organizational directory (multitenant)**
   - Redirect URI: platform **Web**, `https://<your-project-ref>.supabase.co/auth/v1/callback`
2. **Certificates & secrets → New client secret** → copy the **Value** (shown only once).
3. **Overview** → copy the **Application (client) ID**.
4. **Token configuration → Add optional claim → ID → `email`** (so the e-mail is always sent).

## 3. Connect them in Supabase

1. **Authentication → Sign In / Providers → Azure**: enable, paste client ID and secret.
   **Azure Tenant URL**: `https://login.microsoftonline.com/c42931e3-6733-41e6-8d42-c48ba334bba4`
   (the Nova SBE tenant, so only Nova accounts get the login screen).
2. **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000` (later the deployed URL)
   - Redirect URLs: `http://localhost:3000/auth/callback` (later also the deployed one)

## 4. Local setup

```bash
cp .env.example .env.local   # then fill in the two Supabase values
npm run dev
```

The header now shows **Sign in with Microsoft**. After signing in you land on `/profile`.
Never commit `.env.local`; the client secret only lives in Supabase.

## Troubleshooting

| Problem                                                 | Cause / fix                                                                                                                                                                             |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Microsoft says **"Need admin approval"**                | Nova doesn't allow students to consent to new apps. Ask Nova IT to grant admin consent for the app (they need the Application ID and the permissions `openid profile email User.Read`). |
| "Only Nova SBE accounts can sign in"                    | Signed in with a non-`@novasbe.pt` account. Allowed domains: `NEXT_PUBLIC_ALLOWED_EMAIL_DOMAINS` and the check in the SQL trigger.                                                      |
| Signed in, but profile is empty / "Profile unavailable" | The SQL migration wasn't run (step 1.2).                                                                                                                                                |
| Redirect error from Supabase                            | `http://localhost:3000/auth/callback` is missing in the Redirect URLs (step 3.2).                                                                                                       |

## Later: Outlook, Teams, Moodle

- **Outlook / Teams** (mails, calendar) go through Microsoft Graph with extra scopes
  such as `Mail.Read` or `Calendars.Read`. Universities often require IT approval for these.
- **Moodle** is not part of Microsoft 365. It needs Moodle's own web service API,
  which Nova would have to enable for us. Until then: link to Moodle.

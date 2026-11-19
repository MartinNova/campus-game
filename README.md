# Campus Perfect Match

Web app that makes campus life at **Nova SBE (Lisbon)** more social and better organised.
Group project for **Introduction to Programming** (NOVA Master, S1).

## Features

Current module: **Sport**

| Feature            | Status      | Description                                                                                            |
| ------------------ | ----------- | ------------------------------------------------------------------------------------------------------ |
| Padel match finder | in progress | Create, filter, join and leave matches (mock data / localStorage)                                      |
| Surf forecast      | in progress | Waves, wind and temperature for spots near Lisbon (Open-Meteo, no API key) with a traffic-light rating |
| Gym                | placeholder | Mock data only; real data once usage rights are cleared                                                |

Already in place: app shell with bottom navigation, demo login (account switcher with team and demo accounts),
shared UI components and placeholder pages for Timetable, Friends and Canteen.

## Tech stack

- Next.js (App Router), React, TypeScript
- Tailwind CSS, lucide-react icons
- ESLint + Prettier, GitHub Actions CI
- Data: mock data / localStorage behind a service layer (`lib/services`); Supabase for
  accounts, profiles and pictures when configured ([docs/accounts.md](docs/accounts.md))

## Setup

Requires Node.js 20.9 or newer.

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

| Script              | Purpose                        |
| ------------------- | ------------------------------ |
| `npm run dev`       | Start the dev server           |
| `npm run lint`      | ESLint                         |
| `npm run typecheck` | TypeScript check               |
| `npm run format`    | Format all files with Prettier |
| `npm run build`     | Production build               |

### Demo accounts

There is no real login yet. Switch accounts in the header. The repo ships four **team placeholder**
accounts and six fictional **demo students**. To show your real names and student IDs locally
(e.g. in the presentation), set `NEXT_PUBLIC_TEAM_MEMBERS` in `.env.local`. It is never committed.

## Tests

`npm test` runs 200+ unit tests (Vitest) on every pull request and on `main` (see CI). They cover
the accepted path, the **rejected** actions and the **edge cases** of each workflow:

| Area                         | Accepted                                                 | Rejected / edge cases                                                                                                                                            | Files                                                 |
| ---------------------------- | -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| Accounts                     | valid usernames, profiles, links                         | too short/long usernames, 7-char passwords, bio over 300, fake LinkedIn URLs, wrong password message                                                             | `lib/profile/`, `lib/auth/`, `lib/validation/`        |
| Padel                        | post, ask to join, accept, leave                         | past dates, full courts, double requests, declined players asking again, non-organisers answering or cancelling                                                  | `lib/padel/`, `lib/services/rejected-actions.test.ts` |
| Rooms                        | post, filter, delete own                                 | someone else deleting your listing, rent 0 / 5001 / not a number, title 81 chars, end before start                                                               | `lib/rooms/`, `lib/services/`, `lib/validation/`      |
| Messages                     | send, group chats, unread, mark read                     | empty or 1001-char messages, others reading your chat, marking your own messages as read                                                                         | `lib/messages/`, `lib/services/`                      |
| Trains, deadlines, timetable | next trains, train after class, `.ics` export and import | after midnight, no data for a day, DST, holidays                                                                                                                 | `lib/transport/`, `lib/deadlines/`, `lib/timetable/`  |
| Security                     | –                                                        | every table has Row Level Security, no table granted to signed-out visitors, security-definer functions pin `search_path`, no secret keys or `.env.local` in git | `lib/security/security.test.ts`                       |

The services are tested in demo mode (an in-memory `localStorage`), so tests need no network.
The same rules are enforced a second time by the database (check constraints and RLS policies in
`supabase/migrations/`), so a modified client can't skip them.

## Folder structure

```
app/                    routes
  sport/                /sport overview
    padel/ surf/ gym/   sport sub-modules
  timetable/ friends/ canteen/   later modules (placeholders)
components/
  ui/                   shared building blocks (Card, Button, Badge, ...)
  layout/               header, bottom nav, account switcher
  providers/            React context (current user)
  sport/<module>/       module-specific components
lib/
  config/               app name, navigation (single source of truth)
  services/             data access layer (mock now, Supabase later)
  api/                  clients for external APIs (Open-Meteo)
  storage.ts            safe localStorage helper
types/                  TypeScript types and service contracts per module
data/                   mock data
```

## Team workflow

One branch per feature, Pull Request into `main`, review by a teammate.
See [CONTRIBUTING.md](CONTRIBUTING.md) for which files belong to which module.

## Roadmap

1. Sport module: padel, surf, gym
2. Timetable tracker
3. Friends and meet-ups
4. Canteen menu
5. Supabase auth and database: accounts, profiles and settings ([docs/accounts.md](docs/accounts.md)); Microsoft sign-in prepared

## Team

| Name                | Student ID |
| ------------------- | ---------- |
| Anna Nenninger      | 79633      |
| Martin Schallermair | 79780      |
| Till Fassbender     | 79109      |
| Lea Esau            | 78415      |

# Campus Perfect Match

Web app that makes campus life at **Nova SBE (Lisbon)** more social and better organised.
Group project for **Introduction to Programming** (NOVA Master, S1).

## Features

Live at **https://nova-app-orcin-tau.vercel.app** (scan `docs/nova-app-qr.png`). Sign in with
e-mail and password, or look around without an account.

| Module    | What you can do                                                                                                                                                         |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home      | Your day: next lecture, surf in Carcavelos, food, padel and to-dos at a glance                                                                                          |
| Sport     | **Padel**: post a booked court, ask to join, organiser accepts or declines (live). **Running**: clubs and runs. **Surf**: forecast and schools. **Gym**, **Yoga**       |
| Study Hub | **Timetable** (weekly lectures, `.ics` import, holidays), **To-dos** (lists, board), **Deadlines & Payments** (tuition dates from netPA with calendar reminders)        |
| Friends   | Find Nova students by programme and sport, view profiles, **direct messages** with unread count                                                                         |
| Campus    | **Getting to campus** (next CP trains from Carcavelos/Oeiras, your train after class, Uber, map), **Rooms & flats** (listings with photos), Food Options, library links |
| Account   | Profile with picture, programme and links; settings; change e-mail/password; delete account                                                                             |

How it is built and why: **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

## Tech stack

- Next.js (App Router), React, TypeScript
- Tailwind CSS, lucide-react icons
- ESLint + Prettier, GitHub Actions CI
- Supabase: Auth, Postgres with Row Level Security, Storage, Realtime ([docs/accounts.md](docs/accounts.md))
- Service layer (`lib/services`) with a demo mode (localStorage) when Supabase isn't configured
- Vercel (deploys `main` automatically)

## Setup

Requires Node.js 20.9 or newer (CI uses Node 24, see `.nvmrc`).

```bash
npm ci             # installs exactly the versions in package-lock.json
cp .env.example .env.local
npm run dev        # http://localhost:3000
```

Dependencies are pinned to exact versions (`.npmrc` has `save-exact=true`), and CI fails on any
known vulnerability (`npm audit`). GitHub Actions are pinned to commit SHAs.

| Script              | Purpose                                      |
| ------------------- | -------------------------------------------- |
| `npm run dev`       | Start the dev server                         |
| `npm run lint`      | ESLint                                       |
| `npm run typecheck` | TypeScript check                             |
| `npm run format`    | Format all files with Prettier               |
| `npm test`          | Unit tests (Vitest)                          |
| `npm run build`     | Production build                             |
| `npm audit`         | Check dependencies for known vulnerabilities |

### Demo accounts

There is no real login yet. Switch accounts in the header. The repo ships four **team placeholder**
accounts and six fictional **demo students**. To show your real names and student IDs locally
(e.g. in the presentation), set `NEXT_PUBLIC_TEAM_MEMBERS` in `.env.local`. It is never committed.

## Folder structure

```
app/                    routes (one folder per URL), e.g. sport/padel, campus/rooms, friends/chat
components/
  ui/ layout/ providers/  shared building blocks, header and tab bar, current user
  <module>/             UI per module (sport/padel, rooms, messages, transport, ...)
lib/
  services/             data access per module: Supabase or localStorage (demo)
  <module>/             pure rules per module (validation, sorting, calculations) + tests
  supabase/             Supabase clients and config
  security/ validation/ cross-cutting tests (RLS, secrets, boundary values)
types/                  data shapes and service contracts per module
data/                   demo data, generated train timetable
supabase/migrations/    database tables, constraints and RLS policies (run in order)
scripts/                build-train-timetable.mjs (CP GTFS -> data/trains.json)
docs/                   ARCHITECTURE.md, accounts.md (Supabase setup), QR code
```

Details per layer and why: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Team workflow

One branch per feature, Pull Request into `main`, review by a teammate.
See [CONTRIBUTING.md](CONTRIBUTING.md) for which files belong to which module.

## Roadmap

Done: sport, study hub, friends with chat, campus, accounts, deployment. Next steps and known
limits are listed in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#5-limits-honest-list).

## Team

| Name                | Student ID |
| ------------------- | ---------- |
| Anna Nenninger      | 79633      |
| Martin Schallermair | 79780      |
| Till Fassbender     | 79109      |
| Lea Esau            | 78415      |

# Campus Perfect Match

Web app that makes campus life at **Nova SBE (Lisbon)** more social and better organised.
Group project for **Introduction to Programming** (NOVA Master, S1).

## Features

Current module: **Sport**

- **Padel match finder:** create, filter, join and leave matches (mock data / localStorage).
- **Surf forecast:** wave, wind and temperature forecast for spots near Lisbon (Open-Meteo, no API key) with a traffic-light rating.
- **Gym (placeholder):** mock data only; real data follows once usage is cleared.

## Tech stack

Next.js (App Router), TypeScript, Tailwind CSS, ESLint, Prettier. Mobile-first.
Data access is wrapped in `lib/services` so Supabase can replace the mocks later.

## Setup

```bash
npm install
cp .env.example .env.local
npm run dev   # http://localhost:3000
```

Scripts: `npm run lint`, `npm run typecheck`, `npm run format`, `npm run build`.

## Folder structure

```
app/          routes (/, /sport, /sport/padel, /sport/surf, /sport/gym)
components/   ui/ (shared), layout/ (nav), sport/ (module components)
lib/          api/ (external clients), services/ (data layer)
types/        shared TypeScript types
data/         mock data
```

## Roadmap

1. Sport module (padel, surf, gym)
2. Timetable tracker
3. Friends and meet-ups
4. Canteen menu
5. Supabase auth and database

## Team

See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow.

| Name                | Student ID |
| ------------------- | ---------- |
| Anna Nenninger      | 79633      |
| Martin Schallermair | 79780      |
| Till Fassbender     | 79109      |
| Lea Esau            | 78415      |

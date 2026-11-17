# Contributing

Short version of our team workflow (see also the group's GitHub guide).

## Daily flow

```bash
git checkout main && git pull            # 1. always start from the latest main
git checkout -b feature/<module>         # 2. one branch per feature
# ...work, then commit small steps:
git add . && git commit -m "Add padel match list"
git push -u origin feature/<module>      # 3. push, then open a Pull Request
```

- Never commit directly to `main`. Every change goes through a Pull Request.
- Another team member reviews and merges. CI (lint, typecheck, format, build) must be green.
- Before pushing: `npm run lint && npm run typecheck && npm run format` (`npm run format` auto-fixes).
- Commit messages: short, imperative, English ("Add surf rating", "Fix join button").

## Where your code goes (avoids merge conflicts)

Each module owns its own files. Stay inside them:

| Module    | Pages                                                      | Components                                                        | Logic / services                                                               | Types                               | Mock data                      |
| --------- | ---------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------- | ------------------------------ |
| Padel     | `app/sport/padel/`                                         | `components/sport/padel/`                                         | `lib/services/padel.service.ts`, `lib/padel/`                                  | `types/padel.ts`                    | `data/padel.mock.ts`           |
| Surf      | `app/sport/surf/`                                          | `components/sport/surf/`                                          | `lib/api/open-meteo.ts`, `lib/surf/`                                           | `types/surf.ts`                     | `lib/surf/spots.ts`            |
| Gym       | `app/sport/gym/`                                           | `components/sport/gym/`                                           | `lib/services/gym.service.ts`                                                  | `types/gym.ts`                      | `data/gym.mock.ts`             |
| Accounts  | `app/login/`, `app/profile/`, `app/settings/`, `app/auth/` | `components/auth/`, `components/profile/`, `components/settings/` | `lib/services/{auth,profile,user}.service.ts`, `lib/profile/`, `lib/supabase/` | `types/profile.ts`, `types/user.ts` | `supabase/migrations/`         |
| Deadlines | `app/study/deadlines/`                                     | `components/deadlines/`                                           | `lib/deadlines/`                                                               | `types/deadlines.ts`                | `data/deadlines.ts`            |
| Transport | `app/campus/getting-here/`                                 | `components/transport/`                                           | `lib/transport/`, `scripts/build-train-timetable.mjs` (`npm run trains`)       | `types/transport.ts`                | `data/trains.json` (generated) |

Shared files (change only in small, separate PRs and tell the team):
`app/layout.tsx`, `components/ui/`, `components/layout/`, `lib/config/`, `lib/storage.ts`, `app/globals.css`.

When your module is merged, set its `status` to `"live"` in `lib/config/navigation.ts`.

## Rules

- Components never use `localStorage` or `fetch` directly; they call a service in `lib/services/` or a client in `lib/api/`. That way we can switch to Supabase later without touching the UI.
- Use the shared UI (`Card`, `Button`, `Badge`, `PageHeader`) and the colour tokens (`bg-surface`, `text-muted`, `bg-brand`, ...).
- No secrets and no real personal data in the repo. Use `.env.local` (see `.env.example`).

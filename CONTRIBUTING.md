# Contributing

- Never work on `main`. One branch per feature: `feature/padel`, `feature/surf`, `fix/<topic>`.
- Small, focused commits with imperative messages ("Add padel match filter").
- Run `npm run lint && npm run typecheck && npm run format:check` before pushing.
- Open a Pull Request into `main`; another member reviews and merges.
- Stay inside your module's folders (`app/sport/<module>`, `components/sport/<module>`,
  `lib/**/<module>*`, `types/<module>.ts`, `data/<module>*`) to avoid merge conflicts.
  Shared code (`components/ui`, `components/layout`) only via small, separate PRs.
- No secrets in the repo. Use `.env.local` (see `.env.example`).

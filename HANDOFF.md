# Dokyu: handoff for the next session

Read this first, then `docs/PLAN.md` (the full plan) and `docs/CONTENT.md` (verified research).

## Who and what
- **Owner:** Mukramin Bariwa Ansao ("fairy"). GitHub: `mukraminbariwa5-create`. Email: mukraminansao@gmail.com.
- **Dokyu:** Filipino government-documents guide + barangay request/queue/QR-claim system. Android + web from one Expo codebase. Animated AI guide mascot **Doki**.
- **Name:** kept as "Dokyu". No PH trademark conflict in Classes 9/42/45. Public handle "DokyuPH".

## Status (2026-10-30)
| Item | State |
|---|---|
| Plan | v1.5, scope frozen, all open decisions closed (`docs/PLAN.md` §11) |
| Content | 8 guides + first-batch offices verified (`docs/CONTENT.md`, last verified 2026-10-30). ⚠️ items still to re-check before launch |
| Design | **Locked: "Bayan Blue"** (`docs/PLAN.md` §4.2). Prototype: https://claude.ai/artifact/XvFGTnhEmNFipg2UTstJ1u (resident app clickable, home + guided tour, onboarding, sign-in, staff counter board) |
| Phase 0 | Code written and committed locally (1 commit). **Not pushed yet**: create an empty public repo `Dokyu` on `mukraminbariwa5-create`, then `git remote add origin https://github.com/mukraminbariwa5-create/Dokyu.git && git push -u origin main` |
| Tests | `packages/shared`: 7/7 pass. Server and app tests written but **never run** (the last session had no package registry access) |

## First things to do in the new session
1. `pnpm install` at the repo root (Node 22+, pnpm 10). Fix any version mismatches. Expo SDK pinned to `~54.0.0`. If a newer SDK is current, run `npx expo install --fix` in `apps/mobile-web`.
2. `cp server/.env.example server/.env`, set real secrets, `pnpm db:up`, `pnpm db:migrate` (name the migration `init`), `pnpm db:seed`.
3. `pnpm test` and `pnpm typecheck`. Fix anything red.
4. `pnpm dev:api` → open http://localhost:4000/api/v1/health. `pnpm dev:web` → check Home, Guides, a guide page.
5. Push to GitHub (see above). Then finish Phase 0: ESLint config + CI green.
6. Start **Phase 1: Design system** (`docs/PLAN.md` §12):
   - Add NativeWind wired to `packages/shared/src/tokens.ts`
   - Components: Button, Card, Input, Badge (status colors), StatusTimeline, TicketCard, AgencyTile, Doki tab, Screen
   - Responsive layout: bottom tabs on phones, left sidebar on desktop web
   - i18next with `locales/en.json` + `tl.json`; large-text mode (20px body)
   - A `/showcase` screen. Done when it looks right on a phone and desktop browser.

## Rules to keep
- One phase at a time. New ideas go to `docs/PLAN.md` §3.2 "Later".
- Originality: no eGovPH name/logo/layouts/wording, **no Philippine flag elements (RA 8491)**, no real agency seals (colored initials only), "Not affiliated with any government agency" on sign-in, Home and About.
- Guides link only to official sites. Show "Last verified" on every guide.
- Never store GPS. Redact `lat`/`lng` from logs.
- Commit author: Mukramin Bariwa Ansao <mukraminansao@gmail.com>. MIT license.

## Prompt to paste in the new session
> I'm continuing my project Dokyu. The folder is attached/connected. Read HANDOFF.md, then docs/PLAN.md and docs/CONTENT.md. Do the "First things to do" list in HANDOFF.md in order: install, set up the database, run tests and fix failures, run the API and web app, then start Phase 1 (design system). Don't ask me to do things you can do yourself.

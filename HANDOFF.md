# Dokyu: handoff for the next session

Read this first, then `docs/PLAN.md` (the full plan) and `docs/CONTENT.md` (verified research).

## Who and what
- **Owner:** Mukramin Bariwa Ansao ("fairy"). GitHub: `mukraminbariwa5-create`. Email: mukraminansao@gmail.com.
- **Dokyu:** Filipino government-documents guide + barangay request/queue/QR-claim system. Android + web from one Expo codebase. Animated AI guide mascot **Doki**.
- **Name:** kept as "Dokyu". No PH trademark conflict in Classes 9/42/45. Public handle "DokyuPH".

## Status (2026-10-30, end of session 2)
| Item | State |
|---|---|
| Plan | v1.5, scope frozen (`docs/PLAN.md`) |
| Content | 8 guides + first-batch offices verified (`docs/CONTENT.md`). ⚠️ items still to re-check before launch |
| Design | Locked: "Bayan Blue". Prototype: https://claude.ai/artifact/XvFGTnhEmNFipg2UTstJ1u |
| Phase 0 | ✅ Done. Pushed to https://github.com/mukraminbariwa5-create/dokyu, CI green (lint, typecheck, tests against Postgres) |
| Phase 1 | ✅ Design system done, checked at 390px (phone) and 1440px (desktop), English + Tagalog, large text |
| Tests | 19 pass (shared 11, server 8). Lint and typecheck clean |

## Versions (upgraded this session)
Expo SDK **58** (RN 0.88, React 19.3), Expo Router 58, NativeWind **4.2** + Tailwind 3.4, Reanimated 4.7, i18next 26, Prisma 6.19, Express 5. NativeWind 5 is still a release candidate; move to it only once it's stable.

## What Phase 1 added
- `apps/mobile-web/tailwind.config.ts` builds the NativeWind theme from `packages/shared/src/tokens.ts`. Change tokens there, never in the config.
- `components/ui/`: AppText, Button, Card/PressableCard, Input, Badge/NewTag, StatusTimeline, TicketCard, AgencyTile, Icon, Doki/DokiFace, Screen/Section, SegmentedControl, Wordmark, Disclaimer.
- `components/navigation/AppTabBar.tsx`: one tab bar, two layouts. Phones (<900px) get a bottom bar with a raised Doki button; desktop gets a left sidebar.
- `lib/settings.tsx`: language + large text, saved on the device. `lib/i18n.ts` + `locales/en.json`, `tl.json` (same keys).
- Shared helpers with tests: `startingFee` (fees marked `addOn` are added on top, e.g. NBI ₱130 + ₱25), `requestStatusTone`, `timelineSteps`.
- `/showcase` (also linked from the desktop sidebar).

## Gotchas found this session
- **All text goes through `<AppText>`**, otherwise large-text mode misses it.
- **Expo Router 58:** `href: null` on a tab now *redirects away* from that route instead of just hiding its button, and tab routes that aren't declared as `<Tabs.Screen>` also redirect to Home. Declare every route in `app/(resident)/_layout.tsx`; `AppTabBar` decides which ones get a button.
- `Link asChild` replaces the child's `style`. Put widths on a wrapping `View`.
- Don't run Expo with `CI=1`: it turns off file watching, so edits don't reload.
- Shared package imports are extensionless (`'./tokens'`), so Metro, tsx and Vitest all resolve them.
- The API and seed script load `server/.env` with Node's `--env-file`.
- Guide titles and steps are still English-only seed data; Tagalog guide text arrives with the DB guides in Phase 3.

## Next: Phase 2 (Auth + onboarding), `docs/PLAN.md` §12
Sign up / login / verify / reset, roles, consent checkbox (RA 10173), onboarding screens with a static Doki, RBAC tests. Done when all roles can log in and the RBAC tests pass.

## Rules to keep
- One phase at a time. New ideas go to `docs/PLAN.md` §3.2 "Later".
- Originality: no eGovPH name/logo/layouts/wording, **no Philippine flag elements (RA 8491)**, no real agency seals (colored initials only), "Not affiliated with any government agency" on sign-in, Home and About.
- Guides link only to official sites. Show "Last verified" on every guide.
- Never store GPS. Redact `lat`/`lng` from logs.
- Commit author: Mukramin Bariwa Ansao <mukraminansao@gmail.com>. MIT license.

## Prompt to paste in the new session
> I'm continuing my project Dokyu. The folder is attached/connected. Read HANDOFF.md, then docs/PLAN.md and docs/CONTENT.md. Start Phase 2 (auth + onboarding). Don't ask me to do things you can do yourself.

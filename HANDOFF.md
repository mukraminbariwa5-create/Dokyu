# Dokyu: handoff for the next session

Read this first, then `docs/PLAN.md` (the full plan) and `docs/CONTENT.md` (verified research).

## Who and what
- **Owner:** Mukramin Bariwa Ansao ("fairy"). GitHub: `mukraminbariwa5-create`. Email: mukraminansao@gmail.com.
- **Dokyu:** government-documents guide for anyone who processes papers (students, job seekers, teachers, employees, workers, parents, seniors). Tells them exactly what to bring and links the official online registration, so they do the prep at home and visit the office once. Android + web from one Expo codebase. Animated AI guide mascot **Doki**.
- **Name:** kept as "Dokyu". No PH trademark conflict in Classes 9/42/45. Public handle "DokyuPH".

## Status (2026-10-30, end of session 2)
| Item | State |
|---|---|
| Plan | **v1.6, citizen-first** (`docs/PLAN.md`). The barangay request system and staff roles moved to §3.2 "Later"; Phase 5 is skipped |
| Content | 8 guides + first-batch offices verified (`docs/CONTENT.md`). ⚠️ items still to re-check before launch |
| Design | Locked: "Bayan Blue". Prototype: https://claude.ai/artifact/XvFGTnhEmNFipg2UTstJ1u |
| Phase 0 | ✅ Done. Pushed to https://github.com/mukraminbariwa5-create/dokyu, CI green (lint, typecheck, tests against Postgres) |
| Phase 1 | ✅ Design system done, checked at 390px (phone) and 1440px (desktop), English + Tagalog, large text |
| Phase 2 | ✅ Accounts + onboarding done and tested in the browser (see below) |
| Phase 3 | 🟡 Step 1 done: guides rebuilt (exact requirements, Do at home / At the office, labelled official links, Before you go checklist, served from the database, English + Tagalog). Step 2 done: Home matches the Bayan Blue prototype, with basic motion. Next: Office Finder |
| Tests | 37 pass (shared 11, server 26 incl. 18 auth integration tests). Lint and typecheck clean |

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

## What Phase 2 added
- **API:** `/auth` (signup, login, refresh, logout, verify-email, resend-verification, forgot, reset), `/me` (profile, onboarding answers), `/me/sessions` (own devices), `/super/audit` (owner only). Details in SECURITY.md.
- **Schema:** migration `auth`. Roles are USER and SUPER_ADMIN; `EmailToken` table; refresh tokens grouped in families (one per device). Barangay tables are still there, unused.
- **Tests:** `server/test/auth.test.ts` runs against `TEST_DATABASE_URL` (the `dokyu_test` database, created by `docker/init-test-db.sql`). It refuses to run against the dev database.
- **App:** `lib/api.ts` (renews the access token automatically), `lib/auth.tsx` (AuthProvider), screens `/sign-in`, `/sign-up`, `/forgot-password`, `/reset-password`, `/verify-email`, `/welcome` (3 intro slides, shown once) and `/setup` (language → area → goals). Guests do onboarding too; their answers move to the account when they sign up.
- **Account tab:** guest card or profile, email-confirmation banner, area and goals, display settings (saved to the profile), signed-in devices, sign out.
- **Seed:** `demo@example.com` / `Dokyu-demo-2026`; `admin@example.com` (password from `SEED_ADMIN_PASSWORD` or printed once).
- **Dev email:** links are printed in the API terminal.
- Android: set `EXPO_PUBLIC_API_URL` to your PC's LAN address (e.g. `http://192.168.1.10:4000`), since `localhost` on a phone is the phone itself.

## Phase 3 so far (audit follow-up, 30 Oct)
- Guide format: `packages/shared/src/guides.ts` (`guideSchema`). Every requirement has qty + how to bring it (original, original + photocopy, print, phone OK, form); every step is `home` or `office` and may carry a labelled official link; tips are `tip` or `warning`. A test fails if any link leaves the official domains.
- DB: migration `guide_content` keeps the whole guide in `DocumentGuide.content`; the API validates each guide before sending it.
- App: `lib/guides.ts` (TanStack Query, bundled guides as instant offline fallback), guide page in `components/guide/parts.tsx`, `/guides/[slug]/checklist` (ticks saved on the device), search + category chips on Guides.
- Home (step 2): `components/home/` GreetingCard (time-based greeting, area chip, floating waving Doki), ServiceGrid (8 tiles, all live), ForYouCard (continue a checklist → first document for a goal → pick a goal, rules in `lib/forYou.ts`), popular guides carousel; `/checklists` page.
- Motion: `lib/motion.tsx` (FadeIn, press scale, Float, animated progress), all off when "reduce motion" is on. NativeWind classes don't style `Animated.View`: give animated views plain `style`.
- **Doki (official, 2026-10-30):** a living document built in code (react-native-svg, no Rive). `components/ui/Doki.tsx` draws him almost-3D (folder thickness, top-left light, glossy eyes, round limbs, ground shadow) with `pose` = idle | walk | walk2 | point | wave | happy, `facing`, and blinking that turns off with reduce motion. `DokiFace` is a crop of the same art. `components/ui/DokiStroll.tsx` makes him walk in, stop beside a button and point, with Replay; it is the base for the Phase 7 spotlight tour. Poses also include talk, worried and pointDown, plus `mouthOpen` for lip-sync.
- **Tour + motion (Phase 3 step 3):** `lib/tour.tsx` (TourProvider, `useTourTarget(id)`, HOME_TOUR) and `components/doki/TourOverlay.tsx`: the screen dims, a gold spotlight springs to each target, Doki walks over (walk frames + bob), points, and talks in a typewriter `DokiBubble`; the last step fires `Confetti`. Runs once on Home (`settings.tourSeen`), replay from Account. Targets: home.services, home.forYou, tab.ask, tab.guides. Motion helpers in `lib/motion.tsx`: FadeIn, PopOnChange, Float, usePressScale, useAnimatedProgress, usePoseCycle. Every screen slides in on focus (Screen), lists cascade, tab icons pop, ticks pop, the last tick fires confetti. All of it turns off with reduce motion.
- **Feature-complete pass (31 Oct):**
  - Offices: `packages/shared/src/seed/offices.ts` (10 checked offices in Metro Manila, Sulu and Zamboanga City, with hours, landmark, booking link, local closures, source) and `offices.ts` (Manila clock, open/closed/holiday status, next opening, hours text, distance, directions/tel links). App: `/offices` (area chips, Near me via expo-location, list/map, guide filter), `/offices/[slug]` (status, coming closures, Directions, Call, Email, booking, hours, landmark, map, services), "Where to go" on every guide. Map = Leaflet + OpenStreetMap in an iframe (web) or WebView (Android), `components/office/`.
  - Holidays: `seed/holidays.ts` (2026 + 2027 proclamations, Eid dates for 2026), `/holidays` (today card, next day off, list by month). API: `GET /api/v1/holidays`; seed writes holidays.
  - My Docs: `lib/mydocs.tsx` (on-device store, family members, alerts), `lib/reminders.ts` (Android local notifications), `/docs`, `/docs/new`, `/docs/[id]`, `/docs/family`, Home alert banner, "Track in My Docs" on guides. Date field: `components/ui/DateField(.web).tsx`.
  - Goals: `packages/shared/src/goals.ts` (GOAL_PLANS, planTotal), `/goals` (ordered plan, total cost, add all to My Docs).
  - Ask Doki: `packages/shared/src/ask.ts` (understands EN/TL/Taglish), `lib/askDoki.ts` (answers + buttons from guides, offices, holidays), `/ask` chat with lip-synced Doki. Offline; an AI model can be added later behind the same screen.
  - Trust: `/about?page=about|help|privacy|terms` (`lib/legal.ts`), Account → Download my data (device + account JSON), Delete data on this device, Delete account (`DELETE /api/v1/me` with password, `GET /api/v1/me/export`; tests in `server/test/privacy.test.ts`). `components/ui/ConfirmDialog.tsx` replaces browser alerts.
  - Live preview: the Pages build sets `EXPO_PUBLIC_PREVIEW=1`, so sign-in screens explain that accounts need the server instead of failing.
  - Click-test: a Playwright crawl of every screen and button (59 checks) passes on phone and desktop sizes.
  - Pre-launch audit (31 Oct): all 44 routes checked in 4 modes (phone EN, phone TL, large text, desktop) on the exact Pages build: no errors, overflow, missing text or tap targets under 40 px. Added `app/+not-found.tsx` + `components/NotFound.tsx`, `components/ui/TextLink.tsx` (44 px tap area), `lib/reminders.web.ts` (no notifications library on web), area-first office order on guides, closures only on days the office opens, CARTO map tiles (work inside frames), showcase hidden in production. Android bundle (`expo export --platform android`) builds.
- Still open: host the API (needs an account on a host), test on an Android phone with Expo Go, Super Admin guide/office editor (content is in the seed files for now), more office areas.

## Next
1. Deploy with `render.yaml` + Neon, steps in `docs/DEPLOY.md`. The server serves the web app itself (`WEB_DIR`, same-origin cookie), runs migrations + seed in the build, and switches email on only with `RESEND_API_KEY` + `MAIL_FROM` (`/api/v1/health` reports `features.email`). Tested locally in production mode: sign-up, sign-in, reload, export, delete, demo login, 58/59 crawl (the 1 is preview-only).
2. Test on an Android phone with Expo Go (map WebView, date picker, reminders, Near me).
3. Super Admin editor for guides and offices; more office areas.

## Rules to keep
- One phase at a time. New ideas go to `docs/PLAN.md` §3.2 "Later".
- Originality: no eGovPH name/logo/layouts/wording, **no Philippine flag elements (RA 8491)**, no real agency seals (colored initials only), "Not affiliated with any government agency" on sign-in, Home and About.
- Guides link only to official sites. Show "Last verified" on every guide.
- Never store GPS. Redact `lat`/`lng` from logs.
- Commit author: Mukramin Bariwa Ansao <mukraminansao@gmail.com>. MIT license.

## Prompt to paste in the new session
> I'm continuing my project Dokyu. The folder is attached/connected. Read HANDOFF.md, then docs/PLAN.md and docs/CONTENT.md. Start Phase 3 (guides, goals and offices). Don't ask me to do things you can do yourself.

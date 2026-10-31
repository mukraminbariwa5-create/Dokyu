# Dokyu: handoff for the next session

Read this first, then `docs/PLAN.md` (the full plan) and `docs/CONTENT.md` (verified research).

## Who and what
- **Owner:** Mukramin Bariwa Ansao ("fairy"). GitHub: `mukraminbariwa5-create`. Email: mukraminansao@gmail.com.
- **Dokyu:** government-documents guide for anyone who processes papers (students, job seekers, teachers, employees, workers, parents, seniors). Tells them exactly what to bring and links the official online registration, so they do the prep at home and visit the office once. Android + web from one Expo codebase. Animated AI guide mascot **Doki**.
- **Name:** kept as "Dokyu". No PH trademark conflict in Classes 9/42/45. Public handle "DokyuPH".

## Status (2026-10-31, end of session 3)
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
  - My Docs: `lib/mydocs.tsx` (on-device store, family members, alerts, **account sync**), `lib/reminders.ts` (Android local notifications), `/docs`, `/docs/new`, `/docs/[id]`, `/docs/family`, Home alert banner, "Track in My Docs" on guides. Date field: `components/ui/DateField(.web).tsx`.
  - Goals: `packages/shared/src/goals.ts` (GOAL_PLANS, planTotal), `/goals` (ordered plan, total cost, add all to My Docs).
  - Ask Doki: `packages/shared/src/ask.ts` (understands EN/TL/Taglish), `lib/askDoki.ts` (answers + buttons from guides, offices, holidays), `/ask` chat with lip-synced Doki. Offline; an AI model can be added later behind the same screen.
  - Trust: `/about?page=about|help|privacy|terms` (`lib/legal.ts`), Account → Download my data (device + account JSON), Delete data on this device, Delete account (`DELETE /api/v1/me` with password, `GET /api/v1/me/export`; tests in `server/test/privacy.test.ts`). `components/ui/ConfirmDialog.tsx` replaces browser alerts.
  - Live preview: the Pages build sets `EXPO_PUBLIC_PREVIEW=1`, so sign-in screens explain that accounts need the server instead of failing.
  - Click-test: a Playwright crawl of every screen and button (59 checks) passes on phone and desktop sizes.
  - Pre-launch audit (31 Oct): all 44 routes checked in 4 modes (phone EN, phone TL, large text, desktop) on the exact Pages build: no errors, overflow, missing text or tap targets under 40 px. Added `app/+not-found.tsx` + `components/NotFound.tsx`, `components/ui/TextLink.tsx` (44 px tap area), `lib/reminders.web.ts` (no notifications library on web), area-first office order on guides, closures only on days the office opens, map from MapLibre + OpenFreeMap (CARTO now needs an API key and OSM's tile server blocks some browsers; OpenFreeMap needs no key), showcase hidden in production. Android bundle (`expo export --platform android`) builds.
- Still open: host the API (needs an account on a host), test on an Android phone with Expo Go, Super Admin guide/office editor (content is in the seed files for now), more office areas.

## Session 3 (31 Oct): judge-ready pass
Goal: the app must work and feel fast when a panel tests it. No new content or features.
- **Speed (web):** the server now compresses (gzip/Brotli, `compression`) and caches hashed files for a year (`immutable`), `index.html` is `no-cache`. All screens are in one bundle (`expo-router` `asyncRoutes: false`), so no screen waits for a download on its first tap. `apps/mobile-web/scripts/finish-web.mjs` (run after `expo export`, also in `render.yaml`) adds an instant "dokyu" loading screen and preloads the Poppins fonts; `app/_layout.tsx` fades it out when ready. Measured on a 4x-slowed CPU + slow 4G: first screen 0.35 s (was blank ~9 s), Home 3.1 s (was 9.8 s), return visits 1.0 s, first open of Guides 0.46 s (was 5.7 s), NBI guide 0.5 s (was 7.6 s). Normal taps: 50–150 ms.
- **Fixes:** back links now always go where their label says (`BackLink`, guide "Back to guides", checklist back): before, "‹ My Docs" after Guide → Track went back to the guide. Guests no longer get a red 401 in the console (`POST /auth/refresh` with no token → 204). Checkboxes, chips, tabs and buttons expose `aria-checked/selected/disabled` on web. Sign-in/sign-up small links use `TextLink` (44 px). Desktop "Popular guides" shows all 5 cards in a row (a mouse can't swipe). Account → devices no longer says "This device" twice.
- **Checked:** a 19-step judge script (welcome → setup → tour → guides/search/checklist → My Docs → offices Near me → holidays → Ask Doki EN/TL → sign up/out → demo login → Tagalog → 404) all pass with no console errors; tap-everything crawl: 232 taps on phone + 150 on desktop, no errors. Tests 40 pass, lint + typecheck clean, Android bundle builds.
- The QA scripts live outside the repo (Playwright); ask Claude to re-run a "judge pass" before a demo.

## Next
1. Push this session's changes to GitHub so Render redeploys, then open https://dokyu.onrender.com once a few minutes before a demo (the free server sleeps and takes ~1 minute to wake).
2. Test on an Android phone with Expo Go (map WebView, date picker, reminders, Near me).
3. Later: Super Admin editor for guides and offices; more office areas.

## Rules to keep
- One phase at a time. New ideas go to `docs/PLAN.md` §3.2 "Later".
- Originality: no eGovPH name/logo/layouts/wording, **no Philippine flag elements (RA 8491)**, no real agency seals (colored initials only), "Not affiliated with any government agency" on sign-in, Home and About.
- Guides link only to official sites. Show "Last verified" on every guide.
- Never store GPS. Redact `lat`/`lng` from logs.
- Commit author: Mukramin Bariwa Ansao <mukraminansao@gmail.com>. MIT license.

## Prompt to paste in the new session
> I'm continuing my project Dokyu. The folder is attached/connected. Read HANDOFF.md, then docs/PLAN.md and docs/CONTENT.md. Start Phase 3 (guides, goals and offices). Don't ask me to do things you can do yourself.
- **My Docs sync (1 Nov):** My Docs is always saved on the device and, when signed in, synced with the account so it comes back on a new phone or browser.
  - Rules in `packages/shared/src/mydocs.ts` (`mergeMyDocs`, `cleanMyDocs`, tests in `packages/shared/test/mydocs.test.ts`): newer `updatedAt` wins per document/person; deletions are kept as notes for 180 days so removed items don't come back; documents of a removed person move to "me".
  - Server: `MyDocsStore` (one JSON copy per user, `version`), `GET/PUT /api/v1/me/docs`. PUT needs `baseVersion`; a stale one gets 409 with the newer copy (compare-and-set), the app merges again and retries. Included in "Download my data", deleted with the account. Tests in `server/test/mydocs.test.ts`.
  - App: syncs on sign-in, 1.2 s after each change, and when the app comes back to the front. A guest's documents move into the account at first sign-in; another account's copy is never uploaded (replaced instead). Signing out saves the last changes, then clears My Docs from the device. Phone reminders are rescheduled for documents that arrive from the account. Status line: `components/docs/SyncStatus.tsx`.
- **Demo account (1 Nov):** `demo@example.com` is public, so `server/src/services/demo.ts` resets its profile and My Docs to a sample (dates relative to today) at every sign-in. It can't be locked by wrong passwords (IP rate limit still applies), deleted, or used to sign out other visitors, and its device list shows only the visitor's own device. The app keeps the visitor's language/text size, sets a guest's own My Docs aside (`dokyu.mydocs.guest.v1`) and restores it at sign-out, and shows a "shared demo" notice. Sign-in has a "Try the demo account" button. Tests: `server/test/demo.test.ts`.
- **Keep awake:** `.github/workflows/keep-awake.yml` pings `/api/v1/health` every 10 min, 7 AM–10 PM Manila only (Render's 750 free hours are shared by all free services on the account). GitHub pauses scheduled workflows after 60 days without commits.


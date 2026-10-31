# Dokyu

[![CI](https://github.com/mukraminbariwa5-create/dokyu/actions/workflows/ci.yml/badge.svg)](https://github.com/mukraminbariwa5-create/dokyu/actions/workflows/ci.yml)

**Try it:** https://dokyu.onrender.com (free server: the first visit after a quiet spell takes about a minute to wake up). The old preview address on GitHub Pages now redirects there.

**Dokyu** helps anyone in the Philippines who needs government papers (students, job seekers, teachers, employees, workers, parents, seniors) get them in **one trip instead of three**: know exactly what to bring, do the online part at home, and go to the office only to submit and claim.

- **Document guides:** exact requirements (how many copies, original or photocopy, photo size), fees, and steps split into "Do at home" and "At the office", for the PSA birth certificate, National ID, NBI and Police clearance, Postal ID, TIN, passport and barangay clearance. Each one links only to the official site and shows a "last verified" date.
- **Before you go:** turn a guide's requirements into a checklist to tick off the night before.
- **Office Finder with map:** checked PSA, NBI, DFA, police and post offices in Metro Manila, Sulu and Zamboanga City, with landmarks, hours, directions, booking links and "Closed today" on holidays.
- **Holidays:** the 2026 and 2027 proclamations, with today's status and the next day off.
- **Goal plans:** what to get for a first job, passport, scholarship and more, in order, with the total cost.
- **My Docs:** track documents for you and your family, with appointment and expiry reminders.
- **Doki,** an animated guide built in code who gives a guided tour and answers questions in Tagalog or English from Dokyu's checked guides (offline).
- **Your data:** download everything as a file, delete it from the device, or delete your account.

> Dokyu is an **independent** project and is **not affiliated with any government agency**. Always confirm on the official site linked in each guide.

## Status
| Phase | | Status |
|---|---|---|
| 0 | Setup: monorepo, app, API, database schema, lint, CI | ✅ Done |
| 1 | Design system: NativeWind theme from shared tokens, components, phone tabs + desktop sidebar, English/Tagalog, large-text mode, `/showcase` | ✅ Done |
| 2 | Accounts + onboarding: sign-up with privacy consent, sign-in, email confirmation, password reset, signed-in devices, intro slides and setup (language, area, goals) | ✅ Done |
| 3–8 | Guides & offices → tracker → AI → mascot → polish | Planned ([docs/PLAN.md](docs/PLAN.md)) |

The design is locked in the **Bayan Blue** prototype (light, royal blue `#2042C4`, gold accent, Poppins).

## Tech stack
| Part | Tech |
|---|---|
| App (Android + web, one codebase) | Expo SDK 58 · React Native 0.88 · Expo Router · react-native-web · NativeWind · i18next · TypeScript |
| API | Node.js · Express 5 · TypeScript · Zod |
| Database | PostgreSQL · Prisma |
| Shared | `@dokyu/shared`: design tokens, request rules, verified seed content |
| Later phases | TanStack Query · MapLibre + OpenStreetMap · Rive · Expo Notifications |

## Project structure
```
apps/mobile-web     Expo app (Android + web)
packages/shared     tokens, request status rules, seed guides/offices/demo barangay
server              Express API + Prisma schema + seed
docs                PLAN.md (full plan) · CONTENT.md (verified research)
```

## Run it locally
Requirements: Node 22+, pnpm 10, Docker.

```bash
pnpm install
cp server/.env.example server/.env      # then change the secrets
pnpm db:up                              # Postgres in Docker
pnpm db:migrate                         # create tables
pnpm db:seed                            # 8 guides, offices, demo accounts
pnpm dev:api                            # http://localhost:4000/api/v1/health
pnpm dev:web                            # app in the browser (or pnpm dev:app for Android)
pnpm test                               # unit + API tests (uses the separate dokyu_test database)
pnpm lint && pnpm typecheck             # what CI runs
```
Open http://localhost:8081/showcase to see every UI component. Toggle **Large text** and **Tagalog** there or on Account.

## Demo accounts
After `pnpm db:seed`:
| Account | Email | Password |
|---|---|---|
| User (sample data) | `demo@example.com` | `Dokyu-demo-2026` |
| Super Admin | `admin@example.com` | set `SEED_ADMIN_PASSWORD` in `server/.env`, or use the random one the seed prints once |

In development, confirmation and password-reset emails are printed in the API's terminal instead of being sent.

## Security
See [SECURITY.md](SECURITY.md): input validation, rate limiting, log redaction of location data, per-user data ownership checks, audit log.

## Content sources
Every guide links to its official source (psa.gov.ph, nbi.gov.ph, pnpclearance.ph, passport.gov.ph, bir.gov.ph, phlpost.gov.ph, philsys.gov.ph). Research notes: [docs/CONTENT.md](docs/CONTENT.md).

## Author
**Mukramin Bariwa Ansao** · BSIT (Networking), MSU–Sulu · [LinkedIn](https://linkedin.com/in/mukramin-a-001833333)

MIT License.

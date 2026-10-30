# Dokyu

[![CI](https://github.com/mukraminbariwa5-create/dokyu/actions/workflows/ci.yml/badge.svg)](https://github.com/mukraminbariwa5-create/dokyu/actions/workflows/ci.yml)

**Dokyu** helps Filipinos get government documents without the guesswork, and gives barangays a simple digital request and queue system.

- **National document guides:** fees, requirements and steps for the PSA birth certificate, National ID, NBI and Police clearance, Postal ID, TIN, passport and barangay clearance, checked against official sources with a "last verified" date.
- **Office Finder with map:** the nearest PSA, NBI, DFA, PhilHealth and other offices, with landmarks and hours.
- **Barangay requests:** request a clearance or certificate online, track it, and claim it with a QR code. Staff manage the queue on a counter board and check a valid ID before release.
- **My Docs:** track documents for you and your family, with expiry reminders.
- **Doki,** an animated AI guide who answers in Tagalog or English from Dokyu's checked guides.

> Dokyu is an **independent** project and is **not affiliated with any government agency**. Always confirm on the official site linked in each guide.

## Status
| Phase | | Status |
|---|---|---|
| 0 | Setup: monorepo, app, API, database schema, lint, CI | ✅ Done |
| 1 | Design system: NativeWind theme from shared tokens, components, phone tabs + desktop sidebar, English/Tagalog, large-text mode, `/showcase` | ✅ Done |
| 2–8 | Auth → guides & offices → tracker → barangay → AI → mascot → polish | Planned ([docs/PLAN.md](docs/PLAN.md)) |

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
pnpm db:seed                            # 8 guides, offices, demo barangay
pnpm dev:api                            # http://localhost:4000/api/v1/health
pnpm dev:web                            # app in the browser (or pnpm dev:app for Android)
pnpm test                               # unit + API tests
pnpm lint && pnpm typecheck             # what CI runs
```
Open http://localhost:8081/showcase to see every UI component. Toggle **Large text** and **Tagalog** there or on Account.

## Security
See [SECURITY.md](SECURITY.md): input validation, rate limiting, log redaction of location data, barangay-scoped access, ID check before release, audit log.

## Content sources
Every guide links to its official source (psa.gov.ph, nbi.gov.ph, pnpclearance.ph, passport.gov.ph, bir.gov.ph, phlpost.gov.ph, philsys.gov.ph). Research notes: [docs/CONTENT.md](docs/CONTENT.md).

## Author
**Mukramin Bariwa Ansao** · BSIT (Networking), MSU–Sulu · [LinkedIn](https://linkedin.com/in/mukramin-a-001833333)

MIT License.

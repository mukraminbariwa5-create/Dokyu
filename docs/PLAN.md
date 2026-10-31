# Dokyu — Project Plan

> **Dokyu** is a government-documents helper for everyone in the Philippines who needs to process papers: students, job seekers, teachers, employees, workers, parents, seniors. It tells people exactly what to bring, what it costs, where to go and which official site to register on, so they can prepare everything at home and visit the office only to submit and claim.
> Platforms: **Android + Web** (one codebase). Author: Mukramin Bariwa Ansao (fairy).
> Status: **Planning.** Deployment is planned last, after the app is complete.
> Plan version: v1.6 — 2026-10-30 · **citizen-first scope · design locked · Phases 0–1 done** (v1.6: Dokyu is citizen-first; the barangay request system, staff and barangay-admin roles move to "Later"; guides get exact requirement details, "Do at home / At the office" steps and a "Before you go" checklist; the "Resident" role becomes "User" · v1.5: Bayan Blue design locked with the full clickable prototype, content research verified in DOKYU_CONTENT.md, open decisions closed, repo created · v1.4: "Bayan Blue" design direction with originality rules, Poppins, Doki in blue, guided tour with onboarding and spotlight tips · v1.3: ID check at pickup, notification settings, Terms + Help, low-data mode, error monitoring, demo-ready milestone · v1.1: Office Finder with location, family members, authorization letter generator, cost/time estimate · v1.2: office map with landmarks and building photos, holiday and closure calendar, saved offices offline)

---

## 0. How to use this file

- This is the single source of truth for Dokyu. If a feature is not in this file, it is not part of the build yet.
- To continue in a new chat, send this file and say which phase you're on (see §12).
- When a decision changes, update this file first, then the code.

---

## 1. The problem and the promise

**Problem:** Getting any government document in the Philippines is confusing. People don't know the requirements, the order to get them in, the fees, or where to apply. They go to the office just to ask, find out they need a 2x2 photo, a photocopy or another document first, go home, and come back another day. Some line up at the wrong office or fall for fixers and fake websites.

**Promise:** *"Alamin, ihanda, at i-track ang lahat ng papeles mo — sa isang app."*
(Know it, prepare it, and track all your documents in one app.)
**One trip, not three:** do everything that can be done at home (online registration, appointment, payment, photos, photocopies), then go to the office only to submit and claim.

**What Dokyu is NOT:**
- It does **not** issue or process any document. For PSA, NBI, PNP, PhilSys, DFA, barangays and others, Dokyu guides the user and links to the **official site** for the actual application.
- Offices and barangays do **not** use Dokyu in v1. There are no staff accounts.
- It is **not** an official government app. A clear notice says so on the splash screen, About page and every external link.
- It never asks for or stores a user's passwords to government portals.

---

## 2. Users and roles

Dokyu is for **anyone who processes documents**: students, first-time job seekers, teachers, employees, workers, OFWs, parents doing papers for their kids, seniors. Not only "citizens" in the narrow sense, and not tied to a barangay.

| Role | Who | What they can do |
|---|---|---|
| **Guest** | Anyone, not logged in | Read every guide, use the "What do I need?" helper, the Office Finder and map, and ask Doki (5 messages/day) |
| **User** | Anyone who signs up | Everything a guest can, plus the My Docs tracker, checklists, reminders, family members, saved offices synced across devices, more Doki messages |
| **Super Admin** | You (the owner) | Edit guides, goals, offices, holidays and closures; read outdated-info reports and the audit log |

Reading and finding never need an account. An account is only for saving things and getting reminders.

---

## 3. Feature list

### 3.1 MVP (version 1 — must ship)

**A. Document guides (national + local)**
- Goal: the user leaves home with **everything** the office will ask for.
- Starting documents (8): PSA Birth Certificate, PhilSys National ID, NBI Clearance, Police Clearance, Barangay Clearance, Postal ID, TIN (BIR), Passport (DFA). Barangay Clearance is a normal guide: what it is, what barangays usually ask for, and a reminder that each barangay posts its own fees (RA 11032).
- Each guide shows: what it's for, requirements, fees, processing time, where/how to apply, step-by-step, common mistakes, an **"Open official site"** button and a **"Last verified: [date]"** label.
- **Exact requirement details:** not just "valid ID" but how many, original or photocopy and how many copies, photo size and background (e.g. 2x2, white background, taken within 6 months), and small things like "bring your own black ballpen" or "exact cash".
- **Steps split into "Do at home" and "At the office":** online registration, appointment booking and online payment come first under "Do at home", with the official link right on the step.
- **"Before you go" checklist:** one tap turns the requirements into a checklist to tick off the night before (saved in My Docs for signed-in users, kept on the device for guests).
- Search and categories (Identity, Clearances, Civil Registry, Work and Government Benefits, Travel).
- Guides are **stored in the database and editable by the Super Admin**. Fees and requirements change, so they must never be hard-coded.
- **Available offline** after the first load, since signal is weak in many places.

**B. "What do I need?" goal helper**
- The user picks a goal and gets an ordered checklist of documents.
- Starting goals: *First Job*, *Passport*, *Scholarship*, *Opening a Bank Account*, *Starting a Small Business*, *Enrolling in College*.
- The *First Job* goal starts with the First-Time Jobseeker Barangay Certification (RA 11261), which makes several later documents free.
- The order matters, and the app explains why (e.g. "Get your PSA Birth Certificate first, because NBI and the passport need it").

**C. My Documents tracker**
- Add a document to track. Status: Not started → Preparing requirements → Applied / Appointment booked → Paid → Ready → Received.
- Per-document checklist of requirements (tick them off).
- Save a reference number, appointment date and place.
- **Reminders:** appointment day, pickup day, and **expiry alerts** (e.g. NBI / police clearance validity, passport expiry).

**F. AI guide — animated mascot** (see §6)
- A chat assistant that answers questions about documents in Tagalog or English.
- A **fully animated character** (blinks, talks, reacts, idles), not a static image in a frame.
- Appears on onboarding, the home screen, and as a chat companion.

**G. Accounts and onboarding**
- Sign up with email + password (with email verification). Google sign-in is optional.
- Guided onboarding with the mascot (like Padala's): pick a language → pick your area (province, city/municipality) → choose your goals.
- Profile: name, area, contact number (optional), language, text size.

**I. Office Finder (nearest office by location)**
- From any guide, the user taps **"Find nearest office"** (e.g. nearest Pag-IBIG, PhilHealth, PSA, NBI, SSS, BIR, DFA, LTO, PhilSys registration center).
- **Location is used only when needed:** the app asks for location permission at that moment, uses it once to sort offices, and **does not store the exact coordinates**.
- **Fallback:** if permission is denied or GPS is weak, the user picks province → city/municipality by hand. Only this general area is saved in the profile.
- **Service-aware:** each office lists the services it offers. The app only shows offices that handle the service the user needs (e.g. PhilHealth ID release, Pag-IBIG MID registration).
- **Honest distance:** shows "X km away" and flags "Outside your province" when the nearest branch is far (e.g. Jolo → Zamboanga).
- **Office card:** agency, branch name, address, hours, contact number, services, "What to bring" (pulled from the guide), **"Get directions"** (opens Google Maps / the default maps app), "Report wrong info".
- **Two views: List and Map** (toggle at the top). The list is sorted by distance; the map shows the same offices as pins (see M).
- Office data is entered and verified by the Super Admin from **official agency branch directories**, each with a "last verified" date.

**M. Office map (exact location)**
- An interactive map with a **pin for each office**, plus the user's own position (only if they allowed location). Pins are colored by agency.
- Tap a pin to see a mini office card (name, distance, open/closed now, "View details", "Get directions").
- The office detail page has a **map zoomed in on that office's exact pin**.
- **Landmark directions** for every office, e.g. "2nd floor, beside the public market, across from the church". In many towns these matter more than the street address.
- Optional details: floor or unit, building name, and a **photo of the building front** so users recognize it when they arrive.
- **Pins are placed and checked by the Super Admin** (drag the pin on a map in the offices editor), not taken from automatic address lookup, which is often wrong in the provinces.
- "Pin is in the wrong place" goes into the same "Report wrong info" flow.
- **Free stack:** OpenStreetMap-based map (see §4.1). No paid Maps API.
- Offline: the map needs internet; offline users still see the address, landmark and photo of saved offices (see O).

**N. Holiday and office-closure calendar**
- National regular and special non-working holidays, entered by the Super Admin from the official proclamations each year.
- **Agency-specific closures** (e.g. a branch closed for system maintenance), entered by the Super Admin.
- The **"Open now / Closed today" badge** on offices takes holidays and closures into account.
- **Warning before a trip:** if a tracked document's appointment or pickup date falls on a holiday or closure, the user gets a heads-up notification.
- A simple calendar screen showing upcoming holidays and closures for the user's area.

**O. Saved offices (offline)**
- A user can **save** an office (bookmark), e.g. "My PhilHealth branch".
- Saved offices are **cached on the device**: address, landmark, hours, contact number, services and building photo all work offline.
- Saved offices show up on Home and in the related guides for quick access.

**J. Family members**
- A user can add family members (e.g. a parent, a child, a lolo or lola) and track documents **for them** under the same account.
- Each tracked document and reminder shows whose document it is.

**K. Authorization letter generator**
- For when someone else will claim a document for you. The user picks the document and fills in the names, ID type and date.
- The app produces a ready-to-print letter (PDF / print view) in English or Tagalog, with a reminder to bring both people's valid IDs.
- Nothing is stored except what the user chooses to save.

**L. Total cost and time estimate**
- The "What do I need?" helper shows an estimate for the whole goal: total fees (₱), expected processing time, and number of office visits.
- Clearly labeled as an *estimate*, based on the guides' "last verified" data.

**H. Must-haves I'm adding** (things a real government-facing app needs)
1. **Data Privacy Act (RA 10173) compliance:** privacy notice, consent checkbox at sign-up, "download my data" and "delete my account".
2. **Anti-scam / anti-fixer notice:** guides warn users about fixers and fake sites and show only official links. This also fits your cybersecurity angle.
3. **Accessibility for seniors:** large-text mode, high contrast, big tap targets, simple words.
4. **Bilingual UI:** English + Tagalog from day one. Built with i18n so Tausug or Bisaya can be added later.
5. **Audit log:** every Super Admin change to guides, offices and holidays is logged (who, what, when), plus sign-ins and account deletions.
6. **Rate limiting + abuse protection** on sign-up, login, password reset and AI chat.
7. **"Last verified" dates on every guide**, plus a "Report outdated info" button.
8. **Notification settings:** the user picks which notifications they get (reminders, expiry, holidays and closures) and can mute all of them.
9. **Terms of Use + Help screen:** simple terms (not an official government app, guides are for information only, users must confirm on official sites), an FAQ, and "Contact / send feedback".
10. **Low-data mode:** compressed images, building photos load only when tapped, map off by default (list first). Mobile data is expensive and signal is weak in many areas.
11. **Error and crash monitoring:** Sentry free tier on the app and the API (with personal data scrubbed), so bugs are found before users report them.
12. **Guided tour with Doki** (same approach as TeachWise and Padala):
    - **First-launch onboarding:** 3 slides with Doki ("All your papers, one app" → "Know exactly what you need" → "Track it. Claim it."), Skip on every slide, shown once.
    - **Spotlight tour on Home:** the screen dims, one area lights up with a gold ring, and Doki explains it in one sentence. 4 steps: services grid → "For you today" card → Ask Doki button → My Docs. Step counter, Next, Skip.
    - **Short first-visit tips (2–3 steps)** on the Office Finder, a guide page and My Docs.
    - Progress is saved per user, so it never repeats. A "Replay guide" button sits in the Home header and in Help.
    - Works with large-text mode and screen readers (each tip is a labelled dialog); respects "reduce motion".

### 3.2 Later (v2+ — do NOT build yet)
- **Barangay request system** (moved out of v1 on 2026-10-30): residents request barangay documents online, get a request number + QR claim stub and a live status; barangay staff process a queue, release by QR after an ID check, post announcements and closures; barangays apply to join and the Super Admin approves them. Roles: Barangay Staff and Barangay Admin. Build only when a real barangay wants it.
- Offline map tiles (downloadable map areas)
- In-app turn-by-turn navigation (v1 hands off to Google Maps for directions)
- SMS notifications (for people without smartphones)
- Tausug, Bisaya, Ilocano translations
- Guides for local offices (municipal civil registrar, business permits)
- iOS build
- Analytics dashboard for the municipality

### 3.3 Explicitly NOT doing
- Processing or submitting any document on the user's behalf
- Storing government portal passwords
- Storing full government ID numbers (only the last 4 digits if needed)
- Storing users' exact GPS coordinates or location history
- Scraping government websites

---

## 4. Frontend plan

### 4.1 Tech choice
**Expo (React Native) + Expo Router + react-native-web**, so **one codebase produces the Android app and the website**.
- TypeScript
- Styling: **NativeWind** (Tailwind classes for React Native)
- State/data: **TanStack Query** for server data, **Zustand** for small app state
- Forms: React Hook Form + Zod (validation shared with the backend)
- i18n: i18next
- Offline cache: TanStack Query persistence + AsyncStorage / MMKV
- Push notifications: Expo Notifications
- Location: `expo-location` (one-time "when in use" permission; on web, the browser Geolocation API through the same module)
- Directions: deep link to Google Maps / the default maps app (no paid Maps API)
- **Maps: MapLibre + OpenStreetMap data**, wrapped in one shared `<OfficeMap>` component:
  - Web: `maplibre-gl` (via `react-map-gl`)
  - Android: `@maplibre/maplibre-react-native` (needs an Expo development build, not Expo Go)
  - Same map style and the same pin/marker design on both platforms
  - Map tiles from a free OpenStreetMap-based provider. The public openstreetmap.org tile servers aren't meant for apps, so the tile provider is picked at deployment (§12 Phase 9). Show the required "© OpenStreetMap contributors" credit.
  - Pin clustering when many offices are close together (Metro Manila)
- Authorization letter: print view on web + `expo-print` for PDF on Android
- Mascot animation: **Rive** (`rive-react-native` + `@rive-app/react-canvas` on web), see §6

### 4.2 Design direction
> **🔒 LOCKED on 2026-10-30.** The reference is the prototype canvas "Dokyu — App Prototype": *Resident app — clickable* (Home, Guides, Guide detail, Office Finder map, Barangay request in 3 steps, Claim ticket with QR + status timeline, My Docs with family filter and expiry alert, Ask Doki, Account), *Home + guided tour*, *Onboarding*, *Sign in* and the *Staff Counter board*. Since v1.6 the barangay request, claim ticket and Staff Counter board screens are kept for "Later" (the TicketCard and StatusTimeline components stay in the design system). The older teal and dark explorations were removed. Design changes after this point go to §3.2 "Later" unless they fix a bug or an accessibility issue. Tokens live in code at `packages/shared/src/tokens.ts`.

- **Chosen direction: "Bayan Blue"** (D on the prototype canvas). Familiar to Filipinos because it follows the *style* of public-service apps like eGovPH: white background, royal blue, warm gold and red accents, friendly illustrations, an icon grid, a ticket banner, and a bottom bar with a raised center button.
- **Originality rules (to avoid copying eGovPH or looking official):**
  - Never use eGovPH's name, logo, wording, screen layouts or illustrations; Dokyu has its own wordmark ("dokyu" with a gold "y"), its own copy and its own screens.
  - **No Philippine flag elements** anywhere (no sun with rays, no three stars, no flag): RA 8491 prohibits flag elements in commercial designs.
  - **No real agency seals or logos**: agencies show colored initials in rounded-square tiles.
  - Rounded-square icon tiles (not circles); the center button is **Doki** (not a QR button).
  - Illustrations are **Sulu-rooted** (vinta sails, stilt houses on the waterfront, barangay life), drawn in Dokyu's palette.
  - "Not affiliated with any government agency" appears on sign-in, Home and About; store listing names official .gov.ph sources (Google Play's rules for apps that communicate government information).
- **Default theme:** light mode (dark mode later).
- **Palette:**
  - Primary: Dokyu blue `#2042C4`, dark `#13287A`, soft `#ECF0FF`
  - Gold `#E0A800` (wordmark "y", "New" tags, highlights), Red `#D93A4A` (alerts, "Ready" tags, Doki's folder tab)
  - Success `#15803D`, Warning `#B45309`, Danger `#B91C1C`
  - Text `#172033`, muted `#5B6478`, borders `#E6EAF4`, background `#FFFFFF`
- **Type:** Poppins (all UI). Minimum body size 14–16px; large-text mode at 20px.
- **Shapes:** 18–22px rounded cards, rounded-square icon tiles (60px, 18px radius), soft blue-tinted shadows, generous spacing.
- **Doki:** a living document: blue folder body with thickness, red tab, white paper with a folded corner and checklist, pink cheeks, gold lanyard + ID card, little arms and legs. Built in code (SVG parts, not Rive), soft almost-3D shading. Poses: idle, walking, pointing, waving, celebrating (talking and worried still to add). He walks across the screen and points at buttons during the tour.
- **Motion:** quick, purposeful transitions (150–250 ms); status changes animate; the mascot carries the personality so the UI can stay clean.
- **Status colors are consistent everywhere:** gray = not started, blue = in progress, yellow = ready, green = done, red = rejected or expired.
- **Responsive layout:** on mobile, a bottom tab bar. On desktop web, a left sidebar + wider content.

### 4.3 Screen list

**User app (mobile + web)**
1. Splash (with "Not an official government app" line)
2. Onboarding (mascot-led, 3–4 steps: language, area, goals, notifications permission)
3. Login / Sign up / Verify email / Forgot password
4. **Home:** mascot greeting, "For you today" (next appointment, things to bring), upcoming reminders, quick actions, popular guides
5. **Guides:** search + categories → Guide detail (requirements with exact details, "Do at home" / "At the office" steps, official link) → "Before you go" checklist
6. **What do I need?:** pick goal → ordered checklist + cost/time estimate → "Track all"
7. **My Documents:** tracker list (filter by person) → Tracker detail (checklist, dates, reference number, "Find nearest office", "Make authorization letter")
7a. **Office Finder:** choose agency/service → location permission or manual area → **List / Map toggle** (list sorted by distance; map with agency-colored pins and mini cards) → Office detail (zoomed map pin, landmark directions, building photo, open/closed today, hours, services, what to bring, directions, save, report wrong info)
7d. **Saved offices:** bookmarked offices (work offline)
7e. **Holiday and closures calendar:** upcoming holidays and closures for the user's area
7b. **Family members:** list → add/edit a member
7c. **Authorization letter:** form → preview → print/save PDF
9. **Ask (AI guide):** full-screen chat with the animated mascot
10. Notifications
11. Profile and settings (language, text size, privacy, download/delete data, about, disclaimer)

**Super Admin (web)**
22. National guides editor (create/edit guides, goals, "last verified")
22a. Offices editor (agency branches, **drag-to-place map pin**, landmark, floor, building photo, hours, services, "last verified"; CSV import)
22b. Holidays and agency closures editor
23. Outdated-info reports inbox
24. Audit log viewer

### 4.4 Frontend folder structure
```
dokyu/
  apps/
    mobile-web/              # Expo app (Android + Web)
      app/                   # Expo Router routes
        (auth)/              # login, signup, verify
        (resident)/          # tabs: home, guides, ask, docs, account (folder name kept from Phase 0)
        (admin)/             # super admin
      components/
        ui/                  # Button, Card, Badge, Input, StatusTimeline...
        mascot/              # Rive mascot wrapper + controller
      features/              # guides, tracker, offices, chat, auth
      lib/                   # api client, i18n, storage, notifications
      locales/               # en.json, tl.json
      assets/                # fonts, .riv files, icons
  packages/
    shared/                  # Zod schemas, types, constants (used by app + API)
  server/                    # backend (see §5)
```

---

## 5. Backend plan

### 5.1 Tech choice
- **Node.js + Express + TypeScript** (matches Padala, so you already know it)
- **PostgreSQL** database, **Prisma** ORM
- Auth: our own JWT (short-lived access token + rotating refresh token), passwords hashed with **argon2**
- Validation: **Zod** (shared package)
- File storage (office building photos, mascot assets): S3-compatible storage (e.g. Supabase Storage or Cloudflare R2 free tier). Decide at deployment.
- Push: Expo Push API
- Email: Resend / Brevo free tier (verification, password reset)
- Jobs/reminders: a simple scheduled job runner (node-cron) for expiry and appointment reminders
- AI: provider-agnostic service layer (see §6.4)
- Local development: Docker Compose for Postgres

### 5.2 Data model (first draft)

```
User            id, email, passwordHash, fullName, phone?, language, textSize,
                role (USER|SUPER_ADMIN),
                province?, municipality?            # general area only, never GPS
                emailVerifiedAt, consentAt, createdAt, deletedAt?

DocumentGuide   id, slug, category, title_en, title_tl, summary_en, summary_tl,
                agency, officialUrl, fees (json), processingTime,
                requirements (json: item, quantity, original/photocopy, photo size/background, notes),
                steps (json: text, where = HOME|OFFICE, link?), mistakes (json),
                validityMonths?, lastVerifiedAt, published

Goal            id, slug, title_en, title_tl, description
GoalStep        id, goalId, guideId, order, reason_en, reason_tl

FamilyMember    id, userId, fullName, relationship, birthYear?, createdAt

Agency          id, code (PAGIBIG|PHILHEALTH|PSA|NBI|SSS|BIR|DFA|LTO|PHILSYS|PNP...),
                name, officialUrl, branchDirectoryUrl
Office          id, agencyId, branchName, address, province, municipality,
                lat, lng, landmark, buildingName?, floor?, buildingPhotoUrl?,
                hours (json), contactNumber?, notes?,
                pinVerifiedAt, lastVerifiedAt, sourceUrl, active
SavedOffice     id, userId, officeId, label?, createdAt
Holiday         id, date, name, type (REGULAR|SPECIAL_NON_WORKING|SPECIAL_WORKING),
                scope (NATIONAL|PROVINCE|MUNICIPALITY), province?, municipality?, sourceUrl
Closure         id, officeId, startDate, endDate, reason, createdById
OfficeService   id, officeId, guideId                 # which documents/services this branch handles
OfficeReport    id, officeId, userId?, message, status, createdAt

AuthLetter      id, userId, guideId?, principalName, representativeName,
                details (json), createdAt              # only if the user chooses to save it

TrackedDocument id, userId, familyMemberId?, guideId?, customTitle?, status, referenceNo?,
                appointmentAt?, appointmentPlace?, releasedAt?, expiresAt?, notes
TrackedChecklistItem  id, trackedDocumentId, label, done

Notification    id, userId, type, title, body, data (json), readAt?
Reminder        id, userId, trackedDocumentId, remindAt, type, sentAt?
OutdatedReport  id, guideId, userId?, message, status, createdAt
AuditLog        id, actorId, action, entity, entityId, meta (json), ip, createdAt
ChatSession     id, userId?, createdAt
ChatMessage     id, sessionId, role, content, createdAt
PushToken       id, userId, token, platform
```
The Phase 0 schema also has Barangay, BrgyDocumentType, BrgyRequest, RequestEvent and Announcement tables for the barangay system. They stay unused until that feature comes back from §3.2 "Later"; Phase 2 removes the STAFF and BRGY_ADMIN roles.

### 5.3 API (REST, versioned `/api/v1`)

**Auth:** `POST /auth/signup`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/verify-email`, `/auth/forgot`, `/auth/reset`

**Guides (public):** `GET /guides`, `GET /guides/:slug`, `GET /goals`, `GET /goals/:slug`, `POST /guides/:id/report-outdated`

**Offices (public):** `GET /agencies`, `GET /offices?guide=&lat=&lng=` *or* `?province=&municipality=` (returns offices sorted by distance; lat/lng are used for the calculation only and never logged or stored), `GET /offices/:id` (incl. open/closed today), `GET /offices/map?bbox=&guide=` (pins inside the visible map area), `POST /offices/:id/report`

**Saved offices (user):** `GET /me/saved-offices`, `POST /me/saved-offices`, `DELETE /me/saved-offices/:id`

**Calendar (public):** `GET /holidays?from=&to=&province=&municipality=`, `GET /closures?officeId=`

**Calendar (super):** CRUD `/super/holidays`, CRUD `/super/closures`

**Family + letters (user):** CRUD `/me/family`, `POST /me/auth-letters` (generate; save is optional), `GET /me/auth-letters`

**Goal estimate:** `GET /goals/:slug/estimate` → total fees, processing time, visits

**Tracker (user):** `GET/POST /me/documents`, `GET/PATCH/DELETE /me/documents/:id`, `PATCH /me/documents/:id/checklist/:itemId`

**Super admin:** CRUD `/super/guides`, CRUD `/super/goals`, CRUD `/super/offices`, `GET /super/reports-outdated`, `GET /super/audit`

**Account:** `GET/PATCH /me`, `GET /me/export`, `DELETE /me`, `POST /me/push-token`, `GET /me/notifications`

**AI:** `POST /chat` (streamed response)

### 5.4 Security plan (your strongest selling point — make it visible)
- argon2 password hashing; JWT access tokens of 15 min + rotating refresh tokens stored hashed
- **Role-based access control on every route**, plus *ownership checks*: a user can only read and change their own tracker, family members, saved offices and letters. Write tests for this.
- Zod validation on every input; Prisma (parameterized queries) to prevent SQL injection
- Rate limiting (login, signup, password reset, chat); account lockout after repeated failed logins
- Helmet security headers, strict CORS, HTTPS only
- Data minimization: no full ID numbers; soft-delete then hard-delete on account deletion
- **Location privacy:** GPS only with "when in use" permission and only on the user's action; coordinates are sent for the distance calculation and **excluded from logs** (log-redaction rule for `lat`/`lng`); only province/municipality is ever saved
- Distance calculated server-side with the Haversine formula (PostGIS later if needed)
- Audit log for every Super Admin change, sign-in and account deletion
- Secrets live in env variables only, never in git; `.env.example` committed
- AI guardrails (see §6.5)
- A `SECURITY.md` in the repo describing all of the above — recruiters will read it

---

## 6. The AI guide (animated mascot)

### 6.1 Character
- A friendly mascot made for Dokyu (different from Professor Wise, so each app has its own identity).
- **Name: TBD.** Ideas: *Doki*, *Kuya Doks*, *Papi (Papel)*, *Asi*. Possible look: a cheerful folder/document character with a small ID lanyard.
- Personality: patient, kind, a bit playful, speaks simple Taglish, never talks down to elders.

### 6.2 How it "actually moves" — Rive
Use **Rive** (rive.app), not a GIF or a looping video. Rive makes a real vector character with a **state machine**, so the app controls the animation live:

| State | When it plays |
|---|---|
| `idle` | Default: breathing, blinking, small sways |
| `wave` | Greeting on Home / onboarding |
| `listening` | User is typing |
| `thinking` | Waiting for the AI's reply |
| `talking` | Reply is streaming in (mouth moves while text appears) |
| `happy` / `celebrate` | Request approved, document received, checklist complete |
| `concerned` | Errors, rejected request, expired document |
| `pointing` | Highlighting a button during onboarding tours |
| `sleep` | After long inactivity (fun detail) |

- Inputs: booleans `isTalking`, `isThinking`, `isListening`; triggers `wave`, `celebrate`, `concerned`.
- **Eyes follow the cursor/finger** on web and on touch (a number input for look direction). This is what makes it feel alive.
- One `.riv` file works in both `rive-react-native` (Android) and `@rive-app/react-canvas` (web).
- Small file (usually under 200 KB) and smooth at 60 fps.
- **Fallback:** a static image if Rive fails to load; respects the "reduce motion" accessibility setting.

**Making the character:** design it in the Rive editor (free plan). Build the body parts as separate pieces (head, eyes, mouth, arms) so they can be rigged with bones. Your existing mascot art style can be the reference.

### 6.3 Where the mascot appears
- Onboarding (guides the user through setup, points at things)
- Home header (small, waves, says a tip of the day)
- Ask tab (large, full chat companion)
- Floating mini-button on guide pages: "May tanong ka?" (Got a question?)
- Celebration moments (request ready, all requirements checked)

### 6.4 AI brain
- **Retrieval first (RAG-lite):** the backend finds the relevant guides in our own database and gives them to the AI as context, so answers come from **our verified guides**, not from the AI's memory.
- Provider-agnostic service (`ai.service.ts`) so the model can be swapped (Gemini free tier, Claude, OpenAI, etc.). **Pick the provider at build time based on cost** — the budget is ₱0 for now.
- Streaming responses (drives the `talking` animation).
- Answers in the user's language (Tagalog / English / Taglish).
- Can suggest actions with buttons: "Open NBI guide", "Track this document", "Find the nearest office".
- **Offline / no-quota fallback:** a built-in FAQ matcher answers common questions without the AI.

### 6.5 AI guardrails
- Only answers questions about documents, the app, and related government processes; politely declines off-topic requests.
- Always says "Please confirm on the official site" for fees and requirements, and shows the guide's "last verified" date.
- Never asks for passwords, OTPs or full ID numbers, and **warns the user** if they paste one.
- Never pretends to be a government employee or to process applications.
- Prompt-injection hardening: guides are treated as data; system rules are fixed server-side.
- Per-user/per-IP daily message limit.

---

## 7. Notifications

| Event | Who | Channel |
|---|---|---|
| Appointment tomorrow | User | Push |
| Document expiring in 30 / 7 days | User | Push + in-app |
| Appointment/pickup falls on a holiday or closure | User | Push + in-app |
| Saved office has a new closure | User | In-app |

---

## 8. Content plan (guides + offices)
- The first 8 guides are researched and verified in **DOKYU_CONTENT.md** (last verified 2026-10-30), from official .gov.ph sources wherever available. Items still marked ⚠️ there are re-checked before launch.
- **Offices, first batch:** Sulu (Jolo), Zamboanga City, and Pasig / Metro Manila branches of Pag-IBIG, PhilHealth, PSA, NBI, SSS, BIR, DFA and PhilSys, taken from each agency's official branch directory. Expand by region later.
- **Every office pin is placed by hand** and marked "pin verified" (ideally confirmed by someone who has visited, or with street-level imagery), with a landmark note and, when possible, a building photo you took or have permission to use.
- **Holidays:** load each year's national holidays from the official proclamation; add local holidays (e.g. a city's founding day) for the first-batch areas.
- Store each guide's source link in the database.
- Re-verify every guide at least every 3 months (add a Super Admin reminder).

---

## 9. Testing plan
- Backend: unit tests (services) + integration tests (API routes) with Vitest + Supertest, against a test database.
- **Must-have security tests:** a user can't read or change another user's tracker, family members or saved offices; a user can't reach any `/super` route; refresh tokens can't be reused after rotation; locked accounts can't log in.
- Frontend: component tests for key UI (status timeline, forms); manual testing on a real Android phone + Chrome + a phone-size browser.
- Accessibility check: large-text mode, contrast, screen reader labels.

---

## 10. Portfolio and GitHub
- New public repo **Dokyu** on `mukraminbariwa5-create`.
- README: problem, features, screenshots/GIFs (mascot animation!), tech stack, architecture diagram, security section, disclaimer.
- `SECURITY.md`, `.env.example`, MIT license (author: Mukramin Bariwa Ansao).
- Seed data: the 8 verified guides, first-batch offices and holidays, plus a demo user (with a sample tracker and a family member) and a demo Super Admin, clearly labelled, so recruiters can try everything.

---

## 11. Decisions (closed 2026-10-30)
1. ~~Mascot~~ → **Doki**, blue folder with red tab (§4.2).
2. ~~Palette~~ → **Bayan Blue** (§4.2), locked.
3. AI provider → still decided in Phase 6 (based on free tiers then). Code goes through a provider-agnostic service.
4. ~~Guest AI chat~~ → guests get **5 messages/day**, logged-in users more.
5. ~~First barangay~~ → **changed 2026-10-30:** v1 is citizen-first; the barangay system is in §3.2 "Later". (Earlier idea: demo with Walled City, Jolo, then pitch to a Jolo barangay.)
6. ~~Office Finder areas~~ → **Sulu (Jolo), Zamboanga City, Pasig**, seeded from DOKYU_CONTENT.md §5.
7. ~~Name~~ → **Dokyu** kept. No PH trademark conflict in Classes 9/42/45. Handle "DokyuPH" (DOKYU_CONTENT.md §1).

---

## 12. Build phases (in order)

| Phase | What | Done when |
|---|---|---|
| **0. Setup** ✅ *done 2026-10-30* | Monorepo, Expo app, Express server, Postgres (Docker), Prisma, shared package, lint/format, GitHub repo | App and API both run locally; CI runs lint |
| **1. Design system** ✅ *done 2026-10-30* | Colors, fonts, UI components, layouts (mobile tabs + web sidebar), i18n, large-text mode | A component showcase screen looks right on phone and desktop |
| **2. Auth + onboarding** ✅ *done 2026-10-30* | Sign up/login/verify/reset, User + Super Admin roles, consent (RA 10173), lockout and rate limits, onboarding screens (language, area, goals; static mascot placeholder), demo accounts | A user and the Super Admin can log in; access-control and ownership tests pass |
| **3. Guides + goals + offices** ✅ *done 2026-10-31 (editor and saved offices moved to Later; map is Leaflet/OSM)* | Guide DB + seed 8 guides with **exact requirement details** and **"Do at home" / "At the office" steps**, **"Before you go" checklist**, search, detail, goal helper with cost/time estimate, offline cache, Super Admin guide editor, **Office Finder** (agencies, offices, services, location + manual area, distance sort, directions), **office map** (MapLibre on web + Android, pins, clustering, landmarks, building photos), **saved offices offline**, **holidays and closures** with open/closed badges, offices + holidays editors | A guest can browse guides offline, find the nearest office on the list and the map, and sees "Closed today" correctly on a holiday |
| **4. Tracker + reminders** ✅ *done 2026-10-31 on the device (server sync and letter generator Later)* | My Documents, **family members**, checklists, reminders, expiry jobs, push notifications, **authorization letter generator** | Reminders fire on a real phone; a letter prints correctly |
| ~~**5. Barangay system**~~ | **Moved to §3.2 "Later" on 2026-10-30.** Skipped in v1; the number is kept so phase references stay the same | — |
| **6. AI guide** 🟡 *offline Ask Doki done 2026-10-31; AI model later* | Chat API with retrieval, streaming, guardrails, FAQ fallback, chat UI | Answers come from our guides; guardrail tests pass |
| **7. Animated mascot** ✅ *done 2026-10-30/31 in code, not Rive* | Rive character + state machine, wired to chat/onboarding/celebrations, reduce-motion fallback, **guided tour** (onboarding slides, Home spotlight tour, first-visit tips, Replay guide) | The mascot reacts correctly in every state on Android + web |
| **8. Polish + security pass** 🟡 *export/delete, About/Terms/Help, click-test done 2026-10-31* | Privacy features (export/delete), rate limits, accessibility, error/empty states, performance, README, SECURITY.md, screenshots | Ready to deploy |
| **9. Deployment** *(later)* | Hosting, database, storage, domain, Play Store build | Planned separately |

**Rule:** finish one phase before starting the next. New ideas go into §3.2 "Later", not into the current phase.

**Milestone — "Demo-ready" (after Phase 4):** the app is already showable to recruiters at this point (guides with exact requirements, office finder + map, tracker with reminders). The AI guide and animated mascot (Phases 6–7) come next. If time runs short, you can still put Dokyu on your portfolio at this milestone.

**Scope freeze:** as of v1.6 the v1 feature list is **final**. Anything new goes to §3.2 "Later" until v1 is deployed.

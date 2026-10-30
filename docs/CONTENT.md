# Dokyu — Content Research (v1.1, verified pass)

> Research for the first 8 document guides, the first-batch offices, and the name check.
> Researched: **30 Oct 2026**. Author of the app: Mukramin Bariwa Ansao (fairy).
> Companion to `DOKYU_PLAN.md`. This file becomes the seed data for Phase 3 (Guides + Offices).

## How to read this file

- **✅ Official** = confirmed on a government site (.gov.ph) or an official government document.
- **⚠️ Verify** = found only on independent guide sites (often consistent with each other, but not confirmed on the agency's own page). **Must be checked on the official link before going live.**
- Every guide in the app must show **"Last verified: [date]"** and the **official link**. Fees and rules change often, so re-check every 3 months (see plan §8).
- Many top Google results for these documents are **unofficial look-alike guide sites** (e.g. "nbiclear.ph", "onlinepoliceclearanceph.ph"). Dokyu should only ever link to the official portals listed in §3. This is a strong anti-scam talking point for the app.

---

## 1. Name check: "Dokyu"

**Finding:** "Dokyu" is **already used** by a university student project: a digital keepsake platform (family photo and memory sharing) made for the CS3216 module at the National University of Singapore, at **dokyu.app**. Its page says the name means "document" in Japanese.

**What it means for us:**
- **Different country, different category (memories vs government papers), and a student project**, so the risk of a real conflict is low.
- But **dokyu.app is taken**, and searching "Dokyu" will show that project too.
- Similar-sounding names exist (Dokku, DOKKA, Dokky, Dokkup, Dooku), all in other fields.
- **Trademarks:** the trademark databases (IPOPHL's ASEAN TMview search, WIPO Global Brand Database) could not be opened from this workspace. **Do this 2-minute check yourself:**
  - WIPO Global Brand Database → https://branddb.wipo.int → search "DOKYU"
  - ASEAN TMview (used by IPOPHL) → https://www.asean-tmview.org → search "DOKYU", office: Philippines

**Trademark search result (WIPO Brand DB, done by fairy, 30 Oct 2026). Philippine marks containing "DOKYU":**
- DOKYU REAL ESTATE SOLUTIONS, INC: Class 36 (real estate). Pending, filed 24 Jul 2025 (PH4202500520140).
- DOKYU ANG BAGONG MATA NG PINOY DOCUMENTARIES (TV5 Network): Class 41 (TV / entertainment). Registered 7 Sep 2024 (PH4202400511656).
- DOKYU ... & LOGO (ABC Development Corp.): Class 41. Expired 14 Jul 2021.
- **None are in Class 9 (apps/software), 42 (SaaS) or 45 (government/legal services)**, the classes Dokyu would fall under. Legal risk is low for a free portfolio app. Consult IPOPHL before any commercial launch.
- The ASEAN TMview site shows a certificate error. Don't click through it; the WIPO results already include Philippine marks.

**Recommendation:** keep **Dokyu** as the app name, but use a distinct handle everywhere else, e.g. **DokyuPH** (repo `Dokyu`, Play Store "Dokyu: Papers Made Easy", domain idea `dokyu.ph` or `getdokyu` later). If the trademark search shows a Philippine "DOKYU" mark, rename before Phase 0.

Sources: [NUS STePS — Dokyu project page](https://uvents.nus.edu.sg/event/25th-steps/module/CS3216/project/1)

---

## 2. Cross-cutting rule: First Time Jobseekers (RA 11261)

Many documents are **free once** for a first-time jobseeker who brings a **Barangay Certification** that they are a resident and a first-time jobseeker. Confirmed on official BIR materials (TIN) ✅ and widely reported for NBI, Police clearance and PSA ⚠️.
→ Dokyu feature idea (already fits the plan): the **"First Job" goal checklist** starts with *"Get a First-Time Jobseeker Barangay Certification"*, and Dokyu's barangay module can issue the request.

Sources: [BIR Form 1904 (Oct 2025)](https://bir-cdn.bir.gov.ph/BIR/pdf/1904%20October%202025%20ENCS%20Final.pdf) · [BIR Citizen's Charter — TIN for EO 98 / first-time jobseeker](https://www.bir.gov.ph/BIRCC-RDO-External-Service-04)

---

## 3. Official links only (anti-fixer list)

| Document | Official site | Notes |
|---|---|---|
| PSA certificates | appointment.psa.gov.ph · psahelpline.ph · psaserbilis.com.ph | PSA lists Serbilis and Helpline as its online channels ✅ |
| National ID (PhilSys) | philsys.gov.ph · national-id.gov.ph (digital ID) | Hotline 1388, info@philsys.gov.ph ✅ |
| NBI Clearance | clearance.nbi.gov.ph | ✅ |
| Police Clearance | pnpclearance.ph | Official how-to PDF on that site ✅ |
| Passport | passport.gov.ph | "Appointments not made through passport.gov.ph are not legitimate" ✅ |
| TIN | orus.bir.gov.ph · bir.gov.ph | ✅ |
| Postal ID | phlpost.gov.ph | ⚠️ (official page not opened) |
| Barangay clearance | Your barangay hall / city or municipal website | Varies per barangay |

---

## 4. The 8 guides

### 4.1 PSA Birth Certificate
- **Category:** Civil registry · **Agency:** Philippine Statistics Authority (PSA)
- **What it's for:** proof of birth and identity; needed for the passport, PhilSys, school and first job.
- **Fees:**
  - At a PSA Civil Registry System (CRS) outlet: **₱155 per copy** ✅ (birth, marriage, death, authentication); CENOMAR **₱210** ✅
  - PSAHelpline (online, delivered nationwide): **₱365** per birth certificate, inclusive of service and courier fees ✅
  - PSA Serbilis (online): ₱330 first copy ⚠️ · PSA E-Certificate (digital): ₱290 ⚠️
- **Requirements (outlet):** confirmed appointment slip, valid ID whose name matches the appointment ✅; authorization letter + IDs if requesting for someone else ⚠️
- **Steps (outlet):**
  1. Book a **free** appointment at appointment.psa.gov.ph ✅ (minors can't book ✅)
  2. Arrive 30 minutes early with your valid ID ✅
  3. Fill in the request form, pay ₱155, receive the copy (same day if the record is in the database ⚠️)
- **Appointment rule (checked 30 Oct 2026):** booking is required for people **without** a National ID ✅ (PSA outlet slip, PIA). **National ID holders** have used a walk-in **Special Lane** for their own and immediate family's records since PSA's Oct 2024 advisory ✅. One legal site says a March 2026 advisory now requires appointments for National ID holders too, but that conflicts with other sources. **App wording:** "Book a free appointment. National ID holders may use the Special Lane; check your outlet."
- **Pasig outlet extra fee:** PSA slips say the Caloocan, Muntinlupa, **Pasig** and Valenzuela outlets add a city fee under their local revenue codes ✅. GCash and Maya accepted ✅.
- **Common mistakes:** name on ID doesn't match the appointment; paying a "booking fee" to third-party sites (booking is free ✅).
- **First-time jobseeker:** one free copy ⚠️

Sources: [PSA RSSO VII — fees notice](https://rsso07.psa.gov.ph/node/1684057236) · [Respicio — National ID Special Lane](https://www.respicio.ph/commentaries/can-you-walk-in-for-psa-certificate-requests-in-the-philippines) · [PIA — appointment rule](https://mirror.pia.gov.ph/news/2023/08/31/psa-urges-public-to-secure-appointment-before-visiting-crs-outlets) · [PSAHelpline](https://psahelpline.ph/) · [PSA online appointment](https://appointment.psa.gov.ph/) · [Respicio — PSA guide](https://www.respicio.ph/commentaries/how-to-get-a-psa-birth-certificate-copy-in-the-philippines) ⚠️

### 4.2 PhilSys National ID
- **Category:** Identity · **Agency:** PSA (PhilSys)
- **Fee:** **Free** registration and card for Filipinos, as mandated by RA 11055 ✅. Replacement of a lost card has a fee ⚠️.
- **Requirements:** one primary document (e.g. PSA birth certificate + one government ID, or passport, or UMID, or driver's license), or secondary documents if no primary ⚠️. Full official list: philsys.gov.ph/supporting-documents ✅
- **Steps:**
  1. Go to a PhilSys registration center. Some regions now need an **online appointment** first (Cebu since 23 Mar 2026 ✅ via Inquirer/CDN); others still take walk-ins. The app tells users to check philsys.gov.ph.
  2. Present your documents, fill in the form ✅
  3. Biometrics: photo, fingerprints, iris ✅
  4. Keep your **transaction slip (TRN)** ✅
  5. Get the **Digital National ID** at national-id.gov.ph or in the eGovPH app ✅
- **Scam warning:** anyone charging a fee for registration is illegal (PSA reminder) ✅ (via PIA)

Sources: [PIA — PhilSys registration free (RA 11055)](https://mirror.pia.gov.ph/news/2022/08/15/psa-siquijor-to-start-philsys-registration-in-schools) · [PSA RSSO IV-A Citizen's Charter](https://rsso04a.psa.gov.ph/sites/default/files/RSSO/Citizens-Charter_PhilSys-Registration-Process.pdf) · [PSA BARMM — Sulu infographic](https://rssobarmm.psa.gov.ph/system/files/infographics/March%202025%20IG%20%281%29.pdf)

### 4.3 NBI Clearance
- **Category:** Clearances · **Agency:** National Bureau of Investigation
- **Fee:** **₱130** clearance fee ✅ + **₱25** e-payment fee → **₱155** total ✅ (₱130 per DOJ Dept. Circular 31-2019, cited by legal guides). Express processing ₱225 ⚠️.
- **Requirements:** online registration and appointment; usually **two valid government IDs** ⚠️ (company IDs and barangay clearance are not accepted ⚠️)
- **Steps:**
  1. Register at **clearance.nbi.gov.ph** ✅
  2. Fill in your details, choose branch and date ⚠️
  3. Pay online or over the counter; save the reference number ✅
  4. Visit the branch for photo and fingerprints ✅
  5. Release: same day if there's no "hit"; longer if there is ⚠️
- **Validity:** 1 year from issuance ✅ (NBI Memo 2021-01, cited by legal guides) · walk-ins not accepted ✅ · check authenticity at qcheck.nbi.gov.ph
- **Tip:** you can't reschedule after paying ⚠️
- **First-time jobseeker:** free with a Barangay Certification ⚠️

Sources: [Lawyer-Philippines — NBI fees and memo citations](https://www.lawyer-philippines.com/articles/nbi-clearance-renewal-process-philippines) · [Philippine Embassy Tokyo — NBI fee ₱130](https://tokyo.philembassy.net/consular-section/services/notarial-services/nbi-clearance/) · [DFA Copenhagen — NBI requirements](https://copenhagenpe.dfa.gov.ph/images/Website_revision/requirements/Req_NBI.pdf) · [Moneymax — NBI steps](https://www.moneymax.ph/government-services/blog/nbi-clearance-online) ⚠️

### 4.4 Police Clearance (National Police Clearance)
- **Category:** Clearances · **Agency:** Philippine National Police (PNP)
- **Fee:** **₱150** + payment-channel fee of ₱10–₱30 ✅ (an LGU website and several guides agree). Pay by GCash, Maya, 7-Eleven, Bayad Center, LandBank or BancNet.
- **Requirements:** online account and appointment; valid government ID(s); payment reference ⚠️
- **Steps (official how-to PDF):**
  1. Go to **pnpclearance.ph** → Register (new) or Login ✅
  2. Fill in the registration form, submit and sign in ✅
  3. Book the station, date and time ⚠️
  4. Pay the fee and keep the reference number ⚠️
  5. Visit the station: photo, fingerprints, signature; same-day release if no hit ⚠️
- **Validity:** **6 months** ✅ (San Nicolas, Pangasinan LGU advisory) · each clearance has a QR code for verification ✅ · NPCS helpdesk: npcs.helpdesk@pnp.gov.ph ⚠️
- **First-time jobseeker:** may be free with a Barangay Certification; confirm with the station ⚠️

Sources: [San Nicolas, Pangasinan LGU — NPC validity](https://sannicolaspangasinan.gov.ph/sannicolas2/?p=4317) · [PNP — How to apply (official PDF)](https://pnpclearance.ph/landing/AppPonsive/doc/how_to_apply_v2.pdf) · [Moneymax — Police clearance](https://www.moneymax.ph/government-services/blog/police-clearance-online) ⚠️ · [Respicio — Police clearance](https://www.respicio.ph/commentaries/how-to-apply-for-police-clearance-in-the-philippines) ⚠️

### 4.5 Barangay Clearance
- **Category:** Local / Barangay · **Issuer:** your barangay
- **Important:** there's **no single nationwide checklist or fee**. Each barangay sets its own through its ordinance and Citizen's Charter. The Local Government Code (RA 7160, Sec. 152) allows the barangay to charge a *reasonable* fee ✅ (via legal summaries ⚠️).
- **Commonly required:** valid ID, proof of residency, current **Community Tax Certificate (cedula)**, request form, fee ⚠️
- **For business clearances:** the barangay must act within **7 working days** (LGC Sec. 152(c)) ⚠️
- **In Dokyu:** this guide is **barangay-specific**. Each barangay admin fills in their own requirements, fee and hours (already in the plan: `BrgyDocumentType`). The national guide only explains what a barangay clearance is and links to the user's barangay.

Sources: [Respicio — RA 11032 and barangay fees](https://www.respicio.ph/commentaries/can-a-barangay-charge-extra-fees-for-barangay-clearance) · [Respicio — Barangay clearance requirements](https://www.respicio.ph/commentaries/requirements-for-barangay-clearance-and-certificates-1) ⚠️ · [Respicio — Barangay clearance fees](https://www.respicio.ph/commentaries/barangay-clearance-fees-in-the-philippines-what-charges-are-legal) ⚠️

### 4.6 Postal ID
- **Category:** Identity · **Agency:** PHLPost
- **Fee:** **₱550 regular** (includes tax and delivery) · **₱650 rush** ✅ (phlpost.gov.ph)
- **Requirements:** application form, proof of identity, proof of address ✅ (PHLPost via Daily Tribune, Jun 2026). An existing government ID is **not** required; a PSA birth certificate works as proof of identity ✅ (PHLPost via GMA). Personal appearance required.
- **Steps:** prepare the form → submit at a post office → pay → photo and biometrics → card delivered (rush: faster at selected branches) ⚠️
- **Validity:** 3 years ✅ (phlpost.gov.ph)
- **Status:** applications resumed **15 Oct 2024** after a 2023 pause ✅. Since April 2026, **same-day release** is offered at the SM City Manila and Robinsons Otis branches (cards out at 4 PM, Mon–Fri) ✅. Accepted as a primary ID for passport applications ✅.

Sources: [PHLPost — fee notice](https://phlpost.gov.ph/?p=14034) · [PHLPost — Postal ID as primary ID](https://phlpost.gov.ph/?p=13478) · [GMA — valid ID not required](https://www.gmanetwork.com/news/topstories/nation/995871/valid-id-not-required-to-apply-for-a-postal-id-phlpost/story/) · [PhilSTAR Life — same-day release](https://philstarlife.com/news-and-views/434214-same-day-release-of-postal-ids-now-offered) · [Wikipedia — resumption date](https://en.wikipedia.org/wiki/PhilPost_Postal_ID)

### 4.7 TIN (Taxpayer Identification Number)
- **Category:** Work & benefits · **Agency:** Bureau of Internal Revenue (BIR)
- **Which form:**
  - **BIR Form 1904**: one-time taxpayers and people registering under EO 98 (getting a TIN to transact with government), including **first-time jobseekers** ✅
  - Form 1902: employees (usually filed by the employer) ⚠️ · Form 1901: self-employed ⚠️
- **Requirements (1904):** 2 original copies of BIR Form 1904 ✅, government ID ✅; if via a representative: SPA + both IDs ✅; **first-time jobseeker:** certified copy of the Barangay Certification ✅
- **Steps:**
  - **Online:** ORUS at **orus.bir.gov.ph** → create an account → "Get TIN for Filipino Citizen – E.O. 98 / One-Time Taxpayer" → fill in form 1904 ✅
  - **Walk-in:** RDO → queue number → submit requirements → TIN encoded (about 2 hours processing per the Citizen's Charter) ✅
- **Warning to show in the app:** "Possession of more than one TIN is criminally punishable" ✅
- **Fee:** none listed in the Citizen's Charter ⚠️ (confirm)

Sources: [BIR Citizen's Charter — TIN EO 98](https://www.bir.gov.ph/BIRCC-RDO-External-Service-04) · [BIR Form 1904 (Oct 2025)](https://bir-cdn.bir.gov.ph/BIR/pdf/1904%20October%202025%20ENCS%20Final.pdf) · [RMC 54-2024 ORUS job aid](https://www.reyestacandong.com/wp-content/uploads/2024/05/RMC-No.-54-2024_ORUS-User-Guide-or-Taxpayer-Job-Aid-for-EO-98.pdf)

### 4.8 Passport
- **Category:** Travel · **Agency:** Department of Foreign Affairs (DFA)
- **Fees:** **₱950 regular**, **₱1,200 expedited** ✅ + **₱50** payment-center convenience fee ✅ · lost or mutilated passport penalty ₱350 ✅
- **Processing time:** expedited takes **5 working days in NCR, 7 outside NCR** ✅
- **Appointments are FREE** and only legitimate via **passport.gov.ph** ✅. Buying slots from fixers is illegal ✅.
- **No appointment needed (priority lane):** OFWs with proof, senior citizens, PWDs, solo parents with valid ID ✅
- **Requirements (new adult):** confirmed appointment, personal appearance, application form, PSA birth certificate, valid ID ⚠️ (full list on the DFA requirements page)
- **Steps:** book at passport.gov.ph → pay the fee (prepaid) → print the appointment packet → appear at the consular office → claim at the same office ✅
- **For Sulu users:** the **DFA Consular Office in Zamboanga City** serves Sulu, Basilan and Tawi-Tawi ✅ (news report)

Sources: [DFA Consular — Passport FAQs](https://consular.dfa.gov.ph/passport-faq/) · [Passport.gov.ph](https://www.passport.gov.ph/) · [Passport.gov.ph FAQs (ePayment)](https://passport.gov.ph/faqs_2) · [Inquirer — DFA Zamboanga coverage](https://newsinfo.inquirer.net/1790894/dfa-opens-consular-office-in-pagadian-city/amp)

---

## 5. First-batch offices

Pins, landmarks and hours still need to be **placed and checked by hand** (plan §8). This is the starting list.

| Agency | Office | Address | Status |
|---|---|---|---|
| PSA + PhilSys | PSA Sulu Provincial Office & PhilSys Fixed Registration Center | 2nd Floor, Notre Dame Commercial Complex, Sanchez St., Walled City, Jolo, Sulu 7400 · (085) 341-8911 loc. 2461 · sulu@psa.gov.ph | ✅ Official |
| NBI | NBI Sulu Provincial Office | Exists, but **no public address online**, and clearances are booked through clearance.nbi.gov.ph. The app shows "Choose your branch when booking on clearance.nbi.gov.ph" and lists WEMRO Zamboanga as the confirmed fallback | ⚠️ Not published |
| NBI | NBI Western Mindanao Regional Office | Edificio Costal Building, Corcuera St., Zamboanga City | ✅ (PSA press release) |
| DFA | DFA Consular Office Zamboanga | Go-Velayo Bldg., Veterans Ave., Zamboanga City · (062) 991-4398 | ⚠️ Address from directories; confirm on DFA site |
| PSA | PSA Regional Office IX | Dagdag Building, San Jose Road, Baliwasan, Zamboanga City · (062) 957-4636 | ✅ (regional office; confirm if it has a CRS counter) |
| PhilHealth | PhilHealth Regional Office (BARMM), covers Sulu | Marawi City | ✅ Coverage · ⚠️ no Sulu office confirmed |
| PhilHealth | LHIO Pasig | Ground Floor, Iriz One Corporate Centre, 35 Meralco Ave, San Antonio Village, Pasig · 8 AM–5 PM, Mon–Fri | ✅ (2016 advisory; confirm still current) |
| PSA | PSA CRS Outlet Pasig City | Pasig City Hall, Caruncho Ave., Brgy. San Nicolas, Pasig City 1603 · (02) 8292-0910 · extra city fee applies | ✅ Official (PSA directory) |

**Official directories to load the rest from:**
- PhilHealth: https://www.philhealth.gov.ph/about_us/directory
- NBI branches: chosen inside clearance.nbi.gov.ph when booking
- Police stations: chosen inside pnpclearance.ph when booking
- PSA outlets: appointment.psa.gov.ph
- DFA consular offices: consular.dfa.gov.ph (consular office list and operating hours)
- PhilSys centers: philsys.gov.ph and the PSA provincial pages (e.g. PSA BARMM for Sulu)

Sources: [PSA — Metro Manila CRS outlets (Pasig)](https://rssomimaropa.psa.gov.ph/node/1684041229) · [PSA RSSO VII — provincial directory (PSA Sulu)](https://rsso07.psa.gov.ph/node/1684041209) · [PSA RSSO IX — NBI regional office](https://rsso09.psa.gov.ph/node/1684057778) · [PhilHealth — LHIO Pasig transfer](https://www.philhealth.gov.ph/advisories/2016/adv2016-0027.pdf) · [PhilHealth — Regional coverage (Annex E)](https://www.philhealth.gov.ph/circulars/2022/029/AnnexE_PhilHealthRegionalOfficesCoverageAreasandContactInformation.pdf) · [PSA — CRS Outlet Pasig advisory](https://psa.gov.ph/sites/default/files/psa-release/CRS_%20Public%20Advisory%20CRS%20Outlet%20Pasig%20City%20Closure%20on%2014-19April2023.pdf) · [FilipiKnow — DFA branches](https://filipiknow.net/dfa-branches) ⚠️

---

## 6. Verification pass (30 Oct 2026)

- Trademark check done (§1). No conflict in the app classes.
- NBI, PNP, Postal ID, PSA appointment rules and the Pasig outlet were rechecked against official or government-cited sources. Updated above.
- **Office hours:** government offices follow **8:00 AM–5:00 PM, Mon–Fri** unless posted otherwise. The app shows this as the default with a "Hours may vary" note until an office's own hours are confirmed.
- **Demo barangay data:** no barangay in Jolo or Pasig publishes its Citizen's Charter online. Under RA 11032 each barangay must post its exact fees and requirements at the hall, and charging anything not listed is a violation ✅. So the demo uses **"Barangay Demo (Walled City, Jolo)"**, clearly labelled as sample data, with this set:
  - Barangay Clearance: valid ID, proof of residency, cedula. Sample fee ₱50 · 1 day
  - Certificate of Residency: valid ID, proof of residency. Sample fee ₱30 · same day
  - Certificate of Indigency: valid ID, purpose. Free · same day
  - First-Time Jobseeker Certification (RA 11261): valid ID, proof of 6+ months residency, Oath of Undertaking. **Free** · same day
  - Real barangays replace these with their own Citizen's Charter values in the admin panel.
- **App rule added:** every barangay document type shows **"Fee per Citizen's Charter"** and a "Report an overcharge" link to the barangay's complaint desk (RA 11032).

---

## 7. Requirements re-check (30 Oct 2026, session 3)

Done to make every guide say exactly what to bring. The content now lives in `packages/shared/src/seed/guides.ts` (English + Tagalog) and is checked by `guideSchema`.

- **Links fixed:** Passport → `passport.gov.ph/appointment` (book) ✅ · National ID → `register.philsys.gov.ph` (Step 1 online registration, named by PSA) ⚠️ site not opened from the workspace · Postal ID → the PHLPost application form PDF (there is no online application) ✅ · PSA → online order (PSAHelpline) and outlet booking ✅. NBI, NPCS and ORUS already pointed to the real registration portals.
- **Photos:** none of the 8 national documents need you to bring a photo; NBI, PNP, DFA, PhilSys and PHLPost take it on site. Some barangays ask for 1x1/2x2: the guide says "ask first".
- **NBI / Police:** original IDs only, no photocopies; company IDs and barangay clearance not accepted (NBI). The official NPCS PDF asks for 1 valid ID; older guidance and many stations ask for 2, so the app says "bring 2 if you have them". ⚠️ (NBI ID rules from independent guides)
- **Passport:** PSA birth certificate and valid ID, **original + photocopy**; printed appointment packet; National ID, ePhilID and printed Digital National ID are on DFA's accepted list ✅ (consular.dfa.gov.ph).
- **Postal ID:** no other valid ID needed. A PSA birth certificate + proof of address (barangay certificate or bill) + form ✅ (PHLPost clarification, July 2026).
- **PSA outlets:** book an appointment even with a National ID (reports say the appointment system covers National ID holders since March 2026) ⚠️.
- **First-Time Jobseeker (RA 11261):** barangay certification + Oath of Undertaking signed at the hall, 6+ months residency, valid 1 year ✅.

Sources: [DFA — acceptable IDs](https://consular.dfa.gov.ph/reminders/10-passport) · [PNA via Journal — passport.gov.ph/appointment](https://journalnews.com.ph/?p=2025) · [PSA — register.philsys.gov.ph](https://psa.gov.ph/content/psa-data-reveals-common-identification-documents-used-public-attests-need-philid) · [CDN — Cebu online appointment](https://cebudailynews.inquirer.net/?p=709288) · [PHLPost — how to apply](https://phlpost.gov.ph/?p=124) · [Tribune — no valid ID needed](https://tribune.net.ph/2026/07/23/phlpost-no-valid-id-needed-to-get-a-postal-id) · [NPCS how to apply (PDF)](https://pnpclearance.ph/landing/AppPonsive/doc/how_to_apply_v2.pdf) · [Moneymax — NBI IDs](https://www.moneymax.ph/government-services/articles/nbi-clearance-online) ⚠️ · [Alburo Law — RA 11261 Sec. 8](https://www.alburolaw.com/what-is-the-first-time-jobseekers-assistance-act/)

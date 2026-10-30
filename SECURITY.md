# Security

Dokyu handles personal data of Filipino residents, so security is a core feature, not an afterthought.

## What is in place (Phase 0)
- **Input validation** with Zod on every query and route parameter; bad input gets `400`, never a crash.
- **Helmet** security headers, `x-powered-by` removed, **strict CORS** allow-list from `CORS_ORIGINS`.
- **Rate limiting** on all `/api` routes (120 requests/minute/IP); stricter limits on login, signup and chat come with those routes.
- **Request body limit** of 100 KB.
- **Log redaction:** `lat`, `lng`, QR tokens, passwords, cookies and the `Authorization` header are never written to logs.
- **Location privacy:** coordinates are used only to sort offices by distance (Haversine, server-side) and are never stored. Only province and municipality are saved.
- **Secrets** come from environment variables only and are validated at start-up; error messages name the missing variable, never its value. `.env` is git-ignored; `.env.example` is committed.
- **Errors** return a generic message; stack traces stay in server logs.
- **Parameterized queries** through Prisma (no string-built SQL).

## Accounts and sessions (Phase 2, covered by integration tests in `server/test/auth.test.ts`)
- **argon2id** password hashing with OWASP parameters; logins for unknown emails still run a hash so timing doesn't reveal which emails exist.
- **15-minute JWT access tokens** (HS256, issuer and audience checked, kept in memory only) and **30-day rotating refresh tokens** stored only as SHA-256 hashes.
- **Refresh-token reuse detection:** every refresh replaces the token; if a replaced token is used again, that device's whole session is signed out and the event is audited.
- **Web:** refresh token in an `httpOnly`, `SameSite=Strict` cookie scoped to `/api/v1/auth` (`Secure` in production). **Android:** in the phone's secure storage. Every auth call needs an `X-Dokyu-Client` header, which a cross-site form can't send (CSRF guard).
- **Lockout** for 15 minutes after 5 wrong passwords, plus a per-IP rate limit on sign-in, sign-up, verification and password reset.
- **No account enumeration:** sign-up and "forgot password" answer the same whether or not the email is registered.
- Single-use, hashed email links: confirmation (24 hours) and password reset (30 minutes). A reset signs out every device.
- Sign-up requires **Data Privacy Act (RA 10173) consent**, saved with a timestamp.
- **Roles:** USER and SUPER_ADMIN only; `/super` routes check the role on the server. The profile endpoint rejects unknown fields, so a user can't promote themselves.
- **Ownership:** every `/me` query is scoped to the signed-in user; another user's session id answers 404.

## Built into the data model, enforced in later phases
- **Role-based access control with ownership checks:** a user can only read and change their own tracker, family members, saved offices and letters; only the Super Admin can reach `/super` routes.
- **Audit log** for every Super Admin change, sign-in and account deletion (`AuditLog`).
- Planned for the barangay system (in "Later", see `docs/PLAN.md` §3.2): barangay-scoped staff access, single-use hashed QR tokens, a required valid-ID check before release. The request rules already live in `packages/shared/src/requests.ts` with tests.
- Soft delete, then hard delete, on account deletion; data export for the user.

## Reporting a vulnerability
Please email **mukraminansao@gmail.com** with steps to reproduce. Do not open a public issue for security problems.

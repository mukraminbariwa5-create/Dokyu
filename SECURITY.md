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

## Built into the data model, enforced in later phases
- argon2 password hashing; 15-minute JWT access tokens and **rotating refresh tokens stored hashed** (`RefreshToken.tokenHash`).
- Account lockout after repeated failed logins (`User.failedLogins`, `User.lockedUntil`).
- **Role-based access control with ownership checks:** a user can only read and change their own tracker, family members, saved offices and letters; only the Super Admin can reach `/super` routes.
- **Audit log** for every Super Admin change, sign-in and account deletion (`AuditLog`).
- Planned for the barangay system (in "Later", see `docs/PLAN.md` §3.2): barangay-scoped staff access, single-use hashed QR tokens, a required valid-ID check before release. The request rules already live in `packages/shared/src/requests.ts` with tests.
- Soft delete, then hard delete, on account deletion; data export for the user.

## Reporting a vulnerability
Please email **mukraminansao@gmail.com** with steps to reproduce. Do not open a public issue for security problems.

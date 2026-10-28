# CoreAccess

**Employee identity & access management console for Bank Sulistiyo Kusumo (BSK)** — a fictional bank used as a case study. CoreAccess is the internal tool HR Operations and IT would use to provision, change, and retire employee accounts, with the governance controls a real bank back-office requires: maker–checker approval on every write, step-up OTP authentication, and a compliance-grade audit trail.

This is a portfolio case study — see [Scope & disclosures](#scope--disclosures) for exactly what's real vs. simplified for demo purposes.

## Stack

Next.js 14 (App Router, TypeScript) · Prisma + SQLite · Tailwind CSS (custom design tokens, no UI kit) · Radix UI primitives (Dialog/Dropdown/Toast, fully custom-styled) · react-hook-form + zod · bcryptjs · lucide-react.

## Running it locally

```bash
npm install
npm run db:migrate   # creates prisma/dev.db and applies the schema
npm run db:seed      # seeds BSK branches/departments, 32 employees, sample requests & audit history
npm run dev
```

Open http://localhost:3000 — it redirects to `/login`. No external services, API keys, or Postgres instance required; the SQLite file is created on first migrate.

### Demo credentials (also shown in-app on the login screen)

| Role | NIP | Password |
|---|---|---|
| Super Admin (IT) | `BSK-2021-0001` | `SuperAdmin123` |
| Admin Operasional (Maker) | `BSK-2021-0002` | `AdminOps123` |
| Approver (Checker) | `BSK-2021-0003` | `Approver123` |
| Auditor Internal | `BSK-2021-0004` | `Auditor123` |
| New hire (forced password change) | `BSK-2025-0006` | `Welcome123` |

After password entry, the OTP step-up shows its code directly on screen in a "demo mode" banner (see [Auth design](#auth-design) for why).

## Why maker–checker

Every write to an employee record — create, edit, temporary suspension, or permanent off-boarding — is submitted as a `ChangeRequest`, never applied directly. It sits in `/approvals` until someone with the **Approver** role reviews a before/after diff and decides. The requester can never decide their own request, even by role. This mirrors how real banking back-offices enforce separation of duties for anything touching employee access, and it's the reason the app has four distinct roles instead of one generic "admin":

- **Super Admin (IT)** — owns portal role assignment, sees everything, cannot bypass the approval flow for employee data.
- **Admin Operasional (Maker)** — the only role that can submit employee changes.
- **Approver (Checker)** — the only role that can decide them; blocked from approving their own submissions.
- **Auditor Internal** — read-only access to the employee directory and the full audit log.

No single role holds both submit and decide permissions, so the separation of duties is structural, not just a UI suggestion.

## Auth design

- **Login is NIP + password**, not email — matches how internal banking systems actually identify staff.
- **Step-up OTP** after password: a 6-digit code, hashed server-side, 5-minute expiry, capped attempts, 30s resend cooldown. There's no SMS/email vendor wired into a portfolio project, so the code is shown in an explicit on-screen "demo mode" banner instead of silently no-op'ing — the verification logic (hash, expiry, attempt-limiting) is real, only the delivery channel is stubbed.
- **Sessions are DB-backed**, not bare JWT: a random token is issued to the browser as an httpOnly cookie, only its SHA-256 hash is stored server-side (Lucia-style). This is what makes `/profile`'s "active sessions" list and per-device revoke actually work — a JWT can't be revoked without an allow/deny-list anyway, so this ends up simpler, not just "more secure."
- **Account lockout**: 5 failed attempts locks the account for 15 minutes.
- **Forced password change** on first login via a `mustChangePassword` flag (see the seeded "new hire" account above).
- Every one of the above — login success/failure, lockout, OTP issuance/verification, logout, password change, session revocation — writes an audit log entry.

## Data model

`User` doubles as both the managed employee record and (optionally) its portal login identity — most employees have `portalRole: NONE` and simply exist in the directory. `ChangeRequest` carries a JSON `payload`/`previousData` pair that the approvals UI diffs field-by-field. `AuditLog` is append-only from the UI's perspective — there's no edit or delete affordance anywhere for it, by design. `Session` and `OtpChallenge` back the auth flow described above.

One deliberate design note: a "DELETE" request doesn't delete the `User` row. Financial-industry retention rules mean employee history generally can't be erased, and a hard delete would also break the audit trail's foreign keys. So "off-boarding" marks the record `RESIGNED` and revokes all sessions instead — permanent, but not destructive.

## Scope & disclosures

What's real: password hashing, session issuance/revocation, OTP hash+expiry+attempt logic, account lockout, the full maker–checker transaction (including the self-approval guard), and every audit log write — all backed by a real SQLite database via Prisma, not mocked.

What's simplified for a portfolio project, on purpose:
- No SMS/email gateway — OTP delivery is the on-screen "demo mode" banner described above.
- Portal role assignment (`/settings/roles`) is a direct Super Admin action, not routed through the approval flow — kept out of scope to bound the maker–checker showcase to employee data.
- No automated test suite or CI pipeline.
- Runs on SQLite for zero-config review; `DATABASE_URL` is the only thing that would change to point it at Postgres for a real deployment.

## Project structure

```
prisma/schema.prisma      # User, ChangeRequest, AuditLog, Session, OtpChallenge
prisma/seed.ts             # BSK branches/departments + demo roster + sample requests/audit history
src/lib/auth.ts            # password hashing, session + OTP challenge lifecycle, lockout
src/lib/requests.ts        # the only code path that mutates User records (create/decide/cancel)
src/lib/rbac.ts            # role → permission matrix
src/lib/audit.ts           # logAction() — the single audit-log writer used everywhere
src/app/(auth)/            # login, OTP, forced password change (split-screen shell)
src/app/(app)/             # dashboard, employees, approvals, audit log, profile, settings (sidebar shell)
```

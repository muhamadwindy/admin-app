# Changelog

All notable versions of CoreAccess are recorded here. Entries are never rewritten or removed — later versions get new entries above older ones.

## v1.0.0 — 2026-08-10

Initial release. Full-stack Next.js 14 + Prisma/SQLite employee identity & access management console for the fictional Bank Cakra Nusantara case study.

- Auth: NIP + password login, step-up OTP (demo-mode delivery), DB-backed sessions with per-device revoke, account lockout after 5 failed attempts, forced password change on first login.
- Governance: maker–checker approval on every employee create/update/deactivate/off-board, with a self-approval guard and a before/after diff view for approvers.
- Audit: append-only audit log covering every auth event and every request lifecycle event, with filtering and CSV export.
- Roles: Super Admin, Admin (Maker), Approver (Checker), Auditor — modeled as a strict permission matrix (`src/lib/rbac.ts`) with no role holding both submit and decide permissions.
- UI: custom design system (IBM Plex Sans/Mono, navy/gold enterprise palette, dense data tables) — deliberately not a shadcn/Tailwind-default look. See `README.md` for the full rationale.
- Seeded with 32 fictional BCN employees across 6 branches and 8 departments, 4 demo portal accounts (one per role), and sample pending/approved/rejected requests plus audit history.

Preserved on the `v1` git branch/tag as a fixed snapshot — later iterative work happens on `main` without overwriting this milestone.

export const BANK_NAME = "Bank Cakra Nusantara";
export const BANK_SHORT = "BCN";
export const APP_NAME = "CoreAccess";

// Cookie names are edge-safe constants (no Node-only deps) so middleware.ts
// can read them without pulling in lib/auth.ts's Prisma/bcrypt/node:crypto imports.
export const SESSION_COOKIE = "bcn_session";
export const PENDING_COOKIE = "bcn_pending";

export const BRANCHES = [
  "Kantor Pusat - Jakarta",
  "Cabang Jakarta Selatan",
  "Cabang Surabaya",
  "Cabang Bandung",
  "Cabang Medan",
  "Cabang Makassar",
] as const;

export const DEPARTMENTS = [
  "Teknologi Informasi",
  "Operasional",
  "Kredit & Pembiayaan",
  "Kepatuhan & Manajemen Risiko",
  "Sumber Daya Manusia",
  "Layanan Nasabah",
  "Keuangan & Akuntansi",
  "Audit Internal",
] as const;

export const POSITIONS = [
  "Staff",
  "Senior Staff",
  "Supervisor",
  "Assistant Manager",
  "Manager",
  "Senior Manager",
  "Kepala Cabang",
  "Vice President",
] as const;

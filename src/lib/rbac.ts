import type { PortalRole } from "@/types/enums";

export const ROLE_LABEL: Record<PortalRole, string> = {
  NONE: "Tanpa Akses Portal",
  SUPER_ADMIN: "Super Admin (IT)",
  ADMIN: "Admin Operasional (Maker)",
  APPROVER: "Approver (Checker)",
  AUDITOR: "Auditor Internal",
};

export const ROLE_DESCRIPTION: Record<PortalRole, string> = {
  NONE:
    "Pegawai reguler yang tercatat dalam direktori tetapi belum diberikan akses login ke CoreAccess.",
  SUPER_ADMIN:
    "Mengelola akun & peran pengguna portal, memiliki akses penuh untuk melihat seluruh modul. Tidak dapat melewati alur persetujuan pada data pegawai.",
  ADMIN:
    "Mengajukan penambahan, perubahan, atau penonaktifan data pegawai. Setiap pengajuan wajib melalui persetujuan Approver sebelum berlaku.",
  APPROVER:
    "Meninjau dan memutuskan (menyetujui/menolak) pengajuan perubahan data pegawai. Tidak dapat menyetujui pengajuan miliknya sendiri.",
  AUDITOR:
    "Akses baca saja terhadap direktori pegawai dan jejak audit penuh, untuk keperluan audit internal & kepatuhan.",
};

export type Permission =
  | "employees:view"
  | "employees:submit_request"
  | "requests:decide"
  | "requests:view_all"
  | "audit:view"
  | "roles:manage"
  | "sessions:manage_own";

export const PERMISSION_LABEL: Record<Permission, string> = {
  "employees:view": "Melihat direktori pegawai",
  "employees:submit_request": "Mengajukan penambahan/perubahan/penonaktifan pegawai",
  "requests:decide": "Menyetujui atau menolak pengajuan",
  "requests:view_all": "Melihat seluruh pengajuan & riwayat keputusan",
  "audit:view": "Melihat & mengekspor jejak audit",
  "roles:manage": "Mengelola peran akses portal pengguna",
  "sessions:manage_own": "Mengelola sesi & kata sandi akun sendiri",
};

export const PERMISSIONS: Record<PortalRole, Permission[]> = {
  NONE: [],
  SUPER_ADMIN: [
    "employees:view",
    "requests:decide",
    "requests:view_all",
    "audit:view",
    "roles:manage",
    "sessions:manage_own",
  ],
  ADMIN: ["employees:view", "employees:submit_request", "sessions:manage_own"],
  APPROVER: ["employees:view", "requests:decide", "requests:view_all", "audit:view", "sessions:manage_own"],
  AUDITOR: ["employees:view", "audit:view", "sessions:manage_own"],
};

// Accept `string` (not just the narrow PortalRole union) because these are most often
// called with a field freshly read off a Prisma User row, which SQLite stores as a
// plain string (Prisma has no native enum support for SQLite). The zod schemas in
// lib/validation.ts are what actually keep that column's values inside the union.
export function can(role: string, permission: Permission): boolean {
  return PERMISSIONS[role as PortalRole]?.includes(permission) ?? false;
}

export function roleLabel(role: string): string {
  return ROLE_LABEL[role as PortalRole] ?? role;
}

export function roleDescription(role: string): string {
  return ROLE_DESCRIPTION[role as PortalRole] ?? "";
}

export const NAV_PERMISSION: Record<string, Permission> = {
  "/dashboard": "employees:view",
  "/employees": "employees:view",
  "/approvals": "requests:decide",
  "/my-requests": "employees:submit_request",
  "/audit-log": "audit:view",
  "/settings/roles": "roles:manage",
  "/profile": "sessions:manage_own",
};

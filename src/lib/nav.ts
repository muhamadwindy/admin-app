import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  FileClock,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import type { Permission } from "@/lib/rbac";

export const NAV: { href: string; label: string; icon: React.ElementType; permission: Permission }[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, permission: "employees:view" },
  { href: "/employees", label: "Direktori Pegawai", icon: Users, permission: "employees:view" },
  { href: "/approvals", label: "Persetujuan", icon: ClipboardCheck, permission: "requests:decide" },
  { href: "/my-requests", label: "Pengajuan Saya", icon: FileClock, permission: "employees:submit_request" },
  { href: "/audit-log", label: "Jejak Audit", icon: ScrollText, permission: "audit:view" },
  { href: "/settings/roles", label: "Manajemen Peran", icon: ShieldCheck, permission: "roles:manage" },
];

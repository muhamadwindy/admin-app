import { redirect } from "next/navigation";
import Link from "next/link";
import { Download, Search, ScrollText } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { buildAuditWhere, AUDIT_ACTIONS } from "@/lib/audit";
import { EmptyState, Panel } from "@/components/ui";
import { Input, Select } from "@/components/ui/form";
import { formatDateTime } from "@/lib/utils";

const PAGE_SIZE = 25;

const ACTION_LABEL: Record<string, string> = {
  LOGIN_SUCCESS: "Masuk Berhasil",
  LOGIN_FAILED: "Masuk Gagal",
  LOGIN_LOCKED: "Akun Dibekukan (Percobaan Gagal)",
  OTP_SENT: "OTP Dikirim",
  OTP_VERIFIED: "OTP Terverifikasi",
  OTP_FAILED: "OTP Gagal",
  LOGOUT: "Keluar",
  PASSWORD_CHANGED: "Kata Sandi Diubah",
  SESSION_REVOKED: "Sesi Dicabut",
  REQUEST_SUBMITTED: "Pengajuan Dibuat",
  REQUEST_APPROVED: "Pengajuan Disetujui",
  REQUEST_REJECTED: "Pengajuan Ditolak",
  REQUEST_CANCELLED: "Pengajuan Dibatalkan",
  USER_CREATED: "Pegawai Ditambahkan",
  USER_UPDATED: "Data Pegawai Diperbarui",
  USER_DEACTIVATED: "Pegawai Dibekukan",
  USER_DELETED: "Pegawai Off-boarding",
  ROLE_CHANGED: "Peran Portal Diubah",
  AUDIT_EXPORTED: "Jejak Audit Diekspor",
};

export default async function AuditLogPage({
  searchParams,
}: {
  searchParams: { q?: string; action?: string; entityType?: string; days?: string; page?: string };
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!can(session.user.portalRole, "audit:view")) redirect("/403");

  const page = Math.max(1, Number(searchParams.page) || 1);
  const where = buildAuditWhere(searchParams);

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const exportQs = new URLSearchParams(searchParams as Record<string, string>).toString();

  function buildQuery(overrides: Record<string, string | number | undefined>) {
    const params = new URLSearchParams();
    const merged = { ...searchParams, ...overrides };
    Object.entries(merged).forEach(([k, v]) => {
      if (v) params.set(k, String(v));
    });
    return `?${params.toString()}`;
  }

  return (
    <div>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[19px] font-semibold text-ink-900">Jejak Audit</h1>
          <p className="text-[13px] text-ink-400">{total} entri tercatat &middot; tidak dapat diubah atau dihapus.</p>
        </div>
        <a href={`/audit-log/export?${exportQs}`} className="btn btn-outline btn-md">
          <Download size={14} /> Ekspor CSV
        </a>
      </div>

      <Panel className="mb-4 p-3.5">
        <form className="grid gap-2.5 sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto]" method="GET">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-300" />
            <Input name="q" defaultValue={searchParams.q} placeholder="Cari pelaku atau deskripsi..." className="pl-8" />
          </div>
          <Select name="action" defaultValue={searchParams.action ?? ""}>
            <option value="">Semua Aksi</option>
            {Object.values(AUDIT_ACTIONS).map((a) => (
              <option key={a} value={a}>{ACTION_LABEL[a] ?? a}</option>
            ))}
          </Select>
          <Select name="entityType" defaultValue={searchParams.entityType ?? ""}>
            <option value="">Semua Entitas</option>
            <option value="User">Pegawai</option>
            <option value="ChangeRequest">Pengajuan</option>
            <option value="Session">Sesi</option>
          </Select>
          <Select name="days" defaultValue={searchParams.days ?? "30"}>
            <option value="1">24 Jam Terakhir</option>
            <option value="7">7 Hari Terakhir</option>
            <option value="30">30 Hari Terakhir</option>
            <option value="all">Semua Waktu</option>
          </Select>
          <button type="submit" className="btn btn-outline btn-md">Terapkan</button>
        </form>
      </Panel>

      <Panel className="overflow-hidden">
        {logs.length === 0 ? (
          <EmptyState icon={<ScrollText size={20} />} title="Tidak ada entri ditemukan" description="Coba ubah filter pencarian Anda." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Waktu</th>
                  <th>Pelaku</th>
                  <th>Aksi</th>
                  <th>Deskripsi</th>
                  <th>Alamat IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="whitespace-nowrap font-mono text-[12px] text-ink-500">{formatDateTime(log.createdAt)}</td>
                    <td className="font-medium">{log.actorName}</td>
                    <td>
                      <span className="rounded-md bg-ink-100 px-1.5 py-0.5 text-[11px] font-medium text-ink-600">
                        {ACTION_LABEL[log.action] ?? log.action}
                      </span>
                    </td>
                    <td className="max-w-md text-ink-600">{log.description}</td>
                    <td className="font-mono text-[12px] text-ink-400">{log.ipAddress ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-[13px] text-ink-400">
          <p>Halaman {page} dari {totalPages}</p>
          <div className="flex gap-2">
            {page > 1 && <Link href={buildQuery({ page: page - 1 })} className="btn btn-outline btn-sm">Sebelumnya</Link>}
            {page < totalPages && <Link href={buildQuery({ page: page + 1 })} className="btn btn-outline btn-sm">Berikutnya</Link>}
          </div>
        </div>
      )}
    </div>
  );
}

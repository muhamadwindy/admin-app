import { redirect } from "next/navigation";
import Link from "next/link";
import { Users, ClipboardCheck, ShieldAlert, Building2 } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Panel, StatCard } from "@/components/ui";
import { LoginActivityChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { timeAgo } from "@/lib/utils";
import { AUDIT_ACTIONS } from "@/lib/audit";

const DAY_LABEL = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export default async function DashboardPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const { portalRole } = session.user;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  const [activeCount, totalCount, pendingCount, failedLogins24h, loginLogs, requestGroups, deptGroups] =
    await Promise.all([
      prisma.user.count({ where: { accountStatus: "ACTIVE" } }),
      prisma.user.count(),
      prisma.changeRequest.count({ where: { status: "PENDING" } }),
      prisma.auditLog.count({ where: { action: AUDIT_ACTIONS.LOGIN_FAILED, createdAt: { gte: oneDayAgo } } }),
      prisma.auditLog.findMany({
        where: { action: { in: [AUDIT_ACTIONS.LOGIN_SUCCESS, AUDIT_ACTIONS.LOGIN_FAILED] }, createdAt: { gte: sevenDaysAgo } },
        select: { action: true, createdAt: true },
      }),
      prisma.changeRequest.groupBy({ by: ["status"], _count: true }),
      prisma.user.groupBy({ by: ["department"], _count: true, where: { accountStatus: "ACTIVE" }, orderBy: { _count: { department: "desc" } }, take: 5 }),
    ]);

  const canViewAudit = can(portalRole, "audit:view");
  const recentActivity = canViewAudit
    ? await prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 })
    : [];

  const chartData = Array.from({ length: 7 }).map((_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - (6 - i));
    day.setHours(0, 0, 0, 0);
    const nextDay = new Date(day.getTime() + 24 * 60 * 60 * 1000);
    const dayLogs = loginLogs.filter((l) => l.createdAt >= day && l.createdAt < nextDay);
    return {
      label: DAY_LABEL[day.getDay()],
      success: dayLogs.filter((l) => l.action === AUDIT_ACTIONS.LOGIN_SUCCESS).length,
      failed: dayLogs.filter((l) => l.action === AUDIT_ACTIONS.LOGIN_FAILED).length,
    };
  });

  const statusColor: Record<string, string> = {
    PENDING: "stroke-gold-400",
    APPROVED: "stroke-good-600",
    REJECTED: "stroke-bad-600",
    CANCELLED: "stroke-ink-300",
  };
  const statusLabel: Record<string, string> = {
    PENDING: "Menunggu",
    APPROVED: "Disetujui",
    REJECTED: "Ditolak",
    CANCELLED: "Dibatalkan",
  };
  const donutData = requestGroups.map((g) => ({
    label: statusLabel[g.status] ?? g.status,
    value: g._count,
    colorClass: statusColor[g.status] ?? "stroke-ink-300",
  }));

  return (
    <div>
      <div className="mb-5">
        <h1 className="text-[19px] font-semibold text-ink-900">Selamat datang, {session.user.fullName.split(" ")[0]}</h1>
        <p className="text-[13px] text-ink-400">Ringkasan aktivitas sistem CoreAccess hari ini.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Pegawai Aktif" value={activeCount} hint={`dari ${totalCount} total tercatat`} icon={<Users size={16} />} />
        <StatCard
          label="Pengajuan Tertunda"
          value={pendingCount}
          tone={pendingCount > 0 ? "warn" : "default"}
          hint={can(portalRole, "requests:decide") ? "menunggu keputusan Anda" : "seluruh sistem"}
          icon={<ClipboardCheck size={16} />}
        />
        <StatCard
          label="Login Gagal (24 jam)"
          value={failedLogins24h}
          tone={failedLogins24h > 5 ? "bad" : "default"}
          icon={<ShieldAlert size={16} />}
        />
        <StatCard label="Departemen Teraktif" value={deptGroups[0]?.department ?? "—"} hint={`${deptGroups[0]?._count ?? 0} pegawai aktif`} icon={<Building2 size={16} />} />
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-5">
        <Panel className="p-5 lg:col-span-3">
          <p className="label-caps mb-4">Aktivitas Login — 7 Hari Terakhir</p>
          <LoginActivityChart data={chartData} />
          <div className="mt-2 flex items-center gap-4 text-[11.5px] text-ink-400">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-brand-500" /> Berhasil</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-bad-600/70" /> Gagal</span>
          </div>
        </Panel>

        <Panel className="p-5 lg:col-span-2">
          <p className="label-caps mb-4">Pengajuan Berdasarkan Status</p>
          {donutData.length === 0 ? (
            <p className="text-[12.5px] text-ink-400">Belum ada data pengajuan.</p>
          ) : (
            <DonutChart data={donutData} />
          )}
        </Panel>
      </div>

      {canViewAudit && (
        <Panel className="mt-5 p-5">
          <div className="mb-3 flex items-center justify-between">
            <p className="label-caps">Aktivitas Terbaru</p>
            <Link href="/audit-log" className="text-[12.5px] font-medium text-brand-600 hover:text-brand-700">
              Lihat Jejak Audit &rarr;
            </Link>
          </div>
          <div className="divide-y divide-ink-100">
            {recentActivity.map((log) => (
              <div key={log.id} className="flex items-center justify-between gap-3 py-2.5 text-[13px]">
                <div className="min-w-0 text-ink-700">{log.description}</div>
                <span className="flex-shrink-0 text-[11.5px] text-ink-300">{timeAgo(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}

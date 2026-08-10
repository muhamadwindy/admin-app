import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Pencil, Mail, Phone, MapPin, CalendarDays, Building2 } from "lucide-react";
import { getCurrentSession, maskIdCard } from "@/lib/auth";
import { can, roleLabel } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { AccountStatusChip, Avatar, Panel, RequestStatusChip } from "@/components/ui";
import { formatDate, formatDateTime } from "@/lib/utils";
import { requestTypeLabel } from "@/lib/requests";
import { EmployeeActions } from "@/components/employees/EmployeeActions";

export default async function EmployeeDetailPage({ params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!can(session.user.portalRole, "employees:view")) redirect("/403");

  const employee = await prisma.user.findUnique({ where: { id: params.id } });
  if (!employee) notFound();

  const requests = await prisma.changeRequest.findMany({
    where: { targetId: employee.id },
    include: { requester: true, reviewer: true },
    orderBy: { requestedAt: "desc" },
    take: 10,
  });

  const canSubmit = can(session.user.portalRole, "employees:submit_request");
  const hasPending = requests.some((r) => r.status === "PENDING");

  return (
    <div className="max-w-4xl">
      <Link href="/employees" className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-400 hover:text-brand-600">
        <ChevronLeft size={14} /> Kembali ke Direktori
      </Link>

      <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-center gap-3.5">
          <Avatar name={employee.fullName} size={52} />
          <div>
            <h1 className="text-[19px] font-semibold text-ink-900">{employee.fullName}</h1>
            <p className="font-mono text-[12.5px] text-ink-400">{employee.nip}</p>
            <div className="mt-1.5 flex items-center gap-2">
              <AccountStatusChip status={employee.accountStatus} />
              <span className="text-xs text-ink-300">•</span>
              <span className="text-[12.5px] text-ink-500">{roleLabel(employee.portalRole)}</span>
            </div>
          </div>
        </div>
        {canSubmit && (
          <div className="flex flex-col items-end gap-2">
            <Link href={`/employees/${employee.id}/edit`} className="btn btn-outline btn-sm">
              <Pencil size={14} /> Ajukan Perubahan
            </Link>
            <EmployeeActions employeeId={employee.id} disabled={hasPending || employee.accountStatus === "RESIGNED"} />
          </div>
        )}
      </div>

      {hasPending && (
        <div className="mb-5 rounded-md border border-warn-700/20 bg-warn-100 px-3.5 py-2.5 text-[13px] text-warn-700">
          Terdapat pengajuan yang masih menunggu persetujuan untuk pegawai ini. Pengajuan baru tidak dapat dibuat sampai keputusan diambil.
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <Panel className="p-5 lg:col-span-2">
          <p className="label-caps mb-4">Data Pribadi & Kepegawaian</p>
          <dl className="grid gap-4 sm:grid-cols-2">
            <InfoItem icon={Mail} label="Email" value={employee.email} />
            <InfoItem icon={Phone} label="No. Telepon" value={employee.phone} />
            <InfoItem icon={Building2} label="Departemen" value={employee.department} />
            <InfoItem icon={MapPin} label="Cabang" value={employee.branch} />
            <InfoItem icon={CalendarDays} label="Tanggal Bergabung" value={formatDate(employee.joinDate)} />
            <InfoItem icon={CalendarDays} label="Tanggal Lahir" value={formatDate(employee.dateOfBirth)} />
            <InfoItem label="Jabatan" value={employee.position} />
            <InfoItem
              label="Status Kepegawaian"
              value={({ PERMANENT: "Tetap", CONTRACT: "Kontrak", INTERN: "Magang" } as Record<string, string>)[employee.employmentType]}
            />
            <InfoItem label="No. KTP" value={maskIdCard(employee.idCardNumber)} mono />
            <InfoItem label="Alamat" value={employee.address} full />
          </dl>
        </Panel>

        <Panel className="p-5">
          <p className="label-caps mb-4">Ringkasan Akun</p>
          <div className="space-y-3 text-[13px]">
            <Row label="Login Terakhir" value={employee.lastLoginAt ? formatDateTime(employee.lastLoginAt) : "Belum pernah masuk"} />
            <Row label="Wajib Ganti Sandi" value={employee.mustChangePassword ? "Ya" : "Tidak"} />
            <Row label="Dibuat" value={formatDate(employee.createdAt)} />
            <Row label="Terakhir Diperbarui" value={formatDate(employee.updatedAt)} />
          </div>
        </Panel>
      </div>

      <div className="mt-5">
        <p className="label-caps mb-3">Riwayat Pengajuan Perubahan</p>
        <Panel className="divide-y divide-ink-100">
          {requests.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-ink-400">Belum ada pengajuan untuk pegawai ini.</p>
          ) : (
            requests.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div>
                  <p className="text-[13px] font-medium text-ink-800">{requestTypeLabel(r.type)}</p>
                  <p className="text-[12px] text-ink-400">
                    Diajukan oleh {r.requester.fullName} &middot; {formatDateTime(r.requestedAt)}
                  </p>
                </div>
                <RequestStatusChip status={r.status} />
              </div>
            ))
          )}
        </Panel>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
  full,
  mono,
}: {
  icon?: React.ElementType;
  label: string;
  value: string;
  full?: boolean;
  mono?: boolean;
}) {
  return (
    <div className={full ? "sm:col-span-2" : undefined}>
      <dt className="mb-0.5 flex items-center gap-1.5 text-[11.5px] text-ink-400">
        {Icon && <Icon size={12} />}
        {label}
      </dt>
      <dd className={`text-[13.5px] text-ink-800 ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-ink-400">{label}</span>
      <span className="font-medium text-ink-800">{value}</span>
    </div>
  );
}

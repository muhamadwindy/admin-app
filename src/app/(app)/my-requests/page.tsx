import { redirect } from "next/navigation";
import Link from "next/link";
import { FileClock, UserPlus } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { EmptyState, Panel, RequestStatusChip } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { requestTypeLabel } from "@/lib/requests";
import { DiffTable } from "@/components/approvals/DiffTable";
import { CancelButton } from "@/components/approvals/CancelButton";

export default async function MyRequestsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!can(session.user.portalRole, "employees:submit_request")) redirect("/403");

  const requests = await prisma.changeRequest.findMany({
    where: { requesterId: session.user.id },
    include: { target: true, reviewer: true },
    orderBy: { requestedAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[19px] font-semibold text-ink-900">Pengajuan Saya</h1>
          <p className="text-[13px] text-ink-400">Status pengajuan yang pernah Anda buat.</p>
        </div>
        <Link href="/employees/new" className="btn btn-primary btn-md">
          <UserPlus size={15} /> Ajukan Pegawai Baru
        </Link>
      </div>

      {requests.length === 0 ? (
        <EmptyState icon={<FileClock size={20} />} title="Belum ada pengajuan" description="Pengajuan yang Anda buat akan muncul di sini." />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => (
            <Panel key={r.id} className="p-4">
              <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[14px] font-semibold text-ink-900">{requestTypeLabel(r.type)}</p>
                    <RequestStatusChip status={r.status} />
                  </div>
                  <p className="mt-0.5 text-[12.5px] text-ink-400">
                    {r.target && <>{r.target.fullName} ({r.target.nip}) &middot; </>}
                    Diajukan {formatDateTime(r.requestedAt)}
                    {r.reviewer && <> &middot; Ditinjau oleh {r.reviewer.fullName}</>}
                  </p>
                </div>
                {r.status === "PENDING" && <CancelButton requestId={r.id} />}
              </div>

              <div className="mt-3 rounded-md bg-ink-50 px-3 py-2.5 text-[12.5px] text-ink-600">
                <span className="font-medium">Alasan: </span>
                {r.reason}
              </div>

              {r.reviewNote && (
                <div className="mt-2 rounded-md border border-ink-100 px-3 py-2.5 text-[12.5px] text-ink-600">
                  <span className="font-medium">Catatan Approver: </span>
                  {r.reviewNote}
                </div>
              )}

              <details className="mt-3">
                <summary className="cursor-pointer list-none text-[12.5px] font-medium text-brand-600 hover:text-brand-700">
                  Lihat rincian perubahan data
                </summary>
                <div className="mt-2">
                  <DiffTable previousData={r.previousData} payload={r.payload} />
                </div>
              </details>
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}

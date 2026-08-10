import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { EmptyState, Panel, RequestStatusChip } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { requestTypeLabel } from "@/lib/requests";
import { DiffTable } from "@/components/approvals/DiffTable";
import { History } from "lucide-react";

export default async function ApprovalHistoryPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!can(session.user.portalRole, "requests:decide")) redirect("/403");

  const requests = await prisma.changeRequest.findMany({
    where: { status: { in: ["APPROVED", "REJECTED"] } },
    include: { requester: true, reviewer: true, target: true },
    orderBy: { reviewedAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <Link href="/approvals" className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-400 hover:text-brand-600">
        <ChevronLeft size={14} /> Kembali ke Persetujuan Tertunda
      </Link>
      <h1 className="mb-1 text-[19px] font-semibold text-ink-900">Riwayat Keputusan</h1>
      <p className="mb-5 text-[13px] text-ink-400">50 keputusan persetujuan terakhir.</p>

      {requests.length === 0 ? (
        <EmptyState icon={<History size={20} />} title="Belum ada riwayat keputusan" />
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
                    Diajukan {r.requester.fullName} &middot; Diputuskan {r.reviewer?.fullName} &middot;{" "}
                    {r.reviewedAt && formatDateTime(r.reviewedAt)}
                  </p>
                </div>
              </div>
              {r.reviewNote && (
                <div className="mt-3 rounded-md bg-ink-50 px-3 py-2.5 text-[12.5px] text-ink-600">
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

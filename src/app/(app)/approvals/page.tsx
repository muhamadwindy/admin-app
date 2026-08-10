import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { EmptyState, Panel } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { requestTypeLabel } from "@/lib/requests";
import { DiffTable } from "@/components/approvals/DiffTable";
import { DecisionButtons } from "@/components/approvals/DecisionButtons";
import { ClipboardCheck } from "lucide-react";

export default async function ApprovalsPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!can(session.user.portalRole, "requests:decide")) redirect("/403");

  const requests = await prisma.changeRequest.findMany({
    where: { status: "PENDING" },
    include: { requester: true, target: true },
    orderBy: { requestedAt: "asc" },
  });

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[19px] font-semibold text-ink-900">Persetujuan Tertunda</h1>
          <p className="text-[13px] text-ink-400">{requests.length} pengajuan menunggu keputusan Anda.</p>
        </div>
        <Link href="/approvals/history" className="text-[13px] font-medium text-brand-600 hover:text-brand-700">
          Lihat Riwayat Keputusan &rarr;
        </Link>
      </div>

      {requests.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck size={20} />}
          title="Tidak ada pengajuan tertunda"
          description="Semua pengajuan telah diputuskan. Pengajuan baru akan muncul di sini."
        />
      ) : (
        <div className="space-y-4">
          {requests.map((r) => {
            const isOwn = r.requesterId === session.user.id;
            return (
              <Panel key={r.id} className="p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[14px] font-semibold text-ink-900">{requestTypeLabel(r.type)}</p>
                      <span className="rounded-md bg-warn-100 px-1.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wide text-warn-700">
                        Menunggu
                      </span>
                    </div>
                    <p className="mt-0.5 text-[12.5px] text-ink-400">
                      {r.target ? (
                        <>Target: <span className="font-medium text-ink-600">{r.target.fullName}</span> ({r.target.nip}) &middot; </>
                      ) : null}
                      Diajukan oleh {r.requester.fullName} &middot; {formatDateTime(r.requestedAt)}
                    </p>
                  </div>
                  {isOwn ? (
                    <span className="text-[12px] italic text-ink-300">Pengajuan Anda sendiri — menunggu Approver lain</span>
                  ) : (
                    <DecisionButtons requestId={r.id} />
                  )}
                </div>

                <div className="mt-3 rounded-md bg-ink-50 px-3 py-2.5 text-[12.5px] text-ink-600">
                  <span className="font-medium">Alasan pengajuan: </span>
                  {r.reason}
                </div>

                <details className="mt-3 group">
                  <summary className="cursor-pointer list-none text-[12.5px] font-medium text-brand-600 hover:text-brand-700">
                    Lihat rincian perubahan data
                  </summary>
                  <div className="mt-2">
                    <DiffTable previousData={r.previousData} payload={r.payload} />
                  </div>
                </details>
              </Panel>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { redirect } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { EmployeeForm } from "@/components/employees/EmployeeForm";

export default async function NewEmployeePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!can(session.user.portalRole, "employees:submit_request")) redirect("/403");

  return (
    <div className="max-w-3xl">
      <Link href="/employees" className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-400 hover:text-brand-600">
        <ChevronLeft size={14} /> Kembali ke Direktori
      </Link>
      <h1 className="mb-1 text-[19px] font-semibold text-ink-900">Ajukan Penambahan Pegawai</h1>
      <p className="mb-6 text-[13px] text-ink-400">
        Data akan tersimpan sebagai pengajuan dan baru berlaku setelah disetujui oleh Approver.
      </p>
      <EmployeeForm mode="create" />
    </div>
  );
}

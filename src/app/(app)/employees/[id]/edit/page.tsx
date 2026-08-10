import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { EmployeeForm } from "@/components/employees/EmployeeForm";
import { snapshotUser } from "@/lib/requests";

export default async function EditEmployeePage({ params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!can(session.user.portalRole, "employees:submit_request")) redirect("/403");

  const employee = await prisma.user.findUnique({ where: { id: params.id } });
  if (!employee) notFound();

  return (
    <div className="max-w-3xl">
      <Link href={`/employees/${employee.id}`} className="mb-3 inline-flex items-center gap-1 text-[13px] text-ink-400 hover:text-brand-600">
        <ChevronLeft size={14} /> Kembali ke Detail Pegawai
      </Link>
      <h1 className="mb-1 text-[19px] font-semibold text-ink-900">Ajukan Perubahan Data — {employee.fullName}</h1>
      <p className="mb-6 text-[13px] text-ink-400">
        Perubahan akan ditampilkan sebagai perbandingan data lama & baru kepada Approver sebelum berlaku.
      </p>
      <EmployeeForm mode="edit" targetId={employee.id} defaultValues={snapshotUser(employee) as never} />
    </div>
  );
}

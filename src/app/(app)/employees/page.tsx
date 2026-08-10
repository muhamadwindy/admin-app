import Link from "next/link";
import { redirect } from "next/navigation";
import { UserPlus, Search } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can, roleLabel } from "@/lib/rbac";
import { AccountStatusChip, Avatar, EmptyState, Panel } from "@/components/ui";
import { Input, Select } from "@/components/ui/form";
import { DEPARTMENTS, BRANCHES } from "@/lib/constants";
import type { Prisma } from "@prisma/client";

const PAGE_SIZE = 12;

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: { q?: string; department?: string; branch?: string; status?: string; page?: string };
}) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!can(session.user.portalRole, "employees:view")) redirect("/403");

  const page = Math.max(1, Number(searchParams.page) || 1);
  const where: Prisma.UserWhereInput = {
    ...(searchParams.q
      ? {
          OR: [
            { fullName: { contains: searchParams.q } },
            { nip: { contains: searchParams.q } },
            { email: { contains: searchParams.q } },
          ],
        }
      : {}),
    ...(searchParams.department ? { department: searchParams.department } : {}),
    ...(searchParams.branch ? { branch: searchParams.branch } : {}),
    ...(searchParams.status ? { accountStatus: searchParams.status as "ACTIVE" | "SUSPENDED" | "RESIGNED" } : {}),
  };

  const [employees, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { fullName: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const canSubmit = can(session.user.portalRole, "employees:submit_request");

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
          <h1 className="text-[19px] font-semibold text-ink-900">Direktori Pegawai</h1>
          <p className="text-[13px] text-ink-400">{total} pegawai terdaftar di seluruh cabang & unit kerja.</p>
        </div>
        {canSubmit && (
          <Link href="/employees/new" className="btn btn-primary btn-md">
            <UserPlus size={15} /> Ajukan Pegawai Baru
          </Link>
        )}
      </div>

      <Panel className="mb-4 p-3.5">
        <form className="grid gap-2.5 sm:grid-cols-[1.4fr_1fr_1fr_1fr_auto]" method="GET">
          <div className="relative">
            <Search size={14} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-300" />
            <Input name="q" defaultValue={searchParams.q} placeholder="Cari nama, NIP, atau email..." className="pl-8" />
          </div>
          <Select name="department" defaultValue={searchParams.department ?? ""}>
            <option value="">Semua Departemen</option>
            {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
          </Select>
          <Select name="branch" defaultValue={searchParams.branch ?? ""}>
            <option value="">Semua Cabang</option>
            {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
          </Select>
          <Select name="status" defaultValue={searchParams.status ?? ""}>
            <option value="">Semua Status</option>
            <option value="ACTIVE">Aktif</option>
            <option value="SUSPENDED">Dibekukan</option>
            <option value="RESIGNED">Non-aktif</option>
          </Select>
          <button type="submit" className="btn btn-outline btn-md">Terapkan</button>
        </form>
      </Panel>

      <Panel className="overflow-hidden">
        {employees.length === 0 ? (
          <EmptyState title="Tidak ada pegawai ditemukan" description="Coba ubah kata kunci atau filter pencarian Anda." />
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pegawai</th>
                  <th>NIP</th>
                  <th>Departemen / Cabang</th>
                  <th>Jabatan</th>
                  <th>Akses Portal</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <Link href={`/employees/${emp.id}`} className="flex items-center gap-2.5 hover:text-brand-600">
                        <Avatar name={emp.fullName} size={28} />
                        <span className="font-medium">{emp.fullName}</span>
                      </Link>
                    </td>
                    <td className="font-mono text-[12.5px] text-ink-500">{emp.nip}</td>
                    <td>
                      <p>{emp.department}</p>
                      <p className="text-xs text-ink-400">{emp.branch}</p>
                    </td>
                    <td>{emp.position}</td>
                    <td className="text-[12.5px] text-ink-500">{roleLabel(emp.portalRole)}</td>
                    <td><AccountStatusChip status={emp.accountStatus} /></td>
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
            {page > 1 && (
              <Link href={buildQuery({ page: page - 1 })} className="btn btn-outline btn-sm">Sebelumnya</Link>
            )}
            {page < totalPages && (
              <Link href={buildQuery({ page: page + 1 })} className="btn btn-outline btn-sm">Berikutnya</Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

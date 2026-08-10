import { redirect } from "next/navigation";
import { Check, Search } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { can, ROLE_LABEL, ROLE_DESCRIPTION, PERMISSIONS, PERMISSION_LABEL } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Panel } from "@/components/ui";
import { Input } from "@/components/ui/form";
import { RoleAssignRow } from "@/components/settings/RoleAssignRow";
import type { PortalRole } from "@/types/enums";

const ROLES: PortalRole[] = ["SUPER_ADMIN", "ADMIN", "APPROVER", "AUDITOR"];
const ALL_PERMISSIONS = Object.keys(PERMISSION_LABEL) as (keyof typeof PERMISSION_LABEL)[];

export default async function RoleManagementPage({ searchParams }: { searchParams: { q?: string } }) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!can(session.user.portalRole, "roles:manage")) redirect("/403");

  const users = await prisma.user.findMany({
    where: searchParams.q
      ? { OR: [{ fullName: { contains: searchParams.q } }, { nip: { contains: searchParams.q } }] }
      : {},
    orderBy: { fullName: "asc" },
    take: 30,
  });

  return (
    <div>
      <h1 className="mb-1 text-[19px] font-semibold text-ink-900">Manajemen Peran Akses</h1>
      <p className="mb-6 text-[13px] text-ink-400">
        Matriks izin per peran, dan pemberian akses portal untuk pegawai (aksi langsung, tercatat di jejak audit).
      </p>

      <Panel className="mb-6 overflow-x-auto p-5">
        <p className="label-caps mb-4">Matriks Izin</p>
        <table className="w-full text-left text-[12.5px]">
          <thead>
            <tr className="text-[10.5px] uppercase tracking-wide text-ink-400">
              <th className="py-2 pr-4 font-semibold">Izin</th>
              {ROLES.map((r) => (
                <th key={r} className="px-3 py-2 text-center font-semibold">{ROLE_LABEL[r]}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ALL_PERMISSIONS.map((p) => (
              <tr key={p} className="border-t border-ink-100">
                <td className="py-2.5 pr-4 text-ink-600">{PERMISSION_LABEL[p]}</td>
                {ROLES.map((r) => (
                  <td key={r} className="px-3 py-2.5 text-center">
                    {PERMISSIONS[r].includes(p) ? (
                      <Check size={15} className="mx-auto text-good-600" />
                    ) : (
                      <span className="text-ink-200">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-4 grid gap-2 border-t border-ink-100 pt-4 sm:grid-cols-2">
          {ROLES.map((r) => (
            <div key={r} className="text-[12px] text-ink-400">
              <span className="font-medium text-ink-600">{ROLE_LABEL[r]}: </span>
              {ROLE_DESCRIPTION[r]}
            </div>
          ))}
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <p className="label-caps">Akses Portal Pegawai</p>
          <form method="GET" className="relative">
            <Search size={13} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-300" />
            <Input name="q" defaultValue={searchParams.q} placeholder="Cari pegawai..." className="w-56 pl-8" />
          </form>
        </div>
        <div className="divide-y divide-ink-100">
          {users.map((u) => (
            <RoleAssignRow
              key={u.id}
              userId={u.id}
              fullName={u.fullName}
              nip={u.nip}
              position={u.position}
              currentRole={u.portalRole}
              isSelf={u.id === session.user.id}
            />
          ))}
        </div>
      </Panel>
    </div>
  );
}

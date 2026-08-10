import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Avatar, Panel } from "@/components/ui";
import { roleLabel, roleDescription } from "@/lib/rbac";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";
import { SessionList } from "@/components/auth/SessionList";
import { formatDate } from "@/lib/utils";

export default async function ProfilePage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const { user } = session;

  const sessions = await prisma.session.findMany({
    where: { userId: user.id, revokedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl">
      <h1 className="mb-1 text-[19px] font-semibold text-ink-900">Profil Saya</h1>
      <p className="mb-6 text-[13px] text-ink-400">Kelola informasi akun, kata sandi, dan sesi aktif Anda.</p>

      <Panel className="mb-5 flex items-center gap-4 p-5">
        <Avatar name={user.fullName} size={52} />
        <div>
          <p className="text-[15px] font-semibold text-ink-900">{user.fullName}</p>
          <p className="font-mono text-[12.5px] text-ink-400">{user.nip}</p>
          <p className="text-[12.5px] text-ink-500">{user.position} &middot; {user.department}</p>
        </div>
        <div className="ml-auto text-right">
          <p className="text-[11px] uppercase tracking-wide text-ink-400">Peran Akses</p>
          <p className="text-[13px] font-medium text-brand-600">{roleLabel(user.portalRole)}</p>
        </div>
      </Panel>

      <div className="mb-5 rounded-md border border-ink-100 bg-white px-4 py-3 text-[12.5px] text-ink-500">
        {roleDescription(user.portalRole)}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel className="p-5">
          <p className="label-caps mb-4">Ubah Kata Sandi</p>
          <ChangePasswordForm />
        </Panel>

        <Panel className="p-5">
          <p className="label-caps mb-1">Sesi Aktif</p>
          <p className="mb-3 text-[12px] text-ink-400">
            Login terakhir: {user.lastLoginAt ? formatDate(user.lastLoginAt) : "—"}
          </p>
          <SessionList
            sessions={sessions.map((s) => ({
              id: s.id,
              ipAddress: s.ipAddress,
              userAgent: s.userAgent,
              createdAt: s.createdAt.toISOString(),
              expiresAt: s.expiresAt.toISOString(),
              isCurrent: s.id === session.id,
            }))}
          />
        </Panel>
      </div>
    </div>
  );
}

import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { can } from "@/lib/rbac";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  const user = session.user;
  if (user.mustChangePassword) redirect("/change-password");

  const pendingCount = can(user.portalRole, "requests:decide")
    ? await prisma.changeRequest.count({ where: { status: "PENDING" } })
    : 0;

  return (
    <div className="flex min-h-screen">
      <Sidebar role={user.portalRole} pendingCount={pendingCount} />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar
          user={{
            fullName: user.fullName,
            position: user.position,
            nip: user.nip,
            portalRole: user.portalRole,
          }}
        />
        <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6">
          <div className="mx-auto max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

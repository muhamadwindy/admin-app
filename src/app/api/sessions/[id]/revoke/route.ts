import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, revokeSession } from "@/lib/auth";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });

  const target = await prisma.session.findUnique({ where: { id: params.id } });
  if (!target || target.userId !== session.user.id) {
    return NextResponse.json({ error: "Sesi tidak ditemukan." }, { status: 404 });
  }

  await revokeSession(target.id);
  await logAction({
    actorId: session.user.id,
    actorName: session.user.fullName,
    action: AUDIT_ACTIONS.SESSION_REVOKED,
    entityType: "Session",
    entityId: target.id,
    description: `${session.user.fullName} mencabut sesi aktif${target.id === session.id ? " (perangkat saat ini)" : ""}`,
  });

  return NextResponse.json({ ok: true, self: target.id === session.id });
}

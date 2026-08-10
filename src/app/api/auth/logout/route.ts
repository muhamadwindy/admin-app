import { NextResponse } from "next/server";
import { getCurrentSession, destroyCurrentSession } from "@/lib/auth";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";

export async function POST() {
  const session = await getCurrentSession();
  await destroyCurrentSession();
  if (session) {
    await logAction({
      actorId: session.user.id,
      actorName: session.user.fullName,
      action: AUDIT_ACTIONS.LOGOUT,
      entityType: "Session",
      entityId: session.id,
      description: `${session.user.fullName} keluar dari sistem`,
    });
  }
  return NextResponse.json({ ok: true });
}

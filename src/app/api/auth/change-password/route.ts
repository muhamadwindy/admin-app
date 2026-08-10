import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";
import { changePasswordSchema } from "@/lib/validation";
import { getCurrentSession, verifyPassword, hashPassword, revokeOtherSessions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Sesi tidak valid. Silakan login kembali." }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  }

  const validCurrent = await verifyPassword(parsed.data.currentPassword, session.user.passwordHash);
  if (!validCurrent) {
    return NextResponse.json({ error: "Kata sandi saat ini tidak sesuai." }, { status: 401 });
  }

  const newHash = await hashPassword(parsed.data.newPassword);
  await prisma.user.update({
    where: { id: session.user.id },
    data: { passwordHash: newHash, mustChangePassword: false },
  });
  await revokeOtherSessions(session.user.id, session.id);

  await logAction({
    actorId: session.user.id,
    actorName: session.user.fullName,
    action: AUDIT_ACTIONS.PASSWORD_CHANGED,
    entityType: "User",
    entityId: session.user.id,
    description: `${session.user.fullName} memperbarui kata sandi akunnya (sesi lain otomatis diakhiri)`,
  });

  return NextResponse.json({ ok: true });
}

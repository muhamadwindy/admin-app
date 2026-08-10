import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";
import { otpSchema } from "@/lib/validation";
import { getPendingChallenge, clearPendingCookie, createSession, hashToken } from "@/lib/auth";

const MAX_ATTEMPTS = 5;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = otpSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Kode OTP harus 6 digit angka." }, { status: 400 });
  }

  const challenge = await getPendingChallenge();
  if (!challenge) {
    return NextResponse.json(
      { error: "Sesi verifikasi tidak ditemukan atau sudah kedaluwarsa. Silakan login kembali." },
      { status: 400 }
    );
  }

  if (challenge.attempts >= MAX_ATTEMPTS) {
    clearPendingCookie();
    return NextResponse.json({ error: "Terlalu banyak percobaan. Silakan login kembali." }, { status: 429 });
  }

  const isValid = hashToken(parsed.data.code) === challenge.codeHash;

  if (!isValid) {
    await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
    await logAction({
      actorId: challenge.userId,
      actorName: challenge.user.fullName,
      action: AUDIT_ACTIONS.OTP_FAILED,
      entityType: "User",
      entityId: challenge.userId,
      description: `Verifikasi OTP gagal untuk ${challenge.user.fullName}`,
    });
    return NextResponse.json(
      { error: `Kode OTP salah. Sisa percobaan: ${MAX_ATTEMPTS - challenge.attempts - 1}.` },
      { status: 401 }
    );
  }

  await prisma.otpChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } });
  clearPendingCookie();
  await createSession(challenge.userId);

  await logAction({
    actorId: challenge.userId,
    actorName: challenge.user.fullName,
    action: AUDIT_ACTIONS.OTP_VERIFIED,
    entityType: "User",
    entityId: challenge.userId,
    description: `Verifikasi OTP berhasil untuk ${challenge.user.fullName}`,
  });
  await logAction({
    actorId: challenge.userId,
    actorName: challenge.user.fullName,
    action: AUDIT_ACTIONS.LOGIN_SUCCESS,
    entityType: "Session",
    description: `${challenge.user.fullName} berhasil masuk ke sistem`,
  });

  return NextResponse.json({ ok: true, mustChangePassword: challenge.user.mustChangePassword });
}

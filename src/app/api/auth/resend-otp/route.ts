import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";
import { getPendingChallenge, hashToken } from "@/lib/auth";

const COOLDOWN_MS = 30 * 1000;

export async function POST() {
  const challenge = await getPendingChallenge();
  if (!challenge) {
    return NextResponse.json({ error: "Sesi verifikasi tidak ditemukan. Silakan login kembali." }, { status: 400 });
  }

  const elapsed = Date.now() - challenge.lastSentAt.getTime();
  if (elapsed < COOLDOWN_MS) {
    return NextResponse.json(
      { error: `Mohon tunggu ${Math.ceil((COOLDOWN_MS - elapsed) / 1000)} detik sebelum meminta kode baru.` },
      { status: 429 }
    );
  }

  const code = String(Math.floor(100000 + Math.random() * 900000));
  await prisma.otpChallenge.update({
    where: { id: challenge.id },
    data: { codeHash: hashToken(code), expiresAt: new Date(Date.now() + 5 * 60 * 1000), attempts: 0, lastSentAt: new Date() },
  });

  await logAction({
    actorId: challenge.userId,
    actorName: challenge.user.fullName,
    action: AUDIT_ACTIONS.OTP_SENT,
    entityType: "User",
    entityId: challenge.userId,
    description: `Kode OTP dikirim ulang untuk ${challenge.user.fullName}`,
  });

  return NextResponse.json({ ok: true, demoOtp: code });
}

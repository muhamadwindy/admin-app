import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";
import { loginSchema } from "@/lib/validation";
import { verifyPassword, isLocked, recordFailedLogin, recordSuccessfulLogin, createPendingChallenge } from "@/lib/auth";
import { roleLabel } from "@/lib/rbac";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }
  const { nip, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { nip } });

  if (!user) {
    await logAction({
      actorId: null,
      actorName: nip,
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      entityType: "Session",
      description: `Percobaan masuk gagal untuk NIP ${nip} (akun tidak ditemukan)`,
    });
    return NextResponse.json({ error: "NIP atau kata sandi salah." }, { status: 401 });
  }

  if (user.accountStatus !== "ACTIVE") {
    await logAction({
      actorId: user.id,
      actorName: user.fullName,
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      entityType: "Session",
      description: `Percobaan masuk ditolak untuk ${user.fullName}: status akun ${user.accountStatus}`,
    });
    return NextResponse.json({ error: "Akun tidak aktif. Hubungi Super Admin." }, { status: 403 });
  }

  if (isLocked(user)) {
    const minutesLeft = Math.ceil((user.lockedUntil!.getTime() - Date.now()) / 60000);
    await logAction({
      actorId: user.id,
      actorName: user.fullName,
      action: AUDIT_ACTIONS.LOGIN_LOCKED,
      entityType: "Session",
      description: `Percobaan masuk ditolak untuk ${user.fullName}: akun sedang dibekukan sementara`,
    });
    return NextResponse.json(
      { error: `Akun dibekukan sementara akibat percobaan gagal berulang. Coba lagi dalam ${minutesLeft} menit.` },
      { status: 423 }
    );
  }

  const validPassword = await verifyPassword(password, user.passwordHash);
  if (!validPassword) {
    const result = await recordFailedLogin(user.id);
    await logAction({
      actorId: user.id,
      actorName: user.fullName,
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      entityType: "Session",
      description: `Percobaan masuk gagal untuk ${user.fullName} (kata sandi salah)`,
    });
    if (result.locked) {
      return NextResponse.json(
        { error: "Terlalu banyak percobaan gagal. Akun dibekukan selama 15 menit." },
        { status: 423 }
      );
    }
    return NextResponse.json(
      { error: `NIP atau kata sandi salah. Sisa percobaan: ${result.attemptsLeft}.` },
      { status: 401 }
    );
  }

  if (user.portalRole === "NONE") {
    await logAction({
      actorId: user.id,
      actorName: user.fullName,
      action: AUDIT_ACTIONS.LOGIN_FAILED,
      entityType: "Session",
      description: `${user.fullName} berhasil autentikasi kata sandi namun tidak memiliki akses portal CoreAccess`,
    });
    return NextResponse.json(
      { error: "Akun Anda belum diberikan akses ke portal CoreAccess. Hubungi Super Admin." },
      { status: 403 }
    );
  }

  await recordSuccessfulLogin(user.id);
  const { code } = await createPendingChallenge(user.id);

  await logAction({
    actorId: user.id,
    actorName: user.fullName,
    action: AUDIT_ACTIONS.OTP_SENT,
    entityType: "User",
    entityId: user.id,
    description: `Kode OTP diterbitkan untuk ${user.fullName} (${roleLabel(user.portalRole)})`,
  });

  return NextResponse.json({ ok: true, demoOtp: code });
}

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { employeeFormSchema } from "@/lib/validation";
import { createChangeRequest } from "@/lib/requests";

const statusChangeSchema = z.object({
  type: z.enum(["DEACTIVATE", "DELETE"]),
  reason: z.string().min(15, "Alasan pengajuan minimal 15 karakter").max(500),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  if (!can(session.user.portalRole, "employees:submit_request")) {
    return NextResponse.json({ error: "Anda tidak memiliki izin untuk mengajukan perubahan data pegawai." }, { status: 403 });
  }

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "Pegawai tidak ditemukan." }, { status: 404 });

  const body = await req.json().catch(() => null);
  const type = body?.type;

  const existingPending = await prisma.changeRequest.findFirst({
    where: { targetId: target.id, status: "PENDING" },
  });
  if (existingPending) {
    return NextResponse.json(
      { error: "Sudah ada pengajuan lain yang masih menunggu persetujuan untuk pegawai ini." },
      { status: 409 }
    );
  }

  if (type === "UPDATE") {
    const parsed = employeeFormSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
    }
    const { reason, ...payload } = parsed.data;
    payload.nip = target.nip; // NIP is immutable after creation

    if (payload.email !== target.email) {
      const emailTaken = await prisma.user.findFirst({ where: { email: payload.email, id: { not: target.id } } });
      if (emailTaken) return NextResponse.json({ error: "Email sudah digunakan pegawai lain." }, { status: 409 });
    }

    const request = await createChangeRequest({
      type: "UPDATE",
      targetId: target.id,
      payload,
      reason,
      requesterId: session.user.id,
      requesterName: session.user.fullName,
    });
    return NextResponse.json({ ok: true, requestId: request.id });
  }

  if (type === "DEACTIVATE" || type === "DELETE") {
    const parsed = statusChangeSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
    }
    if (target.accountStatus === "RESIGNED") {
      return NextResponse.json({ error: "Pegawai ini sudah berstatus non-aktif permanen." }, { status: 409 });
    }
    const request = await createChangeRequest({
      type: parsed.data.type,
      targetId: target.id,
      payload: { accountStatus: parsed.data.type === "DEACTIVATE" ? "SUSPENDED" : "RESIGNED" },
      reason: parsed.data.reason,
      requesterId: session.user.id,
      requesterName: session.user.fullName,
    });
    return NextResponse.json({ ok: true, requestId: request.id });
  }

  return NextResponse.json({ error: "Jenis pengajuan tidak dikenali." }, { status: 400 });
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { can } from "@/lib/rbac";
import { employeeFormSchema } from "@/lib/validation";
import { createChangeRequest } from "@/lib/requests";

export async function POST(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  if (!can(session.user.portalRole, "employees:submit_request")) {
    return NextResponse.json({ error: "Anda tidak memiliki izin untuk mengajukan penambahan pegawai." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = employeeFormSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Data tidak valid." }, { status: 400 });
  }

  const { reason, ...payload } = parsed.data;

  const existing = await prisma.user.findFirst({
    where: { OR: [{ nip: payload.nip }, { email: payload.email }] },
  });
  if (existing) {
    return NextResponse.json({ error: "NIP atau email sudah terdaftar pada pegawai lain." }, { status: 409 });
  }

  const request = await createChangeRequest({
    type: "CREATE",
    payload,
    reason,
    requesterId: session.user.id,
    requesterName: session.user.fullName,
  });

  return NextResponse.json({ ok: true, requestId: request.id });
}

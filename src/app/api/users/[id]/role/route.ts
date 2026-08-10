import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { can, roleLabel } from "@/lib/rbac";
import { logAction, AUDIT_ACTIONS } from "@/lib/audit";

const schema = z.object({ portalRole: z.enum(["NONE", "SUPER_ADMIN", "ADMIN", "APPROVER", "AUDITOR"]) });

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  if (!can(session.user.portalRole, "roles:manage")) {
    return NextResponse.json({ error: "Hanya Super Admin yang dapat mengelola peran akses." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Peran tidak valid." }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id: params.id } });
  if (!target) return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });

  if (target.id === session.user.id && parsed.data.portalRole !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Anda tidak dapat mencabut peran Super Admin dari akun Anda sendiri." }, { status: 400 });
  }

  const previousRole = target.portalRole;
  await prisma.user.update({ where: { id: target.id }, data: { portalRole: parsed.data.portalRole } });

  await logAction({
    actorId: session.user.id,
    actorName: session.user.fullName,
    action: AUDIT_ACTIONS.ROLE_CHANGED,
    entityType: "User",
    entityId: target.id,
    description: `${session.user.fullName} mengubah peran akses ${target.fullName} dari ${roleLabel(previousRole)} menjadi ${roleLabel(parsed.data.portalRole)}`,
    metadata: { before: previousRole, after: parsed.data.portalRole },
  });

  return NextResponse.json({ ok: true });
}

import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { buildAuditWhere, AUDIT_ACTIONS, logAction } from "@/lib/audit";
import { formatDateTime } from "@/lib/utils";

function csvEscape(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export async function GET(req: NextRequest) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  if (!can(session.user.portalRole, "audit:view")) {
    return NextResponse.json({ error: "Tidak memiliki izin." }, { status: 403 });
  }

  const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
  const where = buildAuditWhere(searchParams);

  const logs = await prisma.auditLog.findMany({ where, orderBy: { createdAt: "desc" }, take: 5000 });

  const header = ["Waktu", "Pelaku", "Aksi", "Entitas", "Deskripsi", "Alamat IP", "User Agent"];
  const rows = logs.map((l) =>
    [
      formatDateTime(l.createdAt),
      l.actorName,
      l.action,
      `${l.entityType}${l.entityId ? ` #${l.entityId.slice(-6)}` : ""}`,
      l.description,
      l.ipAddress ?? "",
      l.userAgent ?? "",
    ]
      .map(csvEscape)
      .join(",")
  );
  const csv = [header.join(","), ...rows].join("\n");

  await logAction({
    actorId: session.user.id,
    actorName: session.user.fullName,
    action: AUDIT_ACTIONS.AUDIT_EXPORTED,
    entityType: "AuditLog",
    description: `${session.user.fullName} mengekspor ${logs.length} entri jejak audit ke CSV`,
  });

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="jejak-audit-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

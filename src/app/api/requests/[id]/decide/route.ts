import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth";
import { can } from "@/lib/rbac";
import { decideChangeRequest } from "@/lib/requests";

const schema = z.object({
  decision: z.enum(["APPROVED", "REJECTED"]),
  note: z.string().max(500).optional(),
});

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
  if (!can(session.user.portalRole, "requests:decide")) {
    return NextResponse.json({ error: "Anda tidak memiliki izin untuk memutuskan pengajuan ini." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak valid." }, { status: 400 });
  }
  if (parsed.data.decision === "REJECTED" && !parsed.data.note?.trim()) {
    return NextResponse.json({ error: "Alasan penolakan wajib diisi." }, { status: 400 });
  }

  try {
    await decideChangeRequest({
      requestId: params.id,
      approverId: session.user.id,
      approverName: session.user.fullName,
      decision: parsed.data.decision,
      note: parsed.data.note,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Gagal memproses keputusan." }, { status: 400 });
  }
}

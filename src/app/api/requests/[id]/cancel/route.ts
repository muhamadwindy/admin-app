import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth";
import { cancelChangeRequest } from "@/lib/requests";

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });

  try {
    await cancelChangeRequest(params.id, session.user.id, session.user.fullName);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Gagal membatalkan pengajuan." }, { status: 400 });
  }
}

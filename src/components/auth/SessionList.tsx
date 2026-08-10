"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Monitor, ShieldOff } from "lucide-react";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils";

type SessionRow = {
  id: string;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
};

function parseAgent(ua: string | null) {
  if (!ua) return "Perangkat tidak dikenal";
  if (/mobile/i.test(ua)) return "Perangkat seluler";
  if (/Edg/i.test(ua)) return "Microsoft Edge";
  if (/Chrome/i.test(ua)) return "Google Chrome";
  if (/Firefox/i.test(ua)) return "Mozilla Firefox";
  if (/Safari/i.test(ua)) return "Safari";
  return "Peramban lainnya";
}

export function SessionList({ sessions }: { sessions: SessionRow[] }) {
  const router = useRouter();
  const toast = useToast();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function revoke(id: string) {
    setLoadingId(id);
    try {
      const res = await fetch(`/api/sessions/${id}/revoke`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Gagal mencabut sesi", data.error);
        return;
      }
      if (data.self) {
        toast.info("Anda telah keluar dari perangkat ini");
        router.push("/login");
        return;
      }
      toast.success("Sesi dicabut");
      router.refresh();
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="divide-y divide-ink-100">
      {sessions.map((s) => (
        <div key={s.id} className="flex items-center justify-between gap-3 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-ink-100 text-ink-500">
              <Monitor size={15} />
            </div>
            <div>
              <p className="text-[13px] font-medium text-ink-800">
                {parseAgent(s.userAgent)} {s.isCurrent && <span className="ml-1 text-[11px] font-normal text-good-700">(perangkat ini)</span>}
              </p>
              <p className="font-mono text-[11.5px] text-ink-400">
                {s.ipAddress ?? "IP tidak diketahui"} &middot; masuk {formatDateTime(s.createdAt)}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" disabled={loadingId === s.id} onClick={() => revoke(s.id)}>
            <ShieldOff size={14} /> {s.isCurrent ? "Keluar" : "Cabut"}
          </Button>
        </div>
      ))}
    </div>
  );
}

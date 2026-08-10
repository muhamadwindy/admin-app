"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Ban } from "lucide-react";
import { Button } from "@/components/ui";
import { useToast } from "@/components/ui/toast";

export function CancelButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  async function cancel() {
    if (!confirm("Batalkan pengajuan ini?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/requests/${requestId}/cancel`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Gagal membatalkan", data.error);
        return;
      }
      toast.info("Pengajuan dibatalkan");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button size="sm" variant="ghost" disabled={loading} onClick={cancel}>
      <Ban size={14} /> Batalkan
    </Button>
  );
}

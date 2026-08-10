"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui";
import { Textarea } from "@/components/ui/form";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export function DecisionButtons({ requestId }: { requestId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState<"APPROVED" | "REJECTED" | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (open === "REJECTED" && note.trim().length < 10) {
      setError("Alasan penolakan minimal 10 karakter.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/requests/${requestId}/decide`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: open, note }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal memproses keputusan.");
        return;
      }
      toast.success(open === "APPROVED" ? "Pengajuan disetujui" : "Pengajuan ditolak");
      setOpen(null);
      setNote("");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" className="border-bad-700/25 text-bad-700 hover:bg-bad-100" onClick={() => setOpen("REJECTED")}>
          <X size={14} /> Tolak
        </Button>
        <Button size="sm" onClick={() => setOpen("APPROVED")}>
          <Check size={14} /> Setujui
        </Button>
      </div>

      <Dialog
        open={open !== null}
        onOpenChange={(o) => !o && setOpen(null)}
        title={open === "APPROVED" ? "Setujui Pengajuan" : "Tolak Pengajuan"}
        description={
          open === "APPROVED"
            ? "Perubahan akan langsung diterapkan ke data pegawai setelah disetujui."
            : "Pengajuan akan dikembalikan ke pengaju tanpa mengubah data pegawai."
        }
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(null)}>Batal</Button>
            <Button
              variant={open === "REJECTED" ? "danger" : "primary"}
              size="sm"
              disabled={loading}
              onClick={submit}
            >
              {loading ? "Memproses..." : open === "APPROVED" ? "Ya, Setujui" : "Ya, Tolak"}
            </Button>
          </>
        }
      >
        {error && <p className="mb-2 text-[13px] text-bad-700">{error}</p>}
        <label className="mb-1.5 block text-[13px] font-medium text-ink-700">
          Catatan {open === "REJECTED" && <span className="text-bad-600">*</span>}
        </label>
        <Textarea
          rows={3}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={open === "APPROVED" ? "Catatan opsional untuk pengaju..." : "Jelaskan alasan penolakan..."}
        />
      </Dialog>
    </>
  );
}

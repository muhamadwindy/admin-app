"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserX, UserMinus } from "lucide-react";
import { Button } from "@/components/ui";
import { Textarea } from "@/components/ui/form";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";

export function EmployeeActions({ employeeId, disabled }: { employeeId: string; disabled?: boolean }) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState<"DEACTIVATE" | "DELETE" | null>(null);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (reason.trim().length < 15) {
      setError("Alasan pengajuan minimal 15 karakter.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/employees/${employeeId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: open, reason }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim pengajuan.");
        return;
      }
      toast.success("Pengajuan terkirim", "Menunggu keputusan Approver.");
      setOpen(null);
      setReason("");
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
        <Button variant="outline" size="sm" disabled={disabled} onClick={() => setOpen("DEACTIVATE")}>
          <UserX size={14} /> Bekukan Sementara
        </Button>
        <Button variant="danger" size="sm" disabled={disabled} onClick={() => setOpen("DELETE")}>
          <UserMinus size={14} /> Off-boarding Permanen
        </Button>
      </div>

      <Dialog
        open={open !== null}
        onOpenChange={(o) => !o && setOpen(null)}
        title={open === "DEACTIVATE" ? "Ajukan Pembekuan Sementara" : "Ajukan Off-boarding Permanen"}
        description={
          open === "DEACTIVATE"
            ? "Akun akan dibekukan (SUSPENDED) dan seluruh sesi aktif diakhiri setelah disetujui. Dapat diaktifkan kembali."
            : "Akun akan ditandai non-aktif permanen (RESIGNED) dan akses dicabut setelah disetujui. Riwayat data tetap tersimpan untuk kepatuhan."
        }
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setOpen(null)}>Batal</Button>
            <Button variant={open === "DELETE" ? "danger" : "primary"} size="sm" disabled={loading} onClick={submit}>
              {loading ? "Mengirim..." : "Kirim Pengajuan"}
            </Button>
          </>
        }
      >
        {error && <p className="mb-2 text-[13px] text-bad-700">{error}</p>}
        <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Alasan pengajuan</label>
        <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Jelaskan alasan pengajuan ini..." />
      </Dialog>
    </>
  );
}

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowLeft, KeyRound, FlaskConical } from "lucide-react";
import { Button } from "@/components/ui";
import { OtpInput } from "@/components/auth/OtpInput";

const COOLDOWN_S = 30;

export default function VerifyOtpPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    setDemoOtp(sessionStorage.getItem("bsk_demo_otp"));
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  async function submit() {
    if (loading) return;
    if (code.length !== 6) {
      setError("Masukkan 6 digit kode OTP.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Verifikasi gagal.");
        setCode("");
        setLoading(false);
        return;
      }
      sessionStorage.removeItem("bsk_demo_otp");
      router.push(data.mustChangePassword ? "/change-password" : "/dashboard");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setLoading(false);
    }
  }

  async function resend() {
    if (cooldown > 0) return;
    setError(null);
    const res = await fetch("/api/auth/resend-otp", { method: "POST" });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Gagal mengirim ulang kode.");
      return;
    }
    setDemoOtp(data.demoOtp);
    setCode("");
    setCooldown(COOLDOWN_S);
  }

  return (
    <div>
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-brand-600/10 text-brand-600">
        <KeyRound size={19} />
      </div>
      <h1 className="text-[20px] font-semibold text-ink-900">Verifikasi Dua Langkah</h1>
      <p className="mt-1 text-[13px] text-ink-400">
        Masukkan 6 digit kode verifikasi yang dikirimkan ke perangkat terdaftar Anda.
      </p>

      {demoOtp && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-gold-400/40 bg-gold-100 px-3 py-2.5 text-[12.5px] text-gold-600">
          <FlaskConical size={15} className="mt-0.5 flex-shrink-0" />
          <span>
            <strong>Mode demo</strong> — tidak ada gateway SMS/email terpasang di lingkungan portofolio ini, jadi
            kode OTP ditampilkan langsung: <span className="font-mono text-[13px] font-bold">{demoOtp}</span>
          </span>
        </div>
      )}

      {error && (
        <div className="mt-4 flex items-start gap-2 rounded-md border border-bad-700/20 bg-bad-100 px-3 py-2.5 text-[13px] text-bad-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="mt-5">
        <OtpInput value={code} onChange={setCode} invalid={!!error} />
      </div>

      <Button className="mt-5 w-full" onClick={submit} disabled={loading}>
        {loading ? "Memverifikasi..." : "Verifikasi & Masuk"}
      </Button>

      <button
        type="button"
        onClick={resend}
        disabled={cooldown > 0}
        className="mt-3 w-full text-center text-[12.5px] text-ink-400 hover:text-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {cooldown > 0 ? `Kirim ulang kode dalam ${cooldown}d` : "Kirim ulang kode"}
      </button>

      <Link
        href="/login"
        onClick={() => sessionStorage.removeItem("bsk_demo_otp")}
        className="mt-4 flex items-center justify-center gap-1.5 border-t border-ink-100 pt-4 text-[12.5px] text-ink-400 hover:text-brand-600"
      >
        <ArrowLeft size={14} />
        Kembali ke halaman login
      </Link>
    </div>
  );
}

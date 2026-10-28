"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/form";
import { loginSchema } from "@/lib/validation";
import type { z } from "zod";

type FormValues = z.infer<typeof loginSchema>;

const DEMO_ACCOUNTS = [
  { role: "Super Admin (IT)", nip: "BSK-2021-0001", password: "SuperAdmin123" },
  { role: "Admin Operasional (Maker)", nip: "BSK-2021-0002", password: "AdminOps123" },
  { role: "Approver (Checker)", nip: "BSK-2021-0003", password: "Approver123" },
  { role: "Auditor Internal", nip: "BSK-2021-0004", password: "Auditor123" },
];

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(loginSchema) });

  async function onSubmit(values: FormValues) {
    if (loading) return;
    setServerError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.error ?? "Gagal masuk. Silakan coba lagi.");
        setLoading(false);
        return;
      }
      sessionStorage.setItem("bsk_demo_otp", data.demoOtp);
      // Tetap loading sampai pindah halaman: login kedua akan menerbitkan OTP baru dan membatalkan yang tampil.
      router.push("/verify-otp");
    } catch {
      setServerError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="text-[20px] font-semibold text-ink-900">Masuk ke CoreAccess</h1>
      <p className="mt-1 text-[13px] text-ink-400">Gunakan NIP dan kata sandi akun pegawai Anda.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        {serverError && (
          <div className="flex items-start gap-2 rounded-md border border-bad-700/20 bg-bad-100 px-3 py-2.5 text-[13px] text-bad-700">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{serverError}</span>
          </div>
        )}

        <div>
          <label htmlFor="nip" className="mb-1.5 block text-[13px] font-medium text-ink-700">
            NIP (Nomor Induk Pegawai)
          </label>
          <Input
            id="nip"
            placeholder="BSK-2021-0001"
            autoComplete="username"
            aria-invalid={!!errors.nip}
            {...register("nip")}
          />
          {errors.nip && <p className="field-error">{errors.nip.message}</p>}
        </div>

        <div>
          <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-ink-700">
            Kata Sandi
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              aria-invalid={!!errors.password}
              className="pr-9"
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-500"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="field-error">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Memproses..." : "Lanjutkan"}
        </Button>
      </form>

      <div className="mt-6 rounded-md border border-ink-100 bg-white">
        <button
          type="button"
          onClick={() => setShowDemo((s) => !s)}
          className="flex w-full items-center justify-between px-3.5 py-2.5 text-[12.5px] font-medium text-ink-500"
        >
          Kredensial demo untuk peninjau portofolio
          <ChevronDown size={14} className={showDemo ? "rotate-180 transition-transform" : "transition-transform"} />
        </button>
        {showDemo && (
          <div className="space-y-1.5 border-t border-ink-100 px-3.5 py-3">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.nip}
                type="button"
                onClick={() => {
                  setValue("nip", acc.nip);
                  setValue("password", acc.password);
                }}
                className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-[12px] hover:bg-ink-50"
              >
                <span className="text-ink-600">{acc.role}</span>
                <span className="font-mono text-ink-400">{acc.nip}</span>
              </button>
            ))}
            <p className="px-2 pt-1 text-[11px] text-ink-300">Klik salah satu untuk mengisi form otomatis.</p>
          </div>
        )}
      </div>
    </div>
  );
}

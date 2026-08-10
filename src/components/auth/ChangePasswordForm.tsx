"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { Input } from "@/components/ui/form";
import { changePasswordSchema } from "@/lib/validation";
import { useToast } from "@/components/ui/toast";
import type { z } from "zod";

type FormValues = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(changePasswordSchema) });

  async function onSubmit(values: FormValues) {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal memperbarui kata sandi.");
        return;
      }
      reset();
      toast.success("Kata sandi diperbarui", "Sesi lain pada perangkat berbeda telah diakhiri demi keamanan.");
      if (redirectTo) {
        router.push(redirectTo);
        router.refresh();
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error && (
        <div className="flex items-start gap-2 rounded-md border border-bad-700/20 bg-bad-100 px-3 py-2.5 text-[13px] text-bad-700">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Kata Sandi Saat Ini</label>
        <Input type="password" autoComplete="current-password" aria-invalid={!!errors.currentPassword} {...register("currentPassword")} />
        {errors.currentPassword && <p className="field-error">{errors.currentPassword.message}</p>}
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Kata Sandi Baru</label>
        <Input type="password" autoComplete="new-password" aria-invalid={!!errors.newPassword} {...register("newPassword")} />
        {errors.newPassword ? (
          <p className="field-error">{errors.newPassword.message}</p>
        ) : (
          <p className="mt-1 text-xs text-ink-400">Minimal 10 karakter, kombinasi huruf besar, huruf kecil, dan angka.</p>
        )}
      </div>
      <div>
        <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Konfirmasi Kata Sandi Baru</label>
        <Input type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register("confirmPassword")} />
        {errors.confirmPassword && <p className="field-error">{errors.confirmPassword.message}</p>}
      </div>
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "Menyimpan..." : "Perbarui Kata Sandi"}
      </Button>
    </form>
  );
}

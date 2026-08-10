import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { getCurrentSession } from "@/lib/auth";
import { ChangePasswordForm } from "@/components/auth/ChangePasswordForm";

export default async function ForcedChangePasswordPage() {
  const session = await getCurrentSession();
  if (!session) redirect("/login");
  if (!session.user.mustChangePassword) redirect("/dashboard");

  return (
    <div>
      <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-md bg-warn-100 text-warn-700">
        <ShieldAlert size={19} />
      </div>
      <h1 className="text-[20px] font-semibold text-ink-900">Wajib Perbarui Kata Sandi</h1>
      <p className="mt-1 text-[13px] text-ink-400">
        Akun ini menggunakan kata sandi sementara. Buat kata sandi baru sebelum melanjutkan ke portal.
      </p>
      <div className="mt-6">
        <ChangePasswordForm redirectTo="/dashboard" />
      </div>
    </div>
  );
}

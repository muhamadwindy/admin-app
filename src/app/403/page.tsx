import Link from "next/link";
import { ShieldAlert } from "lucide-react";

export default function ForbiddenPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-bad-100 text-bad-700">
        <ShieldAlert size={26} />
      </div>
      <h1 className="text-[20px] font-semibold text-ink-900">Akses Ditolak</h1>
      <p className="mt-2 max-w-sm text-[13.5px] text-ink-400">
        Peran akses Anda saat ini tidak memiliki izin untuk membuka halaman ini.
      </p>
      <Link href="/dashboard" className="btn btn-primary btn-md mt-6">
        Kembali ke Dashboard
      </Link>
    </div>
  );
}

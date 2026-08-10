import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-ink-100 text-ink-500">
        <FileQuestion size={26} />
      </div>
      <h1 className="text-[20px] font-semibold text-ink-900">Halaman Tidak Ditemukan</h1>
      <p className="mt-2 max-w-sm text-[13.5px] text-ink-400">
        Halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <Link href="/dashboard" className="btn btn-primary btn-md mt-6">
        Kembali ke Dashboard
      </Link>
    </div>
  );
}

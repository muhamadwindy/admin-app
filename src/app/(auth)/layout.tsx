import { Landmark, ShieldCheck, ScrollText, UsersRound } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[42%] flex-col justify-between overflow-hidden bg-ink-950 px-10 py-10 text-white lg:flex">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]"
          viewBox="0 0 400 800"
          fill="none"
        >
          {Array.from({ length: 14 }).map((_, i) => (
            <line key={i} x1={-100} y1={i * 60} x2={500} y2={i * 60 - 260} stroke="white" strokeWidth="1" />
          ))}
        </svg>

        <div className="relative flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-gold-400 text-ink-950">
            <Landmark size={19} strokeWidth={2.4} />
          </div>
          <div className="leading-tight">
            <p className="text-[15px] font-semibold text-white">CoreAccess</p>
            <p className="text-[11px] text-ink-400">Bank Sulistiyo Kusumo</p>
          </div>
        </div>

        <div className="relative">
          <h2 className="max-w-sm text-[26px] font-semibold leading-snug text-white">
            Identitas & akses pegawai, terkendali dan tercatat.
          </h2>
          <p className="mt-3 max-w-sm text-[13.5px] leading-relaxed text-ink-300">
            Setiap penambahan, perubahan, dan penonaktifan akun pegawai melalui persetujuan berjenjang
            sebelum berlaku — dengan jejak audit penuh untuk kebutuhan kepatuhan.
          </p>

          <div className="mt-8 space-y-4">
            <Feature icon={UsersRound} text="Direktori pegawai & kontrol akses berbasis peran" />
            <Feature icon={ShieldCheck} text="Alur maker–checker untuk setiap perubahan data" />
            <Feature icon={ScrollText} text="Jejak audit menyeluruh, tidak dapat diubah" />
          </div>
        </div>

        <p className="relative text-[11px] text-ink-500">
          Sistem internal. Aktivitas login dan akses Anda dicatat untuk keperluan keamanan informasi.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-canvas px-6 py-12">
        <div className="w-full max-w-[380px]">{children}</div>
      </div>
    </div>
  );
}

function Feature({ icon: Icon, text }: { icon: React.ElementType; text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-white/[0.06]">
        <Icon size={15} className="text-gold-400" />
      </div>
      <p className="text-[13px] text-ink-300">{text}</p>
    </div>
  );
}

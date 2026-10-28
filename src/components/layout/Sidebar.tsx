"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark } from "lucide-react";
import { cn } from "@/lib/utils";
import { can } from "@/lib/rbac";
import { NAV } from "@/lib/nav";

export function Sidebar({ role, pendingCount = 0 }: { role: string; pendingCount?: number }) {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-ink-100 bg-ink-950 text-ink-100 md:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gold-400 text-ink-950">
          <Landmark size={17} strokeWidth={2.4} />
        </div>
        <div className="leading-tight">
          <p className="text-[13.5px] font-semibold tracking-tight text-white">CoreAccess</p>
          <p className="text-[10.5px] text-ink-400">Bank Sulistiyo Kusumo</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-2">
        {NAV.filter((item) => can(role, item.permission)).map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-colors",
                active ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={16} strokeWidth={2} className={active ? "text-gold-400" : "text-ink-400"} />
              <span className="flex-1">{item.label}</span>
              {item.href === "/approvals" && pendingCount > 0 && (
                <span className="rounded-full bg-gold-400 px-1.5 py-0.5 text-[10px] font-bold text-ink-950">
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mx-3 mb-4 rounded-md border border-white/10 bg-white/[0.04] p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-400">Sistem Internal</p>
        <p className="mt-1 text-[11.5px] leading-relaxed text-ink-400">
          Seluruh aktivitas pada portal ini dicatat dalam jejak audit sesuai kebijakan keamanan informasi BSK.
        </p>
      </div>
    </aside>
  );
}

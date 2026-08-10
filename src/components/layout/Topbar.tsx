"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown, LogOut, UserCircle, Menu } from "lucide-react";
import { Avatar } from "@/components/ui";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown";
import { useToast } from "@/components/ui/toast";
import { can, roleLabel } from "@/lib/rbac";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function Topbar({
  user,
}: {
  user: { fullName: string; position: string; nip: string; portalRole: string };
}) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.info("Anda telah keluar", "Sesi Anda telah diakhiri dengan aman.");
    router.push("/login");
    router.refresh();
  }

  const activeItem = NAV.find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));

  return (
    <header className="sticky top-0 z-20 flex h-14 flex-shrink-0 items-center justify-between border-b border-ink-100 bg-white/90 px-4 backdrop-blur sm:px-6">
      <div className="flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-md p-1.5 text-ink-500 hover:bg-ink-100 md:hidden">
            <Menu size={18} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {NAV.filter((item) => can(user.portalRole, item.permission)).map((item) => (
              <DropdownMenuItem key={item.href} asChild>
                <Link href={item.href}>{item.label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <h1 className="text-[14.5px] font-semibold text-ink-900">{activeItem?.label ?? "CoreAccess"}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className={cn("flex items-center gap-2 rounded-md py-1 pl-1 pr-2 hover:bg-ink-50")}>
          <Avatar name={user.fullName} size={30} />
          <div className="hidden text-left leading-tight sm:block">
            <p className="text-[13px] font-medium text-ink-800">{user.fullName}</p>
            <p className="text-[11px] text-ink-400">{roleLabel(user.portalRole)}</p>
          </div>
          <ChevronDown size={14} className="text-ink-300" />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <div className="px-2.5 py-2">
            <p className="text-[13px] font-semibold text-ink-800">{user.fullName}</p>
            <p className="font-mono text-[11px] text-ink-400">{user.nip}</p>
            <p className="text-[11.5px] text-ink-400">{user.position}</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <UserCircle size={15} /> Profil & Sesi Saya
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={logout} className="text-bad-700">
            <LogOut size={15} /> Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

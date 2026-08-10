"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui";
import { Select } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { ROLE_LABEL } from "@/lib/rbac";
import type { PortalRole } from "@/types/enums";

const ROLES: PortalRole[] = ["NONE", "SUPER_ADMIN", "ADMIN", "APPROVER", "AUDITOR"];

export function RoleAssignRow({
  userId,
  fullName,
  nip,
  position,
  currentRole,
  isSelf,
}: {
  userId: string;
  fullName: string;
  nip: string;
  position: string;
  currentRole: string;
  isSelf: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [role, setRole] = useState(currentRole as PortalRole);
  const [loading, setLoading] = useState(false);

  async function change(next: PortalRole) {
    setRole(next);
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}/role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portalRole: next }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error("Gagal mengubah peran", data.error);
        setRole(currentRole as PortalRole);
        return;
      }
      toast.success(`Peran ${fullName} diperbarui ke ${ROLE_LABEL[next]}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <div className="flex items-center gap-2.5">
        <Avatar name={fullName} size={30} />
        <div>
          <p className="text-[13px] font-medium text-ink-800">
            {fullName} {isSelf && <span className="text-[11px] font-normal text-ink-400">(Anda)</span>}
          </p>
          <p className="font-mono text-[11.5px] text-ink-400">{nip} &middot; {position}</p>
        </div>
      </div>
      <Select
        value={role}
        disabled={loading || (isSelf && role === "SUPER_ADMIN")}
        onChange={(e) => change(e.target.value as PortalRole)}
        className="w-auto min-w-[190px]"
      >
        {ROLES.map((r) => (
          <option key={r} value={r}>{ROLE_LABEL[r]}</option>
        ))}
      </Select>
    </div>
  );
}

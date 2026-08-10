import * as React from "react";
import { cn } from "@/lib/utils";
import { initials } from "@/lib/utils";
import { Inbox } from "lucide-react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md";

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return (
    <button
      className={cn("btn", `btn-${variant}`, `btn-${size}`, className)}
      {...props}
    />
  );
}

export function Panel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("panel", className)} {...props} />;
}

const ACCOUNT_STATUS_CHIP: Record<string, string> = {
  ACTIVE: "status-chip-active",
  SUSPENDED: "status-chip-suspended",
  RESIGNED: "status-chip-resigned",
};
const ACCOUNT_STATUS_LABEL: Record<string, string> = {
  ACTIVE: "Aktif",
  SUSPENDED: "Dibekukan",
  RESIGNED: "Non-aktif",
};

export function AccountStatusChip({ status }: { status: string }) {
  return (
    <span className={cn("status-chip", ACCOUNT_STATUS_CHIP[status] ?? "status-chip-cancelled")}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {ACCOUNT_STATUS_LABEL[status] ?? status}
    </span>
  );
}

const REQUEST_STATUS_CHIP: Record<string, string> = {
  PENDING: "status-chip-pending",
  APPROVED: "status-chip-approved",
  REJECTED: "status-chip-rejected",
  CANCELLED: "status-chip-cancelled",
};
const REQUEST_STATUS_LABEL: Record<string, string> = {
  PENDING: "Menunggu Persetujuan",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
  CANCELLED: "Dibatalkan",
};

export function RequestStatusChip({ status }: { status: string }) {
  return (
    <span className={cn("status-chip", REQUEST_STATUS_CHIP[status] ?? "status-chip-cancelled")}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {REQUEST_STATUS_LABEL[status] ?? status}
    </span>
  );
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <div
      className="flex flex-shrink-0 items-center justify-center rounded-full bg-brand-600/10 font-semibold text-brand-700"
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials(name)}
    </div>
  );
}

export function StatCard({
  label,
  value,
  hint,
  tone = "default",
  icon,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "default" | "warn" | "good" | "bad";
  icon?: React.ReactNode;
}) {
  const toneClass = {
    default: "text-ink-900",
    warn: "text-warn-700",
    good: "text-good-700",
    bad: "text-bad-700",
  }[tone];
  return (
    <Panel className="p-4">
      <div className="flex items-start justify-between">
        <p className="label-caps">{label}</p>
        {icon && <div className="text-ink-300">{icon}</div>}
      </div>
      <p className={cn("mt-2 font-mono text-2xl font-semibold tabular-nums", toneClass)}>{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-400">{hint}</p>}
    </Panel>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-ink-200 px-6 py-14 text-center">
      <div className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-ink-100 text-ink-400">
        {icon ?? <Inbox size={20} />}
      </div>
      <p className="text-sm font-semibold text-ink-700">{title}</p>
      {description && <p className="max-w-sm text-[13px] text-ink-400">{description}</p>}
      {action}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-ink-100", className)} />;
}

export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-ink-700">
        {label} {required && <span className="text-bad-600">*</span>}
      </label>
      {children}
      {error ? <p className="field-error">{error}</p> : hint ? <p className="mt-1 text-xs text-ink-400">{hint}</p> : null}
    </div>
  );
}

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-md border border-ink-200 bg-ink-50 px-2 py-0.5 text-[11px] font-medium text-ink-600", className)}>
      {children}
    </span>
  );
}

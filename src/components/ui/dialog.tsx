"use client";

import * as React from "react";
import * as RadixDialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}) {
  const widthClass = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }[size];
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-ink-950/40 backdrop-blur-[1px] data-[state=open]:animate-fade-in" />
        <RadixDialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-ink-100 bg-white shadow-popover data-[state=open]:animate-slide-up",
            widthClass
          )}
        >
          <div className="flex items-start justify-between border-b border-ink-100 px-5 py-4">
            <div>
              <RadixDialog.Title className="text-[15px] font-semibold text-ink-900">{title}</RadixDialog.Title>
              {description && (
                <RadixDialog.Description className="mt-0.5 text-[13px] text-ink-400">
                  {description}
                </RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close className="rounded-md p-1 text-ink-300 hover:bg-ink-100 hover:text-ink-600">
              <X size={16} />
            </RadixDialog.Close>
          </div>
          <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
          {footer && <div className="flex items-center justify-end gap-2 border-t border-ink-100 px-5 py-3.5">{footer}</div>}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
}

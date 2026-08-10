"use client";

import * as React from "react";
import * as RadixToast from "@radix-ui/react-toast";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error" | "info" | "warning";
type ToastItem = { id: number; title: string; description?: string; variant: ToastVariant };

const ToastCtx = React.createContext<{ push: (t: Omit<ToastItem, "id">) => void } | null>(null);

const ICONS: Record<ToastVariant, React.ElementType> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES: Record<ToastVariant, string> = {
  success: "border-good-700/20 bg-good-100 text-good-700",
  error: "border-bad-700/20 bg-bad-100 text-bad-700",
  warning: "border-warn-700/20 bg-warn-100 text-warn-700",
  info: "border-ink-200 bg-white text-ink-700",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<ToastItem[]>([]);
  const idRef = React.useRef(0);

  const push = React.useCallback((t: Omit<ToastItem, "id">) => {
    idRef.current += 1;
    const id = idRef.current;
    setItems((prev) => [...prev, { ...t, id }]);
  }, []);

  return (
    <ToastCtx.Provider value={{ push }}>
      <RadixToast.Provider swipeDirection="right" duration={4200}>
        {children}
        {items.map((item) => {
          const Icon = ICONS[item.variant];
          return (
            <RadixToast.Root
              key={item.id}
              className={cn(
                "panel data-[state=open]:animate-slide-up flex w-80 items-start gap-2.5 rounded-lg border p-3.5 shadow-popover",
                STYLES[item.variant]
              )}
              onOpenChange={(open) => {
                if (!open) setItems((prev) => prev.filter((i) => i.id !== item.id));
              }}
            >
              <Icon size={18} className="mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <RadixToast.Title className="text-[13px] font-semibold leading-snug">
                  {item.title}
                </RadixToast.Title>
                {item.description && (
                  <RadixToast.Description className="mt-0.5 text-[12px] leading-snug opacity-90">
                    {item.description}
                  </RadixToast.Description>
                )}
              </div>
              <RadixToast.Close className="flex-shrink-0 opacity-60 hover:opacity-100">
                <X size={14} />
              </RadixToast.Close>
            </RadixToast.Root>
          );
        })}
        <RadixToast.Viewport className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 outline-none" />
      </RadixToast.Provider>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return {
    toast: ctx.push,
    success: (title: string, description?: string) => ctx.push({ title, description, variant: "success" }),
    error: (title: string, description?: string) => ctx.push({ title, description, variant: "error" }),
    info: (title: string, description?: string) => ctx.push({ title, description, variant: "info" }),
    warning: (title: string, description?: string) => ctx.push({ title, description, variant: "warning" }),
  };
}

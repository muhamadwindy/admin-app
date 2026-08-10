"use client";

import * as RadixDropdown from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = RadixDropdown.Root;
export const DropdownMenuTrigger = RadixDropdown.Trigger;

export function DropdownMenuContent({
  children,
  align = "end",
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "end" | "center";
  className?: string;
}) {
  return (
    <RadixDropdown.Portal>
      <RadixDropdown.Content
        align={align}
        sideOffset={6}
        className={cn(
          "z-50 min-w-[190px] rounded-lg border border-ink-100 bg-white p-1 shadow-popover data-[state=open]:animate-slide-up",
          className
        )}
      >
        {children}
      </RadixDropdown.Content>
    </RadixDropdown.Portal>
  );
}

export function DropdownMenuItem({
  children,
  className,
  ...props
}: React.ComponentProps<typeof RadixDropdown.Item>) {
  return (
    <RadixDropdown.Item
      className={cn(
        "flex cursor-pointer select-none items-center gap-2 rounded-md px-2.5 py-2 text-[13px] text-ink-700 outline-none",
        "hover:bg-ink-50 focus:bg-ink-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-40",
        className
      )}
      {...props}
    >
      {children}
    </RadixDropdown.Item>
  );
}

export const DropdownMenuSeparator = () => <RadixDropdown.Separator className="my-1 h-px bg-ink-100" />;

"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";

export function OtpInput({
  value,
  onChange,
  invalid,
}: {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, " ").split("").slice(0, 6);

  function setDigit(index: number, char: string) {
    const clean = char.replace(/[^0-9]/g, "");
    const next = value.split("");
    next[index] = clean;
    const joined = next.join("").slice(0, 6).replace(/ /g, "");
    onChange(joined);
    if (clean && index < 5) refs.current[index + 1]?.focus();
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    if (pasted) {
      e.preventDefault();
      onChange(pasted);
      refs.current[Math.min(pasted.length, 5)]?.focus();
    }
  }

  return (
    <div className="flex gap-2" onPaste={handlePaste}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d.trim()}
          onChange={(e) => setDigit(i, e.target.value.slice(-1))}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !digits[i].trim() && i > 0) refs.current[i - 1]?.focus();
          }}
          inputMode="numeric"
          maxLength={1}
          aria-label={`Digit OTP ${i + 1}`}
          className={cn(
            "h-12 w-11 rounded-md border text-center font-mono text-lg font-semibold text-ink-900",
            "focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500",
            invalid ? "border-bad-600" : "border-ink-200"
          )}
        />
      ))}
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  borderWidth?: number;
  anchor?: number;
  colorFrom?: string;
  colorTo?: string;
  delay?: number;
}

export function BorderBeam({
  className,
  size = 200,
  duration = 15,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  delay = 0,
}: BorderBeamProps) {
  return (
    <div
      style={
        {
          "--size": size,
          "--duration": duration,
          "--anchor": anchor,
          "--border-width": borderWidth,
          "--color-from": colorFrom,
          "--color-to": colorTo,
          "--delay": `-${delay}s`,
          border: `calc(var(--border-width) * 1px) solid transparent`,
          background: `linear-gradient(transparent, transparent), linear-gradient(to right, var(--color-from), var(--color-to))`,
          backgroundClip: "padding-box, border-box",
          backgroundOrigin: "border-box",
        } as React.CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit]",
        className
      )}
    >
      <div
        className="absolute inset-0 rounded-[inherit] animate-[border-beam_calc(var(--duration)*1s)_ease-in-out_infinite]"
        style={{
          border: `calc(var(--border-width) * 1px) solid transparent`,
          background: `linear-gradient(to right, var(--color-from), var(--color-to))`,
          backgroundClip: "border-box",
        }}
      />
    </div>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function ShimmerButton({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={cn(
        "group/btn relative inline-flex h-11 animate-shimmer items-center justify-center rounded-md border border-slate-800 bg-[linear-gradient(110deg,#000103,45%,#1e2631,55%,#000103)] bg-[length:200%_100%] px-6 font-medium text-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2 focus:ring-offset-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-300",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

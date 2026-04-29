import * as React from "react";
import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-white/20 bg-white/5 px-3 text-sm outline-none ring-0 placeholder:text-slate-300 focus:border-cyan-300",
        className,
      )}
      {...props}
    />
  );
}

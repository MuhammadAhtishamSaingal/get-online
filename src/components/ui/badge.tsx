import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "new" | "sale" | "warning" | "success" | "neutral";
}

export function Badge({
  className,
  variant = "default",
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider transition-colors",
        {
          "bg-brand-primary text-white": variant === "default",
          "bg-blue-100 text-blue-800 border border-blue-200": variant === "new",
          "bg-brand-accent text-white": variant === "sale",
          "bg-amber-100 text-amber-800 border border-amber-200": variant === "warning",
          "bg-green-100 text-green-800 border border-green-200": variant === "success",
          "bg-neutral-100 text-neutral-800 border border-neutral-200": variant === "neutral",
        },
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

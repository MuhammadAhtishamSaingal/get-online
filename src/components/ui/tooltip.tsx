"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className={cn(
            "absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 rounded-custom-md bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white shadow-md transition-opacity duration-150 animate-fade-in text-center leading-normal",
            className
          )}
          role="tooltip"
        >
          {content}
          <div className="absolute top-full left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-neutral-900" />
        </div>
      )}
    </div>
  );
}

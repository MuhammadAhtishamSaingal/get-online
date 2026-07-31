"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface VariantSelectorProps {
  options: string[];
  selectedValue: string;
  onChange: (value: string) => void;
  type?: "color" | "chip";
  className?: string;
}

// Simple color mapping for common accessories colors
const COLOR_MAP: Record<string, string> = {
  "Phantom Black": "bg-neutral-900 border-neutral-950",
  "White": "bg-white border-neutral-200",
  "Space Grey": "bg-neutral-600 border-neutral-700",
  "Titanium Grey": "bg-neutral-400 border-neutral-500",
  "Royal Blue": "bg-blue-600 border-blue-700",
};

export function VariantSelector({
  options,
  selectedValue,
  onChange,
  type = "chip",
  className,
}: VariantSelectorProps) {
  return (
    <div className={cn("flex flex-wrap gap-2.5", className)}>
      {options.map((option) => {
        const isSelected = selectedValue === option;

        if (type === "color") {
          const colorClass = COLOR_MAP[option] || "bg-neutral-200 border-neutral-300";
          return (
            <button
              key={option}
              type="button"
              onClick={() => onChange(option)}
              className={cn(
                "relative flex h-8 w-8 items-center justify-center rounded-full border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 hover:scale-105 active:scale-95",
                colorClass,
                isSelected ? "ring-2 ring-brand-primary ring-offset-2" : "hover:border-neutral-400"
              )}
              title={option}
              aria-label={`Select color ${option}`}
              aria-pressed={isSelected}
            >
              {isSelected && (
                <Check
                  className={cn(
                    "h-3.5 w-3.5",
                    option === "White" ? "text-neutral-900" : "text-white"
                  )}
                />
              )}
            </button>
          );
        }

        // Standard chip button
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={cn(
              "inline-flex h-9 items-center justify-center rounded-custom-md border px-4 text-xs font-semibold uppercase tracking-wider transition-all focus:outline-none focus:ring-1 focus:ring-brand-primary hover:bg-neutral-50 hover:border-neutral-300 active:scale-[0.98]",
              isSelected
                ? "border-brand-primary bg-brand-primary-light text-brand-primary focus:ring-brand-primary"
                : "border-neutral-200 bg-white text-neutral-800"
            )}
            aria-pressed={isSelected}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

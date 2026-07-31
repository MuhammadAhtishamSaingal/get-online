"use client";

import * as React from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  className?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
  className,
}: QuantityStepperProps) {
  const handleDecrement = () => {
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max && !disabled) {
      onChange(value + 1);
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-custom-md border border-neutral-200 bg-white h-9 overflow-hidden shadow-sm",
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min || disabled}
        className="flex h-full w-9 items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 active:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors focus-visible:outline-none focus-visible:bg-neutral-100"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      
      <span
        className="flex h-full w-10 items-center justify-center text-xs font-bold text-neutral-900 select-none border-x border-neutral-150"
        aria-live="polite"
      >
        {value}
      </span>
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max || disabled}
        className="flex h-full w-9 items-center justify-center text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900 active:bg-neutral-100 disabled:opacity-40 disabled:hover:bg-transparent transition-colors focus-visible:outline-none focus-visible:bg-neutral-100"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

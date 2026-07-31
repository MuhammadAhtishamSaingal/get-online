"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  position?: "left" | "right";
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  position = "right",
}: DrawerProps) {
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Close drawer on escape key
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
      // Auto focus close button for accessibility
      setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 50);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Overlay backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Drawer content panel */}
      <div
        className={cn(
          "relative z-50 flex h-full w-full max-w-md flex-col bg-white shadow-xl outline-none transition-transform duration-300",
          {
            "left-0 mr-auto animate-[slide-in_0.3s_cubic-bezier(0.16,1,0.3,1)]":
              position === "left",
            "right-0 ml-auto animate-[slide-in_0.3s_cubic-bezier(0.16,1,0.3,1)]":
              position === "right",
          }
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "drawer-title" : undefined}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-5">
          {title ? (
            <h2 id="drawer-title" className="font-display text-lg font-semibold tracking-tight text-neutral-900">
              {title}
            </h2>
          ) : (
            <div />
          )}
          <button
            ref={closeButtonRef}
            onClick={onClose}
            className="rounded-custom-md p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-900 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

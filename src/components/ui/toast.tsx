"use client";

import * as React from "react";
import { X, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined);

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const showToast = React.useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 4000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast container floating layout */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 w-full max-w-sm">
        {toasts.map((toast) => {
          return (
            <div
              key={toast.id}
              className={cn(
                "flex items-start gap-3 rounded-custom-lg border p-4 shadow-lg transition-all duration-300 animate-[slide-in_0.3s_cubic-bezier(0.16,1,0.3,1)] bg-white",
                {
                  "border-green-100 bg-green-50/50 text-green-900": toast.type === "success",
                  "border-red-100 bg-red-50/50 text-red-900": toast.type === "error",
                  "border-blue-100 bg-blue-50/50 text-blue-900": toast.type === "info",
                }
              )}
              role="alert"
            >
              {/* Icon */}
              <div className="flex-shrink-0 mt-0.5">
                {toast.type === "success" && <CheckCircle2 className="h-5 w-5 text-green-600" />}
                {toast.type === "error" && <AlertCircle className="h-5 w-5 text-red-600" />}
                {toast.type === "info" && <Info className="h-5 w-5 text-blue-600" />}
              </div>

              {/* Message */}
              <div className="flex-grow text-xs sm:text-sm font-medium leading-relaxed">
                {toast.message}
              </div>

              {/* Close Button */}
              <button
                onClick={() => removeToast(toast.id)}
                className="flex-shrink-0 rounded-custom-md p-1 hover:bg-neutral-200/50 text-neutral-400 hover:text-neutral-900 transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

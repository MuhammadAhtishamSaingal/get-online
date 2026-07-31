import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link" | "destructive";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center font-medium transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97] hover:scale-[1.01] hover:shadow-sm",
          // Variants
          {
            "bg-brand-primary text-white hover:bg-brand-primary-hover shadow-sm":
              variant === "primary",
            "bg-neutral-100 text-neutral-900 hover:bg-neutral-200":
              variant === "secondary",
            "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 hover:border-neutral-300":
              variant === "outline",
            "text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900":
              variant === "ghost",
            "text-brand-primary underline-offset-4 hover:underline bg-transparent p-0":
              variant === "link",
            "bg-brand-accent text-white hover:bg-brand-accent-hover shadow-sm":
              variant === "destructive",
          },
          // Sizes
          {
            "h-9 px-3 text-sm rounded-custom-md": size === "sm",
            "h-11 px-5 text-sm md:text-base rounded-custom-md": size === "md",
            "h-12 px-6 text-base rounded-custom-lg": size === "lg",
            "h-10 w-10 rounded-custom-md": size === "icon",
          },
          className
        )}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };

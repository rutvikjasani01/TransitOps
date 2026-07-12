"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost" | "glass";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer select-none active:scale-[0.97]";

    const variants = {
      primary:
        "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-[0_4px_14px_rgba(99,102,241,0.3)] hover:scale-[1.015]",
      secondary:
        "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border/60 hover:scale-[1.015]",
      outline:
        "border border-border/70 bg-background/60 text-foreground hover:bg-accent hover:border-border hover:scale-[1.015]",
      destructive:
        "bg-rose-500 text-white hover:bg-rose-600 shadow-sm hover:shadow-[0_4px_14px_rgba(239,68,68,0.3)] hover:scale-[1.015]",
      ghost:
        "text-foreground hover:bg-accent/60 hover:text-foreground",
      glass:
        "glass-panel text-foreground hover:border-white/30 dark:hover:border-white/20 shadow-sm hover:scale-[1.015]",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 text-sm gap-2",
      lg: "h-11 px-5 text-sm gap-2",
      icon: "h-9 w-9 text-sm",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading && (
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent shrink-0" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

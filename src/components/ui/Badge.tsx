import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "destructive" | "outline" | "ghost";
  dot?: boolean;
}

export function Badge({ className, variant = "primary", dot = false, ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 select-none";
  
  const variants = {
    primary:
      "bg-blue-500/12 text-blue-600 border border-blue-500/25 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/25",
    secondary:
      "bg-secondary text-secondary-foreground border border-border/60",
    success:
      "bg-emerald-500/12 text-emerald-700 border border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/25",
    warning:
      "bg-amber-500/12 text-amber-700 border border-amber-500/25 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/25",
    destructive:
      "bg-rose-500/12 text-rose-700 border border-rose-500/25 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/25",
    outline:
      "text-foreground border border-border bg-transparent",
    ghost:
      "bg-muted/50 text-muted-foreground border border-border/40",
  };

  const dotColors: Record<string, string> = {
    primary: "bg-blue-500",
    secondary: "bg-secondary-foreground/50",
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    destructive: "bg-rose-500",
    outline: "bg-foreground/50",
    ghost: "bg-muted-foreground/50",
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full shrink-0", dotColors[variant])} />
      )}
      {props.children}
    </span>
  );
}

import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "success" | "warning" | "destructive" | "outline" | "ghost";
}

export function Badge({ className, variant = "primary", ...props }: BadgeProps) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  
  const variants = {
    primary: "bg-primary/10 text-primary border border-primary/20",
    secondary: "bg-secondary text-secondary-foreground border border-border/50",
    success: "bg-success/10 text-success border border-success/20 dark:bg-success/20 dark:text-success-foreground",
    warning: "bg-warning/10 text-warning border border-warning/20 dark:bg-warning/20 dark:text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive border border-destructive/20 dark:bg-destructive/20 dark:text-destructive-foreground",
    outline: "text-foreground border border-border",
    ghost: "bg-background/20 backdrop-blur-md border border-white/10 text-foreground"
  };

  return (
    <span
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    />
  );
}

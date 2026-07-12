"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "destructive" | "ghost" | "glass";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer";
    
    const variants = {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
      outline: "border border-input bg-background/50 hover:bg-accent hover:text-accent-foreground",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
      ghost: "hover:bg-accent hover:text-accent-foreground",
      glass: "glass-panel text-foreground hover:bg-white/10 dark:hover:bg-white/5 border border-white/20 dark:border-white/10 shadow-sm"
    };

    const sizes = {
      sm: "h-8 px-3 text-xs",
      md: "h-10 px-4 py-2 text-sm",
      lg: "h-12 px-6 text-base",
      icon: "h-10 w-10"
    };

    return (
      <motion.button
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

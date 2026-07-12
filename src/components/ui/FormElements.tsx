"use client";

import React from "react";
import { cn } from "@/lib/utils";

// LABEL
export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-xs font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-foreground/75 uppercase tracking-wide",
        className
      )}
      {...props}
    />
  );
}

// INPUT
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-xl border border-border/70 bg-background/60 px-3.5 py-2 text-sm",
            "ring-offset-background placeholder:text-muted-foreground/60",
            "focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200 hover:border-border",
            "file:border-0 file:bg-transparent file:text-sm file:font-medium",
            error && "border-rose-400/60 focus:ring-rose-400/25 focus:border-rose-400/60",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
            <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// TEXTAREA
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          className={cn(
            "flex min-h-[90px] w-full rounded-xl border border-border/70 bg-background/60 px-3.5 py-2.5 text-sm",
            "ring-offset-background placeholder:text-muted-foreground/60",
            "focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200 hover:border-border resize-none",
            error && "border-rose-400/60 focus:ring-rose-400/25 focus:border-rose-400/60",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
            <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
            {error}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

// SELECT
export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, children, ...props }, ref) => {
    return (
      <div className="w-full">
        <select
          className={cn(
            "flex h-10 w-full rounded-xl border border-border/70 bg-background/60 px-3.5 py-2 text-sm",
            "ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary/25 focus:border-primary/60",
            "disabled:cursor-not-allowed disabled:opacity-50",
            "transition-all duration-200 hover:border-border text-foreground",
            "appearance-none",
            "bg-[url('data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%236b7280%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')]",
            "bg-[length:1rem] bg-[right_0.75rem_center] bg-no-repeat pr-9",
            error && "border-rose-400/60 focus:ring-rose-400/25 focus:border-rose-400/60",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {error && (
          <p className="mt-1.5 text-xs text-rose-500 font-medium flex items-center gap-1">
            <span className="inline-block h-1 w-1 rounded-full bg-rose-500" />
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

// SWITCH / CHECKBOX
export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, id, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={id}
          className={cn(
            "h-4 w-4 rounded border-border text-primary focus:ring-primary/20",
            "transition-all cursor-pointer bg-background/60 accent-primary",
            className
          )}
          ref={ref}
          {...props}
        />
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-foreground/80 cursor-pointer select-none">
            {label}
          </label>
        )}
      </div>
    );
  }
);
Switch.displayName = "Switch";

"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true
}: DialogProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "relative w-full overflow-hidden rounded-xl border border-border bg-card p-6 shadow-lg glass-panel z-10 my-8",
              sizes[size]
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-border/50">
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground leading-none">{title}</h3>
                {description && (
                  <p className="text-sm text-muted-foreground">{description}</p>
                )}
              </div>
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              )}
            </div>

            {/* Content */}
            <div className="py-4 max-h-[70vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// CONFIRMATION DIALOG
export interface ConfirmDialogProps extends Omit<DialogProps, "children"> {
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "destructive";
  isConfirming?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "primary",
  isConfirming = false,
  size = "sm"
}: ConfirmDialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} description={description} size={size}>
      <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-border/50">
        <Button variant="outline" onClick={onClose} disabled={isConfirming}>
          {cancelText}
        </Button>
        <Button variant={confirmVariant} onClick={onConfirm} isLoading={isConfirming}>
          {confirmText}
        </Button>
      </div>
    </Dialog>
  );
}

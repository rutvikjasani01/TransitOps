"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Compass, AlertCircle, ArrowLeft, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-slate-950 overflow-hidden">
      <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md text-center space-y-7 z-10"
      >
        {/* Icon */}
        <div className="flex justify-center">
          <div className="relative inline-flex p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20">
            <Compass className="h-12 w-12 text-rose-400 animate-spin" style={{ animationDuration: "14s" }} />
            <div className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-rose-500 border-2 border-slate-950 flex items-center justify-center">
              <AlertCircle className="h-3.5 w-3.5 text-white" />
            </div>
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-[10px] font-bold uppercase tracking-widest">
            404 Error · Signal Lost
          </div>
          <h1 className="text-3xl font-black text-white leading-tight">
            Route Coordinates<br />Off-Grid
          </h1>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            The page you requested doesn't exist or the active vehicle has moved off-grid. Audit your navigation path.
          </p>
        </div>

        {/* CTA */}
        <Button
          variant="primary"
          onClick={() => router.push("/")}
          className="w-full h-11 font-bold gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:shadow-[0_0_24px_rgba(99,102,241,0.35)]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Base Operations
        </Button>

        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-600 font-medium uppercase tracking-wider">
          <Truck className="h-3.5 w-3.5" />
          TransitOps Core Rerouting
        </div>
      </motion.div>
    </div>
  );
}

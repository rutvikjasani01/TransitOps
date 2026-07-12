"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Compass, AlertCircle, ArrowLeft, Truck } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#0F172A] overflow-hidden">
      {/* Background gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-red-500/5 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-500/5 blur-[120px]" />

      <div className="w-full max-w-md text-center space-y-6 z-10">
        
        {/* Animated Icon Plate */}
        <div className="inline-flex p-4 bg-destructive/10 border border-destructive/20 rounded-2xl text-destructive shrink-0 relative">
          <Compass className="h-12 w-12 animate-spin" style={{ animationDuration: "12s" }} />
          <AlertCircle className="absolute top-2 right-2 h-5 w-5 bg-[#0F172A] rounded-full text-destructive-foreground fill-destructive" />
        </div>

        {/* Text */}
        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-widest text-destructive bg-destructive/10 border border-destructive/20 px-2.5 py-0.5 rounded-full">
            Signal Lost • 404 Error
          </span>
          <h1 className="text-2xl font-black text-white">Route Coordinates Off-Grid</h1>
          <p className="text-sm text-slate-400 max-w-xs mx-auto leading-relaxed">
            The page coordinates you requested do not exist or the active vehicle has moved off-grid. Please audit your navigation paths.
          </p>
        </div>

        {/* Back control */}
        <div className="pt-2">
          <Button
            variant="primary"
            onClick={() => router.push("/")}
            className="w-full py-6 font-bold text-xs gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Base Operations
          </Button>
        </div>

        <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-500 font-semibold uppercase">
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-primary" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="3 11 22 2 13 22 11 13 3 11" className="fill-primary/20" />
          </svg>
          <span>NAVIX Core Rerouting</span>
        </div>

      </div>
    </div>
  );
}

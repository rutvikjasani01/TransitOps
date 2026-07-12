import React from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader } from "./Card";

const accentStyles = {
  blue: {
    border: "border-l-blue-500",
    icon: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  orange: {
    border: "border-l-orange-500",
    icon: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  },
  emerald: {
    border: "border-l-emerald-500",
    icon: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  purple: {
    border: "border-l-purple-500",
    icon: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  },
  rose: {
    border: "border-l-rose-500",
    icon: "text-rose-500 bg-rose-500/10 border-rose-500/20",
  },
  amber: {
    border: "border-l-amber-500",
    icon: "text-amber-500 bg-amber-500/10 border-amber-500/20",
  },
} as const;

type AccentColor = keyof typeof accentStyles;

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: React.ReactNode;
  icon: React.ReactNode;
  accent?: AccentColor;
  className?: string;
}

export function StatCard({ title, value, subtitle, icon, accent = "blue", className }: StatCardProps) {
  const styles = accentStyles[accent];

  return (
    <Card hoverable className={cn("border-l-4", styles.border, className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</span>
        <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg border", styles.icon)}>
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black text-foreground tabular-nums">{value}</div>
        {subtitle && (
          <p className="text-[11px] text-muted-foreground mt-1.5 leading-snug">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  );
}

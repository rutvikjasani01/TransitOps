"use client";

import React from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from "recharts";

const COLORS = {
  primary:     "#6366f1",
  secondary:   "#3b82f6",
  success:     "#10b981",
  warning:     "#f59e0b",
  destructive: "#ef4444",
  muted:       "#64748b",
  purple:      "#8b5cf6",
  cyan:        "#06b6d4",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2.5 bg-slate-900/95 border border-white/10 rounded-xl shadow-xl text-xs backdrop-blur-md min-w-[130px]">
      {label && <p className="font-bold text-white/80 mb-1.5 pb-1.5 border-b border-white/10">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center gap-2 py-0.5">
          <span className="h-2 w-2 rounded-full shrink-0" style={{ background: entry.color || entry.fill }} />
          <span className="text-slate-400">{entry.name}:</span>
          <span className="font-bold text-white ml-auto pl-2">
            {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// 1. FLEET UTILIZATION — Area Chart
export function FleetUtilizationChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
        <defs>
          <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={COLORS.primary} stopOpacity={0.35} />
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="date" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 10 }} domain={[0, 100]} unit="%" axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: COLORS.primary, strokeWidth: 1, strokeDasharray: "4 4" }} />
        <Area type="monotone" dataKey="utilization" name="Utilization" stroke={COLORS.primary} strokeWidth={2.5}
          fillOpacity={1} fill="url(#utilGrad)" dot={false} activeDot={{ r: 5, fill: COLORS.primary, strokeWidth: 2, stroke: "#1e1b4b" }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// 2. TRIP STATUS DISTRIBUTION — Donut Pie
export function TripStatusChart({ data }: { data: { name: string; value: number }[] }) {
  const scheme = [COLORS.warning, COLORS.primary, COLORS.success, COLORS.destructive];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} cx="50%" cy="46%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value" strokeWidth={0}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={scheme[index % scheme.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="bottom" height={32} iconType="circle" iconSize={7}
          wrapperStyle={{ fontSize: "10px", opacity: 0.75, paddingTop: "8px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// 3. EXPENSE BREAKDOWN — Solid Pie
export function ExpenseBreakdownChart({ data }: { data: { name: string; value: number }[] }) {
  const scheme = [COLORS.secondary, COLORS.purple, COLORS.success, COLORS.warning, COLORS.cyan];
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} cx="50%" cy="46%" innerRadius={0} outerRadius={78} paddingAngle={2} dataKey="value" strokeWidth={0}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={scheme[index % scheme.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend verticalAlign="bottom" height={32} iconType="circle" iconSize={7}
          wrapperStyle={{ fontSize: "10px", opacity: 0.75, paddingTop: "8px" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// 4. FUEL CONSUMPTION — Bar Chart
export function FuelConsumptionChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="vehicle" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
        <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(99,102,241,0.06)" }} />
        <Bar dataKey="liters" name="Liters" radius={[5, 5, 0, 0]} maxBarSize={40}>
          {data.map((_, index) => (
            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? COLORS.primary : COLORS.secondary} fillOpacity={0.9} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// 5. MONTHLY COST TREND — Line Chart
export function MonthlyCostTrendChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="month" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} cursor={{ stroke: "rgba(255,255,255,0.1)", strokeWidth: 1 }} />
        <Legend wrapperStyle={{ fontSize: "10px", opacity: 0.75, paddingTop: "8px" }} />
        <Line type="monotone" dataKey="operatingCost" name="Operating ($)" stroke={COLORS.primary} strokeWidth={2.5}
          dot={false} activeDot={{ r: 5, fill: COLORS.primary, strokeWidth: 2, stroke: "#1e1b4b" }} />
        <Line type="monotone" dataKey="maintenanceCost" name="Maintenance ($)" stroke={COLORS.destructive} strokeWidth={2}
          strokeDasharray="5 4" dot={false} activeDot={{ r: 4, fill: COLORS.destructive }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

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

// Modern colors mapping
const COLORS = {
  primary: "#3b82f6",     // blue-500
  secondary: "#6366f1",   // indigo-500
  success: "#10b981",     // emerald-500
  warning: "#f59e0b",     // amber-500
  destructive: "#ef4444", // red-500
  muted: "#64748b",       // slate-500
  purple: "#8b5cf6"       // violet-500
};

// Tooltip customization
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-slate-900/90 border border-white/10 rounded-lg shadow-lg text-xs backdrop-blur-md">
        {label && <p className="font-bold text-foreground mb-1">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <p key={index} style={{ color: entry.color || entry.fill }} className="font-semibold py-0.5">
            {entry.name}: {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// 1. FLEET UTILIZATION (Area Chart)
export function FleetUtilizationChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="utilGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.4} />
            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="date" stroke="currentColor" className="text-[10px] opacity-50" />
        <YAxis stroke="currentColor" className="text-[10px] opacity-50" domain={[0, 100]} unit="%" />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="utilization"
          name="Fleet Utilization"
          stroke={COLORS.primary}
          strokeWidth={2}
          fillOpacity={1}
          fill="url(#utilGrad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// 2. TRIP STATUS DISTRIBUTION (Pie Chart)
export function TripStatusChart({ data }: { data: { name: string; value: number }[] }) {
  const scheme = [COLORS.warning, COLORS.primary, COLORS.success, COLORS.destructive];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          paddingAngle={4}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={scheme[index % scheme.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle" 
          iconSize={8}
          wrapperStyle={{ fontSize: "11px", opacity: 0.8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// 3. EXPENSE BREAKDOWN (Donut Pie Chart)
export function ExpenseBreakdownChart({ data }: { data: { name: string; value: number }[] }) {
  const scheme = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning, COLORS.purple];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={0}
          outerRadius={75}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={scheme[index % scheme.length]} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle" 
          iconSize={8}
          wrapperStyle={{ fontSize: "11px", opacity: 0.8 }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

// 4. FUEL CONSUMPTION BY VEHICLE (Bar Chart)
export function FuelConsumptionChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="vehicle" stroke="currentColor" className="text-[10px] opacity-50" />
        <YAxis stroke="currentColor" className="text-[10px] opacity-50" label={{ value: 'Liters', angle: -90, position: 'insideLeft', style: {fontSize: 10, fill: 'currentColor', opacity: 0.5 } }} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="liters" name="Liters Filled" fill={COLORS.secondary} radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={index % 2 === 0 ? COLORS.primary : COLORS.secondary} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

// 5. MONTHLY COST TREND (Line/Area Trend)
export function MonthlyCostTrendChart({ data }: { data: any[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis dataKey="month" stroke="currentColor" className="text-[10px] opacity-50" />
        <YAxis stroke="currentColor" className="text-[10px] opacity-50" />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: "11px", opacity: 0.8 }} />
        <Line
          type="monotone"
          dataKey="operatingCost"
          name="Operating Cost ($)"
          stroke={COLORS.primary}
          strokeWidth={3}
          activeDot={{ r: 6 }}
        />
        <Line
          type="monotone"
          dataKey="maintenanceCost"
          name="Maintenance ($)"
          stroke={COLORS.destructive}
          strokeWidth={2}
          strokeDasharray="4 4"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

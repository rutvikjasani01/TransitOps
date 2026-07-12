"use client";

import React, { useState, useMemo } from "react";
import { Droplet, PlusCircle, DollarSign, Gauge, Activity, Fuel, TrendingUp } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { DataTable, Column } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { FuelForm } from "@/components/forms/QuickForms";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useToast } from "@/contexts/ToastContext";
import { FuelLog } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { FuelConsumptionChart } from "@/components/charts/DashboardCharts";
import { cn } from "@/lib/utils";

export default function FuelPage() {
  const { fuelLogs, vehicles } = useTransitState();
  const { toast } = useToast();

  const [logModalOpen, setLogModalOpen] = useState(false);

  const stats = useMemo(() => {
    const totalCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const totalLiters = fuelLogs.reduce((sum, f) => sum + f.liters, 0);
    const avgPrice = totalLiters > 0 ? parseFloat((totalCost / totalLiters).toFixed(2)) : 1.6;
    const logsWithEfficiency = fuelLogs.filter(f => f.efficiency);
    const avgEco = logsWithEfficiency.length > 0
      ? parseFloat((logsWithEfficiency.reduce((sum, f) => sum + (f.efficiency || 0), 0) / logsWithEfficiency.length).toFixed(1))
      : 5.6;
    return { totalCost, totalLiters, avgPrice, avgEco };
  }, [fuelLogs]);

  const chartData = useMemo(() => {
    return vehicles.map(v => ({
      vehicle: v.registrationNumber,
      liters: fuelLogs.filter(f => f.vehicleId === v.id).reduce((sum, f) => sum + f.liters, 0)
    })).filter(item => item.liters > 0);
  }, [vehicles, fuelLogs]);

  const columns: Column<FuelLog>[] = [
    { header: "Vehicle", cell: (row) => {
      const v = vehicles.find(v => v.id === row.vehicleId);
      return (
        <div>
          <span className="font-mono font-bold text-xs text-primary">{v?.registrationNumber || "TX-000-X"}</span>
          <span className="block text-[10px] text-muted-foreground">{v?.name || "Unknown"}</span>
        </div>
      );
    }},
    { header: "Volume", accessorKey: "liters", sortable: true, cell: (row) => <span className="font-semibold text-xs">{row.liters} L</span> },
    { header: "Cost", accessorKey: "cost", sortable: true, cell: (row) => <span className="font-semibold text-xs">{formatCurrency(row.cost)}</span> },
    { header: "Odometer", accessorKey: "odometer", sortable: true, cell: (row) => (
      <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
        <Gauge className="h-3 w-3" />{formatNumber(row.odometer)} km
      </span>
    )},
    { header: "Efficiency", accessorKey: "efficiency", sortable: true, cell: (row) => {
      const value = row.efficiency || 5.6;
      const variant = value > 7.5 ? "success" : value < 4.0 ? "destructive" : "warning";
      const label = value > 7.5 ? "Optimal" : value < 4.0 ? "Heavy Burn" : "Standard";
      return (
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold font-mono">{value} km/L</span>
          <Badge variant={variant} className="text-[8px] px-1.5 py-0">{label}</Badge>
        </div>
      );
    }},
    { header: "Date", accessorKey: "date", sortable: true, cell: (row) => <span className="font-mono text-xs">{row.date}</span> },
  ];

  const statCards = [
    { icon: Fuel, label: "Volume Logged", value: `${formatNumber(stats.totalLiters)} L`, iconBg: "bg-blue-500/10 border-blue-500/20", iconColor: "text-blue-500" },
    { icon: DollarSign, label: "Total Fuel Spend", value: formatCurrency(stats.totalCost), iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-500" },
    { icon: TrendingUp, label: "Avg Price / Liter", value: `${formatCurrency(stats.avgPrice)}/L`, iconBg: "bg-purple-500/10 border-purple-500/20", iconColor: "text-purple-400" },
    { icon: Activity, label: "Fleet Economy", value: `${stats.avgEco} km/L`, iconBg: "bg-amber-500/10 border-amber-500/20", iconColor: "text-amber-500" },
  ];

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <Droplet className="h-5 w-5 text-blue-500" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Fuel Administration</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-[52px]">Log refills, inspect consumption analytics, and track cost factors.</p>
          </div>
          <Button onClick={() => setLogModalOpen(true)} className="gap-2 self-start sm:self-auto">
            <PlusCircle className="h-4 w-4" /> Log Fuel Fill-Up
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => (
            <div key={s.label} className="rounded-2xl border border-border/50 bg-card/60 glass-panel p-4 flex items-center gap-3">
              <div className={cn("p-2.5 rounded-xl border shrink-0", s.iconBg)}>
                <s.icon className={cn("h-4.5 w-4.5", s.iconColor)} />
              </div>
              <div className="min-w-0">
                <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider leading-tight">{s.label}</span>
                <span className="block text-lg font-black mt-0.5 truncate">{s.value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Chart + Table */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-1 rounded-2xl border border-border/50 bg-card/60 glass-panel p-5">
            <div className="mb-4">
              <h3 className="font-bold text-sm">Liters by Vehicle</h3>
              <p className="text-xs text-muted-foreground">Volume stats per registration.</p>
            </div>
            {chartData.length > 0 ? <FuelConsumptionChart data={chartData} /> : (
              <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground">No fuel logs recorded.</div>
            )}
          </div>
          <div className="lg:col-span-2">
            <DataTable data={fuelLogs} columns={columns} searchPlaceholder="Filter logs..." pageSize={5} />
          </div>
        </div>
      </div>

      <Dialog isOpen={logModalOpen} onClose={() => setLogModalOpen(false)}
        title="Log Fuel Refill"
        description="Records volume and cost. Automatically writes expense log and updates vehicle mileage.">
        <FuelForm onClose={() => setLogModalOpen(false)} />
      </Dialog>
    </Shell>
  );
}

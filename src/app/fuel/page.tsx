"use client";

import React, { useState, useMemo } from "react";
import { 
  Droplet, PlusCircle, DollarSign, Gauge, Activity,
  Fuel, TrendingUp, Calendar, Trash2
} from "lucide-react";
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

export default function FuelPage() {
  const { fuelLogs, vehicles } = useTransitState();
  const { toast } = useToast();

  const [logModalOpen, setLogModalOpen] = useState(false);

  // Compute metrics
  const stats = useMemo(() => {
    const totalCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
    const totalLiters = fuelLogs.reduce((sum, f) => sum + f.liters, 0);
    
    // Average fuel price per liter
    const avgPrice = totalLiters > 0 ? parseFloat((totalCost / totalLiters).toFixed(2)) : 1.6;

    // Average fleet fuel economy
    const logsWithEfficiency = fuelLogs.filter(f => f.efficiency);
    const avgEco = logsWithEfficiency.length > 0
      ? parseFloat((logsWithEfficiency.reduce((sum, f) => sum + (f.efficiency || 0), 0) / logsWithEfficiency.length).toFixed(1))
      : 5.6;

    return {
      totalCost,
      totalLiters,
      avgPrice,
      avgEco
    };
  }, [fuelLogs]);

  // Chart data formatting
  const chartData = useMemo(() => {
    return vehicles.map(v => {
      const liters = fuelLogs.filter(f => f.vehicleId === v.id).reduce((sum, f) => sum + f.liters, 0);
      return { vehicle: v.registrationNumber, liters };
    }).filter(item => item.liters > 0);
  }, [vehicles, fuelLogs]);

  // Columns definition
  const columns: Column<FuelLog>[] = [
    {
      header: "Vehicle Registration",
      cell: (row) => {
        const vehicle = vehicles.find(v => v.id === row.vehicleId);
        return (
          <div>
            <span className="font-mono font-bold block text-xs text-primary">{vehicle?.registrationNumber || "TX-000-X"}</span>
            <span className="text-[10px] text-muted-foreground">{vehicle?.name || "Unknown"}</span>
          </div>
        );
      }
    },
    {
      header: "Fuel Volume",
      accessorKey: "liters",
      sortable: true,
      cell: (row) => <span className="font-semibold">{row.liters} Liters</span>
    },
    {
      header: "Fill Cost",
      accessorKey: "cost",
      sortable: true,
      cell: (row) => <span className="font-semibold">{formatCurrency(row.cost)}</span>
    },
    {
      header: "Odometer Reading",
      accessorKey: "odometer",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs flex items-center gap-1">
          <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
          {formatNumber(row.odometer)} km
        </span>
      )
    },
    {
      header: "Efficiency Rank",
      accessorKey: "efficiency",
      sortable: true,
      cell: (row) => {
        const value = row.efficiency || 5.6;
        let rating = "Standard";
        let ratingVariant: "success" | "warning" | "destructive" = "warning";
        if (value > 7.5) {
          rating = "Optimal";
          ratingVariant = "success";
        } else if (value < 4.0) {
          rating = "Heavy Burn";
          ratingVariant = "destructive";
        }

        return (
          <div className="flex items-center space-x-1.5 text-xs font-semibold">
            <span>{value} km/L</span>
            <Badge variant={ratingVariant} className="text-[8px] py-0 px-1 font-bold">
              {rating}
            </Badge>
          </div>
        );
      }
    },
    {
      header: "Logged Date",
      accessorKey: "date",
      sortable: true,
      cell: (row) => <span className="font-mono text-xs">{row.date}</span>
    }
  ];

  return (
    <Shell>
      <div className="space-y-6">
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center space-x-2">
              <Droplet className="h-8 w-8 text-primary shrink-0" />
              <span>Fuel Administration</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Log fleet refills, inspect consumption analytics, and track fuel cost factors.
            </p>
          </div>

          <Button 
            onClick={() => setLogModalOpen(true)}
            className="gap-1.5 h-10 px-4"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Log Fuel Fill-Up
          </Button>
        </div>

        {/* Analytics Top Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="rounded-xl border border-white/5 bg-card/45 p-4 flex items-center space-x-4 glass-panel">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl text-primary shrink-0">
              <Fuel className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Volume Logged</span>
              <span className="block text-xl font-black text-foreground">{formatNumber(stats.totalLiters)} Liters</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-card/45 p-4 flex items-center space-x-4 glass-panel">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Accumulated Spend</span>
              <span className="block text-xl font-black text-foreground">{formatCurrency(stats.totalCost)}</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-card/45 p-4 flex items-center space-x-4 glass-panel">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 shrink-0">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Avg Price per Liter</span>
              <span className="block text-xl font-black text-foreground">{formatCurrency(stats.avgPrice)}/L</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-card/45 p-4 flex items-center space-x-4 glass-panel">
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-xl text-warning shrink-0">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Average Fleet Economy</span>
              <span className="block text-xl font-black text-foreground">{stats.avgEco} km/L</span>
            </div>
          </div>

        </div>

        {/* Charts & Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart visual */}
          <div className="lg:col-span-1 p-5 rounded-xl border border-border bg-card/45 glass-panel flex flex-col justify-between">
            <div className="space-y-1 pb-4">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider">Liters Logged by Vehicle</h3>
              <p className="text-xs text-muted-foreground">Volume stats filtered per registration number.</p>
            </div>
            {chartData.length > 0 ? (
              <FuelConsumptionChart data={chartData} />
            ) : (
              <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground">
                No active fuel logs logged.
              </div>
            )}
          </div>

          {/* Table display */}
          <div className="lg:col-span-2">
            <DataTable
              data={fuelLogs}
              columns={columns}
              searchPlaceholder="Filter logs..."
              pageSize={5}
            />
          </div>
        </div>

      </div>

      {/* FUEL LOG OVERLAY */}
      <Dialog
        isOpen={logModalOpen}
        onClose={() => setLogModalOpen(false)}
        title="Log Fuel Refill"
        description="Records volume and cost coordinates. Automatically writes matching expense logs and updates mileage."
      >
        <FuelForm onClose={() => setLogModalOpen(false)} />
      </Dialog>

    </Shell>
  );
}

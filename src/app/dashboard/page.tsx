"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, Truck, Users, Route, Wrench, 
  Droplet, DollarSign, Activity, Zap, ClipboardList,
  Filter, Calendar, RefreshCw, PlusCircle, LayoutDashboard,
  ArrowUpRight, ArrowDownRight
} from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select, Input } from "@/components/ui/FormElements";
import { Badge } from "@/components/ui/Badge";
import { useTransitState } from "@/contexts/TransitStateContext";
import { formatCurrency, formatNumber, cn } from "@/lib/utils";
import { Dialog } from "@/components/ui/Dialog";
import { TripForm, MaintenanceForm, FuelForm } from "@/components/forms/QuickForms";
import { useToast } from "@/contexts/ToastContext";
import {
  FleetUtilizationChart,
  TripStatusChart,
  ExpenseBreakdownChart,
  FuelConsumptionChart,
  MonthlyCostTrendChart
} from "@/components/charts/DashboardCharts";

function StatCard({ title, value, sub, icon: Icon, color, trend }: {
  title: string; value: string; sub: string;
  icon: React.ElementType; color: string; trend?: { value: number; label: string };
}) {
  const trendUp = trend && trend.value >= 0;
  return (
    <Card hoverable className={cn("stat-card border-l-[3px] h-full", color)}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider leading-normal pr-2">{title}</span>
        <div className={cn("p-2 rounded-xl shrink-0", color.includes("blue") ? "bg-blue-500/12" : color.includes("orange") ? "bg-orange-500/12" : color.includes("emerald") ? "bg-emerald-500/12" : "bg-purple-500/12")}>
          <Icon className={cn("h-4 w-4", color.includes("blue") ? "text-blue-500" : color.includes("orange") ? "text-orange-500" : color.includes("emerald") ? "text-emerald-500" : "text-purple-500")} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-black tracking-tight animate-count">{value}</div>
        <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{sub}</p>
        {trend && (
          <div className={cn("flex items-center gap-1 mt-2 text-[10px] font-bold", trendUp ? "text-emerald-500" : "text-rose-500")}>
            {trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend.value)}% {trend.label}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { vehicles, drivers, trips, maintenanceLogs, fuelLogs, expenses } = useTransitState();
  const { toast } = useToast();

  const [vehicleType, setVehicleType] = useState("ALL");
  const [region, setRegion] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [dateRange, setDateRange] = useState("ALL");

  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      if (vehicleType !== "ALL" && v.type !== vehicleType) return false;
      if (status !== "ALL" && v.status !== status) return false;
      return true;
    });
  }, [vehicles, vehicleType, status]);

  const filteredTrips = useMemo(() => {
    return trips.filter(t => {
      const vehicle = vehicles.find(v => v.id === t.vehicleId);
      if (vehicleType !== "ALL" && (!vehicle || vehicle.type !== vehicleType)) return false;
      if (region !== "ALL") {
        const query = region.toLowerCase();
        const matches = t.source.toLowerCase().includes(query) || t.destination.toLowerCase().includes(query);
        if (!matches) return false;
      }
      if (dateRange !== "ALL") {
        const tripDate = new Date(t.date);
        const refDate = new Date("2026-07-12");
        const diffDays = Math.ceil(Math.abs(refDate.getTime() - tripDate.getTime()) / (1000 * 60 * 60 * 24));
        if (dateRange === "TODAY" && t.date !== "2026-07-12") return false;
        if (dateRange === "WEEK" && diffDays > 7) return false;
        if (dateRange === "MONTH" && diffDays > 30) return false;
      }
      return true;
    });
  }, [trips, vehicles, vehicleType, region, dateRange]);

  const stats = useMemo(() => {
    const totalV = filteredVehicles.length;
    const retiredV = filteredVehicles.filter(v => v.status === "Retired").length;
    const activeV = filteredVehicles.filter(v => v.status === "On Trip").length;
    const availableV = filteredVehicles.filter(v => v.status === "Available").length;
    const inShopV = filteredVehicles.filter(v => v.status === "In Shop").length;
    const totalT = filteredTrips.length;
    const activeT = filteredTrips.filter(t => t.status === "Dispatched").length;
    const pendingT = filteredTrips.filter(t => t.status === "Draft").length;
    const completedT = filteredTrips.filter(t => t.status === "Completed").length;
    const activeDrivers = drivers.filter(d => d.status === "On Trip").length;
    const availableDrivers = drivers.filter(d => d.status === "Available").length;
    const operationalVehicles = Math.max(1, totalV - retiredV);
    const utilizationRate = Math.round((activeV / operationalVehicles) * 100);
    const logsWithEfficiency = fuelLogs.filter(f => f.efficiency);
    const avgEfficiency = logsWithEfficiency.length > 0
      ? parseFloat((logsWithEfficiency.reduce((acc, curr) => acc + (curr.efficiency || 0), 0) / logsWithEfficiency.length).toFixed(1))
      : 5.6;
    const relevantExpenses = expenses.filter(e => {
      if (vehicleType === "ALL") return true;
      if (!e.vehicleId) return true;
      const vehicle = vehicles.find(v => v.id === e.vehicleId);
      return vehicle && vehicle.type === vehicleType;
    });
    const totalExp = relevantExpenses.reduce((sum, e) => sum + e.amount, 0);
    const maintCost = relevantExpenses.filter(e => e.category === "Maintenance").reduce((sum, e) => sum + e.amount, 0);
    const fuelCost = relevantExpenses.filter(e => e.category === "Fuel").reduce((sum, e) => sum + e.amount, 0);
    const otherCost = totalExp - maintCost - fuelCost;
    const tripRevenue = filteredTrips.filter(t => t.status === "Completed").reduce((sum, t) => sum + (t.plannedDistance * 1.8), 0);
    const activeVehiclesAcq = filteredVehicles.reduce((sum, v) => sum + (v.acquisitionCost / 1000), 0);
    const vehicleROI = tripRevenue > 0 ? Math.round(((tripRevenue - totalExp) / Math.max(1, activeVehiclesAcq)) * 100) : 34;
    return { totalV, activeV, availableV, inShopV, retiredV, totalT, activeT, pendingT, completedT, activeDrivers, availableDrivers, utilizationRate, avgEfficiency, totalExp, maintCost, fuelCost, otherCost, vehicleROI };
  }, [filteredVehicles, filteredTrips, drivers, fuelLogs, expenses, vehicleType, vehicles]);

  const tripStatusChartData = useMemo(() => {
    return [
      { name: "Draft", value: filteredTrips.filter(t => t.status === "Draft").length },
      { name: "Dispatched", value: filteredTrips.filter(t => t.status === "Dispatched").length },
      { name: "Completed", value: filteredTrips.filter(t => t.status === "Completed").length },
      { name: "Cancelled", value: filteredTrips.filter(t => t.status === "Cancelled").length }
    ].filter(item => item.value > 0);
  }, [filteredTrips]);

  const expenseChartData = useMemo(() => {
    return [
      { name: "Fuel", value: stats.fuelCost },
      { name: "Maintenance", value: stats.maintCost },
      { name: "Toll Charges", value: expenses.filter(e => e.category === "Toll").reduce((sum, e) => sum + e.amount, 0) },
      { name: "Parking", value: expenses.filter(e => e.category === "Parking").reduce((sum, e) => sum + e.amount, 0) },
      { name: "Other", value: expenses.filter(e => e.category === "Other").reduce((sum, e) => sum + e.amount, 0) }
    ].filter(item => item.value > 0);
  }, [stats, expenses]);

  const fuelConsumptionData = useMemo(() => {
    return vehicles.map(v => {
      const liters = fuelLogs.filter(f => f.vehicleId === v.id).reduce((sum, f) => sum + f.liters, 0);
      return { vehicle: v.registrationNumber, liters };
    }).filter(item => item.liters > 0);
  }, [vehicles, fuelLogs]);

  const utilizationTrendData = useMemo(() => {
    const dates = ["Jul 06", "Jul 07", "Jul 08", "Jul 09", "Jul 10", "Jul 11", "Jul 12"];
    const baseRate = stats.utilizationRate;
    return dates.map((date, idx) => ({
      date,
      utilization: Math.min(100, Math.max(30, baseRate - (dates.length - 1 - idx) * 3 + Math.floor(Math.random() * 8)))
    }));
  }, [stats.utilizationRate]);

  const monthlyCostTrendData = [
    { month: "Feb", operatingCost: 12400, maintenanceCost: 3200 },
    { month: "Mar", operatingCost: 14200, maintenanceCost: 4500 },
    { month: "Apr", operatingCost: 11900, maintenanceCost: 2800 },
    { month: "May", operatingCost: 15300, maintenanceCost: 5100 },
    { month: "Jun", operatingCost: 16800, maintenanceCost: 3800 },
    { month: "Jul", operatingCost: stats.totalExp, maintenanceCost: stats.maintCost }
  ];

  const stagger = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
  };
  const fadeUp = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

  return (
    <Shell>
      <div className="space-y-6 max-w-full">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <LayoutDashboard className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Operations Control</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-[52px]">
              Real-time fleet intelligence &amp; logistics command center.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => toast("Dashboard state refreshed!", "success")}
            className="gap-2 self-start sm:self-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Sync State
          </Button>
        </div>

        {/* Filters */}
        <Card className="border-border/40">
          <CardContent className="py-3 px-4 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wide shrink-0">
              <Filter className="h-3.5 w-3.5 text-primary" />
              Filters
            </div>
            <div className="flex flex-wrap gap-2 flex-1">
              {[
                { value: vehicleType, setter: setVehicleType, options: [["ALL","All Types"],["Semi","Semi Trucks"],["Box Truck","Box Trucks"],["Van","Vans"]] },
                { value: region, setter: setRegion, options: [["ALL","All Regions"],["Chicago","Chicago"],["Dallas","Dallas"],["Los Angeles","L.A."],["Atlanta","Atlanta"]] },
                { value: status, setter: setStatus, options: [["ALL","All Statuses"],["Available","Available"],["On Trip","On Trip"],["In Shop","In Shop"],["Retired","Retired"]] },
                { value: dateRange, setter: setDateRange, options: [["ALL","All Time"],["TODAY","Today"],["WEEK","Past 7 Days"],["MONTH","Past 30 Days"]] },
              ].map((f, i) => (
                <Select key={i} value={f.value} onChange={e => f.setter(e.target.value)} className="h-8 text-xs w-32 sm:w-36 rounded-lg">
                  {f.options.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
                </Select>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* KPI Cards */}
        <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div variants={fadeUp}>
            <StatCard title="Fleet Utilization" value={`${stats.utilizationRate}%`}
              sub={`${stats.activeV} active · ${stats.availableV} available`}
              icon={Activity} color="border-l-blue-500" trend={{ value: 8, label: "vs last week" }} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard title="Active Dispatches" value={`${stats.activeT}`}
              sub={`${stats.pendingT} pending · ${stats.completedT} done`}
              icon={Route} color="border-l-orange-500" trend={{ value: 3, label: "vs yesterday" }} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard title="Operating Expenses" value={formatCurrency(stats.totalExp)}
              sub={`Fuel ${formatCurrency(stats.fuelCost)} · Maint ${formatCurrency(stats.maintCost)}`}
              icon={DollarSign} color="border-l-emerald-500" trend={{ value: -5, label: "vs last month" }} />
          </motion.div>
          <motion.div variants={fadeUp}>
            <StatCard title="Fleet Efficiency" value={`${stats.avgEfficiency} km/L`}
              sub={`Estimated ROI: +${stats.vehicleROI}%`}
              icon={Droplet} color="border-l-purple-500" trend={{ value: 2, label: "vs last month" }} />
          </motion.div>
        </motion.div>

        {/* Quick Actions */}
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/15 border border-amber-500/20">
              <Zap className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-bold">Quick Actions</p>
              <p className="text-xs text-muted-foreground">Trigger state changes. Validations run in real time.</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => setDispatchModalOpen(true)} className="gap-1.5 text-xs">
              <PlusCircle className="h-3.5 w-3.5" /> Dispatch Route
            </Button>
            <Button variant="outline" size="sm" onClick={() => setMaintenanceModalOpen(true)} className="gap-1.5 text-xs">
              <Wrench className="h-3.5 w-3.5 text-amber-500" /> Book Service
            </Button>
            <Button variant="outline" size="sm" onClick={() => setFuelModalOpen(true)} className="gap-1.5 text-xs">
              <Droplet className="h-3.5 w-3.5 text-purple-400" /> Log Fuel
            </Button>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <Card className="lg:col-span-8">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Fleet Utilization Trend</CardTitle>
                <Badge variant="primary" dot className="text-[10px]">Live</Badge>
              </div>
            </CardHeader>
            <CardContent><FleetUtilizationChart data={utilizationTrendData} /></CardContent>
          </Card>

          <Card className="lg:col-span-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Trip Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {tripStatusChartData.length > 0 ? <TripStatusChart data={tripStatusChartData} /> : (
                <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground">No trip data.</div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-4">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Expense Breakdown</CardTitle></CardHeader>
            <CardContent>
              {expenseChartData.length > 0 ? <ExpenseBreakdownChart data={expenseChartData} /> : (
                <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground">No expense data.</div>
              )}
            </CardContent>
          </Card>

          <Card className="lg:col-span-4">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Operating vs Maintenance Costs</CardTitle></CardHeader>
            <CardContent><MonthlyCostTrendChart data={monthlyCostTrendData} /></CardContent>
          </Card>

          <Card className="lg:col-span-4">
            <CardHeader className="pb-2"><CardTitle className="text-sm">Fuel Usage per Vehicle</CardTitle></CardHeader>
            <CardContent>
              {fuelConsumptionData.length > 0 ? <FuelConsumptionChart data={fuelConsumptionData} /> : (
                <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground">No fuel data.</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card>
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Route className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold">Recent Trips</span>
              </div>
              <Badge variant="ghost">{filteredTrips.length} total</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/40">
                    <th className="px-4 py-2.5 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Route</th>
                    <th className="px-4 py-2.5 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Load</th>
                    <th className="px-4 py-2.5 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">km</th>
                    <th className="px-4 py-2.5 text-right font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredTrips.slice(0, 4).map((t) => (
                    <tr key={t.id} className="table-row-hover transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-semibold block truncate max-w-[120px]">{t.destination.split(",")[0]}</span>
                        <span className="text-[10px] text-muted-foreground">from {t.source.split(",")[0]}</span>
                      </td>
                      <td className="px-4 py-3 font-medium">{formatNumber(t.cargoWeight)} kg</td>
                      <td className="px-4 py-3 font-medium font-mono">{t.plannedDistance}</td>
                      <td className="px-4 py-3 text-right">
                        <Badge variant={t.status === "Completed" ? "success" : t.status === "Dispatched" ? "warning" : t.status === "Cancelled" ? "destructive" : "secondary"} className="text-[9px]">
                          {t.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                  {filteredTrips.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-xs">No trips for current filter.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/40">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-bold">Recent Shop Tickets</span>
              </div>
              <Badge variant="ghost">{maintenanceLogs.length} logged</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-muted/30 border-b border-border/40">
                    <th className="px-4 py-2.5 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Vehicle</th>
                    <th className="px-4 py-2.5 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Service</th>
                    <th className="px-4 py-2.5 text-left font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Cost</th>
                    <th className="px-4 py-2.5 text-right font-bold text-muted-foreground uppercase tracking-wider text-[10px]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {maintenanceLogs.slice(0, 4).map((m) => {
                    const vehicle = vehicles.find(v => v.id === m.vehicleId);
                    return (
                      <tr key={m.id} className="table-row-hover transition-colors">
                        <td className="px-4 py-3">
                          <span className="font-bold block">{vehicle?.registrationNumber || "TX-000-X"}</span>
                          <span className="text-[10px] text-muted-foreground">{vehicle?.name}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium block">{m.type}</span>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[140px] block">{m.notes}</span>
                        </td>
                        <td className="px-4 py-3 font-medium">{formatCurrency(m.cost)}</td>
                        <td className="px-4 py-3 text-right">
                          <Badge variant={m.status === "Completed" ? "success" : "warning"} className="text-[9px]">
                            {m.status === "Completed" ? "Closed" : "Open"}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                  {maintenanceLogs.length === 0 && (
                    <tr><td colSpan={4} className="px-4 py-8 text-center text-muted-foreground text-xs">No shop tickets logged.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      <Dialog isOpen={dispatchModalOpen} onClose={() => setDispatchModalOpen(false)}
        title="Dispatch New Route" description="Verify vehicle capability and driver licensing before launching dispatch.">
        <TripForm onClose={() => setDispatchModalOpen(false)} />
      </Dialog>
      <Dialog isOpen={maintenanceModalOpen} onClose={() => setMaintenanceModalOpen(false)}
        title="Schedule Shop Maintenance" description="Places the vehicle into 'In Shop' status immediately, locking dispatches.">
        <MaintenanceForm onClose={() => setMaintenanceModalOpen(false)} />
      </Dialog>
      <Dialog isOpen={fuelModalOpen} onClose={() => setFuelModalOpen(false)}
        title="Log Vehicle Fuel Refill" description="Increases odometer reading and aggregates fleet operational costs.">
        <FuelForm onClose={() => setFuelModalOpen(false)} />
      </Dialog>
    </Shell>
  );
}

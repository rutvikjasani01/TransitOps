"use client";

import React, { useState, useMemo } from "react";
import { 
  TrendingUp, Truck, Users, Route, Wrench, 
  Droplet, DollarSign, Activity, Zap, ClipboardList,
  Filter, Calendar, RefreshCw, PlusCircle, LayoutDashboard
} from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select, Input } from "@/components/ui/FormElements";
import { Badge } from "@/components/ui/Badge";
import { useTransitState } from "@/contexts/TransitStateContext";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { Dialog } from "@/components/ui/Dialog";
import { TripForm, MaintenanceForm, FuelForm } from "@/components/forms/QuickForms";
import { useToast } from "@/contexts/ToastContext";

// Import charts
import {
  FleetUtilizationChart,
  TripStatusChart,
  ExpenseBreakdownChart,
  FuelConsumptionChart,
  MonthlyCostTrendChart
} from "@/components/charts/DashboardCharts";

export default function DashboardPage() {
  const { 
    vehicles, 
    drivers, 
    trips, 
    maintenanceLogs, 
    fuelLogs, 
    expenses 
  } = useTransitState();

  const { toast } = useToast();

  // Filters State
  const [vehicleType, setVehicleType] = useState("ALL");
  const [region, setRegion] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [dateRange, setDateRange] = useState("ALL");

  // Modals state
  const [dispatchModalOpen, setDispatchModalOpen] = useState(false);
  const [maintenanceModalOpen, setMaintenanceModalOpen] = useState(false);
  const [fuelModalOpen, setFuelModalOpen] = useState(false);

  // Filtered collections
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
        // Simple mock filtering based on days
        const tripDate = new Date(t.date);
        const refDate = new Date("2026-07-12");
        const diffTime = Math.abs(refDate.getTime() - tripDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (dateRange === "TODAY" && t.date !== "2026-07-12") return false;
        if (dateRange === "WEEK" && diffDays > 7) return false;
        if (dateRange === "MONTH" && diffDays > 30) return false;
      }
      return true;
    });
  }, [trips, vehicles, vehicleType, region, dateRange]);

  // Compute Metrics based on filtered data
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

    // Fleet utilization % (Active / (Total - Retired))
    const operationalVehicles = Math.max(1, totalV - retiredV);
    const utilizationRate = Math.round((activeV / operationalVehicles) * 100);

    // Fuel Efficiency average (km/L)
    const logsWithEfficiency = fuelLogs.filter(f => f.efficiency);
    const avgEfficiency = logsWithEfficiency.length > 0 
      ? parseFloat((logsWithEfficiency.reduce((acc, curr) => acc + (curr.efficiency || 0), 0) / logsWithEfficiency.length).toFixed(1))
      : 5.6;

    // Expenses computations (Filtered by matching vehicle type if selected)
    const relevantExpenses = expenses.filter(e => {
      if (vehicleType === "ALL") return true;
      if (!e.vehicleId) return true; // Keep global general expenses
      const vehicle = vehicles.find(v => v.id === e.vehicleId);
      return vehicle && vehicle.type === vehicleType;
    });

    const totalExp = relevantExpenses.reduce((sum, e) => sum + e.amount, 0);
    const maintCost = relevantExpenses.filter(e => e.category === "Maintenance").reduce((sum, e) => sum + e.amount, 0);
    const fuelCost = relevantExpenses.filter(e => e.category === "Fuel").reduce((sum, e) => sum + e.amount, 0);
    const otherCost = totalExp - maintCost - fuelCost;

    // Estimate ROI (synthetic revenue - acquisition - operational)
    // We assume dynamic yield per trip distance
    const tripRevenue = filteredTrips.filter(t => t.status === "Completed").reduce((sum, t) => sum + (t.plannedDistance * 1.8), 0);
    const activeVehiclesAcq = filteredVehicles.reduce((sum, v) => sum + (v.acquisitionCost / 1000), 0); // Amortized estimate
    const vehicleROI = tripRevenue > 0 
      ? Math.round(((tripRevenue - totalExp) / Math.max(1, activeVehiclesAcq)) * 100) 
      : 34; // default mock %

    return {
      totalV,
      activeV,
      availableV,
      inShopV,
      retiredV,
      totalT,
      activeT,
      pendingT,
      completedT,
      activeDrivers,
      availableDrivers,
      utilizationRate,
      avgEfficiency,
      totalExp,
      maintCost,
      fuelCost,
      otherCost,
      vehicleROI
    };
  }, [filteredVehicles, filteredTrips, drivers, fuelLogs, expenses, vehicleType, vehicles]);

  // Chart Data formatters
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

  // Fleet Utilization trend over past 7 days (Mocked based on active vehicles)
  const utilizationTrendData = useMemo(() => {
    const dates = ["Jul 06", "Jul 07", "Jul 08", "Jul 09", "Jul 10", "Jul 11", "Jul 12"];
    const baseRate = stats.utilizationRate;
    return dates.map((date, idx) => ({
      date,
      utilization: Math.min(100, Math.max(30, baseRate - (dates.length - 1 - idx) * 3 + Math.floor(Math.random() * 8)))
    }));
  }, [stats.utilizationRate]);

  // Monthly operating trend
  const monthlyCostTrendData = [
    { month: "Feb", operatingCost: 12400, maintenanceCost: 3200 },
    { month: "Mar", operatingCost: 14200, maintenanceCost: 4500 },
    { month: "Apr", operatingCost: 11900, maintenanceCost: 2800 },
    { month: "May", operatingCost: 15300, maintenanceCost: 5100 },
    { month: "Jun", operatingCost: 16800, maintenanceCost: 3800 },
    { month: "Jul", operatingCost: stats.totalExp, maintenanceCost: stats.maintCost }
  ];

  return (
    <Shell>
      <div className="space-y-6">
        
        {/* Title and Top Header Actions */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
              <LayoutDashboard className="h-8 w-8 text-primary shrink-0" />
              <span>Operations Control</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              TransitOps Command Center – Real-time tracking and logistics intelligence dashboard.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                toast("Simulated refresh complete! Updated dashboard stats.", "success");
              }}
              className="h-10 text-xs gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Sync State
            </Button>
          </div>
        </div>

        {/* Dashboard Filters Grid */}
        <Card className="glass-panel border-white/5">
          <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
              <Filter className="h-4 w-4 text-primary" />
              <span>Filter Workspace</span>
            </div>

            <div className="flex flex-wrap gap-3 items-center flex-1 justify-end">
              <div className="w-full sm:w-40">
                <Select
                  value={vehicleType}
                  onChange={(e) => setVehicleType(e.target.value)}
                  className="h-9 text-xs"
                >
                  <option value="ALL">All Vehicle Types</option>
                  <option value="Semi">Semi Trucks</option>
                  <option value="Box Truck">Box Trucks</option>
                  <option value="Van">Vans</option>
                </Select>
              </div>

              <div className="w-full sm:w-40">
                <Select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="h-9 text-xs"
                >
                  <option value="ALL">All Regions</option>
                  <option value="Chicago">Chicago</option>
                  <option value="Dallas">Dallas</option>
                  <option value="Los Angeles">Los Angeles</option>
                  <option value="Atlanta">Atlanta</option>
                </Select>
              </div>

              <div className="w-full sm:w-40">
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="h-9 text-xs"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Available">Available</option>
                  <option value="On Trip">On Trip</option>
                  <option value="In Shop">In Shop</option>
                  <option value="Retired">Retired</option>
                </Select>
              </div>

              <div className="w-full sm:w-40">
                <Select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="h-9 text-xs"
                >
                  <option value="ALL">All Time</option>
                  <option value="TODAY">Today</option>
                  <option value="WEEK">Past 7 Days</option>
                  <option value="MONTH">Past 30 Days</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Analytics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <Card hoverable className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fleet Utilization</span>
              <Activity className="h-4.5 w-4.5 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{stats.utilizationRate}%</div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {stats.activeV} Active / {stats.totalV - stats.retiredV} Operable Vehicles
              </p>
            </CardContent>
          </Card>

          <Card hoverable className="border-l-4 border-l-orange-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Active Dispatches</span>
              <Route className="h-4.5 w-4.5 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{stats.activeT} Trips</div>
              <p className="text-[10px] text-muted-foreground mt-1">
                {stats.pendingT} Pending / {stats.completedT} Completed
              </p>
            </CardContent>
          </Card>

          <Card hoverable className="border-l-4 border-l-emerald-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Operating Expenses</span>
              <DollarSign className="h-4.5 w-4.5 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{formatCurrency(stats.totalExp)}</div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Fuel: {formatCurrency(stats.fuelCost)} | Maintenance: {formatCurrency(stats.maintCost)}
              </p>
            </CardContent>
          </Card>

          <Card hoverable className="border-l-4 border-l-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Fuel Efficiency</span>
              <Droplet className="h-4.5 w-4.5 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black">{stats.avgEfficiency} km/L</div>
              <p className="text-[10px] text-muted-foreground mt-1">
                Vehicle ROI estimate: <span className="text-emerald-400 font-bold">+{stats.vehicleROI}%</span>
              </p>
            </CardContent>
          </Card>

        </div>

        {/* Quick Actions Panel */}
        <Card className="glass-panel bg-primary/5 border-primary/10">
          <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-1.5 text-sm font-bold text-white">
                <Zap className="h-4 w-4 text-warning" />
                <span>Quick Actions Controls</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Trigger state changes immediately. Validations check statuses in real time.
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <Button 
                variant="primary" 
                size="sm"
                onClick={() => setDispatchModalOpen(true)}
                className="text-xs gap-1.5"
              >
                <PlusCircle className="h-4 w-4" />
                Dispatch Route
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setMaintenanceModalOpen(true)}
                className="text-xs gap-1.5"
              >
                <Wrench className="h-4 w-4 text-warning" />
                Book Service
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setFuelModalOpen(true)}
                className="text-xs gap-1.5"
              >
                <Droplet className="h-4 w-4 text-purple-400" />
                Log Fuel Log
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Fleet Utilization (Area) */}
          <Card className="lg:col-span-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white uppercase tracking-wider">Fleet Utilization Trend</span>
                <Badge variant="primary" className="text-[10px]">Real-Time</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <FleetUtilizationChart data={utilizationTrendData} />
            </CardContent>
          </Card>

          {/* Trip Status (Pie) */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <span className="text-sm font-bold text-white uppercase tracking-wider">Trip Status Ratios</span>
            </CardHeader>
            <CardContent>
              {tripStatusChartData.length > 0 ? (
                <TripStatusChart data={tripStatusChartData} />
              ) : (
                <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground">
                  No active trip data to display.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expense Breakdown (Pie/Donut) */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <span className="text-sm font-bold text-white uppercase tracking-wider">Expense Factors</span>
            </CardHeader>
            <CardContent>
              {expenseChartData.length > 0 ? (
                <ExpenseBreakdownChart data={expenseChartData} />
              ) : (
                <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground">
                  No logged expenses for this query.
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Trend (Line) */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <span className="text-sm font-bold text-white uppercase tracking-wider">Operating vs Maint Costs</span>
            </CardHeader>
            <CardContent>
              <MonthlyCostTrendChart data={monthlyCostTrendData} />
            </CardContent>
          </Card>

          {/* Fuel Consumption (Bar) */}
          <Card className="lg:col-span-4">
            <CardHeader>
              <span className="text-sm font-bold text-white uppercase tracking-wider">Fuel usage per vehicle</span>
            </CardHeader>
            <CardContent>
              {fuelConsumptionData.length > 0 ? (
                <FuelConsumptionChart data={fuelConsumptionData} />
              ) : (
                <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground">
                  No fuel metrics logged yet.
                </div>
              )}
            </CardContent>
          </Card>

        </div>

        {/* Lists & Tables Summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Recent Trips Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
              <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Route className="h-4 w-4 text-primary" />
                <span>Recent Trips Control</span>
              </span>
              <Badge variant="ghost">{filteredTrips.length} Total</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-semibold">
                      <th className="p-3">Route</th>
                      <th className="p-3">Load</th>
                      <th className="p-3">Distance</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {filteredTrips.slice(0, 4).map((t) => (
                      <tr key={t.id} className="hover:bg-muted/10 transition-colors">
                        <td className="p-3 font-semibold">
                          <span className="block">{t.destination.split(",")[0]}</span>
                          <span className="text-[10px] text-muted-foreground font-medium">from {t.source.split(",")[0]}</span>
                        </td>
                        <td className="p-3 font-medium">{formatNumber(t.cargoWeight)} kg</td>
                        <td className="p-3 font-medium">{t.plannedDistance} km</td>
                        <td className="p-3 text-right">
                          <Badge 
                            variant={
                              t.status === "Completed" ? "success" : 
                              t.status === "Dispatched" ? "warning" :
                              t.status === "Cancelled" ? "destructive" : "secondary"
                            }
                            className="text-[9px] px-2 py-0"
                          >
                            {t.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                    {filteredTrips.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                          No recent trips found for the current filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Maintenance Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border/40">
              <span className="text-sm font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
                <Wrench className="h-4 w-4 text-warning" />
                <span>Recent Shop Tickets</span>
              </span>
              <Badge variant="ghost">{maintenanceLogs.length} Logged</Badge>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-muted/40 border-b border-border text-muted-foreground uppercase font-semibold">
                      <th className="p-3">Vehicle</th>
                      <th className="p-3">Service</th>
                      <th className="p-3">Cost</th>
                      <th className="p-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/30">
                    {maintenanceLogs.slice(0, 4).map((m) => {
                      const vehicle = vehicles.find(v => v.id === m.vehicleId);
                      return (
                        <tr key={m.id} className="hover:bg-muted/10 transition-colors">
                          <td className="p-3 font-semibold">
                            <span className="block">{vehicle?.registrationNumber || "TX-000-X"}</span>
                            <span className="text-[10px] text-muted-foreground font-medium">{vehicle?.name}</span>
                          </td>
                          <td className="p-3 font-medium">
                            <span className="block">{m.type}</span>
                            <span className="text-[10px] text-muted-foreground truncate max-w-[150px] block font-normal">{m.notes}</span>
                          </td>
                          <td className="p-3 font-medium">{formatCurrency(m.cost)}</td>
                          <td className="p-3 text-right">
                            <Badge 
                              variant={m.status === "Completed" ? "success" : "warning"}
                              className="text-[9px] px-2 py-0"
                            >
                              {m.status === "Completed" ? "Closed" : "Open"}
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                    {maintenanceLogs.length === 0 && (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-muted-foreground">
                          No recent shop logs.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

        </div>

      </div>

      {/* Reusable Form Dialog Overlays */}
      <Dialog
        isOpen={dispatchModalOpen}
        onClose={() => setDispatchModalOpen(false)}
        title="Dispatch New Route Route"
        description="Verify vehicle capability and driver licensing details before launching dispatch."
      >
        <TripForm onClose={() => setDispatchModalOpen(false)} />
      </Dialog>

      <Dialog
        isOpen={maintenanceModalOpen}
        onClose={() => setMaintenanceModalOpen(false)}
        title="Schedule Shop Maintenance"
        description="Places the vehicle into 'In Shop' status immediately, locking dispatch scheduling."
      >
        <MaintenanceForm onClose={() => setMaintenanceModalOpen(false)} />
      </Dialog>

      <Dialog
        isOpen={fuelModalOpen}
        onClose={() => setFuelModalOpen(false)}
        title="Log Vehicle Fuel Refill"
        description="Increases odometer reading of the vehicle and aggregates fleet operational costs."
      >
        <FuelForm onClose={() => setFuelModalOpen(false)} />
      </Dialog>

    </Shell>
  );
}

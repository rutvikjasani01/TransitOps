"use client";

import React, { useState, useMemo } from "react";
import { 
  FileText, Download, Printer, BarChart3, TrendingUp, 
  Calendar, Layers, Filter, CheckCircle2, ChevronRight, Truck,
  Users, DollarSign
} from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/FormElements";
import { Badge } from "@/components/ui/Badge";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useToast } from "@/contexts/ToastContext";
import { formatCurrency, formatNumber } from "@/lib/utils";

type ReportType = "Fleet" | "Finance" | "Safety";

export default function ReportsPage() {
  const { vehicles, drivers, trips, expenses, fuelLogs, maintenanceLogs } = useTransitState();
  const { toast } = useToast();

  const [reportType, setReportType] = useState<ReportType>("Fleet");
  const [timeRange, setTimeRange] = useState("ALL");
  const [generating, setGenerating] = useState(false);

  const systemDate = new Date("2026-07-12");

  // Filter datasets
  const reportData = useMemo(() => {
    if (reportType === "Fleet") {
      return vehicles.map(v => {
        const vTrips = trips.filter(t => t.vehicleId === v.id);
        const distance = vTrips.filter(t => t.status === "Completed").reduce((sum, t) => sum + t.plannedDistance, 0);
        const maintCost = maintenanceLogs.filter(m => m.vehicleId === v.id).reduce((sum, m) => sum + m.cost, 0);
        const fuelCost = fuelLogs.filter(f => f.vehicleId === v.id).reduce((sum, f) => sum + f.cost, 0);
        const tripYield = vTrips.filter(t => t.status === "Completed").reduce((sum, t) => sum + (t.plannedDistance * 1.85), 0);
        
        // ROI: Yield - Operating Cost vs Amortized Cost
        const operatingCost = maintCost + fuelCost;
        const roi = tripYield > 0 
          ? Math.round(((tripYield - operatingCost) / Math.max(1, v.acquisitionCost / 12)) * 100)
          : 0;

        return {
          id: v.id,
          registration: v.registrationNumber,
          name: v.name,
          type: v.type,
          odometer: v.odometer,
          trips: vTrips.length,
          distance,
          maintCost,
          roi,
          status: v.status
        };
      });
    }

    if (reportType === "Finance") {
      return [
        { category: "Fuel Logs Refills", transactionCount: fuelLogs.length, debit: fuelLogs.reduce((sum, f) => sum + f.cost, 0) },
        { category: "Maintenance Orders", transactionCount: maintenanceLogs.length, debit: maintenanceLogs.reduce((sum, m) => sum + m.cost, 0) },
        { category: "Turnpike Tolls", transactionCount: expenses.filter(e => e.category === "Toll").length, debit: expenses.filter(e => e.category === "Toll").reduce((sum, e) => sum + e.amount, 0) },
        { category: "Secure Parking Fees", transactionCount: expenses.filter(e => e.category === "Parking").length, debit: expenses.filter(e => e.category === "Parking").reduce((sum, e) => sum + e.amount, 0) },
        { category: "General Operational Items", transactionCount: expenses.filter(e => e.category === "Other").length, debit: expenses.filter(e => e.category === "Other").reduce((sum, e) => sum + e.amount, 0) }
      ];
    }

    // Safety Audit Reports
    return drivers.map(d => {
      const expired = new Date(d.expiryDate) < systemDate;
      const dTrips = trips.filter(t => t.driverId === d.id);
      
      let statusLabel = "Compliant";
      let statusVariant = "success" as const;
      if (expired) {
        statusLabel = "CDL Expired";
        statusVariant = "destructive" as const;
      } else if (d.status === "Suspended") {
        statusLabel = "Suspended";
        statusVariant = "destructive" as const;
      } else if (d.safetyScore < 75) {
        statusLabel = "Safety Warning";
        statusVariant = "warning" as const;
      }

      return {
        id: d.id,
        name: d.name,
        license: d.licenseNumber,
        category: d.licenseCategory,
        safetyScore: d.safetyScore,
        totalTrips: dTrips.length,
        auditStatus: statusLabel,
        variant: statusVariant
      };
    });
  }, [reportType, vehicles, drivers, trips, expenses, fuelLogs, maintenanceLogs]);

  // Client Side CSV Export trigger
  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === "Fleet") {
      headers = ["Registration Number", "Name", "Type", "Odometer (km)", "Total Trips", "Completed Distance (km)", "Maintenance Cost ($)", "Amortized ROI (%)", "Status"];
      rows = (reportData as any[]).map(v => [
        v.registration,
        v.name,
        v.type,
        String(v.odometer),
        String(v.trips),
        String(v.distance),
        String(v.maintCost),
        String(v.roi),
        v.status
      ]);
    } else if (reportType === "Finance") {
      headers = ["Operating Category", "Transaction Count", "Total Debit ($)"];
      rows = (reportData as any[]).map(f => [
        f.category,
        String(f.transactionCount),
        String(f.debit)
      ]);
    } else {
      headers = ["Operator Name", "CDL License", "CDL Class", "Safety Rating", "Completed Routes", "Roster Compliance"];
      rows = (reportData as any[]).map(d => [
        d.name,
        d.license,
        d.category,
        String(d.safetyScore),
        String(d.totalTrips),
        d.auditStatus
      ]);
    }

    const csvContent = 
      [headers.join(","), ...rows.map(r => r.map(cell => `"${cell.replace(/"/g, '""')}"`).join(","))].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `transitops_${reportType.toLowerCase()}_audit_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast(`Successfully exported ${reportType} report to CSV!`, "success");
  };

  const handlePrintPDF = () => {
    toast("Generating printable sheet layout. Redirecting to browser print queue...", "info");
    setTimeout(() => {
      window.print();
    }, 500);
  };

  return (
    <Shell>
      <div className="space-y-6 print:space-y-0 print:p-0">
        
        {/* Header Options */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center space-x-2">
              <FileText className="h-8 w-8 text-primary shrink-0" />
              <span>Operational Audits</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Generate compliance logs, financial statements, and driver safety reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button 
              variant="outline" 
              onClick={handleExportCSV}
              className="text-xs gap-1.5 h-10 border-white/10 hover:bg-white/5"
            >
              <Download className="h-4 w-4 text-primary" />
              Export CSV
            </Button>
            <Button 
              variant="primary" 
              onClick={handlePrintPDF}
              className="text-xs gap-1.5 h-10 bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-primary-foreground"
            >
              <Printer className="h-4 w-4" />
              Print / Export PDF
            </Button>
          </div>
        </div>

        {/* Print Only Header */}
        <div className="hidden print:block border-b border-border/80 pb-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 dark:text-foreground">TransitOps Platform Report</span>
              <p className="text-xs text-muted-foreground font-mono mt-1">Audit Type: {reportType} Performance Ledger | Date: 2026-07-12</p>
            </div>
            <div className="text-right">
              <span className="block font-bold text-xs uppercase text-slate-500 tracking-wider">Operational Audit</span>
              <span className="text-sm font-semibold text-primary">TransitOps Core Services</span>
            </div>
          </div>
        </div>

        {/* Selection Configuration Panel */}
        <Card className="glass-panel border-white/5 print:hidden">
          <CardContent className="p-4 flex flex-wrap gap-4 items-center justify-between">
            <div className="flex items-center space-x-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider shrink-0">
              <Filter className="h-4 w-4 text-primary" />
              <span>Select Template Parameters</span>
            </div>

            <div className="flex flex-wrap gap-3 items-center flex-1 justify-end">
              <div className="w-full sm:w-48">
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReportType)}
                  className="h-9 text-xs"
                >
                  <option value="Fleet">Fleet Performance Audit</option>
                  <option value="Finance">Financial Accounts Ledger</option>
                  <option value="Safety">Driver Compliance Audits</option>
                </Select>
              </div>

              <div className="w-full sm:w-40">
                <Select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="h-9 text-xs"
                >
                  <option value="ALL">All Time logs</option>
                  <option value="TODAY">Today Only</option>
                  <option value="MONTH">Year to Date (2026)</option>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Preview Ledger Layout */}
        <Card className="overflow-hidden border-border bg-card/25 backdrop-blur-md glass-panel">
          <CardHeader className="bg-muted/40 border-b border-border/40 py-4 print:py-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-foreground">
              Report Summary Preview ({reportType})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              
              {/* FLEET PERFORMANCE TABLE */}
              {reportType === "Fleet" && (
                <table className="w-full text-left text-xs border-collapse font-semibold">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
                      <th className="p-4">Reg Number</th>
                      <th className="p-4">Vehicle Name</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Log Distance</th>
                      <th className="p-4">Workload count</th>
                      <th className="p-4">Maint Cost</th>
                      <th className="p-4">Performance ROI</th>
                      <th className="p-4 text-right">Roster Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 text-foreground">
                    {(reportData as any[]).map((v) => (
                      <tr key={v.id} className="hover:bg-muted/10 print:hover:bg-transparent">
                        <td className="p-4 font-mono font-bold uppercase text-primary">{v.registration}</td>
                        <td className="p-4">{v.name}</td>
                        <td className="p-4">{v.type}</td>
                        <td className="p-4 font-mono">{formatNumber(v.odometer)} km</td>
                        <td className="p-4 font-mono">{v.trips}</td>
                        <td className="p-4 font-mono">{formatCurrency(v.maintCost)}</td>
                        <td className="p-4 font-mono">
                          <span className={v.roi >= 50 ? "text-emerald-400" : "text-amber-400"}>
                            {v.roi}%
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <Badge variant={v.status === "Available" ? "success" : "warning"} className="text-[9px] py-0 px-2 font-bold">
                            {v.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

              {/* FINANCIAL ACCOUNTS LEDGER */}
              {reportType === "Finance" && (
                <table className="w-full text-left text-xs border-collapse font-semibold">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
                      <th className="p-4">Account Category</th>
                      <th className="p-4">Logged Transactions</th>
                      <th className="p-4 text-right">Debit Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 text-foreground">
                    {(reportData as any[]).map((f, idx) => (
                      <tr key={idx} className="hover:bg-muted/10 print:hover:bg-transparent">
                        <td className="p-4 font-bold text-sm text-primary">{f.category}</td>
                        <td className="p-4 font-mono">{f.transactionCount} transactions</td>
                        <td className="p-4 font-mono text-right text-rose-400 text-sm font-black">{formatCurrency(f.debit)}</td>
                      </tr>
                    ))}
                    {/* TOTAL LINE */}
                    <tr className="bg-muted/40 font-bold border-t border-border/80">
                      <td className="p-4 text-base font-black text-foreground">Consolidated Debit Total</td>
                      <td className="p-4"></td>
                      <td className="p-4 text-right font-black text-rose-400 text-base">
                        {formatCurrency((reportData as any[]).reduce((sum, f) => sum + f.debit, 0))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              )}

              {/* SAFETY AUDIT DIRECTORY */}
              {reportType === "Safety" && (
                <table className="w-full text-left text-xs border-collapse font-semibold">
                  <thead>
                    <tr className="bg-muted/30 border-b border-border text-muted-foreground uppercase font-bold tracking-wider">
                      <th className="p-4">Operator Name</th>
                      <th className="p-4">CDL License</th>
                      <th className="p-4">License Category</th>
                      <th className="p-4">Safety Score (0-100)</th>
                      <th className="p-4">Completed Routes</th>
                      <th className="p-4 text-right">Roster Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/20 text-foreground">
                    {(reportData as any[]).map((d) => (
                      <tr key={d.id} className="hover:bg-muted/10 print:hover:bg-transparent">
                        <td className="p-4 font-bold text-sm">{d.name}</td>
                        <td className="p-4 font-mono">{d.license}</td>
                        <td className="p-4">{d.category}</td>
                        <td className="p-4 font-mono">{d.safetyScore}/100</td>
                        <td className="p-4 font-mono">{d.totalTrips}</td>
                        <td className="p-4 text-right">
                          <Badge variant={d.variant} className="text-[9px] py-0 px-2 font-bold uppercase tracking-wider">
                            {d.auditStatus}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>
          </CardContent>
        </Card>

      </div>
    </Shell>
  );
}

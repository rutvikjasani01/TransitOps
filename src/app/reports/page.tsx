"use client";

import React, { useState, useMemo } from "react";
import { FileText, Download, Printer, Filter, CheckCircle2 } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/FormElements";
import { Badge } from "@/components/ui/Badge";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useToast } from "@/contexts/ToastContext";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

type ReportType = "Fleet" | "Finance" | "Safety";

export default function ReportsPage() {
  const { vehicles, drivers, trips, expenses, fuelLogs, maintenanceLogs } = useTransitState();
  const { toast } = useToast();

  const [reportType, setReportType] = useState<ReportType>("Fleet");
  const [timeRange, setTimeRange] = useState("ALL");

  const systemDate = new Date("2026-07-12");

  const reportData = useMemo(() => {
    if (reportType === "Fleet") {
      return vehicles.map(v => {
        const vTrips = trips.filter(t => t.vehicleId === v.id);
        const distance = vTrips.filter(t => t.status === "Completed").reduce((sum, t) => sum + t.plannedDistance, 0);
        const maintCost = maintenanceLogs.filter(m => m.vehicleId === v.id).reduce((sum, m) => sum + m.cost, 0);
        const fuelCost = fuelLogs.filter(f => f.vehicleId === v.id).reduce((sum, f) => sum + f.cost, 0);
        const tripYield = vTrips.filter(t => t.status === "Completed").reduce((sum, t) => sum + (t.plannedDistance * 1.85), 0);
        const operatingCost = maintCost + fuelCost;
        const roi = tripYield > 0 ? Math.round(((tripYield - operatingCost) / Math.max(1, v.acquisitionCost / 12)) * 100) : 0;
        return { id: v.id, registration: v.registrationNumber, name: v.name, type: v.type, odometer: v.odometer, trips: vTrips.length, distance, maintCost, roi, status: v.status };
      });
    }
    if (reportType === "Finance") {
      return [
        { category: "Fuel Logs Refills", transactionCount: fuelLogs.length, debit: fuelLogs.reduce((sum, f) => sum + f.cost, 0) },
        { category: "Maintenance Orders", transactionCount: maintenanceLogs.length, debit: maintenanceLogs.reduce((sum, m) => sum + m.cost, 0) },
        { category: "Turnpike Tolls", transactionCount: expenses.filter(e => e.category === "Toll").length, debit: expenses.filter(e => e.category === "Toll").reduce((sum, e) => sum + e.amount, 0) },
        { category: "Parking Fees", transactionCount: expenses.filter(e => e.category === "Parking").length, debit: expenses.filter(e => e.category === "Parking").reduce((sum, e) => sum + e.amount, 0) },
        { category: "General Items", transactionCount: expenses.filter(e => e.category === "Other").length, debit: expenses.filter(e => e.category === "Other").reduce((sum, e) => sum + e.amount, 0) },
      ];
    }
    return drivers.map(d => {
      const expired = new Date(d.expiryDate) < systemDate;
      const dTrips = trips.filter(t => t.driverId === d.id);
      let statusLabel = "Compliant";
      let statusVariant: "success" | "destructive" | "warning" = "success";
      if (expired) { statusLabel = "CDL Expired"; statusVariant = "destructive"; }
      else if (d.status === "Suspended") { statusLabel = "Suspended"; statusVariant = "destructive"; }
      else if (d.safetyScore < 75) { statusLabel = "Safety Warning"; statusVariant = "warning"; }
      return { id: d.id, name: d.name, license: d.licenseNumber, category: d.licenseCategory, safetyScore: d.safetyScore, totalTrips: dTrips.length, auditStatus: statusLabel, variant: statusVariant };
    });
  }, [reportType, vehicles, drivers, trips, expenses, fuelLogs, maintenanceLogs]);

  const handleExportCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    if (reportType === "Fleet") {
      headers = ["Registration", "Name", "Type", "Odometer (km)", "Trips", "Distance (km)", "Maint Cost ($)", "ROI (%)", "Status"];
      rows = (reportData as any[]).map(v => [v.registration, v.name, v.type, String(v.odometer), String(v.trips), String(v.distance), String(v.maintCost), String(v.roi), v.status]);
    } else if (reportType === "Finance") {
      headers = ["Category", "Transactions", "Total Debit ($)"];
      rows = (reportData as any[]).map(f => [f.category, String(f.transactionCount), String(f.debit)]);
    } else {
      headers = ["Name", "CDL License", "Category", "Safety Score", "Trips", "Compliance"];
      rows = (reportData as any[]).map(d => [d.name, d.license, d.category, String(d.safetyScore), String(d.totalTrips), d.auditStatus]);
    }
    const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url; link.download = `transitops_${reportType.toLowerCase()}_report.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    toast(`Exported ${reportType} report to CSV!`, "success");
  };

  const handlePrintPDF = () => {
    toast("Generating printable layout...", "info");
    setTimeout(() => window.print(), 500);
  };

  const thClass = "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-muted-foreground";
  const tdClass = "px-4 py-3 text-xs font-medium";

  return (
    <Shell>
      <div className="space-y-6 print:space-y-0">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Operational Audits</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-[52px]">Generate compliance logs, financial statements, and driver safety reports.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" onClick={handleExportCSV} className="gap-2 text-xs">
              <Download className="h-3.5 w-3.5 text-primary" /> Export CSV
            </Button>
            <Button variant="primary" onClick={handlePrintPDF} className="gap-2 text-xs">
              <Printer className="h-3.5 w-3.5" /> Print / PDF
            </Button>
          </div>
        </div>

        {/* Print header */}
        <div className="hidden print:flex justify-between items-center border-b pb-4 mb-6">
          <div>
            <span className="text-2xl font-black">TransitOps Platform Report</span>
            <p className="text-xs text-muted-foreground mt-1">Audit Type: {reportType} · Date: 2026-07-12</p>
          </div>
          <span className="text-sm font-bold text-primary">TransitOps Core Services</span>
        </div>

        {/* Filter panel */}
        <Card className="border-border/40 print:hidden">
          <CardContent className="py-3 px-4 flex flex-wrap gap-3 items-center">
            <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wide shrink-0">
              <Filter className="h-3.5 w-3.5 text-primary" /> Report Template
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)} className="h-9 text-xs w-48 rounded-xl">
                <option value="Fleet">Fleet Performance Audit</option>
                <option value="Finance">Financial Accounts Ledger</option>
                <option value="Safety">Driver Compliance Audits</option>
              </Select>
              <Select value={timeRange} onChange={(e) => setTimeRange(e.target.value)} className="h-9 text-xs w-36 rounded-xl">
                <option value="ALL">All Time</option>
                <option value="TODAY">Today Only</option>
                <option value="MONTH">Year to Date</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Report table */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/30 border-b border-border/40 py-3.5">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-bold uppercase tracking-wider">
                {reportType} Report Preview
              </CardTitle>
              <Badge variant="primary" className="text-[9px]">{(reportData as any[]).length} records</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              {reportType === "Fleet" && (
                <table className="w-full border-collapse">
                  <thead><tr className="bg-muted/20 border-b border-border/40">
                    {["Reg #", "Vehicle Name", "Type", "Odometer", "Trips", "Maint Cost", "ROI", "Status"].map(h => <th key={h} className={thClass}>{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y divide-border/30">
                    {(reportData as any[]).map((v) => (
                      <tr key={v.id} className="table-row-hover">
                        <td className={cn(tdClass, "font-mono font-bold text-primary")}>{v.registration}</td>
                        <td className={tdClass}>{v.name}</td>
                        <td className={tdClass}>{v.type}</td>
                        <td className={cn(tdClass, "font-mono")}>{formatNumber(v.odometer)} km</td>
                        <td className={cn(tdClass, "font-mono")}>{v.trips}</td>
                        <td className={cn(tdClass, "font-mono")}>{formatCurrency(v.maintCost)}</td>
                        <td className={tdClass}><span className={v.roi >= 50 ? "text-emerald-500 font-bold" : "text-amber-500 font-bold"}>{v.roi}%</span></td>
                        <td className={tdClass}><Badge variant={v.status === "Available" ? "success" : "warning"} dot className="text-[9px]">{v.status}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {reportType === "Finance" && (
                <table className="w-full border-collapse">
                  <thead><tr className="bg-muted/20 border-b border-border/40">
                    {["Account Category", "Transactions", "Total Debit"].map(h => <th key={h} className={thClass}>{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y divide-border/30">
                    {(reportData as any[]).map((f, idx) => (
                      <tr key={idx} className="table-row-hover">
                        <td className={cn(tdClass, "font-bold text-primary")}>{f.category}</td>
                        <td className={cn(tdClass, "font-mono")}>{f.transactionCount} txns</td>
                        <td className={cn(tdClass, "font-mono font-bold text-rose-400")}>{formatCurrency(f.debit)}</td>
                      </tr>
                    ))}
                    <tr className="bg-muted/30 font-bold border-t border-border/60">
                      <td className={cn(tdClass, "font-black text-sm")}>Consolidated Total</td>
                      <td className={tdClass}></td>
                      <td className={cn(tdClass, "font-black text-rose-400 text-sm")}>{formatCurrency((reportData as any[]).reduce((s, f) => s + f.debit, 0))}</td>
                    </tr>
                  </tbody>
                </table>
              )}
              {reportType === "Safety" && (
                <table className="w-full border-collapse">
                  <thead><tr className="bg-muted/20 border-b border-border/40">
                    {["Operator", "CDL License", "Category", "Safety Score", "Routes", "Compliance"].map(h => <th key={h} className={thClass}>{h}</th>)}
                  </tr></thead>
                  <tbody className="divide-y divide-border/30">
                    {(reportData as any[]).map((d) => (
                      <tr key={d.id} className="table-row-hover">
                        <td className={cn(tdClass, "font-bold")}>{d.name}</td>
                        <td className={cn(tdClass, "font-mono")}>{d.license}</td>
                        <td className={tdClass}>{d.category}</td>
                        <td className={cn(tdClass, "font-mono")}>{d.safetyScore}/100</td>
                        <td className={cn(tdClass, "font-mono")}>{d.totalTrips}</td>
                        <td className={tdClass}><Badge variant={d.variant} dot className="text-[9px] uppercase tracking-wider">{d.auditStatus}</Badge></td>
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

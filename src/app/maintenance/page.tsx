"use client";

import React, { useState, useMemo } from "react";
import { Wrench, PlusCircle, AlertTriangle, CheckCircle, DollarSign, ShieldCheck } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { DataTable, Column, FilterConfig } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog, ConfirmDialog } from "@/components/ui/Dialog";
import { MaintenanceForm } from "@/components/forms/QuickForms";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useToast } from "@/contexts/ToastContext";
import { Maintenance } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { cn } from "@/lib/utils";

const serviceIcons: Record<string, string> = { Routine: "⚙️", Repair: "🔧", Inspection: "📋", Emergency: "🚨" };

export default function MaintenancePage() {
  const { maintenanceLogs, vehicles, closeMaintenance } = useTransitState();
  const { toast } = useToast();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resolveConfirmOpen, setResolveConfirmOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Maintenance | null>(null);

  const handleOpenResolve = (m: Maintenance) => { setSelectedTicket(m); setResolveConfirmOpen(true); };

  const handleResolveConfirm = () => {
    if (!selectedTicket) return;
    const res = closeMaintenance(selectedTicket.id);
    if (res.success) { toast("Maintenance ticket closed. Vehicle is now Available.", "success"); setResolveConfirmOpen(false); }
    else { toast(res.error || "Action failed.", "error"); setResolveConfirmOpen(false); }
  };

  const stats = useMemo(() => ({
    totalCost: maintenanceLogs.reduce((sum, m) => sum + m.cost, 0),
    activeTickets: maintenanceLogs.filter(m => m.status === "Open").length,
    resolvedTickets: maintenanceLogs.filter(m => m.status === "Completed").length,
  }), [maintenanceLogs]);

  const filters: FilterConfig[] = [
    { key: "status", label: "Status", options: [{ label: "Open Tickets", value: "Open" }, { label: "Completed", value: "Completed" }] },
    { key: "type", label: "Type", options: [
      { label: "Routine", value: "Routine" }, { label: "Repair", value: "Repair" },
      { label: "Inspection", value: "Inspection" }, { label: "Emergency", value: "Emergency" }
    ]},
  ];

  const columns: Column<Maintenance>[] = [
    { header: "Vehicle", cell: (row) => {
      const v = vehicles.find(v => v.id === row.vehicleId);
      return (
        <div>
          <span className="font-mono font-bold text-xs text-primary">{v?.registrationNumber || "TX-000-X"}</span>
          <span className="block text-[10px] text-muted-foreground">{v?.name || "Unknown"}</span>
        </div>
      );
    }},
    { header: "Service Type", accessorKey: "type", cell: (row) => (
      <span className="flex items-center gap-1.5 text-xs font-semibold">
        <span>{serviceIcons[row.type] || "🛠️"}</span>{row.type}
      </span>
    )},
    { header: "Cost", accessorKey: "cost", sortable: true, cell: (row) => <span className="font-semibold text-xs">{formatCurrency(row.cost)}</span> },
    { header: "Date", accessorKey: "date", sortable: true, cell: (row) => <span className="font-mono text-xs">{row.date}</span> },
    { header: "Notes", accessorKey: "notes", cell: (row) => (
      <span className="text-xs text-muted-foreground block max-w-xs truncate" title={row.notes}>{row.notes}</span>
    )},
    { header: "Status", accessorKey: "status", cell: (row) => (
      <Badge variant={row.status === "Completed" ? "success" : "warning"} dot className="text-[10px]">
        {row.status === "Completed" ? "Completed" : "In Shop"}
      </Badge>
    )},
    { header: "", cell: (row) => (
      row.status === "Open" ? (
        <Button variant="outline" size="sm" className="h-8 text-xs border-emerald-500/30 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 gap-1"
          onClick={() => handleOpenResolve(row)}>
          <CheckCircle className="h-3.5 w-3.5" /> Close Ticket
        </Button>
      ) : (
        <span className="text-[10px] text-muted-foreground flex items-center gap-1 px-2">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Resolved
        </span>
      )
    )},
  ];

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Wrench className="h-5 w-5 text-amber-500" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Fleet Maintenance</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-[52px]">Track repair workshops, diagnostic histories, and close work orders.</p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2 self-start sm:self-auto">
            <PlusCircle className="h-4 w-4" /> Book Service Ticket
          </Button>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: AlertTriangle, label: "Active Shop Tickets", value: `${stats.activeTickets} Vehicles`, iconBg: "bg-rose-500/10 border-rose-500/20", iconColor: "text-rose-500" },
            { icon: CheckCircle, label: "Resolved Tickets", value: `${stats.resolvedTickets} Checked`, iconBg: "bg-emerald-500/10 border-emerald-500/20", iconColor: "text-emerald-500" },
            { icon: DollarSign, label: "Accumulated Shop Costs", value: formatCurrency(stats.totalCost), iconBg: "bg-purple-500/10 border-purple-500/20", iconColor: "text-purple-400" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border/50 bg-card/60 glass-panel p-4 flex items-center gap-4">
              <div className={cn("p-3 rounded-xl border shrink-0", s.iconBg)}>
                <s.icon className={cn("h-5 w-5", s.iconColor)} />
              </div>
              <div>
                <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{s.label}</span>
                <span className="block text-xl font-black mt-0.5">{s.value}</span>
              </div>
            </div>
          ))}
        </div>

        <DataTable data={maintenanceLogs} columns={columns} filters={filters} searchKey="notes" searchPlaceholder="Search diagnostics notes..." />
      </div>

      <Dialog isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)}
        title="Schedule Service Booking"
        description="Creates maintenance work order. Sets vehicle status to 'In Shop', locking dispatches.">
        <MaintenanceForm onClose={() => setCreateModalOpen(false)} />
      </Dialog>

      <ConfirmDialog isOpen={resolveConfirmOpen} onClose={() => setResolveConfirmOpen(false)}
        title="Close Maintenance Ticket"
        description="Confirm work resolution? This marks the work order resolved and returns the vehicle to 'Available' pool."
        confirmText="Resolve Ticket" onConfirm={handleResolveConfirm} />
    </Shell>
  );
}

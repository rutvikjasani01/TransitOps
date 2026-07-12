"use client";

import React, { useState, useMemo } from "react";
import { 
  Wrench, PlusCircle, AlertTriangle, CheckCircle, 
  DollarSign, Clock, ShieldCheck, Truck, ClipboardList,
  Calendar, Inbox
} from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { DataTable, Column, FilterConfig } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog, ConfirmDialog } from "@/components/ui/Dialog";
import { MaintenanceForm } from "@/components/forms/QuickForms";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useToast } from "@/contexts/ToastContext";
import { Maintenance } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";

export default function MaintenancePage() {
  const { 
    maintenanceLogs, 
    vehicles, 
    closeMaintenance 
  } = useTransitState();

  const { toast } = useToast();

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resolveConfirmOpen, setResolveConfirmOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Maintenance | null>(null);

  const handleOpenResolve = (m: Maintenance) => {
    setSelectedTicket(m);
    setResolveConfirmOpen(true);
  };

  const handleResolveConfirm = () => {
    if (!selectedTicket) return;
    const res = closeMaintenance(selectedTicket.id);
    if (res.success) {
      toast("Maintenance ticket closed. Vehicle is now Available.", "success");
      setResolveConfirmOpen(false);
    } else {
      toast(res.error || "Action failed.", "error");
      setResolveConfirmOpen(false);
    }
  };

  // Compute stats
  const stats = useMemo(() => {
    const totalCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);
    const activeTickets = maintenanceLogs.filter(m => m.status === "Open").length;
    const resolvedTickets = maintenanceLogs.filter(m => m.status === "Completed").length;

    return {
      totalCost,
      activeTickets,
      resolvedTickets
    };
  }, [maintenanceLogs]);

  // Filters setup
  const filters: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Open Tickets", value: "Open" },
        { label: "Closed/Completed", value: "Completed" }
      ]
    },
    {
      key: "type",
      label: "Service Type",
      options: [
        { label: "Routine Inspection", value: "Routine" },
        { label: "Mechanical Repair", value: "Repair" },
        { label: "Safety Verification", value: "Inspection" },
        { label: "Emergency Fix", value: "Emergency" }
      ]
    }
  ];

  // Columns mapping
  const columns: Column<Maintenance>[] = [
    {
      header: "Vehicle Details",
      cell: (row) => {
        const vehicle = vehicles.find(v => v.id === row.vehicleId);
        return (
          <div>
            <span className="font-mono font-bold block text-xs text-primary">{vehicle?.registrationNumber || "TX-000-X"}</span>
            <span className="text-[10px] text-muted-foreground">{vehicle?.name || "Unknown Vehicle"}</span>
          </div>
        );
      }
    },
    {
      header: "Service Type",
      accessorKey: "type",
      cell: (row) => {
        const icons = {
          Routine: "⚙️",
          Repair: "🔧",
          Inspection: "📋",
          Emergency: "🚨"
        };
        return (
          <span className="font-semibold text-xs flex items-center gap-1.5">
            <span>{icons[row.type] || "🛠️"}</span>
            <span>{row.type}</span>
          </span>
        );
      }
    },
    {
      header: "Service Cost",
      accessorKey: "cost",
      sortable: true,
      cell: (row) => <span>{formatCurrency(row.cost)}</span>
    },
    {
      header: "Log Date",
      accessorKey: "date",
      sortable: true,
      cell: (row) => <span className="font-mono text-xs">{row.date}</span>
    },
    {
      header: "Diagnostics / Notes",
      accessorKey: "notes",
      cell: (row) => (
        <span className="text-xs text-muted-foreground block max-w-xs truncate" title={row.notes}>
          {row.notes}
        </span>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        const isClosed = row.status === "Completed";
        return (
          <Badge variant={isClosed ? "success" : "warning"} className="text-[10px] font-bold px-2 py-0">
            {isClosed ? "Completed" : "In Shop"}
          </Badge>
        );
      }
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center">
          {row.status === "Open" ? (
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs border-success/30 hover:bg-success hover:text-white"
              onClick={() => handleOpenResolve(row)}
            >
              Close Ticket
            </Button>
          ) : (
            <span className="text-[10px] text-muted-foreground font-semibold flex items-center gap-1 px-2.5">
              <ShieldCheck className="h-3.5 w-3.5 text-success" /> Checked
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <Shell>
      <div className="space-y-6">
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center space-x-2">
              <Wrench className="h-8 w-8 text-primary shrink-0" />
              <span>Fleet Maintenance</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor active repair workshops, inspect diagnostic histories, and close work orders.
            </p>
          </div>

          <Button 
            onClick={() => setCreateModalOpen(true)}
            className="gap-1.5 h-10 px-4 animate-pulse"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Book Service Ticket
          </Button>
        </div>

        {/* Info Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          <div className="rounded-xl border border-white/5 bg-card/45 p-4 flex items-center space-x-4 glass-panel">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 shrink-0">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Active Shop Tickets</span>
              <span className="block text-xl font-black text-white">{stats.activeTickets} Vehicles</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-card/45 p-4 flex items-center space-x-4 glass-panel">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 shrink-0">
              <CheckCircle className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Resolved Tickets</span>
              <span className="block text-xl font-black text-white">{stats.resolvedTickets} Checked</span>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-card/45 p-4 flex items-center space-x-4 glass-panel">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 shrink-0">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Accumulated Shop Costs</span>
              <span className="block text-xl font-black text-white">{formatCurrency(stats.totalCost)}</span>
            </div>
          </div>

        </div>

        {/* Data Table */}
        <DataTable
          data={maintenanceLogs}
          columns={columns}
          filters={filters}
          searchKey="notes"
          searchPlaceholder="Search diagnostics notes..."
        />

      </div>

      {/* CREATE WORK ORDER DIALOG */}
      <Dialog
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule Service Booking"
        description="Creates maintenance work order. Enforces vehicle status toggle to 'In Shop' locking dispatches."
      >
        <MaintenanceForm onClose={() => setCreateModalOpen(false)} />
      </Dialog>

      {/* VERIFY RESOLUTION CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={resolveConfirmOpen}
        onClose={() => setResolveConfirmOpen(false)}
        title="Close Maintenance Ticket"
        description={`Confirm work resolution for this vehicle? This action marks the work order resolved and returns the vehicle to 'Available' pool status.`}
        confirmText="Resolve Ticket"
        onConfirm={handleResolveConfirm}
      />

    </Shell>
  );
}

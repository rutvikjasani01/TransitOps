"use client";

import React, { useState, useMemo } from "react";
import { 
  Route, PlusCircle, Compass, CheckCircle2, XCircle, 
  ArrowRight, Truck, User
} from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { DataTable, Column, FilterConfig } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { TripForm } from "@/components/forms/QuickForms";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useToast } from "@/contexts/ToastContext";
import { Trip } from "@/types";
import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusConfig = {
  Draft: { variant: "secondary" as const },
  Dispatched: { variant: "warning" as const },
  Completed: { variant: "success" as const },
  Cancelled: { variant: "destructive" as const },
};

export default function TripsPage() {
  const { trips, vehicles, drivers, dispatchTrip, completeTrip, cancelTrip } = useTransitState();
  const { toast } = useToast();

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const handleOpenDetails = (t: Trip) => { setSelectedTrip(t); setDetailsModalOpen(true); };

  const handleDispatch = (id: string) => {
    const res = dispatchTrip(id);
    if (res.success) { toast("Trip dispatched! Fleet status updated.", "success"); const u = trips.find(t => t.id === id); if (u) setSelectedTrip(u); }
    else toast(res.error || "Dispatch failed.", "error");
  };

  const handleComplete = (id: string) => {
    const res = completeTrip(id);
    if (res.success) { toast("Trip completed. Odometer and availability updated.", "success"); const u = trips.find(t => t.id === id); if (u) setSelectedTrip(u); }
    else toast(res.error || "Action failed.", "error");
  };

  const handleCancel = (id: string) => {
    const res = cancelTrip(id);
    if (res.success) { toast("Trip cancelled. Resources returned to pool.", "info"); const u = trips.find(t => t.id === id); if (u) setSelectedTrip(u); }
    else toast(res.error || "Action failed.", "error");
  };

  const tripStats = useMemo(() => ({
    draft: trips.filter(t => t.status === "Draft").length,
    dispatched: trips.filter(t => t.status === "Dispatched").length,
    completed: trips.filter(t => t.status === "Completed").length,
    cancelled: trips.filter(t => t.status === "Cancelled").length,
  }), [trips]);

  const filters: FilterConfig[] = [
    { key: "status", label: "Status", options: [
      { label: "Draft", value: "Draft" }, { label: "Dispatched", value: "Dispatched" },
      { label: "Completed", value: "Completed" }, { label: "Cancelled", value: "Cancelled" }
    ]}
  ];

  const columns: Column<Trip>[] = [
    { header: "Trip ID", accessorKey: "id", cell: (row) => <span className="font-mono font-bold text-xs text-primary">{row.id}</span> },
    { header: "Route", accessorKey: "source", cell: (row) => (
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="font-semibold text-xs truncate max-w-[100px]">{row.source.split(",")[0]}</span>
        <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
        <span className="font-semibold text-xs truncate max-w-[100px]">{row.destination.split(",")[0]}</span>
      </div>
    )},
    { header: "Vehicle", cell: (row) => {
      const v = vehicles.find(v => v.id === row.vehicleId);
      return <div><span className="font-bold text-xs block">{v?.registrationNumber || "—"}</span><span className="text-[10px] text-muted-foreground">{v?.name || "Unknown"}</span></div>;
    }},
    { header: "Driver", cell: (row) => {
      const d = drivers.find(d => d.id === row.driverId);
      return <span className="text-xs font-medium">{d?.name || "Unassigned"}</span>;
    }},
    { header: "Load", accessorKey: "cargoWeight", sortable: true, cell: (row) => <span className="text-xs font-medium">{formatNumber(row.cargoWeight)} kg</span> },
    { header: "Distance", accessorKey: "plannedDistance", sortable: true, cell: (row) => <span className="text-xs font-mono">{row.plannedDistance} km</span> },
    { header: "Status", accessorKey: "status", cell: (row) => (
      <Badge variant={statusConfig[row.status].variant} dot className="text-[10px]">{row.status}</Badge>
    )},
    { header: "", cell: (row) => (
      <Button variant="outline" size="sm" className="h-8 text-xs gap-1 hover:bg-primary hover:text-primary-foreground hover:border-primary"
        onClick={() => handleOpenDetails(row)}>
        Monitor
      </Button>
    )},
  ];

  const renderTimeline = (trip: Trip) => {
    const statusIdx = trip.status === "Draft" ? 0 : trip.status === "Dispatched" ? 1 : trip.status === "Completed" ? 3 : -1;
    const steps = [
      { label: "Route Drafted", desc: "Origin and destination verified" },
      { label: "Active Dispatch", desc: "Operator credentials and CDL cleared" },
      { label: "In Transit", desc: "Live tracking and route compliance active" },
      { label: "Hub Arrival", desc: "Odometer updated, assets returned to pool" },
    ];

    if (trip.status === "Cancelled") {
      return (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/8 flex items-center gap-3">
          <XCircle className="h-6 w-6 text-rose-500 shrink-0" />
          <div>
            <span className="block font-bold text-sm">Route Cancelled</span>
            <span className="text-xs text-muted-foreground">Resources returned to available pools.</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        {steps.map((st, idx) => {
          const isDone = statusIdx >= idx;
          const isCurrent = statusIdx === idx;
          return (
            <div key={idx} className="flex items-start gap-3 relative pb-4 last:pb-0">
              {idx < steps.length - 1 && (
                <div className={cn("absolute left-4 top-8 w-0.5 h-full -translate-x-1/2", isDone && statusIdx > idx ? "bg-emerald-500/60" : "bg-border/40")} />
              )}
              <div className={cn("h-8 w-8 rounded-full border-2 flex items-center justify-center shrink-0 text-xs font-bold relative z-10",
                isDone ? "border-emerald-500 bg-emerald-500/15 text-emerald-500" : "border-border bg-muted/30 text-muted-foreground")}>
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : idx + 1}
              </div>
              <div className="pt-0.5 min-w-0">
                <p className={cn("font-bold text-sm", isDone ? "text-foreground" : "text-muted-foreground")}>{st.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{st.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Compass className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Dispatches Control</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-[52px]">Monitor active routes, schedule dispatches, and audit cargo weights.</p>
          </div>
          <Button onClick={() => setCreateModalOpen(true)} className="gap-2 self-start sm:self-auto">
            <PlusCircle className="h-4 w-4" /> Dispatch New Route
          </Button>
        </div>

        {/* Status summary */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Draft", count: tripStats.draft, color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20" },
            { label: "Dispatched", count: tripStats.dispatched, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
            { label: "Completed", count: tripStats.completed, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { label: "Cancelled", count: tripStats.cancelled, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
          ].map(s => (
            <div key={s.label} className={cn("rounded-xl border px-4 py-3 flex items-center justify-between", s.bg)}>
              <span className="text-xs font-semibold text-muted-foreground">{s.label}</span>
              <span className={cn("text-xl font-black", s.color)}>{s.count}</span>
            </div>
          ))}
        </div>

        <DataTable data={trips} columns={columns} filters={filters} searchKey="source" searchPlaceholder="Search source hub..." onRowClick={handleOpenDetails} />
      </div>

      <Dialog isOpen={createModalOpen} onClose={() => setCreateModalOpen(false)}
        title="Schedule Dispatch Route"
        description="Select available vehicles and operators. Enforces license expiry, safety limits, and capacity rules.">
        <TripForm onClose={() => setCreateModalOpen(false)} />
      </Dialog>

      <Dialog isOpen={detailsModalOpen} onClose={() => setDetailsModalOpen(false)}
        title="Route Monitor Control" description="Audit logs, operational stages, and active dispatch triggers." size="lg">
        {selectedTrip && (
          <div className="space-y-5">
            {/* Route header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/40 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <Route className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <span>{selectedTrip.source.split(",")[0]}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{selectedTrip.destination.split(",")[0]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">ID: {selectedTrip.id} · {selectedTrip.date}</p>
                </div>
              </div>
              <Badge variant={statusConfig[selectedTrip.status].variant} dot className="px-3 py-1 font-bold self-start sm:self-auto">{selectedTrip.status}</Badge>
            </div>

            {/* Asset cards */}
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { title: "Assigned Vehicle", icon: Truck, data: (() => { const v = vehicles.find(v => v.id === selectedTrip.vehicleId); return [["Model", v?.name || "Unknown"], ["Reg #", v?.registrationNumber || "—"], ["Max Capacity", `${formatNumber(v?.maxCapacity || 0)} kg`]]; })() },
                { title: "Assigned Driver", icon: User, data: (() => { const d = drivers.find(d => d.id === selectedTrip.driverId); return [["Name", d?.name || "Unknown"], ["License", d?.licenseNumber || "—"], ["Safety Score", `${d?.safetyScore || 0}/100`]]; })() },
              ].map(({ title, icon: Icon, data }) => (
                <div key={title} className="p-4 rounded-xl border border-border/40 bg-muted/20 space-y-2.5">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    <Icon className="h-3.5 w-3.5 text-primary" />{title}
                  </span>
                  {data.map(([label, val]) => (
                    <div key={label} className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold">{val}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-3">Operational Timeline</p>
              <div className="p-4 rounded-xl border border-border/40 bg-muted/20">
                {renderTimeline(selectedTrip)}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-border/40">
              <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>Close Monitor</Button>
              <div className="flex gap-2">
                {selectedTrip.status === "Draft" && (
                  <Button onClick={() => handleDispatch(selectedTrip.id)} className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5 text-xs">
                    Launch Dispatch
                  </Button>
                )}
                {selectedTrip.status === "Dispatched" && (
                  <>
                    <Button variant="destructive" size="sm" onClick={() => handleCancel(selectedTrip.id)} className="text-xs">Abrupt Cancel</Button>
                    <Button size="sm" onClick={() => handleComplete(selectedTrip.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs">Verify Arrival</Button>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </Shell>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { 
  Route, PlusCircle, Compass, CheckCircle2, XCircle, 
  MapPin, ShieldAlert, Truck, User, ArrowRight,
  TrendingUp, Calendar, RefreshCw
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

export default function TripsPage() {
  const { 
    trips, 
    vehicles, 
    drivers, 
    dispatchTrip, 
    completeTrip, 
    cancelTrip 
  } = useTransitState();

  const { toast } = useToast();

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Selected trip
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  const handleOpenDetails = (t: Trip) => {
    setSelectedTrip(t);
    setDetailsModalOpen(true);
  };

  const handleDispatch = async (id: string) => {
    const res = await dispatchTrip(id);
    if (res.success) {
      toast("Trip successfully dispatched! Fleet status updated.", "success");
      // Update selected trip view in modal
      const updated = trips.find(t => t.id === id);
      if (updated) setSelectedTrip(updated);
    } else {
      toast(res.error || "Dispatch failed.", "error");
    }
  };

  const handleComplete = async (id: string) => {
    const res = await completeTrip(id);
    if (res.success) {
      toast("Trip completed. Vehicle mileage and availability updated.", "success");
      const updated = trips.find(t => t.id === id);
      if (updated) setSelectedTrip(updated);
    } else {
      toast(res.error || "Action failed.", "error");
    }
  };

  const handleCancel = async (id: string) => {
    const res = await cancelTrip(id);
    if (res.success) {
      toast("Trip cancelled. Dedicated resources returned to pool.", "info");
      const updated = trips.find(t => t.id === id);
      if (updated) setSelectedTrip(updated);
    } else {
      toast(res.error || "Action failed.", "error");
    }
  };

  // Table Setup
  const filters: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Draft", value: "Draft" },
        { label: "Dispatched", value: "Dispatched" },
        { label: "Completed", value: "Completed" },
        { label: "Cancelled", value: "Cancelled" }
      ]
    }
  ];

  const columns: Column<Trip>[] = [
    {
      header: "Trip ID",
      accessorKey: "id",
      cell: (row) => <span className="font-mono font-bold text-xs">{row.id}</span>
    },
    {
      header: "Route Description",
      accessorKey: "source",
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-xs truncate max-w-[120px]">{row.source.split(",")[0]}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
          <span className="font-semibold text-xs truncate max-w-[120px]">{row.destination.split(",")[0]}</span>
        </div>
      )
    },
    {
      header: "Assigned Asset",
      cell: (row) => {
        const vehicle = vehicles.find(v => v.id === row.vehicleId);
        return (
          <div>
            <span className="font-bold block text-xs">{vehicle?.registrationNumber || "TX-000-X"}</span>
            <span className="text-[9px] text-muted-foreground">{vehicle?.name || "Unknown Vehicle"}</span>
          </div>
        );
      }
    },
    {
      header: "Operator",
      cell: (row) => {
        const driver = drivers.find(d => d.id === row.driverId);
        return <span className="text-xs font-medium">{driver?.name || "Unassigned"}</span>;
      }
    },
    {
      header: "Load Weight",
      accessorKey: "cargoWeight",
      sortable: true,
      cell: (row) => <span>{formatNumber(row.cargoWeight)} kg</span>
    },
    {
      header: "Distance",
      accessorKey: "plannedDistance",
      sortable: true,
      cell: (row) => <span>{row.plannedDistance} km</span>
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        const variants = {
          Draft: "secondary",
          Dispatched: "warning",
          Completed: "success",
          Cancelled: "destructive"
        };
        return (
          <Badge variant={variants[row.status] as any} className="text-[10px] font-bold px-2 py-0">
            {row.status}
          </Badge>
        );
      }
    },
    {
      header: "Control",
      cell: (row) => (
        <Button 
          variant="outline" 
          size="sm" 
          className="h-8 text-xs hover:bg-primary hover:text-primary-foreground"
          onClick={() => handleOpenDetails(row)}
        >
          Monitor
        </Button>
      )
    }
  ];

  // Timeline Step Renderer
  const renderTimeline = (trip: Trip) => {
    const statusIdx = 
      trip.status === "Draft" ? 0 : 
      trip.status === "Dispatched" ? 1 : 
      trip.status === "Completed" ? 3 : -1; // -1 for cancelled

    const steps = [
      { label: "Route Drafted", desc: "Origin and Destination coordinates verified", time: "Step 1" },
      { label: "Active Dispatch", desc: "Operator credentials and CDL active checks cleared", time: "Step 2" },
      { label: "In Transit", desc: "Live tracking active. Speed and route compliance active", time: "Step 3" },
      { label: "Completed Hub Arrival", desc: "Odometer updated and assets released back to pool", time: "Step 4" }
    ];

    if (trip.status === "Cancelled") {
      return (
        <div className="p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive-foreground font-semibold flex items-center space-x-3">
          <XCircle className="h-6 w-6 shrink-0" />
          <div>
            <span className="block font-bold">Route Cancelled</span>
            <span className="text-xs font-normal text-muted-foreground">Resources allocated to this dispatch have been returned to available pools.</span>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {steps.map((st, idx) => {
          const isDone = statusIdx >= idx;
          const isCurrent = statusIdx === idx;
          
          return (
            <div key={idx} className="flex items-start space-x-3 text-xs relative">
              {idx < 3 && (
                <div 
                  className={`absolute left-4 top-8 w-0.5 h-10 -ml-[1px] ${
                    statusIdx > idx ? "bg-success" : "bg-border/40"
                  }`} 
                />
              )}
              
              <div 
                className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 ${
                  isDone 
                    ? "bg-success/15 border-success text-success" 
                    : isCurrent 
                    ? "bg-primary/10 border-primary text-primary" 
                    : "bg-muted/10 border-border text-muted-foreground"
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <span>{idx + 1}</span>}
              </div>

              <div className="pt-0.5 flex-1">
                <div className="flex justify-between items-center">
                  <span className={`font-bold ${isDone ? "text-foreground" : "text-muted-foreground"}`}>{st.label}</span>
                  <span className="text-[10px] text-muted-foreground/60">{st.time}</span>
                </div>
                <p className="text-muted-foreground mt-0.5">{st.desc}</p>
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
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center space-x-2">
              <Compass className="h-8 w-8 text-primary shrink-0" />
              <span>Dispatches Control</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor active routes, schedule dispatches, and audit cargo weights.
            </p>
          </div>

          <Button 
            onClick={() => setCreateModalOpen(true)}
            className="gap-1.5 h-10 px-4"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Dispatch New Route
          </Button>
        </div>

        {/* Data Table */}
        <DataTable
          data={trips}
          columns={columns}
          filters={filters}
          searchKey="source"
          searchPlaceholder="Search source hub..."
          onRowClick={handleOpenDetails}
        />

      </div>

      {/* CREATE DISPATCH DIALOG */}
      <Dialog
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Schedule Dispatch Route"
        description="Select available vehicles and operators. Enforces license expiry, safety limits, and capacity rules."
      >
        <TripForm onClose={() => setCreateModalOpen(false)} />
      </Dialog>

      {/* TRIP MONITOR DETAILS OVERLAY */}
      <Dialog
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title="Route Monitor Control"
        description="Audit logs, operational stages, and active dispatch triggers."
        size="lg"
      >
        {selectedTrip && (
          <div className="space-y-6">
            
            {/* Route Map Header */}
            <div className="p-4 rounded-xl border border-white/5 bg-slate-900/60 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary shrink-0">
                  <Route className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center space-x-2 text-sm font-extrabold text-foreground">
                    <span>{selectedTrip.source.split(",")[0]}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{selectedTrip.destination.split(",")[0]}</span>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono mt-1">Scheduled Route ID: {selectedTrip.id}</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 self-start sm:self-auto">
                <span className="text-xs font-semibold text-muted-foreground">Status:</span>
                <Badge 
                  variant={
                    selectedTrip.status === "Completed" ? "success" : 
                    selectedTrip.status === "Dispatched" ? "warning" : 
                    selectedTrip.status === "Cancelled" ? "destructive" : "secondary"
                  }
                  className="px-3 py-1 font-bold"
                >
                  {selectedTrip.status}
                </Badge>
              </div>
            </div>

            {/* Asset assignment sheets */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Vehicle */}
              <div className="p-4 rounded-xl border border-border/40 bg-card/25 text-xs space-y-2">
                <span className="block font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1 text-[10px]">
                  <Truck className="h-3.5 w-3.5 text-primary" /> Assigned Vehicle
                </span>
                {(() => {
                  const vehicle = vehicles.find(v => v.id === selectedTrip.vehicleId);
                  return (
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Model:</span>
                        <span className="font-semibold text-foreground">{vehicle?.name || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Registration:</span>
                        <span className="font-mono font-bold text-primary">{vehicle?.registrationNumber || "TX-000-X"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Max Capacity:</span>
                        <span className="font-semibold text-foreground">{formatNumber(vehicle?.maxCapacity || 0)} kg</span>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Driver */}
              <div className="p-4 rounded-xl border border-border/40 bg-card/25 text-xs space-y-2">
                <span className="block font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1 text-[10px]">
                  <User className="h-3.5 w-3.5 text-primary" /> Assigned Operator
                </span>
                {(() => {
                  const driver = drivers.find(d => d.id === selectedTrip.driverId);
                  return (
                    <div className="space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span className="font-semibold text-foreground">{driver?.name || "Unknown"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">License CDL:</span>
                        <span className="font-mono text-foreground">{driver?.licenseNumber || "—"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Safety Score:</span>
                        <span className="font-semibold text-foreground">{driver?.safetyScore}/100</span>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Vertical timeline status tracking */}
            <div className="space-y-3">
              <span className="block text-xs font-bold uppercase tracking-wider text-foreground">Operational Timeline</span>
              <div className="p-4 rounded-xl border border-border/40 bg-card/25">
                {renderTimeline(selectedTrip)}
              </div>
            </div>

            {/* Control Panel Buttons */}
            <div className="flex flex-wrap justify-between items-center gap-4 pt-4 border-t border-border/50">
              
              {/* Reset to close */}
              <Button variant="outline" onClick={() => setDetailsModalOpen(false)}>
                Close Monitor
              </Button>

              {/* Operations mutations triggers */}
              <div className="flex space-x-2">
                {selectedTrip.status === "Draft" && (
                  <Button
                    variant="primary"
                    onClick={() => handleDispatch(selectedTrip.id)}
                    className="bg-warning hover:bg-warning/80 text-warning-foreground font-bold text-xs"
                  >
                    Launch Dispatch
                  </Button>
                )}

                {selectedTrip.status === "Dispatched" && (
                  <>
                    <Button
                      variant="destructive"
                      onClick={() => handleCancel(selectedTrip.id)}
                      className="text-xs"
                    >
                      Abrupt Cancel
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => handleComplete(selectedTrip.id)}
                      className="bg-success hover:bg-success/90 text-success-foreground font-bold text-xs"
                    >
                      Verify Arrival
                    </Button>
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

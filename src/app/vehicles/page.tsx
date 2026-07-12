"use client";

import React, { useState, useMemo } from "react";
import { 
  Truck, PlusCircle, Pencil, Trash2, Eye, 
  Wrench, Activity, Gauge, DollarSign
} from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { DataTable, Column, FilterConfig } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog, ConfirmDialog } from "@/components/ui/Dialog";
import { Input, Select, Label } from "@/components/ui/FormElements";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useToast } from "@/contexts/ToastContext";
import { Vehicle } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

const statusConfig = {
  Available: { variant: "success" as const, dot: true },
  "On Trip": { variant: "warning" as const, dot: true },
  "In Shop": { variant: "destructive" as const, dot: true },
  Retired: { variant: "secondary" as const, dot: false },
};

export default function VehiclesPage() {
  const { vehicles, addVehicle, updateVehicle, deleteVehicle, trips, maintenanceLogs, fuelLogs } = useTransitState();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [regNum, setRegNum] = useState("");
  const [name, setName] = useState("");
  const [model, setModel] = useState("");
  const [type, setType] = useState<Vehicle["type"]>("Truck");
  const [capacity, setCapacity] = useState(0);
  const [odometer, setOdometer] = useState(0);
  const [cost, setCost] = useState(0);
  const [status, setStatus] = useState<Vehicle["status"]>("Available");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setRegNum(""); setName(""); setModel(""); setType("Truck");
    setCapacity(0); setOdometer(0); setCost(0); setStatus("Available");
    setEditingVehicle(null); setErrors({});
  };

  const handleOpenCreate = () => { resetForm(); setFormOpen(true); };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v); setRegNum(v.registrationNumber); setName(v.name);
    setModel(v.model); setType(v.type); setCapacity(v.maxCapacity);
    setOdometer(v.odometer); setCost(v.acquisitionCost); setStatus(v.status);
    setErrors({}); setFormOpen(true);
  };

  const handleOpenDetails = (v: Vehicle) => { setSelectedVehicle(v); setDetailsOpen(true); };
  const handleOpenDelete = (v: Vehicle) => { setSelectedVehicle(v); setDeleteOpen(true); };

  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!regNum) newErrors.regNum = "Registration Number is required.";
    if (!name) newErrors.name = "Vehicle Name is required.";
    if (!model) newErrors.model = "Model Year is required.";
    if (capacity <= 0) newErrors.capacity = "Load Capacity must be positive.";
    if (odometer < 0) newErrors.odometer = "Odometer cannot be negative.";
    if (cost <= 0) newErrors.cost = "Acquisition cost must be positive.";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const payload = { registrationNumber: regNum, name, model, type, maxCapacity: capacity, odometer, acquisitionCost: cost, status };

    if (editingVehicle) {
      const res = updateVehicle(editingVehicle.id, payload);
      if (res.success) { toast(`Vehicle ${regNum} updated successfully.`, "success"); setFormOpen(false); }
      else { setErrors({ regNum: res.error || "" }); toast(res.error || "Update failed.", "error"); }
    } else {
      const res = addVehicle(payload);
      if (res.success) { toast(`New vehicle ${regNum} added.`, "success"); setFormOpen(false); }
      else { setErrors({ regNum: res.error || "" }); toast(res.error || "Save failed.", "error"); }
    }
  };

  const handleDeleteConfirm = () => {
    if (!selectedVehicle) return;
    const res = deleteVehicle(selectedVehicle.id);
    if (res.success) { toast(`Vehicle ${selectedVehicle.registrationNumber} deleted.`, "success"); setDeleteOpen(false); }
    else { toast(res.error || "Deletion restricted.", "error"); setDeleteOpen(false); }
  };

  const filters: FilterConfig[] = [
    { key: "type", label: "Type", options: [{ label: "Semi Trucks", value: "Semi" }, { label: "Box Trucks", value: "Box Truck" }, { label: "Vans", value: "Van" }] },
    { key: "status", label: "Status", options: [{ label: "Available", value: "Available" }, { label: "On Trip", value: "On Trip" }, { label: "In Shop", value: "In Shop" }, { label: "Retired", value: "Retired" }] }
  ];

  const columns: Column<Vehicle>[] = [
    {
      header: "Registration",
      accessorKey: "registrationNumber",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold tracking-wider text-primary text-xs bg-primary/8 px-2 py-0.5 rounded-lg border border-primary/15">
          {row.registrationNumber}
        </span>
      )
    },
    {
      header: "Vehicle",
      accessorKey: "name",
      cell: (row) => (
        <div>
          <span className="block font-semibold text-sm">{row.name}</span>
          <span className="text-[10px] text-muted-foreground">{row.type} · {row.model}</span>
        </div>
      )
    },
    {
      header: "Max Load",
      accessorKey: "maxCapacity",
      sortable: true,
      cell: (row) => <span className="font-medium text-xs">{formatNumber(row.maxCapacity)} kg</span>
    },
    {
      header: "Odometer",
      accessorKey: "odometer",
      sortable: true,
      cell: (row) => (
        <span className="font-mono text-xs flex items-center gap-1 text-muted-foreground">
          <Gauge className="h-3 w-3" />{formatNumber(row.odometer)} km
        </span>
      )
    },
    {
      header: "Acquisition",
      accessorKey: "acquisitionCost",
      sortable: true,
      cell: (row) => <span className="text-xs font-semibold">{formatCurrency(row.acquisitionCost)}</span>
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        const cfg = statusConfig[row.status];
        return <Badge variant={cfg.variant} dot={cfg.dot} className="text-[10px]">{row.status}</Badge>;
      }
    },
    {
      header: "",
      cell: (row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg"
            onClick={() => handleOpenDetails(row)} title="Details">
            <Eye className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg"
            onClick={() => handleOpenEdit(row)} title="Edit" disabled={row.status === "On Trip"}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
            onClick={() => handleOpenDelete(row)} title="Delete" disabled={row.status === "On Trip"}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      )
    }
  ];

  const detailsStats = useMemo(() => {
    if (!selectedVehicle) return { tripsCount: 0, serviceCount: 0, totalFuel: 0 };
    return {
      tripsCount: trips.filter(t => t.vehicleId === selectedVehicle.id).length,
      serviceCount: maintenanceLogs.filter(m => m.vehicleId === selectedVehicle.id).length,
      totalFuel: fuelLogs.filter(f => f.vehicleId === selectedVehicle.id).reduce((sum, f) => sum + f.liters, 0)
    };
  }, [selectedVehicle, trips, maintenanceLogs, fuelLogs]);

  // Fleet summary stats
  const fleetStats = useMemo(() => ({
    available: vehicles.filter(v => v.status === "Available").length,
    onTrip: vehicles.filter(v => v.status === "On Trip").length,
    inShop: vehicles.filter(v => v.status === "In Shop").length,
    retired: vehicles.filter(v => v.status === "Retired").length,
  }), [vehicles]);

  return (
    <Shell>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Truck className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Fleet Inventory</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-[52px]">
              Manage vehicle status, capacity limits, and service history.
            </p>
          </div>
          <Button onClick={handleOpenCreate} className="gap-2 self-start sm:self-auto">
            <PlusCircle className="h-4 w-4" /> Add Vehicle
          </Button>
        </div>

        {/* Status Summary Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Available", count: fleetStats.available, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
            { label: "On Trip", count: fleetStats.onTrip, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
            { label: "In Shop", count: fleetStats.inShop, color: "text-rose-500", bg: "bg-rose-500/10 border-rose-500/20" },
            { label: "Retired", count: fleetStats.retired, color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20" },
          ].map((s) => (
            <div key={s.label} className={cn("rounded-xl border px-4 py-3 flex items-center justify-between", s.bg)}>
              <span className="text-xs font-semibold text-muted-foreground">{s.label}</span>
              <span className={cn("text-xl font-black", s.color)}>{s.count}</span>
            </div>
          ))}
        </div>

        <DataTable data={vehicles} columns={columns} filters={filters}
          searchKey="registrationNumber" searchPlaceholder="Search registration..." />
      </div>

      {/* CREATE / EDIT DIALOG */}
      <Dialog isOpen={formOpen} onClose={() => setFormOpen(false)}
        title={editingVehicle ? "Update Fleet Vehicle" : "Add Vehicle to Fleet"}
        description={editingVehicle ? "Modify configuration details of an existing vehicle." : "Input specifications and capacity limits for the new hauler."}>
        <form onSubmit={handleSaveVehicle} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="reg">Registration Number</Label>
              <Input id="reg" value={regNum} onChange={(e) => setRegNum(e.target.value)} placeholder="TX-908-A" error={errors.regNum} disabled={!!editingVehicle} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vtype">Vehicle Type</Label>
              <Select id="vtype" value={type} onChange={(e) => setType(e.target.value as any)}>
                <option value="Semi">Semi</option>
                <option value="Box Truck">Box Truck</option>
                <option value="Van">Van</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="vname">Vehicle Name</Label>
              <Input id="vname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Volvo FH16" error={errors.name} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vmodel">Model Year</Label>
              <Input id="vmodel" value={model} onChange={(e) => setModel(e.target.value)} placeholder="FH16 2024" error={errors.model} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="vcap">Capacity (kg)</Label>
              <Input id="vcap" type="number" value={capacity || ""} onChange={(e) => setCapacity(Number(e.target.value))} error={errors.capacity} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vodo">Odometer (km)</Label>
              <Input id="vodo" type="number" value={odometer || ""} onChange={(e) => setOdometer(Number(e.target.value))} error={errors.odometer} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="vcost">Cost ($)</Label>
              <Input id="vcost" type="number" value={cost || ""} onChange={(e) => setCost(Number(e.target.value))} error={errors.cost} />
            </div>
          </div>
          {editingVehicle && (
            <div className="space-y-1.5">
              <Label htmlFor="vstatus">Operational Status</Label>
              <Select id="vstatus" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="Available">Available</option>
                <option value="On Trip" disabled>On Trip</option>
                <option value="In Shop">In Shop</option>
                <option value="Retired">Retired</option>
              </Select>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            <Button variant="outline" type="button" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingVehicle ? "Update Specifications" : "Register Vehicle"}</Button>
          </div>
        </form>
      </Dialog>

      {/* DETAILS DIALOG */}
      <Dialog isOpen={detailsOpen} onClose={() => setDetailsOpen(false)}
        title="Vehicle Specifications Sheet" description="Comprehensive technical and operational details." size="lg">
        {selectedVehicle && (
          <div className="space-y-5">
            <div className="flex items-center justify-between p-4 rounded-xl border border-border/40 bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/20">
                  <Truck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-bold text-base">{selectedVehicle.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono">{selectedVehicle.registrationNumber} · {selectedVehicle.type}</p>
                </div>
              </div>
              <Badge variant={statusConfig[selectedVehicle.status].variant} dot={statusConfig[selectedVehicle.status].dot} className="px-3 py-1">{selectedVehicle.status}</Badge>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total Dispatches", value: detailsStats.tripsCount },
                { label: "Shop Visits", value: detailsStats.serviceCount },
                { label: "Fuel Logged (L)", value: formatNumber(detailsStats.totalFuel) },
              ].map((s) => (
                <div key={s.label} className="p-3 rounded-xl border border-border/40 bg-muted/20 text-center">
                  <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{s.label}</span>
                  <span className="block text-xl font-black">{s.value}</span>
                </div>
              ))}
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-3">
                <span className="block text-xs font-bold uppercase tracking-wider border-b border-border/40 pb-2">Specifications</span>
                {[
                  ["Model Config", selectedVehicle.model],
                  ["Max Cargo", `${formatNumber(selectedVehicle.maxCapacity)} kg`],
                  ["Odometer", `${formatNumber(selectedVehicle.odometer)} km`],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold">{val}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <span className="block text-xs font-bold uppercase tracking-wider border-b border-border/40 pb-2">Financial</span>
                {[
                  ["Acquisition", formatCurrency(selectedVehicle.acquisitionCost)],
                  ["Maintenance Total", formatCurrency(maintenanceLogs.filter(m => m.vehicleId === selectedVehicle.id).reduce((s, m) => s + m.cost, 0))],
                  ["Fuel Cost Total", formatCurrency(fuelLogs.filter(f => f.vehicleId === selectedVehicle.id).reduce((s, f) => s + f.cost, 0))],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold">{val}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-2 border-t border-border/40">
              <Button onClick={() => setDetailsOpen(false)}>Done</Button>
            </div>
          </div>
        )}
      </Dialog>

      <ConfirmDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}
        title="Retract Fleet Vehicle"
        description={`Delete vehicle ${selectedVehicle?.registrationNumber}? This permanently removes its records.`}
        confirmText="Delete Vehicle" confirmVariant="destructive" onConfirm={handleDeleteConfirm} />
    </Shell>
  );
}

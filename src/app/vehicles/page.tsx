"use client";

import React, { useState, useMemo } from "react";
import { 
  Truck, PlusCircle, Pencil, Trash2, Eye, 
  Wrench, Activity, Fuel, Gauge, DollarSign, Calendar
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

export default function VehiclesPage() {
  const { 
    vehicles, 
    addVehicle, 
    updateVehicle, 
    deleteVehicle,
    trips,
    maintenanceLogs,
    fuelLogs
  } = useTransitState();

  const { toast } = useToast();

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  // Selected records
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // Form inputs state
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
    setRegNum("");
    setName("");
    setModel("");
    setType("Truck");
    setCapacity(0);
    setOdometer(0);
    setCost(0);
    setStatus("Available");
    setEditingVehicle(null);
    setErrors({});
  };

  const handleOpenCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const handleOpenEdit = (v: Vehicle) => {
    setEditingVehicle(v);
    setRegNum(v.registrationNumber);
    setName(v.name);
    setModel(v.model);
    setType(v.type);
    setCapacity(v.maxCapacity);
    setOdometer(v.odometer);
    setCost(v.acquisitionCost);
    setStatus(v.status);
    setErrors({});
    setFormOpen(true);
  };

  const handleOpenDetails = (v: Vehicle) => {
    setSelectedVehicle(v);
    setDetailsOpen(true);
  };

  const handleOpenDelete = (v: Vehicle) => {
    setSelectedVehicle(v);
    setDeleteOpen(true);
  };

  // Submit Handler
  const handleSaveVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!regNum) newErrors.regNum = "Registration Number is required.";
    if (!name) newErrors.name = "Vehicle Name is required.";
    if (!model) newErrors.model = "Model Year is required.";
    if (capacity <= 0) newErrors.capacity = "Load Capacity must be positive.";
    if (odometer < 0) newErrors.odometer = "Odometer reading cannot be negative.";
    if (cost <= 0) newErrors.cost = "Acquisition cost must be positive.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      registrationNumber: regNum,
      name,
      model,
      type,
      maxCapacity: capacity,
      odometer,
      acquisitionCost: cost,
      status
    };

    if (editingVehicle) {
      // Edit mode
      const res = updateVehicle(editingVehicle.id, payload);
      if (res.success) {
        toast(`Vehicle ${regNum} updated successfully.`, "success");
        setFormOpen(false);
      } else {
        setErrors({ regNum: res.error || "" });
        toast(res.error || "Update failed.", "error");
      }
    } else {
      // Add mode
      const res = addVehicle(payload);
      if (res.success) {
        toast(`New vehicle ${regNum} added.`, "success");
        setFormOpen(false);
      } else {
        setErrors({ regNum: res.error || "" });
        toast(res.error || "Save failed.", "error");
      }
    }
  };

  const handleDeleteConfirm = () => {
    if (!selectedVehicle) return;
    const res = deleteVehicle(selectedVehicle.id);
    if (res.success) {
      toast(`Vehicle ${selectedVehicle.registrationNumber} deleted successfully.`, "success");
      setDeleteOpen(false);
    } else {
      toast(res.error || "Deletion restricted.", "error");
      setDeleteOpen(false);
    }
  };

  // Filter lists setup
  const filters: FilterConfig[] = [
    {
      key: "type",
      label: "Type",
      options: [
        { label: "Semi Trucks", value: "Semi" },
        { label: "Box Trucks", value: "Box Truck" },
        { label: "Vans", value: "Van" }
      ]
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Available", value: "Available" },
        { label: "On Trip", value: "On Trip" },
        { label: "In Shop", value: "In Shop" },
        { label: "Retired", value: "Retired" }
      ]
    }
  ];

  // Column mapping
  const columns: Column<Vehicle>[] = [
    {
      header: "Reg Number",
      accessorKey: "registrationNumber",
      sortable: true,
      cell: (row) => (
        <span className="font-mono font-bold tracking-wider text-primary text-xs uppercase">{row.registrationNumber}</span>
      )
    },
    {
      header: "Name / Type",
      accessorKey: "name",
      cell: (row) => (
        <div>
          <span className="block font-bold">{row.name}</span>
          <span className="text-[10px] text-muted-foreground">{row.type} | {row.model}</span>
        </div>
      )
    },
    {
      header: "Load Limit",
      accessorKey: "maxCapacity",
      sortable: true,
      cell: (row) => <span>{formatNumber(row.maxCapacity)} kg</span>
    },
    {
      header: "Mileage",
      accessorKey: "odometer",
      sortable: true,
      cell: (row) => (
        <span className="flex items-center space-x-1 font-mono text-xs">
          <Gauge className="h-3.5 w-3.5 text-muted-foreground" />
          <span>{formatNumber(row.odometer)} km</span>
        </span>
      )
    },
    {
      header: "Purchase Cost",
      accessorKey: "acquisitionCost",
      sortable: true,
      cell: (row) => <span>{formatCurrency(row.acquisitionCost)}</span>
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        const variants = {
          Available: "success",
          "On Trip": "warning",
          "In Shop": "destructive",
          Retired: "secondary"
        };
        return (
          <Badge variant={variants[row.status] as any} className="text-[10px] font-bold px-2.5 py-0.5">
            {row.status}
          </Badge>
        );
      }
    },
    {
      header: "Actions",
      cell: (row) => (
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-primary hover:bg-primary/10"
            onClick={() => handleOpenDetails(row)}
            title="Details"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-amber-400 hover:text-foreground"
            onClick={() => handleOpenEdit(row)}
            title="Edit"
            disabled={row.status === "On Trip"}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-rose-500 hover:text-foreground"
            onClick={() => handleOpenDelete(row)}
            title="Delete"
            disabled={row.status === "On Trip"}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // Selected vehicle stats helper
  const detailsStats = useMemo(() => {
    if (!selectedVehicle) return { tripsCount: 0, serviceCount: 0, totalFuel: 0 };
    const vTrips = trips.filter(t => t.vehicleId === selectedVehicle.id);
    const vService = maintenanceLogs.filter(m => m.vehicleId === selectedVehicle.id);
    const vFuel = fuelLogs.filter(f => f.vehicleId === selectedVehicle.id).reduce((sum, f) => sum + f.liters, 0);

    return {
      tripsCount: vTrips.length,
      serviceCount: vService.length,
      totalFuel: vFuel
    };
  }, [selectedVehicle, trips, maintenanceLogs, fuelLogs]);

  return (
    <Shell>
      <div className="space-y-6">
        
        {/* Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center space-x-2">
              <Truck className="h-8 w-8 text-primary shrink-0" />
              <span>Fleet Inventory</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage vehicle status, limits, service details, and tracking records.
            </p>
          </div>
          <Button 
            onClick={handleOpenCreate}
            className="gap-1.5 self-start sm:self-auto h-10 px-4"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Add Vehicle
          </Button>
        </div>

        {/* Data Table */}
        <DataTable
          data={vehicles}
          columns={columns}
          filters={filters}
          searchKey="registrationNumber"
          searchPlaceholder="Search registration..."
        />

      </div>

      {/* CREATE / EDIT DIALOG */}
      <Dialog
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingVehicle ? "Update Fleet Vehicle" : "Add Vehicle to Fleet"}
        description={editingVehicle ? "Modify configuration details of an existing vehicle." : "Input specifications and capacity limits for the new hauler."}
      >
        <form onSubmit={handleSaveVehicle} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="reg">Registration Number</Label>
              <Input
                id="reg"
                value={regNum}
                onChange={(e) => setRegNum(e.target.value)}
                placeholder="TX-908-A"
                error={errors.regNum}
                disabled={!!editingVehicle}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="vtype">Vehicle Type</Label>
              <Select
                id="vtype"
                value={type}
                onChange={(e) => setType(e.target.value as any)}
              >
                <option value="Semi">Semi</option>
                <option value="Box Truck">Box Truck</option>
                <option value="Van">Van</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="vname">Vehicle Name</Label>
              <Input
                id="vname"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Volvo FH16"
                error={errors.name}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="vmodel">Model Year</Label>
              <Input
                id="vmodel"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="FH16 2024"
                error={errors.model}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label htmlFor="vcap">Capacity (kg)</Label>
              <Input
                id="vcap"
                type="number"
                value={capacity || ""}
                onChange={(e) => setCapacity(Number(e.target.value))}
                error={errors.capacity}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="vodo">Odometer (km)</Label>
              <Input
                id="vodo"
                type="number"
                value={odometer || ""}
                onChange={(e) => setOdometer(Number(e.target.value))}
                error={errors.odometer}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="vcost">Cost ($)</Label>
              <Input
                id="vcost"
                type="number"
                value={cost || ""}
                onChange={(e) => setCost(Number(e.target.value))}
                error={errors.cost}
              />
            </div>
          </div>

          {editingVehicle && (
            <div className="space-y-1">
              <Label htmlFor="vstatus">Operational Status</Label>
              <Select
                id="vstatus"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="Available">Available</option>
                <option value="On Trip" disabled>On Trip</option>
                <option value="In Shop">In Shop</option>
                <option value="Retired">Retired</option>
              </Select>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-border/50">
            <Button variant="outline" type="button" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingVehicle ? "Update Specifications" : "Register Vehicle"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* VIEW DETAILS OVERLAY */}
      <Dialog
        isOpen={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        title="Vehicle Specifications Sheet"
        description="Comprehensive technical and operational details log."
        size="lg"
      >
        {selectedVehicle && (
          <div className="space-y-6">
            
            {/* Header Plate */}
            <div className="p-4 rounded-xl border border-white/5 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-primary/10 border border-primary/20 rounded-xl text-primary shrink-0">
                  <Truck className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-foreground text-base leading-none mb-1">{selectedVehicle.name}</h4>
                  <p className="text-xs text-muted-foreground font-mono">{selectedVehicle.registrationNumber} • {selectedVehicle.type}</p>
                </div>
              </div>
              <Badge 
                variant={
                  selectedVehicle.status === "Available" ? "success" : 
                  selectedVehicle.status === "On Trip" ? "warning" : 
                  selectedVehicle.status === "In Shop" ? "destructive" : "secondary"
                }
                className="px-3 py-1 font-bold"
              >
                {selectedVehicle.status}
              </Badge>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-muted/20 border border-border/40 rounded-xl text-center space-y-1">
                <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Dispatches</span>
                <span className="block text-lg font-black text-foreground">{detailsStats.tripsCount}</span>
              </div>
              <div className="p-3 bg-muted/20 border border-border/40 rounded-xl text-center space-y-1">
                <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Shop Visits</span>
                <span className="block text-lg font-black text-foreground">{detailsStats.serviceCount}</span>
              </div>
              <div className="p-3 bg-muted/20 border border-border/40 rounded-xl text-center space-y-1">
                <span className="block text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Fuel Logged</span>
                <span className="block text-lg font-black text-foreground">{formatNumber(detailsStats.totalFuel)} L</span>
              </div>
            </div>

            {/* Specs detail layout */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <span className="block text-xs font-bold uppercase text-foreground tracking-wider border-b border-border/40 pb-1">Spec Details</span>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model Config:</span>
                    <span className="font-semibold text-foreground">{selectedVehicle.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Max Cargo weight:</span>
                    <span className="font-semibold text-foreground">{formatNumber(selectedVehicle.maxCapacity)} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Odometer:</span>
                    <span className="font-semibold text-foreground">{formatNumber(selectedVehicle.odometer)} km</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <span className="block text-xs font-bold uppercase text-foreground tracking-wider border-b border-border/40 pb-1">Financial & ROI</span>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Acquisition Cost:</span>
                    <span className="font-semibold text-foreground">{formatCurrency(selectedVehicle.acquisitionCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Maintenance:</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(maintenanceLogs.filter(m => m.vehicleId === selectedVehicle.id).reduce((sum, m) => sum + m.cost, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Est. Fuel Cost:</span>
                    <span className="font-semibold text-foreground">
                      {formatCurrency(fuelLogs.filter(f => f.vehicleId === selectedVehicle.id).reduce((sum, f) => sum + f.cost, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border/50">
              <Button variant="primary" onClick={() => setDetailsOpen(false)}>
                Done
              </Button>
            </div>

          </div>
        )}
      </Dialog>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Retract Fleet Vehicle"
        description={`Are you sure you want to delete vehicle ${selectedVehicle?.registrationNumber}? This will permanently remove its specification details and history logs.`}
        confirmText="Retract Vehicle"
        confirmVariant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </Shell>
  );
}

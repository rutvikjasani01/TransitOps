"use client";

import React, { useState, useMemo } from "react";
import { 
  Users, PlusCircle, Pencil, Trash2, ShieldAlert, 
  Phone, CreditCard, Calendar, BarChart3, LayoutGrid, List,
  Star, UserCheck
} from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { DataTable, Column, FilterConfig } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog, ConfirmDialog } from "@/components/ui/Dialog";
import { Input, Select, Label } from "@/components/ui/FormElements";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useToast } from "@/contexts/ToastContext";
import { Driver } from "@/types";

export default function DriversPage() {
  const { 
    drivers, 
    addDriver, 
    updateDriver, 
    deleteDriver,
    trips
  } = useTransitState();

  const { toast } = useToast();

  // Layout View State: 'table' or 'grid'
  const [viewType, setViewType] = useState<"table" | "grid">("grid");

  // Modals state
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  
  // Selected records
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

  // Form inputs state
  const [name, setName] = useState("");
  const [licNum, setLicNum] = useState("");
  const [licCat, setLicCat] = useState("Class A CDL");
  const [expiry, setExpiry] = useState("2027-01-01");
  const [contact, setContact] = useState("");
  const [safetyScore, setSafetyScore] = useState(90);
  const [status, setStatus] = useState<Driver["status"]>("Available");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const systemDate = useMemo(() => new Date("2026-07-12"), []);

  const resetForm = () => {
    setName("");
    setLicNum("");
    setLicCat("Class A CDL");
    setExpiry("2027-01-01");
    setContact("");
    setSafetyScore(95);
    setStatus("Available");
    setEditingDriver(null);
    setErrors({});
  };

  const handleOpenCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const handleOpenEdit = (d: Driver) => {
    setEditingDriver(d);
    setName(d.name);
    setLicNum(d.licenseNumber);
    setLicCat(d.licenseCategory);
    setExpiry(d.expiryDate);
    setContact(d.contactNumber);
    setSafetyScore(d.safetyScore);
    setStatus(d.status);
    setErrors({});
    setFormOpen(true);
  };

  const handleOpenDelete = (d: Driver) => {
    setSelectedDriver(d);
    setDeleteOpen(true);
  };

  // Submit Handler
  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name) newErrors.name = "Driver Name is required.";
    if (!licNum) newErrors.licNum = "License Number is required.";
    if (!expiry) newErrors.expiry = "Expiry date is required.";
    if (!contact) newErrors.contact = "Contact number is required.";
    if (safetyScore < 0 || safetyScore > 100) newErrors.safety = "Safety Score must be between 0 and 100.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = {
      name,
      licenseNumber: licNum,
      licenseCategory: licCat,
      expiryDate: expiry,
      contactNumber: contact,
      safetyScore,
      status
    };

    if (editingDriver) {
      // Edit Mode
      const res = await updateDriver(editingDriver.id, payload);
      if (res.success) {
        toast(`Driver profile ${name} updated successfully.`, "success");
        setFormOpen(false);
      } else {
        toast(res.error || "Failed to update driver.", "error");
      }
    } else {
      // Create Mode
      const res = await addDriver(payload);
      if (res.success) {
        toast(`New driver ${name} registered in pool.`, "success");
        setFormOpen(false);
      } else {
        toast(res.error || "Failed to register driver.", "error");
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedDriver) return;
    const res = await deleteDriver(selectedDriver.id);
    if (res.success) {
      toast(`Driver ${selectedDriver.name} removed successfully.`, "success");
      setDeleteOpen(false);
    } else {
      toast(res.error || "Failed to remove driver.", "error");
      setDeleteOpen(false);
    }
  };

  // Check Expiry helper
  const isLicenseExpired = (dateStr: string) => {
    return new Date(dateStr) < systemDate;
  };

  // Safety score formatting helper
  const getSafetyBadge = (score: number) => {
    if (score >= 90) return { variant: "success" as const, text: "Excellent" };
    if (score >= 75) return { variant: "warning" as const, text: "Standard" };
    return { variant: "destructive" as const, text: "Risk Alert" };
  };

  // Table Filters Setup
  const filters: FilterConfig[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Available", value: "Available" },
        { label: "On Trip", value: "On Trip" },
        { label: "Off Duty", value: "Off Duty" },
        { label: "Suspended", value: "Suspended" }
      ]
    }
  ];

  // Column definitions for Table View
  const columns: Column<Driver>[] = [
    {
      header: "Name / Category",
      accessorKey: "name",
      cell: (row) => (
        <div>
          <span className="font-bold block text-sm">{row.name}</span>
          <span className="text-[10px] text-muted-foreground">{row.licenseCategory}</span>
        </div>
      )
    },
    {
      header: "CDL License",
      accessorKey: "licenseNumber",
      cell: (row) => <span className="font-mono text-xs">{row.licenseNumber}</span>
    },
    {
      header: "License Expiry",
      accessorKey: "expiryDate",
      sortable: true,
      cell: (row) => {
        const expired = isLicenseExpired(row.expiryDate);
        return (
          <div className="flex items-center space-x-1.5">
            <span className={expired ? "text-destructive font-bold" : "text-foreground"}>
              {row.expiryDate}
            </span>
            {expired && (
              <Badge variant="destructive" className="text-[8px] px-1 py-0 animate-pulse">
                Expired
              </Badge>
            )}
          </div>
        );
      }
    },
    {
      header: "Contact",
      accessorKey: "contactNumber",
      cell: (row) => <span className="text-xs">{row.contactNumber}</span>
    },
    {
      header: "Safety Profile",
      accessorKey: "safetyScore",
      sortable: true,
      cell: (row) => {
        const badg = getSafetyBadge(row.safetyScore);
        return (
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-bold">{row.safetyScore}</span>
            <Badge variant={badg.variant} className="text-[9px] py-0">
              {badg.text}
            </Badge>
          </div>
        );
      }
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (row) => {
        const variants = {
          Available: "success",
          "On Trip": "warning",
          "Off Duty": "secondary",
          Suspended: "destructive"
        };
        return (
          <Badge variant={variants[row.status] as any} className="text-[10px] font-bold px-2 py-0">
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

  return (
    <Shell>
      <div className="space-y-6">
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center space-x-2">
              <Users className="h-8 w-8 text-primary shrink-0" />
              <span>Drivers Directory</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor active drivers status, license validities, and safety compliance records.
            </p>
          </div>

          <div className="flex items-center space-x-2 self-start sm:self-auto">
            {/* View Toggle */}
            <div className="flex items-center bg-slate-900 border border-border/60 rounded-lg p-0.5 mr-2">
              <button
                onClick={() => setViewType("grid")}
                className={`p-1.5 rounded-md cursor-pointer ${
                  viewType === "grid" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewType("table")}
                className={`p-1.5 rounded-md cursor-pointer ${
                  viewType === "table" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Button 
              onClick={handleOpenCreate}
              className="gap-1.5 h-10 px-4"
            >
              <PlusCircle className="h-4.5 w-4.5" />
              Register Driver
            </Button>
          </div>
        </div>

        {/* Dynamic Layout Rendering */}
        {viewType === "table" ? (
          <DataTable
            data={drivers}
            columns={columns}
            filters={filters}
            searchKey="name"
            searchPlaceholder="Search driver name..."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {drivers.map((d) => {
              const expired = isLicenseExpired(d.expiryDate);
              const safetyInfo = getSafetyBadge(d.safetyScore);
              
              const statusVariants = {
                Available: "success",
                "On Trip": "warning",
                "Off Duty": "secondary",
                Suspended: "destructive"
              };

              return (
                <div
                  key={d.id}
                  className="rounded-xl border border-white/5 bg-card/45 backdrop-blur-md glass-panel p-5 relative flex flex-col justify-between hover:scale-[1.01] hover:border-primary/20 transition-all duration-300 group overflow-hidden"
                >
                  {/* Top segment */}
                  <div>
                    {/* Status & Alerts bar */}
                    <div className="flex items-center justify-between mb-4">
                      <Badge variant={statusVariants[d.status] as any} className="text-[9px] font-bold uppercase tracking-wider py-0.5">
                        {d.status}
                      </Badge>
                      <div className="flex space-x-1">
                        {expired && (
                          <Badge variant="destructive" className="text-[8px] py-0 flex items-center space-x-0.5 border border-rose-500/20">
                            <ShieldAlert className="h-3 w-3 shrink-0" />
                            <span>Expired License</span>
                          </Badge>
                        )}
                        {d.status === "Suspended" && (
                          <Badge variant="destructive" className="text-[8px] py-0 border border-rose-500/20">
                            Suspended
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Driver Profile */}
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-sm text-primary group-hover:bg-primary/20 transition-colors">
                        {d.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-foreground text-base leading-none mb-1 group-hover:text-primary transition-colors">{d.name}</h3>
                        <p className="text-xs text-muted-foreground font-mono">{d.licenseCategory}</p>
                      </div>
                    </div>

                    {/* Specifications List */}
                    <div className="space-y-2 py-3 border-t border-b border-border/40 mb-4 text-xs font-semibold">
                      <div className="flex items-center text-muted-foreground justify-between">
                        <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-slate-500" /> Lic Number:</span>
                        <span className="font-mono text-foreground text-right">{d.licenseNumber}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground justify-between">
                        <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-slate-500" /> Expiry:</span>
                        <span className={`font-mono text-right ${expired ? "text-destructive font-black" : "text-foreground"}`}>
                          {d.expiryDate}
                        </span>
                      </div>
                      <div className="flex items-center text-muted-foreground justify-between">
                        <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5 text-slate-500" /> Contact:</span>
                        <span className="text-foreground text-right">{d.contactNumber}</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom safety indicators and buttons */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-4">
                      <span className="text-muted-foreground flex items-center gap-1"><Star className="h-3.5 w-3.5 text-warning shrink-0" /> Safety Score</span>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono font-bold text-foreground text-sm">{d.safetyScore}/100</span>
                        <Badge variant={safetyInfo.variant} className="text-[9px] py-0 font-bold">
                          {safetyInfo.text}
                        </Badge>
                      </div>
                    </div>

                    {/* Progress Bar indicator */}
                    <div className="w-full bg-slate-900 rounded-full h-1.5 mb-4 overflow-hidden border border-white/5">
                      <div 
                        className={`h-full rounded-full ${
                          d.safetyScore >= 90 ? "bg-success" : 
                          d.safetyScore >= 75 ? "bg-warning" : "bg-destructive"
                        }`}
                        style={{ width: `${d.safetyScore}%` }}
                      />
                    </div>

                    {/* Action buttons */}
                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-xs border-white/10 hover:bg-white/5 text-slate-300"
                        onClick={() => handleOpenEdit(d)}
                        disabled={d.status === "On Trip"}
                      >
                        Edit Profile
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-rose-400 hover:text-foreground shrink-0"
                        onClick={() => handleOpenDelete(d)}
                        disabled={d.status === "On Trip"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* CREATE / EDIT DIALOG */}
      <Dialog
        isOpen={formOpen}
        onClose={() => setFormOpen(false)}
        title={editingDriver ? "Update Driver Record" : "Register New Operator"}
        description={editingDriver ? "Edit compliance details, safety records, and contact options." : "Set up driver files, licensing categories, and default ratings."}
      >
        <form onSubmit={handleSaveDriver} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="dname">Driver Full Name</Label>
            <Input
              id="dname"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alexander Mercer"
              error={errors.name}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="dlic">License Number</Label>
              <Input
                id="dlic"
                value={licNum}
                onChange={(e) => setLicNum(e.target.value)}
                placeholder="CDL-9982-A"
                error={errors.licNum}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dcat">CDL Category</Label>
              <Select
                id="dcat"
                value={licCat}
                onChange={(e) => setLicCat(e.target.value)}
              >
                <option value="Class A CDL">Class A CDL (Heavy Combinations)</option>
                <option value="Class B CDL">Class B CDL (Heavy Straight Trucks)</option>
                <option value="Class C CDL">Class C CDL (Hazmat/Passenger)</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="dexp">CDL Expiry Date</Label>
              <Input
                id="dexp"
                type="date"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                error={errors.expiry}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dcontact">Contact Phone</Label>
              <Input
                id="dcontact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="+1 (555) 019-2834"
                error={errors.contact}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="dsafety">Safety Rating (0-100)</Label>
              <Input
                id="dsafety"
                type="number"
                min="0"
                max="100"
                value={safetyScore || ""}
                onChange={(e) => setSafetyScore(Number(e.target.value))}
                error={errors.safety}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dstatus">Status Setting</Label>
              <Select
                id="dstatus"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                disabled={status === "On Trip"}
              >
                <option value="Available">Available</option>
                <option value="On Trip" disabled>On Trip</option>
                <option value="Off Duty">Off Duty</option>
                <option value="Suspended">Suspended</option>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border/50">
            <Button variant="outline" type="button" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {editingDriver ? "Update Driver File" : "Register Operator"}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        title="Deregister Driver"
        description={`Are you sure you want to remove driver ${selectedDriver?.name} from the active operations roster? This action is permanent.`}
        confirmText="Remove Driver"
        confirmVariant="destructive"
        onConfirm={handleDeleteConfirm}
      />
    </Shell>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import { 
  Users, PlusCircle, Pencil, Trash2, ShieldAlert, 
  Phone, CreditCard, Calendar, BarChart3, LayoutGrid, List,
  Star, UserCheck, AlertTriangle
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
import { cn } from "@/lib/utils";

const statusConfig = {
  Available: { variant: "success" as const },
  "On Trip": { variant: "warning" as const },
  "Off Duty": { variant: "secondary" as const },
  Suspended: { variant: "destructive" as const },
};

export default function DriversPage() {
  const { drivers, addDriver, updateDriver, deleteDriver, trips } = useTransitState();
  const { toast } = useToast();

  const [viewType, setViewType] = useState<"table" | "grid">("grid");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);

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
    setName(""); setLicNum(""); setLicCat("Class A CDL"); setExpiry("2027-01-01");
    setContact(""); setSafetyScore(95); setStatus("Available"); setEditingDriver(null); setErrors({});
  };

  const handleOpenCreate = () => { resetForm(); setFormOpen(true); };

  const handleOpenEdit = (d: Driver) => {
    setEditingDriver(d); setName(d.name); setLicNum(d.licenseNumber); setLicCat(d.licenseCategory);
    setExpiry(d.expiryDate); setContact(d.contactNumber); setSafetyScore(d.safetyScore);
    setStatus(d.status); setErrors({}); setFormOpen(true);
  };

  const handleOpenDelete = (d: Driver) => { setSelectedDriver(d); setDeleteOpen(true); };

  const handleSaveDriver = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!name) newErrors.name = "Driver Name is required.";
    if (!licNum) newErrors.licNum = "License Number is required.";
    if (!expiry) newErrors.expiry = "Expiry date is required.";
    if (!contact) newErrors.contact = "Contact number is required.";
    if (safetyScore < 0 || safetyScore > 100) newErrors.safety = "Safety Score must be 0–100.";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const payload = { name, licenseNumber: licNum, licenseCategory: licCat, expiryDate: expiry, contactNumber: contact, safetyScore, status };

    if (editingDriver) {
      updateDriver(editingDriver.id, payload);
      toast(`Driver ${name} updated successfully.`, "success");
    } else {
      addDriver(payload);
      toast(`Driver ${name} registered.`, "success");
    }
    setFormOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (!selectedDriver) return;
    const res = deleteDriver(selectedDriver.id);
    if (res.success) { toast(`Driver ${selectedDriver.name} removed.`, "success"); setDeleteOpen(false); }
    else { toast(res.error || "Failed to remove.", "error"); setDeleteOpen(false); }
  };

  const isLicenseExpired = (dateStr: string) => new Date(dateStr) < systemDate;

  const getSafetyBadge = (score: number) => {
    if (score >= 90) return { variant: "success" as const, text: "Excellent" };
    if (score >= 75) return { variant: "warning" as const, text: "Standard" };
    return { variant: "destructive" as const, text: "Risk Alert" };
  };

  const filters: FilterConfig[] = [
    { key: "status", label: "Status", options: [
      { label: "Available", value: "Available" }, { label: "On Trip", value: "On Trip" },
      { label: "Off Duty", value: "Off Duty" }, { label: "Suspended", value: "Suspended" }
    ]}
  ];

  const columns: Column<Driver>[] = [
    { header: "Name / Category", accessorKey: "name", cell: (row) => (
      <div>
        <span className="font-semibold text-sm block">{row.name}</span>
        <span className="text-[10px] text-muted-foreground">{row.licenseCategory}</span>
      </div>
    )},
    { header: "CDL License", accessorKey: "licenseNumber", cell: (row) => <span className="font-mono text-xs">{row.licenseNumber}</span> },
    { header: "Expiry", accessorKey: "expiryDate", sortable: true, cell: (row) => {
      const expired = isLicenseExpired(row.expiryDate);
      return (
        <div className="flex items-center gap-1.5">
          <span className={cn("text-xs font-mono", expired ? "text-rose-500 font-bold" : "")}>{row.expiryDate}</span>
          {expired && <Badge variant="destructive" className="text-[8px] px-1 py-0 animate-pulse">Expired</Badge>}
        </div>
      );
    }},
    { header: "Contact", accessorKey: "contactNumber", cell: (row) => <span className="text-xs">{row.contactNumber}</span> },
    { header: "Safety Score", accessorKey: "safetyScore", sortable: true, cell: (row) => {
      const b = getSafetyBadge(row.safetyScore);
      return (
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold">{row.safetyScore}</span>
          <Badge variant={b.variant} className="text-[9px]">{b.text}</Badge>
        </div>
      );
    }},
    { header: "Status", accessorKey: "status", cell: (row) => (
      <Badge variant={statusConfig[row.status].variant} dot className="text-[10px]">{row.status}</Badge>
    )},
    { header: "", cell: (row) => (
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 rounded-lg"
          onClick={() => handleOpenEdit(row)} title="Edit" disabled={row.status === "On Trip"}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg"
          onClick={() => handleOpenDelete(row)} title="Delete" disabled={row.status === "On Trip"}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    )},
  ];

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-primary/10 border border-primary/20">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Drivers Directory</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-[52px]">
              Monitor driver status, license validities, and safety compliance.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="flex items-center rounded-xl border border-border/60 bg-muted/30 p-0.5">
              <button onClick={() => setViewType("grid")} className={cn("p-1.5 rounded-lg cursor-pointer transition-colors", viewType === "grid" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")} title="Grid View">
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button onClick={() => setViewType("table")} className={cn("p-1.5 rounded-lg cursor-pointer transition-colors", viewType === "table" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")} title="Table View">
                <List className="h-4 w-4" />
              </button>
            </div>
            <Button onClick={handleOpenCreate} className="gap-2">
              <PlusCircle className="h-4 w-4" /> Register Driver
            </Button>
          </div>
        </div>

        {viewType === "table" ? (
          <DataTable data={drivers} columns={columns} filters={filters} searchKey="name" searchPlaceholder="Search driver name..." />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {drivers.map((d) => {
              const expired = isLicenseExpired(d.expiryDate);
              const safetyInfo = getSafetyBadge(d.safetyScore);
              const initials = d.name.split(" ").map(n => n[0]).join("").slice(0, 2);
              const scoreColor = d.safetyScore >= 90 ? "bg-emerald-500" : d.safetyScore >= 75 ? "bg-amber-500" : "bg-rose-500";

              return (
                <div key={d.id} className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 flex flex-col gap-4 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 group glass-panel">
                  {/* Top: status + alerts */}
                  <div className="flex items-center justify-between">
                    <Badge variant={statusConfig[d.status].variant} dot className="text-[10px] font-bold">{d.status}</Badge>
                    <div className="flex gap-1">
                      {expired && (
                        <Badge variant="destructive" className="text-[8px] gap-1">
                          <ShieldAlert className="h-2.5 w-2.5" /> Expired CDL
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Profile */}
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-primary/20 to-indigo-500/20 border border-primary/20 flex items-center justify-center font-black text-sm text-primary group-hover:from-primary/30 group-hover:to-indigo-500/30 transition-colors shrink-0">
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-base leading-tight truncate group-hover:text-primary transition-colors">{d.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{d.licenseCategory}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 border-t border-border/40 pt-3 text-xs">
                    {[
                      { icon: CreditCard, label: "License", value: d.licenseNumber, mono: true },
                      { icon: Calendar, label: "Expiry", value: d.expiryDate, highlight: expired },
                      { icon: Phone, label: "Contact", value: d.contactNumber },
                    ].map(({ icon: Icon, label, value, mono, highlight }) => (
                      <div key={label} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-muted-foreground shrink-0">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground/60" />{label}
                        </span>
                        <span className={cn("text-right truncate", mono ? "font-mono" : "font-medium", highlight ? "text-rose-500 font-bold" : "")}>
                          {value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Safety */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1 text-muted-foreground"><Star className="h-3.5 w-3.5 text-amber-500" />Safety Score</span>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black font-mono">{d.safetyScore}<span className="text-muted-foreground font-normal">/100</span></span>
                        <Badge variant={safetyInfo.variant} className="text-[9px]">{safetyInfo.text}</Badge>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-muted/50 overflow-hidden">
                      <div className={cn("h-full rounded-full transition-all", scoreColor)} style={{ width: `${d.safetyScore}%` }} />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-1 border-t border-border/40">
                    <Button variant="outline" size="sm" className="flex-1 text-xs gap-1.5"
                      onClick={() => handleOpenEdit(d)} disabled={d.status === "On Trip"}>
                      <Pencil className="h-3.5 w-3.5" /> Edit Profile
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg shrink-0"
                      onClick={() => handleOpenDelete(d)} disabled={d.status === "On Trip"}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* CREATE / EDIT DIALOG */}
      <Dialog isOpen={formOpen} onClose={() => setFormOpen(false)}
        title={editingDriver ? "Update Driver Record" : "Register New Operator"}
        description={editingDriver ? "Edit compliance details and contact options." : "Set up driver files and licensing categories."}>
        <form onSubmit={handleSaveDriver} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dname">Driver Full Name</Label>
            <Input id="dname" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Alexander Mercer" error={errors.name} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dlic">License Number</Label>
              <Input id="dlic" value={licNum} onChange={(e) => setLicNum(e.target.value)} placeholder="CDL-9982-A" error={errors.licNum} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dcat">CDL Category</Label>
              <Select id="dcat" value={licCat} onChange={(e) => setLicCat(e.target.value)}>
                <option value="Class A CDL">Class A CDL (Heavy Combinations)</option>
                <option value="Class B CDL">Class B CDL (Heavy Straight)</option>
                <option value="Class C CDL">Class C CDL (Hazmat/Passenger)</option>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dexp">CDL Expiry Date</Label>
              <Input id="dexp" type="date" value={expiry} onChange={(e) => setExpiry(e.target.value)} error={errors.expiry} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dcontact">Contact Phone</Label>
              <Input id="dcontact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="+1 (555) 019-2834" error={errors.contact} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="dsafety">Safety Rating (0–100)</Label>
              <Input id="dsafety" type="number" min="0" max="100" value={safetyScore || ""} onChange={(e) => setSafetyScore(Number(e.target.value))} error={errors.safety} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="dstatus">Status Setting</Label>
              <Select id="dstatus" value={status} onChange={(e) => setStatus(e.target.value as any)} disabled={status === "On Trip"}>
                <option value="Available">Available</option>
                <option value="On Trip" disabled>On Trip</option>
                <option value="Off Duty">Off Duty</option>
                <option value="Suspended">Suspended</option>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            <Button variant="outline" type="button" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">{editingDriver ? "Update Driver File" : "Register Operator"}</Button>
          </div>
        </form>
      </Dialog>

      <ConfirmDialog isOpen={deleteOpen} onClose={() => setDeleteOpen(false)}
        title="Deregister Driver"
        description={`Remove driver ${selectedDriver?.name} from the active roster? This action is permanent.`}
        confirmText="Remove Driver" confirmVariant="destructive" onConfirm={handleDeleteConfirm} />
    </Shell>
  );
}

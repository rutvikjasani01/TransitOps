"use client";

import React, { useState, useMemo } from "react";
import { DollarSign, PlusCircle, Truck, Sparkles } from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { DataTable, Column, FilterConfig } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Select, Label } from "@/components/ui/FormElements";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useToast } from "@/contexts/ToastContext";
import { Expense, ExpenseCategory } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { ExpenseBreakdownChart } from "@/components/charts/DashboardCharts";
import { cn } from "@/lib/utils";

const categoryVariants: Record<ExpenseCategory, "primary" | "destructive" | "warning" | "secondary" | "ghost"> = {
  Fuel: "primary", Maintenance: "destructive", Toll: "warning", Parking: "secondary", Other: "ghost"
};

export default function ExpensesPage() {
  const { expenses, vehicles, addExpense } = useTransitState();
  const { toast } = useToast();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [category, setCategory] = useState<ExpenseCategory>("Toll");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState("2026-07-12");
  const [desc, setDesc] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => { setCategory("Toll"); setAmount(0); setDate("2026-07-12"); setDesc(""); setVehicleId(""); setErrors({}); };

  const handleOpenAdd = () => { resetForm(); setAddModalOpen(true); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (amount <= 0) newErrors.amount = "Amount must be positive.";
    if (!desc) newErrors.desc = "Description is required.";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }
    addExpense({ category, amount, date, description: desc, vehicleId: vehicleId || undefined });
    toast("Custom expense logged successfully.", "success");
    setAddModalOpen(false);
  };

  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const fuel = expenses.filter(e => e.category === "Fuel").reduce((sum, e) => sum + e.amount, 0);
    const maint = expenses.filter(e => e.category === "Maintenance").reduce((sum, e) => sum + e.amount, 0);
    const toll = expenses.filter(e => e.category === "Toll").reduce((sum, e) => sum + e.amount, 0);
    const parking = expenses.filter(e => e.category === "Parking").reduce((sum, e) => sum + e.amount, 0);
    const other = expenses.filter(e => e.category === "Other").reduce((sum, e) => sum + e.amount, 0);
    return { total, fuel, maint, toll, parking, other };
  }, [expenses]);

  const chartData = useMemo(() => [
    { name: "Fuel", value: stats.fuel }, { name: "Maintenance", value: stats.maint },
    { name: "Toll", value: stats.toll }, { name: "Parking", value: stats.parking },
    { name: "Other", value: stats.other }
  ].filter(i => i.value > 0), [stats]);

  const filters: FilterConfig[] = [
    { key: "category", label: "Category", options: [
      { label: "Fuel", value: "Fuel" }, { label: "Maintenance", value: "Maintenance" },
      { label: "Toll", value: "Toll" }, { label: "Parking", value: "Parking" }, { label: "Other", value: "Other" }
    ]}
  ];

  const columns: Column<Expense>[] = [
    { header: "Description", accessorKey: "description", cell: (row) => (
      <div>
        <span className="font-semibold text-xs block">{row.description}</span>
        {row.vehicleId && (() => {
          const v = vehicles.find(v => v.id === row.vehicleId);
          return <span className="text-[9px] text-muted-foreground flex items-center gap-0.5 mt-0.5 font-mono"><Truck className="h-2.5 w-2.5" />{v?.registrationNumber || "TX-000-X"}</span>;
        })()}
      </div>
    )},
    { header: "Category", accessorKey: "category", cell: (row) => (
      <Badge variant={categoryVariants[row.category]} className="text-[9px]">{row.category}</Badge>
    )},
    { header: "Amount", accessorKey: "amount", sortable: true, cell: (row) => (
      <span className="font-bold text-xs">{formatCurrency(row.amount)}</span>
    )},
    { header: "Date", accessorKey: "date", sortable: true, cell: (row) => (
      <span className="font-mono text-xs text-muted-foreground">{row.date}</span>
    )},
  ];

  const summaryItems = [
    { label: "Total", value: stats.total, color: "text-foreground" },
    { label: "Fuel", value: stats.fuel, color: "text-blue-500" },
    { label: "Maintenance", value: stats.maint, color: "text-rose-400" },
    { label: "Toll", value: stats.toll, color: "text-amber-400" },
    { label: "Parking", value: stats.parking, color: "text-slate-400" },
    { label: "Other", value: stats.other, color: "text-purple-400" },
  ];

  return (
    <Shell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <DollarSign className="h-5 w-5 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-black tracking-tight">Accounts Payable</h1>
            </div>
            <p className="text-sm text-muted-foreground pl-[52px]">Monitor operational expenses, toll billing, and fuel receipts.</p>
          </div>
          <Button onClick={handleOpenAdd} className="gap-2 self-start sm:self-auto">
            <PlusCircle className="h-4 w-4" /> Log Custom Expense
          </Button>
        </div>

        {/* Summary strip */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {summaryItems.map((s) => (
            <div key={s.label} className="rounded-xl border border-border/50 bg-card/60 glass-panel px-3 py-3 text-center">
              <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider mb-1">{s.label}</span>
              <span className={cn("block text-sm font-black", s.color)}>{formatCurrency(s.value)}</span>
            </div>
          ))}
        </div>

        {/* Chart + Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-4 rounded-2xl border border-border/50 bg-card/60 glass-panel p-5">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="font-bold text-sm">Cost Factor Breakdown</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Expense ratio by operational category.</p>
            {chartData.length > 0 ? <ExpenseBreakdownChart data={chartData} /> : (
              <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground">No expenses logged.</div>
            )}
          </div>
          <div className="lg:col-span-8">
            <DataTable data={expenses} columns={columns} filters={filters} searchKey="description" searchPlaceholder="Search descriptions..." pageSize={5} />
          </div>
        </div>
      </div>

      <Dialog isOpen={addModalOpen} onClose={() => setAddModalOpen(false)}
        title="Log Fleet Expense"
        description="Write toll fees, parking passes, or custom maintenance bills to the ledger.">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ex-cat">Expense Category</Label>
              <Select id="ex-cat" value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)}>
                <option value="Toll">Toll Charges</option>
                <option value="Parking">Parking Fee</option>
                <option value="Other">Other Miscellaneous</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ex-amt">Amount ($)</Label>
              <Input id="ex-amt" type="number" value={amount || ""} onChange={(e) => setAmount(Number(e.target.value))} error={errors.amount} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ex-date">Record Date</Label>
              <Input id="ex-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ex-veh">Link Vehicle (Optional)</Label>
              <Select id="ex-veh" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
                <option value="">— General Expense —</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>{v.registrationNumber} – {v.name}</option>
                ))}
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="ex-desc">Billing Notes</Label>
            <Input id="ex-desc" value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Turnpike toll gate checkout receipt" error={errors.desc} />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
            <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit">Write Expense</Button>
          </div>
        </form>
      </Dialog>
    </Shell>
  );
}

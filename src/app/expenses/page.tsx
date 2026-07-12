"use client";

import React, { useState, useMemo } from "react";
import { 
  DollarSign, PlusCircle, CreditCard, Calendar, FileText,
  Truck, Tag, Sparkles
} from "lucide-react";
import { Shell } from "@/components/layout/Shell";
import { DataTable, Column, FilterConfig } from "@/components/ui/Table";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Input, Select, Label } from "@/components/ui/FormElements";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useToast } from "@/contexts/ToastContext";
import { Expense, ExpenseCategory } from "@/types";
import { formatCurrency, formatNumber } from "@/lib/utils";
import { ExpenseBreakdownChart } from "@/components/charts/DashboardCharts";

export default function ExpensesPage() {
  const { expenses, vehicles, addExpense } = useTransitState();
  const { toast } = useToast();

  const [addModalOpen, setAddModalOpen] = useState(false);

  // Form Inputs
  const [category, setCategory] = useState<ExpenseCategory>("Toll");
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState("2026-07-12");
  const [desc, setDesc] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setCategory("Toll");
    setAmount(0);
    setDate("2026-07-12");
    setDesc("");
    setVehicleId("");
    setErrors({});
  };

  const handleOpenAdd = () => {
    resetForm();
    setAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (amount <= 0) newErrors.amount = "Amount must be positive.";
    if (!desc) newErrors.desc = "Description is required.";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const res = await addExpense({
      category,
      amount,
      date,
      description: desc,
      vehicleId: vehicleId || undefined
    });

    if (res.success) {
      toast("Custom expense logged successfully.", "success");
      setAddModalOpen(false);
    } else {
      toast(res.error || "Failed to log expense.", "error");
    }
  };

  // Compute category statistics
  const stats = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const fuel = expenses.filter(e => e.category === "Fuel").reduce((sum, e) => sum + e.amount, 0);
    const maint = expenses.filter(e => e.category === "Maintenance").reduce((sum, e) => sum + e.amount, 0);
    const toll = expenses.filter(e => e.category === "Toll").reduce((sum, e) => sum + e.amount, 0);
    const parking = expenses.filter(e => e.category === "Parking").reduce((sum, e) => sum + e.amount, 0);
    const other = expenses.filter(e => e.category === "Other").reduce((sum, e) => sum + e.amount, 0);

    return {
      total,
      fuel,
      maint,
      toll,
      parking,
      other
    };
  }, [expenses]);

  // Chart data formatting
  const chartData = useMemo(() => {
    return [
      { name: "Fuel", value: stats.fuel },
      { name: "Maintenance", value: stats.maint },
      { name: "Toll Charges", value: stats.toll },
      { name: "Parking", value: stats.parking },
      { name: "Other", value: stats.other }
    ].filter(item => item.value > 0);
  }, [stats]);

  // Table configurations
  const filters: FilterConfig[] = [
    {
      key: "category",
      label: "Category",
      options: [
        { label: "Fuel Expenses", value: "Fuel" },
        { label: "Maintenance Tickets", value: "Maintenance" },
        { label: "Toll Passes", value: "Toll" },
        { label: "Parking Fees", value: "Parking" },
        { label: "Other Bills", value: "Other" }
      ]
    }
  ];

  const columns: Column<Expense>[] = [
    {
      header: "Expense Description",
      accessorKey: "description",
      cell: (row) => (
        <div>
          <span className="font-semibold block text-xs">{row.description}</span>
          {row.vehicleId && (() => {
            const vehicle = vehicles.find(v => v.id === row.vehicleId);
            return (
              <span className="text-[9px] text-muted-foreground font-mono flex items-center gap-0.5 mt-0.5">
                <Truck className="h-2.5 w-2.5 shrink-0" />
                Linked to {vehicle?.registrationNumber || "TX-000-X"}
              </span>
            );
          })()}
        </div>
      )
    },
    {
      header: "Category",
      accessorKey: "category",
      cell: (row) => {
        const variants = {
          Fuel: "primary",
          Maintenance: "destructive",
          Toll: "warning",
          Parking: "secondary",
          Other: "ghost"
        };
        return (
          <Badge variant={variants[row.category] as any} className="text-[9px] font-bold px-2 py-0">
            {row.category}
          </Badge>
        );
      }
    },
    {
      header: "Amount Charged",
      accessorKey: "amount",
      sortable: true,
      cell: (row) => <span className="font-extrabold text-foreground text-xs">{formatCurrency(row.amount)}</span>
    },
    {
      header: "Record Date",
      accessorKey: "date",
      sortable: true,
      cell: (row) => <span className="font-mono text-xs text-muted-foreground">{row.date}</span>
    }
  ];

  return (
    <Shell>
      <div className="space-y-6">
        
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold tracking-tight text-foreground flex items-center space-x-2">
              <DollarSign className="h-8 w-8 text-primary shrink-0" />
              <span>Accounts Payable</span>
            </h1>
            <p className="text-sm text-muted-foreground">
              Monitor operational expenses, toll billing statements, and fuel refill receipts.
            </p>
          </div>

          <Button 
            onClick={handleOpenAdd}
            className="gap-1.5 h-10 px-4"
          >
            <PlusCircle className="h-4.5 w-4.5" />
            Log Custom Expense
          </Button>
        </div>

        {/* Quick budget grid summary */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          
          <div className="rounded-xl border border-white/5 bg-slate-900/60 backdrop-blur-md p-3 text-center space-y-1">
            <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Accumulated Cost</span>
            <span className="block text-base font-black text-foreground">{formatCurrency(stats.total)}</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-900/60 backdrop-blur-md p-3 text-center space-y-1">
            <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Fuel Bills</span>
            <span className="block text-base font-black text-primary">{formatCurrency(stats.fuel)}</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-900/60 backdrop-blur-md p-3 text-center space-y-1">
            <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Maintenance</span>
            <span className="block text-base font-black text-rose-400">{formatCurrency(stats.maint)}</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-900/60 backdrop-blur-md p-3 text-center space-y-1">
            <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Toll Passes</span>
            <span className="block text-base font-black text-amber-400">{formatCurrency(stats.toll)}</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-900/60 backdrop-blur-md p-3 text-center space-y-1">
            <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Parking Lots</span>
            <span className="block text-base font-black text-slate-300">{formatCurrency(stats.parking)}</span>
          </div>

          <div className="rounded-xl border border-white/5 bg-slate-900/60 backdrop-blur-md p-3 text-center space-y-1">
            <span className="block text-[9px] text-muted-foreground uppercase font-bold tracking-wider">Other General</span>
            <span className="block text-base font-black text-purple-400">{formatCurrency(stats.other)}</span>
          </div>

        </div>

        {/* Dynamic Split Charts & Ledger */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Donut chart */}
          <div className="lg:col-span-4 p-5 rounded-xl border border-border bg-card/45 glass-panel flex flex-col justify-between">
            <div className="space-y-1 pb-4">
              <h3 className="font-bold text-foreground text-sm uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-warning shrink-0 animate-pulse" /> Operating Cost Factor
              </h3>
              <p className="text-xs text-muted-foreground">Expense share ratio grouped by operational categories.</p>
            </div>
            {chartData.length > 0 ? (
              <ExpenseBreakdownChart data={chartData} />
            ) : (
              <div className="h-[260px] flex items-center justify-center text-xs text-muted-foreground">
                No logged expenses available.
              </div>
            )}
          </div>

          {/* Table list */}
          <div className="lg:col-span-8">
            <DataTable
              data={expenses}
              columns={columns}
              filters={filters}
              searchKey="description"
              searchPlaceholder="Search expense descriptions..."
              pageSize={5}
            />
          </div>

        </div>

      </div>

      {/* RECORD CUSTOM EXPENSE MODAL */}
      <Dialog
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Log Fleet Expense"
        description="Write toll fees, layover parking passes, or custom maintenance bills to the platform ledger."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="ex-cat">Expense Category</Label>
              <Select
                id="ex-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              >
                <option value="Toll">Toll Charges</option>
                <option value="Parking">Parking Fee</option>
                <option value="Other">Other Miscellaneous</option>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="ex-amt">Amount Charged ($)</Label>
              <Input
                id="ex-amt"
                type="number"
                value={amount || ""}
                onChange={(e) => setAmount(Number(e.target.value))}
                error={errors.amount}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="ex-date">Record Date</Label>
              <Input
                id="ex-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="ex-veh">Link Vehicle (Optional)</Label>
              <Select
                id="ex-veh"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
              >
                <option value="">-- General Expense --</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} - {v.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="space-y-1">
            <Label htmlFor="ex-desc">Billing Notes / Description</Label>
            <Input
              id="ex-desc"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="e.g. Turnpike toll gate checkout receipt"
              error={errors.desc}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-border/50">
            <Button variant="outline" type="button" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              Write Expense
            </Button>
          </div>
        </form>
      </Dialog>

    </Shell>
  );
}

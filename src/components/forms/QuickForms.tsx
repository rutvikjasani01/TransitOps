"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Label, Textarea } from "@/components/ui/FormElements";
import { useTransitState } from "@/contexts/TransitStateContext";
import { useToast } from "@/contexts/ToastContext";

// 1. TRIP / DISPATCH FORM
export function TripForm({ onClose }: { onClose: () => void }) {
  const { vehicles, drivers, addTrip } = useTransitState();
  const { toast } = useToast();

  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [vehicleId, setVehicleId] = useState("");
  const [driverId, setDriverId] = useState("");
  const [cargoWeight, setCargoWeight] = useState(0);
  const [plannedDistance, setPlannedDistance] = useState(0);
  const [date, setDate] = useState("2026-07-12");
  const [weightWarning, setWeightWarning] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (vehicleId && cargoWeight > 0) {
      const selectedVehicle = vehicles.find(v => v.id === vehicleId);
      if (selectedVehicle && cargoWeight > selectedVehicle.maxCapacity) {
        setWeightWarning(`Warning: Cargo weight (${cargoWeight} kg) exceeds vehicle max capacity (${selectedVehicle.maxCapacity} kg).`);
      } else {
        setWeightWarning("");
      }
    } else {
      setWeightWarning("");
    }
  }, [vehicleId, cargoWeight, vehicles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!source) newErrors.source = "Source is required.";
    if (!destination) newErrors.destination = "Destination is required.";
    if (!vehicleId) newErrors.vehicleId = "Vehicle is required.";
    if (!driverId) newErrors.driverId = "Driver is required.";
    if (cargoWeight <= 0) newErrors.cargoWeight = "Weight must be greater than 0.";
    if (plannedDistance <= 0) newErrors.plannedDistance = "Distance must be greater than 0.";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    if (selectedVehicle && cargoWeight > selectedVehicle.maxCapacity) {
      toast("Dispatch failed: Cargo exceeds vehicle capacity.", "error"); return;
    }

    const res = addTrip({ source, destination, vehicleId, driverId, cargoWeight, plannedDistance, date });
    if (res.success) { toast("Trip route scheduled successfully!", "success"); onClose(); }
    else toast(res.error || "Failed to create trip.", "error");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="source">Source Hub</Label>
          <Input id="source" value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. Chicago Terminal" error={errors.source} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="destination">Destination</Label>
          <Input id="destination" value={destination} onChange={(e) => setDestination(e.target.value)} placeholder="e.g. Dallas Hub" error={errors.destination} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="vehicle">Select Vehicle</Label>
        <Select id="vehicle" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} error={errors.vehicleId}>
          <option value="">— Select Available Vehicle —</option>
          {vehicles.map((v) => {
            const isDisabled = v.status !== "Available";
            return (
              <option key={v.id} value={v.id} disabled={isDisabled}>
                {v.registrationNumber} – {v.name} {isDisabled ? `(${v.status})` : `· Capacity: ${v.maxCapacity} kg`}
              </option>
            );
          })}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="driver">Select Driver</Label>
        <Select id="driver" value={driverId} onChange={(e) => setDriverId(e.target.value)} error={errors.driverId}>
          <option value="">— Select Available Driver —</option>
          {drivers.map((d) => {
            const isExpired = new Date(d.expiryDate) < new Date("2026-07-12");
            const isDisabled = isExpired || d.status === "Suspended" || d.status === "On Trip" || d.status === "Off Duty";
            let suffix = isExpired ? " (Expired CDL)" : d.status === "Suspended" ? " (Suspended)" : d.status === "On Trip" ? " (On Trip)" : d.status === "Off Duty" ? " (Off Duty)" : ` · Score: ${d.safetyScore}`;
            return (
              <option key={d.id} value={d.id} disabled={isDisabled}>{d.name}{suffix}</option>
            );
          })}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="weight">Cargo Weight (kg)</Label>
          <Input id="weight" type="number" value={cargoWeight || ""} onChange={(e) => setCargoWeight(Number(e.target.value))} error={errors.cargoWeight} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="distance">Planned Distance (km)</Label>
          <Input id="distance" type="number" value={plannedDistance || ""} onChange={(e) => setPlannedDistance(Number(e.target.value))} error={errors.plannedDistance} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="date">Scheduled Date</Label>
        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      {weightWarning && (
        <div className="p-3 text-xs bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          {weightWarning}
        </div>
      )}
      <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="submit">Save Route</Button>
      </div>
    </form>
  );
}

// 2. MAINTENANCE LOG / BOOKING FORM
export function MaintenanceForm({ onClose }: { onClose: () => void }) {
  const { vehicles, addMaintenance } = useTransitState();
  const { toast } = useToast();

  const [vehicleId, setVehicleId] = useState("");
  const [type, setType] = useState<any>("Routine");
  const [cost, setCost] = useState(0);
  const [date, setDate] = useState("2026-07-12");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!vehicleId) newErrors.vehicleId = "Vehicle is required.";
    if (cost <= 0) newErrors.cost = "Cost must be positive.";
    if (!notes) newErrors.notes = "Notes description is required.";
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    if (selectedVehicle && selectedVehicle.status === "On Trip") { toast("Error: Cannot place vehicle in shop while on a trip.", "error"); return; }

    const res = addMaintenance({ vehicleId, type, cost, date, notes });
    if (res.success) { toast("Maintenance ticket created. Vehicle sent to shop.", "success"); onClose(); }
    else toast(res.error || "Failed to schedule maintenance.", "error");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="m-vehicle">Vehicle to Service</Label>
        <Select id="m-vehicle" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} error={errors.vehicleId}>
          <option value="">— Select Vehicle —</option>
          {vehicles.map((v) => {
            const isDisabled = v.status === "On Trip" || v.status === "Retired";
            return (
              <option key={v.id} value={v.id} disabled={isDisabled}>
                {v.registrationNumber} – {v.name} {isDisabled ? `(${v.status})` : `· Odo: ${v.odometer} km`}
              </option>
            );
          })}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="m-type">Service Type</Label>
          <Select id="m-type" value={type} onChange={(e) => setType(e.target.value as any)}>
            <option value="Routine">Routine Inspection</option>
            <option value="Repair">Mechanical Repair</option>
            <option value="Inspection">Safety Verification</option>
            <option value="Emergency">Emergency Fix</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="m-cost">Est. Cost ($)</Label>
          <Input id="m-cost" type="number" value={cost || ""} onChange={(e) => setCost(Number(e.target.value))} error={errors.cost} />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="m-date">Service Date</Label>
        <Input id="m-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="m-notes">Diagnostics Notes</Label>
        <Textarea id="m-notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Describe symptoms, parts replaced, or inspection details..." error={errors.notes} />
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="submit">Send to Shop</Button>
      </div>
    </form>
  );
}

// 3. FUEL FILL LOG FORM
export function FuelForm({ onClose }: { onClose: () => void }) {
  const { vehicles, addFuelLog } = useTransitState();
  const { toast } = useToast();

  const [vehicleId, setVehicleId] = useState("");
  const [liters, setLiters] = useState(0);
  const [cost, setCost] = useState(0);
  const [odometer, setOdometer] = useState(0);
  const [date, setDate] = useState("2026-07-12");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (vehicleId) {
      const selected = vehicles.find(v => v.id === vehicleId);
      if (selected) setOdometer(selected.odometer);
    }
  }, [vehicleId, vehicles]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    if (!vehicleId) newErrors.vehicleId = "Vehicle is required.";
    if (liters <= 0) newErrors.liters = "Liters must be positive.";
    if (cost <= 0) newErrors.cost = "Cost must be positive.";
    const selected = vehicles.find(v => v.id === vehicleId);
    if (selected && odometer < selected.odometer) {
      newErrors.odometer = `Odometer cannot be lower than current mileage (${selected.odometer} km).`;
    }
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return; }

    const res = addFuelLog({ vehicleId, liters, cost, odometer, date });
    if (res.success) { toast("Fuel entry logged. Expense automatically added.", "success"); onClose(); }
    else toast(res.error || "Failed to log fuel refill.", "error");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="f-vehicle">Refueled Vehicle</Label>
        <Select id="f-vehicle" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)} error={errors.vehicleId}>
          <option value="">— Select Vehicle —</option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id} disabled={v.status === "Retired"}>
              {v.registrationNumber} – {v.name} (Mileage: {v.odometer} km)
            </option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="f-liters">Volume (Liters)</Label>
          <Input id="f-liters" type="number" value={liters || ""} onChange={(e) => setLiters(Number(e.target.value))} error={errors.liters} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-cost">Refill Cost ($)</Label>
          <Input id="f-cost" type="number" value={cost || ""} onChange={(e) => setCost(Number(e.target.value))} error={errors.cost} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="f-odo">Current Odometer (km)</Label>
          <Input id="f-odo" type="number" value={odometer || ""} onChange={(e) => setOdometer(Number(e.target.value))} error={errors.odometer} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="f-date">Refill Date</Label>
          <Input id="f-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
        <Button variant="primary" type="submit">Log Fuel</Button>
      </div>
    </form>
  );
}

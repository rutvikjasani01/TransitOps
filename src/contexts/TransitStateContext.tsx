"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Vehicle, Driver, Trip, Maintenance, FuelLog, Expense, SystemNotification, UserRole } from "../types";
import {
  MOCK_VEHICLES,
  MOCK_DRIVERS,
  MOCK_TRIPS,
  MOCK_MAINTENANCE,
  MOCK_FUEL_LOGS,
  MOCK_EXPENSES,
  MOCK_NOTIFICATIONS
} from "../constants";

type TransitStateContextType = {
  // Authentication & Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: { name: string; email: string } | null;
  login: (email: string, role: UserRole) => boolean;
  logout: () => void;

  // Collections
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: Maintenance[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  notifications: SystemNotification[];

  // Vehicle Mutations
  addVehicle: (vehicle: Omit<Vehicle, "id">) => { success: boolean; error?: string };
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => { success: boolean; error?: string };
  deleteVehicle: (id: string) => { success: boolean; error?: string };

  // Driver Mutations
  addDriver: (driver: Omit<Driver, "id">) => { success: boolean; error?: string };
  updateDriver: (id: string, driver: Partial<Driver>) => { success: boolean; error?: string };
  deleteDriver: (id: string) => { success: boolean; error?: string };

  // Trip Mutations
  addTrip: (trip: Omit<Trip, "id" | "status">) => { success: boolean; error?: string };
  updateTrip: (id: string, trip: Partial<Trip>) => { success: boolean; error?: string };
  dispatchTrip: (id: string) => { success: boolean; error?: string };
  completeTrip: (id: string) => { success: boolean; error?: string };
  cancelTrip: (id: string) => { success: boolean; error?: string };

  // Maintenance Mutations
  addMaintenance: (maintenance: Omit<Maintenance, "id" | "status">) => { success: boolean; error?: string };
  closeMaintenance: (id: string) => { success: boolean; error?: string };

  // Fuel Mutations
  addFuelLog: (log: Omit<FuelLog, "id">) => { success: boolean; error?: string };

  // Expense Mutations
  addExpense: (expense: Omit<Expense, "id">) => { success: boolean; error?: string };

  // Notification Mutations
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  addSystemNotification: (type: SystemNotification["type"], title: string, message: string) => void;
};

const TransitStateContext = createContext<TransitStateContextType | undefined>(undefined);

export function TransitStateProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>("Fleet Manager");
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>({
    name: "John Doe",
    email: "manager@navix.com"
  });

  // State collections loaded from localStorage or fallback to constants
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<Maintenance[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  // Seed on mount
  useEffect(() => {
    const localVehicles = localStorage.getItem("navix_vehicles") || localStorage.getItem("transitops_vehicles");
    const localDrivers = localStorage.getItem("navix_drivers") || localStorage.getItem("transitops_drivers");
    const localTrips = localStorage.getItem("navix_trips") || localStorage.getItem("transitops_trips");
    const localMaintenance = localStorage.getItem("navix_maintenance") || localStorage.getItem("transitops_maintenance");
    const localFuel = localStorage.getItem("navix_fuel") || localStorage.getItem("transitops_fuel");
    const localExpenses = localStorage.getItem("navix_expenses") || localStorage.getItem("transitops_expenses");
    const localNotifications = localStorage.getItem("navix_notifications") || localStorage.getItem("transitops_notifications");
    const localRole = (localStorage.getItem("navix_role") || localStorage.getItem("transitops_role")) as UserRole;
    const localUser = localStorage.getItem("navix_user") || localStorage.getItem("transitops_user");

    setVehicles(localVehicles ? JSON.parse(localVehicles) : MOCK_VEHICLES);
    setDrivers(localDrivers ? JSON.parse(localDrivers) : MOCK_DRIVERS);
    setTrips(localTrips ? JSON.parse(localTrips) : MOCK_TRIPS);
    setMaintenanceLogs(localMaintenance ? JSON.parse(localMaintenance) : MOCK_MAINTENANCE);
    setFuelLogs(localFuel ? JSON.parse(localFuel) : MOCK_FUEL_LOGS);
    setExpenses(localExpenses ? JSON.parse(localExpenses) : MOCK_EXPENSES);
    setNotifications(localNotifications ? JSON.parse(localNotifications) : MOCK_NOTIFICATIONS);

    if (localRole) setCurrentRole(localRole);
    if (localUser) setCurrentUser(JSON.parse(localUser));
  }, []);

  // Helpers to persist
  const save = (key: string, data: any) => {
    const newKey = key.replace("transitops_", "navix_");
    localStorage.setItem(newKey, JSON.stringify(data));
  };

  // Auth Functions
  const login = (email: string, role: UserRole): boolean => {
    const name = email.split("@")[0].split(".").map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(" ");
    const user = { name: name || "User", email };
    setCurrentUser(user);
    setCurrentRole(role);
    localStorage.setItem("navix_role", role);
    save("navix_user", user);
    addSystemNotification("success", "Logged In", `Welcome back, ${user.name}! Switched role to ${role}.`);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("navix_user");
    localStorage.removeItem("navix_role");
  };

  // Notifications helper
  const addSystemNotification = (type: SystemNotification["type"], title: string, message: string) => {
    const newNotif: SystemNotification = {
      id: `n-${Date.now()}`,
      type,
      title,
      message,
      timestamp: "Just now",
      read: false
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      save("transitops_notifications", updated);
      return updated;
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      save("transitops_notifications", updated);
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    save("transitops_notifications", []);
  };

  // Vehicle Functions
  const addVehicle = (vehicleData: Omit<Vehicle, "id">) => {
    const duplicate = vehicles.some(v => v.registrationNumber.toUpperCase() === vehicleData.registrationNumber.toUpperCase());
    if (duplicate) {
      return { success: false, error: `Registration number ${vehicleData.registrationNumber} already exists!` };
    }
    const newVehicle: Vehicle = {
      ...vehicleData,
      id: `v-${Date.now()}`
    };
    const updated = [newVehicle, ...vehicles];
    setVehicles(updated);
    save("transitops_vehicles", updated);
    addSystemNotification("success", "Vehicle Added", `Vehicle ${newVehicle.registrationNumber} added successfully.`);
    return { success: true };
  };

  const updateVehicle = (id: string, partial: Partial<Vehicle>) => {
    if (partial.registrationNumber) {
      const duplicate = vehicles.some(v => v.id !== id && v.registrationNumber.toUpperCase() === partial.registrationNumber!.toUpperCase());
      if (duplicate) {
        return { success: false, error: `Registration number ${partial.registrationNumber} is already in use by another vehicle!` };
      }
    }
    const updated = vehicles.map(v => v.id === id ? { ...v, ...partial } : v);
    setVehicles(updated);
    save("transitops_vehicles", updated);
    return { success: true };
  };

  const deleteVehicle = (id: string) => {
    // Check if vehicle is active on a trip
    const activeTrip = trips.some(t => t.vehicleId === id && t.status === "Dispatched");
    if (activeTrip) {
      return { success: false, error: "Cannot delete a vehicle that is currently on an active trip." };
    }
    const updated = vehicles.filter(v => v.id !== id);
    setVehicles(updated);
    save("transitops_vehicles", updated);
    addSystemNotification("info", "Vehicle Deleted", "A vehicle record has been removed from the fleet.");
    return { success: true };
  };

  // Driver Functions
  const addDriver = (driverData: Omit<Driver, "id">) => {
    const newDriver: Driver = {
      ...driverData,
      id: `d-${Date.now()}`
    };
    const updated = [newDriver, ...drivers];
    setDrivers(updated);
    save("transitops_drivers", updated);
    addSystemNotification("success", "Driver Registered", `${newDriver.name} is now registered in the pool.`);
    return { success: true };
  };

  const updateDriver = (id: string, partial: Partial<Driver>) => {
    const updated = drivers.map(d => d.id === id ? { ...d, ...partial } : d);
    setDrivers(updated);
    save("transitops_drivers", updated);
    return { success: true };
  };

  const deleteDriver = (id: string) => {
    const activeTrip = trips.some(t => t.driverId === id && t.status === "Dispatched");
    if (activeTrip) {
      return { success: false, error: "Cannot remove a driver who is currently dispatched on an active trip." };
    }
    const updated = drivers.filter(d => d.id !== id);
    setDrivers(updated);
    save("transitops_drivers", updated);
    addSystemNotification("info", "Driver Removed", "A driver record has been removed.");
    return { success: true };
  };

  // Trip Functions
  const addTrip = (tripData: Omit<Trip, "id" | "status">) => {
    const newTrip: Trip = {
      ...tripData,
      id: `t-${Date.now()}`,
      status: "Draft"
    };
    const updated = [newTrip, ...trips];
    setTrips(updated);
    save("transitops_trips", updated);
    addSystemNotification("info", "Trip Scheduled", `New trip draft saved from ${tripData.source} to ${tripData.destination}.`);
    return { success: true };
  };

  const updateTrip = (id: string, partial: Partial<Trip>) => {
    const updated = trips.map(t => t.id === id ? { ...t, ...partial } : t);
    setTrips(updated);
    save("transitops_trips", updated);
    return { success: true };
  };

  const dispatchTrip = (id: string) => {
    const trip = trips.find(t => t.id === id);
    if (!trip) return { success: false, error: "Trip not found" };

    const vehicle = vehicles.find(v => v.id === trip.vehicleId);
    const driver = drivers.find(d => d.id === trip.driverId);

    if (!vehicle) return { success: false, error: "Selected vehicle does not exist." };
    if (!driver) return { success: false, error: "Selected driver does not exist." };

    // Validations:
    // 1. Cargo weight vs capacity
    if (trip.cargoWeight > vehicle.maxCapacity) {
      return {
        success: false,
        error: `Cargo weight (${trip.cargoWeight} kg) exceeds vehicle capacity (${vehicle.maxCapacity} kg) for ${vehicle.name}.`
      };
    }

    // 2. Driver license expiry check (System Date is 2026-07-12)
    const systemDate = new Date("2026-07-12");
    const expiry = new Date(driver.expiryDate);
    if (expiry < systemDate) {
      return {
        success: false,
        error: `Cannot dispatch. Driver ${driver.name} has an expired license (Expiry: ${driver.expiryDate}).`
      };
    }

    // 3. Driver suspended check
    if (driver.status === "Suspended") {
      return {
        success: false,
        error: `Cannot dispatch. Driver ${driver.name} is currently suspended.`
      };
    }

    // 4. Vehicle status check (On Trip, In Shop, Retired)
    if (vehicle.status === "On Trip") {
      return { success: false, error: `Vehicle ${vehicle.registrationNumber} is already on another active trip.` };
    }
    if (vehicle.status === "In Shop") {
      return { success: false, error: `Vehicle ${vehicle.registrationNumber} is in maintenance shop.` };
    }
    if (vehicle.status === "Retired") {
      return { success: false, error: `Vehicle ${vehicle.registrationNumber} is retired from service.` };
    }

    // 5. Driver active check
    if (driver.status === "On Trip") {
      return { success: false, error: `Driver ${driver.name} is already dispatched on another trip.` };
    }

    // Process dispatch
    // Update trip status
    const updatedTrips = trips.map(t => t.id === id ? { ...t, status: "Dispatched" as const } : t);
    setTrips(updatedTrips);
    save("transitops_trips", updatedTrips);

    // Update vehicle status
    const updatedVehicles = vehicles.map(v => v.id === vehicle.id ? { ...v, status: "On Trip" as const } : v);
    setVehicles(updatedVehicles);
    save("transitops_vehicles", updatedVehicles);

    // Update driver status
    const updatedDrivers = drivers.map(d => d.id === driver.id ? { ...d, status: "On Trip" as const } : d);
    setDrivers(updatedDrivers);
    save("transitops_drivers", updatedDrivers);

    addSystemNotification(
      "success",
      "Trip Dispatched",
      `Trip ${trip.id} dispatched! Vehicle ${vehicle.registrationNumber} and Driver ${driver.name} are now On Trip.`
    );

    return { success: true };
  };

  const completeTrip = (id: string) => {
    const trip = trips.find(t => t.id === id);
    if (!trip) return { success: false, error: "Trip not found" };

    // Update trip status
    const updatedTrips = trips.map(t => t.id === id ? { ...t, status: "Completed" as const } : t);
    setTrips(updatedTrips);
    save("transitops_trips", updatedTrips);

    // Update vehicle: Available + add distance to Odometer
    const updatedVehicles = vehicles.map(v =>
      v.id === trip.vehicleId ? { ...v, status: "Available" as const, odometer: v.odometer + trip.plannedDistance } : v
    );
    setVehicles(updatedVehicles);
    save("transitops_vehicles", updatedVehicles);

    // Update driver: Available
    const updatedDrivers = drivers.map(d =>
      d.id === trip.driverId ? { ...d, status: "Available" as const } : d
    );
    setDrivers(updatedDrivers);
    save("transitops_drivers", updatedDrivers);

    addSystemNotification(
      "success",
      "Trip Completed",
      `Trip ${trip.id} completed. Vehicle odometer updated. Vehicle and Driver are now Available.`
    );

    return { success: true };
  };

  const cancelTrip = (id: string) => {
    const trip = trips.find(t => t.id === id);
    if (!trip) return { success: false, error: "Trip not found" };

    // Update trip status
    const updatedTrips = trips.map(t => t.id === id ? { ...t, status: "Cancelled" as const } : t);
    setTrips(updatedTrips);
    save("transitops_trips", updatedTrips);

    // Release vehicle and driver if they were On Trip on this route
    if (trip.status === "Dispatched") {
      const updatedVehicles = vehicles.map(v =>
        v.id === trip.vehicleId && v.status === "On Trip" ? { ...v, status: "Available" as const } : v
      );
      setVehicles(updatedVehicles);
      save("transitops_vehicles", updatedVehicles);

      const updatedDrivers = drivers.map(d =>
        d.id === trip.driverId && d.status === "On Trip" ? { ...d, status: "Available" as const } : d
      );
      setDrivers(updatedDrivers);
      save("transitops_drivers", updatedDrivers);
    }

    addSystemNotification(
      "info",
      "Trip Cancelled",
      `Trip ${trip.id} has been cancelled. Allocated vehicle and driver have been returned to Available pool.`
    );

    return { success: true };
  };

  // Maintenance Functions
  const addMaintenance = (maintData: Omit<Maintenance, "id" | "status">) => {
    const vehicle = vehicles.find(v => v.id === maintData.vehicleId);
    if (!vehicle) return { success: false, error: "Vehicle not found" };

    // Validation: Cannot place retired or already active vehicle in maintenance without warning, 
    // but here we forcefully place the vehicle 'In Shop'.
    if (vehicle.status === "On Trip") {
      return { success: false, error: `Vehicle ${vehicle.registrationNumber} is currently dispatched on an active trip.` };
    }

    const newMaint: Maintenance = {
      ...maintData,
      id: `m-${Date.now()}`,
      status: "Open"
    };

    const updatedM = [newMaint, ...maintenanceLogs];
    setMaintenanceLogs(updatedM);
    save("transitops_maintenance", updatedM);

    // Update Vehicle to "In Shop"
    const updatedVehicles = vehicles.map(v =>
      v.id === maintData.vehicleId ? { ...v, status: "In Shop" as const } : v
    );
    setVehicles(updatedVehicles);
    save("transitops_vehicles", updatedVehicles);

    // Record Maintenance Cost as an Expense
    addExpense({
      category: "Maintenance",
      amount: maintData.cost,
      date: maintData.date,
      description: `Maintenance (${maintData.type}) for ${vehicle.name}: ${maintData.notes}`,
      vehicleId: vehicle.id
    });

    addSystemNotification(
      "warning",
      "Maintenance Opened",
      `Maintenance ticket opened for ${vehicle.registrationNumber}. Status set to 'In Shop'.`
    );

    return { success: true };
  };

  const closeMaintenance = (id: string) => {
    const log = maintenanceLogs.find(m => m.id === id);
    if (!log) return { success: false, error: "Maintenance log not found." };

    const updatedM = maintenanceLogs.map(m =>
      m.id === id ? { ...m, status: "Completed" as const } : m
    );
    setMaintenanceLogs(updatedM);
    save("transitops_maintenance", updatedM);

    // Check if the vehicle has any other open maintenance tickets. If not, set to "Available".
    const vehicleHasOtherOpen = updatedM.some(m => m.vehicleId === log.vehicleId && m.status === "Open");
    if (!vehicleHasOtherOpen) {
      const updatedVehicles = vehicles.map(v =>
        v.id === log.vehicleId && v.status === "In Shop" ? { ...v, status: "Available" as const } : v
      );
      setVehicles(updatedVehicles);
      save("transitops_vehicles", updatedVehicles);
    }

    addSystemNotification(
      "success",
      "Maintenance Closed",
      `Maintenance ticket ${id} closed. Vehicle status set to 'Available'.`
    );

    return { success: true };
  };

  // Fuel Functions
  const addFuelLog = (fuelData: Omit<FuelLog, "id">) => {
    const vehicle = vehicles.find(v => v.id === fuelData.vehicleId);
    if (!vehicle) return { success: false, error: "Vehicle not found" };

    // Optional efficiency calculation based on previous odometer
    const previousLogs = fuelLogs
      .filter(f => f.vehicleId === fuelData.vehicleId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let efficiency: number | undefined = undefined;
    if (previousLogs.length > 0) {
      const lastOdometer = previousLogs[0].odometer;
      const distanceDiff = fuelData.odometer - lastOdometer;
      if (distanceDiff > 0 && fuelData.liters > 0) {
        efficiency = parseFloat((distanceDiff / fuelData.liters).toFixed(2));
      }
    } else {
      // Fallback fallback or estimate based on type
      if (vehicle.type === "Semi") efficiency = 2.8;
      else if (vehicle.type === "Box Truck") efficiency = 5.2;
      else efficiency = 8.5; // Van
    }

    const newFuel: FuelLog = {
      ...fuelData,
      id: `f-${Date.now()}`,
      efficiency
    };

    const updatedF = [newFuel, ...fuelLogs];
    setFuelLogs(updatedF);
    save("transitops_fuel", updatedF);

    // Auto-update vehicle odometer if fuel log odometer is greater
    if (fuelData.odometer > vehicle.odometer) {
      const updatedVehicles = vehicles.map(v =>
        v.id === fuelData.vehicleId ? { ...v, odometer: fuelData.odometer } : v
      );
      setVehicles(updatedVehicles);
      save("transitops_vehicles", updatedVehicles);
    }

    // Log expense
    addExpense({
      category: "Fuel",
      amount: fuelData.cost,
      date: fuelData.date,
      description: `Fuel Fill: ${fuelData.liters}L for ${vehicle.name}`,
      vehicleId: vehicle.id
    });

    addSystemNotification(
      "success",
      "Fuel Logged",
      `Logged ${fuelData.liters} liters for ${vehicle.registrationNumber}. Odometer updated to ${fuelData.odometer} km.`
    );

    return { success: true };
  };

  // Expense Functions
  const addExpense = (expenseData: Omit<Expense, "id">) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `e-${Date.now()}`
    };
    const updatedE = [newExpense, ...expenses];
    setExpenses(updatedE);
    save("transitops_expenses", updatedE);
    return { success: true };
  };

  return (
    <TransitStateContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentUser,
        login,
        logout,
        vehicles,
        drivers,
        trips,
        maintenanceLogs,
        fuelLogs,
        expenses,
        notifications,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        addDriver,
        updateDriver,
        deleteDriver,
        addTrip,
        updateTrip,
        dispatchTrip,
        completeTrip,
        cancelTrip,
        addMaintenance,
        closeMaintenance,
        addFuelLog,
        addExpense,
        markNotificationAsRead,
        clearAllNotifications,
        addSystemNotification
      }}
    >
      {children}
    </TransitStateContext.Provider>
  );
}

export function useTransitState() {
  const context = useContext(TransitStateContext);
  if (context === undefined) {
    throw new Error("useTransitState must be used within a TransitStateProvider");
  }
  return context;
}

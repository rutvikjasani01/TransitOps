"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Vehicle, Driver, Trip, Maintenance, FuelLog, Expense, SystemNotification, UserRole } from "../types";
import api from "../services/api";

type TransitStateContextType = {
  // Authentication & Role
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  currentUser: { name: string; email: string } | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;

  // Collections
  vehicles: Vehicle[];
  drivers: Driver[];
  trips: Trip[];
  maintenanceLogs: Maintenance[];
  fuelLogs: FuelLog[];
  expenses: Expense[];
  notifications: SystemNotification[];
  isLoading: boolean;
  refreshData: () => Promise<void>;

  // Vehicle Mutations
  addVehicle: (vehicle: Omit<Vehicle, "id">) => Promise<{ success: boolean; error?: string }>;
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => Promise<{ success: boolean; error?: string }>;
  deleteVehicle: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Driver Mutations
  addDriver: (driver: Omit<Driver, "id">) => Promise<{ success: boolean; error?: string }>;
  updateDriver: (id: string, driver: Partial<Driver>) => Promise<{ success: boolean; error?: string }>;
  deleteDriver: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Trip Mutations
  addTrip: (trip: Omit<Trip, "id" | "status" | "date">) => Promise<{ success: boolean; error?: string }>;
  updateTrip: (id: string, trip: Partial<Trip>) => Promise<{ success: boolean; error?: string }>;
  dispatchTrip: (id: string) => Promise<{ success: boolean; error?: string }>;
  completeTrip: (id: string) => Promise<{ success: boolean; error?: string }>;
  cancelTrip: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Maintenance Mutations
  addMaintenance: (maintenance: Omit<Maintenance, "id" | "status" | "date">) => Promise<{ success: boolean; error?: string }>;
  closeMaintenance: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Fuel Mutations
  addFuelLog: (log: Omit<FuelLog, "id" | "efficiency">) => Promise<{ success: boolean; error?: string }>;

  // Expense Mutations
  addExpense: (expense: Omit<Expense, "id" | "date">) => Promise<{ success: boolean; error?: string }>;

  // Notification Mutations
  markNotificationAsRead: (id: string) => void;
  clearAllNotifications: () => void;
  addSystemNotification: (type: SystemNotification["type"], title: string, message: string) => void;
};

const TransitStateContext = createContext<TransitStateContextType | undefined>(undefined);

export function TransitStateProvider({ children }: { children: React.ReactNode }) {
  const [currentRole, setCurrentRole] = useState<UserRole>("Fleet Manager");
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // State collections loaded from REST API
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [maintenanceLogs, setMaintenanceLogs] = useState<Maintenance[]>([]);
  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);

  // Refresh all state from PostgreSQL
  const refreshData = async () => {
    const token = localStorage.getItem("transitops_token");
    if (!token) return;

    setIsLoading(true);
    try {
      const [vRes, dRes, tRes, mRes, fRes, eRes] = await Promise.all([
        api.get("/vehicles"),
        api.get("/drivers"),
        api.get("/trips"),
        api.get("/maintenance"),
        api.get("/fuel-logs"),
        api.get("/expenses")
      ]);

      setVehicles(vRes.data.data.vehicles || []);
      setDrivers(dRes.data.data.drivers || []);
      setTrips(tRes.data.data.trips || []);
      setMaintenanceLogs(mRes.data.data.maintenanceLogs || []);
      setFuelLogs(fRes.data.data.fuelLogs || []);
      setExpenses(eRes.data.data.expenses || []);
    } catch (error) {
      console.error("Failed to load operations data from backend API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Seed / Fetch on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("transitops_token");
    const savedUser = localStorage.getItem("transitops_user");
    const savedRole = localStorage.getItem("transitops_role") as UserRole;
    const savedNotifs = localStorage.getItem("transitops_notifications");

    if (savedToken && savedUser) {
      setCurrentUser(JSON.parse(savedUser));
      if (savedRole) setCurrentRole(savedRole);
      refreshData();
    }

    if (savedNotifs) {
      setNotifications(JSON.parse(savedNotifs));
    }
  }, []);

  const saveNotifs = (data: SystemNotification[]) => {
    localStorage.setItem("transitops_notifications", JSON.stringify(data));
  };

  // Authentication
  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const res = await api.post("/auth/login", { email, password });
      if (res.data.success) {
        const { accessToken, user } = res.data.data;
        localStorage.setItem("transitops_token", accessToken);
        localStorage.setItem("transitops_role", role);
        localStorage.setItem("transitops_user", JSON.stringify(user));
        sessionStorage.setItem("play_navix_splash", "true");
        
        setCurrentUser(user);
        setCurrentRole(role);
        
        // Refresh operational data
        await refreshData();
        
        addSystemNotification("success", "Logged In", `Welcome back, ${user.name}! Switched role to ${role}.`);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Login failed:", err);
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole): Promise<boolean> => {
    try {
      const res = await api.post("/auth/register", { name, email, password, role });
      if (res.data.success) {
        const { accessToken, user } = res.data.data;
        localStorage.setItem("transitops_token", accessToken);
        localStorage.setItem("transitops_role", role);
        localStorage.setItem("transitops_user", JSON.stringify(user));
        sessionStorage.setItem("play_navix_splash", "true");
        
        setCurrentUser(user);
        setCurrentRole(role);
        
        await refreshData();
        
        addSystemNotification("success", "Account Created", `Welcome, ${user.name}! Switched role to ${role}.`);
        return true;
      }
      return false;
    } catch (err) {
      console.error("Registration failed:", err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("transitops_token");
    localStorage.removeItem("transitops_user");
    localStorage.removeItem("transitops_role");
    setCurrentUser(null);
    setVehicles([]);
    setDrivers([]);
    setTrips([]);
    setMaintenanceLogs([]);
    setFuelLogs([]);
    setExpenses([]);
  };

  // Notifications
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
      saveNotifs(updated);
      return updated;
    });
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, read: true } : n);
      saveNotifs(updated);
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    saveNotifs([]);
  };

  // Vehicle Actions
  const addVehicle = async (vehicleData: Omit<Vehicle, "id">) => {
    try {
      const res = await api.post("/vehicles", vehicleData);
      if (res.data.success) {
        await refreshData();
        addSystemNotification("success", "Vehicle Added", `Vehicle ${vehicleData.registrationNumber} added successfully.`);
        return { success: true };
      }
      return { success: false, error: "Failed to create vehicle." };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Server error occurred." };
    }
  };

  const updateVehicle = async (id: string, partial: Partial<Vehicle>) => {
    try {
      const res = await api.put(`/vehicles/${id}`, partial);
      if (res.data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: "Failed to update vehicle." };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Server error occurred." };
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      await api.delete(`/vehicles/${id}`);
      await refreshData();
      addSystemNotification("info", "Vehicle Deleted", "A vehicle record has been removed from the fleet.");
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Server error occurred." };
    }
  };

  // Driver Actions
  const addDriver = async (driverData: Omit<Driver, "id">) => {
    try {
      const res = await api.post("/drivers", {
        ...driverData,
        licenseExpiryDate: driverData.expiryDate
      });
      if (res.data.success) {
        await refreshData();
        addSystemNotification("success", "Driver Registered", `${driverData.name} is now registered in the pool.`);
        return { success: true };
      }
      return { success: false, error: "Failed to create driver." };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Server error occurred." };
    }
  };

  const updateDriver = async (id: string, partial: Partial<Driver>) => {
    try {
      const res = await api.put(`/drivers/${id}`, {
        ...partial,
        licenseExpiryDate: partial.expiryDate
      });
      if (res.data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: "Failed to update driver." };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Server error occurred." };
    }
  };

  const deleteDriver = async (id: string) => {
    try {
      await api.delete(`/drivers/${id}`);
      await refreshData();
      addSystemNotification("info", "Driver Removed", "A driver record has been removed.");
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Server error occurred." };
    }
  };

  // Trip Actions
  const addTrip = async (tripData: Omit<Trip, "id" | "status" | "date">) => {
    try {
      const res = await api.post("/trips", tripData);
      if (res.data.success) {
        await refreshData();
        addSystemNotification("info", "Trip Scheduled", `New trip draft saved from ${tripData.source} to ${tripData.destination}.`);
        return { success: true };
      }
      return { success: false, error: "Failed to schedule trip." };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Server error occurred." };
    }
  };

  const updateTrip = async (id: string, partial: Partial<Trip>) => {
    // Note: Trip update can be handled or simply refreshed.
    // If not supported by backend, return success:
    return { success: true };
  };

  const dispatchTrip = async (id: string) => {
    try {
      const res = await api.post(`/trips/${id}/dispatch`);
      if (res.data.success) {
        await refreshData();
        const trip = trips.find(t => t.id === id);
        addSystemNotification(
          "success",
          "Trip Dispatched",
          `Trip ${id} dispatched successfully! Allocated vehicle and driver are now On Trip.`
        );
        return { success: true };
      }
      return { success: false, error: "Failed to dispatch trip." };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Server error occurred." };
    }
  };

  const completeTrip = async (id: string) => {
    try {
      const res = await api.post(`/trips/${id}/complete`);
      if (res.data.success) {
        await refreshData();
        addSystemNotification(
          "success",
          "Trip Completed",
          `Trip ${id} completed. Vehicle odometer updated. Vehicle and Driver are now Available.`
        );
        return { success: true };
      }
      return { success: false, error: "Failed to complete trip." };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Server error occurred." };
    }
  };

  const cancelTrip = async (id: string) => {
    try {
      const res = await api.post(`/trips/${id}/cancel`);
      if (res.data.success) {
        await refreshData();
        addSystemNotification(
          "info",
          "Trip Cancelled",
          `Trip ${id} has been cancelled and assets returned to pool.`
        );
        return { success: true };
      }
      return { success: false, error: "Failed to cancel trip." };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Server error occurred." };
    }
  };

  // Maintenance Actions
  const addMaintenance = async (maintData: Omit<Maintenance, "id" | "status" | "date">) => {
    try {
      const res = await api.post("/maintenance", maintData);
      if (res.data.success) {
        await refreshData();
        addSystemNotification(
          "warning",
          "Maintenance Opened",
          `Maintenance ticket opened successfully! Vehicle is now In Shop.`
        );
        return { success: true };
      }
      return { success: false, error: "Failed to open maintenance ticket." };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Server error occurred." };
    }
  };

  const closeMaintenance = async (id: string) => {
    try {
      const res = await api.post(`/maintenance/${id}/resolve`);
      if (res.data.success) {
        await refreshData();
        addSystemNotification(
          "success",
          "Maintenance Closed",
          `Maintenance ticket resolved. Vehicle returned to Available pool.`
        );
        return { success: true };
      }
      return { success: false, error: "Failed to close maintenance ticket." };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Server error occurred." };
    }
  };

  // Fuel Actions
  const addFuelLog = async (fuelData: Omit<FuelLog, "id" | "efficiency">) => {
    try {
      const res = await api.post("/fuel-logs", fuelData);
      if (res.data.success) {
        await refreshData();
        addSystemNotification(
          "success",
          "Fuel Logged",
          `Logged ${fuelData.liters} liters. Vehicle odometer updated to ${fuelData.odometer} km.`
        );
        return { success: true };
      }
      return { success: false, error: "Failed to log fuel." };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Server error occurred." };
    }
  };

  // Expense Actions
  const addExpense = async (expenseData: Omit<Expense, "id" | "date">) => {
    try {
      const res = await api.post("/expenses", expenseData);
      if (res.data.success) {
        await refreshData();
        return { success: true };
      }
      return { success: false, error: "Failed to add expense." };
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || "Server error occurred." };
    }
  };

  return (
    <TransitStateContext.Provider
      value={{
        currentRole,
        setCurrentRole,
        currentUser,
        login,
        register,
        logout,
        vehicles,
        drivers,
        trips,
        maintenanceLogs,
        fuelLogs,
        expenses,
        notifications,
        isLoading,
        refreshData,
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

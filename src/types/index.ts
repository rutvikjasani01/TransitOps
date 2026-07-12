export type UserRole = 'Fleet Manager' | 'Dispatcher' | 'Safety Officer' | 'Financial Analyst';

export interface Vehicle {
  id: string;
  registrationNumber: string;
  name: string;
  model: string;
  type: 'Truck' | 'Van' | 'Semi' | 'Box Truck';
  maxCapacity: number; // in kg
  odometer: number; // in km
  acquisitionCost: number;
  status: 'Available' | 'On Trip' | 'In Shop' | 'Retired';
}

export interface Driver {
  id: string;
  name: string;
  licenseNumber: string;
  licenseCategory: string;
  expiryDate: string; // YYYY-MM-DD
  contactNumber: string;
  safetyScore: number; // 0 to 100
  status: 'Available' | 'On Trip' | 'Off Duty' | 'Suspended';
}

export interface Trip {
  id: string;
  source: string;
  destination: string;
  vehicleId: string;
  driverId: string;
  cargoWeight: number; // in kg
  plannedDistance: number; // in km
  date: string;
  status: 'Draft' | 'Dispatched' | 'Completed' | 'Cancelled';
}

export interface Maintenance {
  id: string;
  vehicleId: string;
  type: 'Routine' | 'Repair' | 'Inspection' | 'Emergency';
  cost: number;
  date: string;
  notes: string;
  status: 'Open' | 'Completed';
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  liters: number;
  cost: number;
  date: string;
  odometer: number;
  efficiency?: number; // km / L
}

export type ExpenseCategory = 'Fuel' | 'Maintenance' | 'Toll' | 'Parking' | 'Other';

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  description: string;
  vehicleId?: string; // Optional links to vehicle
}

export interface SystemNotification {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

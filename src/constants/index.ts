import { Vehicle, Driver, Trip, Maintenance, FuelLog, Expense, SystemNotification } from "../types";

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: "v-1",
    registrationNumber: "TX-908-A",
    name: "Volvo FH16 Heavy Duty",
    model: "Volvo FH16 2024",
    type: "Semi",
    maxCapacity: 25000,
    odometer: 142300,
    acquisitionCost: 145000,
    status: "On Trip"
  },
  {
    id: "v-2",
    registrationNumber: "TX-452-B",
    name: "Mercedes-Benz Sprinter 317",
    model: "Sprinter 2023",
    type: "Van",
    maxCapacity: 3500,
    odometer: 48900,
    acquisitionCost: 45000,
    status: "Available"
  },
  {
    id: "v-3",
    registrationNumber: "TX-882-C",
    name: "Isuzu NPR Box Truck",
    model: "NPR 75 2022",
    type: "Box Truck",
    maxCapacity: 7500,
    odometer: 89600,
    acquisitionCost: 65000,
    status: "In Shop"
  },
  {
    id: "v-4",
    registrationNumber: "TX-101-D",
    name: "Scania R500 Hauler",
    model: "R500 2023",
    type: "Semi",
    maxCapacity: 28000,
    odometer: 112000,
    acquisitionCost: 155000,
    status: "On Trip"
  },
  {
    id: "v-5",
    registrationNumber: "TX-303-E",
    name: "Ford Transit Cargo",
    model: "Transit 350 2021",
    type: "Van",
    maxCapacity: 4000,
    odometer: 75400,
    acquisitionCost: 38000,
    status: "Available"
  },
  {
    id: "v-6",
    registrationNumber: "TX-771-F",
    name: "Freightliner Cascadia",
    model: "Cascadia 2015",
    type: "Semi",
    maxCapacity: 30000,
    odometer: 560000,
    acquisitionCost: 130000,
    status: "Retired"
  }
];

export const MOCK_DRIVERS: Driver[] = [
  {
    id: "d-1",
    name: "Alexander Mercer",
    licenseNumber: "CDL-9982-A",
    licenseCategory: "Class A CDL",
    expiryDate: "2027-10-15",
    contactNumber: "+1 (555) 019-2834",
    safetyScore: 98,
    status: "On Trip"
  },
  {
    id: "d-2",
    name: "Sarah Jenkins",
    licenseNumber: "CDL-3342-B",
    licenseCategory: "Class B CDL",
    expiryDate: "2028-04-20",
    contactNumber: "+1 (555) 014-9988",
    safetyScore: 95,
    status: "Available"
  },
  {
    id: "d-3",
    name: "Marcus Aurelius Vance",
    licenseNumber: "CDL-7712-C",
    licenseCategory: "Class A CDL",
    expiryDate: "2026-05-10", // Expired relative to 2026-07-12
    contactNumber: "+1 (555) 017-4431",
    safetyScore: 92,
    status: "Available"
  },
  {
    id: "d-4",
    name: "David Kross",
    licenseNumber: "CDL-1029-D",
    licenseCategory: "Class A CDL",
    expiryDate: "2027-02-14",
    contactNumber: "+1 (555) 012-7721",
    safetyScore: 68, // Low safety score
    status: "Suspended"
  },
  {
    id: "d-5",
    name: "Carlos Santana Rivera",
    licenseNumber: "CDL-8821-E",
    licenseCategory: "Class A CDL",
    expiryDate: "2027-08-30",
    contactNumber: "+1 (555) 015-1109",
    safetyScore: 91,
    status: "On Trip"
  },
  {
    id: "d-6",
    name: "Emily Watson",
    licenseNumber: "CDL-4491-F",
    licenseCategory: "Class B CDL",
    expiryDate: "2029-01-12",
    contactNumber: "+1 (555) 016-3245",
    safetyScore: 89,
    status: "Off Duty"
  }
];

export const MOCK_TRIPS: Trip[] = [
  {
    id: "t-1",
    source: "Chicago Logistics Hub, IL",
    destination: "Dallas Distribution Center, TX",
    vehicleId: "v-1",
    driverId: "d-1",
    cargoWeight: 18000,
    plannedDistance: 1560,
    date: "2026-07-11",
    status: "Dispatched"
  },
  {
    id: "t-2",
    source: "Atlanta Port Facility, GA",
    destination: "Miami Depot, FL",
    vehicleId: "v-4",
    driverId: "d-5",
    cargoWeight: 22000,
    plannedDistance: 1060,
    date: "2026-07-12",
    status: "Dispatched"
  },
  {
    id: "t-3",
    source: "Los Angeles Warehouse, CA",
    destination: "Seattle Port Terminal, WA",
    vehicleId: "v-2",
    driverId: "d-2",
    cargoWeight: 2200,
    plannedDistance: 1830,
    date: "2026-07-08",
    status: "Completed"
  },
  {
    id: "t-4",
    source: "New York Hub, NY",
    destination: "Boston Warehouse, MA",
    vehicleId: "v-5",
    driverId: "d-6",
    cargoWeight: 1500,
    plannedDistance: 350,
    date: "2026-07-05",
    status: "Completed"
  },
  {
    id: "t-5",
    source: "Denver Terminal, CO",
    destination: "Salt Lake City Warehouse, UT",
    vehicleId: "v-2",
    driverId: "d-2",
    cargoWeight: 3100,
    plannedDistance: 850,
    date: "2026-07-14",
    status: "Draft"
  }
];

export const MOCK_MAINTENANCE: Maintenance[] = [
  {
    id: "m-1",
    vehicleId: "v-3",
    type: "Repair",
    cost: 1450,
    date: "2026-07-10",
    notes: "Transmission grinding issues. Replaced clutch plate assembly.",
    status: "Open"
  },
  {
    id: "m-2",
    vehicleId: "v-1",
    type: "Routine",
    cost: 450,
    date: "2026-06-20",
    notes: "Scheduled oil and filter change. Brake pads inspected and verified.",
    status: "Completed"
  },
  {
    id: "m-3",
    vehicleId: "v-5",
    type: "Inspection",
    cost: 180,
    date: "2026-06-15",
    notes: "Annual state emissions and safety inspection. Passed with zero notes.",
    status: "Completed"
  }
];

export const MOCK_FUEL_LOGS: FuelLog[] = [
  {
    id: "f-1",
    vehicleId: "v-1",
    liters: 450,
    cost: 720,
    date: "2026-07-10",
    odometer: 141900,
    efficiency: 2.8 // km per liter
  },
  {
    id: "f-2",
    vehicleId: "v-2",
    liters: 68,
    cost: 110,
    date: "2026-07-11",
    odometer: 48800,
    efficiency: 8.5
  },
  {
    id: "f-3",
    vehicleId: "v-4",
    liters: 500,
    cost: 800,
    date: "2026-07-09",
    odometer: 111500,
    efficiency: 2.6
  },
  {
    id: "f-4",
    vehicleId: "v-5",
    liters: 80,
    cost: 130,
    date: "2026-07-08",
    odometer: 75200,
    efficiency: 7.8
  }
];

export const MOCK_EXPENSES: Expense[] = [
  {
    id: "e-1",
    category: "Fuel",
    amount: 720,
    date: "2026-07-10",
    description: "Volvo FH16 Diesel Fill Up",
    vehicleId: "v-1"
  },
  {
    id: "e-2",
    category: "Maintenance",
    amount: 1450,
    date: "2026-07-10",
    description: "Isuzu NPR Transmission Clutch Repair",
    vehicleId: "v-3"
  },
  {
    id: "e-3",
    category: "Toll",
    amount: 125,
    date: "2026-07-11",
    description: "Ohio Turnpike Toll Charges (Trip t-1)",
    vehicleId: "v-1"
  },
  {
    id: "e-4",
    category: "Parking",
    amount: 45,
    date: "2026-07-08",
    description: "LA Port Secure Layover Parking",
    vehicleId: "v-2"
  },
  {
    id: "e-5",
    category: "Other",
    amount: 150,
    date: "2026-07-07",
    description: "Cargo straps and load binders replaced",
    vehicleId: "v-1"
  }
];

export const MOCK_NOTIFICATIONS: SystemNotification[] = [
  {
    id: "n-1",
    type: "warning",
    title: "License Expiry Alert",
    message: "Driver Marcus Aurelius Vance's CDL license has expired (2026-05-10). Update immediately.",
    timestamp: "2 hours ago",
    read: false
  },
  {
    id: "n-2",
    type: "info",
    title: "Maintenance Scheduled",
    message: "Vehicle TX-882-C (Isuzu NPR) is currently In Shop for transmission issues.",
    timestamp: "1 day ago",
    read: false
  },
  {
    id: "n-3",
    type: "success",
    title: "Trip Completed",
    message: "Trip t-3 from Los Angeles to Seattle has been completed successfully.",
    timestamp: "3 days ago",
    read: true
  },
  {
    id: "n-4",
    type: "info",
    title: "Fuel Added",
    message: "68 liters of fuel logged for Sprinter TX-452-B.",
    timestamp: "1 day ago",
    read: true
  }
];

export const ROLE_NAVIGATION = {
  "Fleet Manager": [
    { name: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
    { name: "Vehicles", path: "/vehicles", icon: "Truck" },
    { name: "Maintenance", path: "/maintenance", icon: "Wrench" },
    { name: "Reports", path: "/reports", icon: "FileBarChart" },
  ],
  "Dispatcher": [
    { name: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
    { name: "Trips", path: "/trips", icon: "Route" },
    { name: "Drivers", path: "/drivers", icon: "Users" },
  ],
  "Safety Officer": [
    { name: "Drivers", path: "/drivers", icon: "Users" },
    { name: "Reports", path: "/reports", icon: "FileBarChart" },
  ],
  "Financial Analyst": [
    { name: "Dashboard", path: "/dashboard", icon: "LayoutDashboard" },
    { name: "Expenses", path: "/expenses", icon: "DollarSign" },
    { name: "Fuel", path: "/fuel", icon: "Droplet" },
    { name: "Reports", path: "/reports", icon: "FileBarChart" },
  ],
};

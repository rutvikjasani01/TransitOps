import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting database seeding...");

  // Hashed password for test accounts
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync("password123", salt);

  // Clean existing entries (in reverse dependency order)
  console.log("Cleaning existing records...");
  await prisma.expense.deleteMany();
  await prisma.fuelLog.deleteMany();
  await prisma.maintenanceLog.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.driver.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();

  // Create Users
  console.log("Creating users...");
  const managerUser = await prisma.user.create({
    data: {
      email: "manager@navix.com",
      name: "George Davidson",
      password: hashedPassword,
      role: "FLEET_MANAGER",
    },
  });

  const driverUser = await prisma.user.create({
    data: {
      email: "driver@navix.com",
      name: "Alex Johnson",
      password: hashedPassword,
      role: "DRIVER",
    },
  });

  const safetyUser = await prisma.user.create({
    data: {
      email: "safety@navix.com",
      name: "Chief Safety Officer",
      password: hashedPassword,
      role: "SAFETY_OFFICER",
    },
  });

  const financeUser = await prisma.user.create({
    data: {
      email: "finance@navix.com",
      name: "Chief Financial Analyst",
      password: hashedPassword,
      role: "FINANCIAL_ANALYST",
    },
  });

  console.log("Creating vehicles...");
  const van05 = await prisma.vehicle.create({
    data: {
      registrationNumber: "Van-05",
      model: "Ford Transit Cargo Van",
      type: "Van",
      maxCapacity: 500,
      odometer: 12000,
      acquisitionCost: 25000,
      status: "AVAILABLE",
    },
  });

  const truck01 = await prisma.vehicle.create({
    data: {
      registrationNumber: "Truck-01",
      model: "Volvo FH Heavy Duty",
      type: "Truck",
      maxCapacity: 10000,
      odometer: 45000,
      acquisitionCost: 85000,
      status: "AVAILABLE",
    },
  });

  const trailer02 = await prisma.vehicle.create({
    data: {
      registrationNumber: "Trailer-02",
      model: "Scania R500 Semi-Trailer",
      type: "Trailer",
      maxCapacity: 20000,
      odometer: 89000,
      acquisitionCost: 115000,
      status: "ON_TRIP",
    },
  });

  const truck03 = await prisma.vehicle.create({
    data: {
      registrationNumber: "Truck-03",
      model: "Peterbilt 579",
      type: "Truck",
      maxCapacity: 12000,
      odometer: 15000,
      acquisitionCost: 95000,
      status: "IN_SHOP",
    },
  });

  const van04 = await prisma.vehicle.create({
    data: {
      registrationNumber: "Van-04",
      model: "Mercedes-Benz Sprinter",
      type: "Van",
      maxCapacity: 800,
      odometer: 180000,
      acquisitionCost: 22000,
      status: "RETIRED",
    },
  });

  console.log("Creating drivers...");
  const driverAlex = await prisma.driver.create({
    data: {
      name: "Alex Johnson",
      licenseNumber: "DL-88493028",
      licenseCategory: "Class A CDL",
      licenseExpiryDate: new Date("2027-12-31T00:00:00Z"),
      contactNumber: "+15550199",
      safetyScore: 98.5,
      status: "AVAILABLE",
      userId: driverUser.id,
    },
  });

  const driverJohn = await prisma.driver.create({
    data: {
      name: "John Doe",
      licenseNumber: "DL-11239841",
      licenseCategory: "Class B CDL",
      licenseExpiryDate: new Date("2028-05-15T00:00:00Z"),
      contactNumber: "+15550212",
      safetyScore: 94.0,
      status: "ON_TRIP",
    },
  });

  const driverSarah = await prisma.driver.create({
    data: {
      name: "Sarah Jenkins",
      licenseNumber: "DL-90412344",
      licenseCategory: "Class A CDL",
      licenseExpiryDate: new Date("2025-01-01T00:00:00Z"), // Expired license
      contactNumber: "+15550345",
      safetyScore: 88.0,
      status: "OFF_DUTY",
    },
  });

  const driverDavid = await prisma.driver.create({
    data: {
      name: "David Smith",
      licenseNumber: "DL-55443322",
      licenseCategory: "Class B CDL",
      licenseExpiryDate: new Date("2027-09-20T00:00:00Z"),
      contactNumber: "+15550789",
      safetyScore: 65.0, // Bad safety score
      status: "SUSPENDED",
    },
  });

  console.log("Creating trips...");
  await prisma.trip.create({
    data: {
      source: "Chicago Warehouse",
      destination: "New York Port",
      cargoWeight: 15000,
      plannedDistance: 450,
      status: "DISPATCHED",
      vehicleId: trailer02.id,
      driverId: driverJohn.id,
    },
  });

  console.log("Creating maintenance logs...");
  await prisma.maintenanceLog.create({
    data: {
      description: "Engine Diagnostic & Oil Change",
      cost: 450.0,
      status: "OPEN",
      date: new Date("2026-07-10T00:00:00Z"),
      vehicleId: truck03.id,
    },
  });

  await prisma.maintenanceLog.create({
    data: {
      description: "Brake Pads Replacement & Wheel Realignment",
      cost: 350.0,
      status: "COMPLETED",
      date: new Date("2026-06-25T00:00:00Z"),
      vehicleId: truck01.id,
    },
  });

  console.log("Creating fuel logs...");
  await prisma.fuelLog.create({
    data: {
      liters: 150,
      cost: 240,
      odometer: 44500,
      date: new Date("2026-07-05T00:00:00Z"),
      efficiency: 6.2,
      vehicleId: truck01.id,
    },
  });

  await prisma.fuelLog.create({
    data: {
      liters: 80,
      cost: 120,
      odometer: 11800,
      date: new Date("2026-07-06T00:00:00Z"),
      efficiency: 8.5,
      vehicleId: van05.id,
    },
  });

  console.log("Creating other expenses...");
  await prisma.expense.create({
    data: {
      category: "TOLL",
      amount: 45.0,
      description: "I-90 Interstate Toll Charges",
      date: new Date("2026-07-01T00:00:00Z"),
      vehicleId: truck01.id,
    },
  });

  await prisma.expense.create({
    data: {
      category: "PARKING",
      amount: 15.0,
      description: "Downtown Loading Bay Parking",
      date: new Date("2026-07-02T00:00:00Z"),
      vehicleId: van05.id,
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

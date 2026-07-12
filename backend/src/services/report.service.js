import prisma from "../config/db.js";

const round = (val, decimals = 2) => Number(Number(val).toFixed(decimals)) || 0;

export const getFleetReport = async () => {
  const allVehicles = await prisma.vehicle.findMany({
    where: { status: { not: "RETIRED" } }
  });

  const totalVehicles = allVehicles.length;
  const activeVehicles = allVehicles.filter(v => v.status === "ON_TRIP").length;
  const availableVehicles = allVehicles.filter(v => v.status === "AVAILABLE").length;
  const inShopVehicles = allVehicles.filter(v => v.status === "IN_SHOP").length;

  const fleetUtilization = totalVehicles > 0 ? round((activeVehicles / totalVehicles) * 100) : 0;

  // Compute stats per vehicle
  const vehicleStats = [];
  for (const vehicle of allVehicles) {
    const fuelLogs = await prisma.fuelLog.findMany({ where: { vehicleId: vehicle.id } });
    const maintLogs = await prisma.maintenanceLog.findMany({ where: { vehicleId: vehicle.id } });
    const trips = await prisma.trip.findMany({ where: { vehicleId: vehicle.id, status: "COMPLETED" } });

    const totalFuelCost = fuelLogs.reduce((sum, l) => sum + l.cost, 0);
    const totalFuelLiters = fuelLogs.reduce((sum, l) => sum + l.liters, 0);
    const totalMaintCost = maintLogs.reduce((sum, l) => sum + l.cost, 0);
    const totalOperationalCost = totalFuelCost + totalMaintCost;

    // Estimate Revenue: $1.85 per km
    const totalDistance = trips.reduce((sum, t) => sum + t.plannedDistance, 0);
    const estimatedRevenue = totalDistance * 1.85;

    // ROI = (Revenue - Operating Cost) / Acquisition Cost
    const netReturn = estimatedRevenue - totalOperationalCost;
    const roi = vehicle.acquisitionCost > 0 ? round((netReturn / vehicle.acquisitionCost) * 100) : 0;

    // Fuel efficiency (km/liter)
    const avgFuelEfficiency = totalFuelLiters > 0 ? round(totalDistance / totalFuelLiters) : 0;

    vehicleStats.push({
      id: vehicle.id,
      registrationNumber: vehicle.registrationNumber,
      model: vehicle.model,
      type: vehicle.type,
      odometer: vehicle.odometer,
      acquisitionCost: vehicle.acquisitionCost,
      status: vehicle.status,
      totalDistance,
      totalFuelLiters,
      totalFuelCost,
      totalMaintCost,
      totalOperationalCost,
      estimatedRevenue,
      roi,
      avgFuelEfficiency
    });
  }

  return {
    kpis: {
      totalVehicles,
      activeVehicles,
      availableVehicles,
      inShopVehicles,
      fleetUtilization
    },
    vehicles: vehicleStats
  };
};

export const getFinanceReport = async () => {
  const fuelLogs = await prisma.fuelLog.findMany();
  const maintLogs = await prisma.maintenanceLog.findMany();
  const expenses = await prisma.expense.findMany();

  const totalFuelCost = fuelLogs.reduce((sum, l) => sum + l.cost, 0);
  const totalMaintCost = maintLogs.reduce((sum, l) => sum + l.cost, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group expenses by category
  const categories = {};
  for (const expense of expenses) {
    const cat = expense.category;
    categories[cat] = (categories[cat] || 0) + expense.amount;
  }

  return {
    totalFuelCost: round(totalFuelCost),
    totalMaintCost: round(totalMaintCost),
    totalExpenses: round(totalExpenses),
    byCategory: categories
  };
};

export const getSafetyReport = async () => {
  const drivers = await prisma.driver.findMany();
  
  const totalDrivers = drivers.length;
  const activeDrivers = drivers.filter(d => d.status === "ON_TRIP").length;
  const availableDrivers = drivers.filter(d => d.status === "AVAILABLE").length;
  const suspendedDrivers = drivers.filter(d => d.status === "SUSPENDED").length;

  const averageSafetyScore = totalDrivers > 0 
    ? round(drivers.reduce((sum, d) => sum + d.safetyScore, 0) / totalDrivers)
    : 100;

  return {
    totalDrivers,
    activeDrivers,
    availableDrivers,
    suspendedDrivers,
    averageSafetyScore,
    drivers: drivers.map(d => ({
      id: d.id,
      name: d.name,
      licenseNumber: d.licenseNumber,
      licenseCategory: d.licenseCategory,
      safetyScore: d.safetyScore,
      status: d.status
    }))
  };
};

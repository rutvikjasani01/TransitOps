import prisma from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { mapFuelLogToApi } from "../utils/mappings.js";
import * as expenseService from "./expense.service.js";

const estimateEfficiency = (type) => {
  const map = { Semi: 2.8, Truck: 5.2, Trailer: 3.5, Van: 8.5 };
  return map[type] || 6.0;
};

const round = (value, decimals = 2) => Number(value.toFixed(decimals));

const getLogOrThrow = async (id) => {
  const log = await prisma.fuelLog.findUnique({ where: { id } });
  if (!log) throw new ApiError(404, "Fuel log not found.");
  return log;
};

const getVehicleOrThrow = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new ApiError(422, "Referenced vehicle does not exist.");
  if (vehicle.status === "RETIRED") {
    throw new ApiError(409, "Fuel cannot be logged for a retired vehicle.");
  }
  return vehicle;
};

const getChronologicalLogs = async (vehicleId) => {
  return prisma.fuelLog.findMany({
    where: { vehicleId },
    orderBy: [
      { date: 'asc' },
      { createdAt: 'asc' }
    ]
  });
};

const validateOdometerSequence = async (vehicleId, odometer, dateStr, omittedId) => {
  const logs = await getChronologicalLogs(vehicleId);
  const filtered = logs.filter(l => l.id !== omittedId);
  const targetDate = new Date(dateStr);

  const index = filtered.findIndex(l => new Date(l.date) > targetDate);
  const previous = index === -1 ? filtered.at(-1) : filtered[index - 1];
  const next = index === -1 ? undefined : filtered[index];

  if (previous && odometer < previous.odometer) {
    throw new ApiError(422, "Odometer cannot be lower than the preceding fuel log for this vehicle.");
  }
  if (next && odometer > next.odometer) {
    throw new ApiError(422, "Odometer cannot be greater than the following fuel log for this vehicle.");
  }
};

const recalculateVehicleLogs = async (vehicleId) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return;

  const logs = await getChronologicalLogs(vehicleId);
  let previous = null;

  for (const log of logs) {
    let efficiency = estimateEfficiency(vehicle.type);
    if (previous && log.odometer > previous.odometer) {
      efficiency = round((log.odometer - previous.odometer) / log.liters);
    }

    await prisma.fuelLog.update({
      where: { id: log.id },
      data: { efficiency }
    });

    previous = log;
  }
};

const updateVehicleOdometer = async (vehicleId) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) return;

  const maxLog = await prisma.fuelLog.findFirst({
    where: { vehicleId },
    orderBy: { odometer: 'desc' }
  });

  const maxOdo = maxLog ? maxLog.odometer : 0;
  if (maxOdo > vehicle.odometer) {
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { odometer: maxOdo }
    });
  }
};

export const list = async ({ vehicleId, from, to }) => {
  const logs = await prisma.fuelLog.findMany({
    where: {
      vehicleId: vehicleId || undefined,
      date: {
        gte: from ? new Date(from) : undefined,
        lte: to ? new Date(to) : undefined
      }
    },
    orderBy: { date: 'desc' }
  });

  return logs.map(mapFuelLogToApi);
};

export const getById = async (id) => {
  const log = await getLogOrThrow(id);
  return mapFuelLogToApi(log);
};

export const create = async (data) => {
  const vehicle = await getVehicleOrThrow(data.vehicleId);
  await validateOdometerSequence(data.vehicleId, Number(data.odometer), data.date);

  const log = await prisma.fuelLog.create({
    data: {
      liters: Number(data.liters),
      cost: Number(data.cost),
      odometer: Number(data.odometer),
      date: new Date(data.date || new Date()),
      vehicleId: data.vehicleId
    }
  });

  await recalculateVehicleLogs(data.vehicleId);
  await updateVehicleOdometer(data.vehicleId);

  // Sync to system generated expense
  await expenseService.upsertGeneratedExpense({
    sourceType: "FUEL",
    sourceId: log.id,
    category: "Fuel",
    amount: log.cost,
    date: log.date,
    description: `Fuel purchase: ${log.liters}L for ${vehicle.registrationNumber}`,
    vehicleId: log.vehicleId
  });

  return getById(log.id);
};

export const update = async (id, changes) => {
  const existing = await getLogOrThrow(id);
  const vehicleId = changes.vehicleId || existing.vehicleId;
  const vehicle = await getVehicleOrThrow(vehicleId);

  const merged = { ...existing, ...changes };
  await validateOdometerSequence(vehicleId, Number(merged.odometer), merged.date, id);

  const updated = await prisma.fuelLog.update({
    where: { id },
    data: {
      liters: changes.liters !== undefined ? Number(changes.liters) : undefined,
      cost: changes.cost !== undefined ? Number(changes.cost) : undefined,
      odometer: changes.odometer !== undefined ? Number(changes.odometer) : undefined,
      date: changes.date ? new Date(changes.date) : undefined,
      vehicleId: changes.vehicleId || undefined
    }
  });

  await recalculateVehicleLogs(existing.vehicleId);
  if (changes.vehicleId && changes.vehicleId !== existing.vehicleId) {
    await recalculateVehicleLogs(changes.vehicleId);
  }

  await updateVehicleOdometer(existing.vehicleId);
  if (changes.vehicleId) {
    await updateVehicleOdometer(changes.vehicleId);
  }

  // Update corresponding system generated expense
  await expenseService.upsertGeneratedExpense({
    sourceType: "FUEL",
    sourceId: updated.id,
    category: "Fuel",
    amount: updated.cost,
    date: updated.date,
    description: `Fuel purchase: ${updated.liters}L for ${vehicle.registrationNumber}`,
    vehicleId: updated.vehicleId
  });

  return getById(id);
};

export const remove = async (id) => {
  const log = await getLogOrThrow(id);

  // Delete generated expense
  await expenseService.removeGeneratedExpense("FUEL", id);

  await prisma.fuelLog.delete({ where: { id } });

  await recalculateVehicleLogs(log.vehicleId);
  await updateVehicleOdometer(log.vehicleId);
};

export const summary = async ({ vehicleId, from, to }) => {
  const logs = await list({ vehicleId, from, to });
  const totalCost = round(logs.reduce((sum, log) => sum + log.cost, 0));
  const totalLiters = round(logs.reduce((sum, log) => sum + log.liters, 0));
  
  const efficiencies = logs.map((log) => log.efficiency).filter(val => typeof val === 'number' && isFinite(val));
  const averageEfficiency = efficiencies.length
    ? round(efficiencies.reduce((sum, value) => sum + value, 0) / efficiencies.length)
    : 0;

  return {
    totalLogs: logs.length,
    totalCost,
    totalLiters,
    averageCostPerLiter: totalLiters ? round(totalCost / totalLiters) : 0,
    averageEfficiency
  };
};

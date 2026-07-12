import prisma from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { mapMaintenanceToApi, mapMaintenanceStatusToDb } from "../utils/mappings.js";
import * as expenseService from "./expense.service.js";

const getMaintenanceOrThrow = async (id) => {
  const log = await prisma.maintenanceLog.findUnique({ where: { id } });
  if (!log) throw new ApiError(404, "Maintenance record not found.");
  return log;
};

const getVehicleOrThrow = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new ApiError(422, "Referenced vehicle does not exist.");
  return vehicle;
};

export const list = async ({ status, vehicleId }) => {
  const dbStatus = status ? mapMaintenanceStatusToDb(status) : undefined;

  const logs = await prisma.maintenanceLog.findMany({
    where: {
      status: dbStatus,
      vehicleId: vehicleId || undefined
    },
    orderBy: { date: 'desc' }
  });

  return logs.map(mapMaintenanceToApi);
};

export const getById = async (id) => {
  const log = await getMaintenanceOrThrow(id);
  return mapMaintenanceToApi(log);
};

export const create = async (data) => {
  const vehicle = await getVehicleOrThrow(data.vehicleId);
  
  if (vehicle.status === "RETIRED") {
    throw new ApiError(409, "Cannot log maintenance for a retired vehicle.");
  }
  if (vehicle.status === "ON_TRIP") {
    throw new ApiError(409, "Cannot log maintenance for a vehicle currently on trip.");
  }

  // Create log and update vehicle status to IN_SHOP in a transaction
  const log = await prisma.$transaction(async (tx) => {
    await tx.vehicle.update({
      where: { id: vehicle.id },
      data: { status: "IN_SHOP" }
    });

    return tx.maintenanceLog.create({
      data: {
        description: data.notes || data.description,
        cost: Number(data.cost || 0),
        status: "OPEN",
        date: new Date(data.date || new Date()),
        vehicleId: data.vehicleId
      }
    });
  });

  // Sync to system-generated expense
  await expenseService.upsertGeneratedExpense({
    sourceType: "MAINTENANCE",
    sourceId: log.id,
    category: "Maintenance",
    amount: log.cost,
    date: log.date,
    description: `Maintenance Work Order: ${log.description} for ${vehicle.registrationNumber}`,
    vehicleId: log.vehicleId
  });

  return mapMaintenanceToApi(log);
};

export const resolve = async (id) => {
  const log = await getMaintenanceOrThrow(id);
  if (log.status === "COMPLETED") return mapMaintenanceToApi(log);

  const vehicle = await getVehicleOrThrow(log.vehicleId);

  const updatedLog = await prisma.$transaction(async (tx) => {
    // Only return vehicle to AVAILABLE if it is not retired
    if (vehicle.status !== "RETIRED") {
      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { status: "AVAILABLE" }
      });
    }

    return tx.maintenanceLog.update({
      where: { id },
      data: { status: "COMPLETED" }
    });
  });

  // Update corresponding generated expense
  await expenseService.upsertGeneratedExpense({
    sourceType: "MAINTENANCE",
    sourceId: updatedLog.id,
    category: "Maintenance",
    amount: updatedLog.cost,
    date: updatedLog.date,
    description: `Maintenance Work Order: ${updatedLog.description} for ${vehicle.registrationNumber} (Resolved)`,
    vehicleId: updatedLog.vehicleId
  });

  return mapMaintenanceToApi(updatedLog);
};

export const remove = async (id) => {
  const log = await getMaintenanceOrThrow(id);

  // If the maintenance ticket is still open, reset vehicle status to AVAILABLE
  const vehicle = await prisma.vehicle.findUnique({ where: { id: log.vehicleId } });
  if (vehicle && log.status === "OPEN" && vehicle.status === "IN_SHOP") {
    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { status: "AVAILABLE" }
    });
  }

  // Remove corresponding system-generated expense
  await expenseService.removeGeneratedExpense("MAINTENANCE", id);

  await prisma.maintenanceLog.delete({ where: { id } });
};

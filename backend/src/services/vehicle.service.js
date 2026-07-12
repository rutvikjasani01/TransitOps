import prisma from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { mapVehicleToApi, mapVehicleStatusToDb } from "../utils/mappings.js";

const MANAGER_CONTROLLED_TRANSITIONS = {
  AVAILABLE: ["IN_SHOP", "RETIRED"],
  IN_SHOP: ["AVAILABLE", "RETIRED"],
  RETIRED: [],
  ON_TRIP: []
};

const hasActiveTripForVehicle = async (vehicleId) => {
  const activeTrip = await prisma.trip.findFirst({
    where: {
      vehicleId,
      status: { in: ["DRAFT", "DISPATCHED"] }
    }
  });
  return !!activeTrip;
};

const getVehicleOrThrow = async (id) => {
  const vehicle = await prisma.vehicle.findUnique({ where: { id } });
  if (!vehicle) throw new ApiError(404, "Vehicle not found.");
  return vehicle;
};

const assertNotOnActiveTrip = async (vehicleId, status) => {
  if (status === "ON_TRIP" || await hasActiveTripForVehicle(vehicleId)) {
    throw new ApiError(409, "Vehicle cannot be changed while it is dispatched on an active trip.");
  }
};

export const list = async ({ status, type, search }) => {
  const dbStatus = status ? mapVehicleStatusToDb(status) : undefined;
  
  const vehicles = await prisma.vehicle.findMany({
    where: {
      status: dbStatus,
      type: type || undefined,
      OR: search ? [
        { registrationNumber: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } }
      ] : undefined
    },
    orderBy: { createdAt: 'desc' }
  });

  return vehicles.map(mapVehicleToApi);
};

export const getById = async (id) => {
  const vehicle = await getVehicleOrThrow(id);
  return mapVehicleToApi(vehicle);
};

export const create = async (data) => {
  const regNum = data.registrationNumber.trim().toUpperCase();
  const existing = await prisma.vehicle.findUnique({ where: { registrationNumber: regNum } });
  if (existing) throw new ApiError(409, `Registration number ${regNum} already exists.`);

  const dbStatus = data.status ? mapVehicleStatusToDb(data.status) : "AVAILABLE";

  const vehicle = await prisma.vehicle.create({
    data: {
      registrationNumber: regNum,
      model: data.model,
      type: data.type,
      maxCapacity: Number(data.maxCapacity),
      odometer: Number(data.odometer || 0),
      acquisitionCost: Number(data.acquisitionCost),
      status: dbStatus
    }
  });

  return mapVehicleToApi(vehicle);
};

export const update = async (id, changes) => {
  const vehicle = await getVehicleOrThrow(id);
  await assertNotOnActiveTrip(id, vehicle.status);

  const updateData = {};

  if (changes.registrationNumber) {
    const regNum = changes.registrationNumber.trim().toUpperCase();
    const existing = await prisma.vehicle.findUnique({ where: { registrationNumber: regNum } });
    if (existing && existing.id !== id) {
      throw new ApiError(409, `Registration number ${regNum} is already in use.`);
    }
    updateData.registrationNumber = regNum;
  }

  if (changes.model) updateData.model = changes.model;
  if (changes.type) updateData.type = changes.type;
  if (changes.maxCapacity !== undefined) updateData.maxCapacity = Number(changes.maxCapacity);
  
  if (changes.odometer !== undefined) {
    const newOdometer = Number(changes.odometer);
    if (newOdometer < vehicle.odometer) {
      throw new ApiError(422, "Odometer cannot be decreased.");
    }
    updateData.odometer = newOdometer;
  }

  if (changes.acquisitionCost !== undefined) updateData.acquisitionCost = Number(changes.acquisitionCost);

  const updated = await prisma.vehicle.update({
    where: { id },
    data: updateData
  });

  return mapVehicleToApi(updated);
};

export const updateStatus = async (id, status) => {
  const vehicle = await getVehicleOrThrow(id);
  const dbStatus = mapVehicleStatusToDb(status);
  
  if (vehicle.status === dbStatus) return mapVehicleToApi(vehicle);

  await assertNotOnActiveTrip(id, vehicle.status);

  const allowed = MANAGER_CONTROLLED_TRANSITIONS[vehicle.status] || [];
  if (!allowed.includes(dbStatus)) {
    throw new ApiError(
      409,
      `Status cannot transition from ${mapVehicleStatusToApi(vehicle.status)} to ${status}. On Trip status is controlled by trip dispatch and completion.`
    );
  }

  const updated = await prisma.vehicle.update({
    where: { id },
    data: { status: dbStatus }
  });

  return mapVehicleToApi(updated);
};

export const remove = async (id) => {
  const vehicle = await getVehicleOrThrow(id);
  await assertNotOnActiveTrip(id, vehicle.status);

  await prisma.vehicle.delete({ where: { id } });
};

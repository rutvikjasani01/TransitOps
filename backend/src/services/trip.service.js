import prisma from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { mapTripToApi, mapTripStatusToDb } from "../utils/mappings.js";

const isExpired = (expiryDate) => new Date(expiryDate) < new Date();

export const list = async ({ status }) => {
  const dbStatus = status ? mapTripStatusToDb(status) : undefined;
  
  const trips = await prisma.trip.findMany({
    where: { status: dbStatus },
    include: {
      vehicle: true,
      driver: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return trips.map((t) => ({
    ...mapTripToApi(t),
    vehicle: t.vehicle,
    driver: t.driver
  }));
};

export const getById = async (id) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true }
  });
  if (!trip) throw new ApiError(404, "Trip not found.");
  return {
    ...mapTripToApi(trip),
    vehicle: trip.vehicle,
    driver: trip.driver
  };
};

export const create = async (data) => {
  // Validate vehicle & driver exist
  const vehicle = await prisma.vehicle.findUnique({ where: { id: data.vehicleId } });
  if (!vehicle) throw new ApiError(404, "Vehicle not found.");

  const driver = await prisma.driver.findUnique({ where: { id: data.driverId } });
  if (!driver) throw new ApiError(404, "Driver not found.");

  const trip = await prisma.trip.create({
    data: {
      source: data.source,
      destination: data.destination,
      cargoWeight: Number(data.cargoWeight),
      plannedDistance: Number(data.plannedDistance),
      status: "DRAFT",
      vehicleId: data.vehicleId,
      driverId: data.driverId
    }
  });

  return mapTripToApi(trip);
};

export const dispatch = async (id) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true }
  });
  if (!trip) throw new ApiError(404, "Trip not found.");
  if (trip.status !== "DRAFT") throw new ApiError(400, "Only draft trips can be dispatched.");

  const { vehicle, driver } = trip;

  // Enforce Cargo weight limits
  if (trip.cargoWeight > vehicle.maxCapacity) {
    throw new ApiError(422, `Cargo weight (${trip.cargoWeight} kg) exceeds vehicle maximum capacity (${vehicle.maxCapacity} kg).`);
  }

  // Enforce Vehicle availability
  if (vehicle.status !== "AVAILABLE") {
    throw new ApiError(422, `Vehicle is currently ${vehicle.status} and cannot be assigned.`);
  }

  // Enforce Driver availability
  if (driver.status !== "AVAILABLE") {
    throw new ApiError(422, `Driver is currently ${driver.status} and cannot be assigned.`);
  }

  // Enforce License validation
  if (isExpired(driver.licenseExpiryDate)) {
    throw new ApiError(422, "Driver license is expired and cannot be assigned.");
  }

  // Update statuses inside a database transaction
  const updatedTrip = await prisma.$transaction(async (tx) => {
    // Set vehicle and driver status to ON_TRIP
    await tx.vehicle.update({
      where: { id: vehicle.id },
      data: { status: "ON_TRIP" }
    });

    await tx.driver.update({
      where: { id: driver.id },
      data: { status: "ON_TRIP" }
    });

    // Update trip status to DISPATCHED
    return tx.trip.update({
      where: { id },
      data: { status: "DISPATCHED" }
    });
  });

  return mapTripToApi(updatedTrip);
};

export const complete = async (id) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true }
  });
  if (!trip) throw new ApiError(404, "Trip not found.");
  if (trip.status !== "DISPATCHED") throw new ApiError(400, "Only dispatched trips can be completed.");

  const { vehicle, driver } = trip;

  const updatedTrip = await prisma.$transaction(async (tx) => {
    // Increase vehicle odometer by trip distance
    await tx.vehicle.update({
      where: { id: vehicle.id },
      data: {
        status: "AVAILABLE",
        odometer: { increment: trip.plannedDistance }
      }
    });

    // Reset driver to AVAILABLE
    await tx.driver.update({
      where: { id: driver.id },
      data: { status: "AVAILABLE" }
    });

    // Set trip to COMPLETED
    return tx.trip.update({
      where: { id },
      data: { status: "COMPLETED" }
    });
  });

  return mapTripToApi(updatedTrip);
};

export const cancel = async (id) => {
  const trip = await prisma.trip.findUnique({
    where: { id },
    include: { vehicle: true, driver: true }
  });
  if (!trip) throw new ApiError(404, "Trip not found.");
  if (trip.status !== "DISPATCHED" && trip.status !== "DRAFT") {
    throw new ApiError(400, "Only draft or dispatched trips can be cancelled.");
  }

  const { vehicle, driver, status } = trip;

  const updatedTrip = await prisma.$transaction(async (tx) => {
    // Only release driver/vehicle if the trip was actually dispatched (ON_TRIP)
    if (status === "DISPATCHED") {
      await tx.vehicle.update({
        where: { id: vehicle.id },
        data: { status: "AVAILABLE" }
      });

      await tx.driver.update({
        where: { id: driver.id },
        data: { status: "AVAILABLE" }
      });
    }

    return tx.trip.update({
      where: { id },
      data: { status: "CANCELLED" }
    });
  });

  return mapTripToApi(updatedTrip);
};

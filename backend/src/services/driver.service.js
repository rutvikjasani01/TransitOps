import prisma from "../config/db.js";
import { ApiError } from "../utils/apiError.js";
import { mapDriverToApi, mapDriverStatusToDb } from "../utils/mappings.js";

const MANAGER_CONTROLLED_DRIVER_TRANSITIONS = {
  AVAILABLE: ["OFF_DUTY", "SUSPENDED"],
  OFF_DUTY: ["AVAILABLE", "SUSPENDED"],
  SUSPENDED: ["AVAILABLE", "OFF_DUTY"],
  ON_TRIP: []
};

const isExpired = (expiryDate) => new Date(expiryDate) < new Date();

const hasActiveTripForDriver = async (driverId) => {
  const activeTrip = await prisma.trip.findFirst({
    where: {
      driverId,
      status: { in: ["DRAFT", "DISPATCHED"] }
    }
  });
  return !!activeTrip;
};

const getDriverOrThrow = async (id) => {
  const driver = await prisma.driver.findUnique({ where: { id } });
  if (!driver) throw new ApiError(404, "Driver not found.");
  return driver;
};

const assertNotOnActiveTrip = async (driverId, status) => {
  if (status === "ON_TRIP" || await hasActiveTripForDriver(driverId)) {
    throw new ApiError(409, "Driver cannot be changed while assigned to an active trip.");
  }
};

const assertLicenseSupportsAvailability = (expiryDate, status) => {
  if (isExpired(expiryDate) && status === "AVAILABLE") {
    throw new ApiError(422, "A driver with an expired license cannot be Available. Renew the license or set the driver to Off Duty or Suspended.");
  }
};

export const list = async ({ status, search }) => {
  const dbStatus = status ? mapDriverStatusToDb(status) : undefined;

  const drivers = await prisma.driver.findMany({
    where: {
      status: dbStatus,
      OR: search ? [
        { name: { contains: search, mode: 'insensitive' } },
        { licenseNumber: { contains: search, mode: 'insensitive' } },
        { licenseCategory: { contains: search, mode: 'insensitive' } }
      ] : undefined
    },
    orderBy: { createdAt: 'desc' }
  });

  return drivers.map((d) => ({
    ...mapDriverToApi(d),
    licenseExpired: isExpired(d.licenseExpiryDate)
  }));
};

export const getById = async (id) => {
  const driver = await getDriverOrThrow(id);
  return {
    ...mapDriverToApi(driver),
    licenseExpired: isExpired(driver.licenseExpiryDate)
  };
};

export const create = async (data) => {
  const licenseNum = data.licenseNumber.trim().toUpperCase();
  const existing = await prisma.driver.findUnique({ where: { licenseNumber: licenseNum } });
  if (existing) throw new ApiError(409, `License number ${licenseNum} already exists.`);

  const dbStatus = data.status ? mapDriverStatusToDb(data.status) : "AVAILABLE";
  const parsedExpiry = new Date(data.expiryDate || data.licenseExpiryDate);
  assertLicenseSupportsAvailability(parsedExpiry, dbStatus);

  const driver = await prisma.driver.create({
    data: {
      name: data.name,
      licenseNumber: licenseNum,
      licenseCategory: data.licenseCategory,
      licenseExpiryDate: parsedExpiry,
      contactNumber: data.contactNumber,
      safetyScore: data.safetyScore !== undefined ? Number(data.safetyScore) : 100.0,
      status: dbStatus
    }
  });

  return {
    ...mapDriverToApi(driver),
    licenseExpired: isExpired(driver.licenseExpiryDate)
  };
};

export const update = async (id, changes) => {
  const driver = await getDriverOrThrow(id);
  await assertNotOnActiveTrip(id, driver.status);

  const updateData = {};

  if (changes.licenseNumber) {
    const licenseNum = changes.licenseNumber.trim().toUpperCase();
    const existing = await prisma.driver.findUnique({ where: { licenseNumber: licenseNum } });
    if (existing && existing.id !== id) {
      throw new ApiError(409, `License number ${licenseNum} is already in use.`);
    }
    updateData.licenseNumber = licenseNum;
  }

  const newExpiry = changes.expiryDate || changes.licenseExpiryDate 
    ? new Date(changes.expiryDate || changes.licenseExpiryDate) 
    : driver.licenseExpiryDate;

  if (changes.name) updateData.name = changes.name;
  if (changes.licenseCategory) updateData.licenseCategory = changes.licenseCategory;
  if (changes.licenseExpiryDate || changes.expiryDate) updateData.licenseExpiryDate = newExpiry;
  if (changes.contactNumber) updateData.contactNumber = changes.contactNumber;
  if (changes.safetyScore !== undefined) updateData.safetyScore = Number(changes.safetyScore);

  assertLicenseSupportsAvailability(newExpiry, driver.status);

  const updated = await prisma.driver.update({
    where: { id },
    data: updateData
  });

  return {
    ...mapDriverToApi(updated),
    licenseExpired: isExpired(updated.licenseExpiryDate)
  };
};

export const updateStatus = async (id, status) => {
  const driver = await getDriverOrThrow(id);
  const dbStatus = mapDriverStatusToDb(status);

  if (driver.status === dbStatus) {
    return {
      ...mapDriverToApi(driver),
      licenseExpired: isExpired(driver.licenseExpiryDate)
    };
  }

  await assertNotOnActiveTrip(id, driver.status);

  const allowed = MANAGER_CONTROLLED_DRIVER_TRANSITIONS[driver.status] || [];
  if (!allowed.includes(dbStatus)) {
    throw new ApiError(
      409,
      `Status cannot transition from ${mapDriverToApi(driver).status} to ${status}. On Trip status is controlled by trip dispatch and completion.`
    );
  }

  assertLicenseSupportsAvailability(driver.licenseExpiryDate, dbStatus);

  const updated = await prisma.driver.update({
    where: { id },
    data: { status: dbStatus }
  });

  return {
    ...mapDriverToApi(updated),
    licenseExpired: isExpired(updated.licenseExpiryDate)
  };
};

export const remove = async (id) => {
  const driver = await getDriverOrThrow(id);
  await assertNotOnActiveTrip(id, driver.status);

  await prisma.driver.delete({ where: { id } });
};

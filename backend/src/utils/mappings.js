export const mapRoleToApi = (role) => {
  const map = {
    FLEET_MANAGER: "Fleet Manager",
    DRIVER: "Driver",
    SAFETY_OFFICER: "Safety Officer",
    FINANCIAL_ANALYST: "Financial Analyst"
  };
  return map[role] || role;
};

export const mapRoleToDb = (role) => {
  const map = {
    "Fleet Manager": "FLEET_MANAGER",
    "Driver": "DRIVER",
    "Safety Officer": "SAFETY_OFFICER",
    "Financial Analyst": "FINANCIAL_ANALYST"
  };
  return map[role] || role;
};

export const mapVehicleStatusToApi = (status) => {
  const map = {
    AVAILABLE: "Available",
    ON_TRIP: "On Trip",
    IN_SHOP: "In Shop",
    RETIRED: "Retired"
  };
  return map[status] || status;
};

export const mapVehicleStatusToDb = (status) => {
  const map = {
    "Available": "AVAILABLE",
    "On Trip": "ON_TRIP",
    "In Shop": "IN_SHOP",
    "Retired": "RETIRED"
  };
  return map[status] || status;
};

export const mapDriverStatusToApi = (status) => {
  const map = {
    AVAILABLE: "Available",
    ON_TRIP: "On Trip",
    OFF_DUTY: "Off Duty",
    SUSPENDED: "Suspended"
  };
  return map[status] || status;
};

export const mapDriverStatusToDb = (status) => {
  const map = {
    "Available": "AVAILABLE",
    "On Trip": "ON_TRIP",
    "Off Duty": "OFF_DUTY",
    "Suspended": "SUSPENDED"
  };
  return map[status] || status;
};

export const mapTripStatusToApi = (status) => {
  const map = {
    DRAFT: "Draft",
    DISPATCHED: "Dispatched",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled"
  };
  return map[status] || status;
};

export const mapTripStatusToDb = (status) => {
  const map = {
    "Draft": "DRAFT",
    "Dispatched": "DISPATCHED",
    "Completed": "COMPLETED",
    "Cancelled": "CANCELLED"
  };
  return map[status] || status;
};

export const mapMaintenanceStatusToApi = (status) => {
  const map = {
    OPEN: "Open",
    COMPLETED: "Completed"
  };
  return map[status] || status;
};

export const mapMaintenanceStatusToDb = (status) => {
  const map = {
    "Open": "OPEN",
    "Completed": "COMPLETED"
  };
  return map[status] || status;
};

export const mapExpenseCategoryToApi = (category) => {
  const map = {
    TOLL: "Toll",
    PARKING: "Parking",
    MAINTENANCE: "Maintenance",
    FUEL: "Fuel",
    OTHER: "Other"
  };
  return map[category] || category;
};

export const mapExpenseCategoryToDb = (category) => {
  const map = {
    "Toll": "TOLL",
    "Parking": "PARKING",
    "Maintenance": "MAINTENANCE",
    "Fuel": "FUEL",
    "Other": "OTHER"
  };
  return map[category] || category;
};

export const mapUserToApi = (user) => {
  if (!user) return null;
  return {
    ...user,
    role: mapRoleToApi(user.role)
  };
};

export const mapVehicleToApi = (vehicle) => {
  if (!vehicle) return null;
  return {
    ...vehicle,
    status: mapVehicleStatusToApi(vehicle.status)
  };
};

export const mapDriverToApi = (driver) => {
  if (!driver) return null;
  return {
    ...driver,
    status: mapDriverStatusToApi(driver.status),
    expiryDate: driver.licenseExpiryDate ? driver.licenseExpiryDate.toISOString().split('T')[0] : null
  };
};

export const mapTripToApi = (trip) => {
  if (!trip) return null;
  return {
    ...trip,
    status: mapTripStatusToApi(trip.status),
    date: trip.createdAt ? trip.createdAt.toISOString().split('T')[0] : null
  };
};

export const mapMaintenanceToApi = (maint) => {
  if (!maint) return null;
  return {
    ...maint,
    status: mapMaintenanceStatusToApi(maint.status),
    date: maint.date ? maint.date.toISOString().split('T')[0] : null,
    notes: maint.description
  };
};

export const mapFuelLogToApi = (log) => {
  if (!log) return null;
  return {
    ...log,
    date: log.date ? log.date.toISOString().split('T')[0] : null
  };
};

export const mapExpenseToApi = (exp) => {
  if (!exp) return null;
  return {
    ...exp,
    category: mapExpenseCategoryToApi(exp.category),
    date: exp.date ? exp.date.toISOString().split('T')[0] : null
  };
};

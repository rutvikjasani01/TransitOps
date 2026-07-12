export const VEHICLE_TYPES = Object.freeze(["Truck", "Van", "Semi", "Box Truck"]);
export const VEHICLE_STATUSES = Object.freeze(["Available", "On Trip", "In Shop", "Retired"]);
export const MANAGER_CONTROLLED_TRANSITIONS = Object.freeze({ Available: ["In Shop", "Retired"], "In Shop": ["Available", "Retired"], Retired: [], "On Trip": [] });

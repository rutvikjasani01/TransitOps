export const DRIVER_STATUSES = Object.freeze(["Available", "On Trip", "Off Duty", "Suspended"]);
export const LICENSE_CATEGORIES = Object.freeze(["Class A CDL", "Class B CDL", "Class C CDL"]);
export const MANAGER_CONTROLLED_DRIVER_TRANSITIONS = Object.freeze({
  Available: ["Off Duty", "Suspended"],
  "Off Duty": ["Available", "Suspended"],
  Suspended: ["Available", "Off Duty"],
  "On Trip": []
});

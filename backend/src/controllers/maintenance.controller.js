import * as service from "../services/maintenance.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => {
  const logs = await service.list(req.query);
  res.json({ success: true, data: { maintenanceLogs: logs } });
});

export const getById = asyncHandler(async (req, res) => {
  const maintenanceLog = await service.getById(req.params.maintenanceId);
  res.json({ success: true, data: { maintenanceLog } });
});

export const create = asyncHandler(async (req, res) => {
  const maintenanceLog = await service.create(req.body);
  res.status(201).json({ success: true, data: { maintenanceLog } });
});

export const resolve = asyncHandler(async (req, res) => {
  const maintenanceLog = await service.resolve(req.params.maintenanceId);
  res.json({ success: true, data: { maintenanceLog } });
});

export const remove = asyncHandler(async (req, res) => {
  await service.remove(req.params.maintenanceId);
  res.status(204).send();
});

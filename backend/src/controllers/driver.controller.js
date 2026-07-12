import * as driverService from "../services/driver.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => res.json({ success: true, data: { drivers: await driverService.list(req.query) } }));
export const getById = asyncHandler(async (req, res) => res.json({ success: true, data: { driver: await driverService.getById(req.params.driverId) } }));
export const create = asyncHandler(async (req, res) => res.status(201).json({ success: true, data: { driver: await driverService.create(req.body) } }));
export const update = asyncHandler(async (req, res) => res.json({ success: true, data: { driver: await driverService.update(req.params.driverId, req.body) } }));
export const updateStatus = asyncHandler(async (req, res) => res.json({ success: true, data: { driver: await driverService.updateStatus(req.params.driverId, req.body.status) } }));
export const remove = asyncHandler(async (req, res) => { await driverService.remove(req.params.driverId); res.status(204).send(); });

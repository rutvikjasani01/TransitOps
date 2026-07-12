import * as vehicleService from "../services/vehicle.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => res.json({ success: true, data: { vehicles: await vehicleService.list(req.query) } }));
export const getById = asyncHandler(async (req, res) => res.json({ success: true, data: { vehicle: await vehicleService.getById(req.params.vehicleId) } }));
export const create = asyncHandler(async (req, res) => res.status(201).json({ success: true, data: { vehicle: await vehicleService.create(req.body) } }));
export const update = asyncHandler(async (req, res) => res.json({ success: true, data: { vehicle: await vehicleService.update(req.params.vehicleId, req.body) } }));
export const updateStatus = asyncHandler(async (req, res) => res.json({ success: true, data: { vehicle: await vehicleService.updateStatus(req.params.vehicleId, req.body.status) } }));
export const remove = asyncHandler(async (req, res) => { await vehicleService.remove(req.params.vehicleId); res.status(204).send(); });

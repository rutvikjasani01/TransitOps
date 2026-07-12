import * as fuelService from "../services/fuel.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => res.json({ success: true, data: { fuelLogs: await fuelService.list(req.query) } }));
export const summary = asyncHandler(async (req, res) => res.json({ success: true, data: await fuelService.summary(req.query) }));
export const getById = asyncHandler(async (req, res) => res.json({ success: true, data: { fuelLog: await fuelService.getById(req.params.fuelLogId) } }));
export const create = asyncHandler(async (req, res) => res.status(201).json({ success: true, data: { fuelLog: await fuelService.create(req.body) } }));
export const update = asyncHandler(async (req, res) => res.json({ success: true, data: { fuelLog: await fuelService.update(req.params.fuelLogId, req.body) } }));
export const remove = asyncHandler(async (req, res) => { await fuelService.remove(req.params.fuelLogId); res.status(204).send(); });

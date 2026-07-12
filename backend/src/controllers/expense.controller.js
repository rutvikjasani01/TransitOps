import * as expenseService from "../services/expense.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => res.json({ success: true, data: { expenses: await expenseService.list(req.query) } }));
export const summary = asyncHandler(async (req, res) => res.json({ success: true, data: await expenseService.summary(req.query) }));
export const getById = asyncHandler(async (req, res) => res.json({ success: true, data: { expense: await expenseService.getById(req.params.expenseId) } }));
export const create = asyncHandler(async (req, res) => res.status(201).json({ success: true, data: { expense: await expenseService.create(req.body) } }));
export const update = asyncHandler(async (req, res) => res.json({ success: true, data: { expense: await expenseService.update(req.params.expenseId, req.body) } }));
export const remove = asyncHandler(async (req, res) => { await expenseService.remove(req.params.expenseId); res.status(204).send(); });

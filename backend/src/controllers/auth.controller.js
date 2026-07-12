import * as authService from "../services/auth.service.js";
import { revokedTokenIds } from "../models/token.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const login = asyncHandler(async (req, res) => {
  const data = await authService.login(req.body);
  res.status(200).json({ success: true, data });
});

export const logout = asyncHandler(async (req, res) => {
  revokedTokenIds.add(req.auth.payload.jti);
  res.status(204).send();
});

export const me = asyncHandler(async (req, res) => {
  res.json({ success: true, data: { user: req.auth.user } });
});

export const register = asyncHandler(async (req, res) => {
  const data = await authService.register(req.body);
  res.status(201).json({ success: true, data });
});

import * as tripService from "../services/trip.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const list = asyncHandler(async (req, res) => {
  const trips = await tripService.list(req.query);
  res.json({ success: true, data: { trips } });
});

export const getById = asyncHandler(async (req, res) => {
  const trip = await tripService.getById(req.params.tripId);
  res.json({ success: true, data: { trip } });
});

export const create = asyncHandler(async (req, res) => {
  const trip = await tripService.create(req.body);
  res.status(201).json({ success: true, data: { trip } });
});

export const dispatchTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.dispatch(req.params.tripId);
  res.json({ success: true, data: { trip } });
});

export const completeTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.complete(req.params.tripId);
  res.json({ success: true, data: { trip } });
});

export const cancelTrip = asyncHandler(async (req, res) => {
  const trip = await tripService.cancel(req.params.tripId);
  res.json({ success: true, data: { trip } });
});

import * as reportService from "../services/report.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getFleet = asyncHandler(async (req, res) => {
  const report = await reportService.getFleetReport();
  res.json({ success: true, data: report });
});

export const getFinance = asyncHandler(async (req, res) => {
  const report = await reportService.getFinanceReport();
  res.json({ success: true, data: report });
});

export const getSafety = asyncHandler(async (req, res) => {
  const report = await reportService.getSafetyReport();
  res.json({ success: true, data: report });
});

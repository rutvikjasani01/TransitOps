import { validationResult } from "express-validator";

export const validateRequest = (req, res, next) => {
  const result = validationResult(req);
  if (result.isEmpty()) return next();
  return res.status(422).json({
    success: false,
    message: "Request validation failed.",
    errors: result.array().map(({ path, msg }) => ({ field: path, message: msg }))
  });
};

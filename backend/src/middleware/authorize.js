import { ApiError } from "../utils/apiError.js";

export const authorize = (...allowedRoles) => (req, res, next) => {
  if (!req.auth?.user) return next(new ApiError(401, "Authentication is required."));
  if (!allowedRoles.includes(req.auth.user.role)) return next(new ApiError(403, "You do not have permission to perform this action."));
  return next();
};

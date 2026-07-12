import { ApiError } from "../utils/apiError.js";
import { verifyAccessToken } from "../utils/jwt.js";
import { revokedTokenIds } from "../models/token.model.js";
import { getCurrentUser } from "../services/auth.service.js";

export const authenticate = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return next(new ApiError(401, "A Bearer access token is required."));

  try {
    const payload = verifyAccessToken(token);
    if (revokedTokenIds.has(payload.jti)) return next(new ApiError(401, "This access token has been revoked."));
    const user = await getCurrentUser(payload.sub);
    req.auth = { token, payload, user };
    return next();
  } catch (error) {
    return next(error.statusCode ? error : new ApiError(401, "Invalid or expired access token."));
  }
};

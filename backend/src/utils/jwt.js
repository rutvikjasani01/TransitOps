import jwt from "jsonwebtoken";
import { randomUUID } from "node:crypto";
import { env } from "../config/env.js";

export const signAccessToken = (user) => {
  const jti = randomUUID();
  const token = jwt.sign({ sub: user.id, role: user.role, jti }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
    issuer: "transitops-api",
    audience: "transitops-client"
  });
  return { token, jti };
};

export const verifyAccessToken = (token) => jwt.verify(token, env.jwtSecret, {
  issuer: "transitops-api",
  audience: "transitops-client"
});

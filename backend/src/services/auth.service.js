import bcrypt from "bcryptjs";
import { ApiError } from "../utils/apiError.js";
import { signAccessToken } from "../utils/jwt.js";
import prisma from "../config/db.js";
import { toPublicUser } from "../models/user.model.js";

export const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new ApiError(401, "Invalid email or password.");

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) throw new ApiError(401, "Invalid email or password.");

  const { token } = signAccessToken(user);
  return { accessToken: token, tokenType: "Bearer", user: toPublicUser(user) };
};

export const getCurrentUser = async (id) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw new ApiError(401, "User account is no longer active.");
  return toPublicUser(user);
};

export const register = async ({ name, email, password, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ApiError(409, "An account with this email address already exists.");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  
  const roleMap = {
    "Fleet Manager": "FLEET_MANAGER",
    "Dispatcher": "DRIVER",
    "Safety Officer": "SAFETY_OFFICER",
    "Financial Analyst": "FINANCIAL_ANALYST"
  };
  const dbRole = roleMap[role] || "DRIVER";

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: dbRole
    }
  });

  const { token } = signAccessToken(user);
  return { accessToken: token, tokenType: "Bearer", user: toPublicUser(user) };
};

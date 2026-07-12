import { body } from "express-validator";

export const loginValidator = [
  body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("password").isString().isLength({ min: 6, max: 128 }).withMessage("Password must be at least 6 characters.")
];

export const registerValidator = [
  body("name").trim().notEmpty().withMessage("Name is required.").isLength({ min: 2, max: 100 }),
  body("email").trim().isEmail().withMessage("A valid email is required.").normalizeEmail(),
  body("password").isString().isLength({ min: 6, max: 128 }).withMessage("Password must be at least 6 characters."),
  body("role").trim().isIn(["Fleet Manager", "Dispatcher", "Safety Officer", "Financial Analyst"]).withMessage("Invalid simulator role selected.")
];

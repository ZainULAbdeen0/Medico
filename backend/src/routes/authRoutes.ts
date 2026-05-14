import { Router } from "express";
import { login, register, getMe } from "../controllers/authController";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validators/authValidators";
import { verifyToken } from "../middleware/auth";
import { authLimiter } from "../middleware/rateLimiter";

const router = Router();

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/me", verifyToken, getMe);

export default router;
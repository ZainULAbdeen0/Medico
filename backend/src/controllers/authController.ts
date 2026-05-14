import { Request, Response, NextFunction } from "express";
import jwt, { Secret, SignOptions } from "jsonwebtoken";
import User from "../models/User";

const signToken = (payload: { userId: string; role: string; name: string }): string => {
  const secret = process.env.JWT_SECRET as Secret | undefined;
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  if (!secret) {
    throw new Error("JWT secret not configured");
  }
  const options: SignOptions = { expiresIn: expiresIn as SignOptions["expiresIn"] };
  return jwt.sign(payload, secret, options);
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;
    const existing = await User.findOne({ email }).select("_id");
    if (existing) {
      res.status(409).json({ success: false, message: "Email already exists" });
      return;
    }

    const created = await User.create({ name, email, password, role });
    const user = await User.findById(created._id).select("-password");
    res.status(201).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const token = signToken({ userId: user._id.toString(), role: user.role, name: user.name });
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  res.json({ success: true, user: req.user });
};
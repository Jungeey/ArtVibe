import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import UserModel from "../models/User";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const JWT_EXPIRES = "7d";

export const register = async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      password,
      role,
      phone,
      address,
      businessName,
      businessLicense,
    } = req.body;

    if (role === "admin")
      return res.status(403).json({ message: "Admin can't register" });

    const existing = await UserModel.findOne({ email });
    if (existing)
      return res.status(400).json({ message: "Email already exists" });

    // Vendor requires extra info
    if (role === "vendor") {
      if (!businessName || !businessLicense)
        return res
          .status(400)
          .json({ message: "Business name and license required for vendors" });
    }

    // const hashedPassword = await bcrypt.hash(password, 12);

    const user = await UserModel.create({
      name,
      email,
      password, // This will be hashed automatically by userSchema pre-save hook
      role: role || "user",
      phone,
      address,
      businessName: role === "vendor" ? businessName : undefined,
      businessLicense: role === "vendor" ? businessLicense : undefined,
    });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorVerified: (user as any).vendorVerified,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    // Admin bypass vendorVerified
    if (user.role === 'vendor' && !user.vendorVerified) {
      return res.status(403).json({ message: 'Vendor not verified yet' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES,
    });

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendorVerified: user.vendorVerified,
      },
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};


import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    user.refreshToken = refreshToken;

    await user.save();

    res
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({ accessToken });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (user) {
    user.refreshToken = "";

    await user.save();
  }

  res
    .clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    })
    .status(200)
    .json({ message: "Logged out" });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body;

  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decode = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await User.findById(decode.userId);

    if (!user || user.refreshToken !== token) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "15m",
    });
    const newRefreshToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "7d",
    });

    user.refreshToken = newRefreshToken;

    await user.save();

    res
      .cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      })
      .status(200)
      .json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(403).json({ message: "Invalid refresh token" });
  }
};

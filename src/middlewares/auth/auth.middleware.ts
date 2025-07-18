import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

interface AuthRequest extends Request {
  user?: string;
}

export const authenticate = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const autHeader = req.headers.authorization;

  if (!autHeader) return res.status(401).json({ message: "No token provided" });

  const token = autHeader.split(" ")[1];

  try {
    const decode = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.user = decode.userId;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

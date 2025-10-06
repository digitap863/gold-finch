import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export const verifyToken = (req: NextRequest) => {
    try {
      const token = req.cookies.get("token")?.value;
      if (!token) {
        return null;
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
        role: string;
        isApproved: boolean;
        isBlocked: boolean;
      };
      
      return decoded;
    } catch {
      return null;
    }
  };
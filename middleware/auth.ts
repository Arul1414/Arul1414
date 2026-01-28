
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include user
interface AuthRequest extends Request {
  user?: any;
}

// Fix: Using any for req and res to bypass incorrect type definitions in the environment
export const authMiddleware = (req: any, res: any, next: NextFunction) => {
  // Get token from Header (Format: Bearer <token>)
  // Fix: Use headers property instead of header() method for better compatibility with provided types
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'skillx_secret_key');
    req.user = (decoded as any).user;
    next(); // Move to the next function (the controller)
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

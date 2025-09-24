import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel, { IUser, UserRole } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: UserRole };

    const user = await UserModel.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }

    req.user = user;
    next(); // ✅ This calls the next middleware
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};

// Make authorizeRoles async-aware
export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Add a small delay or check if user is set
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, please authenticate first' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Access denied. Required roles: ${roles.join(', ')}`,
        yourRole: req.user.role
      });
    }

    next();
  };
};
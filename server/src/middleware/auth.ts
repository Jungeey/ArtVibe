import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import UserModel, { IUser, UserRole } from '../models/User';

export interface AuthRequest extends Request {
  user?: IUser;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;
  console.log('Authorization header:', req.headers.authorization);

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token extracted:', token ? 'Yes' : 'No');
  }

  if (!token) {
    console.log('No token found');
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }

  try {
    console.log('JWT Secret exists:', !!process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { id: string; role: UserRole };
    console.log('Decoded token:', decoded);
    
    const user = await UserModel.findById(decoded.id).select('-password');
    console.log('User found:', user ? 'Yes' : 'No');
    
    if (!user) return res.status(401).json({ message: 'User not found' });

    req.user = user;
    next(); // This should call authorizeRoles next
  } catch (err) {
    console.log('Token verification error:', err);
    return res.status(401).json({ message: 'Token invalid' });
  }
};

export const authorizeRoles = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // return console too for testing
    console.log('User:', req.user);
    if (!req.user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Please login first' });
    }

    if (!roles.includes(req.user.role)) {
      console.log('Access denied');
      return res.status(403).json({ message: 'Access denied' });
    }

    if (req.user.role === 'vendor' && !req.user.vendorVerified) {
      console.log('Vendor not verified');
      return res.status(403).json({ message: 'Vendor not verified' });
    }

    next();
  };
};

import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { ApiError } from '../utils/apiError';
import { User } from '../models/user.model';

export interface AuthenticatedRequest extends Request {
  user?: JwtPayload & { id: string; status: 'ACTIVE' | 'SUSPENDED' };
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    } else if (req.headers.cookie) {
      const rawCookies = req.headers.cookie.split(';');
      for (const item of rawCookies) {
        const [key, val] = item.trim().split('=');
        if (key === 'token' && val) {
          token = decodeURIComponent(val);
          break;
        }
      }
    }

    if (!token) {
      throw new ApiError(401, 'Authentication required. Token missing.');
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      throw new ApiError(401, 'User no longer exists.');
    }

    if (user.status === 'SUSPENDED') {
      throw new ApiError(403, 'Your account has been suspended. Please contact platform administration.');
    }

    req.user = {
      userId: user._id.toString(),
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      status: user.status,
    };

    next();
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError(401, 'Invalid or expired token.'));
    }
  }
};

export const authorizeRoles = (...roles: ('STUDENT' | 'ADMIN' | 'TRAINER')[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required.'));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(403, 'Forbidden: Insufficient privileges to access this resource.'));
    }

    next();
  };
};

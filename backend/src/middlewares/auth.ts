import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import debug from 'debug';

const authDebug = debug('fallhelp:auth');

// ==========================================
// 🛡️ LAYER: Security (Middleware)
// Purpose: Protect routes with JWT authentication and role-based access control
// ==========================================

/**
 * Authenticate JWT token from Authorization header
 */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    authDebug('Auth header present:', !!authHeader, 'Path:', req.path);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      authDebug('No token provided for path:', req.path);
      res.status(401).json({
        success: false,
        error: 'No token provided. Please login.',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    const decoded = verifyToken(token);
    authDebug('Token verified for user:', decoded?.userId, 'path:', req.path);

    req.user = decoded;
    next();
  } catch (error) {
    authDebug('Token verification failed:', (error as Error).message);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please login again.',
    });
  }
};

/**
 * Check if user has ADMIN role
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Authentication required',
    });
    return;
  }

  if (req.user.role !== 'ADMIN') {
    res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
    return;
  }

  next();
};

/**
 * Optional authentication (doesn't fail if no token)
 */
export const optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);
      req.user = decoded;
    }
  } catch (error) {
    // Ignore errors, continue without user
  }

  next();
};

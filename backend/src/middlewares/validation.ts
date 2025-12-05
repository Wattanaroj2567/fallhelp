import { Request, Response, NextFunction } from 'express';

interface ValidationRule {
  field: string;
  required?: boolean;
  type?: 'string' | 'number' | 'boolean' | 'email' | 'array';
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => boolean;
  message?: string;
}

/**
 * Generic validation middleware factory
 */
export const validate = (rules: ValidationRule[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const errors: string[] = [];

    for (const rule of rules) {
      const value = req.body[rule.field];

      // Required check
      if (rule.required && (value === undefined || value === null || value === '')) {
        errors.push(rule.message || `${rule.field} is required`);
        continue;
      }

      // Skip validation if field is optional and not provided
      if (!rule.required && (value === undefined || value === null)) {
        continue;
      }

      // Type check
      if (rule.type) {
        if (rule.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            errors.push(`${rule.field} must be a valid email`);
          }
        } else if (rule.type === 'array') {
          if (!Array.isArray(value)) {
            errors.push(`${rule.field} must be an array`);
          }
        } else if (typeof value !== rule.type) {
          errors.push(`${rule.field} must be a ${rule.type}`);
        }
      }

      // String validations
      if (typeof value === 'string') {
        if (rule.minLength && value.length < rule.minLength) {
          errors.push(`${rule.field} must be at least ${rule.minLength} characters`);
        }
        if (rule.maxLength && value.length > rule.maxLength) {
          errors.push(`${rule.field} must be at most ${rule.maxLength} characters`);
        }
        if (rule.pattern && !rule.pattern.test(value)) {
          errors.push(rule.message || `${rule.field} format is invalid`);
        }
      }

      // Number validations
      if (typeof value === 'number') {
        if (rule.min !== undefined && value < rule.min) {
          errors.push(`${rule.field} must be at least ${rule.min}`);
        }
        if (rule.max !== undefined && value > rule.max) {
          errors.push(`${rule.field} must be at most ${rule.max}`);
        }
      }

      // Custom validation
      if (rule.custom && !rule.custom(value)) {
        errors.push(rule.message || `${rule.field} is invalid`);
      }
    }

    if (errors.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Validation failed',
        errors,
      });
      return;
    }

    next();
  };
};

/**
 * Validate email format
 */
export const validateEmail = validate([
  { field: 'email', required: true, type: 'email' },
]);

/**
 * Validate login request
 */
export const validateLogin = validate([
  { field: 'identifier', required: false, type: 'string' }, // Optional because it might be email
  { field: 'email', required: false, type: 'string' }, // Keep for backward compatibility
  { field: 'password', required: true, type: 'string', minLength: 6 },
]);

/**
 * Validate registration request
 */
export const validateRegister = validate([
  { field: 'email', required: true, type: 'email' },
  { field: 'password', required: true, type: 'string', minLength: 8 },
  { field: 'firstName', required: true, type: 'string', minLength: 2 },
  { field: 'lastName', required: true, type: 'string', minLength: 2 },
  { field: 'phone', required: false, type: 'string', pattern: /^0\d{9}$/, message: 'Phone must be 10 digits starting with 0' },
]);

/**
 * Validate OTP request
 */
export const validateOtpRequest = validate([
  { field: 'email', required: true, type: 'email' },
  { field: 'purpose', required: true, type: 'string' },
]);

/**
 * Validate OTP verification
 */
export const validateOtpVerification = validate([
  { field: 'email', required: true, type: 'email' },
  { field: 'code', required: true, type: 'string', minLength: 6, maxLength: 6 },
  { field: 'purpose', required: true, type: 'string' },
]);

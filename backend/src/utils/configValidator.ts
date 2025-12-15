/**
 * @fileoverview Config Validator
 * @description Validates environment variables at startup to prevent runtime errors
 */

import createDebug from 'debug';

const log = createDebug('fallhelp:config');

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate configuration values
 */
export function validateConfig(env: NodeJS.ProcessEnv): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required: DATABASE_URL
  if (!env.DATABASE_URL) {
    errors.push('DATABASE_URL is required');
  } else {
    try {
      new URL(env.DATABASE_URL);
    } catch {
      errors.push('DATABASE_URL has invalid format');
    }
  }

  // Required: JWT_SECRET
  if (!env.JWT_SECRET) {
    errors.push('JWT_SECRET is required');
  } else if (env.JWT_SECRET.length < 32) {
    warnings.push('JWT_SECRET should be at least 32 characters for security');
  }

  // Optional: PORT (with validation)
  if (env.PORT) {
    const port = parseInt(env.PORT, 10);
    if (isNaN(port) || port < 1 || port > 65535) {
      errors.push(`PORT must be a number between 1-65535, got: ${env.PORT}`);
    }
  }

  // Optional: MQTT_BROKER_URL (validate format if provided)
  if (env.MQTT_BROKER_URL && !env.MQTT_DISABLED) {
    try {
      new URL(env.MQTT_BROKER_URL);
    } catch {
      errors.push('MQTT_BROKER_URL has invalid format');
    }
  }

  // Optional: RESEND_API_KEY (warn if missing in production)
  if (!env.RESEND_API_KEY && env.NODE_ENV === 'production') {
    warnings.push('RESEND_API_KEY is not set - email features will be disabled');
  }

  // Optional: FRONTEND_URL and ADMIN_URL (warn if missing)
  if (!env.FRONTEND_URL) {
    warnings.push('FRONTEND_URL is not set - CORS may not work correctly');
  }
  if (!env.ADMIN_URL) {
    warnings.push('ADMIN_URL is not set - CORS may not work correctly');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validate and log configuration at startup
 */
export function validateAndLogConfig(env: NodeJS.ProcessEnv): void {
  const result = validateConfig(env);

  if (result.warnings.length > 0) {
    result.warnings.forEach((warning) => {
      log('[Warn] %s', warning);
    });
  }

  if (!result.isValid) {
    const errorMessage = `Configuration validation failed:\n${result.errors.join('\n')}`;
    log('[Error] %s', errorMessage);
    throw new Error(errorMessage);
  }

  log('Configuration validated successfully');
}

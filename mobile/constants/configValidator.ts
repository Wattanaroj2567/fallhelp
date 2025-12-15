/**
 * @fileoverview Config Validator
 * @description Validates configuration values at startup to prevent runtime errors
 */

import Logger from '@/utils/logger';

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validate API URL format
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Validate configuration values
 */
export function validateConfig(config: {
  API_URL: string;
  SOCKET_URL: string;
  REQUEST_TIMEOUT: number;
}): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate API_URL
  if (!config.API_URL) {
    errors.push('API_URL is required');
  } else if (!isValidUrl(config.API_URL)) {
    errors.push(`API_URL has invalid format: ${config.API_URL}`);
  } else if (config.API_URL.includes('localhost') && !__DEV__) {
    warnings.push('API_URL is set to localhost - this may not work in production');
  }

  // Validate SOCKET_URL
  if (!config.SOCKET_URL) {
    errors.push('SOCKET_URL is required');
  } else if (!isValidUrl(config.SOCKET_URL)) {
    errors.push(`SOCKET_URL has invalid format: ${config.SOCKET_URL}`);
  } else if (config.SOCKET_URL.includes('localhost') && !__DEV__) {
    warnings.push('SOCKET_URL is set to localhost - this may not work in production');
  }

  // Validate REQUEST_TIMEOUT
  if (typeof config.REQUEST_TIMEOUT !== 'number' || config.REQUEST_TIMEOUT <= 0) {
    errors.push(`REQUEST_TIMEOUT must be a positive number, got: ${config.REQUEST_TIMEOUT}`);
  } else if (config.REQUEST_TIMEOUT < 5000) {
    warnings.push('REQUEST_TIMEOUT is less than 5 seconds - may cause timeout issues');
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
export function validateAndLogConfig(config: {
  API_URL: string;
  SOCKET_URL: string;
  REQUEST_TIMEOUT: number;
}): void {
  const result = validateConfig(config);

  if (result.warnings.length > 0) {
    result.warnings.forEach((warning) => {
      Logger.warn(`[Config] ${warning}`);
    });
  }

  if (!result.isValid) {
    const errorMessage = `[Config] Configuration validation failed:\n${result.errors.join('\n')}`;
    Logger.error(errorMessage);
    throw new Error(errorMessage);
  }

  Logger.info('[Config] Configuration validated successfully');
}

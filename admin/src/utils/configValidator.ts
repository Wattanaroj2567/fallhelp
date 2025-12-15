/**
 * @fileoverview Config Validator
 * @description Validates configuration values at startup to prevent runtime errors
 */

import Logger from './logger';

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
export function validateConfig(config: { API_URL: string }): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate API_URL
  if (!config.API_URL) {
    errors.push('API_URL is required');
  } else if (!isValidUrl(config.API_URL)) {
    errors.push(`API_URL has invalid format: ${config.API_URL}`);
  } else if (config.API_URL.includes('localhost') && import.meta.env.PROD) {
    warnings.push('API_URL is set to localhost - this may not work in production');
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
export function validateAndLogConfig(config: { API_URL: string }): void {
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


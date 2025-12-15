/**
 * @fileoverview Logger Utility
 * @description Centralized logger for the application.
 * Wraps console methods to add timestamps and consistent formatting.
 * Can be extended to send logs to external services (e.g., Sentry, Firebase Crashlytics).
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

class Logger {
  private static isDev = __DEV__;

  private static formatMessage(level: LogLevel, message: string, data?: unknown) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    return { prefix, message, data };
  }

  static debug(message: string, data?: unknown) {
    if (this.isDev) {
      const { prefix } = this.formatMessage('debug', message, data);
      if (data) {
        console.debug(prefix, message, data);
      } else {
        console.debug(prefix, message);
      }
    }
  }

  static info(message: string, data?: unknown) {
    const { prefix } = this.formatMessage('info', message, data);
    if (data) {
      console.info(prefix, message, data);
    } else {
      console.info(prefix, message);
    }
  }

  static warn(message: string, data?: unknown) {
    const { prefix } = this.formatMessage('warn', message, data);
    if (data) {
      console.warn(prefix, message, data);
    } else {
      console.warn(prefix, message);
    }
  }

  static error(message: string, error?: unknown, meta?: unknown) {
    const { prefix } = this.formatMessage('error', message, error);
    if (error) {
      if (meta) {
        console.error(prefix, message, error, meta);
      } else {
        console.error(prefix, message, error);
      }
    } else {
      console.error(prefix, message);
    }

    // TODO: Add external crash reporting here (e.g., Sentry.captureException(error))
  }
}

export default Logger;

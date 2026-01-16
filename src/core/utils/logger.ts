/**
 * Centralized logging utility
 * Replaces console statements with proper logging
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  /**
   * Log informational messages (only in development)
   */
  log(message: string, ...args: unknown[]): void {
    if (this.isDevelopment) {
      console.log(`[LOG] ${message}`, ...args);
    }
  }

  /**
   * Log info messages (only in development)
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '');
    }
  }

  /**
   * Log debug messages (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '');
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '');
    }
  }

  /**
   * Log error messages
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    // Always log errors
    console.error(`[ERROR] ${message}`, error || '', context || '');
  }

  /**
   * Log API errors with request context
   */
  apiError(
    endpoint: string,
    error: Error | unknown,
    context?: LogContext
  ): void {
    const message = `API Error: ${endpoint}`;
    this.error(message, error, {
      endpoint,
      ...context,
    });
  }

  /**
   * Log database errors
   */
  dbError(operation: string, error: Error | unknown, context?: LogContext): void {
    const message = `Database Error: ${operation}`;
    this.error(message, error, {
      operation,
      ...context,
    });
  }
}

// Export singleton instance
export const logger = new Logger();

// Export type for use in other files
export type { LogContext, LogLevel };


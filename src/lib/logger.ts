/**
 * Structured Logger Utility
 * 
 * Provides consistent logging across the application with:
 * - Log levels (debug, info, warn, error)
 * - Development-only logging for debug/info
 * - Structured error logging for production
 * - Silent operation in production for non-critical logs
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

const isDevelopment = process.env.NODE_ENV === 'development';

// Log level configuration - only warn and error are shown in production
const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// Minimum log level for production
const PRODUCTION_MIN_LEVEL: LogLevel = 'warn';

function shouldLog(level: LogLevel): boolean {
  if (isDevelopment) {
    return true; // Log everything in development
  }
  return LOG_LEVELS[level] >= LOG_LEVELS[PRODUCTION_MIN_LEVEL];
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const contextStr = context ? ` ${JSON.stringify(context)}` : '';
  return `[${timestamp}] [${level.toUpperCase()}] ${message}${contextStr}`;
}

/**
 * Logger object with methods for different log levels
 */
export const logger = {
  /**
   * Debug level - only logs in development
   * Use for detailed debugging information
   */
  debug(message: string, context?: LogContext): void {
    if (shouldLog('debug')) {
      console.debug(formatMessage('debug', message, context));
    }
  },

  /**
   * Info level - only logs in development
   * Use for general informational messages
   */
  info(message: string, context?: LogContext): void {
    if (shouldLog('info')) {
      console.info(formatMessage('info', message, context));
    }
  },

  /**
   * Warn level - logs in both development and production
   * Use for warning messages that don't stop execution
   */
  warn(message: string, context?: LogContext): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', message, context));
    }
  },

  /**
   * Error level - logs in both development and production
   * Use for error messages
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (shouldLog('error')) {
      const errorContext = {
        ...context,
        ...(error instanceof Error && {
          errorName: error.name,
          errorMessage: error.message,
          stack: isDevelopment ? error.stack : undefined,
        }),
      };
      console.error(formatMessage('error', message, errorContext));
    }
  },

  /**
   * Group related logs together (development only)
   */
  group(label: string, fn: () => void): void {
    if (isDevelopment) {
      console.group(label);
      fn();
      console.groupEnd();
    }
  },

  /**
   * Log with timing information (development only)
   */
  time(label: string): void {
    if (isDevelopment) {
      console.time(label);
    }
  },

  timeEnd(label: string): void {
    if (isDevelopment) {
      console.timeEnd(label);
    }
  },
};

/**
 * Create a namespaced logger for a specific module
 */
export function createLogger(namespace: string) {
  return {
    debug: (message: string, context?: LogContext) => 
      logger.debug(`[${namespace}] ${message}`, context),
    info: (message: string, context?: LogContext) => 
      logger.info(`[${namespace}] ${message}`, context),
    warn: (message: string, context?: LogContext) => 
      logger.warn(`[${namespace}] ${message}`, context),
    error: (message: string, error?: Error | unknown, context?: LogContext) => 
      logger.error(`[${namespace}] ${message}`, error, context),
  };
}

// Pre-configured loggers for common modules
export const authLogger = createLogger('Auth');
export const bookingLogger = createLogger('Booking');
export const apiLogger = createLogger('API');
export const firestoreLogger = createLogger('Firestore');

export default logger;


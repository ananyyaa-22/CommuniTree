/**
 * Centralized Error Logging Utility
 * 
 * Provides structured logging for errors throughout the application.
 * Supports different log levels and categories for better error tracking.
 * Includes integration points for external monitoring services (e.g., Sentry).
 * 
 * @see Requirements 13.1, 13.6
 */

/**
 * Log levels for categorizing error severity
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal',
}

/**
 * Log categories for organizing errors by domain
 */
export enum LogCategory {
  AUTH = 'auth',
  DATABASE = 'database',
  NETWORK = 'network',
  VALIDATION = 'validation',
  UI = 'ui',
  GENERAL = 'general',
}

/**
 * Context information for error logs
 */
export interface LogContext {
  operation?: string;
  resource?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

/**
 * Structured log entry
 */
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  category: LogCategory;
  message: string;
  error?: Error;
  context?: LogContext;
  stack?: string;
}

/**
 * Logger configuration
 */
interface LoggerConfig {
  enableConsoleLogging: boolean;
  enableRemoteLogging: boolean;
  minLogLevel: LogLevel;
  remoteEndpoint?: string;
}

/**
 * Default logger configuration
 */
const defaultConfig: LoggerConfig = {
  enableConsoleLogging: true,
  enableRemoteLogging: false,
  minLogLevel: LogLevel.INFO,
};

/**
 * Current logger configuration
 */
let config: LoggerConfig = { ...defaultConfig };

/**
 * Log level priorities for filtering
 */
const logLevelPriority: Record<LogLevel, number> = {
  [LogLevel.DEBUG]: 0,
  [LogLevel.INFO]: 1,
  [LogLevel.WARN]: 2,
  [LogLevel.ERROR]: 3,
  [LogLevel.FATAL]: 4,
};

/**
 * Configure the logger
 * 
 * @param newConfig - Partial configuration to merge with defaults
 */
export function configureLogger(newConfig: Partial<LoggerConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Check if a log level should be logged based on configuration
 * 
 * @param level - Log level to check
 * @returns True if the level should be logged
 */
function shouldLog(level: LogLevel): boolean {
  return logLevelPriority[level] >= logLevelPriority[config.minLogLevel];
}

/**
 * Format log entry for console output
 * 
 * @param entry - Log entry to format
 * @returns Formatted log string
 */
function formatLogEntry(entry: LogEntry): string {
  const timestamp = entry.timestamp.toISOString();
  const level = entry.level.toUpperCase().padEnd(5);
  const category = `[${entry.category}]`.padEnd(12);
  
  let message = `${timestamp} ${level} ${category} ${entry.message}`;
  
  if (entry.context) {
    const contextStr = JSON.stringify(entry.context, null, 2);
    message += `\nContext: ${contextStr}`;
  }
  
  if (entry.error) {
    message += `\nError: ${entry.error.message}`;
  }
  
  if (entry.stack) {
    message += `\nStack: ${entry.stack}`;
  }
  
  return message;
}

/**
 * Log to console with appropriate styling
 * 
 * @param entry - Log entry to output
 */
function logToConsole(entry: LogEntry): void {
  const formatted = formatLogEntry(entry);
  
  switch (entry.level) {
    case LogLevel.DEBUG:
      console.debug(formatted);
      break;
    case LogLevel.INFO:
      console.info(formatted);
      break;
    case LogLevel.WARN:
      console.warn(formatted);
      break;
    case LogLevel.ERROR:
    case LogLevel.FATAL:
      console.error(formatted);
      break;
  }
}

/**
 * Send log to remote monitoring service
 * 
 * @param entry - Log entry to send
 */
async function logToRemote(entry: LogEntry): Promise<void> {
  if (!config.remoteEndpoint) {
    return;
  }
  
  try {
    // Integration point for services like Sentry, LogRocket, etc.
    // This is a placeholder - actual implementation depends on the service
    await fetch(config.remoteEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(entry),
    });
  } catch (error) {
    // Fail silently to avoid infinite logging loops
    console.error('Failed to send log to remote service:', error);
  }
}

/**
 * Core logging function
 * 
 * @param level - Log level
 * @param category - Log category
 * @param message - Log message
 * @param error - Optional error object
 * @param context - Optional context information
 */
function log(
  level: LogLevel,
  category: LogCategory,
  message: string,
  error?: Error,
  context?: LogContext
): void {
  if (!shouldLog(level)) {
    return;
  }
  
  const entry: LogEntry = {
    timestamp: new Date(),
    level,
    category,
    message,
    error,
    context,
    stack: error?.stack,
  };
  
  if (config.enableConsoleLogging) {
    logToConsole(entry);
  }
  
  if (config.enableRemoteLogging) {
    // Fire and forget - don't await to avoid blocking
    logToRemote(entry).catch(() => {
      // Silently fail
    });
  }
}

/**
 * Log a debug message
 * 
 * @param category - Log category
 * @param message - Log message
 * @param context - Optional context information
 */
export function logDebug(
  category: LogCategory,
  message: string,
  context?: LogContext
): void {
  log(LogLevel.DEBUG, category, message, undefined, context);
}

/**
 * Log an info message
 * 
 * @param category - Log category
 * @param message - Log message
 * @param context - Optional context information
 */
export function logInfo(
  category: LogCategory,
  message: string,
  context?: LogContext
): void {
  log(LogLevel.INFO, category, message, undefined, context);
}

/**
 * Log a warning message
 * 
 * @param category - Log category
 * @param message - Log message
 * @param error - Optional error object
 * @param context - Optional context information
 */
export function logWarn(
  category: LogCategory,
  message: string,
  error?: Error,
  context?: LogContext
): void {
  log(LogLevel.WARN, category, message, error, context);
}

/**
 * Log an error message
 * 
 * @param category - Log category
 * @param message - Log message
 * @param error - Error object
 * @param context - Optional context information
 */
export function logError(
  category: LogCategory,
  message: string,
  error: Error,
  context?: LogContext
): void {
  log(LogLevel.ERROR, category, message, error, context);
}

/**
 * Log a fatal error message
 * 
 * @param category - Log category
 * @param message - Log message
 * @param error - Error object
 * @param context - Optional context information
 */
export function logFatal(
  category: LogCategory,
  message: string,
  error: Error,
  context?: LogContext
): void {
  log(LogLevel.FATAL, category, message, error, context);
}

/**
 * Log a database error with context
 * 
 * @param operation - Database operation (e.g., 'SELECT', 'INSERT', 'UPDATE')
 * @param resource - Resource being accessed (e.g., 'users', 'events')
 * @param error - Error object
 * @param userId - Optional user ID
 * @param metadata - Optional additional metadata
 */
export function logDatabaseError(
  operation: string,
  resource: string,
  error: Error,
  userId?: string,
  metadata?: Record<string, any>
): void {
  logError(
    LogCategory.DATABASE,
    `Database ${operation} failed on ${resource}`,
    error,
    {
      operation,
      resource,
      userId,
      metadata,
    }
  );
}

/**
 * Log an authentication error
 * 
 * @param operation - Auth operation (e.g., 'signIn', 'signUp', 'signOut')
 * @param error - Error object
 * @param userId - Optional user ID
 * @param metadata - Optional additional metadata
 */
export function logAuthError(
  operation: string,
  error: Error,
  userId?: string,
  metadata?: Record<string, any>
): void {
  logError(
    LogCategory.AUTH,
    `Authentication ${operation} failed`,
    error,
    {
      operation,
      resource: 'auth',
      userId,
      metadata,
    }
  );
}

/**
 * Log a network error
 * 
 * @param operation - Network operation (e.g., 'fetch', 'upload')
 * @param error - Error object
 * @param context - Optional context information
 */
export function logNetworkError(
  operation: string,
  error: Error,
  context?: LogContext
): void {
  logError(
    LogCategory.NETWORK,
    `Network ${operation} failed`,
    error,
    {
      operation,
      ...context,
    }
  );
}

/**
 * Log a validation error
 * 
 * @param field - Field that failed validation
 * @param error - Error object
 * @param context - Optional context information
 */
export function logValidationError(
  field: string,
  error: Error,
  context?: LogContext
): void {
  logError(
    LogCategory.VALIDATION,
    `Validation failed for field: ${field}`,
    error,
    {
      resource: field,
      ...context,
    }
  );
}

/**
 * Integration point for Sentry
 * Call this function to initialize Sentry integration
 * 
 * @param dsn - Sentry DSN
 * @param environment - Environment name (e.g., 'production', 'development')
 */
export function initializeSentry(dsn: string, environment: string): void {
  // Placeholder for Sentry initialization
  // In a real implementation, you would:
  // 1. Import Sentry SDK
  // 2. Initialize with DSN and options
  // 3. Set up error boundary integration
  
  logInfo(
    LogCategory.GENERAL,
    'Sentry integration initialized',
    {
      metadata: { dsn, environment },
    }
  );
  
  // Example:
  // import * as Sentry from '@sentry/react';
  // Sentry.init({
  //   dsn,
  //   environment,
  //   integrations: [new Sentry.BrowserTracing()],
  //   tracesSampleRate: 1.0,
  // });
}

/**
 * Export logger instance for direct use
 */
export const logger = {
  debug: logDebug,
  info: logInfo,
  warn: logWarn,
  error: logError,
  fatal: logFatal,
  database: logDatabaseError,
  auth: logAuthError,
  network: logNetworkError,
  validation: logValidationError,
  configure: configureLogger,
  initializeSentry,
};

export default logger;

/**
 * Custom error classes for Supabase integration
 * Provides structured error handling with error codes and optional details
 * Integrates with centralized logging system
 */

import { logAuthError, logDatabaseError, logValidationError, LogCategory, logError } from './logger';

/**
 * Authentication-related errors
 */
export class AuthError extends Error {
  public readonly code: 'invalid_credentials' | 'email_exists' | 'weak_password' | 'network_error';
  public readonly details?: any;

  constructor(
    message: string,
    code: 'invalid_credentials' | 'email_exists' | 'weak_password' | 'network_error',
    details?: any
  ) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AuthError);
    }
    
    // Log authentication errors
    logAuthError(code, this, undefined, details);
  }
}

/**
 * Database operation errors
 */
export class DatabaseError extends Error {
  public readonly code: 'not_found' | 'permission_denied' | 'constraint_violation' | 'network_error';
  public readonly details?: any;

  constructor(
    message: string,
    code: 'not_found' | 'permission_denied' | 'constraint_violation' | 'network_error',
    details?: any
  ) {
    super(message);
    this.name = 'DatabaseError';
    this.code = code;
    this.details = details;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DatabaseError);
    }
    
    // Log database errors
    logDatabaseError(code, 'database', this, undefined, details);
  }
}

/**
 * Data validation errors
 */
export class ValidationError extends Error {
  public readonly field: string;
  public readonly constraint: string;

  constructor(message: string, field: string, constraint: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.constraint = constraint;

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }
    
    // Log validation errors
    logValidationError(field, this, { metadata: { constraint } });
  }
}

/**
 * Converts error objects to user-friendly messages
 * Maps error codes to plain language without exposing sensitive information
 * 
 * @param error - The error to convert to a user-friendly message
 * @returns A plain language error message suitable for display to users
 */
export function getErrorMessage(error: Error): string {
  if (error instanceof AuthError) {
    switch (error.code) {
      case 'invalid_credentials':
        return 'Invalid email or password. Please try again.';
      case 'email_exists':
        return 'An account with this email already exists.';
      case 'weak_password':
        return 'Password must be at least 8 characters long.';
      case 'network_error':
        return 'Authentication failed. Please check your connection and try again.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }

  if (error instanceof DatabaseError) {
    switch (error.code) {
      case 'not_found':
        return 'The requested item was not found.';
      case 'permission_denied':
        return "You don't have permission to perform this action.";
      case 'constraint_violation':
        return 'This action cannot be completed due to data constraints.';
      case 'network_error':
        return 'Unable to connect to the server. Please check your connection and try again.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }

  if (error instanceof ValidationError) {
    // Validation errors already have user-friendly messages
    return error.message;
  }

  // Generic fallback for unknown error types
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Retry logic for transient network failures
 * Implements exponential backoff strategy
 * Skips retry for validation and permission errors
 * 
 * @param operation - The async operation to retry
 * @param maxRetries - Maximum number of retry attempts (default: 3)
 * @param delayMs - Initial delay in milliseconds between retries (default: 1000)
 * @returns The result of the operation if successful
 * @throws The last error encountered if all retries fail
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on validation or permission errors
      if (error instanceof ValidationError) {
        throw error;
      }

      if (error instanceof DatabaseError) {
        if (error.code === 'permission_denied' || error.code === 'constraint_violation') {
          throw error;
        }
      }

      if (error instanceof AuthError) {
        // Don't retry authentication errors except network errors
        if (error.code !== 'network_error') {
          throw error;
        }
      }

      // Log retry attempt
      if (attempt < maxRetries - 1) {
        const backoffDelay = delayMs * Math.pow(2, attempt);
        logError(
          LogCategory.GENERAL,
          `Retry attempt ${attempt + 1}/${maxRetries} after ${backoffDelay}ms`,
          lastError,
          { operation: 'retry', metadata: { attempt: attempt + 1, maxRetries, backoffDelay } }
        );
        await new Promise((resolve) => setTimeout(resolve, backoffDelay));
      }
    }
  }

  // All retries exhausted, throw the last error
  logError(
    LogCategory.GENERAL,
    `All ${maxRetries} retry attempts exhausted`,
    lastError!,
    { operation: 'retry', metadata: { maxRetries } }
  );
  throw lastError!;
}

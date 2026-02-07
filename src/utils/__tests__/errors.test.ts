/**
 * Tests for error handling utilities
 * Validates custom error classes, error message generation, and retry logic
 */

import {
  AuthError,
  DatabaseError,
  ValidationError,
  getErrorMessage,
  withRetry,
} from '../errors';

describe('Error Classes', () => {
  describe('AuthError', () => {
    it('should create AuthError with correct properties', () => {
      const error = new AuthError('Test message', 'invalid_credentials');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(AuthError);
      expect(error.name).toBe('AuthError');
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('invalid_credentials');
      expect(error.details).toBeUndefined();
    });

    it('should create AuthError with details', () => {
      const details = { userId: '123', attempt: 3 };
      const error = new AuthError('Test message', 'network_error', details);
      
      expect(error.details).toEqual(details);
    });

    it('should support all error codes', () => {
      const codes: Array<'invalid_credentials' | 'email_exists' | 'weak_password' | 'network_error'> = [
        'invalid_credentials',
        'email_exists',
        'weak_password',
        'network_error',
      ];

      codes.forEach((code) => {
        const error = new AuthError('Test', code);
        expect(error.code).toBe(code);
      });
    });
  });

  describe('DatabaseError', () => {
    it('should create DatabaseError with correct properties', () => {
      const error = new DatabaseError('Test message', 'not_found');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(DatabaseError);
      expect(error.name).toBe('DatabaseError');
      expect(error.message).toBe('Test message');
      expect(error.code).toBe('not_found');
      expect(error.details).toBeUndefined();
    });

    it('should create DatabaseError with details', () => {
      const details = { table: 'users', id: '123' };
      const error = new DatabaseError('Test message', 'permission_denied', details);
      
      expect(error.details).toEqual(details);
    });

    it('should support all error codes', () => {
      const codes: Array<'not_found' | 'permission_denied' | 'constraint_violation' | 'network_error'> = [
        'not_found',
        'permission_denied',
        'constraint_violation',
        'network_error',
      ];

      codes.forEach((code) => {
        const error = new DatabaseError('Test', code);
        expect(error.code).toBe(code);
      });
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError with correct properties', () => {
      const error = new ValidationError('Invalid email format', 'email', 'format');
      
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe('ValidationError');
      expect(error.message).toBe('Invalid email format');
      expect(error.field).toBe('email');
      expect(error.constraint).toBe('format');
    });

    it('should support different field and constraint combinations', () => {
      const testCases = [
        { field: 'darpanId', constraint: 'format' },
        { field: 'eventId', constraint: 'capacity' },
        { field: 'userId', constraint: 'unique' },
      ];

      testCases.forEach(({ field, constraint }) => {
        const error = new ValidationError('Test', field, constraint);
        expect(error.field).toBe(field);
        expect(error.constraint).toBe(constraint);
      });
    });
  });
});

describe('getErrorMessage', () => {
  describe('AuthError messages', () => {
    it('should return user-friendly message for invalid_credentials', () => {
      const error = new AuthError('Auth failed', 'invalid_credentials');
      const message = getErrorMessage(error);
      
      expect(message).toBe('Invalid email or password. Please try again.');
      expect(message).not.toContain('Auth failed'); // Should not expose internal message
    });

    it('should return user-friendly message for email_exists', () => {
      const error = new AuthError('Duplicate email', 'email_exists');
      const message = getErrorMessage(error);
      
      expect(message).toBe('An account with this email already exists.');
    });

    it('should return user-friendly message for weak_password', () => {
      const error = new AuthError('Password too short', 'weak_password');
      const message = getErrorMessage(error);
      
      expect(message).toBe('Password must be at least 8 characters long.');
    });

    it('should return user-friendly message for network_error', () => {
      const error = new AuthError('Connection failed', 'network_error');
      const message = getErrorMessage(error);
      
      expect(message).toBe('Authentication failed. Please check your connection and try again.');
    });
  });

  describe('DatabaseError messages', () => {
    it('should return user-friendly message for not_found', () => {
      const error = new DatabaseError('Record not found', 'not_found');
      const message = getErrorMessage(error);
      
      expect(message).toBe('The requested item was not found.');
    });

    it('should return user-friendly message for permission_denied', () => {
      const error = new DatabaseError('Access denied', 'permission_denied');
      const message = getErrorMessage(error);
      
      expect(message).toBe("You don't have permission to perform this action.");
    });

    it('should return user-friendly message for constraint_violation', () => {
      const error = new DatabaseError('Constraint failed', 'constraint_violation');
      const message = getErrorMessage(error);
      
      expect(message).toBe('This action cannot be completed due to data constraints.');
    });

    it('should return user-friendly message for network_error', () => {
      const error = new DatabaseError('Connection timeout', 'network_error');
      const message = getErrorMessage(error);
      
      expect(message).toBe('Unable to connect to the server. Please check your connection and try again.');
    });
  });

  describe('ValidationError messages', () => {
    it('should return the original validation error message', () => {
      const error = new ValidationError('Event is full', 'eventId', 'capacity');
      const message = getErrorMessage(error);
      
      expect(message).toBe('Event is full');
    });

    it('should preserve custom validation messages', () => {
      const customMessage = 'Darpan ID must be exactly 5 digits';
      const error = new ValidationError(customMessage, 'darpanId', 'format');
      const message = getErrorMessage(error);
      
      expect(message).toBe(customMessage);
    });
  });

  describe('Generic error messages', () => {
    it('should return generic message for unknown error types', () => {
      const error = new Error('Unknown error');
      const message = getErrorMessage(error);
      
      expect(message).toBe('An unexpected error occurred. Please try again.');
    });

    it('should not expose sensitive information', () => {
      const error = new AuthError('Database connection string: postgres://...', 'network_error');
      const message = getErrorMessage(error);
      
      expect(message).not.toContain('postgres://');
      expect(message).not.toContain('Database connection string');
    });
  });
});

describe('withRetry', () => {
  it('should return result on first successful attempt', async () => {
    const operation = jest.fn().mockResolvedValue('success');
    
    const result = await withRetry(operation);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry on network errors', async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(new DatabaseError('Network error', 'network_error'))
      .mockResolvedValue('success');
    
    const result = await withRetry(operation, 3, 10);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('should use exponential backoff', async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(new DatabaseError('Network error', 'network_error'))
      .mockRejectedValueOnce(new DatabaseError('Network error', 'network_error'))
      .mockResolvedValue('success');
    
    const result = await withRetry(operation, 3, 10);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should not retry ValidationError', async () => {
    const error = new ValidationError('Invalid input', 'field', 'constraint');
    const operation = jest.fn().mockRejectedValue(error);
    
    await expect(withRetry(operation)).rejects.toThrow(ValidationError);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should not retry DatabaseError with permission_denied', async () => {
    const error = new DatabaseError('Access denied', 'permission_denied');
    const operation = jest.fn().mockRejectedValue(error);
    
    await expect(withRetry(operation)).rejects.toThrow(DatabaseError);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should not retry DatabaseError with constraint_violation', async () => {
    const error = new DatabaseError('Constraint failed', 'constraint_violation');
    const operation = jest.fn().mockRejectedValue(error);
    
    await expect(withRetry(operation)).rejects.toThrow(DatabaseError);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should not retry AuthError except network_error', async () => {
    const error = new AuthError('Invalid credentials', 'invalid_credentials');
    const operation = jest.fn().mockRejectedValue(error);
    
    await expect(withRetry(operation)).rejects.toThrow(AuthError);
    expect(operation).toHaveBeenCalledTimes(1);
  });

  it('should retry AuthError with network_error', async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(new AuthError('Network error', 'network_error'))
      .mockResolvedValue('success');
    
    const result = await withRetry(operation, 3, 10);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('should throw last error after max retries', async () => {
    const error = new DatabaseError('Network error', 'network_error');
    const operation = jest.fn().mockRejectedValue(error);
    
    await expect(withRetry(operation, 3, 10)).rejects.toThrow(DatabaseError);
    expect(operation).toHaveBeenCalledTimes(3);
  });

  it('should respect custom maxRetries parameter', async () => {
    const error = new DatabaseError('Network error', 'network_error');
    const operation = jest.fn().mockRejectedValue(error);
    
    await expect(withRetry(operation, 2, 10)).rejects.toThrow(DatabaseError);
    expect(operation).toHaveBeenCalledTimes(2);
  });

  it('should respect custom delayMs parameter', async () => {
    const operation = jest
      .fn()
      .mockRejectedValueOnce(new DatabaseError('Network error', 'network_error'))
      .mockResolvedValue('success');
    
    const result = await withRetry(operation, 3, 50);
    
    expect(result).toBe('success');
    expect(operation).toHaveBeenCalledTimes(2);
  });
});

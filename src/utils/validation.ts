/**
 * Input validation utilities for CommuniTree platform
 * Handles form validation, data sanitization, and input constraints
 */

import { ValidationResult } from '../types/utils';

/**
 * Validate email format
 * @param email Email address to validate
 * @returns True if email format is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Validate Darpan ID format (5-digit numeric)
 * @param darpanId Darpan ID to validate
 * @returns True if Darpan ID format is valid
 */
export const isValidDarpanId = (darpanId: string): boolean => {
  const darpanRegex = /^\d{5}$/;
  return darpanRegex.test(darpanId.trim());
};

/**
 * Validate user name
 * @param name User name to validate
 * @returns True if name is valid
 */
export const isValidName = (name: string): boolean => {
  const trimmedName = name.trim();
  return trimmedName.length >= 2 && trimmedName.length <= 50;
};

/**
 * Validate password strength
 * @param password Password to validate
 * @returns True if password meets requirements
 */
export const isValidPassword = (password: string): boolean => {
  // At least 8 characters, contains letter and number
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Validate phone number format
 * @param phone Phone number to validate
 * @returns True if phone format is valid
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone.trim());
};

/**
 * Validate event title
 * @param title Event title to validate
 * @returns True if title is valid
 */
export const isValidEventTitle = (title: string): boolean => {
  const trimmedTitle = title.trim();
  return trimmedTitle.length >= 3 && trimmedTitle.length <= 100;
};

/**
 * Validate event description
 * @param description Event description to validate
 * @returns True if description is valid
 */
export const isValidEventDescription = (description: string): boolean => {
  const trimmedDescription = description.trim();
  return trimmedDescription.length >= 10 && trimmedDescription.length <= 500;
};

/**
 * Validate NGO name
 * @param name NGO name to validate
 * @returns True if name is valid
 */
export const isValidNGOName = (name: string): boolean => {
  const trimmedName = name.trim();
  return trimmedName.length >= 3 && trimmedName.length <= 100;
};

/**
 * Validate chat message content
 * @param message Message content to validate
 * @returns True if message is valid
 */
export const isValidMessage = (message: string): boolean => {
  const trimmedMessage = message.trim();
  return trimmedMessage.length >= 1 && trimmedMessage.length <= 500;
};

/**
 * Sanitize user input by removing potentially harmful characters
 * @param input Input string to sanitize
 * @returns Sanitized string
 */
export const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

/**
 * Validate form data with multiple fields
 * @param data Form data object
 * @param rules Validation rules object
 * @returns Validation result with errors
 */
export const validateForm = (
  data: Record<string, any>,
  rules: Record<string, (value: any) => boolean>
): ValidationResult => {
  const errors: Record<string, string> = {};
  let isValid = true;

  Object.entries(rules).forEach(([field, validator]) => {
    const value = data[field];
    if (!validator(value)) {
      errors[field] = getValidationError(field, value);
      isValid = false;
    }
  });

  return { isValid, errors };
};

/**
 * Get appropriate error message for validation failure
 * @param field Field name that failed validation
 * @param value The invalid value
 * @returns Error message string
 */
export const getValidationError = (field: string, value: any): string => {
  switch (field) {
    case 'email':
      return 'Please enter a valid email address';
    case 'name':
      return 'Name must be between 2 and 50 characters';
    case 'password':
      return 'Password must be at least 8 characters with letters and numbers';
    case 'darpanId':
      return 'Darpan ID must be exactly 5 digits';
    case 'phone':
      return 'Please enter a valid phone number';
    case 'eventTitle':
      return 'Event title must be between 3 and 100 characters';
    case 'eventDescription':
      return 'Event description must be between 10 and 500 characters';
    case 'ngoName':
      return 'NGO name must be between 3 and 100 characters';
    case 'message':
      return 'Message cannot be empty and must be under 500 characters';
    default:
      return 'Invalid input';
  }
};

/**
 * Check if coordinates are valid latitude/longitude
 * @param lat Latitude value
 * @param lng Longitude value
 * @returns True if coordinates are valid
 */
export const isValidCoordinates = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
};

/**
 * Validate trust points value
 * @param points Trust points value
 * @returns True if points are in valid range
 */
export const isValidTrustPoints = (points: number): boolean => {
  return points >= 0 && points <= 100 && Number.isInteger(points);
};
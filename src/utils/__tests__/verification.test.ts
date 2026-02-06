/**
 * Tests for verification utilities
 * Validates NGO verification logic, badge updates, and validation functions
 */

import {
  isEligibleForVerification,
  getVerificationStatusText,
  getVerificationBadgeColor,
  validateDarpanIdDetailed,
  getVerificationSuccessMessage,
  getVerificationFailureMessage,
  shouldShowVerificationTrustWarning,
  getVerificationTrustPointsMessage,
  formatVerificationTimestamp,
} from '../verification';
import { NGO } from '../../types';

// Mock NGO data for testing
const createMockNGO = (overrides: Partial<NGO> = {}): NGO => ({
  id: 'ngo_test',
  name: 'Test NGO',
  projectTitle: 'Test Project',
  description: 'Test description',
  category: 'Education',
  darpanId: undefined,
  isVerified: false,
  contactInfo: {
    email: 'test@ngo.org',
    phone: '+1234567890',
    address: '123 Test St',
  },
  volunteersNeeded: 10,
  currentVolunteers: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('Verification Utilities', () => {
  describe('isEligibleForVerification', () => {
    it('should return true for unverified NGO with complete info', () => {
      const ngo = createMockNGO();
      expect(isEligibleForVerification(ngo)).toBe(true);
    });

    it('should return false for already verified NGO', () => {
      const ngo = createMockNGO({ isVerified: true, darpanId: '12345' });
      expect(isEligibleForVerification(ngo)).toBe(false);
    });

    it('should return false for NGO without name', () => {
      const ngo = createMockNGO({ name: '' });
      expect(isEligibleForVerification(ngo)).toBe(false);
    });

    it('should return false for NGO without project title', () => {
      const ngo = createMockNGO({ projectTitle: '' });
      expect(isEligibleForVerification(ngo)).toBe(false);
    });

    it('should return false for NGO without email', () => {
      const ngo = createMockNGO({
        contactInfo: { email: '', phone: '+1234567890', address: '123 Test St' }
      });
      expect(isEligibleForVerification(ngo)).toBe(false);
    });
  });

  describe('getVerificationStatusText', () => {
    it('should return verified status with Darpan ID', () => {
      const ngo = createMockNGO({ isVerified: true, darpanId: '12345' });
      expect(getVerificationStatusText(ngo)).toBe('Verified with Darpan ID 12345');
    });

    it('should return verified status without Darpan ID', () => {
      const ngo = createMockNGO({ isVerified: true });
      expect(getVerificationStatusText(ngo)).toBe('Verified Organization');
    });

    it('should return unverified status', () => {
      const ngo = createMockNGO();
      expect(getVerificationStatusText(ngo)).toBe('Unverified Organization');
    });
  });

  describe('getVerificationBadgeColor', () => {
    it('should return green color for verified NGO', () => {
      const ngo = createMockNGO({ isVerified: true });
      expect(getVerificationBadgeColor(ngo)).toBe('bg-green-100 text-green-800');
    });

    it('should return yellow color for unverified NGO', () => {
      const ngo = createMockNGO();
      expect(getVerificationBadgeColor(ngo)).toBe('bg-yellow-100 text-yellow-800');
    });
  });

  describe('validateDarpanIdDetailed', () => {
    it('should validate correct 5-digit Darpan ID', () => {
      const result = validateDarpanIdDetailed('12345');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Valid Darpan ID format');
    });

    it('should reject empty Darpan ID', () => {
      const result = validateDarpanIdDetailed('');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Darpan ID is required');
    });

    it('should reject Darpan ID with letters', () => {
      const result = validateDarpanIdDetailed('1234a');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Darpan ID must contain only numbers');
    });

    it('should reject Darpan ID with wrong length', () => {
      const result = validateDarpanIdDetailed('123');
      expect(result.isValid).toBe(false);
      expect(result.message).toBe('Darpan ID must be exactly 5 digits (current: 3)');
    });

    it('should handle whitespace correctly', () => {
      const result = validateDarpanIdDetailed('  12345  ');
      expect(result.isValid).toBe(true);
      expect(result.message).toBe('Valid Darpan ID format');
    });
  });

  describe('getVerificationSuccessMessage', () => {
    it('should generate success message with NGO name and Darpan ID', () => {
      const message = getVerificationSuccessMessage('Test NGO', '12345');
      expect(message).toContain('Test NGO');
      expect(message).toContain('12345');
      expect(message).toContain('successfully verified');
      expect(message).toContain('legitimate organization');
    });
  });

  describe('getVerificationFailureMessage', () => {
    it('should generate failure message with NGO name and Darpan ID', () => {
      const message = getVerificationFailureMessage('Test NGO', '12345');
      expect(message).toContain('Test NGO');
      expect(message).toContain('12345');
      expect(message).toContain('Unable to verify');
    });
  });

  describe('shouldShowVerificationTrustWarning', () => {
    it('should show warning for low trust points', () => {
      expect(shouldShowVerificationTrustWarning(25)).toBe(true);
    });

    it('should not show warning for high trust points', () => {
      expect(shouldShowVerificationTrustWarning(50)).toBe(false);
    });

    it('should show warning for exactly 30 points', () => {
      expect(shouldShowVerificationTrustWarning(30)).toBe(false);
    });

    it('should show warning for exactly 29 points', () => {
      expect(shouldShowVerificationTrustWarning(29)).toBe(true);
    });
  });

  describe('getVerificationTrustPointsMessage', () => {
    it('should return success message for successful verification', () => {
      const message = getVerificationTrustPointsMessage(true);
      expect(message).toContain('earned 10 trust points');
      expect(message).toContain('verify an NGO');
    });

    it('should return no deduction message for failed verification', () => {
      const message = getVerificationTrustPointsMessage(false);
      expect(message).toContain('No trust points were deducted');
      expect(message).toContain('failed verification');
    });
  });

  describe('formatVerificationTimestamp', () => {
    it('should format recent timestamp as "Just verified"', () => {
      const now = new Date();
      const result = formatVerificationTimestamp(now);
      expect(result).toBe('Just verified');
    });

    it('should format timestamp from 2 hours ago', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const result = formatVerificationTimestamp(twoHoursAgo);
      expect(result).toBe('Verified 2 hours ago');
    });

    it('should format timestamp from 1 hour ago', () => {
      const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000);
      const result = formatVerificationTimestamp(oneHourAgo);
      expect(result).toBe('Verified 1 hour ago');
    });

    it('should format timestamp from 2 days ago', () => {
      const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const result = formatVerificationTimestamp(twoDaysAgo);
      expect(result).toBe('Verified 2 days ago');
    });

    it('should format timestamp from 1 day ago', () => {
      const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      const result = formatVerificationTimestamp(oneDayAgo);
      expect(result).toBe('Verified 1 day ago');
    });

    it('should format old timestamp with date', () => {
      const oldDate = new Date('2023-01-01');
      const result = formatVerificationTimestamp(oldDate);
      expect(result).toContain('Verified on');
      expect(result).toContain('2023');
    });
  });
});
/**
 * Trust points calculation utilities for CommuniTree platform
 * Handles trust point awards, deductions, and validation logic
 */

import { TrustPointAction } from '../types';

// Trust point values for different actions
export const TRUST_POINT_VALUES: Record<TrustPointAction, number> = {
  ORGANIZE_EVENT: 20,
  ATTEND_EVENT: 5,
  NO_SHOW: -10,
  VERIFY_IDENTITY: 10,
  REPORT_VIOLATION: -5,
  VOLUNTEER_ACTIVITY: 15,
  COMMUNITY_CONTRIBUTION: 10,
};

// Trust point constraints
export const TRUST_POINT_LIMITS = {
  MIN: 0,
  MAX: 100,
  RSVP_THRESHOLD: 20,
  WARNING_THRESHOLD: 30,
  INITIAL_POINTS: 50,
} as const;

/**
 * Calculate new trust points after an action
 * @param currentPoints Current trust points (0-100)
 * @param action The action that affects trust points
 * @returns New trust points value, clamped to valid range
 */
export const calculateTrustPoints = (
  currentPoints: number,
  action: TrustPointAction
): number => {
  const delta = TRUST_POINT_VALUES[action];
  const newPoints = currentPoints + delta;
  
  // Clamp to valid range
  return Math.max(TRUST_POINT_LIMITS.MIN, Math.min(TRUST_POINT_LIMITS.MAX, newPoints));
};

/**
 * Get trust point delta for an action
 * @param action The action to get delta for
 * @returns The point change (positive or negative)
 */
export const getTrustPointDelta = (action: TrustPointAction): number => {
  return TRUST_POINT_VALUES[action];
};

/**
 * Check if user has sufficient trust points for an action
 * @param currentPoints Current trust points
 * @param requiredPoints Minimum points required (default: RSVP_THRESHOLD)
 * @returns True if user has sufficient points
 */
export const hasSufficientTrustPoints = (
  currentPoints: number,
  requiredPoints: number = TRUST_POINT_LIMITS.RSVP_THRESHOLD
): boolean => {
  return currentPoints >= requiredPoints;
};

/**
 * Get trust level description based on points
 * @param points Current trust points
 * @returns Trust level description
 */
export const getTrustLevel = (points: number): string => {
  if (points >= 90) return 'Elite';
  if (points >= 70) return 'High';
  if (points >= 50) return 'Silver';
  if (points >= 20) return 'Bronze';
  return 'New';
};

/**
 * Get trust level color for UI display
 * @param points Current trust points
 * @returns Tailwind color class
 */
export const getTrustLevelColor = (points: number): string => {
  if (points >= 90) return 'text-purple-600';
  if (points >= 70) return 'text-green-600';
  if (points >= 50) return 'text-blue-600';
  if (points >= 20) return 'text-orange-600';
  return 'text-gray-500';
};

/**
 * Check if user should see warning before RSVP
 * @param currentPoints Current trust points
 * @returns True if warning should be shown
 */
export const shouldShowRSVPWarning = (currentPoints: number): boolean => {
  return currentPoints < TRUST_POINT_LIMITS.RSVP_THRESHOLD;
};

/**
 * Format trust points for display
 * @param points Trust points value
 * @returns Formatted string with just the points
 */
export const formatTrustPoints = (points: number): string => {
  return points.toString();
};
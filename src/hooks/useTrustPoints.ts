/**
 * Custom hook for trust points management
 * Provides trust point calculations, validations, and UI helpers
 */

import { useCallback, useMemo } from 'react';
import { useUser } from './useUser';
import { 
  calculateTrustPoints, 
  getTrustLevel, 
  getTrustLevelColor, 
  shouldShowRSVPWarning,
  hasSufficientTrustPoints,
  formatTrustPoints,
  getTrustPointDelta,
  TRUST_POINT_LIMITS
} from '../utils/trustPoints';
import { TrustPointAction } from '../types';

export const useTrustPoints = () => {
  const { user, updateTrustPoints } = useUser();
  const currentPoints = user?.trustPoints || 0;

  const awardPoints = useCallback((action: TrustPointAction) => {
    updateTrustPoints(action);
  }, [updateTrustPoints]);

  const canRSVP = useCallback(() => {
    return hasSufficientTrustPoints(currentPoints);
  }, [currentPoints]);

  const getRSVPWarning = useCallback(() => {
    if (shouldShowRSVPWarning(currentPoints)) {
      return `Your trust points are low (${currentPoints}/${TRUST_POINT_LIMITS.MAX}). Missing events will further reduce your points.`;
    }
    return null;
  }, [currentPoints]);

  const getPointsAfterAction = useCallback((action: TrustPointAction) => {
    return calculateTrustPoints(currentPoints, action);
  }, [currentPoints]);

  // Get detailed trust point status
  const trustStatus = useMemo(() => {
    const level = getTrustLevel(currentPoints);
    const color = getTrustLevelColor(currentPoints);
    const isLow = shouldShowRSVPWarning(currentPoints);
    const isCritical = currentPoints <= 10;
    
    return {
      level,
      color,
      isLow,
      isCritical,
      percentage: (currentPoints / TRUST_POINT_LIMITS.MAX) * 100,
      pointsToSafe: Math.max(0, TRUST_POINT_LIMITS.WARNING_THRESHOLD - currentPoints),
      pointsToMax: TRUST_POINT_LIMITS.MAX - currentPoints,
    };
  }, [currentPoints]);

  // Get available actions and their point values
  const availableActions = useMemo(() => {
    return [
      {
        action: 'ATTEND_EVENT' as TrustPointAction,
        name: 'Attend Event',
        description: 'Show up to events you RSVP to',
        points: getTrustPointDelta('ATTEND_EVENT'),
        category: 'participation',
      },
      {
        action: 'ORGANIZE_EVENT' as TrustPointAction,
        name: 'Organize Event',
        description: 'Host community events',
        points: getTrustPointDelta('ORGANIZE_EVENT'),
        category: 'leadership',
      },
      {
        action: 'VOLUNTEER_ACTIVITY' as TrustPointAction,
        name: 'Volunteer Work',
        description: 'Participate in NGO activities',
        points: getTrustPointDelta('VOLUNTEER_ACTIVITY'),
        category: 'service',
      },
      {
        action: 'VERIFY_IDENTITY' as TrustPointAction,
        name: 'Verify Identity',
        description: 'Complete identity verification',
        points: getTrustPointDelta('VERIFY_IDENTITY'),
        category: 'verification',
      },
      {
        action: 'COMMUNITY_CONTRIBUTION' as TrustPointAction,
        name: 'Community Contribution',
        description: 'Make positive community contributions',
        points: getTrustPointDelta('COMMUNITY_CONTRIBUTION'),
        category: 'contribution',
      },
    ];
  }, []);

  // Get negative actions (point deductions)
  const negativeActions = useMemo(() => {
    return [
      {
        action: 'NO_SHOW' as TrustPointAction,
        name: 'No Show',
        description: 'Not attending events you RSVP to',
        points: getTrustPointDelta('NO_SHOW'),
        category: 'violation',
      },
      {
        action: 'REPORT_VIOLATION' as TrustPointAction,
        name: 'Community Violation',
        description: 'Violating community guidelines',
        points: getTrustPointDelta('REPORT_VIOLATION'),
        category: 'violation',
      },
    ];
  }, []);

  // Check if user can perform certain actions based on trust points
  const canPerformAction = useCallback((requiredPoints: number = TRUST_POINT_LIMITS.RSVP_THRESHOLD) => {
    return currentPoints >= requiredPoints;
  }, [currentPoints]);

  // Get recommendations for improving trust points
  const getRecommendations = useCallback(() => {
    if (currentPoints >= TRUST_POINT_LIMITS.RSVP_THRESHOLD) {
      return [];
    }

    const recommendations = [];
    const pointsNeeded = TRUST_POINT_LIMITS.RSVP_THRESHOLD - currentPoints;

    if (pointsNeeded <= 5) {
      recommendations.push('Attend one event to reach safe level');
    } else if (pointsNeeded <= 15) {
      recommendations.push('Volunteer with an NGO or attend 2-3 events');
    } else {
      recommendations.push('Organize an event or complete multiple volunteer activities');
    }

    return recommendations;
  }, [currentPoints]);

  return {
    currentPoints,
    trustLevel: getTrustLevel(currentPoints),
    trustLevelColor: getTrustLevelColor(currentPoints),
    formattedPoints: formatTrustPoints(currentPoints),
    trustStatus,
    awardPoints,
    canRSVP,
    shouldShowWarning: shouldShowRSVPWarning(currentPoints),
    getRSVPWarning,
    getPointsAfterAction,
    canPerformAction,
    getRecommendations,
    availableActions,
    negativeActions,
    limits: {
      MIN: TRUST_POINT_LIMITS.MIN,
      MAX: TRUST_POINT_LIMITS.MAX,
      RSVP_THRESHOLD: TRUST_POINT_LIMITS.RSVP_THRESHOLD,
      WARNING_THRESHOLD: TRUST_POINT_LIMITS.WARNING_THRESHOLD,
    },
  };
};
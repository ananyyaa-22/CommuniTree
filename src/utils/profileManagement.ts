/**
 * Profile data management utilities for CommuniTree platform
 * Handles profile updates, engagement tracking, and community impact calculations
 */

import { User, UserEvent, TrustPointAction } from '../types';

/**
 * Validate profile update data
 * @param profileData Profile data to validate
 * @returns Validation result with errors if any
 */
export const validateProfileData = (profileData: { name: string; email: string }) => {
  const errors: { name?: string; email?: string } = {};

  // Name validation
  if (!profileData.name.trim()) {
    errors.name = 'Name is required';
  } else if (profileData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  } else if (profileData.name.trim().length > 50) {
    errors.name = 'Name must be less than 50 characters';
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!profileData.email.trim()) {
    errors.email = 'Email is required';
  } else if (!emailRegex.test(profileData.email)) {
    errors.email = 'Please enter a valid email address';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Create a new engagement event
 * @param eventData Event data without ID
 * @returns Complete UserEvent with generated ID
 */
export const createEngagementEvent = (eventData: Omit<UserEvent, 'id'>): UserEvent => {
  return {
    ...eventData,
    id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
};

/**
 * Calculate comprehensive community impact metrics
 * @param eventHistory User's event history
 * @returns Community impact metrics
 */
export const calculateCommunityImpact = (eventHistory: UserEvent[]) => {
  const eventsOrganized = eventHistory.filter(e => e.type === 'organized').length;
  const eventsAttended = eventHistory.filter(e => e.type === 'attended').length;
  const rsvpEvents = eventHistory.filter(e => e.type === 'rsvp').length;
  const noShows = eventHistory.filter(e => e.type === 'no_show').length;
  
  const totalTrustPointsEarned = eventHistory.reduce((sum, e) => sum + Math.max(0, e.trustPointsAwarded), 0);
  const totalTrustPointsLost = Math.abs(eventHistory.reduce((sum, e) => sum + Math.min(0, e.trustPointsAwarded), 0));
  
  const attendanceRate = rsvpEvents > 0 ? (eventsAttended / rsvpEvents) * 100 : 100;
  
  let reliabilityScore: 'Excellent' | 'Good' | 'Needs Improvement';
  if (noShows === 0) {
    reliabilityScore = 'Excellent';
  } else if (noShows <= 2) {
    reliabilityScore = 'Good';
  } else {
    reliabilityScore = 'Needs Improvement';
  }

  const communityContributions = eventHistory.filter(e => 
    e.trustPointsAwarded > 0 && ['organized', 'attended'].includes(e.type)
  ).length;

  const volunteerActivities = eventHistory.filter(e => e.type === 'attended').length;

  return {
    totalEvents: eventHistory.length,
    eventsOrganized,
    eventsAttended,
    totalTrustPointsEarned,
    totalTrustPointsLost,
    attendanceRate,
    noShows,
    reliabilityScore,
    communityContributions,
    volunteerActivities,
  };
};

/**
 * Filter engagement history by time range
 * @param eventHistory User's event history
 * @param timeRange Time range filter
 * @returns Filtered event history
 */
export const filterEventsByTimeRange = (
  eventHistory: UserEvent[], 
  timeRange: 'week' | 'month' | 'year' | 'all'
): UserEvent[] => {
  if (timeRange === 'all') {
    return eventHistory;
  }

  const now = new Date();
  const cutoffDate = new Date();
  
  switch (timeRange) {
    case 'week':
      cutoffDate.setDate(now.getDate() - 7);
      break;
    case 'month':
      cutoffDate.setMonth(now.getMonth() - 1);
      break;
    case 'year':
      cutoffDate.setFullYear(now.getFullYear() - 1);
      break;
  }
  
  return eventHistory.filter(event => 
    new Date(event.timestamp) >= cutoffDate
  );
};

/**
 * Filter engagement history by activity type
 * @param eventHistory User's event history
 * @param activityType Activity type filter
 * @returns Filtered event history
 */
export const filterEventsByType = (
  eventHistory: UserEvent[], 
  activityType: 'all' | UserEvent['type']
): UserEvent[] => {
  if (activityType === 'all') {
    return eventHistory;
  }
  
  return eventHistory.filter(event => event.type === activityType);
};

/**
 * Get profile completion percentage
 * @param user User object
 * @returns Completion percentage (0-100)
 */
export const getProfileCompletionPercentage = (user: User): number => {
  let completedFields = 0;
  const totalFields = 5; // name, email, verification, trust points, event history

  if (user.name.trim()) completedFields++;
  if (user.email.trim()) completedFields++;
  if (user.verificationStatus === 'verified') completedFields++;
  if (user.trustPoints > 0) completedFields++;
  if (user.eventHistory.length > 0) completedFields++;

  return Math.round((completedFields / totalFields) * 100);
};

/**
 * Generate profile summary for display
 * @param user User object
 * @returns Profile summary object
 */
export const generateProfileSummary = (user: User) => {
  const impactMetrics = calculateCommunityImpact(user.eventHistory);
  const completionPercentage = getProfileCompletionPercentage(user);
  
  return {
    completionPercentage,
    memberSince: user.createdAt,
    lastActivity: user.updatedAt,
    trustLevel: user.trustPoints >= 90 ? 'Elite' :
                user.trustPoints >= 70 ? 'High' :
                user.trustPoints >= 50 ? 'Silver' :
                user.trustPoints >= 20 ? 'Bronze' : 'New',
    isActive: impactMetrics.totalEvents > 0,
    ...impactMetrics,
  };
};
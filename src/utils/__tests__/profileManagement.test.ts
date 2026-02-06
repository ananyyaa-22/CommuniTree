/**
 * Unit tests for profile management utilities
 * Tests profile validation, engagement tracking, and community impact calculations
 */

import {
  validateProfileData,
  createEngagementEvent,
  calculateCommunityImpact,
  filterEventsByTimeRange,
  filterEventsByType,
  getProfileCompletionPercentage,
  generateProfileSummary,
} from '../profileManagement';
import { User, UserEvent } from '../../types';

describe('Profile Management Utilities', () => {
  const mockUser: User = {
    id: 'user_test',
    name: 'Test User',
    email: 'test@example.com',
    trustPoints: 75,
    verificationStatus: 'verified',
    chatHistory: [],
    eventHistory: [
      {
        id: 'event_1',
        eventId: 'evt_1',
        type: 'organized',
        timestamp: new Date('2024-01-15'),
        trustPointsAwarded: 20,
      },
      {
        id: 'event_2',
        eventId: 'evt_2',
        type: 'attended',
        timestamp: new Date('2024-01-20'),
        trustPointsAwarded: 5,
      },
      {
        id: 'event_3',
        eventId: 'evt_3',
        type: 'no_show',
        timestamp: new Date('2024-01-25'),
        trustPointsAwarded: -10,
      },
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-25'),
  };

  describe('validateProfileData', () => {
    it('should validate correct profile data', () => {
      const result = validateProfileData({
        name: 'John Doe',
        email: 'john@example.com',
      });

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual({});
    });

    it('should reject empty name', () => {
      const result = validateProfileData({
        name: '',
        email: 'john@example.com',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Name is required');
    });

    it('should reject invalid email', () => {
      const result = validateProfileData({
        name: 'John Doe',
        email: 'invalid-email',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.email).toBe('Please enter a valid email address');
    });

    it('should reject name that is too short', () => {
      const result = validateProfileData({
        name: 'A',
        email: 'john@example.com',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Name must be at least 2 characters');
    });

    it('should reject name that is too long', () => {
      const result = validateProfileData({
        name: 'A'.repeat(51),
        email: 'john@example.com',
      });

      expect(result.isValid).toBe(false);
      expect(result.errors.name).toBe('Name must be less than 50 characters');
    });
  });

  describe('createEngagementEvent', () => {
    it('should create engagement event with generated ID', () => {
      const eventData = {
        eventId: 'evt_test',
        type: 'attended' as const,
        timestamp: new Date(),
        trustPointsAwarded: 5,
      };

      const result = createEngagementEvent(eventData);

      expect(result).toMatchObject(eventData);
      expect(result.id).toBeDefined();
      expect(result.id).toMatch(/^event_\d+_[a-z0-9]+$/);
    });
  });

  describe('calculateCommunityImpact', () => {
    it('should calculate correct community impact metrics', () => {
      const result = calculateCommunityImpact(mockUser.eventHistory);

      expect(result).toEqual({
        totalEvents: 3,
        eventsOrganized: 1,
        eventsAttended: 1,
        totalTrustPointsEarned: 25, // 20 + 5
        totalTrustPointsLost: 10, // abs(-10)
        attendanceRate: 100, // No RSVP events, so default to 100%
        noShows: 1,
        reliabilityScore: 'Good', // 1 no-show <= 2
        communityContributions: 2, // organized + attended with positive points
        volunteerActivities: 1, // attended events
      });
    });

    it('should handle empty event history', () => {
      const result = calculateCommunityImpact([]);

      expect(result).toEqual({
        totalEvents: 0,
        eventsOrganized: 0,
        eventsAttended: 0,
        totalTrustPointsEarned: 0,
        totalTrustPointsLost: 0,
        attendanceRate: 100,
        noShows: 0,
        reliabilityScore: 'Excellent',
        communityContributions: 0,
        volunteerActivities: 0,
      });
    });

    it('should calculate attendance rate correctly with RSVP events', () => {
      const eventsWithRSVP: UserEvent[] = [
        ...mockUser.eventHistory,
        {
          id: 'event_4',
          eventId: 'evt_4',
          type: 'rsvp',
          timestamp: new Date('2024-01-30'),
          trustPointsAwarded: 0,
        },
      ];

      const result = calculateCommunityImpact(eventsWithRSVP);

      expect(result.attendanceRate).toBe(100); // 1 attended / 1 rsvp = 100%
    });
  });

  describe('filterEventsByTimeRange', () => {
    it('should return all events for "all" time range', () => {
      const result = filterEventsByTimeRange(mockUser.eventHistory, 'all');
      expect(result).toHaveLength(3);
    });

    it('should filter events by week', () => {
      const recentEvents: UserEvent[] = [
        {
          id: 'event_recent',
          eventId: 'evt_recent',
          type: 'attended',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
          trustPointsAwarded: 5,
        },
      ];

      const result = filterEventsByTimeRange(recentEvents, 'week');
      expect(result).toHaveLength(1);
    });
  });

  describe('filterEventsByType', () => {
    it('should return all events for "all" type', () => {
      const result = filterEventsByType(mockUser.eventHistory, 'all');
      expect(result).toHaveLength(3);
    });

    it('should filter events by specific type', () => {
      const result = filterEventsByType(mockUser.eventHistory, 'organized');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('organized');
    });
  });

  describe('getProfileCompletionPercentage', () => {
    it('should calculate correct completion percentage', () => {
      const result = getProfileCompletionPercentage(mockUser);
      expect(result).toBe(100); // All fields completed
    });

    it('should handle incomplete profile', () => {
      const incompleteUser: User = {
        ...mockUser,
        name: '',
        verificationStatus: 'pending',
        trustPoints: 0,
        eventHistory: [],
      };

      const result = getProfileCompletionPercentage(incompleteUser);
      expect(result).toBe(20); // Only email completed (1/5 = 20%)
    });
  });

  describe('generateProfileSummary', () => {
    it('should generate complete profile summary', () => {
      const result = generateProfileSummary(mockUser);

      expect(result).toMatchObject({
        completionPercentage: 100,
        memberSince: mockUser.createdAt,
        lastActivity: mockUser.updatedAt,
        trustLevel: 'High', // 75 points = High
        isActive: true,
        totalEvents: 3,
        eventsOrganized: 1,
        eventsAttended: 1,
      });
    });

    it('should handle different trust levels', () => {
      const eliteUser = { ...mockUser, trustPoints: 95 };
      const newUser = { ...mockUser, trustPoints: 15 };

      expect(generateProfileSummary(eliteUser).trustLevel).toBe('Elite');
      expect(generateProfileSummary(newUser).trustLevel).toBe('New');
    });
  });
});
/**
 * Database Types Verification Tests
 * 
 * These tests verify that all database types are correctly generated
 * and can be used for type-safe database operations.
 */

import type {
  Database,
  Tables,
  Inserts,
  Updates,
  DbUser,
  DbNGO,
  DbVenue,
  DbEvent,
  DbRSVP,
  DbChatThread,
  DbChatMessage,
  DbTrustPointsHistory,
  VerificationStatus,
  NGOVerificationStatus,
  SafetyRating,
  TrackType,
  OrganizerType,
  RSVPStatus,
  SenderType,
} from '../database.types';

describe('Database Types', () => {
  describe('Table Types', () => {
    it('should have correct users table type structure', () => {
      const user: DbUser = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        display_name: 'Test User',
        trust_points: 50,
        verification_status: 'unverified',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(user.id).toBeDefined();
      expect(user.email).toBeDefined();
      expect(user.display_name).toBeDefined();
      expect(user.trust_points).toBeDefined();
      expect(user.verification_status).toBeDefined();
    });

    it('should have correct ngos table type structure', () => {
      const ngo: DbNGO = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test NGO',
        description: 'A test NGO',
        darpan_id: '12345',
        verification_status: 'pending',
        contact_email: 'ngo@example.com',
        contact_phone: '+1234567890',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(ngo.id).toBeDefined();
      expect(ngo.name).toBeDefined();
      expect(ngo.verification_status).toBeDefined();
    });

    it('should have correct venues table type structure', () => {
      const venue: DbVenue = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test Venue',
        address: '123 Test St',
        latitude: 40.7128,
        longitude: -74.006,
        safety_rating: 'green',
        safety_notes: 'Safe location',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(venue.id).toBeDefined();
      expect(venue.name).toBeDefined();
      expect(venue.safety_rating).toBeDefined();
    });

    it('should have correct events table type structure', () => {
      const event: DbEvent = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        title: 'Test Event',
        description: 'A test event',
        event_type: 'volunteering',
        track_type: 'impact',
        organizer_id: '123e4567-e89b-12d3-a456-426614174000',
        organizer_type: 'ngo',
        venue_id: '123e4567-e89b-12d3-a456-426614174000',
        start_time: '2024-01-01T10:00:00Z',
        end_time: '2024-01-01T12:00:00Z',
        max_participants: 20,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(event.id).toBeDefined();
      expect(event.title).toBeDefined();
      expect(event.track_type).toBeDefined();
    });

    it('should have correct rsvps table type structure', () => {
      const rsvp: DbRSVP = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        event_id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'confirmed',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(rsvp.id).toBeDefined();
      expect(rsvp.event_id).toBeDefined();
      expect(rsvp.status).toBeDefined();
    });

    it('should have correct chat_threads table type structure', () => {
      const thread: DbChatThread = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        participant_user_id: '123e4567-e89b-12d3-a456-426614174000',
        participant_ngo_id: '123e4567-e89b-12d3-a456-426614174000',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(thread.id).toBeDefined();
      expect(thread.participant_user_id).toBeDefined();
      expect(thread.participant_ngo_id).toBeDefined();
    });

    it('should have correct chat_messages table type structure', () => {
      const message: DbChatMessage = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        thread_id: '123e4567-e89b-12d3-a456-426614174000',
        sender_type: 'user',
        sender_id: '123e4567-e89b-12d3-a456-426614174000',
        message_content: 'Hello!',
        created_at: '2024-01-01T00:00:00Z',
      };

      expect(message.id).toBeDefined();
      expect(message.thread_id).toBeDefined();
      expect(message.sender_type).toBeDefined();
    });

    it('should have correct trust_points_history table type structure', () => {
      const history: DbTrustPointsHistory = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        user_id: '123e4567-e89b-12d3-a456-426614174000',
        delta: 5,
        reason: 'Event completion',
        related_event_id: '123e4567-e89b-12d3-a456-426614174000',
        created_at: '2024-01-01T00:00:00Z',
      };

      expect(history.id).toBeDefined();
      expect(history.user_id).toBeDefined();
      expect(history.delta).toBeDefined();
    });
  });

  describe('Enum Types', () => {
    it('should have correct verification status enum', () => {
      const statuses: VerificationStatus[] = ['unverified', 'verified'];
      expect(statuses).toHaveLength(2);
    });

    it('should have correct NGO verification status enum', () => {
      const statuses: NGOVerificationStatus[] = ['pending', 'verified', 'rejected'];
      expect(statuses).toHaveLength(3);
    });

    it('should have correct safety rating enum', () => {
      const ratings: SafetyRating[] = ['green', 'yellow', 'red'];
      expect(ratings).toHaveLength(3);
    });

    it('should have correct track type enum', () => {
      const tracks: TrackType[] = ['impact', 'grow'];
      expect(tracks).toHaveLength(2);
    });

    it('should have correct organizer type enum', () => {
      const types: OrganizerType[] = ['user', 'ngo'];
      expect(types).toHaveLength(2);
    });

    it('should have correct RSVP status enum', () => {
      const statuses: RSVPStatus[] = ['confirmed', 'cancelled', 'attended', 'no_show'];
      expect(statuses).toHaveLength(4);
    });

    it('should have correct sender type enum', () => {
      const types: SenderType[] = ['user', 'ngo'];
      expect(types).toHaveLength(2);
    });
  });

  describe('Helper Types', () => {
    it('should support Tables helper type', () => {
      type UserRow = Tables<'users'>;
      const user: UserRow = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        display_name: 'Test User',
        trust_points: 50,
        verification_status: 'unverified',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };

      expect(user).toBeDefined();
    });

    it('should support Inserts helper type', () => {
      type UserInsert = Inserts<'users'>;
      const userInsert: UserInsert = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        display_name: 'Test User',
      };

      expect(userInsert).toBeDefined();
    });

    it('should support Updates helper type', () => {
      type UserUpdate = Updates<'users'>;
      const userUpdate: UserUpdate = {
        display_name: 'Updated Name',
        trust_points: 60,
      };

      expect(userUpdate).toBeDefined();
    });
  });

  describe('Database Schema Structure', () => {
    it('should have all required tables in Database type', () => {
      type TableNames = keyof Database['public']['Tables'];
      const tables: TableNames[] = [
        'users',
        'ngos',
        'venues',
        'events',
        'rsvps',
        'chat_threads',
        'chat_messages',
        'trust_points_history',
      ];

      expect(tables).toHaveLength(8);
    });

    it('should have update_trust_points function defined', () => {
      type FunctionNames = keyof Database['public']['Functions'];
      const functions: FunctionNames[] = ['update_trust_points'];

      expect(functions).toHaveLength(1);
    });
  });
});

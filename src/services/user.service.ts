/**
 * User Service
 * 
 * Provides data access methods for user-related operations.
 * Handles user profile retrieval, updates, and trust points management.
 * 
 * @see Requirements 4.1, 4.3, 4.4, 7.1, 7.2, 7.3, 7.4
 */

import { supabase } from '../lib/supabase';
import { DatabaseError } from '../utils/errors';
import { dbUserToUser, userToDbUser } from '../utils/transformers';
import type { User, UpdateUserInput } from '../types/models';

/**
 * User service interface defining all user-related operations
 */
export interface UserService {
  getUserById(id: string): Promise<User | null>;
  updateUser(id: string, updates: UpdateUserInput): Promise<User>;
  updateTrustPoints(userId: string, delta: number, reason: string, eventId?: string): Promise<number>;
}

/**
 * Get user by ID
 * 
 * @param id - User ID to retrieve
 * @returns User object or null if not found
 * @throws DatabaseError on database operation failure
 */
export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, display_name, trust_points, verification_status, created_at, updated_at')
      .eq('id', id)
      .single();

    if (error) {
      // PGRST116 is the "not found" error code from PostgREST
      if (error.code === 'PGRST116') {
        return null;
      }

      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to user profile',
          'permission_denied',
          { operation: 'getUserById', userId: id, error }
        );
      }

      throw new DatabaseError(
        'Failed to fetch user',
        'network_error',
        { operation: 'getUserById', userId: id, error }
      );
    }

    return dbUserToUser(data);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while fetching user',
      'network_error',
      { operation: 'getUserById', userId: id, error }
    );
  }
}

/**
 * Update user profile
 * 
 * @param id - User ID to update
 * @param updates - Partial user data to update
 * @returns Updated user object
 * @throws DatabaseError on database operation failure
 */
export async function updateUser(id: string, updates: UpdateUserInput): Promise<User> {
  try {
    const dbUpdates = userToDbUser(updates);

    const { data, error } = await supabase
      .from('users')
      .update(dbUpdates)
      .eq('id', id)
      .select('id, email, display_name, trust_points, verification_status, created_at, updated_at')
      .single();

    if (error) {
      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to update user profile',
          'permission_denied',
          { operation: 'updateUser', userId: id, error }
        );
      }

      // Check for constraint violations
      if (error.code === '23505') {
        throw new DatabaseError(
          'Email already exists',
          'constraint_violation',
          { operation: 'updateUser', userId: id, error }
        );
      }

      if (error.code === '23514') {
        throw new DatabaseError(
          'Invalid data: check constraints failed',
          'constraint_violation',
          { operation: 'updateUser', userId: id, error }
        );
      }

      throw new DatabaseError(
        'Failed to update user',
        'network_error',
        { operation: 'updateUser', userId: id, error }
      );
    }

    if (!data) {
      throw new DatabaseError(
        'User not found',
        'not_found',
        { operation: 'updateUser', userId: id }
      );
    }

    return dbUserToUser(data);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while updating user',
      'network_error',
      { operation: 'updateUser', userId: id, error }
    );
  }
}

/**
 * Update user trust points using database function
 * 
 * This method calls the database function `update_trust_points` which:
 * - Updates trust points with bounds checking (0-100)
 * - Logs the change to trust_points_history table
 * - Executes in a transaction for consistency
 * 
 * @param userId - User ID to update trust points for
 * @param delta - Amount to change trust points by (positive or negative)
 * @param reason - Reason for the trust points change
 * @param eventId - Optional event ID related to the change
 * @returns New trust points value after update
 * @throws DatabaseError on database operation failure
 */
export async function updateTrustPoints(
  userId: string,
  delta: number,
  reason: string,
  eventId?: string
): Promise<number> {
  try {
    const { data, error } = await supabase.rpc('update_trust_points', {
      p_user_id: userId,
      p_delta: delta,
      p_reason: reason,
      p_event_id: eventId ?? undefined,
    });

    if (error) {
      // Check for permission denied
      if (error.message.includes('permission denied')) {
        throw new DatabaseError(
          'Access denied to update trust points',
          'permission_denied',
          { operation: 'updateTrustPoints', userId, delta, reason, error }
        );
      }

      throw new DatabaseError(
        'Failed to update trust points',
        'network_error',
        { operation: 'updateTrustPoints', userId, delta, reason, error }
      );
    }

    return data as number;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while updating trust points',
      'network_error',
      { operation: 'updateTrustPoints', userId, delta, reason, error }
    );
  }
}

// Export as default service object
export const userService: UserService = {
  getUserById,
  updateUser,
  updateTrustPoints,
};


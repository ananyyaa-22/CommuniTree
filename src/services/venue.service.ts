/**
 * Venue Service
 * 
 * Provides data access methods for venue-related operations.
 * Handles venue retrieval, creation, and safety rating updates.
 * 
 * @see Requirements 4.1, 4.3, 4.4, 10.4
 */

import { supabase } from '../lib/supabase';
import { DatabaseError } from '../utils/errors';
import { dbVenueToVenue, venueToDbVenue } from '../utils/transformers';
import { cache, CacheKeys, CacheTTL } from '../utils/cache';
import type { Venue, CreateVenueInput, UpdateVenueInput } from '../types/models';
import type { DbVenueInsert } from '../types/database.types';

/**
 * Venue service interface defining all venue-related operations
 */
export interface VenueService {
  getVenueById(id: string): Promise<Venue | null>;
  createVenue(venue: CreateVenueInput): Promise<Venue>;
  updateVenueSafety(id: string, rating: 'green' | 'yellow' | 'red', notes?: string): Promise<Venue>;
}

/**
 * Get venue by ID
 * Results are cached for better performance
 * 
 * @param id - Venue ID to retrieve
 * @returns Venue object or null if not found
 * @throws DatabaseError on database operation failure
 */
export async function getVenueById(id: string): Promise<Venue | null> {
  try {
    // Check cache first
    const cacheKey = CacheKeys.venueById(id);
    const cached = cache.get<Venue>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('venues')
      .select('id, name, address, latitude, longitude, safety_rating, safety_notes, created_at, updated_at')
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
          'Access denied to venue',
          'permission_denied',
          { operation: 'getVenueById', venueId: id, error }
        );
      }

      throw new DatabaseError(
        'Failed to fetch venue',
        'network_error',
        { operation: 'getVenueById', venueId: id, error }
      );
    }

    const venue = dbVenueToVenue(data);
    
    // Cache the result
    cache.set(cacheKey, venue, { ttl: CacheTTL.veryLong });
    
    return venue;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while fetching venue',
      'network_error',
      { operation: 'getVenueById', venueId: id, error }
    );
  }
}

/**
 * Create a new venue
 * Invalidates venue cache on successful creation
 * 
 * @param venue - Venue data to create
 * @returns Created venue object
 * @throws DatabaseError on database operation failure
 */
export async function createVenue(venue: CreateVenueInput): Promise<Venue> {
  try {
    const dbVenue: DbVenueInsert = {
      name: venue.name,
      address: venue.address,
      latitude: venue.latitude ?? null,
      longitude: venue.longitude ?? null,
      safety_rating: venue.safetyRating ?? 'yellow',
      safety_notes: venue.safetyNotes ?? null,
    };

    const { data, error } = await supabase
      .from('venues')
      .insert(dbVenue)
      .select('id, name, address, latitude, longitude, safety_rating, safety_notes, created_at, updated_at')
      .single();

    if (error) {
      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to create venue',
          'permission_denied',
          { operation: 'createVenue', error }
        );
      }

      // Check for check constraint violations
      if (error.code === '23514') {
        throw new DatabaseError(
          'Invalid data: check constraints failed',
          'constraint_violation',
          { operation: 'createVenue', error }
        );
      }

      throw new DatabaseError(
        'Failed to create venue',
        'network_error',
        { operation: 'createVenue', error }
      );
    }

    const createdVenue = dbVenueToVenue(data);
    
    // Invalidate venue list cache if it exists
    cache.invalidate(CacheKeys.allVenues());
    
    return createdVenue;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while creating venue',
      'network_error',
      { operation: 'createVenue', error }
    );
  }
}

/**
 * Update venue safety rating and notes
 * Invalidates venue cache on successful update
 * 
 * @param id - Venue ID to update
 * @param rating - New safety rating ('green', 'yellow', or 'red')
 * @param notes - Optional safety notes
 * @returns Updated venue object
 * @throws DatabaseError on database operation failure
 */
export async function updateVenueSafety(
  id: string,
  rating: 'green' | 'yellow' | 'red',
  notes?: string
): Promise<Venue> {
  try {
    const updates: UpdateVenueInput = {
      safetyRating: rating,
    };

    if (notes !== undefined) {
      updates.safetyNotes = notes;
    }

    const dbUpdates = venueToDbVenue(updates);

    const { data, error } = await supabase
      .from('venues')
      .update(dbUpdates)
      .eq('id', id)
      .select('id, name, address, latitude, longitude, safety_rating, safety_notes, created_at, updated_at')
      .single();

    if (error) {
      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to update venue safety',
          'permission_denied',
          { operation: 'updateVenueSafety', venueId: id, error }
        );
      }

      // Check for check constraint violations
      if (error.code === '23514') {
        throw new DatabaseError(
          'Invalid data: check constraints failed',
          'constraint_violation',
          { operation: 'updateVenueSafety', venueId: id, error }
        );
      }

      throw new DatabaseError(
        'Failed to update venue safety',
        'network_error',
        { operation: 'updateVenueSafety', venueId: id, error }
      );
    }

    if (!data) {
      throw new DatabaseError(
        'Venue not found',
        'not_found',
        { operation: 'updateVenueSafety', venueId: id }
      );
    }

    const updatedVenue = dbVenueToVenue(data);
    
    // Invalidate caches
    cache.invalidate(CacheKeys.venueById(id));
    cache.invalidate(CacheKeys.allVenues());
    
    return updatedVenue;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while updating venue safety',
      'network_error',
      { operation: 'updateVenueSafety', venueId: id, error }
    );
  }
}

// Export as default service object
export const venueService: VenueService = {
  getVenueById,
  createVenue,
  updateVenueSafety,
};

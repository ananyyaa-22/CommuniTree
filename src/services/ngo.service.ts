/**
 * NGO Service
 * 
 * Provides data access methods for NGO-related operations.
 * Handles NGO retrieval, creation, verification, and search.
 * 
 * @see Requirements 4.1, 4.3, 4.4, 8.2, 8.3, 8.4, 8.5, 8.6
 */

import { supabase } from '../lib/supabase';
import { DatabaseError, ValidationError } from '../utils/errors';
import { dbNGOToNGO, ngoToDbNGO } from '../utils/transformers';
import { cache, CacheKeys, CacheTTL } from '../utils/cache';
import type { NGO, CreateNGOInput, UpdateNGOInput } from '../types/models';
import type { DbNGOInsert } from '../types/database.types';

/**
 * NGO service interface defining all NGO-related operations
 */
export interface NGOService {
  getAllNGOs(page?: number, pageSize?: number): Promise<NGO[]>;
  getNGOById(id: string): Promise<NGO | null>;
  createNGO(ngo: CreateNGOInput): Promise<NGO>;
  updateNGOVerification(id: string, status: 'pending' | 'verified' | 'rejected'): Promise<NGO>;
  searchNGOs(query: string, page?: number, pageSize?: number): Promise<NGO[]>;
}

/**
 * Validate Darpan ID format (must be exactly 5 digits)
 * 
 * @param darpanId - Darpan ID to validate
 * @returns true if valid, false otherwise
 */
function isValidDarpanId(darpanId: string): boolean {
  return /^[0-9]{5}$/.test(darpanId);
}

/**
 * Get all verified NGOs with optional pagination
 * Results are cached for better performance
 * 
 * @param page - Page number (1-indexed, default: 1)
 * @param pageSize - Number of items per page (default: 50)
 * @returns Array of verified NGO objects
 * @throws DatabaseError on database operation failure
 */
export async function getAllNGOs(page: number = 1, pageSize: number = 50): Promise<NGO[]> {
  try {
    // Check cache first (cache key includes pagination)
    const cacheKey = `${CacheKeys.allNGOs()}:page:${page}:size:${pageSize}`;
    const cached = cache.get<NGO[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('ngos')
      .select('id, name, description, darpan_id, verification_status, contact_email, contact_phone, created_at, updated_at')
      .eq('verification_status', 'verified')
      .order('name')
      .range(from, to);

    if (error) {
      throw new DatabaseError(
        'Failed to fetch NGOs',
        'network_error',
        { operation: 'getAllNGOs', page, pageSize, error }
      );
    }

    const ngos = data.map(dbNGOToNGO);
    
    // Cache the results
    cache.set(cacheKey, ngos, { ttl: CacheTTL.long });
    
    return ngos;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while fetching NGOs',
      'network_error',
      { operation: 'getAllNGOs', page, pageSize, error }
    );
  }
}

/**
 * Get NGO by ID
 * Results are cached for better performance
 * 
 * @param id - NGO ID to retrieve
 * @returns NGO object or null if not found
 * @throws DatabaseError on database operation failure
 */
export async function getNGOById(id: string): Promise<NGO | null> {
  try {
    // Check cache first
    const cacheKey = CacheKeys.ngoById(id);
    const cached = cache.get<NGO>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const { data, error } = await supabase
      .from('ngos')
      .select('id, name, description, darpan_id, verification_status, contact_email, contact_phone, created_at, updated_at')
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
          'Access denied to NGO profile',
          'permission_denied',
          { operation: 'getNGOById', ngoId: id, error }
        );
      }

      throw new DatabaseError(
        'Failed to fetch NGO',
        'network_error',
        { operation: 'getNGOById', ngoId: id, error }
      );
    }

    const ngo = dbNGOToNGO(data);
    
    // Cache the result
    cache.set(cacheKey, ngo, { ttl: CacheTTL.long });
    
    return ngo;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while fetching NGO',
      'network_error',
      { operation: 'getNGOById', ngoId: id, error }
    );
  }
}

/**
 * Create a new NGO
 * Invalidates NGO cache on successful creation
 * 
 * @param ngo - NGO data to create
 * @returns Created NGO object
 * @throws ValidationError if Darpan ID format is invalid
 * @throws DatabaseError on database operation failure
 */
export async function createNGO(ngo: CreateNGOInput): Promise<NGO> {
  try {
    // Validate Darpan ID format if provided
    if (ngo.darpanId && !isValidDarpanId(ngo.darpanId)) {
      throw new ValidationError(
        'Darpan ID must be exactly 5 digits',
        'darpanId',
        'format'
      );
    }

    const dbNGO: DbNGOInsert = {
      name: ngo.name,
      description: ngo.description ?? null,
      darpan_id: ngo.darpanId ?? null,
      verification_status: ngo.verificationStatus ?? 'pending',
      contact_email: ngo.contactEmail,
      contact_phone: ngo.contactPhone ?? null,
    };

    const { data, error } = await supabase
      .from('ngos')
      .insert(dbNGO)
      .select('id, name, description, darpan_id, verification_status, contact_email, contact_phone, created_at, updated_at')
      .single();

    if (error) {
      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to create NGO',
          'permission_denied',
          { operation: 'createNGO', error }
        );
      }

      // Check for unique constraint violations (duplicate Darpan ID)
      if (error.code === '23505') {
        if (error.message.includes('darpan_id')) {
          throw new DatabaseError(
            'An NGO with this Darpan ID already exists',
            'constraint_violation',
            { operation: 'createNGO', error }
          );
        }
        throw new DatabaseError(
          'Duplicate NGO data',
          'constraint_violation',
          { operation: 'createNGO', error }
        );
      }

      // Check for check constraint violations
      if (error.code === '23514') {
        throw new DatabaseError(
          'Invalid data: check constraints failed',
          'constraint_violation',
          { operation: 'createNGO', error }
        );
      }

      throw new DatabaseError(
        'Failed to create NGO',
        'network_error',
        { operation: 'createNGO', error }
      );
    }

    const createdNGO = dbNGOToNGO(data);
    
    // Invalidate NGO list cache
    cache.invalidate(CacheKeys.allNGOs());
    
    return createdNGO;
  } catch (error) {
    if (error instanceof ValidationError || error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while creating NGO',
      'network_error',
      { operation: 'createNGO', error }
    );
  }
}

/**
 * Update NGO verification status
 * Invalidates NGO cache on successful update
 * 
 * @param id - NGO ID to update
 * @param status - New verification status
 * @returns Updated NGO object
 * @throws DatabaseError on database operation failure
 */
export async function updateNGOVerification(
  id: string,
  status: 'pending' | 'verified' | 'rejected'
): Promise<NGO> {
  try {
    const { data, error } = await supabase
      .from('ngos')
      .update({ verification_status: status })
      .eq('id', id)
      .select('id, name, description, darpan_id, verification_status, contact_email, contact_phone, created_at, updated_at')
      .single();

    if (error) {
      // Check for permission denied
      if (error.message.includes('permission denied') || error.message.includes('row-level security')) {
        throw new DatabaseError(
          'Access denied to update NGO verification',
          'permission_denied',
          { operation: 'updateNGOVerification', ngoId: id, error }
        );
      }

      throw new DatabaseError(
        'Failed to update NGO verification',
        'network_error',
        { operation: 'updateNGOVerification', ngoId: id, error }
      );
    }

    if (!data) {
      throw new DatabaseError(
        'NGO not found',
        'not_found',
        { operation: 'updateNGOVerification', ngoId: id }
      );
    }

    const updatedNGO = dbNGOToNGO(data);
    
    // Invalidate caches
    cache.invalidate(CacheKeys.allNGOs());
    cache.invalidate(CacheKeys.ngoById(id));
    
    return updatedNGO;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while updating NGO verification',
      'network_error',
      { operation: 'updateNGOVerification', ngoId: id, error }
    );
  }
}

/**
 * Search NGOs by name or description with optional pagination
 * Results are cached per query for better performance
 * 
 * @param query - Search query string
 * @param page - Page number (1-indexed, default: 1)
 * @param pageSize - Number of items per page (default: 50)
 * @returns Array of matching verified NGO objects
 * @throws DatabaseError on database operation failure
 */
export async function searchNGOs(query: string, page: number = 1, pageSize: number = 50): Promise<NGO[]> {
  try {
    // Check cache first (cache key includes pagination)
    const cacheKey = `${CacheKeys.ngoSearch(query)}:page:${page}:size:${pageSize}`;
    const cached = cache.get<NGO[]>(cacheKey);
    
    if (cached) {
      return cached;
    }

    const searchPattern = `%${query}%`;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('ngos')
      .select('id, name, description, darpan_id, verification_status, contact_email, contact_phone, created_at, updated_at')
      .eq('verification_status', 'verified')
      .or(`name.ilike.${searchPattern},description.ilike.${searchPattern}`)
      .order('name')
      .range(from, to);

    if (error) {
      throw new DatabaseError(
        'Failed to search NGOs',
        'network_error',
        { operation: 'searchNGOs', query, page, pageSize, error }
      );
    }

    const ngos = data.map(dbNGOToNGO);
    
    // Cache the results
    cache.set(cacheKey, ngos, { ttl: CacheTTL.medium });
    
    return ngos;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError(
      'An unexpected error occurred while searching NGOs',
      'network_error',
      { operation: 'searchNGOs', query, page, pageSize, error }
    );
  }
}

// Export as default service object
export const ngoService: NGOService = {
  getAllNGOs,
  getNGOById,
  createNGO,
  updateNGOVerification,
  searchNGOs,
};


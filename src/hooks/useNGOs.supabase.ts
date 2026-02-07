/**
 * useNGOs Hook (Supabase version)
 * 
 * Custom React hook for NGO data management with Supabase backend.
 * Fetches NGOs with pagination, loading and error states.
 * Provides refetch method for manual data refresh.
 * 
 * NOTE: This hook adapts the Supabase NGO model to the existing component interface.
 * Some fields are populated with default values or derived from available data.
 * 
 * @see Requirements 11.4, 11.5, 11.6, 13.5
 */

import { useState, useEffect, useCallback } from 'react';
import { ngoService } from '../services/ngo.service';
import type { NGO as SupabaseNGO } from '../types/models';
import type { NGO, NGOCategory } from '../types/NGO';
import { getErrorMessage } from '../utils/errors';

/**
 * Adapt Supabase NGO to component NGO interface
 * Maps database fields to expected component fields
 */
function adaptSupabaseNGO(supabaseNGO: SupabaseNGO): NGO {
  // Default category based on description keywords or default to 'Community Development'
  const category: NGOCategory = 'Community Development';
  
  return {
    id: supabaseNGO.id,
    name: supabaseNGO.name,
    projectTitle: supabaseNGO.description || 'Community Project',
    description: supabaseNGO.description || '',
    darpanId: supabaseNGO.darpanId || undefined,
    isVerified: supabaseNGO.verificationStatus === 'verified',
    contactInfo: {
      email: supabaseNGO.contactEmail,
      phone: supabaseNGO.contactPhone || '',
    },
    category,
    volunteersNeeded: 10, // Default value
    currentVolunteers: 0, // Default value
    createdAt: supabaseNGO.createdAt,
    updatedAt: supabaseNGO.updatedAt,
  };
}

/**
 * Return type for useNGOs hook
 */
export interface UseNGOsReturn {
  ngos: NGO[];
  loading: boolean;
  error: Error | null;
  currentPage: number;
  setPage: (page: number) => void;
  refetch: () => Promise<void>;
}

/**
 * Custom hook for fetching NGOs with pagination
 * 
 * Automatically fetches NGOs when the page changes.
 * Provides loading and error states for UI feedback.
 * Includes refetch method for manual data refresh.
 * 
 * @param pageSize - Number of NGOs per page (default: 20)
 * @returns NGOs data, loading state, error state, pagination controls, and refetch method
 * 
 * @example
 * const { ngos, loading, error, currentPage, setPage, refetch } = useNGOs();
 * 
 * if (loading) return <Loading />;
 * if (error) return <Error message={error.message} />;
 * 
 * return (
 *   <div>
 *     {ngos.map(ngo => <NGOCard key={ngo.id} ngo={ngo} />)}
 *     <Pagination currentPage={currentPage} onPageChange={setPage} />
 *     <button onClick={refetch}>Refresh</button>
 *   </div>
 * );
 */
export function useNGOs(pageSize: number = 20): UseNGOsReturn {
  const [ngos, setNGOs] = useState<NGO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  /**
   * Fetch NGOs from the database
   */
  const fetchNGOs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedNGOs = await ngoService.getAllNGOs(currentPage, pageSize);
      const adaptedNGOs = fetchedNGOs.map(adaptSupabaseNGO);
      setNGOs(adaptedNGOs);
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error);
      const error = new Error(errorMessage);
      setError(error);
      console.error('Failed to fetch NGOs:', err);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  /**
   * Change page
   */
  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  /**
   * Refetch NGOs manually
   */
  const refetch = useCallback(async (): Promise<void> => {
    await fetchNGOs();
  }, [fetchNGOs]);

  /**
   * Fetch NGOs when page changes
   */
  useEffect(() => {
    fetchNGOs();
  }, [fetchNGOs]);

  return {
    ngos,
    loading,
    error,
    currentPage,
    setPage,
    refetch,
  };
}

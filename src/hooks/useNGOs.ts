/**
 * Custom hook for NGO data management
 * Provides NGO data access and NGO-related actions
 */

import { useCallback, useMemo } from 'react';
import { useAppState, useAppDispatch } from './useAppState';
import { NGO, NGOCategory } from '../types';
import { isValidDarpanId } from '../utils/validation';
import { useUI } from './useUI';

export const useNGOs = () => {
  const state = useAppState();
  const dispatch = useAppDispatch();
  const { addNotification } = useUI();

  const verifyNGO = useCallback(async (id: string, darpanId: string): Promise<boolean> => {
    // Validate Darpan ID format
    if (!isValidDarpanId(darpanId)) {
      addNotification({
        type: 'verification',
        title: 'Verification Failed',
        message: 'Invalid Darpan ID format. Please enter exactly 5 digits.',
        timestamp: new Date(),
        isRead: false,
      });
      return false;
    }

    // Find the NGO to get its name for notifications
    const ngo = state.ngos.find(n => n.id === id);
    const ngoName = ngo?.name || 'NGO';

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock validation logic - in a real app, this would call an API
      // For demo purposes, accept specific test IDs or any valid format
      const validTestIds = ['12345', '67890', '11111', '54321', '98765'];
      const isValid = validTestIds.includes(darpanId) || Math.random() > 0.3; // 70% success rate for demo

      if (isValid) {
        // Update the NGO in state
        dispatch({ type: 'VERIFY_NGO', payload: { id, darpanId } });
        
        // Add success notification
        addNotification({
          type: 'verification',
          title: 'Verification Successful',
          message: `${ngoName} has been successfully verified with Darpan ID ${darpanId}.`,
          timestamp: new Date(),
          isRead: false,
        });
        
        return true;
      } else {
        // Add failure notification
        addNotification({
          type: 'verification',
          title: 'Verification Failed',
          message: `Unable to verify ${ngoName}. The Darpan ID ${darpanId} could not be validated.`,
          timestamp: new Date(),
          isRead: false,
        });
        
        return false;
      }
    } catch (error) {
      // Add error notification
      addNotification({
        type: 'system',
        title: 'Verification Error',
        message: `An error occurred while verifying ${ngoName}. Please try again later.`,
        timestamp: new Date(),
        isRead: false,
      });
      
      return false;
    }
  }, [dispatch, addNotification, state.ngos]);

  const updateNGO = useCallback((id: string, updates: Partial<NGO>) => {
    dispatch({ type: 'UPDATE_NGO', payload: { id, updates } });
  }, [dispatch]);

  const addNGO = useCallback((ngo: NGO) => {
    dispatch({ type: 'ADD_NGO', payload: ngo });
  }, [dispatch]);

  // Filtered NGOs based on verification status
  const verifiedNGOs = useMemo(() => 
    state.ngos.filter(ngo => ngo.isVerified), 
    [state.ngos]
  );

  const unverifiedNGOs = useMemo(() => 
    state.ngos.filter(ngo => !ngo.isVerified), 
    [state.ngos]
  );

  // NGOs by category
  const getNGOsByCategory = useCallback((category: NGOCategory) => 
    state.ngos.filter(ngo => ngo.category === category),
    [state.ngos]
  );

  // NGOs needing volunteers
  const ngosByVolunteerNeed = useMemo(() => 
    state.ngos
      .filter(ngo => ngo.currentVolunteers < ngo.volunteersNeeded)
      .sort((a, b) => (b.volunteersNeeded - b.currentVolunteers) - (a.volunteersNeeded - a.currentVolunteers)),
    [state.ngos]
  );

  const findNGOById = useCallback((id: string) => 
    state.ngos.find(ngo => ngo.id === id),
    [state.ngos]
  );

  return {
    ngos: state.ngos,
    verifiedNGOs,
    unverifiedNGOs,
    ngosByVolunteerNeed,
    verifyNGO,
    updateNGO,
    addNGO,
    getNGOsByCategory,
    findNGOById,
    totalNGOs: state.ngos.length,
    verifiedCount: verifiedNGOs.length,
    unverifiedCount: unverifiedNGOs.length,
  };
};
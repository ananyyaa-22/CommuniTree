/**
 * Unit tests for useNGOs hook
 * Tests NGO data management and NGO-related actions
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AppProvider } from '../../context/AppContext';
import { useNGOs } from '../useNGOs';
import { NGO } from '../../types';

// Mock NGO data
const mockVerifiedNGO: NGO = {
  id: 'ngo_verified',
  name: 'Verified NGO',
  projectTitle: 'Verified Project',
  description: 'A verified NGO for testing',
  darpanId: '12345',
  isVerified: true,
  contactInfo: {
    email: 'verified@ngo.org',
    phone: '+91-1234567890',
    address: 'Verified Address',
  },
  category: 'Education',
  volunteersNeeded: 20,
  currentVolunteers: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUnverifiedNGO: NGO = {
  id: 'ngo_unverified',
  name: 'Unverified NGO',
  projectTitle: 'Unverified Project',
  description: 'An unverified NGO for testing',
  isVerified: false,
  contactInfo: {
    email: 'unverified@ngo.org',
    phone: '+91-0987654321',
    address: 'Unverified Address',
  },
  category: 'Environment',
  volunteersNeeded: 15,
  currentVolunteers: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockFullNGO: NGO = {
  id: 'ngo_full',
  name: 'Full NGO',
  projectTitle: 'Full Project',
  description: 'An NGO with full volunteers',
  isVerified: true,
  darpanId: '54321',
  contactInfo: {
    email: 'full@ngo.org',
    phone: '+91-1111111111',
    address: 'Full Address',
  },
  category: 'Animal Welfare',
  volunteersNeeded: 10,
  currentVolunteers: 10,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Wrapper component for testing hooks with context
const createWrapper = (ngos: NGO[] = [mockVerifiedNGO, mockUnverifiedNGO, mockFullNGO]) => {
  return ({ children }: { children: React.ReactNode }) => (
    <AppProvider initialState={{ ngos }}>
      {children}
    </AppProvider>
  );
};

describe('useNGOs', () => {
  it('should return NGOs data', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useNGOs(), { wrapper });

    expect(result.current.ngos).toHaveLength(3);
    expect(result.current.totalNGOs).toBe(3);
  });

  it('should filter verified NGOs', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useNGOs(), { wrapper });

    expect(result.current.verifiedNGOs).toHaveLength(2);
    expect(result.current.verifiedCount).toBe(2);
    expect(result.current.verifiedNGOs.every(ngo => ngo.isVerified)).toBe(true);
  });

  it('should filter unverified NGOs', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useNGOs(), { wrapper });

    expect(result.current.unverifiedNGOs).toHaveLength(1);
    expect(result.current.unverifiedCount).toBe(1);
    expect(result.current.unverifiedNGOs[0].id).toBe('ngo_unverified');
  });

  it('should verify NGO', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useNGOs(), { wrapper });

    act(() => {
      result.current.verifyNGO('ngo_unverified', '67890');
    });

    const verifiedNGO = result.current.findNGOById('ngo_unverified');
    expect(verifiedNGO?.isVerified).toBe(true);
    expect(verifiedNGO?.darpanId).toBe('67890');
    expect(result.current.verifiedCount).toBe(3);
    expect(result.current.unverifiedCount).toBe(0);
  });

  it('should update NGO', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useNGOs(), { wrapper });

    const updates = { 
      name: 'Updated NGO Name', 
      volunteersNeeded: 25,
      currentVolunteers: 15 
    };

    act(() => {
      result.current.updateNGO('ngo_verified', updates);
    });

    const updatedNGO = result.current.findNGOById('ngo_verified');
    expect(updatedNGO?.name).toBe('Updated NGO Name');
    expect(updatedNGO?.volunteersNeeded).toBe(25);
    expect(updatedNGO?.currentVolunteers).toBe(15);
  });

  it('should add new NGO', () => {
    const wrapper = createWrapper([]);
    const { result } = renderHook(() => useNGOs(), { wrapper });

    act(() => {
      result.current.addNGO(mockVerifiedNGO);
    });

    expect(result.current.ngos).toContain(mockVerifiedNGO);
    expect(result.current.totalNGOs).toBe(1);
  });

  it('should filter NGOs by category', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useNGOs(), { wrapper });

    const educationNGOs = result.current.getNGOsByCategory('Education');
    const environmentNGOs = result.current.getNGOsByCategory('Environment');
    const animalWelfareNGOs = result.current.getNGOsByCategory('Animal Welfare');

    expect(educationNGOs).toHaveLength(1);
    expect(educationNGOs[0].category).toBe('Education');
    expect(environmentNGOs).toHaveLength(1);
    expect(environmentNGOs[0].category).toBe('Environment');
    expect(animalWelfareNGOs).toHaveLength(1);
    expect(animalWelfareNGOs[0].category).toBe('Animal Welfare');
  });

  it('should sort NGOs by volunteer need', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useNGOs(), { wrapper });

    const ngosByNeed = result.current.ngosByVolunteerNeed;
    
    // Should exclude full NGO (currentVolunteers >= volunteersNeeded)
    expect(ngosByNeed).toHaveLength(2);
    
    // Should be sorted by volunteer gap (needed - current) in descending order
    expect(ngosByNeed[0].id).toBe('ngo_unverified'); // Gap: 15 - 5 = 10
    expect(ngosByNeed[1].id).toBe('ngo_verified'); // Gap: 20 - 10 = 10
  });

  it('should find NGO by ID', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useNGOs(), { wrapper });

    const foundNGO = result.current.findNGOById('ngo_verified');
    expect(foundNGO).toEqual(mockVerifiedNGO);

    const notFoundNGO = result.current.findNGOById('nonexistent');
    expect(notFoundNGO).toBeUndefined();
  });

  it('should maintain stable function references', () => {
    const wrapper = createWrapper();
    const { result, rerender } = renderHook(() => useNGOs(), { wrapper });

    const initialVerifyNGO = result.current.verifyNGO;
    const initialUpdateNGO = result.current.updateNGO;
    const initialAddNGO = result.current.addNGO;
    const initialGetNGOsByCategory = result.current.getNGOsByCategory;
    const initialFindNGOById = result.current.findNGOById;

    rerender();

    expect(result.current.verifyNGO).toBe(initialVerifyNGO);
    expect(result.current.updateNGO).toBe(initialUpdateNGO);
    expect(result.current.addNGO).toBe(initialAddNGO);
    expect(result.current.getNGOsByCategory).toBe(initialGetNGOsByCategory);
    expect(result.current.findNGOById).toBe(initialFindNGOById);
  });

  it('should handle empty NGOs array', () => {
    const wrapper = createWrapper([]);
    const { result } = renderHook(() => useNGOs(), { wrapper });

    expect(result.current.ngos).toHaveLength(0);
    expect(result.current.totalNGOs).toBe(0);
    expect(result.current.verifiedNGOs).toHaveLength(0);
    expect(result.current.unverifiedNGOs).toHaveLength(0);
    expect(result.current.ngosByVolunteerNeed).toHaveLength(0);
    expect(result.current.verifiedCount).toBe(0);
    expect(result.current.unverifiedCount).toBe(0);
  });

  it('should handle NGOs with same volunteer gap correctly', () => {
    const ngo1: NGO = { ...mockVerifiedNGO, id: 'ngo1', volunteersNeeded: 20, currentVolunteers: 10 }; // Gap: 10
    const ngo2: NGO = { ...mockUnverifiedNGO, id: 'ngo2', volunteersNeeded: 15, currentVolunteers: 5 }; // Gap: 10
    const wrapper = createWrapper([ngo1, ngo2]);
    const { result } = renderHook(() => useNGOs(), { wrapper });

    const ngosByNeed = result.current.ngosByVolunteerNeed;
    expect(ngosByNeed).toHaveLength(2);
    // Both should be included since they have the same gap
    expect(ngosByNeed.map(ngo => ngo.id)).toContain('ngo1');
    expect(ngosByNeed.map(ngo => ngo.id)).toContain('ngo2');
  });

  it('should exclude NGOs that don\'t need volunteers', () => {
    const ngoNoNeed: NGO = { ...mockVerifiedNGO, id: 'ngo_no_need', volunteersNeeded: 10, currentVolunteers: 15 };
    const wrapper = createWrapper([ngoNoNeed]);
    const { result } = renderHook(() => useNGOs(), { wrapper });

    const ngosByNeed = result.current.ngosByVolunteerNeed;
    expect(ngosByNeed).toHaveLength(0);
  });

  it('should handle verification of already verified NGO', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useNGOs(), { wrapper });

    const initialDarpanId = result.current.findNGOById('ngo_verified')?.darpanId;

    act(() => {
      result.current.verifyNGO('ngo_verified', '99999');
    });

    const updatedNGO = result.current.findNGOById('ngo_verified');
    expect(updatedNGO?.darpanId).toBe('99999'); // Should update even if already verified
    expect(updatedNGO?.isVerified).toBe(true);
  });

  it('should handle category filtering with no matches', () => {
    const wrapper = createWrapper();
    const { result } = renderHook(() => useNGOs(), { wrapper });

    const healthNGOs = result.current.getNGOsByCategory('Health' as any);
    expect(healthNGOs).toHaveLength(0);
  });
});
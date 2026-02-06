/**
 * Data initialization utilities for CommuniTree platform
 * Handles app startup data loading and consistency checks
 */

import { AppState, User } from '../types';
import { 
  loadUserData, 
  loadLastTrack, 
  loadChatHistory, 
  loadUserPreferences,
  loadNGOVerifications,
  loadEventRSVPs,
  syncAppStateWithStorage,
  getStorageStats
} from './dataPersistence';
import { generateComprehensiveMockData } from './mockData';

/**
 * Initialize app data on startup
 */
export const initializeAppData = (): {
  initialState: Partial<AppState>;
  hasPersistedData: boolean;
  storageStats: { localStorage: number; sessionStorage: number };
} => {
  const storageStats = getStorageStats();
  
  // Load persisted user data
  const persistedUser = loadUserData();
  const lastTrack = loadLastTrack();
  
  // Generate fresh mock data
  const mockData = generateComprehensiveMockData();
  
  let initialState: Partial<AppState> = {
    currentTrack: lastTrack,
    ngos: mockData.ngos,
    events: mockData.events,
    chatThreads: mockData.chatThreads,
    availableUsers: mockData.users,
    preferences: {
      lastSelectedTrack: lastTrack,
      notificationsEnabled: true,
      preferredCategories: ['Poetry', 'Art', 'Environment'],
      locationPermission: false,
    },
  };

  let hasPersistedData = false;

  // If we have a persisted user, load their specific data
  if (persistedUser) {
    hasPersistedData = true;
    
    const userChatHistory = loadChatHistory(persistedUser.id);
    const userPreferences = loadUserPreferences(persistedUser.id);
    const userRSVPs = loadEventRSVPs(persistedUser.id);
    const ngoVerifications = loadNGOVerifications();

    initialState = {
      ...initialState,
      user: persistedUser,
      chatThreads: userChatHistory.length > 0 ? userChatHistory : mockData.chatThreads,
      preferences: userPreferences ? { ...initialState.preferences, ...userPreferences } : initialState.preferences,
      // Apply persisted NGO verifications
      ngos: mockData.ngos.map(ngo => {
        const verification = ngoVerifications[ngo.id];
        return verification ? {
          ...ngo,
          isVerified: verification.isVerified,
          darpanId: verification.darpanId || ngo.darpanId,
        } : ngo;
      }),
      // Apply persisted RSVPs
      events: mockData.events.map(event => {
        const rsvp = userRSVPs[event.id];
        return rsvp ? {
          ...event,
          rsvpList: event.rsvpList.includes(persistedUser.id) 
            ? event.rsvpList 
            : [...event.rsvpList, persistedUser.id],
        } : event;
      }),
    };
  }

  return {
    initialState,
    hasPersistedData,
    storageStats,
  };
};

/**
 * Validate data consistency
 */
export const validateDataConsistency = (state: AppState): {
  isValid: boolean;
  issues: string[];
  fixes: Array<() => void>;
} => {
  const issues: string[] = [];
  const fixes: Array<() => void> = [];

  // Check user data consistency
  if (state.user) {
    // Validate trust points range
    if (state.user.trustPoints < 0 || state.user.trustPoints > 100) {
      issues.push(`Invalid trust points: ${state.user.trustPoints}`);
      fixes.push(() => {
        if (state.user) {
          state.user.trustPoints = Math.max(0, Math.min(100, state.user.trustPoints));
        }
      });
    }

    // Validate chat history references
    const chatThreadIds = state.chatThreads.map(thread => thread.id);
    const invalidChatRefs = state.user.chatHistory.filter(id => !chatThreadIds.includes(id));
    if (invalidChatRefs.length > 0) {
      issues.push(`Invalid chat thread references: ${invalidChatRefs.join(', ')}`);
      fixes.push(() => {
        if (state.user) {
          state.user.chatHistory = state.user.chatHistory.filter(id => chatThreadIds.includes(id));
        }
      });
    }
  }

  // Check event RSVP consistency
  state.events.forEach(event => {
    const invalidRSVPs = event.rsvpList.filter(userId => 
      !state.availableUsers?.some(user => user.id === userId) && 
      (!state.user || state.user.id !== userId)
    );
    
    if (invalidRSVPs.length > 0) {
      issues.push(`Event ${event.id} has invalid RSVP references: ${invalidRSVPs.join(', ')}`);
      fixes.push(() => {
        event.rsvpList = event.rsvpList.filter(userId => 
          state.availableUsers?.some(user => user.id === userId) || 
          (state.user && state.user.id === userId)
        );
      });
    }
  });

  // Check chat thread participant consistency
  state.chatThreads.forEach(thread => {
    const invalidParticipants = thread.participants.filter(participant => 
      !state.availableUsers?.some(user => user.id === participant.id) &&
      (!state.user || state.user.id !== participant.id)
    );
    
    if (invalidParticipants.length > 0) {
      issues.push(`Chat thread ${thread.id} has invalid participants`);
      fixes.push(() => {
        thread.participants = thread.participants.filter(participant => 
          state.availableUsers?.some(user => user.id === participant.id) ||
          (state.user && state.user.id === participant.id)
        );
      });
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
    fixes,
  };
};

/**
 * Apply data consistency fixes
 */
export const applyDataConsistencyFixes = (state: AppState): AppState => {
  const validation = validateDataConsistency(state);
  
  if (!validation.isValid) {
    console.warn('Data consistency issues found:', validation.issues);
    
    // Apply all fixes
    validation.fixes.forEach(fix => {
      try {
        fix();
      } catch (error) {
        console.error('Failed to apply data consistency fix:', error);
      }
    });
    
    console.log('Applied data consistency fixes');
  }
  
  return state;
};

/**
 * Get data migration status
 */
export const getDataMigrationStatus = (): {
  needsMigration: boolean;
  currentVersion: string;
  targetVersion: string;
} => {
  // For now, we don't have migrations, but this structure allows for future migrations
  return {
    needsMigration: false,
    currentVersion: '1.0.0',
    targetVersion: '1.0.0',
  };
};

/**
 * Clear all app data (for reset/logout)
 */
export const clearAllAppData = (): void => {
  try {
    // Clear localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('communitree_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
    
    // Clear sessionStorage
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const keysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('communitree_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => sessionStorage.removeItem(key));
    }
    
    console.log('All app data cleared successfully');
  } catch (error) {
    console.error('Failed to clear app data:', error);
  }
};

/**
 * Export app data for backup
 */
export const exportAppData = (): string => {
  try {
    const data: Record<string, any> = {};
    
    if (typeof window !== 'undefined' && window.localStorage) {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('communitree_')) {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    
    return JSON.stringify({
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data,
    }, null, 2);
  } catch (error) {
    console.error('Failed to export app data:', error);
    return '{}';
  }
};

/**
 * Import app data from backup
 */
export const importAppData = (backupData: string): boolean => {
  try {
    const parsed = JSON.parse(backupData);
    
    if (!parsed.data || typeof parsed.data !== 'object') {
      throw new Error('Invalid backup data format');
    }
    
    if (typeof window !== 'undefined' && window.localStorage) {
      Object.entries(parsed.data).forEach(([key, value]) => {
        if (key.startsWith('communitree_') && typeof value === 'string') {
          localStorage.setItem(key, value);
        }
      });
    }
    
    console.log('App data imported successfully');
    return true;
  } catch (error) {
    console.error('Failed to import app data:', error);
    return false;
  }
};
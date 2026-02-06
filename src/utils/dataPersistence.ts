/**
 * Data persistence layer for CommuniTree platform
 * Handles localStorage and sessionStorage operations with data consistency
 */

import { User, NGO, Event, ChatThread, AppState, TrackType } from '../types';

// Storage keys
const STORAGE_KEYS = {
  USER_DATA: 'communitree_user_data',
  LAST_TRACK: 'communitree_last_track',
  TRUST_POINTS: 'communitree_trust_points',
  CHAT_HISTORY: 'communitree_chat_history',
  USER_PREFERENCES: 'communitree_user_preferences',
  NGO_VERIFICATIONS: 'communitree_ngo_verifications',
  EVENT_RSVPS: 'communitree_event_rsvps',
  NOTIFICATIONS: 'communitree_notifications',
  // Session storage keys
  TEMP_FORM_DATA: 'communitree_temp_form_data',
  CURRENT_SESSION: 'communitree_current_session',
  MODAL_STATE: 'communitree_modal_state',
} as const;

/**
 * Check if localStorage is available
 */
const isLocalStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const test = '__localStorage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Check if sessionStorage is available
 */
const isSessionStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    const test = '__sessionStorage_test__';
    sessionStorage.setItem(test, test);
    sessionStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

/**
 * Safe JSON parse with fallback
 */
const safeJsonParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

/**
 * Safe JSON stringify
 */
const safeJsonStringify = (value: any): string => {
  try {
    return JSON.stringify(value);
  } catch {
    return '{}';
  }
};

// ============================================================================
// USER DATA PERSISTENCE
// ============================================================================

/**
 * Save user data to localStorage
 */
export const saveUserData = (user: User): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const userData = {
      ...user,
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USER_DATA, safeJsonStringify(userData));
  } catch (error) {
    console.warn('Failed to save user data:', error);
  }
};

/**
 * Load user data from localStorage
 */
export const loadUserData = (): User | null => {
  if (!isLocalStorageAvailable()) return null;
  
  try {
    const userData = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (!userData) return null;
    
    const parsed = safeJsonParse<any>(userData, null);
    if (!parsed || !parsed.id) return null;
    
    // Convert date strings back to Date objects
    return {
      ...parsed,
      createdAt: new Date(parsed.createdAt),
      updatedAt: new Date(parsed.updatedAt),
      eventHistory: parsed.eventHistory?.map((event: any) => ({
        ...event,
        timestamp: new Date(event.timestamp),
      })) || [],
    } as User;
  } catch (error) {
    console.warn('Failed to load user data:', error);
    return null;
  }
};

/**
 * Clear user data from localStorage
 */
export const clearUserData = (): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.TRUST_POINTS);
    localStorage.removeItem(STORAGE_KEYS.USER_PREFERENCES);
  } catch (error) {
    console.warn('Failed to clear user data:', error);
  }
};

// ============================================================================
// TRACK PREFERENCE PERSISTENCE
// ============================================================================

/**
 * Save last selected track
 */
export const saveLastTrack = (track: TrackType): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    localStorage.setItem(STORAGE_KEYS.LAST_TRACK, track);
  } catch (error) {
    console.warn('Failed to save last track:', error);
  }
};

/**
 * Load last selected track
 */
export const loadLastTrack = (): TrackType => {
  if (!isLocalStorageAvailable()) return 'impact';
  
  try {
    const track = localStorage.getItem(STORAGE_KEYS.LAST_TRACK);
    return (track as TrackType) || 'impact';
  } catch (error) {
    console.warn('Failed to load last track:', error);
    return 'impact';
  }
};

// ============================================================================
// TRUST POINTS PERSISTENCE
// ============================================================================

/**
 * Save trust points with timestamp
 */
export const saveTrustPoints = (userId: string, trustPoints: number): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const trustData = {
      userId,
      trustPoints,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.TRUST_POINTS, safeJsonStringify(trustData));
  } catch (error) {
    console.warn('Failed to save trust points:', error);
  }
};

/**
 * Load trust points for user
 */
export const loadTrustPoints = (userId: string): number | null => {
  if (!isLocalStorageAvailable()) return null;
  
  try {
    const trustData = localStorage.getItem(STORAGE_KEYS.TRUST_POINTS);
    if (!trustData) return null;
    
    const parsed = safeJsonParse<any>(trustData, null);
    if (!parsed || parsed.userId !== userId) return null;
    
    return parsed.trustPoints;
  } catch (error) {
    console.warn('Failed to load trust points:', error);
    return null;
  }
};

// ============================================================================
// CHAT HISTORY PERSISTENCE
// ============================================================================

/**
 * Save chat threads to localStorage
 */
export const saveChatHistory = (userId: string, chatThreads: ChatThread[]): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const chatData = {
      userId,
      threads: chatThreads.map(thread => ({
        ...thread,
        lastActivity: thread.lastActivity.toISOString(),
        createdAt: thread.createdAt.toISOString(),
        updatedAt: thread.updatedAt.toISOString(),
        messages: thread.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString(),
        })),
      })),
      lastSaved: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, safeJsonStringify(chatData));
  } catch (error) {
    console.warn('Failed to save chat history:', error);
  }
};

/**
 * Load chat history from localStorage
 */
export const loadChatHistory = (userId: string): ChatThread[] => {
  if (!isLocalStorageAvailable()) return [];
  
  try {
    const chatData = localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY);
    if (!chatData) return [];
    
    const parsed = safeJsonParse<any>(chatData, null);
    if (!parsed || parsed.userId !== userId) return [];
    
    // Convert date strings back to Date objects
    return parsed.threads.map((thread: any) => ({
      ...thread,
      lastActivity: new Date(thread.lastActivity),
      createdAt: new Date(thread.createdAt),
      updatedAt: new Date(thread.updatedAt),
      messages: thread.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }));
  } catch (error) {
    console.warn('Failed to load chat history:', error);
    return [];
  }
};

// ============================================================================
// USER PREFERENCES PERSISTENCE
// ============================================================================

/**
 * Save user preferences
 */
export const saveUserPreferences = (userId: string, preferences: any): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const prefData = {
      userId,
      preferences,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.USER_PREFERENCES, safeJsonStringify(prefData));
  } catch (error) {
    console.warn('Failed to save user preferences:', error);
  }
};

/**
 * Load user preferences
 */
export const loadUserPreferences = (userId: string): any => {
  if (!isLocalStorageAvailable()) return null;
  
  try {
    const prefData = localStorage.getItem(STORAGE_KEYS.USER_PREFERENCES);
    if (!prefData) return null;
    
    const parsed = safeJsonParse<any>(prefData, null);
    if (!parsed || parsed.userId !== userId) return null;
    
    return parsed.preferences;
  } catch (error) {
    console.warn('Failed to load user preferences:', error);
    return null;
  }
};

// ============================================================================
// NGO VERIFICATION PERSISTENCE
// ============================================================================

/**
 * Save NGO verification status
 */
export const saveNGOVerification = (ngoId: string, isVerified: boolean, darpanId?: string): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const verifications = loadNGOVerifications();
    verifications[ngoId] = {
      isVerified,
      darpanId,
      verifiedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.NGO_VERIFICATIONS, safeJsonStringify(verifications));
  } catch (error) {
    console.warn('Failed to save NGO verification:', error);
  }
};

/**
 * Load all NGO verifications
 */
export const loadNGOVerifications = (): Record<string, any> => {
  if (!isLocalStorageAvailable()) return {};
  
  try {
    const verifications = localStorage.getItem(STORAGE_KEYS.NGO_VERIFICATIONS);
    return safeJsonParse<Record<string, any>>(verifications, {});
  } catch (error) {
    console.warn('Failed to load NGO verifications:', error);
    return {};
  }
};

// ============================================================================
// EVENT RSVP PERSISTENCE
// ============================================================================

/**
 * Save event RSVP status
 */
export const saveEventRSVP = (userId: string, eventId: string, isRSVP: boolean): void => {
  if (!isLocalStorageAvailable()) return;
  
  try {
    const rsvps = loadEventRSVPs(userId);
    if (isRSVP) {
      rsvps[eventId] = {
        rsvpAt: new Date().toISOString(),
        status: 'confirmed',
      };
    } else {
      delete rsvps[eventId];
    }
    
    const rsvpData = {
      userId,
      rsvps,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEYS.EVENT_RSVPS, safeJsonStringify(rsvpData));
  } catch (error) {
    console.warn('Failed to save event RSVP:', error);
  }
};

/**
 * Load event RSVPs for user
 */
export const loadEventRSVPs = (userId: string): Record<string, any> => {
  if (!isLocalStorageAvailable()) return {};
  
  try {
    const rsvpData = localStorage.getItem(STORAGE_KEYS.EVENT_RSVPS);
    if (!rsvpData) return {};
    
    const parsed = safeJsonParse<any>(rsvpData, null);
    if (!parsed || parsed.userId !== userId) return {};
    
    return parsed.rsvps || {};
  } catch (error) {
    console.warn('Failed to load event RSVPs:', error);
    return {};
  }
};

// ============================================================================
// SESSION STORAGE (TEMPORARY DATA)
// ============================================================================

/**
 * Save temporary form data
 */
export const saveTempFormData = (formId: string, data: any): void => {
  if (!isSessionStorageAvailable()) return;
  
  try {
    const tempData = loadAllTempFormData();
    tempData[formId] = {
      data,
      savedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(STORAGE_KEYS.TEMP_FORM_DATA, safeJsonStringify(tempData));
  } catch (error) {
    console.warn('Failed to save temp form data:', error);
  }
};

/**
 * Load temporary form data
 */
export const loadTempFormData = (formId: string): any => {
  if (!isSessionStorageAvailable()) return null;
  
  try {
    const tempData = loadAllTempFormData();
    return tempData[formId]?.data || null;
  } catch (error) {
    console.warn('Failed to load temp form data:', error);
    return null;
  }
};

/**
 * Load all temporary form data
 */
const loadAllTempFormData = (): Record<string, any> => {
  if (!isSessionStorageAvailable()) return {};
  
  try {
    const tempData = sessionStorage.getItem(STORAGE_KEYS.TEMP_FORM_DATA);
    return safeJsonParse<Record<string, any>>(tempData, {});
  } catch (error) {
    return {};
  }
};

/**
 * Clear temporary form data
 */
export const clearTempFormData = (formId?: string): void => {
  if (!isSessionStorageAvailable()) return;
  
  try {
    if (formId) {
      const tempData = loadAllTempFormData();
      delete tempData[formId];
      sessionStorage.setItem(STORAGE_KEYS.TEMP_FORM_DATA, safeJsonStringify(tempData));
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.TEMP_FORM_DATA);
    }
  } catch (error) {
    console.warn('Failed to clear temp form data:', error);
  }
};

/**
 * Save current session state
 */
export const saveCurrentSession = (sessionData: any): void => {
  if (!isSessionStorageAvailable()) return;
  
  try {
    const session = {
      ...sessionData,
      lastActivity: new Date().toISOString(),
    };
    sessionStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, safeJsonStringify(session));
  } catch (error) {
    console.warn('Failed to save current session:', error);
  }
};

/**
 * Load current session state
 */
export const loadCurrentSession = (): any => {
  if (!isSessionStorageAvailable()) return null;
  
  try {
    const session = sessionStorage.getItem(STORAGE_KEYS.CURRENT_SESSION);
    return safeJsonParse<any>(session, null);
  } catch (error) {
    console.warn('Failed to load current session:', error);
    return null;
  }
};

/**
 * Clear current session
 */
export const clearCurrentSession = (): void => {
  if (!isSessionStorageAvailable()) return;
  
  try {
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION);
    sessionStorage.removeItem(STORAGE_KEYS.MODAL_STATE);
  } catch (error) {
    console.warn('Failed to clear current session:', error);
  }
};

// ============================================================================
// DATA CONSISTENCY UTILITIES
// ============================================================================

/**
 * Sync app state with persistent storage
 */
export const syncAppStateWithStorage = (state: AppState): AppState => {
  if (!state.user) return state;
  
  try {
    // Load persisted data for current user
    const persistedTrustPoints = loadTrustPoints(state.user.id);
    const persistedChatHistory = loadChatHistory(state.user.id);
    const persistedPreferences = loadUserPreferences(state.user.id);
    const persistedRSVPs = loadEventRSVPs(state.user.id);
    const persistedVerifications = loadNGOVerifications();
    
    // Update state with persisted data
    const updatedState: AppState = {
      ...state,
      user: {
        ...state.user,
        trustPoints: persistedTrustPoints ?? state.user.trustPoints,
        chatHistory: persistedChatHistory.map(thread => thread.id),
      },
      chatThreads: persistedChatHistory.length > 0 ? persistedChatHistory : state.chatThreads,
      preferences: persistedPreferences ? { ...state.preferences, ...persistedPreferences } : state.preferences,
      ngos: state.ngos.map(ngo => {
        const verification = persistedVerifications[ngo.id];
        return verification ? {
          ...ngo,
          isVerified: verification.isVerified,
          darpanId: verification.darpanId || ngo.darpanId,
        } : ngo;
      }),
      events: state.events.map(event => {
        const rsvp = persistedRSVPs[event.id];
        const userRSVPd = rsvp && state.user;
        return userRSVPd ? {
          ...event,
          rsvpList: event.rsvpList.includes(state.user!.id) 
            ? event.rsvpList 
            : [...event.rsvpList, state.user!.id],
        } : event;
      }),
    };
    
    return updatedState;
  } catch (error) {
    console.warn('Failed to sync app state with storage:', error);
    return state;
  }
};

/**
 * Persist current app state to storage
 */
export const persistAppState = (state: AppState): void => {
  if (!state.user) return;
  
  try {
    // Save user data
    saveUserData(state.user);
    
    // Save track preference
    saveLastTrack(state.currentTrack);
    
    // Save trust points
    saveTrustPoints(state.user.id, state.user.trustPoints);
    
    // Save chat history
    saveChatHistory(state.user.id, state.chatThreads);
    
    // Save user preferences
    saveUserPreferences(state.user.id, state.preferences);
    
    // Save current session
    saveCurrentSession({
      userId: state.user.id,
      currentTrack: state.currentTrack,
      activeModal: state.ui.activeModal,
      viewMode: state.ui.viewMode,
    });
  } catch (error) {
    console.warn('Failed to persist app state:', error);
  }
};

/**
 * Clear all persistent data (for logout)
 */
export const clearAllPersistentData = (): void => {
  try {
    clearUserData();
    clearCurrentSession();
    clearTempFormData();
  } catch (error) {
    console.warn('Failed to clear persistent data:', error);
  }
};

/**
 * Get storage usage statistics
 */
export const getStorageStats = (): { localStorage: number; sessionStorage: number } => {
  const stats = { localStorage: 0, sessionStorage: 0 };
  
  try {
    if (isLocalStorageAvailable()) {
      let localSize = 0;
      for (const key in localStorage) {
        if (localStorage.hasOwnProperty(key) && key.startsWith('communitree_')) {
          localSize += localStorage[key].length;
        }
      }
      stats.localStorage = localSize;
    }
    
    if (isSessionStorageAvailable()) {
      let sessionSize = 0;
      for (const key in sessionStorage) {
        if (sessionStorage.hasOwnProperty(key) && key.startsWith('communitree_')) {
          sessionSize += sessionStorage[key].length;
        }
      }
      stats.sessionStorage = sessionSize;
    }
  } catch (error) {
    console.warn('Failed to get storage stats:', error);
  }
  
  return stats;
};
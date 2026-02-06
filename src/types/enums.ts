/**
 * Enums and constants for CommuniTree platform
 */

// Trust Points System
export const TRUST_POINT_ACTIONS = {
  ORGANIZE_EVENT: 20,
  ATTEND_EVENT: 5,
  NO_SHOW: -10,
  VERIFY_IDENTITY: 10,
  REPORT_VIOLATION: -5,
  VOLUNTEER_ACTIVITY: 15,
  COMMUNITY_CONTRIBUTION: 10,
} as const;

export const TRUST_POINT_LIMITS = {
  MIN: 0,
  MAX: 100,
  INITIAL: 50,
  WARNING_THRESHOLD: 20,
} as const;

// Venue Safety Rating Colors
export const VENUE_RATING_COLORS = {
  green: '#10B981',   // Emerald-500
  yellow: '#F59E0B',  // Amber-500
  red: '#EF4444',     // Red-500
} as const;

// Track Theme Colors
export const TRACK_COLORS = {
  impact: {
    primary: '#065F46',    // Emerald-800
    secondary: '#10B981',  // Emerald-500
    light: '#D1FAE5',      // Emerald-100
  },
  grow: {
    primary: '#92400E',    // Amber-800
    secondary: '#F59E0B',  // Amber-500
    light: '#FEF3C7',      // Amber-100
  },
} as const;

// Validation Constants
export const VALIDATION_RULES = {
  DARPAN_ID_LENGTH: 5,
  MIN_PASSWORD_LENGTH: 8,
  MAX_MESSAGE_LENGTH: 500,
  MAX_EVENT_TITLE_LENGTH: 100,
  MAX_NGO_NAME_LENGTH: 100,
} as const;

// Time Constants
export const TIME_CONSTANTS = {
  CHAT_MESSAGE_TIMEOUT: 30000, // 30 seconds
  NOTIFICATION_TIMEOUT: 5000,  // 5 seconds
  SESSION_TIMEOUT: 3600000,    // 1 hour
} as const;

// API Endpoints (for future backend integration)
export const API_ENDPOINTS = {
  USERS: '/api/users',
  NGOS: '/api/ngos',
  EVENTS: '/api/events',
  CHAT: '/api/chat',
  VERIFY: '/api/verify',
} as const;
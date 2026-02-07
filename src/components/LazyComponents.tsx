/**
 * Lazy-loaded Components
 * 
 * Provides lazy-loaded versions of secondary features to improve
 * initial load performance. Components are loaded on-demand when needed.
 * 
 * @see Requirements 14.7
 */

import { lazy } from 'react';

/**
 * Lazy-loaded Chat Modal
 * Only loads when user opens chat functionality
 */
export const ChatModalLazy = lazy(() =>
  import('./ChatModal').then((module) => ({
    default: module.ChatModalContainer,
  }))
);

/**
 * Lazy-loaded User Profile
 * Only loads when user views their profile
 */
export const UserProfileLazy = lazy(() =>
  import('./UserProfile').then((module) => ({
    default: module.UserProfile,
  }))
);

/**
 * Lazy-loaded Profile Page
 * Only loads when user navigates to profile page
 */
export const ProfilePageLazy = lazy(() =>
  import('./ProfilePage').then((module) => ({
    default: module.ProfilePage,
  }))
);

/**
 * Lazy-loaded Verification Modal
 * Only loads when user opens verification dialog
 */
export const VerificationModalLazy = lazy(() =>
  import('./VerificationModal').then((module) => ({
    default: module.VerificationModal,
  }))
);

/**
 * Lazy-loaded RSVP Modal
 * Only loads when user opens RSVP dialog
 */
export const RSVPModalLazy = lazy(() =>
  import('./RSVPModal').then((module) => ({
    default: module.RSVPModal,
  }))
);

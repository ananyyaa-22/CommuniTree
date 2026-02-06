/**
 * Venue safety rating utilities for CommuniTree platform
 * Handles venue safety classification and color coding
 */

import { VenueType, VenueRating, Venue } from '../types';

/**
 * Calculate venue safety rating based on venue type
 * @param venue The venue to rate
 * @returns Safety rating (green/yellow/red)
 */
export const calculateVenueRating = (venue: Venue): VenueRating => {
  switch (venue.type) {
    case 'public':
      return 'green'; // Parks, libraries, community centers
    case 'commercial':
      return 'yellow'; // Cafes, studios, restaurants
    case 'private':
      return 'red'; // Private homes, unlisted venues
    default:
      return 'red'; // Default to most cautious rating
  }
};

/**
 * Get venue rating color for UI display
 * @param rating The venue safety rating
 * @returns Tailwind color class
 */
export const getVenueRatingColor = (rating: VenueRating): string => {
  switch (rating) {
    case 'green':
      return 'bg-green-500 text-white';
    case 'yellow':
      return 'bg-yellow-500 text-white';
    case 'red':
      return 'bg-red-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

/**
 * Get venue rating description
 * @param rating The venue safety rating
 * @returns Human-readable description
 */
export const getVenueRatingDescription = (rating: VenueRating): string => {
  switch (rating) {
    case 'green':
      return 'Safe - Public venue with good security';
    case 'yellow':
      return 'Moderate - Commercial venue, exercise normal caution';
    case 'red':
      return 'Caution - Private venue, meet with care';
    default:
      return 'Unknown safety level';
  }
};

/**
 * Get venue type description
 * @param type The venue type
 * @returns Human-readable description
 */
export const getVenueTypeDescription = (type: VenueType): string => {
  switch (type) {
    case 'public':
      return 'Public venue (parks, libraries, community centers)';
    case 'commercial':
      return 'Commercial venue (cafes, studios, restaurants)';
    case 'private':
      return 'Private venue (homes, private properties)';
    default:
      return 'Unknown venue type';
  }
};

/**
 * Check if venue is considered safe for events
 * @param rating The venue safety rating
 * @returns True if venue is considered safe (green or yellow)
 */
export const isVenueSafe = (rating: VenueRating): boolean => {
  return rating === 'green' || rating === 'yellow';
};

/**
 * Get venue rating badge text
 * @param rating The venue safety rating
 * @returns Badge text for display
 */
export const getVenueRatingBadge = (rating: VenueRating): string => {
  switch (rating) {
    case 'green':
      return 'Safe Venue';
    case 'yellow':
      return 'Moderate Risk';
    case 'red':
      return 'High Caution';
    default:
      return 'Unknown';
  }
};

/**
 * Create or update a venue with calculated safety rating
 * Ensures safety rating is always consistent with venue type
 * @param venueData Partial venue data
 * @returns Complete venue with calculated safety rating
 */
export const createVenueWithRating = (venueData: Omit<Venue, 'safetyRating'>): Venue => {
  const venue: Venue = {
    ...venueData,
    safetyRating: 'red', // Temporary, will be overridden
  };
  
  return {
    ...venue,
    safetyRating: calculateVenueRating(venue),
  };
};

/**
 * Update venue safety rating based on current venue type
 * Useful when venue type changes and rating needs to be recalculated
 * @param venue The venue to update
 * @returns Venue with updated safety rating
 */
export const updateVenueRating = (venue: Venue): Venue => {
  return {
    ...venue,
    safetyRating: calculateVenueRating(venue),
  };
};
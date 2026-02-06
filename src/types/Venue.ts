/**
 * Venue-related interfaces and types for CommuniTree platform
 */

export interface Venue {
  id: string;
  name: string;
  address: string;
  type: VenueType;
  safetyRating: VenueRating;
  coordinates: [number, number]; // [latitude, longitude]
  description?: string;
  amenities: string[];
  capacity?: number;
  accessibilityFeatures: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type VenueType = 
  | 'public'      // Parks, libraries, community centers
  | 'commercial'  // Cafes, studios, restaurants
  | 'private';    // Private homes, unlisted venues

export type VenueRating = 
  | 'green'   // Safe - public venues
  | 'yellow'  // Moderate - commercial venues
  | 'red';    // Caution - private venues
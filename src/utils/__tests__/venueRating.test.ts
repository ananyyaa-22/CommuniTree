/**
 * Unit tests for venue safety rating utilities
 * Tests the venue safety classification and color coding system
 */

import {
  calculateVenueRating,
  getVenueRatingColor,
  getVenueRatingDescription,
  getVenueTypeDescription,
  isVenueSafe,
  getVenueRatingBadge,
  createVenueWithRating,
  updateVenueRating,
} from '../venueRating';
import { Venue, VenueType, VenueRating } from '../../types';

// Mock venue data for testing
const createMockVenue = (type: VenueType): Venue => ({
  id: `venue_${type}_001`,
  name: `Test ${type} venue`,
  address: '123 Test Street',
  type,
  safetyRating: 'green', // Will be overridden by calculateVenueRating
  coordinates: [40.7128, -74.0060],
  description: `A test ${type} venue`,
  amenities: ['parking', 'wifi'],
  capacity: 50,
  accessibilityFeatures: ['wheelchair_accessible'],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
});

describe('calculateVenueRating', () => {
  it('should return green rating for public venues', () => {
    const publicVenue = createMockVenue('public');
    const rating = calculateVenueRating(publicVenue);
    expect(rating).toBe('green');
  });

  it('should return yellow rating for commercial venues', () => {
    const commercialVenue = createMockVenue('commercial');
    const rating = calculateVenueRating(commercialVenue);
    expect(rating).toBe('yellow');
  });

  it('should return red rating for private venues', () => {
    const privateVenue = createMockVenue('private');
    const rating = calculateVenueRating(privateVenue);
    expect(rating).toBe('red');
  });

  it('should return red rating for unknown venue types', () => {
    const unknownVenue = {
      ...createMockVenue('public'),
      type: 'unknown' as VenueType,
    };
    const rating = calculateVenueRating(unknownVenue);
    expect(rating).toBe('red');
  });

  it('should handle null or undefined venue gracefully', () => {
    // Test with minimal venue object
    const minimalVenue = {
      type: 'public' as VenueType,
    } as Venue;
    const rating = calculateVenueRating(minimalVenue);
    expect(rating).toBe('green');
  });
});

describe('getVenueRatingColor', () => {
  it('should return correct Tailwind classes for green rating', () => {
    const color = getVenueRatingColor('green');
    expect(color).toBe('bg-green-500 text-white');
  });

  it('should return correct Tailwind classes for yellow rating', () => {
    const color = getVenueRatingColor('yellow');
    expect(color).toBe('bg-yellow-500 text-white');
  });

  it('should return correct Tailwind classes for red rating', () => {
    const color = getVenueRatingColor('red');
    expect(color).toBe('bg-red-500 text-white');
  });

  it('should return default gray classes for unknown rating', () => {
    const color = getVenueRatingColor('unknown' as VenueRating);
    expect(color).toBe('bg-gray-500 text-white');
  });

  it('should handle all valid rating types', () => {
    const validRatings: VenueRating[] = ['green', 'yellow', 'red'];
    validRatings.forEach(rating => {
      const color = getVenueRatingColor(rating);
      expect(color).toContain('text-white');
      expect(color).toMatch(/^bg-(green|yellow|red)-500 text-white$/);
    });
  });
});

describe('getVenueRatingDescription', () => {
  it('should return appropriate description for green rating', () => {
    const description = getVenueRatingDescription('green');
    expect(description).toBe('Safe - Public venue with good security');
  });

  it('should return appropriate description for yellow rating', () => {
    const description = getVenueRatingDescription('yellow');
    expect(description).toBe('Moderate - Commercial venue, exercise normal caution');
  });

  it('should return appropriate description for red rating', () => {
    const description = getVenueRatingDescription('red');
    expect(description).toBe('Caution - Private venue, meet with care');
  });

  it('should return default description for unknown rating', () => {
    const description = getVenueRatingDescription('unknown' as VenueRating);
    expect(description).toBe('Unknown safety level');
  });

  it('should return non-empty descriptions for all valid ratings', () => {
    const validRatings: VenueRating[] = ['green', 'yellow', 'red'];
    validRatings.forEach(rating => {
      const description = getVenueRatingDescription(rating);
      expect(description).toBeTruthy();
      expect(description.length).toBeGreaterThan(0);
    });
  });
});

describe('getVenueTypeDescription', () => {
  it('should return appropriate description for public venues', () => {
    const description = getVenueTypeDescription('public');
    expect(description).toBe('Public venue (parks, libraries, community centers)');
  });

  it('should return appropriate description for commercial venues', () => {
    const description = getVenueTypeDescription('commercial');
    expect(description).toBe('Commercial venue (cafes, studios, restaurants)');
  });

  it('should return appropriate description for private venues', () => {
    const description = getVenueTypeDescription('private');
    expect(description).toBe('Private venue (homes, private properties)');
  });

  it('should return default description for unknown venue type', () => {
    const description = getVenueTypeDescription('unknown' as VenueType);
    expect(description).toBe('Unknown venue type');
  });
});

describe('isVenueSafe', () => {
  it('should return true for green rating', () => {
    expect(isVenueSafe('green')).toBe(true);
  });

  it('should return true for yellow rating', () => {
    expect(isVenueSafe('yellow')).toBe(true);
  });

  it('should return false for red rating', () => {
    expect(isVenueSafe('red')).toBe(false);
  });

  it('should return false for unknown rating', () => {
    expect(isVenueSafe('unknown' as VenueRating)).toBe(false);
  });

  it('should correctly classify safe vs unsafe venues', () => {
    const safeRatings: VenueRating[] = ['green', 'yellow'];
    const unsafeRatings: VenueRating[] = ['red'];

    safeRatings.forEach(rating => {
      expect(isVenueSafe(rating)).toBe(true);
    });

    unsafeRatings.forEach(rating => {
      expect(isVenueSafe(rating)).toBe(false);
    });
  });
});

describe('getVenueRatingBadge', () => {
  it('should return appropriate badge text for green rating', () => {
    const badge = getVenueRatingBadge('green');
    expect(badge).toBe('Safe Venue');
  });

  it('should return appropriate badge text for yellow rating', () => {
    const badge = getVenueRatingBadge('yellow');
    expect(badge).toBe('Moderate Risk');
  });

  it('should return appropriate badge text for red rating', () => {
    const badge = getVenueRatingBadge('red');
    expect(badge).toBe('High Caution');
  });

  it('should return default badge text for unknown rating', () => {
    const badge = getVenueRatingBadge('unknown' as VenueRating);
    expect(badge).toBe('Unknown');
  });

  it('should return concise badge text for all ratings', () => {
    const validRatings: VenueRating[] = ['green', 'yellow', 'red'];
    validRatings.forEach(rating => {
      const badge = getVenueRatingBadge(rating);
      expect(badge).toBeTruthy();
      expect(badge.length).toBeLessThan(20); // Keep badge text concise
    });
  });
});

describe('Integration tests', () => {
  it('should maintain consistency between venue type and calculated rating', () => {
    const venueTypes: VenueType[] = ['public', 'commercial', 'private'];
    const expectedRatings: VenueRating[] = ['green', 'yellow', 'red'];

    venueTypes.forEach((type, index) => {
      const venue = createMockVenue(type);
      const rating = calculateVenueRating(venue);
      expect(rating).toBe(expectedRatings[index]);
    });
  });

  it('should provide complete information chain for any venue', () => {
    const venue = createMockVenue('public');
    const rating = calculateVenueRating(venue);
    
    // All functions should work with the calculated rating
    const color = getVenueRatingColor(rating);
    const description = getVenueRatingDescription(rating);
    const badge = getVenueRatingBadge(rating);
    const safe = isVenueSafe(rating);
    const typeDescription = getVenueTypeDescription(venue.type);

    expect(color).toBeTruthy();
    expect(description).toBeTruthy();
    expect(badge).toBeTruthy();
    expect(typeof safe).toBe('boolean');
    expect(typeDescription).toBeTruthy();
  });

  it('should handle edge cases gracefully', () => {
    // Test with minimal venue data
    const minimalVenue = {
      type: 'public' as VenueType,
    } as Venue;

    expect(() => {
      const rating = calculateVenueRating(minimalVenue);
      getVenueRatingColor(rating);
      getVenueRatingDescription(rating);
      getVenueRatingBadge(rating);
      isVenueSafe(rating);
      getVenueTypeDescription(minimalVenue.type);
    }).not.toThrow();
  });
});

describe('Requirements validation', () => {
  // Requirement 5.3: Public venues should display green badges
  it('should satisfy requirement 5.3 - public venues get green badges', () => {
    const publicVenue = createMockVenue('public');
    const rating = calculateVenueRating(publicVenue);
    expect(rating).toBe('green');
    
    const color = getVenueRatingColor(rating);
    expect(color).toContain('bg-green-500');
  });

  // Requirement 5.4: Commercial venues should display yellow badges
  it('should satisfy requirement 5.4 - commercial venues get yellow badges', () => {
    const commercialVenue = createMockVenue('commercial');
    const rating = calculateVenueRating(commercialVenue);
    expect(rating).toBe('yellow');
    
    const color = getVenueRatingColor(rating);
    expect(color).toContain('bg-yellow-500');
  });

  // Requirement 5.5: Private venues should display red badges
  it('should satisfy requirement 5.5 - private venues get red badges', () => {
    const privateVenue = createMockVenue('private');
    const rating = calculateVenueRating(privateVenue);
    expect(rating).toBe('red');
    
    const color = getVenueRatingColor(rating);
    expect(color).toContain('bg-red-500');
  });

  // Requirement 5.2: Color-coded venue rating badges should be displayed
  it('should satisfy requirement 5.2 - color-coded badges are available', () => {
    const ratings: VenueRating[] = ['green', 'yellow', 'red'];
    const expectedColors = ['bg-green-500', 'bg-yellow-500', 'bg-red-500'];

    ratings.forEach((rating, index) => {
      const color = getVenueRatingColor(rating);
      expect(color).toContain(expectedColors[index]);
      expect(color).toContain('text-white'); // Ensure text is readable
    });
  });
});

describe('Helper functions', () => {
  describe('createVenueWithRating', () => {
    it('should create venue with calculated safety rating', () => {
      const venueData = {
        id: 'test_venue',
        name: 'Test Venue',
        address: 'Test Address',
        type: 'public' as const,
        coordinates: [0, 0] as [number, number],
        description: 'Test description',
        amenities: ['parking'],
        capacity: 100,
        accessibilityFeatures: ['wheelchair_accessible'],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const venue = createVenueWithRating(venueData);
      
      expect(venue.safetyRating).toBe('green'); // Public venues should be green
      expect(venue.id).toBe('test_venue');
      expect(venue.name).toBe('Test Venue');
      expect(venue.type).toBe('public');
    });

    it('should work with different venue types', () => {
      const venueTypes: Array<{ type: VenueType; expectedRating: VenueRating }> = [
        { type: 'public', expectedRating: 'green' },
        { type: 'commercial', expectedRating: 'yellow' },
        { type: 'private', expectedRating: 'red' },
      ];

      venueTypes.forEach(({ type, expectedRating }) => {
        const venueData = {
          id: `test_${type}`,
          name: `Test ${type} Venue`,
          address: 'Test Address',
          type,
          coordinates: [0, 0] as [number, number],
          description: 'Test description',
          amenities: [],
          accessibilityFeatures: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const venue = createVenueWithRating(venueData);
        expect(venue.safetyRating).toBe(expectedRating);
      });
    });
  });

  describe('updateVenueRating', () => {
    it('should update venue safety rating based on current type', () => {
      const venue = createMockVenue('public');
      // Manually set incorrect rating
      venue.safetyRating = 'red';
      
      const updatedVenue = updateVenueRating(venue);
      expect(updatedVenue.safetyRating).toBe('green'); // Should be corrected to green for public
    });

    it('should preserve all other venue properties', () => {
      const originalVenue = createMockVenue('commercial');
      const updatedVenue = updateVenueRating(originalVenue);
      
      expect(updatedVenue.id).toBe(originalVenue.id);
      expect(updatedVenue.name).toBe(originalVenue.name);
      expect(updatedVenue.address).toBe(originalVenue.address);
      expect(updatedVenue.type).toBe(originalVenue.type);
      expect(updatedVenue.coordinates).toEqual(originalVenue.coordinates);
      expect(updatedVenue.safetyRating).toBe('yellow'); // Should be updated to correct rating
    });

    it('should handle venue type changes correctly', () => {
      const venue = createMockVenue('public');
      expect(venue.safetyRating).toBe('green');
      
      // Change venue type
      const changedVenue = { ...venue, type: 'private' as const };
      const updatedVenue = updateVenueRating(changedVenue);
      
      expect(updatedVenue.safetyRating).toBe('red'); // Should update to red for private
    });
  });
});
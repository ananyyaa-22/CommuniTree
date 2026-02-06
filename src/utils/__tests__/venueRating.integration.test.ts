/**
 * Integration tests for venue safety rating system
 * Tests the complete workflow from venue creation to UI display
 * **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
 */

import { 
  calculateVenueRating,
  getVenueRatingColor,
  getVenueRatingBadge,
  getVenueRatingDescription,
  createVenueWithRating,
  updateVenueRating,
} from '../venueRating';
import { Venue, VenueType, VenueRating } from '../../types';

describe('Venue Safety Rating System - Integration Tests', () => {
  describe('Complete workflow validation', () => {
    it('**Validates: Requirements 5.2, 5.3, 5.4, 5.5** - should work end-to-end for all venue types', () => {
      const venueTypes: Array<{
        type: VenueType;
        expectedRating: VenueRating;
        expectedColorClass: string;
        expectedBadge: string;
      }> = [
        {
          type: 'public',
          expectedRating: 'green',
          expectedColorClass: 'bg-green-500',
          expectedBadge: 'Safe Venue',
        },
        {
          type: 'commercial',
          expectedRating: 'yellow',
          expectedColorClass: 'bg-yellow-500',
          expectedBadge: 'Moderate Risk',
        },
        {
          type: 'private',
          expectedRating: 'red',
          expectedColorClass: 'bg-red-500',
          expectedBadge: 'High Caution',
        },
      ];

      venueTypes.forEach(({ type, expectedRating, expectedColorClass, expectedBadge }) => {
        // Step 1: Create venue with calculated rating
        const venue = createVenueWithRating({
          id: `venue_${type}`,
          name: `Test ${type} Venue`,
          address: '123 Test Street',
          type,
          coordinates: [40.7128, -74.0060],
          description: `A ${type} venue for testing`,
          amenities: ['parking'],
          accessibilityFeatures: ['wheelchair_accessible'],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Step 2: Verify rating calculation
        expect(venue.safetyRating).toBe(expectedRating);
        expect(calculateVenueRating(venue)).toBe(expectedRating);

        // Step 3: Verify UI display functions
        const color = getVenueRatingColor(venue.safetyRating);
        const badge = getVenueRatingBadge(venue.safetyRating);
        const description = getVenueRatingDescription(venue.safetyRating);

        expect(color).toContain(expectedColorClass);
        expect(color).toContain('text-white');
        expect(badge).toBe(expectedBadge);
        expect(description).toBeTruthy();
        expect(description.length).toBeGreaterThan(0);
      });
    });

    it('should maintain consistency when venue type changes', () => {
      // Start with a public venue
      let venue = createVenueWithRating({
        id: 'venue_changeable',
        name: 'Changeable Venue',
        address: '123 Change Street',
        type: 'public',
        coordinates: [40.7128, -74.0060],
        amenities: [],
        accessibilityFeatures: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(venue.safetyRating).toBe('green');
      expect(getVenueRatingBadge(venue.safetyRating)).toBe('Safe Venue');

      // Change to commercial
      venue = updateVenueRating({ ...venue, type: 'commercial' });
      expect(venue.safetyRating).toBe('yellow');
      expect(getVenueRatingBadge(venue.safetyRating)).toBe('Moderate Risk');

      // Change to private
      venue = updateVenueRating({ ...venue, type: 'private' });
      expect(venue.safetyRating).toBe('red');
      expect(getVenueRatingBadge(venue.safetyRating)).toBe('High Caution');
    });

    it('should provide complete UI information for EventCard integration', () => {
      const venue = createVenueWithRating({
        id: 'venue_ui_test',
        name: 'UI Test Venue',
        address: '123 UI Street',
        type: 'commercial',
        coordinates: [40.7128, -74.0060],
        amenities: ['wifi', 'parking'],
        accessibilityFeatures: ['wheelchair_accessible'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Simulate EventCard usage
      const safetyRating = venue.safetyRating;
      const colorClasses = getVenueRatingColor(safetyRating);
      const badgeText = getVenueRatingBadge(safetyRating);
      const description = getVenueRatingDescription(safetyRating);

      // Verify all information is available for UI
      expect(safetyRating).toBe('yellow');
      expect(colorClasses).toBe('bg-yellow-500 text-white');
      expect(badgeText).toBe('Moderate Risk');
      expect(description).toBe('Moderate - Commercial venue, exercise normal caution');

      // Verify classes are valid Tailwind CSS
      expect(colorClasses.split(' ')).toEqual(['bg-yellow-500', 'text-white']);
    });
  });

  describe('Data consistency validation', () => {
    it('should ensure all venues in initial state have correct ratings', () => {
      // Test different venue configurations that might appear in initial state
      const testVenues = [
        { type: 'public' as const, name: 'Community Center' },
        { type: 'public' as const, name: 'Library' },
        { type: 'commercial' as const, name: 'Coffee Shop' },
        { type: 'commercial' as const, name: 'Art Studio' },
        { type: 'private' as const, name: 'Private Home' },
      ];

      testVenues.forEach((venueData, index) => {
        const venue = createVenueWithRating({
          id: `venue_consistency_${index}`,
          name: venueData.name,
          address: `${index} Test Street`,
          type: venueData.type,
          coordinates: [40.7128 + index, -74.0060 + index],
          amenities: [],
          accessibilityFeatures: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        const expectedRating = calculateVenueRating(venue);
        expect(venue.safetyRating).toBe(expectedRating);

        // Verify rating matches type
        if (venueData.type === 'public') {
          expect(venue.safetyRating).toBe('green');
        } else if (venueData.type === 'commercial') {
          expect(venue.safetyRating).toBe('yellow');
        } else if (venueData.type === 'private') {
          expect(venue.safetyRating).toBe('red');
        }
      });
    });

    it('should handle venue updates without breaking consistency', () => {
      const originalVenue = createVenueWithRating({
        id: 'venue_update_test',
        name: 'Update Test Venue',
        address: '123 Update Street',
        type: 'public',
        coordinates: [40.7128, -74.0060],
        amenities: ['parking'],
        accessibilityFeatures: ['wheelchair_accessible'],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Update various properties
      const updatedVenue = {
        ...originalVenue,
        name: 'Updated Venue Name',
        address: '456 New Address',
        amenities: ['parking', 'wifi', 'restrooms'],
        updatedAt: new Date(),
      };

      // Rating should remain consistent
      const reCalculatedVenue = updateVenueRating(updatedVenue);
      expect(reCalculatedVenue.safetyRating).toBe('green');
      expect(reCalculatedVenue.name).toBe('Updated Venue Name');
      expect(reCalculatedVenue.address).toBe('456 New Address');
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle malformed venue data gracefully', () => {
      // Test with minimal required data
      const minimalVenue = createVenueWithRating({
        id: 'minimal',
        name: 'Minimal Venue',
        address: 'Address',
        type: 'public',
        coordinates: [0, 0],
        amenities: [],
        accessibilityFeatures: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(minimalVenue.safetyRating).toBe('green');
      expect(() => {
        getVenueRatingColor(minimalVenue.safetyRating);
        getVenueRatingBadge(minimalVenue.safetyRating);
        getVenueRatingDescription(minimalVenue.safetyRating);
      }).not.toThrow();
    });

    it('should provide fallback behavior for unknown venue types', () => {
      // This tests the default case in calculateVenueRating
      const unknownVenue = {
        id: 'unknown',
        name: 'Unknown Venue',
        address: 'Unknown Address',
        type: 'unknown' as VenueType,
        coordinates: [0, 0] as [number, number],
        amenities: [],
        accessibilityFeatures: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const rating = calculateVenueRating(unknownVenue as Venue);
      expect(rating).toBe('red'); // Should default to most cautious

      // UI functions should still work
      expect(() => {
        getVenueRatingColor(rating);
        getVenueRatingBadge(rating);
        getVenueRatingDescription(rating);
      }).not.toThrow();
    });
  });

  describe('Performance and scalability', () => {
    it('should handle large numbers of venues efficiently', () => {
      const startTime = Date.now();
      const venues: Venue[] = [];

      // Create 1000 venues
      for (let i = 0; i < 1000; i++) {
        const type: VenueType = i % 3 === 0 ? 'public' : i % 3 === 1 ? 'commercial' : 'private';
        const venue = createVenueWithRating({
          id: `venue_perf_${i}`,
          name: `Performance Test Venue ${i}`,
          address: `${i} Performance Street`,
          type,
          coordinates: [40.7128 + (i * 0.001), -74.0060 + (i * 0.001)],
          amenities: [],
          accessibilityFeatures: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        venues.push(venue);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
      expect(venues).toHaveLength(1000);

      // Verify all venues have correct ratings
      venues.forEach(venue => {
        expect(['green', 'yellow', 'red']).toContain(venue.safetyRating);
        expect(venue.safetyRating).toBe(calculateVenueRating(venue));
      });
    });
  });
});
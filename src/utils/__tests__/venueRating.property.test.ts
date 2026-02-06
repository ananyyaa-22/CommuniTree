/**
 * Property-based tests for venue safety rating system
 * Tests universal properties that should hold across all valid inputs
 * **Validates: Requirements 5.2, 5.3, 5.4, 5.5**
 */

import * as fc from 'fast-check';
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

// Generators for property-based testing
const venueTypeArbitrary = fc.constantFrom('public', 'commercial', 'private');
const venueRatingArbitrary = fc.constantFrom('green', 'yellow', 'red');

const venueArbitrary = fc.record({
  id: fc.string({ minLength: 1 }),
  name: fc.string({ minLength: 1 }),
  address: fc.string({ minLength: 1 }),
  type: venueTypeArbitrary,
  safetyRating: venueRatingArbitrary,
  coordinates: fc.tuple(fc.float({ min: -90, max: 90 }), fc.float({ min: -180, max: 180 })),
  description: fc.option(fc.string()),
  amenities: fc.array(fc.string()),
  capacity: fc.option(fc.integer({ min: 1, max: 10000 })),
  accessibilityFeatures: fc.array(fc.string()),
  createdAt: fc.date(),
  updatedAt: fc.date(),
}) as fc.Arbitrary<Venue>;

describe('Venue Rating System - Property Tests', () => {
  describe('calculateVenueRating properties', () => {
    it('**Validates: Requirements 5.3, 5.4, 5.5** - should always return a valid rating for any venue', () => {
      fc.assert(
        fc.property(venueArbitrary, (venue) => {
          const rating = calculateVenueRating(venue);
          const validRatings: VenueRating[] = ['green', 'yellow', 'red'];
          expect(validRatings).toContain(rating);
        })
      );
    });

    it('**Validates: Requirements 5.3** - should always return green for public venues', () => {
      fc.assert(
        fc.property(venueArbitrary, (venue) => {
          const publicVenue = { ...venue, type: 'public' as VenueType };
          const rating = calculateVenueRating(publicVenue);
          expect(rating).toBe('green');
        })
      );
    });

    it('**Validates: Requirements 5.4** - should always return yellow for commercial venues', () => {
      fc.assert(
        fc.property(venueArbitrary, (venue) => {
          const commercialVenue = { ...venue, type: 'commercial' as VenueType };
          const rating = calculateVenueRating(commercialVenue);
          expect(rating).toBe('yellow');
        })
      );
    });

    it('**Validates: Requirements 5.5** - should always return red for private venues', () => {
      fc.assert(
        fc.property(venueArbitrary, (venue) => {
          const privateVenue = { ...venue, type: 'private' as VenueType };
          const rating = calculateVenueRating(privateVenue);
          expect(rating).toBe('red');
        })
      );
    });

    it('should be deterministic - same venue should always produce same rating', () => {
      fc.assert(
        fc.property(venueArbitrary, (venue) => {
          const rating1 = calculateVenueRating(venue);
          const rating2 = calculateVenueRating(venue);
          expect(rating1).toBe(rating2);
        })
      );
    });

    it('should only depend on venue type, not other properties', () => {
      fc.assert(
        fc.property(
          venueTypeArbitrary,
          fc.string(),
          fc.string(),
          fc.array(fc.string()),
          (type, name, address, amenities) => {
            const venue1: Venue = {
              id: 'test1',
              name: name,
              address: address,
              type: type,
              safetyRating: 'green',
              coordinates: [0, 0],
              amenities: amenities,
              accessibilityFeatures: [],
              createdAt: new Date(),
              updatedAt: new Date(),
            };

            const venue2: Venue = {
              id: 'test2',
              name: 'Different Name',
              address: 'Different Address',
              type: type, // Same type
              safetyRating: 'red',
              coordinates: [45, 90],
              amenities: ['different', 'amenities'],
              accessibilityFeatures: ['wheelchair'],
              createdAt: new Date('2020-01-01'),
              updatedAt: new Date('2023-01-01'),
            };

            const rating1 = calculateVenueRating(venue1);
            const rating2 = calculateVenueRating(venue2);
            expect(rating1).toBe(rating2);
          }
        )
      );
    });
  });

  describe('getVenueRatingColor properties', () => {
    it('**Validates: Requirements 5.2** - should always return valid Tailwind CSS classes', () => {
      fc.assert(
        fc.property(venueRatingArbitrary, (rating) => {
          const color = getVenueRatingColor(rating);
          
          // Should contain background color class
          expect(color).toMatch(/bg-(green|yellow|red|gray)-500/);
          
          // Should contain text color for readability
          expect(color).toContain('text-white');
          
          // Should be a valid CSS class string
          expect(typeof color).toBe('string');
          expect(color.length).toBeGreaterThan(0);
        })
      );
    });

    it('should be consistent - same rating should always produce same color', () => {
      fc.assert(
        fc.property(venueRatingArbitrary, (rating) => {
          const color1 = getVenueRatingColor(rating);
          const color2 = getVenueRatingColor(rating);
          expect(color1).toBe(color2);
        })
      );
    });

    it('should map ratings to expected color patterns', () => {
      fc.assert(
        fc.property(venueRatingArbitrary, (rating) => {
          const color = getVenueRatingColor(rating);
          
          switch (rating) {
            case 'green':
              expect(color).toContain('bg-green-500');
              break;
            case 'yellow':
              expect(color).toContain('bg-yellow-500');
              break;
            case 'red':
              expect(color).toContain('bg-red-500');
              break;
          }
        })
      );
    });
  });

  describe('getVenueRatingDescription properties', () => {
    it('should always return non-empty, meaningful descriptions', () => {
      fc.assert(
        fc.property(venueRatingArbitrary, (rating) => {
          const description = getVenueRatingDescription(rating);
          
          expect(typeof description).toBe('string');
          expect(description.length).toBeGreaterThan(0);
          expect(description.trim()).toBe(description); // No leading/trailing whitespace
        })
      );
    });

    it('should provide safety-related information in descriptions', () => {
      fc.assert(
        fc.property(venueRatingArbitrary, (rating) => {
          const description = getVenueRatingDescription(rating);
          const lowerDescription = description.toLowerCase();
          
          // Should contain safety-related keywords
          const safetyKeywords = ['safe', 'caution', 'moderate', 'security', 'venue', 'risk'];
          const containsSafetyKeyword = safetyKeywords.some(keyword => 
            lowerDescription.includes(keyword)
          );
          
          expect(containsSafetyKeyword).toBe(true);
        })
      );
    });
  });

  describe('isVenueSafe properties', () => {
    it('should correctly classify venue safety based on rating', () => {
      fc.assert(
        fc.property(venueRatingArbitrary, (rating) => {
          const safe = isVenueSafe(rating);
          
          expect(typeof safe).toBe('boolean');
          
          // Green and yellow should be considered safe, red should not
          if (rating === 'green' || rating === 'yellow') {
            expect(safe).toBe(true);
          } else if (rating === 'red') {
            expect(safe).toBe(false);
          }
        })
      );
    });

    it('should be consistent with safety expectations', () => {
      fc.assert(
        fc.property(venueRatingArbitrary, (rating) => {
          const safe = isVenueSafe(rating);
          const description = getVenueRatingDescription(rating);
          
          // If marked as safe, description should not contain high-risk language
          if (safe) {
            const lowerDescription = description.toLowerCase();
            expect(lowerDescription).not.toContain('high caution');
            expect(lowerDescription).not.toContain('meet with care');
          }
        })
      );
    });
  });

  describe('getVenueRatingBadge properties', () => {
    it('should always return concise, displayable badge text', () => {
      fc.assert(
        fc.property(venueRatingArbitrary, (rating) => {
          const badge = getVenueRatingBadge(rating);
          
          expect(typeof badge).toBe('string');
          expect(badge.length).toBeGreaterThan(0);
          expect(badge.length).toBeLessThan(20); // Keep badges concise for UI
          expect(badge.trim()).toBe(badge); // No leading/trailing whitespace
        })
      );
    });

    it('should provide distinct badges for different ratings', () => {
      const ratings: VenueRating[] = ['green', 'yellow', 'red'];
      const badges = ratings.map(rating => getVenueRatingBadge(rating));
      
      // All badges should be unique
      const uniqueBadges = new Set(badges);
      expect(uniqueBadges.size).toBe(badges.length);
    });
  });

  describe('Integration properties', () => {
    it('**Validates: Requirements 5.2, 5.3, 5.4, 5.5** - complete venue rating workflow should work for any venue', () => {
      fc.assert(
        fc.property(venueArbitrary, (venue) => {
          // Complete workflow should not throw errors
          expect(() => {
            const rating = calculateVenueRating(venue);
            const color = getVenueRatingColor(rating);
            const description = getVenueRatingDescription(rating);
            const badge = getVenueRatingBadge(rating);
            const safe = isVenueSafe(rating);
            const typeDescription = getVenueTypeDescription(venue.type);
            
            // All results should be valid
            expect(['green', 'yellow', 'red']).toContain(rating);
            expect(typeof color).toBe('string');
            expect(typeof description).toBe('string');
            expect(typeof badge).toBe('string');
            expect(typeof safe).toBe('boolean');
            expect(typeof typeDescription).toBe('string');
          }).not.toThrow();
        })
      );
    });

    it('should maintain logical consistency across all functions', () => {
      fc.assert(
        fc.property(venueArbitrary, (venue) => {
          const rating = calculateVenueRating(venue);
          const safe = isVenueSafe(rating);
          const color = getVenueRatingColor(rating);
          
          // Logical consistency checks
          if (rating === 'green') {
            expect(safe).toBe(true);
            expect(color).toContain('bg-green-500');
          } else if (rating === 'yellow') {
            expect(safe).toBe(true);
            expect(color).toContain('bg-yellow-500');
          } else if (rating === 'red') {
            expect(safe).toBe(false);
            expect(color).toContain('bg-red-500');
          }
        })
      );
    });

    it('should handle venue type to rating mapping correctly', () => {
      fc.assert(
        fc.property(venueTypeArbitrary, (type) => {
          const venue: Venue = {
            id: 'test',
            name: 'Test Venue',
            address: 'Test Address',
            type: type,
            safetyRating: 'green', // This will be overridden by calculateVenueRating
            coordinates: [0, 0],
            amenities: [],
            accessibilityFeatures: [],
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          const rating = calculateVenueRating(venue);
          
          // Verify the mapping is correct
          const expectedMapping: Record<VenueType, VenueRating> = {
            'public': 'green',
            'commercial': 'yellow',
            'private': 'red',
          };
          
          expect(rating).toBe(expectedMapping[type]);
        })
      );
    });
  });

  describe('Error handling properties', () => {
    it('should handle invalid or edge case inputs gracefully', () => {
      // Test with minimal venue object
      const minimalVenue = {
        type: 'public' as VenueType,
      } as Venue;
      
      expect(() => {
        const rating = calculateVenueRating(minimalVenue);
        expect(['green', 'yellow', 'red']).toContain(rating);
      }).not.toThrow();
    });

    it('should default to safe behavior for unknown inputs', () => {
      // When given unknown venue type, should default to most cautious (red)
      const unknownVenue = {
        type: 'unknown' as VenueType,
      } as Venue;
      
      const rating = calculateVenueRating(unknownVenue);
      expect(rating).toBe('red'); // Most cautious default
    });
  });

  describe('Helper function properties', () => {
    it('createVenueWithRating should always produce consistent ratings', () => {
      fc.assert(
        fc.property(
          fc.record({
            id: fc.string({ minLength: 1 }),
            name: fc.string({ minLength: 1 }),
            address: fc.string({ minLength: 1 }),
            type: venueTypeArbitrary,
            coordinates: fc.tuple(fc.float({ min: -90, max: 90 }), fc.float({ min: -180, max: 180 })),
            description: fc.option(fc.string()),
            amenities: fc.array(fc.string()),
            capacity: fc.option(fc.integer({ min: 1, max: 10000 })),
            accessibilityFeatures: fc.array(fc.string()),
            createdAt: fc.date(),
            updatedAt: fc.date(),
          }),
          (venueData) => {
            const venue = createVenueWithRating(venueData);
            
            // Rating should match the venue type
            const expectedRating = calculateVenueRating({ type: venueData.type } as Venue);
            expect(venue.safetyRating).toBe(expectedRating);
            
            // All other properties should be preserved
            expect(venue.id).toBe(venueData.id);
            expect(venue.name).toBe(venueData.name);
            expect(venue.type).toBe(venueData.type);
          }
        )
      );
    });

    it('updateVenueRating should always produce correct ratings', () => {
      fc.assert(
        fc.property(venueArbitrary, (venue) => {
          const updatedVenue = updateVenueRating(venue);
          
          // Rating should match the venue type
          const expectedRating = calculateVenueRating(venue);
          expect(updatedVenue.safetyRating).toBe(expectedRating);
          
          // All other properties should be preserved
          expect(updatedVenue.id).toBe(venue.id);
          expect(updatedVenue.name).toBe(venue.name);
          expect(updatedVenue.type).toBe(venue.type);
          expect(updatedVenue.address).toBe(venue.address);
        })
      );
    });

    it('helper functions should be idempotent', () => {
      fc.assert(
        fc.property(venueArbitrary, (venue) => {
          // Multiple applications should produce same result
          const updated1 = updateVenueRating(venue);
          const updated2 = updateVenueRating(updated1);
          
          expect(updated1.safetyRating).toBe(updated2.safetyRating);
          expect(updated1).toEqual(updated2);
        })
      );
    });
  });
});
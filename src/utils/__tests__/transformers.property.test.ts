/**
 * Property-based tests for data transformation utilities
 * Tests universal properties that should hold across all valid inputs
 * **Validates: Requirements 4.2**
 */

import * as fc from 'fast-check'
import {
  dbUserToUser,
  userToDbUser,
  dbEventToEvent,
  eventToDbEvent,
  dbVenueToVenue,
  venueToDbVenue,
} from '../transformers'
import type { DbUser, DbEvent, DbVenue } from '../../types/database.types'
import type { User, Event, Venue, UpdateUserInput, UpdateEventInput, UpdateVenueInput } from '../../types/models'

// Generators for property-based testing
const verificationStatusArbitrary = fc.constantFrom('unverified', 'verified')
const trackTypeArbitrary = fc.constantFrom('impact', 'grow')
const organizerTypeArbitrary = fc.constantFrom('user', 'ngo')
const safetyRatingArbitrary = fc.constantFrom('green', 'yellow', 'red')

// ISO date string generator
const isoDateStringArbitrary = fc.date().map(date => date.toISOString())

// Database user generator
const dbUserArbitrary = fc.record({
  id: fc.uuid(),
  email: fc.emailAddress(),
  display_name: fc.string({ minLength: 1, maxLength: 50 }),
  trust_points: fc.integer({ min: 0, max: 100 }),
  verification_status: verificationStatusArbitrary,
  created_at: isoDateStringArbitrary,
  updated_at: isoDateStringArbitrary,
}) as fc.Arbitrary<DbUser>

// Database event generator (without venue)
const dbEventArbitrary = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 100 }),
  description: fc.option(fc.string({ maxLength: 500 })),
  event_type: fc.string({ minLength: 1, maxLength: 50 }),
  track_type: trackTypeArbitrary,
  organizer_id: fc.uuid(),
  organizer_type: organizerTypeArbitrary,
  venue_id: fc.option(fc.uuid()),
  start_time: isoDateStringArbitrary,
  end_time: isoDateStringArbitrary,
  max_participants: fc.option(fc.integer({ min: 1, max: 1000 })),
  created_at: isoDateStringArbitrary,
  updated_at: isoDateStringArbitrary,
}) as fc.Arbitrary<DbEvent>

// Database venue generator
const dbVenueArbitrary = fc.record({
  id: fc.uuid(),
  name: fc.string({ minLength: 1, maxLength: 100 }),
  address: fc.string({ minLength: 1, maxLength: 200 }),
  latitude: fc.option(fc.float({ min: -90, max: 90 })),
  longitude: fc.option(fc.float({ min: -180, max: 180 })),
  safety_rating: safetyRatingArbitrary,
  safety_notes: fc.option(fc.string({ maxLength: 500 })),
  created_at: isoDateStringArbitrary,
  updated_at: isoDateStringArbitrary,
}) as fc.Arbitrary<DbVenue>

// Application user update generator
const updateUserInputArbitrary = fc.record({
  email: fc.option(fc.emailAddress()),
  displayName: fc.option(fc.string({ minLength: 1, maxLength: 50 })),
  trustPoints: fc.option(fc.integer({ min: 0, max: 100 })),
  verificationStatus: fc.option(verificationStatusArbitrary),
}, { requiredKeys: [] }) as fc.Arbitrary<UpdateUserInput>

// Application event update generator
const updateEventInputArbitrary = fc.record({
  title: fc.option(fc.string({ minLength: 1, maxLength: 100 }), { nil: undefined }),
  description: fc.option(fc.string({ maxLength: 500 })),
  eventType: fc.option(fc.string({ minLength: 1, maxLength: 50 }), { nil: undefined }),
  trackType: fc.option(trackTypeArbitrary, { nil: undefined }),
  organizerId: fc.option(fc.uuid(), { nil: undefined }),
  organizerType: fc.option(organizerTypeArbitrary, { nil: undefined }),
  venueId: fc.option(fc.uuid()),
  startTime: fc.option(fc.date(), { nil: undefined }),
  endTime: fc.option(fc.date(), { nil: undefined }),
  maxParticipants: fc.option(fc.integer({ min: 1, max: 1000 })),
}, { requiredKeys: [] }) as fc.Arbitrary<UpdateEventInput>

// Application venue update generator
const updateVenueInputArbitrary = fc.record({
  name: fc.option(fc.string({ minLength: 1, maxLength: 100 })),
  address: fc.option(fc.string({ minLength: 1, maxLength: 200 })),
  latitude: fc.option(fc.float({ min: -90, max: 90 })),
  longitude: fc.option(fc.float({ min: -180, max: 180 })),
  safetyRating: fc.option(safetyRatingArbitrary),
  safetyNotes: fc.option(fc.string({ maxLength: 500 })),
}, { requiredKeys: [] }) as fc.Arbitrary<UpdateVenueInput>

describe('Data Transformation - Property Tests', () => {
  describe('Property 31: Data Transformation Round-Trip (User)', () => {
    it('**Validates: Requirements 4.2** - should preserve all user data through db -> app transformation', () => {
      fc.assert(
        fc.property(dbUserArbitrary, (dbUser) => {
          // Transform db -> app
          const appUser = dbUserToUser(dbUser)
          
          // Verify all fields are correctly transformed
          expect(appUser.id).toBe(dbUser.id)
          expect(appUser.email).toBe(dbUser.email)
          expect(appUser.displayName).toBe(dbUser.display_name)
          expect(appUser.trustPoints).toBe(dbUser.trust_points)
          expect(appUser.verificationStatus).toBe(dbUser.verification_status)
          
          // Verify dates are converted to Date objects
          expect(appUser.createdAt).toBeInstanceOf(Date)
          expect(appUser.updatedAt).toBeInstanceOf(Date)
          expect(appUser.createdAt.toISOString()).toBe(dbUser.created_at)
          expect(appUser.updatedAt.toISOString()).toBe(dbUser.updated_at)
        })
      )
    })

    it('**Validates: Requirements 4.2** - should handle partial user updates correctly', () => {
      fc.assert(
        fc.property(updateUserInputArbitrary, (updateInput) => {
          // Transform app -> db
          const dbUpdate = userToDbUser(updateInput)
          
          // Verify only defined fields are included
          if (updateInput.email !== undefined) {
            expect(dbUpdate.email).toBe(updateInput.email)
          } else {
            expect(dbUpdate.email).toBeUndefined()
          }
          
          if (updateInput.displayName !== undefined) {
            expect(dbUpdate.display_name).toBe(updateInput.displayName)
          } else {
            expect(dbUpdate.display_name).toBeUndefined()
          }
          
          if (updateInput.trustPoints !== undefined) {
            expect(dbUpdate.trust_points).toBe(updateInput.trustPoints)
          } else {
            expect(dbUpdate.trust_points).toBeUndefined()
          }
          
          if (updateInput.verificationStatus !== undefined) {
            expect(dbUpdate.verification_status).toBe(updateInput.verificationStatus)
          } else {
            expect(dbUpdate.verification_status).toBeUndefined()
          }
        })
      )
    })

    it('**Validates: Requirements 4.2** - should be deterministic for user transformations', () => {
      fc.assert(
        fc.property(dbUserArbitrary, (dbUser) => {
          const appUser1 = dbUserToUser(dbUser)
          const appUser2 = dbUserToUser(dbUser)
          
          // Same input should produce identical output
          expect(appUser1).toEqual(appUser2)
        })
      )
    })
  })

  describe('Property 32: Data Transformation Round-Trip (Event)', () => {
    it('**Validates: Requirements 4.2** - should preserve all event data through db -> app transformation', () => {
      fc.assert(
        fc.property(dbEventArbitrary, (dbEvent) => {
          // Transform db -> app
          const appEvent = dbEventToEvent(dbEvent)
          
          // Verify all fields are correctly transformed
          expect(appEvent.id).toBe(dbEvent.id)
          expect(appEvent.title).toBe(dbEvent.title)
          expect(appEvent.description).toBe(dbEvent.description)
          expect(appEvent.eventType).toBe(dbEvent.event_type)
          expect(appEvent.trackType).toBe(dbEvent.track_type)
          expect(appEvent.organizerId).toBe(dbEvent.organizer_id)
          expect(appEvent.organizerType).toBe(dbEvent.organizer_type)
          expect(appEvent.venueId).toBe(dbEvent.venue_id)
          expect(appEvent.maxParticipants).toBe(dbEvent.max_participants)
          
          // Verify dates are converted to Date objects
          expect(appEvent.startTime).toBeInstanceOf(Date)
          expect(appEvent.endTime).toBeInstanceOf(Date)
          expect(appEvent.createdAt).toBeInstanceOf(Date)
          expect(appEvent.updatedAt).toBeInstanceOf(Date)
          expect(appEvent.startTime.toISOString()).toBe(dbEvent.start_time)
          expect(appEvent.endTime.toISOString()).toBe(dbEvent.end_time)
          expect(appEvent.createdAt.toISOString()).toBe(dbEvent.created_at)
          expect(appEvent.updatedAt.toISOString()).toBe(dbEvent.updated_at)
        })
      )
    })

    it('**Validates: Requirements 4.2** - should handle event with venue data correctly', () => {
      fc.assert(
        fc.property(dbEventArbitrary, dbVenueArbitrary, (dbEvent, dbVenue) => {
          // Add venue to event
          const dbEventWithVenue = { ...dbEvent, venue: dbVenue }
          
          // Transform db -> app
          const appEvent = dbEventToEvent(dbEventWithVenue)
          
          // Verify venue is transformed correctly
          expect(appEvent.venue).toBeDefined()
          expect(appEvent.venue?.id).toBe(dbVenue.id)
          expect(appEvent.venue?.name).toBe(dbVenue.name)
          expect(appEvent.venue?.safetyRating).toBe(dbVenue.safety_rating)
        })
      )
    })

    it('**Validates: Requirements 4.2** - should handle partial event updates correctly', () => {
      fc.assert(
        fc.property(updateEventInputArbitrary, (updateInput) => {
          // Transform app -> db
          const dbUpdate = eventToDbEvent(updateInput)
          
          // Verify only defined fields are included
          if (updateInput.title !== undefined) {
            expect(dbUpdate.title).toBe(updateInput.title)
          } else {
            expect(dbUpdate.title).toBeUndefined()
          }
          
          if (updateInput.trackType !== undefined) {
            expect(dbUpdate.track_type).toBe(updateInput.trackType)
          } else {
            expect(dbUpdate.track_type).toBeUndefined()
          }
          
          if (updateInput.startTime !== undefined) {
            expect(dbUpdate.start_time).toBe(updateInput.startTime.toISOString())
          } else {
            expect(dbUpdate.start_time).toBeUndefined()
          }
          
          if (updateInput.endTime !== undefined) {
            expect(dbUpdate.end_time).toBe(updateInput.endTime.toISOString())
          } else {
            expect(dbUpdate.end_time).toBeUndefined()
          }
        })
      )
    })

    it('**Validates: Requirements 4.2** - should be deterministic for event transformations', () => {
      fc.assert(
        fc.property(dbEventArbitrary, (dbEvent) => {
          const appEvent1 = dbEventToEvent(dbEvent)
          const appEvent2 = dbEventToEvent(dbEvent)
          
          // Same input should produce identical output
          expect(appEvent1).toEqual(appEvent2)
        })
      )
    })
  })

  describe('Property 33: Data Transformation Null Handling', () => {
    it('**Validates: Requirements 4.2** - should preserve null values without converting to undefined (User)', () => {
      fc.assert(
        fc.property(dbUserArbitrary, (dbUser) => {
          const appUser = dbUserToUser(dbUser)
          
          // All user fields are required, so no null handling needed
          // But verify no fields are undefined when they should have values
          expect(appUser.id).not.toBeUndefined()
          expect(appUser.email).not.toBeUndefined()
          expect(appUser.displayName).not.toBeUndefined()
          expect(appUser.trustPoints).not.toBeUndefined()
          expect(appUser.verificationStatus).not.toBeUndefined()
          expect(appUser.createdAt).not.toBeUndefined()
          expect(appUser.updatedAt).not.toBeUndefined()
        })
      )
    })

    it('**Validates: Requirements 4.2** - should preserve null values without converting to undefined (Event)', () => {
      fc.assert(
        fc.property(dbEventArbitrary, (dbEvent) => {
          const appEvent = dbEventToEvent(dbEvent)
          
          // Verify null values are preserved as null, not converted to undefined
          if (dbEvent.description === null) {
            expect(appEvent.description).toBeNull()
            expect(appEvent.description).not.toBeUndefined()
          }
          
          if (dbEvent.venue_id === null) {
            expect(appEvent.venueId).toBeNull()
            expect(appEvent.venueId).not.toBeUndefined()
          }
          
          if (dbEvent.max_participants === null) {
            expect(appEvent.maxParticipants).toBeNull()
            expect(appEvent.maxParticipants).not.toBeUndefined()
          }
        })
      )
    })

    it('**Validates: Requirements 4.2** - should preserve null values without converting to undefined (Venue)', () => {
      fc.assert(
        fc.property(dbVenueArbitrary, (dbVenue) => {
          const appVenue = dbVenueToVenue(dbVenue)
          
          // Verify null values are preserved as null, not converted to undefined
          if (dbVenue.latitude === null) {
            expect(appVenue.latitude).toBeNull()
            expect(appVenue.latitude).not.toBeUndefined()
          }
          
          if (dbVenue.longitude === null) {
            expect(appVenue.longitude).toBeNull()
            expect(appVenue.longitude).not.toBeUndefined()
          }
          
          if (dbVenue.safety_notes === null) {
            expect(appVenue.safetyNotes).toBeNull()
            expect(appVenue.safetyNotes).not.toBeUndefined()
          }
        })
      )
    })

    it('**Validates: Requirements 4.2** - should handle all nullable fields correctly in venue', () => {
      fc.assert(
        fc.property(dbVenueArbitrary, (dbVenue) => {
          const appVenue = dbVenueToVenue(dbVenue)
          
          // Check that nullable fields maintain their null/value state
          expect(appVenue.latitude === null).toBe(dbVenue.latitude === null)
          expect(appVenue.longitude === null).toBe(dbVenue.longitude === null)
          expect(appVenue.safetyNotes === null).toBe(dbVenue.safety_notes === null)
          
          // If not null, values should match
          if (dbVenue.latitude !== null) {
            expect(appVenue.latitude).toBe(dbVenue.latitude)
          }
          if (dbVenue.longitude !== null) {
            expect(appVenue.longitude).toBe(dbVenue.longitude)
          }
          if (dbVenue.safety_notes !== null) {
            expect(appVenue.safetyNotes).toBe(dbVenue.safety_notes)
          }
        })
      )
    })

    it('**Validates: Requirements 4.2** - should handle venue update with null values correctly', () => {
      fc.assert(
        fc.property(updateVenueInputArbitrary, (updateInput) => {
          const dbUpdate = venueToDbVenue(updateInput)
          
          // Verify that null values in input are preserved in output
          if (updateInput.latitude === null) {
            expect(dbUpdate.latitude).toBeNull()
          }
          if (updateInput.longitude === null) {
            expect(dbUpdate.longitude).toBeNull()
          }
          if (updateInput.safetyNotes === null) {
            expect(dbUpdate.safety_notes).toBeNull()
          }
          
          // Verify undefined values remain undefined (not included in update)
          if (updateInput.latitude === undefined) {
            expect(dbUpdate.latitude).toBeUndefined()
          }
          if (updateInput.longitude === undefined) {
            expect(dbUpdate.longitude).toBeUndefined()
          }
          if (updateInput.safetyNotes === undefined) {
            expect(dbUpdate.safety_notes).toBeUndefined()
          }
        })
      )
    })
  })

  describe('Additional Transformation Properties', () => {
    it('should handle date string to Date object conversion consistently', () => {
      fc.assert(
        fc.property(isoDateStringArbitrary, (dateString) => {
          const dbUser: DbUser = {
            id: 'test-id',
            email: 'test@example.com',
            display_name: 'Test User',
            trust_points: 50,
            verification_status: 'unverified',
            created_at: dateString,
            updated_at: dateString,
          }
          
          const appUser = dbUserToUser(dbUser)
          
          // Verify Date objects are created correctly
          expect(appUser.createdAt).toBeInstanceOf(Date)
          expect(appUser.updatedAt).toBeInstanceOf(Date)
          expect(appUser.createdAt.toISOString()).toBe(dateString)
          expect(appUser.updatedAt.toISOString()).toBe(dateString)
        })
      )
    })

    it('should handle Date object to ISO string conversion consistently', () => {
      fc.assert(
        fc.property(fc.date(), (date) => {
          const updateInput: UpdateEventInput = {
            startTime: date,
            endTime: date,
          }
          
          const dbUpdate = eventToDbEvent(updateInput)
          
          // Verify ISO strings are created correctly
          expect(typeof dbUpdate.start_time).toBe('string')
          expect(typeof dbUpdate.end_time).toBe('string')
          expect(dbUpdate.start_time).toBe(date.toISOString())
          expect(dbUpdate.end_time).toBe(date.toISOString())
        })
      )
    })

    it('should maintain type safety across transformations', () => {
      fc.assert(
        fc.property(dbUserArbitrary, dbEventArbitrary, dbVenueArbitrary, (dbUser, dbEvent, dbVenue) => {
          // All transformations should complete without throwing
          expect(() => {
            const appUser = dbUserToUser(dbUser)
            const appEvent = dbEventToEvent(dbEvent)
            const appVenue = dbVenueToVenue(dbVenue)
            
            // Verify types are correct
            expect(typeof appUser.id).toBe('string')
            expect(typeof appEvent.id).toBe('string')
            expect(typeof appVenue.id).toBe('string')
            expect(appUser.createdAt).toBeInstanceOf(Date)
            expect(appEvent.createdAt).toBeInstanceOf(Date)
            expect(appVenue.createdAt).toBeInstanceOf(Date)
          }).not.toThrow()
        })
      )
    })
  })
})

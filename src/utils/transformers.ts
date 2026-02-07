/**
 * Data Transformation Utilities
 * 
 * This file contains functions to convert between database types (snake_case)
 * and application types (camelCase). These transformers ensure type safety
 * and consistent data handling across the application.
 * 
 * Key principles:
 * - Handle null values correctly without converting to undefined
 * - Convert date strings to Date objects
 * - Maintain type safety with TypeScript
 * - Support bidirectional transformation (db <-> app)
 */

import type {
  DbUser,
  DbUserUpdate,
  DbNGO,
  DbNGOUpdate,
  DbVenue,
  DbVenueUpdate,
  DbEvent,
  DbEventUpdate,
  DbRSVP,
  DbRSVPUpdate,
  DbChatThread,
  DbChatMessage,
} from '../types/database.types'

import type {
  User,
  NGO,
  Venue,
  Event,
  RSVP,
  ChatThread,
  ChatMessage,
  UpdateUserInput,
  UpdateNGOInput,
  UpdateVenueInput,
  UpdateEventInput,
  UpdateRSVPInput,
} from '../types/models'

/**
 * Convert database user to application user
 */
export function dbUserToUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    displayName: dbUser.display_name,
    trustPoints: dbUser.trust_points,
    verificationStatus: dbUser.verification_status,
    createdAt: new Date(dbUser.created_at),
    updatedAt: new Date(dbUser.updated_at),
  }
}

/**
 * Convert application user update to database user update
 */
export function userToDbUser(user: UpdateUserInput): DbUserUpdate {
  const dbUser: DbUserUpdate = {}
  
  if (user.email !== undefined) dbUser.email = user.email
  if (user.displayName !== undefined) dbUser.display_name = user.displayName
  if (user.trustPoints !== undefined) dbUser.trust_points = user.trustPoints
  if (user.verificationStatus !== undefined) dbUser.verification_status = user.verificationStatus
  
  return dbUser
}

/**
 * Convert database NGO to application NGO
 */
export function dbNGOToNGO(dbNGO: DbNGO): NGO {
  return {
    id: dbNGO.id,
    name: dbNGO.name,
    description: dbNGO.description,
    darpanId: dbNGO.darpan_id,
    verificationStatus: dbNGO.verification_status,
    contactEmail: dbNGO.contact_email,
    contactPhone: dbNGO.contact_phone,
    createdAt: new Date(dbNGO.created_at),
    updatedAt: new Date(dbNGO.updated_at),
  }
}

/**
 * Convert application NGO update to database NGO update
 */
export function ngoToDbNGO(ngo: UpdateNGOInput): DbNGOUpdate {
  const dbNGO: DbNGOUpdate = {}
  
  if (ngo.name !== undefined) dbNGO.name = ngo.name
  if (ngo.description !== undefined) dbNGO.description = ngo.description
  if (ngo.darpanId !== undefined) dbNGO.darpan_id = ngo.darpanId
  if (ngo.verificationStatus !== undefined) dbNGO.verification_status = ngo.verificationStatus
  if (ngo.contactEmail !== undefined) dbNGO.contact_email = ngo.contactEmail
  if (ngo.contactPhone !== undefined) dbNGO.contact_phone = ngo.contactPhone
  
  return dbNGO
}

/**
 * Convert database venue to application venue
 */
export function dbVenueToVenue(dbVenue: DbVenue): Venue {
  return {
    id: dbVenue.id,
    name: dbVenue.name,
    address: dbVenue.address,
    latitude: dbVenue.latitude,
    longitude: dbVenue.longitude,
    safetyRating: dbVenue.safety_rating,
    safetyNotes: dbVenue.safety_notes,
    createdAt: new Date(dbVenue.created_at),
    updatedAt: new Date(dbVenue.updated_at),
  }
}

/**
 * Convert application venue update to database venue update
 */
export function venueToDbVenue(venue: UpdateVenueInput): DbVenueUpdate {
  const dbVenue: DbVenueUpdate = {}
  
  if (venue.name !== undefined) dbVenue.name = venue.name
  if (venue.address !== undefined) dbVenue.address = venue.address
  if (venue.latitude !== undefined) dbVenue.latitude = venue.latitude
  if (venue.longitude !== undefined) dbVenue.longitude = venue.longitude
  if (venue.safetyRating !== undefined) dbVenue.safety_rating = venue.safetyRating
  if (venue.safetyNotes !== undefined) dbVenue.safety_notes = venue.safetyNotes
  
  return dbVenue
}

/**
 * Convert database event to application event
 * Note: venue and rsvpCount are optional and handled separately
 */
export function dbEventToEvent(dbEvent: DbEvent & { venue?: DbVenue | null; rsvp_count?: number }): Event {
  const event: Event = {
    id: dbEvent.id,
    title: dbEvent.title,
    description: dbEvent.description,
    eventType: dbEvent.event_type,
    trackType: dbEvent.track_type,
    organizerId: dbEvent.organizer_id,
    organizerType: dbEvent.organizer_type,
    venueId: dbEvent.venue_id,
    startTime: new Date(dbEvent.start_time),
    endTime: new Date(dbEvent.end_time),
    maxParticipants: dbEvent.max_participants,
    createdAt: new Date(dbEvent.created_at),
    updatedAt: new Date(dbEvent.updated_at),
  }
  
  if (dbEvent.venue) {
    event.venue = dbVenueToVenue(dbEvent.venue)
  }
  
  if (dbEvent.rsvp_count !== undefined) {
    event.rsvpCount = dbEvent.rsvp_count
  }
  
  return event
}

/**
 * Convert application event update to database event update
 */
export function eventToDbEvent(event: UpdateEventInput): DbEventUpdate {
  const dbEvent: DbEventUpdate = {}
  
  if (event.title !== undefined) dbEvent.title = event.title
  if (event.description !== undefined) dbEvent.description = event.description
  if (event.eventType !== undefined) dbEvent.event_type = event.eventType
  if (event.trackType !== undefined) dbEvent.track_type = event.trackType
  if (event.organizerId !== undefined) dbEvent.organizer_id = event.organizerId
  if (event.organizerType !== undefined) dbEvent.organizer_type = event.organizerType
  if (event.venueId !== undefined) dbEvent.venue_id = event.venueId
  if (event.startTime !== undefined) dbEvent.start_time = event.startTime.toISOString()
  if (event.endTime !== undefined) dbEvent.end_time = event.endTime.toISOString()
  if (event.maxParticipants !== undefined) dbEvent.max_participants = event.maxParticipants
  
  return dbEvent
}

/**
 * Convert database RSVP to application RSVP
 */
export function dbRSVPToRSVP(dbRSVP: DbRSVP): RSVP {
  return {
    id: dbRSVP.id,
    eventId: dbRSVP.event_id,
    userId: dbRSVP.user_id,
    status: dbRSVP.status,
    createdAt: new Date(dbRSVP.created_at),
    updatedAt: new Date(dbRSVP.updated_at),
  }
}

/**
 * Convert application RSVP update to database RSVP update
 */
export function rsvpToDbRSVP(rsvp: UpdateRSVPInput): DbRSVPUpdate {
  const dbRSVP: DbRSVPUpdate = {}
  
  if (rsvp.eventId !== undefined) dbRSVP.event_id = rsvp.eventId
  if (rsvp.userId !== undefined) dbRSVP.user_id = rsvp.userId
  if (rsvp.status !== undefined) dbRSVP.status = rsvp.status
  
  return dbRSVP
}

/**
 * Convert database chat thread to application chat thread
 */
export function dbChatThreadToChatThread(
  dbThread: DbChatThread & { user?: DbUser; ngo?: DbNGO; last_message?: DbChatMessage }
): ChatThread {
  const thread: ChatThread = {
    id: dbThread.id,
    participantUserId: dbThread.participant_user_id,
    participantNgoId: dbThread.participant_ngo_id,
    createdAt: new Date(dbThread.created_at),
    updatedAt: new Date(dbThread.updated_at),
  }
  
  if (dbThread.user) {
    thread.user = dbUserToUser(dbThread.user)
  }
  
  if (dbThread.ngo) {
    thread.ngo = dbNGOToNGO(dbThread.ngo)
  }
  
  if (dbThread.last_message) {
    thread.lastMessage = dbChatMessageToChatMessage(dbThread.last_message)
  }
  
  return thread
}

/**
 * Convert database chat message to application chat message
 */
export function dbChatMessageToChatMessage(dbMessage: DbChatMessage): ChatMessage {
  return {
    id: dbMessage.id,
    threadId: dbMessage.thread_id,
    senderType: dbMessage.sender_type,
    senderId: dbMessage.sender_id,
    messageContent: dbMessage.message_content,
    createdAt: new Date(dbMessage.created_at),
  }
}

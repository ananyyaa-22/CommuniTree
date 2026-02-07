/**
 * Application Type Definitions
 * 
 * This file contains TypeScript interfaces for application-level data models.
 * These types use camelCase naming convention and represent data as used in
 * the React application layer.
 * 
 * These types are transformed from database types (snake_case) using
 * transformer utilities in src/utils/transformers.ts
 * 
 * @see src/types/database.types.ts for database-level types
 * @see src/utils/transformers.ts for transformation functions
 */

/**
 * User model representing an authenticated user in the application
 */
export interface User {
  id: string
  email: string
  displayName: string
  trustPoints: number
  verificationStatus: 'unverified' | 'verified'
  createdAt: Date
  updatedAt: Date
}

/**
 * NGO model representing a non-governmental organization
 */
export interface NGO {
  id: string
  name: string
  description: string | null
  darpanId: string | null
  verificationStatus: 'pending' | 'verified' | 'rejected'
  contactEmail: string
  contactPhone: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Venue model representing an event location with safety information
 */
export interface Venue {
  id: string
  name: string
  address: string
  latitude: number | null
  longitude: number | null
  safetyRating: 'green' | 'yellow' | 'red'
  safetyNotes: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Event model representing a community event
 * Can optionally include venue data and RSVP count
 */
export interface Event {
  id: string
  title: string
  description: string | null
  eventType: string
  trackType: 'impact' | 'grow'
  organizerId: string
  organizerType: 'user' | 'ngo'
  venueId: string | null
  venue?: Venue
  startTime: Date
  endTime: Date
  maxParticipants: number | null
  rsvpCount?: number
  createdAt: Date
  updatedAt: Date
}

/**
 * RSVP model representing a user's event attendance confirmation
 */
export interface RSVP {
  id: string
  eventId: string
  userId: string
  status: 'confirmed' | 'cancelled' | 'attended' | 'no_show'
  createdAt: Date
  updatedAt: Date
}

/**
 * ChatThread model representing a conversation between a user and an NGO
 * Can optionally include participant data and last message
 */
export interface ChatThread {
  id: string
  participantUserId: string
  participantNgoId: string
  user?: User
  ngo?: NGO
  lastMessage?: ChatMessage
  createdAt: Date
  updatedAt: Date
}

/**
 * ChatMessage model representing a single message in a chat thread
 */
export interface ChatMessage {
  id: string
  threadId: string
  senderType: 'user' | 'ngo'
  senderId: string
  messageContent: string
  createdAt: Date
}

/**
 * TrustPointsHistory model representing an audit trail of trust point changes
 */
export interface TrustPointsHistory {
  id: string
  userId: string
  delta: number
  reason: string
  relatedEventId: string | null
  createdAt: Date
}

// Input types for creating new records (omitting auto-generated fields)
export interface CreateUserInput {
  id: string
  email: string
  displayName: string
  trustPoints?: number
  verificationStatus?: 'unverified' | 'verified'
}

export interface CreateNGOInput {
  name: string
  description?: string | null
  darpanId?: string | null
  verificationStatus?: 'pending' | 'verified' | 'rejected'
  contactEmail: string
  contactPhone?: string | null
}

export interface CreateVenueInput {
  name: string
  address: string
  latitude?: number | null
  longitude?: number | null
  safetyRating?: 'green' | 'yellow' | 'red'
  safetyNotes?: string | null
}

export interface CreateEventInput {
  title: string
  description?: string | null
  eventType: string
  trackType: 'impact' | 'grow'
  organizerId: string
  organizerType: 'user' | 'ngo'
  venueId?: string | null
  startTime: Date
  endTime: Date
  maxParticipants?: number | null
}

export interface CreateRSVPInput {
  eventId: string
  userId: string
  status?: 'confirmed' | 'cancelled' | 'attended' | 'no_show'
}

export interface CreateChatThreadInput {
  participantUserId: string
  participantNgoId: string
}

export interface CreateChatMessageInput {
  threadId: string
  senderType: 'user' | 'ngo'
  senderId: string
  messageContent: string
}

// Update types for partial updates (all fields optional except id)
export type UpdateUserInput = Partial<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>
export type UpdateNGOInput = Partial<Omit<NGO, 'id' | 'createdAt' | 'updatedAt'>>
export type UpdateVenueInput = Partial<Omit<Venue, 'id' | 'createdAt' | 'updatedAt'>>
export type UpdateEventInput = Partial<Omit<Event, 'id' | 'createdAt' | 'updatedAt' | 'venue' | 'rsvpCount'>>
export type UpdateRSVPInput = Partial<Omit<RSVP, 'id' | 'createdAt' | 'updatedAt'>>

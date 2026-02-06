/**
 * Event-related interfaces and types for CommuniTree platform
 */

import { User } from './User';
import { Venue } from './Venue';

export interface Event {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  venue: Venue;
  organizer: User;
  attendees: User[];
  rsvpList: string[]; // Array of User IDs who have RSVP'd
  maxAttendees: number;
  dateTime: Date;
  duration: number; // Duration in minutes
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type EventCategory = 
  | 'Poetry'
  | 'Art'
  | 'Fitness'
  | 'Reading'
  | 'Music'
  | 'Dance'
  | 'Cooking'
  | 'Technology'
  | 'Photography'
  | 'Gardening';
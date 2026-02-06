/**
 * User-related interfaces and types for CommuniTree platform
 */

export interface User {
  id: string;
  name: string;
  email: string;
  trustPoints: number;
  verificationStatus: 'pending' | 'verified';
  chatHistory: string[]; // Array of ChatThread IDs
  eventHistory: UserEvent[];
  createdAt: Date;
  updatedAt: Date;
}

export interface UserEvent {
  id: string;
  eventId: string;
  type: 'organized' | 'attended' | 'rsvp' | 'no_show';
  timestamp: Date;
  trustPointsAwarded: number;
}

export interface ContactInfo {
  email: string;
  phone?: string;
  website?: string;
  address?: string;
}
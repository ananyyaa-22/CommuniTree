/**
 * Database Type Definitions
 * 
 * This file contains TypeScript type definitions for the Supabase database schema.
 * These types are based on the database migrations and provide type safety for
 * database operations throughout the application.
 * 
 * Generated from Supabase schema for CommuniTree application.
 * 
 * @see .kiro/specs/supabase-integration/migrations/ for schema definitions
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          display_name: string
          trust_points: number
          verification_status: 'unverified' | 'verified'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          display_name: string
          trust_points?: number
          verification_status?: 'unverified' | 'verified'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          display_name?: string
          trust_points?: number
          verification_status?: 'unverified' | 'verified'
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey'
            columns: ['id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      ngos: {
        Row: {
          id: string
          name: string
          description: string | null
          darpan_id: string | null
          verification_status: 'pending' | 'verified' | 'rejected'
          contact_email: string
          contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          darpan_id?: string | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          darpan_id?: string | null
          verification_status?: 'pending' | 'verified' | 'rejected'
          contact_email?: string
          contact_phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      venues: {
        Row: {
          id: string
          name: string
          address: string
          latitude: number | null
          longitude: number | null
          safety_rating: 'green' | 'yellow' | 'red'
          safety_notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          address: string
          latitude?: number | null
          longitude?: number | null
          safety_rating?: 'green' | 'yellow' | 'red'
          safety_notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string
          latitude?: number | null
          longitude?: number | null
          safety_rating?: 'green' | 'yellow' | 'red'
          safety_notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_type: string
          track_type: 'impact' | 'grow'
          organizer_id: string
          organizer_type: 'user' | 'ngo'
          venue_id: string | null
          start_time: string
          end_time: string
          max_participants: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_type: string
          track_type: 'impact' | 'grow'
          organizer_id: string
          organizer_type: 'user' | 'ngo'
          venue_id?: string | null
          start_time: string
          end_time: string
          max_participants?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_type?: string
          track_type?: 'impact' | 'grow'
          organizer_id?: string
          organizer_type?: 'user' | 'ngo'
          venue_id?: string | null
          start_time?: string
          end_time?: string
          max_participants?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'events_venue_id_fkey'
            columns: ['venue_id']
            referencedRelation: 'venues'
            referencedColumns: ['id']
          }
        ]
      }
      rsvps: {
        Row: {
          id: string
          event_id: string
          user_id: string
          status: 'confirmed' | 'cancelled' | 'attended' | 'no_show'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          event_id: string
          user_id: string
          status?: 'confirmed' | 'cancelled' | 'attended' | 'no_show'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          user_id?: string
          status?: 'confirmed' | 'cancelled' | 'attended' | 'no_show'
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'rsvps_event_id_fkey'
            columns: ['event_id']
            referencedRelation: 'events'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'rsvps_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      chat_threads: {
        Row: {
          id: string
          participant_user_id: string
          participant_ngo_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          participant_user_id: string
          participant_ngo_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          participant_user_id?: string
          participant_ngo_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'chat_threads_participant_user_id_fkey'
            columns: ['participant_user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'chat_threads_participant_ngo_id_fkey'
            columns: ['participant_ngo_id']
            referencedRelation: 'ngos'
            referencedColumns: ['id']
          }
        ]
      }
      chat_messages: {
        Row: {
          id: string
          thread_id: string
          sender_type: 'user' | 'ngo'
          sender_id: string
          message_content: string
          created_at: string
        }
        Insert: {
          id?: string
          thread_id: string
          sender_type: 'user' | 'ngo'
          sender_id: string
          message_content: string
          created_at?: string
        }
        Update: {
          id?: string
          thread_id?: string
          sender_type?: 'user' | 'ngo'
          sender_id?: string
          message_content?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'chat_messages_thread_id_fkey'
            columns: ['thread_id']
            referencedRelation: 'chat_threads'
            referencedColumns: ['id']
          }
        ]
      }
      trust_points_history: {
        Row: {
          id: string
          user_id: string
          delta: number
          reason: string
          related_event_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          delta: number
          reason: string
          related_event_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          delta?: number
          reason?: string
          related_event_id?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'trust_points_history_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'trust_points_history_related_event_id_fkey'
            columns: ['related_event_id']
            referencedRelation: 'events'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      update_trust_points: {
        Args: {
          p_user_id: string
          p_delta: number
          p_reason: string
          p_event_id?: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier access to table types
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

// Specific table type exports for convenience
export type DbUser = Tables<'users'>
export type DbUserInsert = Inserts<'users'>
export type DbUserUpdate = Updates<'users'>

export type DbNGO = Tables<'ngos'>
export type DbNGOInsert = Inserts<'ngos'>
export type DbNGOUpdate = Updates<'ngos'>

export type DbVenue = Tables<'venues'>
export type DbVenueInsert = Inserts<'venues'>
export type DbVenueUpdate = Updates<'venues'>

export type DbEvent = Tables<'events'>
export type DbEventInsert = Inserts<'events'>
export type DbEventUpdate = Updates<'events'>

export type DbRSVP = Tables<'rsvps'>
export type DbRSVPInsert = Inserts<'rsvps'>
export type DbRSVPUpdate = Updates<'rsvps'>

export type DbChatThread = Tables<'chat_threads'>
export type DbChatThreadInsert = Inserts<'chat_threads'>
export type DbChatThreadUpdate = Updates<'chat_threads'>

export type DbChatMessage = Tables<'chat_messages'>
export type DbChatMessageInsert = Inserts<'chat_messages'>
export type DbChatMessageUpdate = Updates<'chat_messages'>

export type DbTrustPointsHistory = Tables<'trust_points_history'>
export type DbTrustPointsHistoryInsert = Inserts<'trust_points_history'>
export type DbTrustPointsHistoryUpdate = Updates<'trust_points_history'>

// Enum type exports for type safety
export type VerificationStatus = 'unverified' | 'verified'
export type NGOVerificationStatus = 'pending' | 'verified' | 'rejected'
export type SafetyRating = 'green' | 'yellow' | 'red'
export type TrackType = 'impact' | 'grow'
export type OrganizerType = 'user' | 'ngo'
export type RSVPStatus = 'confirmed' | 'cancelled' | 'attended' | 'no_show'
export type SenderType = 'user' | 'ngo'

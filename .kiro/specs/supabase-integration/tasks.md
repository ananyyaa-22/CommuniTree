# Implementation Plan: Supabase Database Integration

## Overview

This implementation plan outlines the step-by-step process for integrating Supabase as the backend database and authentication system for CommuniTree. The approach follows an incremental pattern: set up infrastructure, create database schema, implement data access layer, integrate authentication, add real-time features, and finally migrate from mock data to live database operations.

## Tasks

- [x] 1. Set up Supabase project and environment configuration
  - Create new Supabase project with appropriate region
  - Configure environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
  - Create `.env.example` file documenting required variables
  - Install Supabase client library (`@supabase/supabase-js`)
  - Create `src/lib/supabase.ts` with client initialization and error handling for missing env vars
  - _Requirements: 1.1, 1.2, 1.3, 1.5, 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 2. Create database schema and migrations
  - [x] 2.1 Create users table with columns, constraints, and indexes
    - Define table with id, email, display_name, trust_points, verification_status, timestamps
    - Add CHECK constraint for trust_points (0-100 range)
    - Add indexes on email and trust_points columns
    - _Requirements: 2.1, 2.9, 2.10_
  
  - [x] 2.2 Create ngos table with Darpan ID validation
    - Define table with id, name, description, darpan_id, verification_status, contact info, timestamps
    - Add CHECK constraint for darpan_id format (5 digits)
    - Add CHECK constraint for verification_status enum
    - Add indexes on verification_status and darpan_id
    - _Requirements: 2.2, 2.9, 2.10, 8.1, 8.2_
  
  - [x] 2.3 Create venues table with safety rating system
    - Define table with id, name, address, coordinates, safety_rating, safety_notes, timestamps
    - Add CHECK constraint for safety_rating enum (green/yellow/red)
    - Add indexes on safety_rating and location coordinates
    - _Requirements: 2.4, 2.9, 2.10, 10.1, 10.2_
  
  - [x] 2.4 Create events table with foreign key relationships
    - Define table with id, title, description, event_type, track_type, organizer info, venue_id, time range, max_participants, timestamps
    - Add CHECK constraints for track_type enum and time validation (end_time > start_time)
    - Add foreign key to venues table
    - Add indexes on track_type, start_time, organizer, and venue
    - _Requirements: 2.3, 2.8, 2.9, 2.10_
  
  - [x] 2.5 Create rsvps table with unique constraints
    - Define table with id, event_id, user_id, status, timestamps
    - Add CHECK constraint for status enum
    - Add UNIQUE constraint on (event_id, user_id) combination
    - Add foreign keys to events and users tables
    - Add indexes on event_id, user_id, and status
    - _Requirements: 2.7, 2.8, 2.9, 2.10, 9.1, 9.4_
  
  - [x] 2.6 Create chat_threads and chat_messages tables
    - Define chat_threads with id, participant_user_id, participant_ngo_id, timestamps
    - Add UNIQUE constraint on (participant_user_id, participant_ngo_id)
    - Define chat_messages with id, thread_id, sender_type, sender_id, message_content, created_at
    - Add foreign keys and indexes for efficient querying
    - _Requirements: 2.5, 2.6, 2.8, 2.9, 2.10_
  
  - [x] 2.7 Create trust_points_history table for audit trail
    - Define table with id, user_id, delta, reason, related_event_id, created_at
    - Add foreign keys to users and events tables
    - Add index on (user_id, created_at) for efficient history queries
    - _Requirements: 7.7_

- [-] 3. Implement database functions and triggers
  - [x] 3.1 Create auto-update timestamp trigger function
    - Write `update_updated_at_column()` function
    - Apply trigger to all tables with updated_at column
    - _Requirements: 2.10_
  
  - [x] 3.2 Create trust points management function
    - Write `update_trust_points()` function with bounds checking (0-100)
    - Include automatic logging to trust_points_history table
    - Use SECURITY DEFINER for proper permission handling
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [x] 3.3 Create auto-create user profile trigger
    - Write `handle_new_user()` function to create users table record on auth signup
    - Apply trigger to auth.users table INSERT events
    - Extract display_name from metadata or derive from email
    - _Requirements: 3.2_
  
  - [x] 3.4 Create chat thread update trigger
    - Write function to update chat_threads.updated_at when new message is inserted
    - Apply trigger to chat_messages table
    - _Requirements: 5.1_

- [x] 4. Implement Row Level Security (RLS) policies
  - [x] 4.1 Enable RLS and create policies for users table
    - Enable RLS on users table
    - Create policy: users can view own profile
    - Create policy: users can update own profile
    - Create policy: users can insert own profile
    - _Requirements: 6.1, 6.2_
  
  - [x] 4.2 Create RLS policies for ngos table
    - Enable RLS on ngos table
    - Create policy: anyone can view verified NGOs
    - Create policy: authenticated users can create NGOs
    - Create policy: NGO admins can update their NGO
    - _Requirements: 6.1, 6.6, 6.7_
  
  - [x] 4.3 Create RLS policies for events table
    - Enable RLS on events table
    - Create policy: anyone can view events
    - Create policy: authenticated users can create events (with organizer validation)
    - Create policy: organizers can update own events
    - Create policy: organizers can delete own events
    - _Requirements: 6.1, 6.6, 6.7_
  
  - [x] 4.4 Create RLS policies for rsvps table
    - Enable RLS on rsvps table
    - Create policy: users can view own RSVPs
    - Create policy: event organizers can view event RSVPs
    - Create policy: users can create own RSVPs
    - Create policy: users can update own RSVPs
    - Create policy: organizers can update RSVP status (for attendance)
    - _Requirements: 6.1, 6.5, 6.7_
  
  - [x] 4.5 Create RLS policies for chat tables
    - Enable RLS on chat_threads and chat_messages tables
    - Create policy: users can view threads they participate in
    - Create policy: NGO admins can view NGO threads
    - Create policy: users can create threads
    - Create policy: thread participants can view messages
    - Create policy: thread participants can send messages
    - _Requirements: 6.1, 6.3, 6.4, 6.7_
  
  - [x] 4.6 Create RLS policies for venues table
    - Enable RLS on venues table
    - Create policy: anyone can view venues
    - Create policy: authenticated users can create venues
    - Create policy: admins can update venues (safety ratings)
    - _Requirements: 6.1, 6.6, 6.7_

- [x] 5. Create TypeScript type definitions
  - [x] 5.1 Generate database types from Supabase schema
    - Run Supabase CLI to generate `src/types/database.types.ts`
    - Verify all table types are correctly generated
    - _Requirements: 4.2_
  
  - [x] 5.2 Create application type definitions
    - Create `src/types/models.ts` with User, NGO, Event, Venue, RSVP, ChatThread, ChatMessage interfaces
    - Use camelCase naming convention for application types
    - Include proper TypeScript types for enums and optional fields
    - _Requirements: 4.2_

- [x] 6. Implement data transformation utilities
  - Create `src/utils/transformers.ts` with functions to convert between database snake_case and application camelCase
  - Implement: `dbUserToUser`, `userToDbUser`, `dbEventToEvent`, `eventToDbEvent`, `dbNGOToNGO`, `ngoToDbNGO`, `dbVenueToVenue`, `venueToDbVenue`, `dbRSVPToRSVP`, `rsvpToDbRSVP`, `dbChatThreadToChatThread`, `dbChatMessageToChatMessage`
  - Handle null values correctly without converting to undefined
  - Handle date string to Date object conversions
  - _Requirements: 4.2_

- [x] 6.1 Write property tests for data transformers


  - **Property 31: Data Transformation Round-Trip (User)**
  - **Validates: Requirements 4.2**
  - **Property 32: Data Transformation Round-Trip (Event)**
  - **Validates: Requirements 4.2**
  - **Property 33: Data Transformation Null Handling**
  - **Validates: Requirements 4.2**

- [x] 7. Implement error handling classes and utilities
  - [x] 7.1 Create custom error classes
    - Create `src/utils/errors.ts` with AuthError, DatabaseError, ValidationError classes
    - Include error codes and optional details fields
    - _Requirements: 13.2_
  
  - [x] 7.2 Create error message utility
    - Implement `getErrorMessage()` function for user-friendly error messages
    - Map error codes to plain language messages
    - Ensure no sensitive information is exposed
    - _Requirements: 13.3_
  
  - [x] 7.3 Create retry logic utility
    - Implement `withRetry()` function for transient network failures
    - Configure max retries and exponential backoff
    - Skip retry for validation and permission errors
    - _Requirements: 13.4_

- [ ]* 7.4 Write unit tests for error handling
  - Test error class instantiation and properties
  - Test error message generation for all error types
  - Test retry logic with mock failures
  - _Requirements: 13.1, 13.2, 13.3_

- [x] 8. Implement authentication service
  - [x] 8.1 Create authentication service module
    - Create `src/services/auth.service.ts` with AuthService interface
    - Implement `signUp()` method with email, password, and display_name
    - Implement `signIn()` method with email and password
    - Implement `signOut()` method
    - Implement `resetPassword()` method
    - Implement `getCurrentUser()` method
    - Implement `onAuthStateChange()` subscription method
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_
  
  - [x] 8.2 Add authentication error handling
    - Wrap Supabase auth errors in AuthError class
    - Map common auth errors to specific error codes
    - Log authentication errors with "auth" category
    - _Requirements: 13.2, 13.6_

- [ ]* 8.3 Write unit tests for authentication service
  - Test successful sign up, sign in, sign out flows
  - Test error handling for invalid credentials
  - Test error handling for duplicate email
  - Test password reset flow
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_


- [-] 9. Implement data access layer services
  - [x] 9.1 Create user service
    - Create `src/services/user.service.ts` with UserService interface
    - Implement `getUserById()`, `updateUser()`, `updateTrustPoints()` methods
    - Use data transformers for type conversion
    - Add error handling with DatabaseError class
    - _Requirements: 4.1, 4.3, 4.4, 7.1, 7.2, 7.3, 7.4_
  
  - [x] 9.2 Create NGO service
    - Create `src/services/ngo.service.ts` with NGOService interface
    - Implement `getAllNGOs()`, `getNGOById()`, `createNGO()`, `updateNGOVerification()`, `searchNGOs()` methods
    - Add Darpan ID format validation
    - Add error handling
    - _Requirements: 4.1, 4.3, 4.4, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [x] 9.3 Create event service
    - Create `src/services/event.service.ts` with EventService interface
    - Implement `getEventsByTrack()`, `getEventById()`, `createEvent()`, `updateEvent()`, `deleteEvent()`, `getEventRSVPCount()` methods
    - Include venue data in event queries using joins
    - Add pagination support for list queries
    - Add error handling
    - _Requirements: 4.1, 4.3, 4.4, 4.6, 10.3_
  
  - [x] 9.4 Create RSVP service
    - Create `src/services/rsvp.service.ts` with RSVPService interface
    - Implement `createRSVP()`, `cancelRSVP()`, `getUserRSVPs()`, `getEventRSVPs()`, `updateRSVPStatus()` methods
    - Add validation for event capacity before creating RSVP
    - Add validation to prevent duplicate RSVPs
    - Handle unique constraint violations gracefully
    - Add error handling
    - _Requirements: 4.1, 4.3, 4.4, 9.2, 9.3, 9.4, 9.5, 9.6, 9.7_
  
  - [x] 9.5 Create venue service
    - Create `src/services/venue.service.ts` with VenueService interface
    - Implement `getVenueById()`, `createVenue()`, `updateVenueSafety()` methods
    - Add error handling
    - _Requirements: 4.1, 4.3, 4.4, 10.4_
  
  - [x] 9.6 Create chat service
    - Create `src/services/chat.service.ts` with ChatService interface
    - Implement `getChatThreads()`, `getChatThread()`, `createChatThread()`, `getMessages()`, `sendMessage()` methods
    - Add error handling
    - _Requirements: 4.1, 4.3, 4.4_

- [ ]* 9.7 Write property tests for RSVP service
  - **Property 24: RSVP Initial Status**
  - **Validates: Requirements 9.2**
  - **Property 25: RSVP Cancellation Status Update**
  - **Validates: Requirements 9.3**
  - **Property 26: Duplicate RSVP Prevention**
  - **Validates: Requirements 9.4**
  - **Property 27: Event Capacity Enforcement**
  - **Validates: Requirements 9.5**

- [ ]* 9.8 Write property tests for trust points management
  - **Property 17: Trust Points Increment on Event Completion**
  - **Validates: Requirements 7.2**
  - **Property 18: Trust Points Decrement on Late Cancellation**
  - **Validates: Requirements 7.3**
  - **Property 19: Trust Points Decrement on No-Show**
  - **Validates: Requirements 7.4**
  - **Property 21: Trust Points Change Audit Trail**
  - **Validates: Requirements 7.7**

- [ ]* 9.9 Write property tests for NGO verification
  - **Property 22: Darpan ID Format Validation**
  - **Validates: Requirements 8.2**
  - **Property 23: NGO Default Verification Status**
  - **Validates: Requirements 8.4**

- [ ]* 9.10 Write property tests for venue data
  - **Property 28: Event Venue Data Inclusion**
  - **Validates: Requirements 10.3**

- [x] 10. Implement real-time subscriptions in chat service
  - [x] 10.1 Add real-time subscription method to chat service
    - Implement `subscribeToMessages()` method in chat service
    - Set up Supabase real-time subscription filtered by thread_id
    - Return unsubscribe function for cleanup
    - Add error handling for subscription failures
    - Add automatic reconnection logic
    - _Requirements: 5.1, 5.2, 5.5, 5.6_

- [ ]* 10.2 Write integration tests for real-time subscriptions
  - Test message subscription receives new messages
  - Test subscription cleanup on unsubscribe
  - Test subscription reconnection after network interruption
  - _Requirements: 5.1, 5.2, 5.4, 5.6_

- [x] 11. Create custom React hooks for data access
  - [x] 11.1 Create useAuth hook
    - Create `src/hooks/useAuth.ts` with UseAuthReturn interface
    - Implement authentication state management
    - Expose user, loading, error states
    - Expose signIn, signUp, signOut, resetPassword methods
    - Subscribe to auth state changes and update React Context
    - _Requirements: 3.6, 3.7_
  
  - [x] 11.2 Create useEvents hook
    - Create `src/hooks/useEvents.ts` with UseEventsReturn interface
    - Implement event fetching by track type
    - Expose events, loading, error states
    - Expose refetch method
    - Add error handling with user-friendly messages
    - _Requirements: 11.4, 11.5, 11.6, 13.5_
  
  - [x] 11.3 Create useRSVP hook
    - Create `src/hooks/useRSVP.ts` with UseRSVPReturn interface
    - Implement RSVP management for current user
    - Expose rsvps, loading, error states
    - Expose createRSVP, cancelRSVP, isRSVPd methods
    - Add optimistic UI updates
    - _Requirements: 11.4, 11.5, 11.6, 13.5, 14.6_
  
  - [x] 11.4 Create useChat hook
    - Create `src/hooks/useChat.ts` with UseChatReturn interface
    - Implement chat thread and message management
    - Set up real-time subscription for active thread
    - Expose threads, messages, loading, error states
    - Expose sendMessage, selectThread methods
    - Clean up subscriptions on unmount
    - _Requirements: 5.3, 5.4, 11.4, 11.5, 11.6, 13.5_

- [ ]* 11.5 Write property tests for React hooks
  - **Property 2: Authentication State Synchronization**
  - **Validates: Requirements 3.7**
  - **Property 6: Error State Exposure to UI**
  - **Validates: Requirements 13.5**
  - **Property 8: Real-time Subscription State Updates**
  - **Validates: Requirements 5.3**
  - **Property 9: Subscription Cleanup on Unmount**
  - **Validates: Requirements 5.4**
  - **Property 30: Asynchronous Operation Loading States**
  - **Validates: Requirements 11.5**

- [x] 12. Update AppContext to use Supabase authentication
  - Modify `src/context/AppContext.tsx` to integrate useAuth hook
  - Replace mock authentication with Supabase auth state
  - Maintain authentication state across page refreshes
  - Update context to expose Supabase user data
  - _Requirements: 3.6, 3.7, 11.2_

- [x] 13. Migrate components from mock data to Supabase
  - [x] 13.1 Update NGO listing components
    - Replace mock NGO data with useNGOs hook (to be created)
    - Add loading and error states to UI
    - Add empty state handling
    - _Requirements: 11.1, 11.4, 11.5, 11.6_
  
  - [x] 13.2 Update event listing components
    - Replace mock event data with useEvents hook
    - Add loading and error states to UI
    - Add empty state handling
    - Maintain track filtering functionality
    - _Requirements: 11.1, 11.4, 11.5, 11.6_
  
  - [x] 13.3 Update RSVP functionality in event components
    - Replace mock RSVP logic with useRSVP hook
    - Add optimistic UI updates for better UX
    - Add error handling and user feedback
    - _Requirements: 11.1, 11.4, 11.5, 11.6, 14.6_
  
  - [x] 13.4 Update chat components
    - Replace mock chat data with useChat hook
    - Integrate real-time message subscriptions
    - Add loading and error states
    - Ensure subscription cleanup on component unmount
    - _Requirements: 5.3, 5.4, 11.1, 11.4, 11.5, 11.6_
  
  - [x] 13.5 Update user profile components
    - Replace mock user data with Supabase user data from context
    - Display trust points from database
    - Add loading and error states
    - _Requirements: 11.1, 11.4, 11.5, 11.6_

- [x] 14. Implement authentication UI flows
  - [x] 14.1 Create sign up form component
    - Build form with email, password, display name fields
    - Integrate with useAuth hook
    - Add validation and error display
    - Show loading state during signup
    - _Requirements: 3.1, 3.2_
  
  - [x] 14.2 Create sign in form component
    - Build form with email and password fields
    - Integrate with useAuth hook
    - Add validation and error display
    - Show loading state during signin
    - _Requirements: 3.1, 3.3_
  
  - [x] 14.3 Create password reset flow
    - Build password reset request form
    - Integrate with useAuth hook
    - Add success and error messaging
    - _Requirements: 3.5_
  
  - [x] 14.4 Add protected route wrapper
    - Create component to protect authenticated routes
    - Redirect unauthenticated users to sign in
    - Show loading state while checking auth
    - _Requirements: 3.8_

- [x] 15. Create development seed data scripts
  - [x] 15.1 Create SQL seed script
    - Write SQL script to populate development database
    - Include sample users with varying trust points
    - Include sample NGOs with different verification statuses
    - Include sample events across Impact and Grow tracks
    - Include sample venues with different safety ratings
    - Include sample chat threads and messages
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6_
  
  - [x] 15.2 Create database reset script
    - Write script to truncate all tables and re-seed
    - Ensure proper order to handle foreign key constraints
    - _Requirements: 15.7_

- [x] 16. Implement performance optimizations
  - [x] 16.1 Add query result caching
    - Implement caching strategy for frequently accessed data (NGOs, venues)
    - Add cache invalidation on data updates
    - _Requirements: 14.1_
  
  - [x] 16.2 Optimize database queries
    - Review all queries to use specific column selection instead of SELECT *
    - Verify indexes are used for common query patterns
    - Implement query batching where applicable
    - _Requirements: 14.2, 14.4, 14.5_
  
  - [x] 16.3 Add pagination to list queries
    - Implement pagination for events list
    - Implement pagination for NGOs list
    - Add pagination controls to UI components
    - _Requirements: 4.6, 14.3_
  
  - [x] 16.4 Implement lazy loading for secondary features
    - Lazy load chat functionality until user opens chat
    - Lazy load user profile data until profile is viewed
    - _Requirements: 14.7_

- [x] 17. Add comprehensive error logging
  - Implement centralized error logging utility
  - Log all database errors with context (operation, resource, user)
  - Log authentication errors separately with "auth" category
  - Add error monitoring integration points (e.g., Sentry)
  - _Requirements: 13.1, 13.6_

- [x] 18. Checkpoint - Integration testing and validation
  - Run full test suite (unit tests, property tests, integration tests)
  - Test all authentication flows (signup, signin, signout, password reset)
  - Test RSVP creation, cancellation, and capacity enforcement
  - Test real-time chat subscriptions
  - Test RLS policies by attempting unauthorized access
  - Verify trust points updates and audit trail
  - Test error handling and user-facing error messages
  - Verify loading states and empty states in UI
  - Test with seed data in development environment
  - Ensure all tests pass, ask the user if questions arise.

- [x] 19. Documentation and deployment preparation
  - [x] 19.1 Update README with Supabase setup instructions
    - Document Supabase project creation steps
    - Document environment variable configuration
    - Document database migration process
    - Document seed data usage
  
  - [x] 19.2 Create deployment guide
    - Document production environment setup
    - Document environment variable management for production
    - Document RLS policy verification steps
    - Document backup and recovery procedures
  
  - [x] 19.3 Create developer onboarding guide
    - Document local development setup with Supabase
    - Document testing procedures
    - Document common troubleshooting steps

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties across all inputs
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows with actual Supabase database
- All database operations use TypeScript for type safety
- RLS policies provide security at the database level
- Real-time subscriptions enable live chat functionality

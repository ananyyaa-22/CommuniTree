# Requirements Document: Supabase Database Integration

## Introduction

This specification defines the requirements for integrating Supabase as the backend database and authentication system for the CommuniTree application. The integration will replace the current mock data system with a production-ready database backend, including real-time capabilities, authentication, and secure data access patterns.

## Glossary

- **Supabase**: Open-source Firebase alternative providing PostgreSQL database, authentication, real-time subscriptions, and storage
- **RLS (Row Level Security)**: PostgreSQL security feature that restricts database row access based on user identity
- **Real-time Subscription**: Live data updates pushed from database to client when data changes
- **Supabase_Client**: JavaScript client library for interacting with Supabase services
- **Auth_Provider**: Supabase authentication service managing user sessions and identity
- **Database_Schema**: Structure defining tables, columns, relationships, and constraints in PostgreSQL
- **Migration**: Script that transforms database structure or data from one state to another
- **Environment_Variable**: Configuration value stored outside code for security and flexibility
- **Trust_Points_System**: Gamification mechanism tracking user reliability (0-100 scale)
- **Darpan_ID**: 5-digit identifier for verified NGOs in India
- **Venue_Safety_Rating**: Color-coded classification (Green/Yellow/Red) for event location safety
- **RSVP**: Event attendance confirmation with trust point implications
- **Impact_Track**: Community service pathway focused on NGO volunteering
- **Grow_Track**: Entertainment pathway focused on hobby-based meetups

## Requirements

### Requirement 1: Supabase Project Configuration

**User Story:** As a developer, I want to set up and configure a Supabase project, so that the application has a production-ready backend infrastructure.

#### Acceptance Criteria

1. THE System SHALL create a new Supabase project with appropriate region selection
2. THE System SHALL configure environment variables for Supabase URL and anonymous key
3. THE System SHALL initialize the Supabase client in the application with proper TypeScript types
4. THE System SHALL configure CORS settings to allow requests from the application domain
5. WHEN environment variables are missing, THE System SHALL provide clear error messages preventing application startup

### Requirement 2: Database Schema Design

**User Story:** As a developer, I want a comprehensive database schema, so that all application data models are properly structured and related.

#### Acceptance Criteria

1. THE Database_Schema SHALL include a users table with columns for id, email, display_name, trust_points, verification_status, created_at, and updated_at
2. THE Database_Schema SHALL include an ngos table with columns for id, name, description, darpan_id, verification_status, contact_email, contact_phone, created_at, and updated_at
3. THE Database_Schema SHALL include an events table with columns for id, title, description, event_type, track_type, organizer_id, organizer_type, venue_id, start_time, end_time, max_participants, created_at, and updated_at
4. THE Database_Schema SHALL include a venues table with columns for id, name, address, latitude, longitude, safety_rating, safety_notes, created_at, and updated_at
5. THE Database_Schema SHALL include a chat_threads table with columns for id, participant_user_id, participant_ngo_id, created_at, and updated_at
6. THE Database_Schema SHALL include a chat_messages table with columns for id, thread_id, sender_type, sender_id, message_content, created_at
7. THE Database_Schema SHALL include an rsvps table with columns for id, event_id, user_id, status, created_at, and updated_at
8. THE Database_Schema SHALL define foreign key relationships between related tables
9. THE Database_Schema SHALL include appropriate indexes for query performance optimization
10. THE Database_Schema SHALL use timestamp columns with timezone support for all temporal data

### Requirement 3: Authentication Integration

**User Story:** As a user, I want to authenticate with the application, so that I can access personalized features and my data is secure.

#### Acceptance Criteria

1. THE Auth_Provider SHALL support email and password authentication
2. WHEN a user signs up, THE Auth_Provider SHALL create a corresponding record in the users table
3. WHEN a user signs in, THE Auth_Provider SHALL return a session token with user identity
4. WHEN a user signs out, THE Auth_Provider SHALL invalidate the session token
5. THE Auth_Provider SHALL provide password reset functionality via email
6. THE System SHALL maintain authentication state across page refreshes
7. WHEN authentication state changes, THE System SHALL update the React Context accordingly
8. THE System SHALL protect authenticated routes from unauthenticated access

### Requirement 4: Data Access Layer

**User Story:** As a developer, I want a clean data access layer, so that database operations are consistent and maintainable throughout the application.

#### Acceptance Criteria

1. THE System SHALL provide functions for CRUD operations on all data models
2. THE System SHALL use TypeScript interfaces matching database schema for type safety
3. WHEN database queries fail, THE System SHALL return descriptive error messages
4. THE System SHALL implement proper error handling for network failures and timeouts
5. THE System SHALL use parameterized queries to prevent SQL injection
6. THE System SHALL implement pagination for list queries returning large datasets
7. THE System SHALL provide filtering and sorting capabilities for list queries

### Requirement 5: Real-time Subscriptions

**User Story:** As a user, I want to see live updates in chat conversations, so that messaging feels responsive and immediate.

#### Acceptance Criteria

1. WHEN a new message is inserted in a chat thread, THE System SHALL push the update to all subscribed clients
2. THE System SHALL establish real-time subscriptions for chat_messages table filtered by thread_id
3. WHEN a subscription receives an update, THE System SHALL update the React state immediately
4. WHEN a component unmounts, THE System SHALL clean up active subscriptions to prevent memory leaks
5. THE System SHALL handle subscription errors gracefully without crashing the application
6. THE System SHALL reconnect subscriptions automatically after network interruptions

### Requirement 6: Row Level Security Policies

**User Story:** As a system administrator, I want data access controlled by security policies, so that users can only access data they are authorized to see.

#### Acceptance Criteria

1. THE Database_Schema SHALL enable RLS on all tables containing user-specific data
2. WHEN a user queries the users table, THE System SHALL only return their own user record for updates
3. WHEN a user queries the chat_threads table, THE System SHALL only return threads where they are a participant
4. WHEN a user queries the chat_messages table, THE System SHALL only return messages from threads they participate in
5. WHEN a user queries the rsvps table, THE System SHALL allow them to view their own RSVPs and RSVPs for events they organize
6. THE System SHALL allow public read access to ngos, events, and venues tables
7. THE System SHALL restrict insert, update, and delete operations based on user identity and role
8. WHEN an unauthorized access attempt occurs, THE System SHALL return a permission denied error

### Requirement 7: Trust Points Management

**User Story:** As a user, I want my trust points to be accurately tracked in the database, so that my reputation reflects my community participation.

#### Acceptance Criteria

1. THE System SHALL store trust_points as an integer between 0 and 100 in the users table
2. WHEN a user completes an RSVP'd event, THE System SHALL increment their trust_points
3. WHEN a user cancels an RSVP close to event time, THE System SHALL decrement their trust_points
4. WHEN a user no-shows for an RSVP'd event, THE System SHALL decrement their trust_points
5. THE System SHALL enforce the 0-100 range constraint at the database level
6. THE System SHALL provide a transaction-safe method for updating trust points to prevent race conditions
7. THE System SHALL log trust point changes for audit purposes

### Requirement 8: NGO Verification System

**User Story:** As an NGO administrator, I want my organization verified via Darpan ID, so that users trust our legitimacy.

#### Acceptance Criteria

1. THE System SHALL store darpan_id as a 5-digit string in the ngos table
2. THE System SHALL validate darpan_id format before insertion
3. THE System SHALL store verification_status as an enum with values: pending, verified, rejected
4. WHEN an NGO is created, THE System SHALL set verification_status to pending by default
5. THE System SHALL provide a mechanism for administrators to update verification_status
6. THE System SHALL ensure darpan_id uniqueness across all NGO records

### Requirement 9: Event RSVP System

**User Story:** As a user, I want to RSVP to events and track my attendance, so that organizers know who is participating.

#### Acceptance Criteria

1. THE System SHALL store RSVP status as an enum with values: confirmed, cancelled, attended, no_show
2. WHEN a user RSVPs to an event, THE System SHALL create a record with status confirmed
3. WHEN a user cancels an RSVP, THE System SHALL update the status to cancelled
4. THE System SHALL prevent duplicate RSVPs for the same user and event combination
5. WHEN an event reaches max_participants, THE System SHALL prevent new RSVPs
6. THE System SHALL provide a count of confirmed RSVPs for each event
7. THE System SHALL allow event organizers to mark attendance status after events

### Requirement 10: Venue Safety Rating System

**User Story:** As a user, I want to see safety ratings for event venues, so that I can make informed decisions about attendance.

#### Acceptance Criteria

1. THE System SHALL store safety_rating as an enum with values: green, yellow, red
2. THE System SHALL store optional safety_notes as text in the venues table
3. WHEN displaying events, THE System SHALL include associated venue safety information
4. THE System SHALL allow venue safety ratings to be updated by authorized users
5. THE System SHALL maintain a history of safety rating changes for audit purposes

### Requirement 11: Migration from Mock Data

**User Story:** As a developer, I want to migrate from mock data to Supabase, so that the application uses real database operations.

#### Acceptance Criteria

1. THE System SHALL replace all mock data arrays with Supabase queries
2. THE System SHALL replace React Context state management with Supabase data fetching
3. THE System SHALL maintain the same component interfaces during migration
4. WHEN components request data, THE System SHALL fetch from Supabase instead of mock arrays
5. THE System SHALL handle loading states during asynchronous database operations
6. THE System SHALL provide fallback UI for empty data states
7. THE System SHALL maintain backward compatibility with existing component props and hooks

### Requirement 12: Environment Configuration

**User Story:** As a developer, I want environment-based configuration, so that the application works across development, staging, and production environments.

#### Acceptance Criteria

1. THE System SHALL load Supabase URL from environment variable VITE_SUPABASE_URL
2. THE System SHALL load Supabase anonymous key from environment variable VITE_SUPABASE_ANON_KEY
3. THE System SHALL provide a .env.example file documenting required environment variables
4. THE System SHALL prevent committing actual environment values to version control
5. WHEN required environment variables are missing, THE System SHALL fail fast with clear error messages
6. THE System SHALL support different Supabase projects for development and production environments

### Requirement 13: Error Handling and Logging

**User Story:** As a developer, I want comprehensive error handling, so that database issues are caught and debugged efficiently.

#### Acceptance Criteria

1. WHEN a database operation fails, THE System SHALL log the error with context information
2. THE System SHALL distinguish between network errors, permission errors, and data validation errors
3. THE System SHALL provide user-friendly error messages for common failure scenarios
4. THE System SHALL implement retry logic for transient network failures
5. THE System SHALL expose error states to UI components for user feedback
6. THE System SHALL log authentication errors separately for security monitoring

### Requirement 14: Performance Optimization

**User Story:** As a user, I want fast application performance, so that my experience is smooth and responsive.

#### Acceptance Criteria

1. THE System SHALL implement query result caching for frequently accessed data
2. THE System SHALL use database indexes on foreign keys and frequently queried columns
3. THE System SHALL implement pagination for large result sets to limit data transfer
4. THE System SHALL use SELECT statements with specific columns instead of SELECT *
5. THE System SHALL batch multiple related queries when possible to reduce round trips
6. THE System SHALL implement optimistic UI updates for better perceived performance
7. THE System SHALL lazy-load data for secondary features not immediately visible

### Requirement 15: Data Seeding for Development

**User Story:** As a developer, I want seed data for development, so that I can test features with realistic data.

#### Acceptance Criteria

1. THE System SHALL provide SQL scripts to populate development database with sample data
2. THE System SHALL include sample users with varying trust point levels
3. THE System SHALL include sample NGOs with different verification statuses
4. THE System SHALL include sample events across both Impact and Grow tracks
5. THE System SHALL include sample venues with different safety ratings
6. THE System SHALL include sample chat threads and messages
7. THE System SHALL provide a script to reset the development database to initial seed state

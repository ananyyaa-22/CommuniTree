# Requirements Document

## Introduction

CommuniTree is a dual-track community platform web application that enables users to engage with their local community through two distinct pathways: community service (Impact track) and local entertainment (Grow track). The platform combines social networking with civic engagement, featuring verification systems, safety measures, and gamification to build trust and encourage participation in community activities.

## Glossary

- **CommuniTree_Platform**: The complete web application system
- **Impact_Track**: Community service module focused on NGO partnerships and volunteering
- **Grow_Track**: Local entertainment module focused on hobby-based meetups and social events
- **NGO_Feed**: Display system for non-governmental organization volunteer opportunities
- **Social_Feed**: Display system for local entertainment events and meetups
- **Darpan_ID**: 5-digit government identification number for verified NGOs
- **Trust_Points**: Numerical reputation system tracking user reliability (0-100 scale)
- **Venue_Rating**: Color-coded safety classification system for event locations
- **Chat_Support**: Modal interface for volunteer-NGO communication
- **RSVP_System**: Event attendance confirmation mechanism
- **User_Profile**: Individual account containing personal information and trust metrics

## Requirements

### Requirement 1: User Authentication and Onboarding

**User Story:** As a new user, I want to create an account and verify my identity, so that I can safely participate in community activities.

#### Acceptance Criteria

1. WHEN a user accesses the registration page, THE CommuniTree_Platform SHALL display signup fields for name, email, and identity verification upload
2. WHEN a user submits valid registration information, THE CommuniTree_Platform SHALL create a new User_Profile with 50 initial Trust_Points
3. WHEN a user uploads identity verification documents, THE CommuniTree_Platform SHALL store the documents for verification processing
4. WHEN registration is complete, THE CommuniTree_Platform SHALL redirect the user to the main platform interface
5. WHEN a user attempts to register with invalid email format, THE CommuniTree_Platform SHALL display appropriate error messages

### Requirement 2: Navigation System

**User Story:** As a user, I want to navigate between different sections of the platform, so that I can access all available features efficiently.

#### Acceptance Criteria

1. ON mobile devices, THE CommuniTree_Platform SHALL display a persistent bottom navigation bar with Home, My Schedule, and Profile options
2. ON desktop devices, THE CommuniTree_Platform SHALL display a sidebar navigation with Home, My Schedule, and Profile options
3. WHEN a user clicks any navigation item, THE CommuniTree_Platform SHALL navigate to the corresponding section
4. WHEN the platform loads, THE CommuniTree_Platform SHALL highlight the currently active navigation item
5. THE CommuniTree_Platform SHALL maintain responsive design across all screen sizes

### Requirement 3: Central Toggle System

**User Story:** As a user, I want to switch between community service and entertainment tracks, so that I can engage with different types of community activities.

#### Acceptance Criteria

1. THE CommuniTree_Platform SHALL display a central toggle allowing users to switch between Impact_Track and Grow_Track
2. WHEN a user selects Impact_Track, THE CommuniTree_Platform SHALL display the NGO_Feed interface with deep emerald color scheme
3. WHEN a user selects Grow_Track, THE CommuniTree_Platform SHALL display the Social_Feed interface with bright amber color scheme
4. WHEN switching tracks, THE CommuniTree_Platform SHALL preserve the user's current session and Trust_Points
5. THE CommuniTree_Platform SHALL remember the user's last selected track for subsequent visits

### Requirement 4: NGO Feed and Verification System

**User Story:** As a user interested in volunteering, I want to browse verified NGO opportunities, so that I can contribute to legitimate community service projects.

#### Acceptance Criteria

1. WHEN Impact_Track is active, THE CommuniTree_Platform SHALL display NGO cards showing organization name, project title, and verification status
2. WHEN an NGO has valid Darpan_ID, THE CommuniTree_Platform SHALL display a "Darpan ID Verified" badge on the NGO card
3. WHEN a user clicks "Verify NGO", THE CommuniTree_Platform SHALL open a modal accepting 5-digit Darpan_ID input
4. WHEN a valid 5-digit Darpan_ID is submitted, THE CommuniTree_Platform SHALL mark the NGO as verified and display the verification badge
5. WHEN an invalid Darpan_ID is submitted, THE CommuniTree_Platform SHALL display an error message and maintain unverified status
6. THE CommuniTree_Platform SHALL provide list and grid view options for the NGO_Feed
7. WHEN a user clicks the volunteer button, THE CommuniTree_Platform SHALL open the Chat_Support modal

### Requirement 5: Social Feed and Safety System

**User Story:** As a user seeking local entertainment, I want to browse hobby-based meetups with safety information, so that I can make informed decisions about event attendance.

#### Acceptance Criteria

1. WHEN Grow_Track is active, THE CommuniTree_Platform SHALL display Social_Feed cards showing hobby-based meetup information
2. WHEN displaying events, THE CommuniTree_Platform SHALL show color-coded Venue_Rating badges based on location safety
3. WHEN an event is at public parks or libraries, THE CommuniTree_Platform SHALL display a green Venue_Rating badge
4. WHEN an event is at cafes or studios, THE CommuniTree_Platform SHALL display a yellow Venue_Rating badge
5. WHEN an event is at private property, THE CommuniTree_Platform SHALL display a red Venue_Rating badge
6. THE CommuniTree_Platform SHALL provide map-integrated list view for Social_Feed events
7. THE CommuniTree_Platform SHALL allow filtering by interests including Poetry, Art, and Fitness categories
8. WHEN a user clicks on a Social_Feed event, THE CommuniTree_Platform SHALL provide chat option to communicate with event organizers

### Requirement 6: RSVP and Trust Points System

**User Story:** As a user, I want to RSVP to events and maintain my reputation score, so that I can build trust within the community.

#### Acceptance Criteria

1. WHEN a user clicks "Attend" on an event, THE CommuniTree_Platform SHALL display Trust_Points deduction warning for potential no-shows
2. WHEN a user confirms RSVP, THE CommuniTree_Platform SHALL register their attendance commitment
3. WHEN a user organizes an event, THE CommuniTree_Platform SHALL award 20 Trust_Points upon successful completion
4. WHEN a user attends an event, THE CommuniTree_Platform SHALL award 5 Trust_Points upon confirmation
5. WHEN a user fails to attend a confirmed event, THE CommuniTree_Platform SHALL deduct 10 Trust_Points
6. THE CommuniTree_Platform SHALL display current Trust_Points as a badge in the header
7. WHEN Trust_Points fall below 20, THE CommuniTree_Platform SHALL display warnings before allowing new RSVPs

### Requirement 7: User Profile Management

**User Story:** As a user, I want to manage my profile and view my community engagement history, so that I can track my participation and maintain my account.

#### Acceptance Criteria

1. WHEN a user accesses their profile, THE CommuniTree_Platform SHALL display personal information, Trust_Points, and engagement history
2. WHEN a user updates profile information, THE CommuniTree_Platform SHALL save changes and display confirmation
3. THE CommuniTree_Platform SHALL display the user's current Trust_Points prominently in the profile section
4. THE CommuniTree_Platform SHALL show history of attended events, organized events, and volunteer activities
5. WHEN a user views their profile, THE CommuniTree_Platform SHALL display their current trust level and community impact metrics
6. THE CommuniTree_Platform SHALL allow users to access their complete chat history with NGOs and event organizers from the profile section

### Requirement 8: Chat Support System

**User Story:** As a user, I want to communicate with NGOs and event organizers at any time, so that I can get detailed information and coordinate my participation in both community service and social activities.

#### Acceptance Criteria

1. THE CommuniTree_Platform SHALL provide persistent chat support functionality accessible from any screen
2. WHEN a user clicks the volunteer button on an NGO card, THE CommuniTree_Platform SHALL open the Chat_Support modal with NGO context
3. WHEN a user clicks on a Social_Feed event, THE CommuniTree_Platform SHALL provide chat option to communicate with event organizers
4. WHEN the Chat_Support modal opens, THE CommuniTree_Platform SHALL display relevant contact information and activity details
5. THE CommuniTree_Platform SHALL provide a messaging interface within the Chat_Support modal for both NGO and event communications
6. WHEN a user sends a message, THE CommuniTree_Platform SHALL timestamp and store the communication
7. THE CommuniTree_Platform SHALL maintain separate chat threads for different NGOs and event organizers
8. THE CommuniTree_Platform SHALL allow users to access their chat history from their profile section

### Requirement 9: Responsive Design and Visual System

**User Story:** As a user on various devices, I want the platform to work seamlessly across different screen sizes, so that I can access community features anywhere.

#### Acceptance Criteria

1. THE CommuniTree_Platform SHALL implement responsive design supporting mobile and desktop viewports
2. WHEN Impact_Track is active, THE CommuniTree_Platform SHALL apply deep emerald color scheme consistently
3. WHEN Grow_Track is active, THE CommuniTree_Platform SHALL apply bright amber color scheme consistently
4. THE CommuniTree_Platform SHALL use Tailwind CSS for styling and Lucide React icons for interface elements
5. THE CommuniTree_Platform SHALL maintain modern, clean, and trustworthy visual design across all components
6. ON mobile devices, THE CommuniTree_Platform SHALL optimize touch interactions and readability
7. ON desktop devices, THE CommuniTree_Platform SHALL utilize available screen space efficiently

### Requirement 10: Data Management and Mock Backend

**User Story:** As a system administrator, I want the platform to manage user data, NGO information, and events reliably, so that the community platform operates smoothly.

#### Acceptance Criteria

1. THE CommuniTree_Platform SHALL implement mock database functionality for NGOs, Events, and User_Profiles
2. WHEN users interact with the platform, THE CommuniTree_Platform SHALL persist state using React hooks
3. THE CommuniTree_Platform SHALL maintain data consistency across track switches and navigation
4. WHEN the platform loads, THE CommuniTree_Platform SHALL initialize with sample NGO and event data
5. THE CommuniTree_Platform SHALL handle data operations without external database dependencies during prototype phase
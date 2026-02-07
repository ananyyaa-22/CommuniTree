-- ============================================================================
-- CommuniTree Development Seed Data
-- ============================================================================
-- This script populates the development database with sample data for testing
-- Requirements: 15.1, 15.2, 15.3, 15.4, 15.5, 15.6
-- ============================================================================

-- Note: This script assumes the database schema has already been created
-- Run this after all migrations have been applied

BEGIN;

-- ============================================================================
-- 1. Sample Users with Varying Trust Points
-- ============================================================================
-- Requirements: 15.2

-- Insert sample users (these would normally be created via auth.users trigger)
-- For development, we'll insert directly into the users table
-- In production, users are created through Supabase Auth signup

INSERT INTO users (id, email, display_name, trust_points, verification_status, created_at, updated_at)
VALUES
  -- High trust users
  ('11111111-1111-1111-1111-111111111111', 'alice@example.com', 'Alice Johnson', 95, 'verified', NOW() - INTERVAL '6 months', NOW()),
  ('22222222-2222-2222-2222-222222222222', 'bob@example.com', 'Bob Smith', 88, 'verified', NOW() - INTERVAL '4 months', NOW()),
  
  -- Medium trust users
  ('33333333-3333-3333-3333-333333333333', 'carol@example.com', 'Carol Davis', 65, 'verified', NOW() - INTERVAL '3 months', NOW()),
  ('44444444-4444-4444-4444-444444444444', 'david@example.com', 'David Wilson', 58, 'unverified', NOW() - INTERVAL '2 months', NOW()),
  ('55555555-5555-5555-5555-555555555555', 'emma@example.com', 'Emma Brown', 50, 'unverified', NOW() - INTERVAL '1 month', NOW()),
  
  -- Low trust users
  ('66666666-6666-6666-6666-666666666666', 'frank@example.com', 'Frank Miller', 35, 'unverified', NOW() - INTERVAL '3 weeks', NOW()),
  ('77777777-7777-7777-7777-777777777777', 'grace@example.com', 'Grace Lee', 22, 'unverified', NOW() - INTERVAL '2 weeks', NOW()),
  
  -- New users (default trust points)
  ('88888888-8888-8888-8888-888888888888', 'henry@example.com', 'Henry Taylor', 50, 'unverified', NOW() - INTERVAL '1 week', NOW()),
  ('99999999-9999-9999-9999-999999999999', 'iris@example.com', 'Iris Martinez', 50, 'unverified', NOW() - INTERVAL '3 days', NOW());


-- ============================================================================
-- 2. Sample NGOs with Different Verification Statuses
-- ============================================================================
-- Requirements: 15.3

INSERT INTO ngos (id, name, description, darpan_id, verification_status, contact_email, contact_phone, created_at, updated_at)
VALUES
  -- Verified NGOs
  (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'Green Earth Foundation',
    'Environmental conservation and sustainability initiatives across urban communities.',
    '12345',
    'verified',
    'contact@greenearth.org',
    '+91-9876543210',
    NOW() - INTERVAL '1 year',
    NOW()
  ),
  (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'Hope for Children',
    'Providing education and healthcare support to underprivileged children.',
    '23456',
    'verified',
    'info@hopeforchildren.org',
    '+91-9876543211',
    NOW() - INTERVAL '8 months',
    NOW()
  ),
  (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'Community Kitchen Network',
    'Fighting hunger through community meal programs and food distribution.',
    '34567',
    'verified',
    'hello@communitykitchen.org',
    '+91-9876543212',
    NOW() - INTERVAL '6 months',
    NOW()
  ),
  
  -- Pending verification NGOs
  (
    'dddddddd-dddd-dddd-dddd-dddddddddddd',
    'Tech for Good Initiative',
    'Teaching digital literacy and coding skills to youth in underserved areas.',
    '45678',
    'pending',
    'contact@techforgood.org',
    '+91-9876543213',
    NOW() - INTERVAL '2 weeks',
    NOW()
  ),
  (
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'Animal Welfare Society',
    'Rescue, rehabilitation, and adoption services for stray animals.',
    '56789',
    'pending',
    'info@animalwelfare.org',
    NULL,
    NOW() - INTERVAL '1 week',
    NOW()
  ),
  
  -- Rejected NGO (for testing edge cases)
  (
    'ffffffff-ffff-ffff-ffff-ffffffffffff',
    'Unverified Organization',
    'This organization failed verification due to invalid documentation.',
    '67890',
    'rejected',
    'contact@unverified.org',
    NULL,
    NOW() - INTERVAL '1 month',
    NOW()
  );


-- ============================================================================
-- 3. Sample Venues with Different Safety Ratings
-- ============================================================================
-- Requirements: 15.5

INSERT INTO venues (id, name, address, latitude, longitude, safety_rating, safety_notes, created_at, updated_at)
VALUES
  -- Green (Safe) venues
  (
    '10000000-0000-0000-0000-000000000001',
    'Central Community Center',
    '123 Main Street, Downtown',
    28.6139,
    77.2090,
    'green',
    'Well-lit area with security personnel. Public transportation accessible.',
    NOW() - INTERVAL '1 year',
    NOW()
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    'Riverside Park Pavilion',
    '456 River Road, Riverside District',
    28.6200,
    77.2150,
    'green',
    'Open public space with regular police patrols. Family-friendly environment.',
    NOW() - INTERVAL '8 months',
    NOW()
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    'City Library Auditorium',
    '789 Knowledge Avenue, University Area',
    28.6250,
    77.2200,
    'green',
    NULL,
    NOW() - INTERVAL '6 months',
    NOW()
  ),
  
  -- Yellow (Caution) venues
  (
    '10000000-0000-0000-0000-000000000004',
    'Old Market Square',
    '321 Market Street, Old Town',
    28.6100,
    77.2050,
    'yellow',
    'Crowded area. Keep valuables secure. Avoid after dark.',
    NOW() - INTERVAL '5 months',
    NOW()
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    'Industrial District Hall',
    '654 Factory Lane, Industrial Zone',
    28.6050,
    77.2000,
    'yellow',
    'Limited lighting in evening. Recommend group attendance.',
    NOW() - INTERVAL '3 months',
    NOW()
  ),
  
  -- Red (High Caution) venue
  (
    '10000000-0000-0000-0000-000000000006',
    'Remote Community Outpost',
    'Highway 44, Rural Area',
    28.5900,
    77.1800,
    'red',
    'Remote location with limited mobile connectivity. Daytime events only recommended.',
    NOW() - INTERVAL '2 months',
    NOW()
  );


-- ============================================================================
-- 4. Sample Events Across Impact and Grow Tracks
-- ============================================================================
-- Requirements: 15.4

INSERT INTO events (id, title, description, event_type, track_type, organizer_id, organizer_type, venue_id, start_time, end_time, max_participants, created_at, updated_at)
VALUES
  -- IMPACT TRACK EVENTS (NGO-organized volunteering)
  (
    '20000000-0000-0000-0000-000000000001',
    'Tree Planting Drive',
    'Join us for a community tree planting initiative. We will plant 100 native trees in the riverside area. All materials provided.',
    'Environmental',
    'impact',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'ngo',
    '10000000-0000-0000-0000-000000000002',
    NOW() + INTERVAL '3 days',
    NOW() + INTERVAL '3 days' + INTERVAL '4 hours',
    50,
    NOW() - INTERVAL '2 weeks',
    NOW()
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    'Community Meal Service',
    'Help prepare and serve meals to 200+ community members. Kitchen experience not required.',
    'Food Distribution',
    'impact',
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    'ngo',
    '10000000-0000-0000-0000-000000000001',
    NOW() + INTERVAL '5 days',
    NOW() + INTERVAL '5 days' + INTERVAL '3 hours',
    30,
    NOW() - INTERVAL '1 week',
    NOW()
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    'Coding Workshop for Kids',
    'Teach basic programming concepts to children aged 10-14. Volunteers with tech background preferred.',
    'Education',
    'impact',
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    'ngo',
    '10000000-0000-0000-0000-000000000003',
    NOW() + INTERVAL '1 week',
    NOW() + INTERVAL '1 week' + INTERVAL '2 hours',
    15,
    NOW() - INTERVAL '5 days',
    NOW()
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    'Beach Cleanup Initiative',
    'Monthly beach cleanup event. Gloves and bags provided. Help keep our beaches clean!',
    'Environmental',
    'impact',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'ngo',
    '10000000-0000-0000-0000-000000000002',
    NOW() + INTERVAL '10 days',
    NOW() + INTERVAL '10 days' + INTERVAL '3 hours',
    40,
    NOW() - INTERVAL '3 days',
    NOW()
  ),
  (
    '20000000-0000-0000-0000-000000000005',
    'Animal Shelter Support',
    'Help care for rescued animals. Tasks include feeding, cleaning, and socialization.',
    'Animal Welfare',
    'impact',
    'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    'ngo',
    '10000000-0000-0000-0000-000000000004',
    NOW() + INTERVAL '2 weeks',
    NOW() + INTERVAL '2 weeks' + INTERVAL '4 hours',
    20,
    NOW() - INTERVAL '2 days',
    NOW()
  ),

  -- GROW TRACK EVENTS (User-organized hobby meetups)
  (
    '20000000-0000-0000-0000-000000000006',
    'Photography Walk: Urban Landscapes',
    'Explore the city through your lens. Beginners welcome! Bring your camera or smartphone.',
    'Photography',
    'grow',
    '11111111-1111-1111-1111-111111111111',
    'user',
    '10000000-0000-0000-0000-000000000002',
    NOW() + INTERVAL '4 days',
    NOW() + INTERVAL '4 days' + INTERVAL '3 hours',
    25,
    NOW() - INTERVAL '1 week',
    NOW()
  ),
  (
    '20000000-0000-0000-0000-000000000007',
    'Board Game Night',
    'Casual board game meetup. We have a collection of 50+ games. All skill levels welcome.',
    'Gaming',
    'grow',
    '22222222-2222-2222-2222-222222222222',
    'user',
    '10000000-0000-0000-0000-000000000001',
    NOW() + INTERVAL '6 days',
    NOW() + INTERVAL '6 days' + INTERVAL '4 hours',
    20,
    NOW() - INTERVAL '4 days',
    NOW()
  ),
  (
    '20000000-0000-0000-0000-000000000008',
    'Morning Yoga in the Park',
    'Start your day with outdoor yoga. Bring your own mat. Suitable for all levels.',
    'Fitness',
    'grow',
    '33333333-3333-3333-3333-333333333333',
    'user',
    '10000000-0000-0000-0000-000000000002',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '2 days' + INTERVAL '1 hour',
    30,
    NOW() - INTERVAL '6 days',
    NOW()
  ),
  (
    '20000000-0000-0000-0000-000000000009',
    'Book Club: Science Fiction',
    'Monthly book discussion. This month: "The Three-Body Problem". Coffee and snacks provided.',
    'Reading',
    'grow',
    '44444444-4444-4444-4444-444444444444',
    'user',
    '10000000-0000-0000-0000-000000000003',
    NOW() + INTERVAL '8 days',
    NOW() + INTERVAL '8 days' + INTERVAL '2 hours',
    15,
    NOW() - INTERVAL '2 days',
    NOW()
  ),
  (
    '20000000-0000-0000-0000-000000000010',
    'Cooking Class: Italian Cuisine',
    'Learn to make authentic pasta from scratch. Ingredients provided. Limited spots!',
    'Cooking',
    'grow',
    '55555555-5555-5555-5555-555555555555',
    'user',
    '10000000-0000-0000-0000-000000000001',
    NOW() + INTERVAL '12 days',
    NOW() + INTERVAL '12 days' + INTERVAL '3 hours',
    12,
    NOW() - INTERVAL '1 day',
    NOW()
  ),
  
  -- Past events (for testing history)
  (
    '20000000-0000-0000-0000-000000000011',
    'Community Garden Setup',
    'Completed event: Set up raised beds and planted vegetables.',
    'Environmental',
    'impact',
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    'ngo',
    '10000000-0000-0000-0000-000000000002',
    NOW() - INTERVAL '1 week',
    NOW() - INTERVAL '1 week' + INTERVAL '4 hours',
    25,
    NOW() - INTERVAL '3 weeks',
    NOW()
  ),
  (
    '20000000-0000-0000-0000-000000000012',
    'Hiking Adventure: Mountain Trail',
    'Completed event: 10km hike with scenic views.',
    'Outdoor',
    'grow',
    '11111111-1111-1111-1111-111111111111',
    'user',
    '10000000-0000-0000-0000-000000000006',
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days' + INTERVAL '5 hours',
    20,
    NOW() - INTERVAL '2 weeks',
    NOW()
  );


-- ============================================================================
-- 5. Sample RSVPs with Various Statuses
-- ============================================================================

INSERT INTO rsvps (id, event_id, user_id, status, created_at, updated_at)
VALUES
  -- Confirmed RSVPs for upcoming events
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'confirmed', NOW() - INTERVAL '1 week', NOW()),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'confirmed', NOW() - INTERVAL '6 days', NOW()),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', '33333333-3333-3333-3333-333333333333', 'confirmed', NOW() - INTERVAL '5 days', NOW()),
  
  ('30000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000002', '44444444-4444-4444-4444-444444444444', 'confirmed', NOW() - INTERVAL '4 days', NOW()),
  ('30000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000002', '55555555-5555-5555-5555-555555555555', 'confirmed', NOW() - INTERVAL '3 days', NOW()),
  
  ('30000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000006', '22222222-2222-2222-2222-222222222222', 'confirmed', NOW() - INTERVAL '5 days', NOW()),
  ('30000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333', 'confirmed', NOW() - INTERVAL '4 days', NOW()),
  
  ('30000000-0000-0000-0000-000000000008', '20000000-0000-0000-0000-000000000008', '11111111-1111-1111-1111-111111111111', 'confirmed', NOW() - INTERVAL '5 days', NOW()),
  ('30000000-0000-0000-0000-000000000009', '20000000-0000-0000-0000-000000000008', '44444444-4444-4444-4444-444444444444', 'confirmed', NOW() - INTERVAL '4 days', NOW()),
  ('30000000-0000-0000-0000-000000000010', '20000000-0000-0000-0000-000000000008', '55555555-5555-5555-5555-555555555555', 'confirmed', NOW() - INTERVAL '3 days', NOW()),
  
  -- Cancelled RSVPs
  ('30000000-0000-0000-0000-000000000011', '20000000-0000-0000-0000-000000000003', '66666666-6666-6666-6666-666666666666', 'cancelled', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day'),
  ('30000000-0000-0000-0000-000000000012', '20000000-0000-0000-0000-000000000007', '77777777-7777-7777-7777-777777777777', 'cancelled', NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'),
  
  -- Past event RSVPs with attendance status
  ('30000000-0000-0000-0000-000000000013', '20000000-0000-0000-0000-000000000011', '11111111-1111-1111-1111-111111111111', 'attended', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '1 week'),
  ('30000000-0000-0000-0000-000000000014', '20000000-0000-0000-0000-000000000011', '22222222-2222-2222-2222-222222222222', 'attended', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '1 week'),
  ('30000000-0000-0000-0000-000000000015', '20000000-0000-0000-0000-000000000011', '33333333-3333-3333-3333-333333333333', 'attended', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '1 week'),
  ('30000000-0000-0000-0000-000000000016', '20000000-0000-0000-0000-000000000011', '66666666-6666-6666-6666-666666666666', 'no_show', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '1 week'),
  
  ('30000000-0000-0000-0000-000000000017', '20000000-0000-0000-0000-000000000012', '11111111-1111-1111-1111-111111111111', 'attended', NOW() - INTERVAL '1 week', NOW() - INTERVAL '3 days'),
  ('30000000-0000-0000-0000-000000000018', '20000000-0000-0000-0000-000000000012', '44444444-4444-4444-4444-444444444444', 'attended', NOW() - INTERVAL '1 week', NOW() - INTERVAL '3 days'),
  ('30000000-0000-0000-0000-000000000019', '20000000-0000-0000-0000-000000000012', '77777777-7777-7777-7777-777777777777', 'no_show', NOW() - INTERVAL '1 week', NOW() - INTERVAL '3 days');


-- ============================================================================
-- 6. Sample Chat Threads and Messages
-- ============================================================================
-- Requirements: 15.6

INSERT INTO chat_threads (id, participant_user_id, participant_ngo_id, created_at, updated_at)
VALUES
  ('40000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '2 weeks', NOW() - INTERVAL '1 day'),
  ('40000000-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', NOW() - INTERVAL '1 week', NOW() - INTERVAL '2 hours'),
  ('40000000-0000-0000-0000-000000000003', '33333333-3333-3333-3333-333333333333', 'cccccccc-cccc-cccc-cccc-cccccccccccc', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 hour'),
  ('40000000-0000-0000-0000-000000000004', '44444444-4444-4444-4444-444444444444', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', NOW() - INTERVAL '3 days', NOW() - INTERVAL '30 minutes'),
  ('40000000-0000-0000-0000-000000000005', '55555555-5555-5555-5555-555555555555', 'dddddddd-dddd-dddd-dddd-dddddddddddd', NOW() - INTERVAL '2 days', NOW() - INTERVAL '15 minutes');

INSERT INTO chat_messages (id, thread_id, sender_type, sender_id, message_content, created_at)
VALUES
  -- Thread 1: Alice <-> Green Earth Foundation
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', 'user', '11111111-1111-1111-1111-111111111111', 'Hi! I am interested in volunteering for the tree planting event. What should I bring?', NOW() - INTERVAL '2 weeks'),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', 'ngo', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Hello Alice! Thank you for your interest. We provide all tools and materials. Just bring water, sunscreen, and wear comfortable clothes.', NOW() - INTERVAL '2 weeks' + INTERVAL '30 minutes'),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', 'user', '11111111-1111-1111-1111-111111111111', 'Perfect! I have signed up. Looking forward to it!', NOW() - INTERVAL '2 weeks' + INTERVAL '1 hour'),
  ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000001', 'ngo', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Great! See you there. We will meet at the Riverside Park Pavilion entrance at 9 AM.', NOW() - INTERVAL '2 weeks' + INTERVAL '2 hours'),
  ('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000001', 'user', '11111111-1111-1111-1111-111111111111', 'Quick question - is parking available at the venue?', NOW() - INTERVAL '1 day'),
  ('50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000001', 'ngo', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Yes, there is free parking available. The lot opens at 8:30 AM.', NOW() - INTERVAL '1 day' + INTERVAL '15 minutes'),
  
  -- Thread 2: Bob <-> Hope for Children
  ('50000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000002', 'user', '22222222-2222-2222-2222-222222222222', 'I would like to help with the coding workshop. I have 5 years of software development experience.', NOW() - INTERVAL '1 week'),
  ('50000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000002', 'ngo', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'That is wonderful, Bob! Your experience will be very valuable. Can you commit to the full 2-hour session?', NOW() - INTERVAL '1 week' + INTERVAL '1 hour'),
  ('50000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000002', 'user', '22222222-2222-2222-2222-222222222222', 'Yes, absolutely. What age group will I be working with?', NOW() - INTERVAL '1 week' + INTERVAL '2 hours'),
  ('50000000-0000-0000-0000-000000000010', '40000000-0000-0000-0000-000000000002', 'ngo', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'You will have a group of 5-6 kids aged 10-12. We will be teaching basic Scratch programming.', NOW() - INTERVAL '1 week' + INTERVAL '3 hours'),
  ('50000000-0000-0000-0000-000000000011', '40000000-0000-0000-0000-000000000002', 'user', '22222222-2222-2222-2222-222222222222', 'Perfect! I have used Scratch before. Should I prepare any materials?', NOW() - INTERVAL '6 days'),
  ('50000000-0000-0000-0000-000000000012', '40000000-0000-0000-0000-000000000002', 'ngo', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'We have laptops and lesson plans ready. Just bring your enthusiasm! We will send you the lesson plan PDF tomorrow.', NOW() - INTERVAL '2 hours'),
  
  -- Thread 3: Carol <-> Community Kitchen Network
  ('50000000-0000-0000-0000-000000000013', '40000000-0000-0000-0000-000000000003', 'user', '33333333-3333-3333-3333-333333333333', 'Is the meal service volunteer opportunity suitable for first-timers?', NOW() - INTERVAL '5 days'),
  ('50000000-0000-0000-0000-000000000014', '40000000-0000-0000-0000-000000000003', 'ngo', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Absolutely! We welcome volunteers of all experience levels. We will provide training on-site.', NOW() - INTERVAL '5 days' + INTERVAL '20 minutes'),
  ('50000000-0000-0000-0000-000000000015', '40000000-0000-0000-0000-000000000003', 'user', '33333333-3333-3333-3333-333333333333', 'Great! Do I need to bring anything?', NOW() - INTERVAL '5 days' + INTERVAL '1 hour'),
  ('50000000-0000-0000-0000-000000000016', '40000000-0000-0000-0000-000000000003', 'ngo', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'Just bring yourself! We provide aprons, gloves, and all necessary equipment. Closed-toe shoes are required for safety.', NOW() - INTERVAL '1 hour'),
  
  -- Thread 4: David <-> Green Earth Foundation
  ('50000000-0000-0000-0000-000000000017', '40000000-0000-0000-0000-000000000004', 'user', '44444444-4444-4444-4444-444444444444', 'Can I bring my 8-year-old daughter to the beach cleanup?', NOW() - INTERVAL '3 days'),
  ('50000000-0000-0000-0000-000000000018', '40000000-0000-0000-0000-000000000004', 'ngo', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Yes! Children are welcome with adult supervision. We have smaller gloves and tools available.', NOW() - INTERVAL '3 days' + INTERVAL '45 minutes'),
  ('50000000-0000-0000-0000-000000000019', '40000000-0000-0000-0000-000000000004', 'user', '44444444-4444-4444-4444-444444444444', 'Wonderful! She will be excited. What time should we arrive?', NOW() - INTERVAL '30 minutes'),
  
  -- Thread 5: Emma <-> Tech for Good Initiative
  ('50000000-0000-0000-0000-000000000020', '40000000-0000-0000-0000-000000000005', 'user', '55555555-5555-5555-5555-555555555555', 'I saw your organization is pending verification. Are you still accepting volunteers?', NOW() - INTERVAL '2 days'),
  ('50000000-0000-0000-0000-000000000021', '40000000-0000-0000-0000-000000000005', 'ngo', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Yes, we are! Our verification is in progress. We have been operating for 2 years and have all proper documentation.', NOW() - INTERVAL '2 days' + INTERVAL '30 minutes'),
  ('50000000-0000-0000-0000-000000000022', '40000000-0000-0000-0000-000000000005', 'user', '55555555-5555-5555-5555-555555555555', 'That is good to know. I will keep an eye out for your upcoming events!', NOW() - INTERVAL '15 minutes');


-- ============================================================================
-- 7. Sample Trust Points History
-- ============================================================================

INSERT INTO trust_points_history (id, user_id, delta, reason, related_event_id, created_at)
VALUES
  -- Alice's trust point history (high trust user)
  ('60000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 5, 'Event attendance confirmed', '20000000-0000-0000-0000-000000000011', NOW() - INTERVAL '1 week'),
  ('60000000-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 5, 'Event attendance confirmed', '20000000-0000-0000-0000-000000000012', NOW() - INTERVAL '3 days'),
  ('60000000-0000-0000-0000-000000000003', '11111111-1111-1111-1111-111111111111', 3, 'Positive feedback from organizer', '20000000-0000-0000-0000-000000000011', NOW() - INTERVAL '6 days'),
  
  -- Bob's trust point history
  ('60000000-0000-0000-0000-000000000004', '22222222-2222-2222-2222-222222222222', 5, 'Event attendance confirmed', '20000000-0000-0000-0000-000000000011', NOW() - INTERVAL '1 week'),
  ('60000000-0000-0000-0000-000000000005', '22222222-2222-2222-2222-222222222222', 3, 'Early RSVP bonus', '20000000-0000-0000-0000-000000000001', NOW() - INTERVAL '1 week'),
  
  -- Carol's trust point history
  ('60000000-0000-0000-0000-000000000006', '33333333-3333-3333-3333-333333333333', 5, 'Event attendance confirmed', '20000000-0000-0000-0000-000000000011', NOW() - INTERVAL '1 week'),
  
  -- Frank's trust point history (low trust - has penalties)
  ('60000000-0000-0000-0000-000000000007', '66666666-6666-6666-6666-666666666666', -10, 'No-show for event', '20000000-0000-0000-0000-000000000011', NOW() - INTERVAL '1 week'),
  ('60000000-0000-0000-0000-000000000008', '66666666-6666-6666-6666-666666666666', -5, 'Late cancellation (within 24 hours)', '20000000-0000-0000-0000-000000000003', NOW() - INTERVAL '1 day'),
  
  -- Grace's trust point history (low trust - multiple no-shows)
  ('60000000-0000-0000-0000-000000000009', '77777777-7777-7777-7777-777777777777', -10, 'No-show for event', '20000000-0000-0000-0000-000000000012', NOW() - INTERVAL '3 days'),
  ('60000000-0000-0000-0000-000000000010', '77777777-7777-7777-7777-777777777777', -5, 'Late cancellation (within 24 hours)', '20000000-0000-0000-0000-000000000007', NOW() - INTERVAL '1 day'),
  
  -- David's trust point history
  ('60000000-0000-0000-0000-000000000011', '44444444-4444-4444-4444-444444444444', 5, 'Event attendance confirmed', '20000000-0000-0000-0000-000000000012', NOW() - INTERVAL '3 days');

COMMIT;

-- ============================================================================
-- Seed Data Summary
-- ============================================================================
-- Users: 9 users with varying trust points (22-95 range)
-- NGOs: 6 organizations (3 verified, 2 pending, 1 rejected)
-- Venues: 6 venues (3 green, 2 yellow, 1 red safety ratings)
-- Events: 12 events (5 Impact track, 5 Grow track, 2 past events)
-- RSVPs: 19 RSVPs (various statuses: confirmed, cancelled, attended, no_show)
-- Chat Threads: 5 active conversations between users and NGOs
-- Chat Messages: 22 messages across all threads
-- Trust Points History: 11 audit records showing point changes
-- ============================================================================


/**
 * Comprehensive mock data generator for CommuniTree platform
 * Provides diverse sample data for NGOs, events, users, and chat histories
 */

import { User, NGO, Event, Venue, ChatThread, Message, UserEvent, ContactInfo } from '../types';
import { createVenueWithRating } from './venueRating';

// Sample user names and data for diverse mock users
const SAMPLE_USERS = [
  { name: 'Alex Johnson', email: 'alex.johnson@example.com' },
  { name: 'Priya Sharma', email: 'priya.sharma@example.com' },
  { name: 'Michael Chen', email: 'michael.chen@example.com' },
  { name: 'Aisha Patel', email: 'aisha.patel@example.com' },
  { name: 'David Rodriguez', email: 'david.rodriguez@example.com' },
  { name: 'Fatima Al-Zahra', email: 'fatima.alzahra@example.com' },
  { name: 'Raj Kumar', email: 'raj.kumar@example.com' },
  { name: 'Sarah Williams', email: 'sarah.williams@example.com' },
  { name: 'Arjun Mehta', email: 'arjun.mehta@example.com' },
  { name: 'Lisa Thompson', email: 'lisa.thompson@example.com' },
];

// NGO data with varied verification statuses
const NGO_DATA = [
  {
    name: 'Green Earth Foundation',
    projectTitle: 'Community Garden Initiative',
    description: 'Help us create sustainable community gardens in urban areas. We need volunteers for planting, maintenance, and educational workshops.',
    category: 'Environment' as const,
    darpanId: '12345',
    isVerified: true,
    volunteersNeeded: 15,
    currentVolunteers: 8,
  },
  {
    name: 'Education for All',
    projectTitle: 'Digital Literacy Program',
    description: 'Teaching basic computer skills to underprivileged children. Join us in bridging the digital divide.',
    category: 'Education' as const,
    darpanId: undefined,
    isVerified: false,
    volunteersNeeded: 20,
    currentVolunteers: 12,
  },
  {
    name: 'Animal Care Society',
    projectTitle: 'Street Animal Rescue',
    description: 'Rescue, treat, and rehabilitate street animals. We need volunteers for feeding, medical care, and adoption drives.',
    category: 'Animal Welfare' as const,
    darpanId: '67890',
    isVerified: true,
    volunteersNeeded: 25,
    currentVolunteers: 18,
  },
  {
    name: 'Healing Hands Clinic',
    projectTitle: 'Free Health Checkup Camps',
    description: 'Organize health checkup camps in rural areas. We need volunteers to assist doctors and manage patient registration.',
    category: 'Healthcare' as const,
    darpanId: '54321',
    isVerified: true,
    volunteersNeeded: 30,
    currentVolunteers: 22,
  },
  {
    name: 'Women Empowerment Network',
    projectTitle: 'Skill Development Workshops',
    description: 'Conduct skill development workshops for women in underserved communities. Help us teach vocational skills.',
    category: 'Women Empowerment' as const,
    darpanId: undefined,
    isVerified: false,
    volunteersNeeded: 18,
    currentVolunteers: 10,
  },
  {
    name: 'Child Future Foundation',
    projectTitle: 'After School Support Program',
    description: 'Provide after-school tutoring and mentorship for children from low-income families.',
    category: 'Child Welfare' as const,
    darpanId: '98765',
    isVerified: true,
    volunteersNeeded: 40,
    currentVolunteers: 35,
  },
  {
    name: 'Community Builders',
    projectTitle: 'Neighborhood Cleanup Drive',
    description: 'Monthly community cleanup drives to maintain clean and healthy neighborhoods.',
    category: 'Community Development' as const,
    darpanId: undefined,
    isVerified: false,
    volunteersNeeded: 50,
    currentVolunteers: 28,
  },
  {
    name: 'Disaster Relief Corps',
    projectTitle: 'Emergency Response Training',
    description: 'Train volunteers for disaster response and emergency relief operations.',
    category: 'Disaster Relief' as const,
    darpanId: '13579',
    isVerified: true,
    volunteersNeeded: 60,
    currentVolunteers: 45,
  },
];

// Event data with different venue types and categories
const EVENT_DATA = [
  {
    title: 'Poetry Under the Stars',
    description: 'Join us for an evening of spoken word poetry in the beautiful Central Park. Share your own poems or just enjoy listening to others.',
    category: 'Poetry' as const,
    venueType: 'public' as const,
    maxAttendees: 30,
    duration: 120,
    rsvpCount: 2,
  },
  {
    title: 'Watercolor Workshop',
    description: 'Learn basic watercolor techniques in a cozy coffee house setting. All materials provided. Perfect for beginners!',
    category: 'Art' as const,
    venueType: 'commercial' as const,
    maxAttendees: 15,
    duration: 180,
    rsvpCount: 3,
  },
  {
    title: 'Morning Yoga Session',
    description: 'Start your day with energizing yoga practice. Suitable for all levels. Bring your own mat or rent one at the studio.',
    category: 'Fitness' as const,
    venueType: 'commercial' as const,
    maxAttendees: 20,
    duration: 90,
    rsvpCount: 1,
  },
  {
    title: 'Book Club: Modern Fiction',
    description: 'Monthly book discussion focusing on contemporary fiction. This month we\'re reading "The Seven Husbands of Evelyn Hugo".',
    category: 'Reading' as const,
    venueType: 'public' as const,
    maxAttendees: 12,
    duration: 120,
    rsvpCount: 2,
  },
  {
    title: 'Jazz Jam Session',
    description: 'Bring your instruments and join our weekly jazz jam session. All skill levels welcome!',
    category: 'Music' as const,
    venueType: 'commercial' as const,
    maxAttendees: 25,
    duration: 150,
    rsvpCount: 4,
  },
  {
    title: 'Contemporary Dance Workshop',
    description: 'Learn contemporary dance moves with professional instructors. No prior experience needed.',
    category: 'Dance' as const,
    venueType: 'commercial' as const,
    maxAttendees: 18,
    duration: 120,
    rsvpCount: 3,
  },
  {
    title: 'Cooking Class: Italian Cuisine',
    description: 'Master the art of Italian cooking with hands-on pasta making and sauce preparation.',
    category: 'Cooking' as const,
    venueType: 'commercial' as const,
    maxAttendees: 12,
    duration: 180,
    rsvpCount: 5,
  },
  {
    title: 'Tech Talk: AI and Future',
    description: 'Discussion on artificial intelligence trends and their impact on society.',
    category: 'Technology' as const,
    venueType: 'public' as const,
    maxAttendees: 50,
    duration: 90,
    rsvpCount: 8,
  },
  {
    title: 'Photography Walk',
    description: 'Explore the city through your lens. Bring your camera and capture beautiful moments.',
    category: 'Photography' as const,
    venueType: 'public' as const,
    maxAttendees: 15,
    duration: 180,
    rsvpCount: 6,
  },
  {
    title: 'Urban Gardening Workshop',
    description: 'Learn how to grow your own herbs and vegetables in small urban spaces.',
    category: 'Gardening' as const,
    venueType: 'public' as const,
    maxAttendees: 20,
    duration: 150,
    rsvpCount: 4,
  },
];

// Venue data with different types and locations
const VENUE_DATA = [
  {
    name: 'Central Park Community Center',
    address: '123 Park Avenue, Mumbai, Maharashtra',
    type: 'public' as const,
    coordinates: [19.0760, 72.8777] as [number, number],
    capacity: 100,
  },
  {
    name: 'Artisan Coffee House',
    address: '456 Brew Street, Delhi',
    type: 'commercial' as const,
    coordinates: [28.6139, 77.2090] as [number, number],
    capacity: 50,
  },
  {
    name: 'Fitness First Studio',
    address: '789 Health Road, Bangalore, Karnataka',
    type: 'commercial' as const,
    coordinates: [12.9716, 77.5946] as [number, number],
    capacity: 30,
  },
  {
    name: 'City Library Reading Room',
    address: '321 Book Street, Chennai, Tamil Nadu',
    type: 'public' as const,
    coordinates: [13.0827, 80.2707] as [number, number],
    capacity: 80,
  },
  {
    name: 'Harmony Music Lounge',
    address: '654 Melody Lane, Pune, Maharashtra',
    type: 'commercial' as const,
    coordinates: [18.5204, 73.8567] as [number, number],
    capacity: 40,
  },
  {
    name: 'Dance Academy Studio',
    address: '987 Rhythm Road, Hyderabad, Telangana',
    type: 'commercial' as const,
    coordinates: [17.3850, 78.4867] as [number, number],
    capacity: 25,
  },
  {
    name: 'Culinary Arts Center',
    address: '147 Flavor Street, Kolkata, West Bengal',
    type: 'commercial' as const,
    coordinates: [22.5726, 88.3639] as [number, number],
    capacity: 20,
  },
  {
    name: 'Innovation Hub Auditorium',
    address: '258 Tech Park, Gurgaon, Haryana',
    type: 'public' as const,
    coordinates: [28.4595, 77.0266] as [number, number],
    capacity: 150,
  },
  {
    name: 'Riverside Park Pavilion',
    address: '369 River View, Ahmedabad, Gujarat',
    type: 'public' as const,
    coordinates: [23.0225, 72.5714] as [number, number],
    capacity: 60,
  },
  {
    name: 'Green Thumb Garden Center',
    address: '741 Garden Path, Jaipur, Rajasthan',
    type: 'public' as const,
    coordinates: [26.9124, 75.7873] as [number, number],
    capacity: 35,
  },
];

/**
 * Generate mock users with varied trust points and verification statuses
 */
export const generateMockUsers = (): User[] => {
  return SAMPLE_USERS.map((userData, index) => {
    const baseDate = new Date('2024-01-01');
    const createdAt = new Date(baseDate.getTime() + index * 24 * 60 * 60 * 1000);
    
    // Vary trust points and verification status
    const trustPoints = Math.floor(Math.random() * 80) + 20; // 20-100 range
    const verificationStatus = Math.random() > 0.3 ? 'verified' : 'pending';
    
    // Generate some event history
    const eventHistory: UserEvent[] = [];
    const numEvents = Math.floor(Math.random() * 5) + 1;
    
    for (let i = 0; i < numEvents; i++) {
      const eventDate = new Date(createdAt.getTime() + (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const eventType = Math.random() > 0.7 ? 'organized' : 'attended';
      const trustPointsAwarded = eventType === 'organized' ? 20 : 5;
      
      eventHistory.push({
        id: `ue_${index}_${i}`,
        eventId: `evt_${Math.floor(Math.random() * 10) + 1}`,
        type: eventType,
        timestamp: eventDate,
        trustPointsAwarded,
      });
    }

    return {
      id: `user_${String(index + 1).padStart(3, '0')}`,
      name: userData.name,
      email: userData.email,
      trustPoints,
      verificationStatus,
      chatHistory: [], // Will be populated when chat threads are created
      eventHistory,
      createdAt,
      updatedAt: new Date(createdAt.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000),
    };
  });
};

/**
 * Generate mock NGOs with varied verification statuses
 */
export const generateMockNGOs = (): NGO[] => {
  return NGO_DATA.map((ngoData, index) => {
    const baseDate = new Date('2023-12-01');
    const createdAt = new Date(baseDate.getTime() + index * 5 * 24 * 60 * 60 * 1000);
    
    const contactInfo: ContactInfo = {
      email: `contact@${ngoData.name.toLowerCase().replace(/\s+/g, '')}.org`,
      phone: `+91-98765432${String(index).padStart(2, '0')}`,
      website: ngoData.isVerified ? `https://${ngoData.name.toLowerCase().replace(/\s+/g, '')}.org` : undefined,
      address: `${100 + index * 10} ${ngoData.category} Street, Mumbai, Maharashtra`,
    };

    return {
      id: `ngo_${String(index + 1).padStart(3, '0')}`,
      name: ngoData.name,
      projectTitle: ngoData.projectTitle,
      description: ngoData.description,
      darpanId: ngoData.darpanId,
      isVerified: ngoData.isVerified,
      contactInfo,
      category: ngoData.category,
      volunteersNeeded: ngoData.volunteersNeeded,
      currentVolunteers: ngoData.currentVolunteers,
      createdAt,
      updatedAt: new Date(createdAt.getTime() + Math.random() * 60 * 24 * 60 * 60 * 1000),
    };
  });
};

/**
 * Generate mock venues with proper safety ratings
 */
export const generateMockVenues = (): Venue[] => {
  return VENUE_DATA.map((venueData, index) => {
    const baseVenue = {
      id: `venue_${index + 1}`,
      name: venueData.name,
      address: venueData.address,
      type: venueData.type,
      coordinates: venueData.coordinates,
      description: `A ${venueData.type} venue for community events`,
      amenities: venueData.type === 'public' 
        ? ['parking', 'restrooms', 'accessibility'] 
        : ['wifi', 'seating'],
      capacity: venueData.capacity,
      accessibilityFeatures: ['wheelchair_accessible'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    return createVenueWithRating(baseVenue);
  });
};

/**
 * Generate mock events with varied categories and venues
 */
export const generateMockEvents = (users: User[], venues: Venue[]): Event[] => {
  return EVENT_DATA.map((eventData, index) => {
    const organizer = users[index % users.length];
    const venue = venues.find(v => v.type === eventData.venueType) || venues[0];
    
    // Generate future dates for events
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + index + 1);
    const eventDateTime = new Date(baseDate);
    eventDateTime.setHours(Math.floor(Math.random() * 12) + 10); // 10 AM to 10 PM
    eventDateTime.setMinutes(Math.random() > 0.5 ? 0 : 30);

    // Generate RSVP list
    const rsvpList: string[] = [];
    for (let i = 0; i < eventData.rsvpCount; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      if (!rsvpList.includes(randomUser.id) && randomUser.id !== organizer.id) {
        rsvpList.push(randomUser.id);
      }
    }

    return {
      id: `evt_${String(index + 1).padStart(3, '0')}`,
      title: eventData.title,
      description: eventData.description,
      category: eventData.category,
      venue,
      organizer,
      attendees: [], // Will be populated from RSVP list
      rsvpList,
      maxAttendees: eventData.maxAttendees,
      dateTime: eventDateTime,
      duration: eventData.duration,
      isActive: true,
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    };
  });
};

/**
 * Generate sample chat messages
 */
const generateSampleMessages = (threadId: string, participants: User[]): Message[] => {
  const messages: Message[] = [];
  const sampleMessages = [
    "Hi! I'm interested in volunteering for this project.",
    "That's great! We'd love to have you join us.",
    "What are the time commitments involved?",
    "We typically meet twice a week for 2-3 hours each session.",
    "That sounds perfect. How do I get started?",
    "I'll send you the registration form and schedule details.",
  ];

  sampleMessages.forEach((content, index) => {
    const sender = participants[index % participants.length];
    const timestamp = new Date(Date.now() - (sampleMessages.length - index) * 60 * 60 * 1000);
    
    messages.push({
      id: `msg_${threadId}_${index + 1}`,
      senderId: sender.id,
      content,
      timestamp,
      type: 'text',
      isRead: Math.random() > 0.3,
    });
  });

  return messages;
};

/**
 * Generate mock chat threads for NGOs and events
 */
export const generateMockChatThreads = (users: User[], ngos: NGO[], events: Event[]): ChatThread[] => {
  const chatThreads: ChatThread[] = [];
  
  // Generate NGO chat threads
  ngos.slice(0, 3).forEach((ngo, index) => {
    const volunteer = users[index + 1];
    const participants = [volunteer, users[0]]; // Assuming users[0] is the NGO representative
    
    const thread: ChatThread = {
      id: `chat_ngo_${ngo.id}`,
      participants,
      context: {
        type: 'ngo',
        reference: ngo,
        title: `Volunteer Chat - ${ngo.name}`,
        description: ngo.projectTitle,
      },
      messages: generateSampleMessages(`chat_ngo_${ngo.id}`, participants),
      lastActivity: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    };
    
    chatThreads.push(thread);
  });

  // Generate event chat threads
  events.slice(0, 2).forEach((event, index) => {
    const attendee = users[index + 2];
    const participants = [attendee, event.organizer];
    
    const thread: ChatThread = {
      id: `chat_event_${event.id}`,
      participants,
      context: {
        type: 'event',
        reference: event,
        title: `Event Chat - ${event.title}`,
        description: `Discussion about ${event.title}`,
      },
      messages: generateSampleMessages(`chat_event_${event.id}`, participants),
      lastActivity: new Date(Date.now() - Math.random() * 12 * 60 * 60 * 1000),
      isActive: true,
      createdAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(),
    };
    
    chatThreads.push(thread);
  });

  return chatThreads;
};

/**
 * Generate complete mock dataset for the application
 */
export const generateComprehensiveMockData = () => {
  const users = generateMockUsers();
  const ngos = generateMockNGOs();
  const venues = generateMockVenues();
  const events = generateMockEvents(users, venues);
  const chatThreads = generateMockChatThreads(users, ngos, events);

  // Update users with chat thread references
  users.forEach(user => {
    user.chatHistory = chatThreads
      .filter(thread => thread.participants.some(p => p.id === user.id))
      .map(thread => thread.id);
  });

  return {
    users,
    ngos,
    venues,
    events,
    chatThreads,
  };
};
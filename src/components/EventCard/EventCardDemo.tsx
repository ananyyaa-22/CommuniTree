/**
 * EventCard Demo Component
 * Showcases EventCard with different safety ratings and states
 */

import React from 'react';
import { EventCard } from './EventCard';
import { Event, User, Venue } from '../../types';
import { createVenueWithRating } from '../../utils/venueRating';

const mockUser: User = {
  id: 'user-1',
  name: 'Sarah Johnson',
  email: 'sarah@example.com',
  trustPoints: 75,
  verificationStatus: 'verified',
  chatHistory: [],
  eventHistory: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const createMockVenue = (type: 'public' | 'commercial' | 'private', name: string): Venue => 
  createVenueWithRating({
    id: `venue-${type}`,
    name,
    address: '123 Main Street, City',
    type,
    coordinates: [40.7128, -74.0060],
    amenities: ['Parking', 'WiFi'],
    accessibilityFeatures: ['Wheelchair accessible'],
    createdAt: new Date(),
    updatedAt: new Date(),
  });

const createMockEvent = (
  id: string,
  title: string,
  category: Event['category'],
  venue: Venue,
  rsvpCount: number = 5
): Event => ({
  id,
  title,
  description: `Join us for an amazing ${category.toLowerCase()} experience! This event promises to be engaging and fun for everyone involved.`,
  category,
  venue,
  organizer: mockUser,
  attendees: [],
  rsvpList: Array.from({ length: rsvpCount }, (_, i) => `user-${i + 2}`),
  maxAttendees: 20,
  dateTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
  duration: 120,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
});

export const EventCardDemo: React.FC = () => {
  const handleChat = (event: Event) => {
    console.log('Chat with organizer for event:', event.title);
  };

  // Create demo events with different safety ratings
  const safeEvent = createMockEvent(
    'event-safe',
    'Poetry Reading at Community Center',
    'Poetry',
    createMockVenue('public', 'Downtown Community Center'),
    8
  );

  const moderateEvent = createMockEvent(
    'event-moderate',
    'Art Workshop at Local Cafe',
    'Art',
    createMockVenue('commercial', 'Artisan Coffee & Studio'),
    12
  );

  const cautionEvent = createMockEvent(
    'event-caution',
    'Book Club at Private Residence',
    'Reading',
    createMockVenue('private', 'Sarah\'s Home Library'),
    4
  );

  const nearFullEvent = createMockEvent(
    'event-full',
    'Fitness Bootcamp in the Park',
    'Fitness',
    createMockVenue('public', 'Central Park Pavilion'),
    18 // Near capacity
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">EventCard Component Demo</h1>
        
        <div className="space-y-8">
          {/* Grid View Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Grid View Layout</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <h3 className="text-lg font-medium text-green-700 mb-2">Safe Venue (Green Badge)</h3>
                <EventCard 
                  event={safeEvent} 
                  viewMode="grid" 
                  onChat={handleChat}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-yellow-700 mb-2">Moderate Risk (Yellow Badge)</h3>
                <EventCard 
                  event={moderateEvent} 
                  viewMode="grid" 
                  onChat={handleChat}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-red-700 mb-2">High Caution (Red Badge)</h3>
                <EventCard 
                  event={cautionEvent} 
                  viewMode="grid" 
                  onChat={handleChat}
                />
              </div>
            </div>
          </section>

          {/* List View Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">List View Layout</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium text-orange-700 mb-2">Nearly Full Event</h3>
                <EventCard 
                  event={nearFullEvent} 
                  viewMode="list" 
                  onChat={handleChat}
                />
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-blue-700 mb-2">Regular Event (List View)</h3>
                <EventCard 
                  event={safeEvent} 
                  viewMode="list" 
                  onChat={handleChat}
                />
              </div>
            </div>
          </section>

          {/* Feature Highlights */}
          <section className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Key Features Demonstrated</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Safety Rating System</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>🟢 <strong>Green Badge:</strong> Safe public venues (parks, libraries)</li>
                  <li>🟡 <strong>Yellow Badge:</strong> Moderate risk commercial venues (cafes, studios)</li>
                  <li>🔴 <strong>Red Badge:</strong> High caution private venues (homes)</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">RSVP & Trust Points</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>✅ RSVP functionality with capacity tracking</li>
                  <li>⚠️ Trust points warnings for low-trust users</li>
                  <li>📊 Real-time attendee count display</li>
                  <li>🚫 Automatic disabling for full/past events</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Chat Integration</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>💬 Direct messaging with event organizers</li>
                  <li>📱 Accessible from both grid and list views</li>
                  <li>🔗 Context-aware chat initialization</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">Responsive Design</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>📱 Mobile-first responsive layout</li>
                  <li>🔄 Grid and list view modes</li>
                  <li>🎨 Track-based theming (Grow track colors)</li>
                  <li>♿ Accessibility-friendly design</li>
                </ul>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EventCardDemo;
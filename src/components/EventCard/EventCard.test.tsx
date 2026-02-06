/**
 * EventCard Component Tests
 * Tests for event display, safety badges, and RSVP functionality
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard } from './EventCard';
import { AppProvider } from '../../context';
import { Event, User, Venue } from '../../types';
import { createVenueWithRating } from '../../utils/venueRating';

// Mock date-fns to avoid timezone issues in tests
jest.mock('date-fns', () => ({
  format: jest.fn((date: Date, formatStr: string) => {
    if (formatStr === 'MMM dd, yyyy') return 'Dec 25, 2023';
    if (formatStr === 'h:mm a') return '2:00 PM';
    return 'mocked-date';
  }),
}));

// Mock hooks
jest.mock('../../hooks/useEvents', () => ({
  useEvents: () => ({
    hasUserRSVPd: jest.fn(() => false),
    rsvpToEvent: jest.fn(),
    cancelRSVP: jest.fn(),
  }),
}));

jest.mock('../../hooks/useTrustPoints', () => ({
  useTrustPoints: () => ({
    canRSVP: jest.fn(() => true),
    getRSVPWarning: jest.fn(() => null),
    shouldShowWarning: false,
  }),
}));

const mockUser: User = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  trustPoints: 75,
  verificationStatus: 'verified',
  chatHistory: [],
  eventHistory: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockVenue: Venue = createVenueWithRating({
  id: 'venue-1',
  name: 'Community Center',
  address: '123 Main St',
  type: 'public',
  coordinates: [40.7128, -74.0060],
  amenities: ['Parking', 'WiFi'],
  accessibilityFeatures: ['Wheelchair accessible'],
  createdAt: new Date(),
  updatedAt: new Date(),
});

const mockEvent: Event = {
  id: 'event-1',
  title: 'Poetry Reading Night',
  description: 'Join us for an evening of beautiful poetry and community connection.',
  category: 'Poetry',
  venue: mockVenue,
  organizer: mockUser,
  attendees: [],
  rsvpList: ['user-2', 'user-3'],
  maxAttendees: 20,
  dateTime: new Date('2023-12-25T14:00:00'),
  duration: 120,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const renderEventCard = (props: Partial<React.ComponentProps<typeof EventCard>> = {}) => {
  return render(
    <AppProvider>
      <EventCard event={mockEvent} {...props} />
    </AppProvider>
  );
};

describe('EventCard Component', () => {
  describe('Basic Rendering', () => {
    it('renders event title and description', () => {
      renderEventCard();
      
      expect(screen.getByText('Poetry Reading Night')).toBeInTheDocument();
      expect(screen.getByText(/Join us for an evening of beautiful poetry/)).toBeInTheDocument();
    });

    it('displays event category badge', () => {
      renderEventCard();
      
      expect(screen.getByText('Poetry')).toBeInTheDocument();
    });

    it('shows venue information', () => {
      renderEventCard();
      
      expect(screen.getByText('Community Center')).toBeInTheDocument();
    });

    it('displays formatted date and time', () => {
      renderEventCard();
      
      expect(screen.getByText('Dec 25, 2023')).toBeInTheDocument();
      expect(screen.getByText('2:00 PM (2h)')).toBeInTheDocument();
    });

    it('shows attendee count', () => {
      renderEventCard();
      
      expect(screen.getByText('2/20')).toBeInTheDocument();
    });
  });

  describe('Safety Badge System', () => {
    it('displays green safety badge for public venues', () => {
      renderEventCard();
      
      expect(screen.getByText('Safe Venue')).toBeInTheDocument();
    });

    it('displays yellow safety badge for commercial venues', () => {
      const commercialVenue = createVenueWithRating({ 
        ...mockVenue, 
        type: 'commercial' as const,
        id: 'venue-commercial'
      });
      const commercialEvent = { ...mockEvent, venue: commercialVenue };
      
      renderEventCard({ event: commercialEvent });
      
      expect(screen.getByText('Moderate Risk')).toBeInTheDocument();
    });

    it('displays red safety badge for private venues', () => {
      const privateVenue = createVenueWithRating({ 
        ...mockVenue, 
        type: 'private' as const,
        id: 'venue-private'
      });
      const privateEvent = { ...mockEvent, venue: privateVenue };
      
      renderEventCard({ event: privateEvent });
      
      expect(screen.getByText('High Caution')).toBeInTheDocument();
    });

    it('shows safety description', () => {
      renderEventCard();
      
      expect(screen.getByText(/Safe - Public venue with good security/)).toBeInTheDocument();
    });
  });

  describe('RSVP Functionality', () => {
    it('displays RSVP button when user can RSVP', () => {
      renderEventCard();
      
      expect(screen.getByRole('button', { name: /RSVP/ })).toBeInTheDocument();
    });

    it('shows event full message when at capacity', () => {
      const fullEvent = { 
        ...mockEvent, 
        rsvpList: Array.from({ length: 20 }, (_, i) => `user-${i}`) 
      };
      
      renderEventCard({ event: fullEvent });
      
      expect(screen.getByText('Event Full')).toBeInTheDocument();
    });

    it('displays spots remaining warning when few spots left', () => {
      const nearFullEvent = { 
        ...mockEvent, 
        rsvpList: Array.from({ length: 17 }, (_, i) => `user-${i}`) 
      };
      
      renderEventCard({ event: nearFullEvent, viewMode: 'grid' });
      
      expect(screen.getByText('Only 3 spots remaining!')).toBeInTheDocument();
    });
  });

  describe('Chat Integration', () => {
    it('displays chat button', () => {
      renderEventCard();
      
      expect(screen.getByRole('button', { name: /Chat/ })).toBeInTheDocument();
    });

    it('calls onChat when chat button is clicked', () => {
      const mockOnChat = jest.fn();
      renderEventCard({ onChat: mockOnChat });
      
      fireEvent.click(screen.getByRole('button', { name: /Chat/ }));
      
      expect(mockOnChat).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('Responsive Layout', () => {
    it('renders in grid view by default', () => {
      const { container } = renderEventCard();
      
      expect(container.firstChild).toHaveClass('flex-col');
    });

    it('renders in list view when specified', () => {
      const { container } = renderEventCard({ viewMode: 'list' });
      
      expect(container.firstChild).toHaveClass('flex-row');
    });
  });

  describe('Organizer Information', () => {
    it('displays organizer name', () => {
      renderEventCard();
      
      expect(screen.getByText(/Organized by/)).toBeInTheDocument();
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });
  });
});
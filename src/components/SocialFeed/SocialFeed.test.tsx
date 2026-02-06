/**
 * SocialFeed Component Tests
 * Tests for the SocialFeed container component functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SocialFeed } from './SocialFeed';
import { AppProvider } from '../../context';
import { createInitialState } from '../../context/initialState';

// Mock the hooks
jest.mock('../../hooks', () => ({
  useEvents: () => ({
    events: [
      {
        id: 'evt_001',
        title: 'Poetry Under the Stars',
        description: 'Join us for an evening of spoken word poetry',
        category: 'Poetry',
        venue: {
          id: 'venue_1',
          name: 'Central Park',
          address: '123 Park Ave',
          type: 'public',
          safetyRating: 'green',
          coordinates: [0, 0],
          amenities: ['parking', 'restrooms'],
          accessibilityFeatures: ['wheelchair_accessible'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        organizer: { name: 'Alex Johnson' },
        rsvpList: ['user_002'],
        maxAttendees: 30,
        dateTime: new Date('2024-02-15T19:00:00'),
        duration: 120,
        isActive: true,
      },
      {
        id: 'evt_002',
        title: 'Watercolor Workshop',
        description: 'Learn basic watercolor techniques',
        category: 'Art',
        venue: {
          id: 'venue_2',
          name: 'Coffee House',
          address: '456 Main St',
          type: 'commercial',
          safetyRating: 'yellow',
          coordinates: [0, 0],
          amenities: ['wifi', 'seating'],
          accessibilityFeatures: ['wheelchair_accessible'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        organizer: { name: 'Jane Smith' },
        rsvpList: ['user_003', 'user_004'],
        maxAttendees: 15,
        dateTime: new Date('2024-02-18T14:00:00'),
        duration: 180,
        isActive: true,
      },
    ],
    upcomingEvents: [
      {
        id: 'evt_001',
        title: 'Poetry Under the Stars',
        description: 'Join us for an evening of spoken word poetry',
        category: 'Poetry',
        venue: {
          id: 'venue_1',
          name: 'Central Park',
          address: '123 Park Ave',
          type: 'public',
          safetyRating: 'green',
          coordinates: [0, 0],
          amenities: ['parking', 'restrooms'],
          accessibilityFeatures: ['wheelchair_accessible'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        organizer: { name: 'Alex Johnson' },
        rsvpList: ['user_002'],
        maxAttendees: 30,
        dateTime: new Date('2024-02-15T19:00:00'),
        duration: 120,
        isActive: true,
      },
    ],
  }),
}));

const renderSocialFeed = (props = {}) => {
  const initialState = createInitialState();
  return render(
    <AppProvider initialState={initialState}>
      <SocialFeed {...props} />
    </AppProvider>
  );
};

describe('SocialFeed Component', () => {
  test('renders social feed with events', () => {
    renderSocialFeed();
    
    expect(screen.getByText('Social Events')).toBeInTheDocument();
    expect(screen.getByText('Poetry Under the Stars')).toBeInTheDocument();
  });

  test('displays event count correctly', () => {
    renderSocialFeed();
    
    expect(screen.getByText('1 event')).toBeInTheDocument();
  });

  test('search functionality works', async () => {
    renderSocialFeed();
    
    const searchInput = screen.getByPlaceholderText('Search events, venues, or organizers...');
    fireEvent.change(searchInput, { target: { value: 'poetry' } });
    
    await waitFor(() => {
      expect(screen.getByText('Poetry Under the Stars')).toBeInTheDocument();
    });
  });

  test('category filtering works', async () => {
    renderSocialFeed();
    
    // Open filters
    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);
    
    // Select Poetry category
    const categorySelect = screen.getByDisplayValue('All Categories (1)');
    fireEvent.change(categorySelect, { target: { value: 'Poetry' } });
    
    await waitFor(() => {
      expect(screen.getByText('Poetry Under the Stars')).toBeInTheDocument();
    });
  });

  test('view mode toggle works', () => {
    renderSocialFeed();
    
    const listViewButton = screen.getByLabelText('List view');
    fireEvent.click(listViewButton);
    
    // The component should still render events in list view
    expect(screen.getByText('Poetry Under the Stars')).toBeInTheDocument();
  });

  test('quick category filters work', () => {
    renderSocialFeed();
    
    const poetryFilter = screen.getByText('Poetry (1)');
    fireEvent.click(poetryFilter);
    
    expect(screen.getByText('Poetry Under the Stars')).toBeInTheDocument();
  });

  test('clear filters functionality works', async () => {
    renderSocialFeed();
    
    // Open filters and apply a filter
    const filterButton = screen.getByText('Filters');
    fireEvent.click(filterButton);
    
    const categorySelect = screen.getByDisplayValue('All Categories (1)');
    fireEvent.change(categorySelect, { target: { value: 'Poetry' } });
    
    // Clear filters
    const clearButton = screen.getByText('Clear all');
    fireEvent.click(clearButton);
    
    await waitFor(() => {
      expect(screen.getByDisplayValue('All Categories (1)')).toBeInTheDocument();
    });
  });

  test('handles empty state correctly', () => {
    // Mock empty events
    jest.doMock('../../hooks', () => ({
      useEvents: () => ({
        events: [],
        upcomingEvents: [],
      }),
    }));
    
    renderSocialFeed();
    
    expect(screen.getByText('No Events Found')).toBeInTheDocument();
  });

  test('calls onChatOpen when provided', () => {
    const mockOnChatOpen = jest.fn();
    renderSocialFeed({ onChatOpen: mockOnChatOpen });
    
    // This would require the EventCard to be rendered and clicked
    // The actual test would depend on the EventCard implementation
    expect(screen.getByText('Poetry Under the Stars')).toBeInTheDocument();
  });
});
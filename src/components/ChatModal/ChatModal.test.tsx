/**
 * ChatModal Component Tests
 * Tests for the universal chat interface functionality
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChatModal } from './ChatModal';
import { AppProvider } from '../../context/AppContext';
import { ChatContext } from '../../types/ChatThread';
import { NGO } from '../../types/NGO';
import { Event } from '../../types/Event';

// Mock data
const mockNGO: NGO = {
  id: 'ngo_1',
  name: 'Green Earth Foundation',
  projectTitle: 'Tree Planting Initiative',
  description: 'Plant trees in urban areas',
  darpanId: '12345',
  isVerified: true,
  contactInfo: {
    email: 'contact@greenearth.org',
    phone: '+1234567890',
  },
  category: 'Environment',
  volunteersNeeded: 10,
  currentVolunteers: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEvent: Event = {
  id: 'evt_1',
  title: 'Poetry Reading Night',
  description: 'Join us for an evening of poetry',
  category: 'Poetry',
  venue: {
    id: 'venue_1',
    name: 'Central Library',
    address: '123 Main St',
    type: 'public',
    safetyRating: 'green',
    coordinates: [0, 0],
    amenities: ['parking', 'restrooms'],
    accessibilityFeatures: ['wheelchair_accessible'],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  organizer: {
    id: 'user_1',
    name: 'John Doe',
    email: 'john@example.com',
    trustPoints: 85,
    verificationStatus: 'verified',
    chatHistory: [],
    eventHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  attendees: [],
  rsvpList: [],
  maxAttendees: 20,
  dateTime: new Date('2024-02-15T19:00:00'),
  duration: 120,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockNGOContext: ChatContext = {
  type: 'ngo',
  reference: mockNGO,
  title: mockNGO.name,
  description: mockNGO.projectTitle,
};

const mockEventContext: ChatContext = {
  type: 'event',
  reference: mockEvent,
  title: mockEvent.title,
  description: mockEvent.description,
};

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <AppProvider>
      {component}
    </AppProvider>
  );
};

describe('ChatModal', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    mockOnClose.mockClear();
  });

  it('should not render when isOpen is false', () => {
    renderWithProvider(
      <ChatModal
        isOpen={false}
        context={mockNGOContext}
        onClose={mockOnClose}
      />
    );

    expect(screen.queryByText('Chat with Green Earth Foundation')).not.toBeInTheDocument();
  });

  it('should render NGO chat modal when open', () => {
    renderWithProvider(
      <ChatModal
        isOpen={true}
        context={mockNGOContext}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Chat with Green Earth Foundation')).toBeInTheDocument();
    expect(screen.getByText('Tree Planting Initiative')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });

  it('should render event chat modal when open', () => {
    renderWithProvider(
      <ChatModal
        isOpen={true}
        context={mockEventContext}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Chat about Poetry Reading Night')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Type your message...')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    renderWithProvider(
      <ChatModal
        isOpen={true}
        context={mockNGOContext}
        onClose={mockOnClose}
      />
    );

    const closeButton = screen.getByLabelText('Close chat');
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should handle message input and send', async () => {
    renderWithProvider(
      <ChatModal
        isOpen={true}
        context={mockNGOContext}
        onClose={mockOnClose}
      />
    );

    const messageInput = screen.getByPlaceholderText('Type your message...');
    const sendButton = screen.getByLabelText('Send message');

    // Type a message
    fireEvent.change(messageInput, { target: { value: 'Hello, I would like to volunteer!' } });
    expect(messageInput).toHaveValue('Hello, I would like to volunteer!');

    // Send the message
    fireEvent.click(sendButton);

    // Input should be cleared after sending
    await waitFor(() => {
      expect(messageInput).toHaveValue('');
    });
  });

  it('should send message on Enter key press', async () => {
    renderWithProvider(
      <ChatModal
        isOpen={true}
        context={mockNGOContext}
        onClose={mockOnClose}
      />
    );

    const messageInput = screen.getByPlaceholderText('Type your message...');

    // Type a message
    fireEvent.change(messageInput, { target: { value: 'Test message' } });

    // Press Enter
    fireEvent.keyDown(messageInput, { key: 'Enter', code: 'Enter' });

    // Input should be cleared after sending
    await waitFor(() => {
      expect(messageInput).toHaveValue('');
    });
  });

  it('should not send empty messages', () => {
    renderWithProvider(
      <ChatModal
        isOpen={true}
        context={mockNGOContext}
        onClose={mockOnClose}
      />
    );

    const sendButton = screen.getByLabelText('Send message');
    
    // Send button should be disabled when input is empty
    expect(sendButton).toBeDisabled();
  });

  it('should display empty state message when no messages', () => {
    renderWithProvider(
      <ChatModal
        isOpen={true}
        context={mockNGOContext}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Start a conversation about volunteering opportunities')).toBeInTheDocument();
  });

  it('should display empty state for event context', () => {
    renderWithProvider(
      <ChatModal
        isOpen={true}
        context={mockEventContext}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText('Start a conversation about this event')).toBeInTheDocument();
  });
});
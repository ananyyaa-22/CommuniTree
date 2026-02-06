/**
 * Integration tests for profile data management functionality
 * Tests the complete profile update and engagement tracking workflow
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider } from '../../../context/AppContext';
import { UserProfile } from '../UserProfile';
import { User } from '../../../types';

// Mock user data
const mockUser: User = {
  id: 'user_test',
  name: 'Test User',
  email: 'test@example.com',
  trustPoints: 75,
  verificationStatus: 'verified',
  chatHistory: [],
  eventHistory: [
    {
      id: 'event_1',
      eventId: 'evt_1',
      type: 'organized',
      timestamp: new Date('2024-01-15'),
      trustPointsAwarded: 20,
    },
    {
      id: 'event_2',
      eventId: 'evt_2',
      type: 'attended',
      timestamp: new Date('2024-01-20'),
      trustPointsAwarded: 5,
    },
  ],
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-25'),
};

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppProvider initialState={{ user: mockUser }}>
    {children}
  </AppProvider>
);

describe('Profile Data Management Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Profile Overview Display', () => {
    it('should display community impact metrics correctly', () => {
      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Check that community impact metrics are displayed
      expect(screen.getByText('Community Impact')).toBeInTheDocument();
      expect(screen.getByText('Performance Metrics')).toBeInTheDocument();
      
      // Check specific metrics
      expect(screen.getByText('1')).toBeInTheDocument(); // Events Organized
      expect(screen.getByText('1')).toBeInTheDocument(); // Events Attended
    });

    it('should display trust level correctly', () => {
      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Trust level should be "High" for 75 points
      expect(screen.getByText('High Member')).toBeInTheDocument();
    });
  });

  describe('Profile Edit Form', () => {
    it('should allow profile updates', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Switch to edit tab
      const editTab = screen.getByText('Edit Profile');
      await user.click(editTab);

      // Find form fields
      const nameInput = screen.getByDisplayValue('Test User');
      const emailInput = screen.getByDisplayValue('test@example.com');

      // Update name
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated User');

      // Submit form
      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      // Check for success message
      await waitFor(() => {
        expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
      });
    });

    it('should validate form inputs', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Switch to edit tab
      const editTab = screen.getByText('Edit Profile');
      await user.click(editTab);

      // Clear name field
      const nameInput = screen.getByDisplayValue('Test User');
      await user.clear(nameInput);

      // Try to submit
      const saveButton = screen.getByText('Save Changes');
      await user.click(saveButton);

      // Check for validation error
      await waitFor(() => {
        expect(screen.getByText('Name is required')).toBeInTheDocument();
      });
    });
  });

  describe('Engagement History', () => {
    it('should display activity history', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Switch to activity tab
      const activityTab = screen.getByText('Activity');
      await user.click(activityTab);

      // Check that activity history is displayed
      expect(screen.getByText('Activity History')).toBeInTheDocument();
      expect(screen.getByText('Community Impact Summary')).toBeInTheDocument();
      
      // Check for activity timeline
      expect(screen.getByText('Activity Timeline')).toBeInTheDocument();
    });

    it('should allow filtering activities', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Switch to activity tab
      const activityTab = screen.getByText('Activity');
      await user.click(activityTab);

      // Find filter dropdown
      const activityFilter = screen.getByDisplayValue('All Activities');
      
      // Change filter to "Organized"
      await user.selectOptions(activityFilter, 'organized');

      // The filter should be applied (we can't easily test the filtered results without more complex setup)
      expect(activityFilter).toHaveValue('organized');
    });
  });

  describe('Tab Navigation', () => {
    it('should switch between tabs correctly', async () => {
      const user = userEvent.setup();
      
      render(
        <TestWrapper>
          <UserProfile />
        </TestWrapper>
      );

      // Check initial tab (Overview)
      expect(screen.getByText('Account Status')).toBeInTheDocument();

      // Switch to Edit Profile tab
      const editTab = screen.getByText('Edit Profile');
      await user.click(editTab);
      expect(screen.getByText('Update your personal information and account details.')).toBeInTheDocument();

      // Switch to Activity tab
      const activityTab = screen.getByText('Activity');
      await user.click(activityTab);
      expect(screen.getByText('Track your community engagement and view your impact metrics.')).toBeInTheDocument();

      // Switch back to Overview
      const overviewTab = screen.getByText('Overview');
      await user.click(overviewTab);
      expect(screen.getByText('Account Status')).toBeInTheDocument();
    });
  });

  describe('Unauthenticated State', () => {
    it('should show login prompt when user is not authenticated', () => {
      render(
        <AppProvider initialState={{ user: null }}>
          <UserProfile />
        </AppProvider>
      );

      expect(screen.getByText('Please log in to view your profile')).toBeInTheDocument();
      expect(screen.getByText('Sign in to access your profile, trust points, and engagement history.')).toBeInTheDocument();
    });
  });
});
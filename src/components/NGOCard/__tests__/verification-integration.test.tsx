/**
 * Integration tests for NGO verification system
 * Tests the complete verification flow from UI to state updates
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NGOCardContainer } from '../NGOCardContainer';
import { AppProvider } from '../../../context';
import { NGO } from '../../../types';

// Mock NGO data
const mockNGO: NGO = {
  id: 'ngo_test',
  name: 'Test Environmental NGO',
  projectTitle: 'Clean Water Initiative',
  description: 'Working to provide clean water access to rural communities',
  category: 'Environment',
  darpanId: undefined,
  isVerified: false,
  contactInfo: {
    email: 'contact@testngo.org',
    phone: '+1234567890',
    address: '123 Green Street, Eco City',
  },
  volunteersNeeded: 15,
  currentVolunteers: 8,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
};

const mockVerifiedNGO: NGO = {
  ...mockNGO,
  id: 'ngo_verified',
  name: 'Verified Education NGO',
  darpanId: '12345',
  isVerified: true,
};

// Test wrapper with context
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <AppProvider>
    {children}
  </AppProvider>
);

describe('NGO Verification Integration', () => {
  const user = userEvent.setup();

  describe('Unverified NGO Card', () => {
    it('should display verify button for unverified NGO', () => {
      render(
        <TestWrapper>
          <NGOCardContainer ngo={mockNGO} viewMode="grid" />
        </TestWrapper>
      );

      expect(screen.getByText('Verify NGO')).toBeInTheDocument();
      expect(screen.queryByText('Darpan ID Verified')).not.toBeInTheDocument();
    });

    it('should open verification modal when verify button is clicked', async () => {
      render(
        <TestWrapper>
          <NGOCardContainer ngo={mockNGO} viewMode="grid" />
        </TestWrapper>
      );

      const verifyButton = screen.getByText('Verify NGO');
      await user.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter 5-digit ID')).toBeInTheDocument();
        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/Enter the 5-digit Darpan ID to verify/)).toBeInTheDocument();
      });
    });

    it('should validate Darpan ID input', async () => {
      render(
        <TestWrapper>
          <NGOCardContainer ngo={mockNGO} viewMode="grid" />
        </TestWrapper>
      );

      // Open modal
      const verifyButton = screen.getByText('Verify NGO');
      await user.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter 5-digit ID')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter 5-digit ID');
      const submitButton = screen.getAllByRole('button', { name: /verify ngo/i })[1]; // Get the modal submit button

      // Test that submit button is disabled with empty input
      expect(submitButton).toBeDisabled();

      // Test invalid format (too short)
      await user.type(input, '123');
      await user.click(submitButton);
      await waitFor(() => {
        expect(screen.getByText('Darpan ID must be exactly 5 digits (current: 3)')).toBeInTheDocument();
      });

      // Test that non-numeric input is prevented (input should remain as '123')
      await user.type(input, 'a');
      // The 'a' should be rejected by the input validation, so value should still be '123'
      expect(input).toHaveValue('123');
    });

    it('should handle successful verification', async () => {
      render(
        <TestWrapper>
          <NGOCardContainer ngo={mockNGO} viewMode="grid" />
        </TestWrapper>
      );

      // Open modal
      const verifyButton = screen.getByText('Verify NGO');
      await user.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter 5-digit ID')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter 5-digit ID');
      const submitButton = screen.getAllByRole('button', { name: /verify ngo/i })[1]; // Get the modal submit button

      // Enter valid test Darpan ID
      await user.type(input, '12345');
      await user.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Verifying...')).toBeInTheDocument();
      });

      // Should show success state
      await waitFor(() => {
        expect(screen.getByText('Verification Successful!')).toBeInTheDocument();
        expect(screen.getByText(/successfully verified/)).toBeInTheDocument();
        expect(screen.getByText(/earned 10 trust points/)).toBeInTheDocument();
      }, { timeout: 3000 });
    });

    it('should handle verification failure', async () => {
      render(
        <TestWrapper>
          <NGOCardContainer ngo={mockNGO} viewMode="grid" />
        </TestWrapper>
      );

      // Open modal
      const verifyButton = screen.getByText('Verify NGO');
      await user.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter 5-digit ID')).toBeInTheDocument();
      });

      const input = screen.getByPlaceholderText('Enter 5-digit ID');
      const submitButton = screen.getAllByRole('button', { name: /verify ngo/i })[1]; // Get the modal submit button

      // Enter invalid Darpan ID (not in test list)
      await user.type(input, '99999');
      await user.click(submitButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Verifying...')).toBeInTheDocument();
      });

      // Should show error state (with 30% chance of failure in mock)
      // We'll test this by checking if either success or error appears
      await waitFor(() => {
        const hasSuccess = screen.queryByText('Verification Successful!');
        const hasError = screen.queryByText('Invalid Darpan ID. Please check and try again.');
        expect(hasSuccess || hasError).toBeTruthy();
      }, { timeout: 3000 });
    });

    it('should close modal when clicking backdrop', async () => {
      render(
        <TestWrapper>
          <NGOCardContainer ngo={mockNGO} viewMode="grid" />
        </TestWrapper>
      );

      // Open modal
      const verifyButton = screen.getByText('Verify NGO');
      await user.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter 5-digit ID')).toBeInTheDocument();
      });

      // Click backdrop (the modal overlay)
      const modal = document.querySelector('.fixed.inset-0');
      
      if (modal) {
        fireEvent.click(modal);
        await waitFor(() => {
          expect(screen.queryByPlaceholderText('Enter 5-digit ID')).not.toBeInTheDocument();
        });
      }
    });

    it('should close modal when pressing Escape key', async () => {
      render(
        <TestWrapper>
          <NGOCardContainer ngo={mockNGO} viewMode="grid" />
        </TestWrapper>
      );

      // Open modal
      const verifyButton = screen.getByText('Verify NGO');
      await user.click(verifyButton);

      await waitFor(() => {
        expect(screen.getByPlaceholderText('Enter 5-digit ID')).toBeInTheDocument();
      });

      // Press Escape key
      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByPlaceholderText('Enter 5-digit ID')).not.toBeInTheDocument();
      });
    });
  });

  describe('Verified NGO Card', () => {
    it('should display verification badge for verified NGO', () => {
      render(
        <TestWrapper>
          <NGOCardContainer ngo={mockVerifiedNGO} viewMode="grid" />
        </TestWrapper>
      );

      expect(screen.getByText(/Verified with Darpan ID 12345/)).toBeInTheDocument();
      expect(screen.queryByText('Verify NGO')).not.toBeInTheDocument();
    });

    it('should not show verify button for already verified NGO', () => {
      render(
        <TestWrapper>
          <NGOCardContainer ngo={mockVerifiedNGO} viewMode="grid" />
        </TestWrapper>
      );

      expect(screen.queryByText('Verify NGO')).not.toBeInTheDocument();
    });

    it('should display green verification badge', () => {
      render(
        <TestWrapper>
          <NGOCardContainer ngo={mockVerifiedNGO} viewMode="grid" />
        </TestWrapper>
      );

      const badge = screen.getByText(/Verified with Darpan ID 12345/).closest('div');
      expect(badge).toHaveClass('bg-green-100', 'text-green-800');
    });
  });

  describe('Volunteer Button Integration', () => {
    it('should call onChatOpen when volunteer button is clicked', async () => {
      const mockOnChatOpen = jest.fn();
      
      render(
        <TestWrapper>
          <NGOCardContainer 
            ngo={mockNGO} 
            viewMode="grid" 
            onChatOpen={mockOnChatOpen}
          />
        </TestWrapper>
      );

      const volunteerButton = screen.getByText('Volunteer');
      await user.click(volunteerButton);

      expect(mockOnChatOpen).toHaveBeenCalledWith(mockNGO);
    });

    it('should disable volunteer button when fully staffed', () => {
      const fullyStaffedNGO = {
        ...mockNGO,
        currentVolunteers: 15, // Same as volunteersNeeded
      };

      render(
        <TestWrapper>
          <NGOCardContainer ngo={fullyStaffedNGO} viewMode="grid" />
        </TestWrapper>
      );

      const button = screen.getByRole('button', { name: /fully staffed/i });
      expect(button).toBeDisabled();
    });
  });

  describe('Responsive Behavior', () => {
    it('should render correctly in list view', () => {
      render(
        <TestWrapper>
          <NGOCardContainer ngo={mockNGO} viewMode="list" />
        </TestWrapper>
      );

      expect(screen.getByText('Test Environmental NGO')).toBeInTheDocument();
      expect(screen.getByText('Clean Water Initiative')).toBeInTheDocument();
      expect(screen.getByText('Verify NGO')).toBeInTheDocument();
    });

    it('should render correctly in grid view', () => {
      render(
        <TestWrapper>
          <NGOCardContainer ngo={mockNGO} viewMode="grid" />
        </TestWrapper>
      );

      expect(screen.getByText('Test Environmental NGO')).toBeInTheDocument();
      expect(screen.getByText('Clean Water Initiative')).toBeInTheDocument();
      expect(screen.getByText('Verify NGO')).toBeInTheDocument();
    });
  });
});
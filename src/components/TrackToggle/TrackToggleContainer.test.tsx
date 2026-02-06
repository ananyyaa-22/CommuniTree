/**
 * Unit tests for TrackToggleContainer component
 * Tests integration with hooks and localStorage persistence
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { TrackToggleContainer } from './TrackToggleContainer';
import { AppProvider } from '../../context';
import { TrackType } from '../../types';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Test wrapper with AppProvider
const TestWrapper: React.FC<{ children: React.ReactNode; initialTrack?: TrackType }> = ({ 
  children, 
  initialTrack = 'impact' 
}) => (
  <AppProvider initialState={{ currentTrack: initialTrack }}>
    {children}
  </AppProvider>
);

describe('TrackToggleContainer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the TrackToggle component', () => {
      render(
        <TestWrapper>
          <TrackToggleContainer />
        </TestWrapper>
      );

      expect(screen.getByText('Impact')).toBeInTheDocument();
      expect(screen.getByText('Grow')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <TestWrapper>
          <TrackToggleContainer className="custom-class" />
        </TestWrapper>
      );

      expect(container.firstChild?.firstChild).toHaveClass('custom-class');
    });
  });

  describe('localStorage Integration', () => {
    it('reads initial track from localStorage on mount', async () => {
      mockLocalStorage.getItem.mockReturnValue('grow');

      render(
        <TestWrapper initialTrack="impact">
          <TrackToggleContainer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('communitree_last_track');
      });
    });

    it('does not change track if localStorage value matches current track', async () => {
      mockLocalStorage.getItem.mockReturnValue('impact');

      render(
        <TestWrapper initialTrack="impact">
          <TrackToggleContainer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('communitree_last_track');
      });

      // Should still show Impact track
      const impactButton = screen.getByText('Impact').closest('label');
      expect(impactButton).toHaveClass('bg-emerald-600');
    });

    it('ignores invalid localStorage values', async () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-track');

      render(
        <TestWrapper initialTrack="impact">
          <TrackToggleContainer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('communitree_last_track');
      });

      // Should maintain initial track
      const impactButton = screen.getByText('Impact').closest('label');
      expect(impactButton).toHaveClass('bg-emerald-600');
    });

    it('handles missing localStorage gracefully', async () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      render(
        <TestWrapper initialTrack="impact">
          <TrackToggleContainer />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(mockLocalStorage.getItem).toHaveBeenCalledWith('communitree_last_track');
      });

      // Should maintain initial track
      const impactButton = screen.getByText('Impact').closest('label');
      expect(impactButton).toHaveClass('bg-emerald-600');
    });
  });

  describe('State Management Integration', () => {
    it('displays the current track from global state', () => {
      render(
        <TestWrapper initialTrack="grow">
          <TrackToggleContainer />
        </TestWrapper>
      );

      const growButton = screen.getByText('Grow').closest('label');
      expect(growButton).toHaveClass('bg-amber-500');
    });

    it('updates global state when track is changed', async () => {
      render(
        <TestWrapper initialTrack="impact">
          <TrackToggleContainer />
        </TestWrapper>
      );

      const checkbox = screen.getByRole('checkbox');
      checkbox.click();

      await waitFor(() => {
        const growButton = screen.getByText('Grow').closest('label');
        expect(growButton).toHaveClass('bg-amber-500');
      });
    });
  });

  describe('Server-Side Rendering Compatibility', () => {
    it('handles window undefined gracefully', () => {
      const originalWindow = global.window;
      // @ts-ignore
      delete global.window;

      expect(() => {
        render(
          <TestWrapper>
            <TrackToggleContainer />
          </TestWrapper>
        );
      }).not.toThrow();

      global.window = originalWindow;
    });
  });
});
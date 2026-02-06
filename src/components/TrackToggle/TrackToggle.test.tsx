/**
 * Unit tests for TrackToggle component
 * Tests track switching functionality, styling, and accessibility
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TrackToggle } from './TrackToggle';
import { TrackType } from '../../types';

describe('TrackToggle', () => {
  const mockOnTrackChange = jest.fn();

  beforeEach(() => {
    mockOnTrackChange.mockClear();
  });

  describe('Rendering', () => {
    it('renders both Impact and Grow track options', () => {
      render(
        <TrackToggle
          currentTrack="impact"
          onTrackChange={mockOnTrackChange}
        />
      );

      expect(screen.getByText('Impact')).toBeInTheDocument();
      expect(screen.getByText('Grow')).toBeInTheDocument();
    });

    it('displays correct description for Impact track', () => {
      render(
        <TrackToggle
          currentTrack="impact"
          onTrackChange={mockOnTrackChange}
        />
      );

      expect(screen.getByText('Community Service & NGO Partnerships')).toBeInTheDocument();
    });

    it('displays correct description for Grow track', () => {
      render(
        <TrackToggle
          currentTrack="grow"
          onTrackChange={mockOnTrackChange}
        />
      );

      expect(screen.getByText('Local Entertainment & Social Events')).toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <TrackToggle
          currentTrack="impact"
          onTrackChange={mockOnTrackChange}
          className="custom-class"
        />
      );

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Track Selection Styling', () => {
    it('applies emerald styling when Impact track is active', () => {
      render(
        <TrackToggle
          currentTrack="impact"
          onTrackChange={mockOnTrackChange}
        />
      );

      const impactButton = screen.getByText('Impact').closest('label');
      const growButton = screen.getByText('Grow').closest('label');

      expect(impactButton).toHaveClass('bg-emerald-600', 'text-white');
      expect(growButton).toHaveClass('text-amber-700');
      expect(growButton).not.toHaveClass('bg-amber-500');
    });

    it('applies amber styling when Grow track is active', () => {
      render(
        <TrackToggle
          currentTrack="grow"
          onTrackChange={mockOnTrackChange}
        />
      );

      const impactButton = screen.getByText('Impact').closest('label');
      const growButton = screen.getByText('Grow').closest('label');

      expect(growButton).toHaveClass('bg-amber-500', 'text-white');
      expect(impactButton).toHaveClass('text-emerald-700');
      expect(impactButton).not.toHaveClass('bg-emerald-600');
    });
  });

  describe('Interaction', () => {
    it('calls onTrackChange with "grow" when Impact is active and toggle is clicked', () => {
      render(
        <TrackToggle
          currentTrack="impact"
          onTrackChange={mockOnTrackChange}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockOnTrackChange).toHaveBeenCalledWith('grow');
    });

    it('calls onTrackChange with "impact" when Grow is active and toggle is clicked', () => {
      render(
        <TrackToggle
          currentTrack="grow"
          onTrackChange={mockOnTrackChange}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      fireEvent.click(checkbox);

      expect(mockOnTrackChange).toHaveBeenCalledWith('impact');
    });

    it('can be toggled by clicking on either label', () => {
      render(
        <TrackToggle
          currentTrack="impact"
          onTrackChange={mockOnTrackChange}
        />
      );

      const growLabel = screen.getByText('Grow').closest('label');
      fireEvent.click(growLabel!);

      expect(mockOnTrackChange).toHaveBeenCalledWith('grow');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA label for screen readers', () => {
      render(
        <TrackToggle
          currentTrack="impact"
          onTrackChange={mockOnTrackChange}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Switch to Grow track');
    });

    it('updates ARIA label based on current track', () => {
      render(
        <TrackToggle
          currentTrack="grow"
          onTrackChange={mockOnTrackChange}
        />
      );

      const checkbox = screen.getByRole('checkbox');
      expect(checkbox).toHaveAttribute('aria-label', 'Switch to Impact track');
    });

    it('has proper checkbox state for Impact track', () => {
      render(
        <TrackToggle
          currentTrack="impact"
          onTrackChange={mockOnTrackChange}
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(false);
    });

    it('has proper checkbox state for Grow track', () => {
      render(
        <TrackToggle
          currentTrack="grow"
          onTrackChange={mockOnTrackChange}
        />
      );

      const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('Icons', () => {
    it('renders Heart icon for Impact track', () => {
      render(
        <TrackToggle
          currentTrack="impact"
          onTrackChange={mockOnTrackChange}
        />
      );

      // Heart icon should be present in the Impact label
      const impactLabel = screen.getByText('Impact').closest('label');
      expect(impactLabel?.querySelector('svg')).toBeInTheDocument();
    });

    it('renders Sparkles icon for Grow track', () => {
      render(
        <TrackToggle
          currentTrack="grow"
          onTrackChange={mockOnTrackChange}
        />
      );

      // Sparkles icon should be present in the Grow label
      const growLabel = screen.getByText('Grow').closest('label');
      expect(growLabel?.querySelector('svg')).toBeInTheDocument();
    });
  });
});
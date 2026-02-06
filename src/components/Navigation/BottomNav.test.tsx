/**
 * BottomNav Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BottomNav } from './BottomNav';

describe('BottomNav Component', () => {
  const mockOnSectionChange = jest.fn();

  beforeEach(() => {
    mockOnSectionChange.mockClear();
  });

  it('renders all navigation items', () => {
    render(
      <BottomNav
        activeSection="home"
        onSectionChange={mockOnSectionChange}
      />
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('My Schedule')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('highlights the active section', () => {
    render(
      <BottomNav
        activeSection="schedule"
        onSectionChange={mockOnSectionChange}
      />
    );

    const scheduleButton = screen.getByLabelText('My Schedule');
    expect(scheduleButton).toHaveClass('text-blue-600');
    expect(scheduleButton).toHaveAttribute('aria-current', 'page');
  });

  it('calls onSectionChange when navigation item is clicked', () => {
    render(
      <BottomNav
        activeSection="home"
        onSectionChange={mockOnSectionChange}
      />
    );

    fireEvent.click(screen.getByLabelText('Profile'));
    expect(mockOnSectionChange).toHaveBeenCalledWith('profile');

    fireEvent.click(screen.getByLabelText('My Schedule'));
    expect(mockOnSectionChange).toHaveBeenCalledWith('schedule');
  });

  it('applies correct styling for inactive items', () => {
    render(
      <BottomNav
        activeSection="home"
        onSectionChange={mockOnSectionChange}
      />
    );

    const profileButton = screen.getByLabelText('Profile');
    expect(profileButton).toHaveClass('text-gray-500');
    expect(profileButton).not.toHaveAttribute('aria-current');
  });

  it('has proper accessibility attributes', () => {
    render(
      <BottomNav
        activeSection="home"
        onSectionChange={mockOnSectionChange}
      />
    );

    const homeButton = screen.getByLabelText('Home');
    expect(homeButton).toHaveAttribute('aria-label', 'Home');
    expect(homeButton).toHaveAttribute('aria-current', 'page');

    const profileButton = screen.getByLabelText('Profile');
    expect(profileButton).toHaveAttribute('aria-label', 'Profile');
    expect(profileButton).not.toHaveAttribute('aria-current');
  });

  it('is hidden on large screens', () => {
    render(
      <BottomNav
        activeSection="home"
        onSectionChange={mockOnSectionChange}
      />
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('lg:hidden');
  });

  it('is positioned fixed at bottom', () => {
    render(
      <BottomNav
        activeSection="home"
        onSectionChange={mockOnSectionChange}
      />
    );

    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass('fixed', 'bottom-0', 'left-0', 'right-0');
  });
});
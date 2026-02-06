/**
 * SideNav Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SideNav } from './SideNav';

describe('SideNav Component', () => {
  const mockOnSectionChange = jest.fn();

  beforeEach(() => {
    mockOnSectionChange.mockClear();
  });

  it('renders all navigation items', () => {
    render(
      <SideNav
        activeSection="home"
        onSectionChange={mockOnSectionChange}
      />
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('My Schedule')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('renders navigation header', () => {
    render(
      <SideNav
        activeSection="home"
        onSectionChange={mockOnSectionChange}
      />
    );

    expect(screen.getByText('Navigation')).toBeInTheDocument();
  });

  it('renders navigation footer', () => {
    render(
      <SideNav
        activeSection="home"
        onSectionChange={mockOnSectionChange}
      />
    );

    expect(screen.getByText('CommuniTree Platform')).toBeInTheDocument();
  });

  it('highlights the active section', () => {
    render(
      <SideNav
        activeSection="profile"
        onSectionChange={mockOnSectionChange}
      />
    );

    const profileButton = screen.getByLabelText('Profile');
    expect(profileButton).toHaveClass('bg-blue-50', 'text-blue-700');
    expect(profileButton).toHaveAttribute('aria-current', 'page');
  });

  it('shows active indicator for active section', () => {
    render(
      <SideNav
        activeSection="home"
        onSectionChange={mockOnSectionChange}
      />
    );

    const homeButton = screen.getByLabelText('Home');
    const activeIndicator = homeButton.querySelector('.w-2.h-2.bg-blue-600.rounded-full');
    expect(activeIndicator).toBeInTheDocument();
  });

  it('calls onSectionChange when navigation item is clicked', () => {
    render(
      <SideNav
        activeSection="home"
        onSectionChange={mockOnSectionChange}
      />
    );

    fireEvent.click(screen.getByLabelText('My Schedule'));
    expect(mockOnSectionChange).toHaveBeenCalledWith('schedule');

    fireEvent.click(screen.getByLabelText('Profile'));
    expect(mockOnSectionChange).toHaveBeenCalledWith('profile');
  });

  it('applies correct styling for inactive items', () => {
    render(
      <SideNav
        activeSection="home"
        onSectionChange={mockOnSectionChange}
      />
    );

    const scheduleButton = screen.getByLabelText('My Schedule');
    expect(scheduleButton).toHaveClass('text-gray-600');
    expect(scheduleButton).not.toHaveAttribute('aria-current');
  });

  it('has proper accessibility attributes', () => {
    render(
      <SideNav
        activeSection="schedule"
        onSectionChange={mockOnSectionChange}
      />
    );

    const scheduleButton = screen.getByLabelText('My Schedule');
    expect(scheduleButton).toHaveAttribute('aria-label', 'My Schedule');
    expect(scheduleButton).toHaveAttribute('aria-current', 'page');

    const homeButton = screen.getByLabelText('Home');
    expect(homeButton).toHaveAttribute('aria-label', 'Home');
    expect(homeButton).not.toHaveAttribute('aria-current');
  });

  it('is hidden on small screens', () => {
    render(
      <SideNav
        activeSection="home"
        onSectionChange={mockOnSectionChange}
      />
    );

    const aside = screen.getByRole('complementary');
    expect(aside).toHaveClass('hidden', 'lg:flex');
  });

  it('has proper focus management', () => {
    render(
      <SideNav
        activeSection="home"
        onSectionChange={mockOnSectionChange}
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button).toHaveClass('focus:outline-none', 'focus:ring-2', 'focus:ring-blue-500');
    });
  });
});
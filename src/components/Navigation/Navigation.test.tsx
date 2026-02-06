/**
 * Navigation Component Tests
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Navigation } from './Navigation';
import { NavigationSection } from './types';

// Mock the child components to isolate testing
jest.mock('./BottomNav', () => ({
  BottomNav: ({ activeSection, onSectionChange }: any) => (
    <div data-testid="bottom-nav">
      <button onClick={() => onSectionChange('home')}>
        Home {activeSection === 'home' && '(active)'}
      </button>
      <button onClick={() => onSectionChange('schedule')}>
        Schedule {activeSection === 'schedule' && '(active)'}
      </button>
      <button onClick={() => onSectionChange('profile')}>
        Profile {activeSection === 'profile' && '(active)'}
      </button>
    </div>
  ),
}));

jest.mock('./SideNav', () => ({
  SideNav: ({ activeSection, onSectionChange }: any) => (
    <div data-testid="side-nav">
      <button onClick={() => onSectionChange('home')}>
        Home {activeSection === 'home' && '(active)'}
      </button>
      <button onClick={() => onSectionChange('schedule')}>
        Schedule {activeSection === 'schedule' && '(active)'}
      </button>
      <button onClick={() => onSectionChange('profile')}>
        Profile {activeSection === 'profile' && '(active)'}
      </button>
    </div>
  ),
}));

describe('Navigation Component', () => {
  const mockOnSectionChange = jest.fn();

  beforeEach(() => {
    mockOnSectionChange.mockClear();
  });

  it('renders both SideNav and BottomNav components', () => {
    render(
      <Navigation
        activeSection="home"
        onSectionChange={mockOnSectionChange}
      />
    );

    expect(screen.getByTestId('side-nav')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });

  it('passes activeSection prop to both navigation components', () => {
    render(
      <Navigation
        activeSection="schedule"
        onSectionChange={mockOnSectionChange}
      />
    );

    expect(screen.getByText('Schedule (active)', { selector: '[data-testid="side-nav"] button' })).toBeInTheDocument();
    expect(screen.getByText('Schedule (active)', { selector: '[data-testid="bottom-nav"] button' })).toBeInTheDocument();
  });

  it('passes onSectionChange handler to both navigation components', () => {
    render(
      <Navigation
        activeSection="home"
        onSectionChange={mockOnSectionChange}
      />
    );

    // Click on SideNav
    fireEvent.click(screen.getAllByText('Profile')[0]);
    expect(mockOnSectionChange).toHaveBeenCalledWith('profile');

    // Click on BottomNav
    fireEvent.click(screen.getAllByText('Schedule')[1]);
    expect(mockOnSectionChange).toHaveBeenCalledWith('schedule');
  });

  it('handles all navigation sections correctly', () => {
    const sections: NavigationSection[] = ['home', 'schedule', 'profile'];
    
    sections.forEach((section: NavigationSection) => {
      render(
        <Navigation
          activeSection={section}
          onSectionChange={mockOnSectionChange}
        />
      );

      expect(screen.getAllByText(`${section.charAt(0).toUpperCase() + section.slice(1)} (active)`)).toHaveLength(2);
    });
  });
});
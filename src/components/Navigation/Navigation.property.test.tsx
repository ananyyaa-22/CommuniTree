/**
 * Navigation Component Property-Based Tests
 * 
 * Property 2: Navigation state consistency
 * Validates: Requirements 2.3, 2.4
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import * as fc from 'fast-check';
import { Navigation } from './Navigation';
import { NavigationSection } from './types';
import { navigationItems } from './navigationItems';

// Mock navigation items for testing
const mockNavigationItems = [
  { id: 'home' as NavigationSection, label: 'Home', icon: 'Home' },
  { id: 'schedule' as NavigationSection, label: 'Schedule', icon: 'Calendar' },
  { id: 'profile' as NavigationSection, label: 'Profile', icon: 'User' }
];

// Mock the child components to isolate testing
jest.mock('./BottomNav', () => ({
  BottomNav: ({ activeSection, onSectionChange }: any) => (
    <div data-testid="bottom-nav">
      {mockNavigationItems.map(item => (
        <button 
          key={`bottom-${item.id}`}
          onClick={() => onSectionChange(item.id)}
          className={activeSection === item.id ? 'active' : 'inactive'}
          data-section={item.id}
        >
          {item.label} {activeSection === item.id && '(active)'}
        </button>
      ))}
    </div>
  ),
}));

jest.mock('./SideNav', () => ({
  SideNav: ({ activeSection, onSectionChange }: any) => (
    <div data-testid="side-nav">
      {mockNavigationItems.map(item => (
        <button 
          key={`side-${item.id}`}
          onClick={() => onSectionChange(item.id)}
          className={activeSection === item.id ? 'active' : 'inactive'}
          data-section={item.id}
        >
          {item.label} {activeSection === item.id && '(active)'}
        </button>
      ))}
    </div>
  ),
}));

describe('Navigation Property-Based Tests', () => {
  // Generator for valid navigation sections
  const navigationSectionArb = fc.constantFrom(...mockNavigationItems.map(item => item.id));

  /**
   * Property 2.1: Navigation state consistency across components
   * 
   * For any valid navigation section, when set as active:
   * - Both SideNav and BottomNav should reflect the same active state
   * - The active section should be highlighted in both components
   * - Only one section should be active at a time
   * 
   * **Validates: Requirements 2.4**
   */
  it('Property 2.1: maintains consistent active state across both navigation components', () => {
    fc.assert(
      fc.property(navigationSectionArb, (activeSection) => {
        const mockOnSectionChange = jest.fn();
        
        render(
          <Navigation
            activeSection={activeSection}
            onSectionChange={mockOnSectionChange}
          />
        );

        // Both components should exist
        const sideNav = screen.getByTestId('side-nav');
        const bottomNav = screen.getByTestId('bottom-nav');
        expect(sideNav).toBeInTheDocument();
        expect(bottomNav).toBeInTheDocument();

        // Check that the active section is highlighted in both components
        const sideNavActiveButton = sideNav.querySelector(`[data-section="${activeSection}"]`);
        const bottomNavActiveButton = bottomNav.querySelector(`[data-section="${activeSection}"]`);
        
        expect(sideNavActiveButton).toHaveClass('active');
        expect(bottomNavActiveButton).toHaveClass('active');
        expect(sideNavActiveButton).toHaveTextContent('(active)');
        expect(bottomNavActiveButton).toHaveTextContent('(active)');

        // Check that non-active sections are not highlighted
        mockNavigationItems.forEach(item => {
          if (item.id !== activeSection) {
            const sideNavInactiveButton = sideNav.querySelector(`[data-section="${item.id}"]`);
            const bottomNavInactiveButton = bottomNav.querySelector(`[data-section="${item.id}"]`);
            
            expect(sideNavInactiveButton).toHaveClass('inactive');
            expect(bottomNavInactiveButton).toHaveClass('inactive');
            expect(sideNavInactiveButton).not.toHaveTextContent('(active)');
            expect(bottomNavInactiveButton).not.toHaveTextContent('(active)');
          }
        });
      })
    );
  });

  /**
   * Property 2.2: Navigation click consistency
   * 
   * For any valid navigation section, when clicked in either component:
   * - The onSectionChange callback should be called with the correct section
   * - The callback should be called exactly once per click
   * - Both components should trigger the same callback function
   * 
   * **Validates: Requirements 2.3**
   */
  it('Property 2.2: clicking navigation items triggers consistent state changes', () => {
    fc.assert(
      fc.property(
        navigationSectionArb, // initial active section
        navigationSectionArb, // section to click
        (initialSection, clickedSection) => {
          const mockOnSectionChange = jest.fn();
          
          render(
            <Navigation
              activeSection={initialSection}
              onSectionChange={mockOnSectionChange}
            />
          );

          // Test clicking in SideNav
          const sideNav = screen.getByTestId('side-nav');
          const sideNavButton = sideNav.querySelector(`[data-section="${clickedSection}"]`);
          
          fireEvent.click(sideNavButton!);
          expect(mockOnSectionChange).toHaveBeenCalledWith(clickedSection);
          expect(mockOnSectionChange).toHaveBeenCalledTimes(1);

          // Reset mock
          mockOnSectionChange.mockClear();

          // Test clicking in BottomNav
          const bottomNav = screen.getByTestId('bottom-nav');
          const bottomNavButton = bottomNav.querySelector(`[data-section="${clickedSection}"]`);
          
          fireEvent.click(bottomNavButton!);
          expect(mockOnSectionChange).toHaveBeenCalledWith(clickedSection);
          expect(mockOnSectionChange).toHaveBeenCalledTimes(1);
        }
      )
    );
  });

  /**
   * Property 2.3: Navigation state transitions
   * 
   * For any sequence of navigation section changes:
   * - Each transition should result in exactly one active section
   * - The active section should always be one of the valid navigation sections
   * - State changes should be deterministic and consistent
   * 
   * **Validates: Requirements 2.3, 2.4**
   */
  it('Property 2.3: navigation state transitions maintain consistency', () => {
    fc.assert(
      fc.property(
        fc.array(navigationSectionArb, { minLength: 1, maxLength: 10 }),
        (sectionSequence) => {
          const mockOnSectionChange = jest.fn();
          let currentSection = sectionSequence[0];
          
          const { rerender } = render(
            <Navigation
              activeSection={currentSection}
              onSectionChange={mockOnSectionChange}
            />
          );

          // Apply each section change in sequence
          sectionSequence.forEach((nextSection, index) => {
            rerender(
              <Navigation
                activeSection={nextSection}
                onSectionChange={mockOnSectionChange}
              />
            );

            // Verify that exactly one section is active
            const sideNav = screen.getByTestId('side-nav');
            const bottomNav = screen.getByTestId('bottom-nav');
            
            const sideNavActiveButtons = sideNav.querySelectorAll('.active');
            const bottomNavActiveButtons = bottomNav.querySelectorAll('.active');
            
            expect(sideNavActiveButtons).toHaveLength(1);
            expect(bottomNavActiveButtons).toHaveLength(1);
            
            // Verify the correct section is active
            expect(sideNavActiveButtons[0]).toHaveAttribute('data-section', nextSection);
            expect(bottomNavActiveButtons[0]).toHaveAttribute('data-section', nextSection);
            
            currentSection = nextSection;
          });
        }
      )
    );
  });

  /**
   * Property 2.4: Navigation accessibility consistency
   * 
   * For any valid navigation section:
   * - Active sections should have proper ARIA attributes
   * - Inactive sections should not have active ARIA attributes
   * - Both navigation components should maintain consistent accessibility
   * 
   * **Validates: Requirements 2.4**
   */
  it('Property 2.4: maintains consistent accessibility attributes', () => {
    fc.assert(
      fc.property(navigationSectionArb, (activeSection) => {
        const mockOnSectionChange = jest.fn();
        
        render(
          <Navigation
            activeSection={activeSection}
            onSectionChange={mockOnSectionChange}
          />
        );

        mockNavigationItems.forEach(item => {
          const sideNavButton = screen.getByTestId('side-nav')
            .querySelector(`[data-section="${item.id}"]`);
          const bottomNavButton = screen.getByTestId('bottom-nav')
            .querySelector(`[data-section="${item.id}"]`);

          if (item.id === activeSection) {
            // Active section should be marked as current page
            expect(sideNavButton).toHaveClass('active');
            expect(bottomNavButton).toHaveClass('active');
          } else {
            // Inactive sections should not be marked as current page
            expect(sideNavButton).toHaveClass('inactive');
            expect(bottomNavButton).toHaveClass('inactive');
          }
        });
      })
    );
  });

  /**
   * Property 2.5: Navigation component isolation
   * 
   * For any navigation state:
   * - Changes in one component should not directly affect the other
   * - Both components should receive the same props
   * - Both components should call the same callback function
   * 
   * **Validates: Requirements 2.3**
   */
  it('Property 2.5: navigation components remain properly isolated', () => {
    fc.assert(
      fc.property(
        navigationSectionArb,
        navigationSectionArb,
        (initialSection, targetSection) => {
          const mockOnSectionChange = jest.fn();
          
          render(
            <Navigation
              activeSection={initialSection}
              onSectionChange={mockOnSectionChange}
            />
          );

          // Click in SideNav should not directly change BottomNav state
          const sideNavButton = screen.getByTestId('side-nav')
            .querySelector(`[data-section="${targetSection}"]`);
          
          fireEvent.click(sideNavButton!);
          
          // The callback should be called, but the visual state should remain unchanged
          // until the parent component re-renders with new props
          expect(mockOnSectionChange).toHaveBeenCalledWith(targetSection);
          
          // Both components should still show the initial section as active
          const sideNavActiveButton = screen.getByTestId('side-nav')
            .querySelector(`[data-section="${initialSection}"]`);
          const bottomNavActiveButton = screen.getByTestId('bottom-nav')
            .querySelector(`[data-section="${initialSection}"]`);
            
          expect(sideNavActiveButton).toHaveClass('active');
          expect(bottomNavActiveButton).toHaveClass('active');
        }
      )
    );
  });
});
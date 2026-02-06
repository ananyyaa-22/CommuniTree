/**
 * Tests for AppContext and reducer functionality
 */

import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AppProvider, useAppContext } from '../AppContext';
import { useUser, useCurrentTrack, useTrustPoints } from '../../hooks';

// Test component that uses the context
const TestComponent: React.FC = () => {
  const { user } = useUser();
  const { currentTrack, switchTrack } = useCurrentTrack();
  const { currentPoints, awardPoints } = useTrustPoints();

  return (
    <div>
      <div data-testid="user-name">{user?.name || 'No user'}</div>
      <div data-testid="current-track">{currentTrack}</div>
      <div data-testid="trust-points">{currentPoints}</div>
      <button 
        data-testid="switch-track" 
        onClick={() => switchTrack(currentTrack === 'impact' ? 'grow' : 'impact')}
      >
        Switch Track
      </button>
      <button 
        data-testid="award-points" 
        onClick={() => awardPoints('ATTEND_EVENT')}
      >
        Award Points
      </button>
    </div>
  );
};

describe('AppContext', () => {
  it('provides initial state correctly', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    expect(screen.getByTestId('user-name')).toHaveTextContent('Alex Johnson');
    expect(screen.getByTestId('current-track')).toHaveTextContent('impact');
    expect(screen.getByTestId('trust-points')).toHaveTextContent('75');
  });

  it('allows track switching', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    const switchButton = screen.getByTestId('switch-track');
    
    act(() => {
      switchButton.click();
    });

    expect(screen.getByTestId('current-track')).toHaveTextContent('grow');
  });

  it('handles trust point updates', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );

    const awardButton = screen.getByTestId('award-points');
    
    act(() => {
      awardButton.click();
    });

    // Should increase by 5 points (ATTEND_EVENT value)
    expect(screen.getByTestId('trust-points')).toHaveTextContent('80');
  });

  it('throws error when used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAppContext must be used within an AppProvider');

    consoleSpy.mockRestore();
  });
});
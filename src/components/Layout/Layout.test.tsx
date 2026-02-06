/**
 * Layout Component Tests
 * Tests for responsive layout container with navigation structure
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Layout } from './Layout';
import { AppProvider } from '../../context';

// Mock the hooks to avoid context dependencies in tests
jest.mock('../../hooks/useUser', () => ({
  useUser: () => ({
    user: { id: '1', name: 'Test User', trustPoints: 75 },
    isAuthenticated: true,
  }),
}));

jest.mock('../../hooks/useCurrentTrack', () => ({
  useCurrentTrack: () => ({
    currentTrack: 'impact',
    isImpactTrack: true,
  }),
}));

jest.mock('../../hooks/useTrustPoints', () => ({
  useTrustPoints: () => ({
    formattedPoints: '75/100 (Good)',
    trustLevel: 'Good',
  }),
}));

describe('Layout Component', () => {
  const renderLayout = (children: React.ReactNode = <div>Test Content</div>) => {
    return render(
      <AppProvider>
        <Layout>{children}</Layout>
      </AppProvider>
    );
  };

  test('renders the CommuniTree brand name', () => {
    renderLayout();
    expect(screen.getByText('CommuniTree')).toBeInTheDocument();
  });

  test('displays trust points badge when user is authenticated', () => {
    renderLayout();
    expect(screen.getByText('75/100 (Good)')).toBeInTheDocument();
  });

  test('shows Impact track indicator', () => {
    renderLayout();
    expect(screen.getByText('Impact Track')).toBeInTheDocument();
    expect(screen.getByText('Impact')).toBeInTheDocument(); // Mobile version
  });

  test('renders children content', () => {
    renderLayout(<div data-testid="test-content">Custom Content</div>);
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });

  test('displays navigation placeholders', () => {
    renderLayout();
    
    // Desktop navigation
    expect(screen.getByText('Navigation will be implemented in task 4.2')).toBeInTheDocument();
    
    // Mobile navigation
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  test('has responsive layout structure', () => {
    renderLayout();
    
    // Check for responsive classes
    const header = screen.getByRole('banner');
    expect(header).toHaveClass('bg-white', 'shadow-sm', 'border-b');
    
    // Check for mobile-first responsive design
    const mobileNav = screen.getByText('Home').closest('nav');
    expect(mobileNav).toHaveClass('lg:hidden', 'fixed', 'bottom-0');
  });

  test('displays user name on desktop', () => {
    renderLayout();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });
});

describe('Layout Component - Unauthenticated User', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.doMock('../../hooks/useUser', () => ({
      useUser: () => ({
        user: null,
        isAuthenticated: false,
      }),
    }));
  });

  test('hides trust points badge when user is not authenticated', () => {
    const { container } = render(
      <AppProvider>
        <Layout><div>Test</div></Layout>
      </AppProvider>
    );
    
    // Trust points badge should not be present
    expect(screen.queryByText(/Trust:/)).not.toBeInTheDocument();
  });
});
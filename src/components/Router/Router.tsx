/**
 * Router Component - Simple client-side routing for navigation flows
 * 
 * Features:
 * - Maps navigation sections to components
 * - Handles route transitions with loading states
 * - Provides consistent navigation experience
 * - Integrates with navigation state management
 * - Optimized with lazy loading and React.memo
 * 
 * Requirements: 10.3
 */

import React, { Suspense, memo } from 'react';
import { NavigationSection } from '../../hooks/useNavigation';
import { Loading } from '../Loading';
import { ErrorBoundary } from '../ErrorBoundary';

// Lazy load components for better performance and code splitting
const HomePage = React.lazy(() => 
  import('../HomePage/HomePage').then(module => ({ default: module.HomePage }))
);
const SchedulePage = React.lazy(() => 
  import('../SchedulePage/SchedulePage').then(module => ({ default: module.SchedulePage }))
);
const ProfilePage = React.lazy(() => 
  import('../ProfilePage/ProfilePage').then(module => ({ default: module.ProfilePage }))
);

interface RouterProps {
  activeSection: NavigationSection;
  className?: string;
}

const RouterComponent: React.FC<RouterProps> = ({ activeSection, className = '' }) => {
  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return <HomePage />;
      case 'schedule':
        return <SchedulePage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return <HomePage />;
    }
  };

  return (
    <div className={className}>
      <ErrorBoundary>
        <Suspense fallback={
          <Loading 
            variant="spinner" 
            text="Loading..." 
            className="min-h-96" 
          />
        }>
          {renderContent()}
        </Suspense>
      </ErrorBoundary>
    </div>
  );
};

// Memoize the router to prevent unnecessary re-renders
export const Router = memo(RouterComponent, (prevProps, nextProps) => {
  return (
    prevProps.activeSection === nextProps.activeSection &&
    prevProps.className === nextProps.className
  );
});

Router.displayName = 'Router';

export default Router;
/**
 * Protected Route Component
 * Wrapper component to protect authenticated routes
 * Redirects unauthenticated users to sign in
 * Shows loading state while checking authentication
 * 
 * Requirements: 3.8
 */

import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { AuthContainer } from './AuthContainer';
import { Loading } from '../Loading';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  loadingComponent?: React.ReactNode;
}

/**
 * ProtectedRoute component that wraps content requiring authentication
 * 
 * @param children - Content to render when user is authenticated
 * @param fallback - Optional custom component to show when not authenticated (defaults to AuthContainer)
 * @param loadingComponent - Optional custom loading component (defaults to Loading spinner)
 * 
 * @example
 * <ProtectedRoute>
 *   <ProfilePage />
 * </ProtectedRoute>
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  fallback,
  loadingComponent,
}) => {
  const { user, loading } = useAuth();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <>
        {loadingComponent || (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 to-amber-50">
            <Loading 
              variant="spinner" 
              text="Loading..." 
              className="text-emerald-600" 
            />
          </div>
        )}
      </>
    );
  }

  // If user is not authenticated, show fallback or AuthContainer
  if (!user) {
    return (
      <>
        {fallback || <AuthContainer />}
      </>
    );
  }

  // User is authenticated, render protected content
  return <>{children}</>;
};

/**
 * Hook to check if user is authenticated
 * Useful for conditional rendering within components
 * 
 * @returns boolean indicating if user is authenticated
 * 
 * @example
 * const isAuthenticated = useIsAuthenticated();
 * if (!isAuthenticated) {
 *   return <LoginPrompt />;
 * }
 */
export const useIsAuthenticated = (): boolean => {
  const { user, loading } = useAuth();
  return !loading && user !== null;
};

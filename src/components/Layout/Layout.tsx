/**
 * Layout Component - Responsive layout container with navigation
 * 
 * Features:
 * - Mobile-first responsive design
 * - Conditional rendering for mobile/desktop layouts
 * - Header with trust points badge display
 * - Global chat modal integration
 * - Loading states and error boundaries
 * 
 * Requirements: 2.5, 9.1, 6.6, 10.3
 */

import React, { ReactNode } from 'react';
import { useTheme } from '../../hooks/useTheme';
import { useUser } from '../../hooks/useUser';
import { useNavigation } from '../../hooks/useNavigation';
import { useUI } from '../../hooks/useUI';
import { Navigation } from '../Navigation';
import { TrustPointsBadge } from '../TrustPointsBadge';
import { ChatModalContainer } from '../ChatModal';
import { Loading } from '../Loading';

interface LayoutProps {
  children: ReactNode;
}

export type { LayoutProps };

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, isAuthenticated } = useUser();
  const { currentTrack, isImpactTrack, themeConfig } = useTheme();
  const { activeSection, onSectionChange } = useNavigation();
  const { isLoading } = useUI();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 z-50 flex items-center justify-center">
          <Loading variant="spinner" size="lg" text="Loading..." />
        </div>
      )}

      {/* Header with Trust Points Badge */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto mobile-padding desktop-padding">
          <div className="flex justify-between items-center h-14 sm:h-16 lg:h-18">
            {/* Logo/Brand */}
            <div className="flex items-center min-w-0 flex-1">
              <h1 className="text-responsive-lg desktop-text-lg font-bold text-gray-900 truncate">
                CommuniTree
              </h1>
              {/* Track indicator for mobile */}
              <div className="ml-2 sm:ml-3 lg:hidden">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  isImpactTrack 
                    ? 'bg-impact-100 text-impact-800' 
                    : 'bg-grow-100 text-grow-800'
                }`}>
                  <div className={`w-2 h-2 rounded-full mr-1 ${
                    isImpactTrack ? 'bg-impact-600' : 'bg-grow-600'
                  }`}></div>
                  <span className="truncate">{themeConfig.name}</span>
                </div>
              </div>
            </div>

            {/* Header Right Side - Trust Points and User Info */}
            <div className="flex items-center space-x-2 sm:space-x-4 lg:space-x-6 flex-shrink-0">
              {/* Track indicator for desktop */}
              <div className="hidden lg:block">
                <div className={`inline-flex items-center px-4 py-2 rounded-full text-responsive-sm font-medium shadow-sm desktop-hover-glow ${
                  isImpactTrack 
                    ? 'bg-impact-100 text-impact-800 hover:bg-impact-200' 
                    : 'bg-grow-100 text-grow-800 hover:bg-grow-200'
                }`}>
                  <div className={`w-3 h-3 rounded-full mr-2 ${
                    isImpactTrack ? 'bg-impact-600' : 'bg-grow-600'
                  }`}></div>
                  <span className="whitespace-nowrap">{themeConfig.name} Track</span>
                </div>
              </div>

              {/* Trust Points Badge */}
              {isAuthenticated && (
                <div className="desktop-hover-scale">
                  <TrustPointsBadge />
                </div>
              )}

              {/* User Name and Avatar (desktop only) */}
              {isAuthenticated && user && (
                <div className="hidden lg:flex items-center space-x-3 desktop-hover-lift cursor-pointer">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-responsive-sm text-gray-600 truncate max-w-32 font-medium">
                    {user.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex h-[calc(100vh-3.5rem)] sm:h-[calc(100vh-4rem)]">
        {/* Desktop Sidebar Navigation */}
        <Navigation 
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />

        {/* Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none mobile-nav-spacing">
            <div className="py-4 sm:py-6 lg:py-8">
              <div className="max-w-7xl mx-auto mobile-padding desktop-padding">
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Global Chat Modal */}
      <ChatModalContainer />
    </div>
  );
};

export default Layout;
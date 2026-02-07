/**
 * Lazy Layout Component
 * 
 * Provides the main application layout with navigation and content area.
 * 
 * @see Requirements 14.7
 */

import React, { useState } from 'react';
import { Navigation } from '../Navigation';
import { NavigationSection } from '../Navigation/types';

export interface LazyLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout component with navigation
 * 
 * Provides the main application layout with navigation and content area.
 * 
 * @param children - Main content to render
 */
export const LazyLayout: React.FC<LazyLayoutProps> = ({ children }) => {
  const [activeSection, setActiveSection] = useState<NavigationSection>('home');

  /**
   * Handle section change
   */
  const handleSectionChange = (section: NavigationSection) => {
    setActiveSection(section);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <Navigation
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
      />

      {/* Main Content */}
      <main className="pb-20 md:pb-0 md:pl-64">
        <div className="container mx-auto px-4 py-6">
          {children}
        </div>
      </main>
    </div>
  );
};

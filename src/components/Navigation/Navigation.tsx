/**
 * Navigation Component - Responsive navigation system
 * 
 * Features:
 * - Responsive breakpoint logic for navigation switching
 * - Mobile: BottomNav component
 * - Desktop: SideNav component
 * - Consistent navigation state across both views
 * 
 * Requirements: 2.1, 2.2, 2.5
 */

import React from 'react';
import { NavigationProps } from './types';
import { BottomNav } from './BottomNav';
import { SideNav } from './SideNav';

export const Navigation: React.FC<NavigationProps> = ({
  activeSection,
  onSectionChange,
}) => {
  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <SideNav 
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />
      
      {/* Mobile Bottom Navigation */}
      <BottomNav 
        activeSection={activeSection}
        onSectionChange={onSectionChange}
      />
    </>
  );
};

export default Navigation;
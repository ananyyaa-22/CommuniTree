/**
 * BottomNav Component - Mobile bottom navigation bar
 * 
 * Features:
 * - Persistent bottom navigation for mobile devices
 * - Home, My Schedule, and Profile options
 * - Active state highlighting
 * - Touch-optimized interactions
 * 
 * Requirements: 2.1, 2.3, 2.4
 */

import React from 'react';
import { clsx } from 'clsx';
import { NavigationProps } from './types';
import { navigationItems } from './navigationItems';

export const BottomNav: React.FC<NavigationProps> = ({
  activeSection,
  onSectionChange,
}) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 z-50 safe-area-inset-bottom">
      <div className="flex justify-around max-w-md mx-auto">
        {navigationItems.map((item) => {
          const isActive = activeSection === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={clsx(
                'flex flex-col items-center py-2 px-2 rounded-lg transition-colors duration-200 touch-target',
                'min-w-0 flex-1 max-w-[80px]', // Ensure equal spacing and prevent overflow
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 active:bg-gray-100'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon 
                className={clsx(
                  'w-6 h-6 mb-1 transition-colors duration-200 flex-shrink-0',
                  isActive ? 'text-blue-600' : 'text-gray-500'
                )} 
              />
              <span className={clsx(
                'text-xs font-medium truncate leading-tight',
                isActive ? 'text-blue-600' : 'text-gray-500'
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
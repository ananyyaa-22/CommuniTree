/**
 * SideNav Component - Desktop sidebar navigation
 * 
 * Features:
 * - Sidebar navigation for desktop devices
 * - Home, My Schedule, and Profile options
 * - Active state highlighting
 * - Hover states and desktop-optimized interactions
 * 
 * Requirements: 2.2, 2.3, 2.4
 */

import React from 'react';
import { clsx } from 'clsx';
import { NavigationProps } from './types';
import { navigationItems } from './navigationItems';

export const SideNav: React.FC<NavigationProps> = ({
  activeSection,
  onSectionChange,
}) => {
  return (
    <aside className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 xl:w-72">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto shadow-sm">
          {/* Navigation Header */}
          <div className="flex items-center flex-shrink-0 px-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Navigation</h2>
          </div>
          
          {/* Navigation Items */}
          <nav className="mt-2 flex-1 px-2 space-y-1">
            {navigationItems.map((item) => {
              const isActive = activeSection === item.id;
              const Icon = item.icon;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={clsx(
                    'group flex items-center w-full px-3 py-3 text-sm font-medium rounded-lg transition-all duration-200',
                    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                    'hover:shadow-sm transform hover:scale-[1.02]',
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600 shadow-md'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:border-r-2 hover:border-gray-300'
                  )}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon 
                    className={clsx(
                      'mr-3 flex-shrink-0 h-5 w-5 transition-all duration-200',
                      isActive 
                        ? 'text-blue-600' 
                        : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'
                    )}
                  />
                  <span className={clsx(
                    'transition-all duration-200 flex-1 text-left',
                    isActive ? 'text-blue-700 font-semibold' : 'text-gray-600 group-hover:font-medium'
                  )}>
                    {item.label}
                  </span>
                  
                  {/* Active indicator with animation */}
                  <div className={clsx(
                    'ml-auto transition-all duration-300',
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-75 group-hover:opacity-50 group-hover:scale-90'
                  )}>
                    <div className={clsx(
                      'w-2 h-2 rounded-full transition-colors duration-200',
                      isActive ? 'bg-blue-600' : 'bg-gray-400'
                    )}></div>
                  </div>
                  
                  {/* Hover effect overlay */}
                  <div className={clsx(
                    'absolute inset-0 rounded-lg transition-opacity duration-200 pointer-events-none',
                    'bg-gradient-to-r from-transparent to-blue-50',
                    isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'
                  )}></div>
                </button>
              );
            })}
          </nav>
          
          {/* Enhanced Navigation Footer */}
          <div className="flex-shrink-0 px-4 py-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">CT</span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-700">CommuniTree Platform</p>
                <p className="text-xs text-gray-500">Community Engagement</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default SideNav;
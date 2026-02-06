/**
 * useNavigation Hook - Navigation state management
 * 
 * Features:
 * - Manages current active navigation section
 * - Provides navigation change handlers
 * - Persists navigation state in localStorage
 * - Initializes with 'home' as default
 * 
 * Requirements: 2.3, 2.4
 */

import { useState, useEffect, useCallback } from 'react';

export type NavigationSection = 'home' | 'schedule' | 'profile';

const NAVIGATION_STORAGE_KEY = 'communitree_active_section';
const DEFAULT_SECTION: NavigationSection = 'home';

export const useNavigation = () => {
  const [activeSection, setActiveSection] = useState<NavigationSection>(DEFAULT_SECTION);

  // Load saved navigation state on mount
  useEffect(() => {
    try {
      const savedSection = localStorage.getItem(NAVIGATION_STORAGE_KEY) as NavigationSection;
      if (savedSection && ['home', 'schedule', 'profile'].includes(savedSection)) {
        setActiveSection(savedSection);
      }
    } catch (error) {
      console.warn('Failed to load navigation state from localStorage:', error);
    }
  }, []);

  // Save navigation state when it changes
  useEffect(() => {
    try {
      localStorage.setItem(NAVIGATION_STORAGE_KEY, activeSection);
    } catch (error) {
      console.warn('Failed to save navigation state to localStorage:', error);
    }
  }, [activeSection]);

  const handleSectionChange = useCallback((section: NavigationSection) => {
    setActiveSection(section);
  }, []);

  return {
    activeSection,
    onSectionChange: handleSectionChange,
    isHomeActive: activeSection === 'home',
    isScheduleActive: activeSection === 'schedule',
    isProfileActive: activeSection === 'profile',
  };
};
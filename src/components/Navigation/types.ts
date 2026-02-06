/**
 * Navigation types and interfaces
 */

export type NavigationSection = 'home' | 'schedule' | 'profile';

export interface NavigationItem {
  id: NavigationSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
}

export interface NavigationProps {
  activeSection: NavigationSection;
  onSectionChange: (section: NavigationSection) => void;
}
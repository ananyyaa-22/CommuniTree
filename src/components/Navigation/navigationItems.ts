/**
 * Navigation items configuration
 */

import { Home, Calendar, User } from 'lucide-react';
import { NavigationItem } from './types';

export const navigationItems: NavigationItem[] = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    path: '/',
  },
  {
    id: 'schedule',
    label: 'My Schedule',
    icon: Calendar,
    path: '/schedule',
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    path: '/profile',
  },
];
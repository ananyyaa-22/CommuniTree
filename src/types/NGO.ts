/**
 * NGO-related interfaces and types for CommuniTree platform
 */

import { ContactInfo } from './User';

export interface NGO {
  id: string;
  name: string;
  projectTitle: string;
  description: string;
  darpanId?: string;
  isVerified: boolean;
  contactInfo: ContactInfo;
  category: NGOCategory;
  volunteersNeeded: number;
  currentVolunteers: number;
  createdAt: Date;
  updatedAt: Date;
}

export type NGOCategory = 
  | 'Education'
  | 'Healthcare'
  | 'Environment'
  | 'Animal Welfare'
  | 'Community Development'
  | 'Disaster Relief'
  | 'Women Empowerment'
  | 'Child Welfare';
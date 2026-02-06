/**
 * Chat-related interfaces and types for CommuniTree platform
 */

import { User } from './User';
import { NGO } from './NGO';
import { Event } from './Event';

export interface ChatThread {
  id: string;
  participants: User[];
  context: ChatContext;
  messages: Message[];
  lastActivity: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: MessageType;
  isRead: boolean;
}

export type MessageType = 
  | 'text'
  | 'system'
  | 'notification';

export interface ChatContext {
  type: 'ngo' | 'event';
  reference: NGO | Event;
  title: string;
  description?: string;
}
/**
 * Chat Persistence Utilities
 * Handles saving and loading chat data to/from localStorage
 */

import { ChatThread, Message } from '../types/ChatThread';

const CHAT_STORAGE_KEY = 'communitree_chat_threads';
const CHAT_PREFERENCES_KEY = 'communitree_chat_preferences';

export interface ChatPreferences {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  autoMarkAsRead: boolean;
  maxStoredThreads: number;
}

const DEFAULT_CHAT_PREFERENCES: ChatPreferences = {
  notificationsEnabled: true,
  soundEnabled: false,
  autoMarkAsRead: true,
  maxStoredThreads: 50,
};

/**
 * Save chat threads to localStorage
 */
export const saveChatThreads = (threads: ChatThread[]): void => {
  try {
    const preferences = getChatPreferences();
    // Limit the number of stored threads to prevent localStorage bloat
    const threadsToStore = threads
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime())
      .slice(0, preferences.maxStoredThreads);
    
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(threadsToStore));
  } catch (error) {
    console.warn('Failed to save chat threads to localStorage:', error);
  }
};

/**
 * Load chat threads from localStorage
 */
export const loadChatThreads = (): ChatThread[] => {
  try {
    const stored = localStorage.getItem(CHAT_STORAGE_KEY);
    if (!stored) return [];
    
    const threads = JSON.parse(stored) as ChatThread[];
    
    // Convert date strings back to Date objects
    return threads.map(thread => ({
      ...thread,
      createdAt: new Date(thread.createdAt),
      updatedAt: new Date(thread.updatedAt),
      lastActivity: new Date(thread.lastActivity),
      messages: thread.messages.map(message => ({
        ...message,
        timestamp: new Date(message.timestamp),
      })),
    }));
  } catch (error) {
    console.warn('Failed to load chat threads from localStorage:', error);
    return [];
  }
};

/**
 * Save chat preferences to localStorage
 */
export const saveChatPreferences = (preferences: Partial<ChatPreferences>): void => {
  try {
    const current = getChatPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(CHAT_PREFERENCES_KEY, JSON.stringify(updated));
  } catch (error) {
    console.warn('Failed to save chat preferences to localStorage:', error);
  }
};

/**
 * Load chat preferences from localStorage
 */
export const getChatPreferences = (): ChatPreferences => {
  try {
    const stored = localStorage.getItem(CHAT_PREFERENCES_KEY);
    if (!stored) return DEFAULT_CHAT_PREFERENCES;
    
    const preferences = JSON.parse(stored) as Partial<ChatPreferences>;
    return { ...DEFAULT_CHAT_PREFERENCES, ...preferences };
  } catch (error) {
    console.warn('Failed to load chat preferences from localStorage:', error);
    return DEFAULT_CHAT_PREFERENCES;
  }
};

/**
 * Clear all chat data from localStorage
 */
export const clearChatData = (): void => {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
    localStorage.removeItem(CHAT_PREFERENCES_KEY);
  } catch (error) {
    console.warn('Failed to clear chat data from localStorage:', error);
  }
};

/**
 * Add a message to a specific thread and save to localStorage
 */
export const addMessageToThread = (
  threads: ChatThread[],
  threadId: string,
  message: Message
): ChatThread[] => {
  const updatedThreads = threads.map(thread =>
    thread.id === threadId
      ? {
          ...thread,
          messages: [...thread.messages, message],
          lastActivity: new Date(),
          updatedAt: new Date(),
        }
      : thread
  );
  
  saveChatThreads(updatedThreads);
  return updatedThreads;
};

/**
 * Mark messages as read in a specific thread and save to localStorage
 */
export const markMessagesAsRead = (
  threads: ChatThread[],
  threadId: string,
  messageIds: string[]
): ChatThread[] => {
  const updatedThreads = threads.map(thread =>
    thread.id === threadId
      ? {
          ...thread,
          messages: thread.messages.map(msg =>
            messageIds.includes(msg.id) ? { ...msg, isRead: true } : msg
          ),
          updatedAt: new Date(),
        }
      : thread
  );
  
  saveChatThreads(updatedThreads);
  return updatedThreads;
};

/**
 * Get unread message count across all threads or for a specific thread
 */
export const getUnreadMessageCount = (
  threads: ChatThread[],
  userId: string,
  threadId?: string
): number => {
  const relevantThreads = threadId 
    ? threads.filter(thread => thread.id === threadId)
    : threads;
  
  return relevantThreads.reduce((total, thread) => {
    return total + thread.messages.filter(msg => 
      !msg.isRead && msg.senderId !== userId
    ).length;
  }, 0);
};

/**
 * Clean up old messages to prevent storage bloat
 */
export const cleanupOldMessages = (threads: ChatThread[], maxAge: number = 30): ChatThread[] => {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - maxAge);
  
  const cleanedThreads = threads.map(thread => ({
    ...thread,
    messages: thread.messages.filter(msg => msg.timestamp > cutoffDate),
  })).filter(thread => thread.messages.length > 0 || thread.lastActivity > cutoffDate);
  
  saveChatThreads(cleanedThreads);
  return cleanedThreads;
};
/**
 * useChat Hook
 * 
 * Custom React hook for chat management.
 * Manages chat threads and messages with real-time subscriptions.
 * Automatically subscribes to message updates for the active thread.
 * Cleans up subscriptions on unmount.
 * 
 * @see Requirements 5.3, 5.4, 11.4, 11.5, 11.6, 13.5
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { chatService } from '../services/chat.service';
import type { ChatThread, ChatMessage } from '../types/models';
import { getErrorMessage } from '../utils/errors';

/**
 * Return type for useChat hook
 */
export interface UseChatReturn {
  threads: ChatThread[];
  messages: ChatMessage[];
  loading: boolean;
  error: Error | null;
  sendMessage: (content: string) => Promise<void>;
  selectThread: (threadId: string) => void;
}

/**
 * Custom hook for chat management
 * 
 * Manages chat threads and messages for a user.
 * Sets up real-time subscription for the active thread.
 * Automatically cleans up subscriptions when thread changes or component unmounts.
 * 
 * @param userId - User ID to manage chats for
 * @param activeThreadId - Optional thread ID to load messages for and subscribe to
 * @returns Chat data, loading state, error state, and chat management methods
 * 
 * @example
 * const { threads, messages, loading, sendMessage, selectThread } = useChat(user.id, activeThreadId);
 * 
 * // Select a thread
 * selectThread(threadId);
 * 
 * // Send a message
 * await sendMessage('Hello!');
 */
export function useChat(userId: string, activeThreadId?: string): UseChatReturn {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedThreadId, setSelectedThreadId] = useState<string | undefined>(activeThreadId);
  
  // Use ref to store unsubscribe function
  const unsubscribeRef = useRef<(() => void) | null>(null);

  /**
   * Fetch chat threads for the user
   */
  const fetchThreads = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const fetchedThreads = await chatService.getChatThreads(userId);
      setThreads(fetchedThreads);
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error);
      const error = new Error(errorMessage);
      setError(error);
      console.error('Failed to fetch chat threads:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /**
   * Fetch messages for a specific thread
   */
  const fetchMessages = useCallback(async (threadId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedMessages = await chatService.getMessages(threadId);
      setMessages(fetchedMessages);
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error);
      const error = new Error(errorMessage);
      setError(error);
      console.error('Failed to fetch messages:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Send a message in the active thread
   */
  const sendMessage = useCallback(async (content: string): Promise<void> => {
    if (!selectedThreadId) {
      throw new Error('No thread selected');
    }

    if (!userId) {
      throw new Error('User must be authenticated to send messages');
    }

    try {
      setError(null);
      
      const newMessage = await chatService.sendMessage(
        selectedThreadId,
        userId,
        'user',
        content
      );
      
      // Add message to local state (real-time subscription will also add it, but this is faster)
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      const errorMessage = getErrorMessage(err as Error);
      const error = new Error(errorMessage);
      setError(error);
      console.error('Failed to send message:', err);
      throw error;
    }
  }, [selectedThreadId, userId]);

  /**
   * Select a thread to view and subscribe to
   */
  const selectThread = useCallback((threadId: string) => {
    setSelectedThreadId(threadId);
  }, []);

  /**
   * Set up real-time subscription for active thread
   * Cleans up previous subscription when thread changes
   */
  useEffect(() => {
    // Clean up previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    // If no thread is selected, clear messages
    if (!selectedThreadId) {
      setMessages([]);
      return;
    }

    // Fetch messages for the selected thread
    fetchMessages(selectedThreadId);

    // Set up real-time subscription
    const unsubscribe = chatService.subscribeToMessages(
      selectedThreadId,
      (newMessage) => {
        // Add new message to state if it's not already there
        setMessages(prev => {
          const exists = prev.some(msg => msg.id === newMessage.id);
          if (exists) return prev;
          return [...prev, newMessage];
        });
      }
    );

    // Store unsubscribe function
    unsubscribeRef.current = unsubscribe;

    // Cleanup on unmount or when thread changes
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [selectedThreadId, fetchMessages]);

  /**
   * Fetch threads when userId changes
   */
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  /**
   * Update selected thread when activeThreadId prop changes
   */
  useEffect(() => {
    if (activeThreadId !== undefined) {
      setSelectedThreadId(activeThreadId);
    }
  }, [activeThreadId]);

  return {
    threads,
    messages,
    loading,
    error,
    sendMessage,
    selectThread,
  };
}

/**
 * Custom hook for chat functionality
 * Provides chat state access and chat-related actions with persistence
 */

import { useCallback, useEffect } from 'react';
import { useAppState, useAppDispatch } from './useAppState';
import { ChatThread, Message, ChatContext } from '../types/ChatThread';
import { NGO } from '../types/NGO';
import { Event } from '../types/Event';
import { 
  saveChatThreads, 
  loadChatThreads, 
  addMessageToThread as persistAddMessage,
  markMessagesAsRead as persistMarkRead,
  getUnreadMessageCount as persistGetUnreadCount,
  cleanupOldMessages
} from '../utils/chatPersistence';

export const useChat = () => {
  const state = useAppState();
  const dispatch = useAppDispatch();

  // Load chat threads from localStorage on mount
  useEffect(() => {
    const savedThreads = loadChatThreads();
    if (savedThreads.length > 0) {
      dispatch({ type: 'SET_CHAT_THREADS', payload: savedThreads });
    }
  }, [dispatch]);

  // Save chat threads to localStorage whenever they change
  useEffect(() => {
    if (state.chatThreads.length > 0) {
      saveChatThreads(state.chatThreads);
    }
  }, [state.chatThreads]);

  // Cleanup old messages periodically
  useEffect(() => {
    const cleanup = () => {
      if (state.chatThreads.length > 0) {
        const cleanedThreads = cleanupOldMessages(state.chatThreads);
        if (cleanedThreads.length !== state.chatThreads.length) {
          dispatch({ type: 'SET_CHAT_THREADS', payload: cleanedThreads });
        }
      }
    };

    // Run cleanup on mount and then every 24 hours
    cleanup();
    const interval = setInterval(cleanup, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [state.chatThreads, dispatch]);

  const createChatContext = useCallback((
    type: 'ngo' | 'event',
    reference: NGO | Event
  ): ChatContext => {
    return {
      type,
      reference,
      title: type === 'ngo' 
        ? (reference as NGO).name 
        : (reference as Event).title,
      description: type === 'ngo' 
        ? (reference as NGO).projectTitle 
        : (reference as Event).description,
    };
  }, []);

  const findOrCreateThread = useCallback((context: ChatContext): ChatThread => {
    if (!state.user) {
      throw new Error('User must be logged in to create chat thread');
    }

    const existingThread = state.chatThreads.find(thread => 
      thread.context.type === context.type && 
      thread.context.reference.id === context.reference.id
    );

    if (existingThread) {
      return existingThread;
    }

    // Create new thread
    const newThread: ChatThread = {
      id: `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      participants: [state.user],
      context,
      messages: [],
      lastActivity: new Date(),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    dispatch({ type: 'ADD_CHAT_THREAD', payload: newThread });
    return newThread;
  }, [state.user, state.chatThreads, dispatch]);

  const sendMessage = useCallback((
    threadId: string,
    content: string,
    type: 'text' | 'system' = 'text'
  ) => {
    if (!state.user || !content.trim()) return;

    const message: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: state.user.id,
      content: content.trim(),
      timestamp: new Date(),
      type,
      isRead: false,
    };

    dispatch({
      type: 'SEND_MESSAGE',
      payload: {
        threadId,
        message,
      },
    });

    // Simulate receiving a response for demo purposes
    if (type === 'text') {
      setTimeout(() => {
        const responseMessage: Message = {
          id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          senderId: 'system',
          content: getAutoResponse(content),
          timestamp: new Date(),
          type: 'text',
          isRead: false,
        };

        dispatch({
          type: 'SEND_MESSAGE',
          payload: {
            threadId,
            message: responseMessage,
          },
        });
      }, 1000 + Math.random() * 2000); // Random delay between 1-3 seconds
    }
  }, [state.user, dispatch]);

  const markMessagesAsRead = useCallback((threadId: string, messageIds: string[]) => {
    dispatch({
      type: 'MARK_MESSAGES_READ',
      payload: {
        threadId,
        messageIds,
      },
    });
  }, [dispatch]);

  const getThreadById = useCallback((threadId: string): ChatThread | undefined => {
    return state.chatThreads.find(thread => thread.id === threadId);
  }, [state.chatThreads]);

  const getThreadsByContext = useCallback((
    type: 'ngo' | 'event',
    referenceId: string
  ): ChatThread[] => {
    return state.chatThreads.filter(thread => 
      thread.context.type === type && 
      thread.context.reference.id === referenceId
    );
  }, [state.chatThreads]);

  const getUserChatHistory = useCallback((): ChatThread[] => {
    if (!state.user) return [];
    
    return state.chatThreads
      .filter(thread => 
        thread.participants.some(participant => participant.id === state.user?.id)
      )
      .sort((a, b) => new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime());
  }, [state.user, state.chatThreads]);

  const getUnreadMessageCount = useCallback((threadId?: string): number => {
    if (!state.user) return 0;

    if (threadId) {
      const thread = getThreadById(threadId);
      return thread?.messages.filter(msg => 
        !msg.isRead && msg.senderId !== state.user?.id
      ).length || 0;
    }

    // Return total unread count across all threads
    return persistGetUnreadCount(state.chatThreads, state.user.id);
  }, [state.user, state.chatThreads, getThreadById]);

  const hasUnreadMessages = useCallback((threadId?: string): boolean => {
    return getUnreadMessageCount(threadId) > 0;
  }, [getUnreadMessageCount]);

  return {
    chatThreads: state.chatThreads,
    createChatContext,
    findOrCreateThread,
    sendMessage,
    markMessagesAsRead,
    getThreadById,
    getThreadsByContext,
    getUserChatHistory,
    getUnreadMessageCount,
    hasUnreadMessages,
    totalUnreadCount: getUnreadMessageCount(),
    userChatHistory: getUserChatHistory(),
  };
};

// Helper function to generate auto-responses for demo purposes
const getAutoResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  if (message.includes('volunteer') || message.includes('help')) {
    return "Thank you for your interest in volunteering! We'd love to have you join our team. What specific activities are you most interested in?";
  }
  
  if (message.includes('time') || message.includes('when') || message.includes('schedule')) {
    return "Our activities are typically scheduled on weekends. We can work with your availability to find the best times for you to contribute.";
  }
  
  if (message.includes('location') || message.includes('where')) {
    return "We operate in various locations around the city. Once you join, we'll share the specific locations for upcoming activities.";
  }
  
  if (message.includes('event') || message.includes('attend')) {
    return "Great! We're excited to have you at the event. I'll send you more details about what to expect and what to bring.";
  }
  
  if (message.includes('question') || message.includes('?')) {
    return "I'm here to help answer any questions you have. Feel free to ask about anything related to our activities or how you can get involved.";
  }
  
  return "Thanks for reaching out! Someone from our team will get back to you soon with more information.";
};
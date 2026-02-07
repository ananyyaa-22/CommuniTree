/**
 * ChatProvider Component
 * Provides global chat functionality and manages chat modal state
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ChatModal } from './ChatModal';
import { ChatContext } from '../../types/ChatThread';
import { NGO } from '../../types/NGO';
import { Event } from '../../types/Event';
import { useUI } from '../../hooks/useUI';

interface ChatProviderContextType {
  openChatWithNGO: (ngo: NGO) => void;
  openChatWithEvent: (event: Event) => void;
  closeChatModal: () => void;
  selectThread: (threadId: string) => void;
  isOpen: boolean;
  currentContext: ChatContext | null;
}

const ChatProviderContext = createContext<ChatProviderContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);
  const { showModal, hideModal, isModalOpen } = useUI();

  const createChatContext = (type: 'ngo' | 'event', reference: NGO | Event): ChatContext => {
    if (type === 'ngo') {
      const ngo = reference as NGO;
      return {
        type: 'ngo',
        title: ngo.name,
        description: ngo.description || undefined,
        reference: ngo,
      };
    } else {
      const event = reference as Event;
      return {
        type: 'event',
        title: event.title,
        description: event.description || undefined,
        reference: event,
      };
    }
  };

  const openChatWithNGO = useCallback((ngo: NGO) => {
    const context = createChatContext('ngo', ngo);
    setChatContext(context);
    showModal('chat');
  }, [showModal]);

  const openChatWithEvent = useCallback((event: Event) => {
    const context = createChatContext('event', event);
    setChatContext(context);
    showModal('chat');
  }, [showModal]);

  const selectThread = useCallback((threadId: string) => {
    // For now, just open the modal
    // In a full implementation, you'd fetch the thread data and set context
    showModal('chat');
  }, [showModal]);

  const closeChatModal = useCallback(() => {
    hideModal();
    setChatContext(null);
  }, [hideModal]);

  const contextValue: ChatProviderContextType = {
    openChatWithNGO,
    openChatWithEvent,
    closeChatModal,
    selectThread,
    isOpen: isModalOpen('chat'),
    currentContext: chatContext,
  };

  return (
    <ChatProviderContext.Provider value={contextValue}>
      {children}
      <ChatModal
        isOpen={isModalOpen('chat')}
        context={chatContext}
        onClose={closeChatModal}
      />
    </ChatProviderContext.Provider>
  );
};

export const useChatProvider = (): ChatProviderContextType => {
  const context = useContext(ChatProviderContext);
  if (context === undefined) {
    throw new Error('useChatProvider must be used within a ChatProvider');
  }
  return context;
};
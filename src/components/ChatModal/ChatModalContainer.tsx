/**
 * ChatModalContainer Component
 * Container component that manages chat modal state and provides context
 */

import React, { useState, useCallback } from 'react';
import { ChatModal } from './ChatModal';
import { ChatContext } from '../../types/ChatThread';
import { NGO } from '../../types/NGO';
import { Event } from '../../types/Event';
import { useUI } from '../../hooks/useUI';

interface ChatModalContainerProps {
  children?: React.ReactNode;
}

export const ChatModalContainer: React.FC<ChatModalContainerProps> = ({ children }) => {
  const [chatContext, setChatContext] = useState<ChatContext | null>(null);
  const { isModalOpen, hideModal } = useUI();

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
  }, []);

  const openChatWithEvent = useCallback((event: Event) => {
    const context = createChatContext('event', event);
    setChatContext(context);
  }, []);

  const closeChatModal = useCallback(() => {
    hideModal();
    setChatContext(null);
  }, [hideModal]);

  // Provide chat functions to children through context or props
  const chatFunctions = {
    openChatWithNGO,
    openChatWithEvent,
  };

  return (
    <>
      {children && 
        React.Children.map(children, child => 
          React.isValidElement(child) 
            ? React.cloneElement(child, { ...chatFunctions } as any)
            : child
        )
      }
      
      <ChatModal
        isOpen={isModalOpen('chat')}
        context={chatContext}
        onClose={closeChatModal}
      />
    </>
  );
};

// Hook for accessing chat functions from child components
export const useChatModal = () => {
  const { showModal } = useUI();

  const openChatWithNGO = useCallback((ngo: NGO) => {
    showModal('chat');
    // Context will be set by the container
  }, [showModal]);

  const openChatWithEvent = useCallback((event: Event) => {
    showModal('chat');
    // Context will be set by the container
  }, [showModal]);

  return {
    openChatWithNGO,
    openChatWithEvent,
  };
};
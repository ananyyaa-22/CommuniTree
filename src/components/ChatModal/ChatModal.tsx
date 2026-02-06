/**
 * ChatModal Component
 * Universal chat interface for NGOs and events with context-aware messaging
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Building2, Calendar } from 'lucide-react';
import { ChatThread, Message, ChatContext } from '../../types/ChatThread';
import { NGO } from '../../types/NGO';
import { Event } from '../../types/Event';
import { useUI } from '../../hooks/useUI';
import { useAppState, useAppDispatch } from '../../hooks/useAppState';

interface ChatModalProps {
  isOpen: boolean;
  context: ChatContext | null;
  onClose: () => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({
  isOpen,
  context,
  onClose,
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [currentThread, setCurrentThread] = useState<ChatThread | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { ui } = useUI();
  const state = useAppState();
  const dispatch = useAppDispatch();

  // Find or create chat thread for the current context
  useEffect(() => {
    if (!context || !state.user) return;

    const existingThread = state.chatThreads.find(thread => 
      thread.context.type === context.type && 
      thread.context.reference.id === context.reference.id
    );

    if (existingThread) {
      setCurrentThread(existingThread);
    } else {
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
      setCurrentThread(newThread);
    }
  }, [context, state.user, state.chatThreads, dispatch]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [currentThread?.messages]);

  const scrollToBottom = () => {
    if (messagesEndRef.current && typeof messagesEndRef.current.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !currentThread || !state.user) return;

    const newMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderId: state.user.id,
      content: messageInput.trim(),
      timestamp: new Date(),
      type: 'text',
      isRead: false,
    };

    dispatch({
      type: 'SEND_MESSAGE',
      payload: {
        threadId: currentThread.id,
        message: newMessage,
      },
    });

    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getContextIcon = () => {
    if (!context) return <User className="w-5 h-5" />;
    return context.type === 'ngo' ? 
      <Building2 className="w-5 h-5" /> : 
      <Calendar className="w-5 h-5" />;
  };

  const getContextTitle = () => {
    if (!context) return 'Chat';
    return context.type === 'ngo' 
      ? `Chat with ${(context.reference as NGO).name}`
      : `Chat about ${(context.reference as Event).title}`;
  };

  const getContextSubtitle = () => {
    if (!context) return '';
    return context.type === 'ngo' 
      ? (context.reference as NGO).projectTitle
      : `Event on ${new Date((context.reference as Event).dateTime).toLocaleDateString()}`;
  };

  const formatMessageTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white rounded-t-lg sm:rounded-lg shadow-xl mobile-modal h-[90vh] sm:h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between responsive-card-padding border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className={`p-2 rounded-full flex-shrink-0 ${
              ui.theme === 'impact' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
            }`}>
              {getContextIcon()}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 text-responsive-sm truncate">
                {getContextTitle()}
              </h3>
              {getContextSubtitle() && (
                <p className="text-responsive-xs text-gray-500 truncate">
                  {getContextSubtitle()}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors touch-target flex-shrink-0"
            aria-label="Close chat"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto responsive-card-padding space-y-4">
          {currentThread?.messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-8">
              <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                ui.theme === 'impact' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
              }`}>
                {getContextIcon()}
              </div>
              <p className="text-responsive-sm">
                Start a conversation about {context?.type === 'ngo' ? 'volunteering opportunities' : 'this event'}
              </p>
            </div>
          ) : (
            currentThread?.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.senderId === state.user?.id ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                    message.senderId === state.user?.id
                      ? ui.theme === 'impact'
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-500 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <p className="text-responsive-sm break-words">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.senderId === state.user?.id
                      ? 'text-white text-opacity-75'
                      : 'text-gray-500'
                  }`}>
                    {formatMessageTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <div className="responsive-card-padding border-t border-gray-200 flex-shrink-0">
          <div className="flex space-x-2">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 touch-input border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              onClick={handleSendMessage}
              disabled={!messageInput.trim()}
              className={`mobile-button rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-target ${
                ui.theme === 'impact'
                  ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
/**
 * ChatHistory Component
 * Displays user's chat history with NGOs and events
 */

import React from 'react';
import { MessageCircle, Building2, Calendar, Clock } from 'lucide-react';
import { ChatThread } from '../../types/ChatThread';
import { NGO } from '../../types/NGO';
import { Event } from '../../types/Event';
import { useChat } from '../../hooks/useChat';
import { useChatProvider } from './ChatProvider';
import { clsx } from 'clsx';
import { format } from 'date-fns';

interface ChatHistoryProps {
  className?: string;
  maxItems?: number;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({
  className,
  maxItems = 10,
}) => {
  const { userChatHistory, getUnreadMessageCount } = useChat();
  const { openChatWithNGO, openChatWithEvent } = useChatProvider();

  const handleThreadClick = (thread: ChatThread) => {
    if (thread.context.type === 'ngo') {
      openChatWithNGO(thread.context.reference as NGO);
    } else {
      openChatWithEvent(thread.context.reference as Event);
    }
  };

  const getLastMessagePreview = (thread: ChatThread): string => {
    if (thread.messages.length === 0) {
      return 'No messages yet';
    }
    
    const lastMessage = thread.messages[thread.messages.length - 1];
    return lastMessage.content.length > 50 
      ? `${lastMessage.content.substring(0, 50)}...`
      : lastMessage.content;
  };

  const formatLastActivity = (date: Date): string => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return format(date, 'MMM dd');
    }
  };

  const getContextIcon = (type: 'ngo' | 'event') => {
    return type === 'ngo' ? 
      <Building2 className="w-4 h-4" /> : 
      <Calendar className="w-4 h-4" />;
  };

  const displayedThreads = userChatHistory.slice(0, maxItems);

  if (displayedThreads.length === 0) {
    return (
      <div className={clsx('text-center py-8', className)}>
        <MessageCircle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No chat history</h3>
        <p className="text-gray-500">
          Start conversations with NGOs and event organizers to see your chat history here.
        </p>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-2', className)}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Conversations</h3>
      
      {displayedThreads.map((thread) => {
        const unreadCount = getUnreadMessageCount(thread.id);
        const hasUnread = unreadCount > 0;
        
        return (
          <div
            key={thread.id}
            onClick={() => handleThreadClick(thread)}
            className={clsx(
              'p-4 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300',
              {
                'bg-blue-50 border-blue-200': hasUnread,
                'bg-white': !hasUnread,
              }
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {/* Context Icon */}
                <div className={clsx(
                  'p-2 rounded-full mt-1',
                  thread.context.type === 'ngo' 
                    ? 'bg-emerald-100 text-emerald-600'
                    : 'bg-amber-100 text-amber-600'
                )}>
                  {getContextIcon(thread.context.type)}
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className={clsx(
                      'font-medium truncate',
                      hasUnread ? 'text-gray-900' : 'text-gray-700'
                    )}>
                      {thread.context.title}
                    </h4>
                    {hasUnread && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                  
                  {thread.context.description && (
                    <p className="text-sm text-gray-500 truncate mb-2">
                      {thread.context.description}
                    </p>
                  )}
                  
                  <p className={clsx(
                    'text-sm truncate',
                    hasUnread ? 'text-gray-700 font-medium' : 'text-gray-500'
                  )}>
                    {getLastMessagePreview(thread)}
                  </p>
                </div>
              </div>

              {/* Last Activity */}
              <div className="flex items-center space-x-1 text-xs text-gray-400 ml-2">
                <Clock className="w-3 h-3" />
                <span>{formatLastActivity(thread.lastActivity)}</span>
              </div>
            </div>

            {/* Message Count */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                {thread.messages.length} message{thread.messages.length !== 1 ? 's' : ''}
              </span>
              
              <span className="text-xs text-gray-400">
                {thread.context.type === 'ngo' ? 'Volunteer Opportunity' : 'Event Chat'}
              </span>
            </div>
          </div>
        );
      })}

      {userChatHistory.length > maxItems && (
        <div className="text-center pt-4">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all conversations ({userChatHistory.length})
          </button>
        </div>
      )}
    </div>
  );
};
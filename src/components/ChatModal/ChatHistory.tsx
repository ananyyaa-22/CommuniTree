/**
 * ChatHistory Component
 * Displays user's chat history with NGOs and events
 */

import React from 'react';
import { MessageCircle, Building2, Calendar, Clock } from 'lucide-react';
import { ChatThread } from '../../types/models';
import { useAppState } from '../../hooks/useAppState';
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
  const { user } = useAppState();
  const { selectThread } = useChatProvider();
  const { threads } = useChat(user?.id || '', undefined);

  const handleThreadClick = (thread: ChatThread) => {
    // Select the thread to view
    selectThread(thread.id);
  };

  const getLastMessageText = (thread: ChatThread): string => {
    if (!thread.lastMessage) {
      return 'No messages yet';
    }
    
    const content = thread.lastMessage.messageContent;
    return content.length > 50 
      ? `${content.substring(0, 50)}...`
      : content;
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

  const displayedThreads = threads.slice(0, maxItems);

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
        const ngoName = thread.ngo?.name || 'Unknown NGO';
        const userName = thread.user?.displayName || 'Unknown User';
        
        return (
          <div
            key={thread.id}
            onClick={() => handleThreadClick(thread)}
            className="p-4 border border-gray-200 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md hover:border-gray-300 bg-white"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3 flex-1">
                {/* Context Icon */}
                <div className="p-2 rounded-full mt-1 bg-emerald-100 text-emerald-600">
                  <Building2 className="w-4 h-4" />
                </div>

                {/* Chat Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium truncate text-gray-700">
                      {ngoName}
                    </h4>
                  </div>
                  
                  <p className="text-sm text-gray-500 truncate mb-2">
                    Chat with {userName}
                  </p>
                  
                  <p className="text-sm truncate text-gray-500">
                    {getLastMessageText(thread)}
                  </p>
                </div>
              </div>

              {/* Last Activity */}
              <div className="flex items-center space-x-1 text-xs text-gray-400 ml-2">
                <Clock className="w-3 h-3" />
                <span>{formatLastActivity(thread.updatedAt)}</span>
              </div>
            </div>

            {/* Thread Info */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Chat thread
              </span>
              
              <span className="text-xs text-gray-400">
                Volunteer Opportunity
              </span>
            </div>
          </div>
        );
      })}

      {threads.length > maxItems && (
        <div className="text-center pt-4">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all conversations ({threads.length})
          </button>
        </div>
      )}
    </div>
  );
};
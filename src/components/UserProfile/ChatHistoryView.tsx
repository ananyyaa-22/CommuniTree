/**
 * ChatHistoryView Component - Chat history access interface
 * 
 * Features:
 * - Display all user chat threads
 * - Filter and search chat history
 * - Quick access to recent conversations
 * - Unread message indicators
 * 
 * Requirements: 7.6, 8.6, 8.7, 8.8
 */

import React, { useState, useMemo } from 'react';
import { 
  MessageCircle, 
  Search, 
  Calendar, 
  Users, 
  Building2,
  Clock,
  Filter,
  ChevronRight
} from 'lucide-react';
import { ChatThread } from '../../types/models';

interface ChatHistoryViewProps {
  chatHistory: ChatThread[];
  className?: string;
}

type FilterType = 'all' | 'ngo';

export const ChatHistoryView: React.FC<ChatHistoryViewProps> = ({ 
  chatHistory, 
  className = '' 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  // Filter and search chat threads
  const filteredThreads = useMemo(() => {
    let filtered = chatHistory;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(thread => 
        thread.ngo?.name.toLowerCase().includes(query) ||
        thread.user?.displayName.toLowerCase().includes(query)
      );
    }

    // Sort by last activity (most recent first)
    return filtered.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }, [chatHistory, searchQuery]);

  const formatLastActivity = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 168) { // 7 days
      return `${Math.floor(diffInHours / 24)}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getLastMessage = (thread: ChatThread) => {
    if (!thread.lastMessage) return 'No messages yet';
    
    const content = thread.lastMessage.messageContent;
    return content.length > 50 ? `${content.substring(0, 50)}...` : content;
  };

  if (chatHistory.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No chat history yet
        </h3>
        <p className="text-gray-500">
          Start conversations with NGOs and event organizers to see your chat history here.
        </p>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Chat History</h3>
        <p className="text-gray-600">
          View and manage your conversations with NGOs and event organizers.
        </p>
      </div>

      {/* Search and Filter Controls */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-700">Filter by:</span>
          {(['all', 'ngo'] as FilterType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`
                px-3 py-1 text-sm rounded-full border transition-colors
                ${filterType === type
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              {type === 'all' ? 'All' : 'NGOs'}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Thread List */}
      <div className="space-y-3">
        {filteredThreads.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">
              No conversations match your search criteria.
            </p>
          </div>
        ) : (
          filteredThreads.map((thread) => {
            const Icon = Building2;
            
            return (
              <div
                key={thread.id}
                className="
                  p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 
                  cursor-pointer transition-colors
                "
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-100 text-emerald-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {thread.ngo?.name || 'Unknown NGO'}
                        </h4>
                        <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-100 text-emerald-700">
                          NGO
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 truncate mb-2">
                        {getLastMessage(thread)}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatLastActivity(new Date(thread.updatedAt))}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <MessageCircle className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{chatHistory.length}</p>
              <p className="text-sm text-gray-600">Total Conversations</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{chatHistory.length}</p>
              <p className="text-sm text-gray-600">NGO Conversations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistoryView;
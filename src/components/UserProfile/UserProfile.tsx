/**
 * UserProfile Component - User profile display and management
 * 
 * Features:
 * - Profile display with personal information
 * - Trust points and engagement history display
 * - Profile editing functionality
 * - Chat history access interface
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6
 */

import React, { useState } from 'react';
import { 
  User, 
  Edit3, 
  MessageCircle, 
  Calendar, 
  Award, 
  TrendingUp,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useUser } from '../../hooks/useUser';
import { useChat } from '../../hooks/useChat';
import { 
  getTrustLevel, 
  getTrustLevelColor, 
  formatTrustPoints 
} from '../../utils/trustPoints';
import { ProfileEditForm } from './ProfileEditForm';
import { ChatHistoryView } from './ChatHistoryView';
import { EngagementHistory } from './EngagementHistory';
import { VerificationStatus } from '../Auth/VerificationStatus';

interface UserProfileProps {
  className?: string;
}

export const UserProfile: React.FC<UserProfileProps> = ({ className = '' }) => {
  const { user, isAuthenticated } = useUser();
  const { userChatHistory, totalUnreadCount } = useChat();
  const [activeTab, setActiveTab] = useState<'overview' | 'edit' | 'chat' | 'history'>('overview');

  if (!isAuthenticated || !user) {
    return (
      <div className={`flex items-center justify-center min-h-96 ${className}`}>
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Please log in to view your profile
          </h3>
          <p className="text-gray-500">
            Sign in to access your profile, trust points, and engagement history.
          </p>
        </div>
      </div>
    );
  }

  const trustLevel = getTrustLevel(user.trustPoints);
  const trustLevelColor = getTrustLevelColor(user.trustPoints);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'edit', label: 'Edit Profile', icon: Edit3 },
    { id: 'chat', label: 'Chat History', icon: MessageCircle, badge: totalUnreadCount },
    { id: 'history', label: 'Activity', icon: Calendar },
  ] as Array<{
    id: 'overview' | 'edit' | 'chat' | 'history';
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }>;

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {/* Profile Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Shield className={`w-4 h-4 ${trustLevelColor}`} />
                <span className={`text-sm font-medium ${trustLevelColor}`}>
                  {trustLevel} Member
                </span>
                {user.verificationStatus === 'verified' && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
            </div>
          </div>
          
          {/* Trust Points Badge */}
          <div className="text-right">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2 mb-1">
                <Award className={`w-5 h-5 ${trustLevelColor}`} />
                <span className="text-2xl font-bold text-gray-900">
                  {formatTrustPoints(user.trustPoints)}
                </span>
              </div>
              <p className="text-sm text-gray-600">Trust Points</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge && tab.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && (
          <ProfileOverview user={user} />
        )}
        
        {activeTab === 'edit' && (
          <ProfileEditForm user={user} />
        )}
        
        {activeTab === 'chat' && (
          <ChatHistoryView chatHistory={userChatHistory} />
        )}
        
        {activeTab === 'history' && (
          <EngagementHistory user={user} />
        )}
      </div>
    </div>
  );
};

// Profile Overview Component
const ProfileOverview: React.FC<{ user: import('../../types').User }> = ({ user }) => {
  const { communityImpactMetrics } = useUser();
  const trustLevel = getTrustLevel(user.trustPoints);
  const trustLevelColor = getTrustLevelColor(user.trustPoints);

  const stats = [
    {
      label: 'Events Organized',
      value: communityImpactMetrics.eventsOrganized,
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      label: 'Events Attended',
      value: communityImpactMetrics.eventsAttended,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      label: 'Community Contributions',
      value: communityImpactMetrics.communityContributions,
      icon: TrendingUp,
      color: 'text-purple-600',
    },
    {
      label: 'Member Since',
      value: new Date(user.createdAt).toLocaleDateString(),
      icon: Clock,
      color: 'text-gray-600',
    },
  ];

  const additionalMetrics = [
    {
      label: 'Volunteer Activities',
      value: communityImpactMetrics.volunteerActivities,
      icon: Award,
      color: 'text-orange-600',
    },
    {
      label: 'Attendance Rate',
      value: `${communityImpactMetrics.attendanceRate.toFixed(0)}%`,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      label: 'Reliability Score',
      value: communityImpactMetrics.reliabilityScore,
      icon: Shield,
      color: communityImpactMetrics.reliabilityScore === 'Excellent' ? 'text-green-600' : 
             communityImpactMetrics.reliabilityScore === 'Good' ? 'text-yellow-600' : 'text-red-600',
    },
    {
      label: 'Trust Points Earned',
      value: `+${communityImpactMetrics.totalTrustPointsEarned}`,
      icon: TrendingUp,
      color: 'text-blue-600',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Account Status */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">Account Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3">
            <Shield className={`w-5 h-5 ${trustLevelColor}`} />
            <div>
              <p className="text-sm font-medium text-gray-900">Trust Level</p>
              <p className={`text-sm ${trustLevelColor}`}>{trustLevel}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {user.verificationStatus === 'verified' ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500" />
            )}
            <div>
              <p className="text-sm font-medium text-gray-900">Verification</p>
              <p className={`text-sm ${
                user.verificationStatus === 'verified' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {user.verificationStatus === 'verified' ? 'Verified' : 'Pending'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Identity Verification Status */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Identity Verification</h3>
        <VerificationStatus />
      </div>

      {/* Community Impact Stats */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Community Impact</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional Metrics */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {additionalMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <Icon className={`w-5 h-5 ${metric.color}`} />
                  <div>
                    <p className="text-xl font-bold text-gray-900">{metric.value}</p>
                    <p className="text-sm text-gray-600">{metric.label}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Preview */}
      {user.eventHistory.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {user.eventHistory
              .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
              .slice(0, 3)
              .map((event, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      event.type === 'organized' ? 'bg-blue-500' :
                      event.type === 'attended' ? 'bg-green-500' :
                      event.type === 'rsvp' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    <span className="text-sm text-gray-900 capitalize">
                      {event.type.replace('_', ' ')} event
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(event.timestamp).toLocaleDateString()}
                    </p>
                    {event.trustPointsAwarded !== 0 && (
                      <p className={`text-xs ${
                        event.trustPointsAwarded > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {event.trustPointsAwarded > 0 ? '+' : ''}{event.trustPointsAwarded} points
                      </p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
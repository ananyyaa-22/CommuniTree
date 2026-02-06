/**
 * EngagementHistory Component - User engagement and activity tracking
 * 
 * Features:
 * - Engagement history tracking
 * - Community impact metrics display
 * - Activity timeline and statistics
 * - Trust points history
 * 
 * Requirements: 7.4, 7.5
 */

import React, { useState, useMemo } from 'react';
import { 
  Calendar, 
  Award, 
  TrendingUp, 
  Users, 
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Filter,
  BarChart3
} from 'lucide-react';
import { User, UserEvent } from '../../types';
import { formatTrustPoints } from '../../utils/trustPoints';
import { useUser } from '../../hooks/useUser';

interface EngagementHistoryProps {
  user: User;
  className?: string;
}

type ActivityFilter = 'all' | 'organized' | 'attended' | 'rsvp' | 'no_show';

export const EngagementHistory: React.FC<EngagementHistoryProps> = ({ 
  user, 
  className = '' 
}) => {
  const { communityImpactMetrics } = useUser();
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>('all');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year' | 'all'>('all');

  // Filter activities based on selected filters
  const filteredActivities = useMemo(() => {
    let filtered = user.eventHistory;

    // Apply activity type filter
    if (activityFilter !== 'all') {
      filtered = filtered.filter(event => event.type === activityFilter);
    }

    // Apply time range filter
    if (timeRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (timeRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(event => 
        new Date(event.timestamp) >= cutoffDate
      );
    }

    // Sort by timestamp (most recent first)
    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [user.eventHistory, activityFilter, timeRange]);

  // Calculate community impact metrics using the hook
  const impactMetrics = useMemo(() => {
    const activities = filteredActivities;
    const hookMetrics = communityImpactMetrics;
    
    // Filter metrics based on current filters
    const filteredMetrics = {
      totalEvents: activities.length,
      eventsOrganized: activities.filter(e => e.type === 'organized').length,
      eventsAttended: activities.filter(e => e.type === 'attended').length,
      totalTrustPointsEarned: activities.reduce((sum, e) => sum + Math.max(0, e.trustPointsAwarded), 0),
      totalTrustPointsLost: Math.abs(activities.reduce((sum, e) => sum + Math.min(0, e.trustPointsAwarded), 0)),
      attendanceRate: activities.filter(e => e.type === 'rsvp').length > 0 
        ? (activities.filter(e => e.type === 'attended').length / activities.filter(e => e.type === 'rsvp').length) * 100
        : 100,
      noShows: activities.filter(e => e.type === 'no_show').length,
      reliabilityScore: hookMetrics.reliabilityScore,
      communityContributions: hookMetrics.communityContributions,
      volunteerActivities: hookMetrics.volunteerActivities,
    };

    return filteredMetrics;
  }, [filteredActivities, communityImpactMetrics]);

  const getActivityIcon = (type: UserEvent['type']) => {
    switch (type) {
      case 'organized':
        return <Users className="w-4 h-4 text-blue-600" />;
      case 'attended':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rsvp':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'no_show':
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getActivityColor = (type: UserEvent['type']) => {
    switch (type) {
      case 'organized':
        return 'bg-blue-50 border-blue-200';
      case 'attended':
        return 'bg-green-50 border-green-200';
      case 'rsvp':
        return 'bg-yellow-50 border-yellow-200';
      case 'no_show':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const formatActivityType = (type: UserEvent['type']) => {
    switch (type) {
      case 'organized':
        return 'Organized Event';
      case 'attended':
        return 'Attended Event';
      case 'rsvp':
        return 'RSVP\'d to Event';
      case 'no_show':
        return 'Missed Event';
      default:
        return 'Unknown Activity';
    }
  };

  return (
    <div className={`${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Activity History</h3>
        <p className="text-gray-600">
          Track your community engagement and view your impact metrics.
        </p>
      </div>

      {/* Impact Metrics Overview */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{impactMetrics.totalEvents}</p>
              <p className="text-sm text-gray-600">Total Activities</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Users className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{impactMetrics.eventsOrganized}</p>
              <p className="text-sm text-gray-600">Events Organized</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{impactMetrics.eventsAttended}</p>
              <p className="text-sm text-gray-600">Events Attended</p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <Award className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {formatTrustPoints(impactMetrics.totalTrustPointsEarned)}
              </p>
              <p className="text-sm text-gray-600">Points Earned</p>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="mb-8 bg-gray-50 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <BarChart3 className="w-5 h-5" />
          <span>Community Impact Summary</span>
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
            <div className="flex items-center space-x-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(100, impactMetrics.attendanceRate)}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-900">
                {impactMetrics.attendanceRate.toFixed(0)}%
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Trust Points Balance</p>
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-lg font-bold text-green-600">
                +{impactMetrics.totalTrustPointsEarned}
              </span>
              {impactMetrics.totalTrustPointsLost > 0 && (
                <>
                  <span className="text-gray-400">|</span>
                  <span className="text-lg font-bold text-red-600">
                    -{impactMetrics.totalTrustPointsLost}
                  </span>
                </>
              )}
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Reliability Score</p>
            <div className="flex items-center space-x-2">
              {impactMetrics.noShows === 0 ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : impactMetrics.noShows <= 2 ? (
                <AlertCircle className="w-4 h-4 text-yellow-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-lg font-bold text-gray-900">
                {impactMetrics.reliabilityScore}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Activity Type:</span>
            <select
              value={activityFilter}
              onChange={(e) => setActivityFilter(e.target.value as ActivityFilter)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Activities</option>
              <option value="organized">Organized</option>
              <option value="attended">Attended</option>
              <option value="rsvp">RSVP'd</option>
              <option value="no_show">Missed</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-700">Time Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as typeof timeRange)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Activity Timeline</h4>
        
        {filteredActivities.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No activities found for the selected filters.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredActivities.map((activity, index) => (
              <div
                key={`${activity.id}-${index}`}
                className={`p-4 border rounded-lg ${getActivityColor(activity.type)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">
                        {formatActivityType(activity.type)}
                      </h5>
                      <p className="text-sm text-gray-600 mt-1">
                        Event ID: {activity.eventId}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {activity.trustPointsAwarded !== 0 && (
                    <div className={`text-sm font-medium ${
                      activity.trustPointsAwarded > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {activity.trustPointsAwarded > 0 ? '+' : ''}{activity.trustPointsAwarded} points
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EngagementHistory;
/**
 * TrustPointsWarning Component
 * Displays warnings when user has low trust points
 * Shows recommendations for improving trust points
 */

import React from 'react';
import { AlertTriangle, TrendingUp, Users, Calendar, Award } from 'lucide-react';
import { useTrustPoints } from '../../hooks/useTrustPoints';
import { clsx } from 'clsx';

export interface TrustPointsWarningProps {
  className?: string;
  showRecommendations?: boolean;
}

export const TrustPointsWarning: React.FC<TrustPointsWarningProps> = ({
  className,
  showRecommendations = true,
}) => {
  const { 
    currentPoints, 
    trustLevel, 
    trustLevelColor, 
    shouldShowWarning, 
    limits 
  } = useTrustPoints();

  if (!shouldShowWarning) return null;

  const getWarningLevel = () => {
    if (currentPoints <= 10) return 'critical';
    if (currentPoints <= 20) return 'warning';
    return 'caution';
  };

  const warningLevel = getWarningLevel();

  const getWarningMessage = () => {
    if (warningLevel === 'critical') {
      return 'Your trust points are critically low. You may be restricted from participating in events.';
    }
    if (warningLevel === 'warning') {
      return 'Your trust points are low. Consider attending events you RSVP to in order to improve your standing.';
    }
    return 'Your trust points could be improved. Consistent participation helps build community trust.';
  };

  const getWarningColor = () => {
    if (warningLevel === 'critical') return 'bg-red-50 border-red-200 text-red-800';
    if (warningLevel === 'warning') return 'bg-orange-50 border-orange-200 text-orange-800';
    return 'bg-yellow-50 border-yellow-200 text-yellow-800';
  };

  const getIconColor = () => {
    if (warningLevel === 'critical') return 'text-red-600';
    if (warningLevel === 'warning') return 'text-orange-600';
    return 'text-yellow-600';
  };

  const recommendations = [
    {
      icon: Calendar,
      title: 'Attend Events',
      description: 'Show up to events you RSVP to (+5 points each)',
      points: '+5',
    },
    {
      icon: Users,
      title: 'Organize Events',
      description: 'Host community events (+20 points each)',
      points: '+20',
    },
    {
      icon: Award,
      title: 'Volunteer Activities',
      description: 'Participate in NGO volunteer work (+15 points each)',
      points: '+15',
    },
    {
      icon: TrendingUp,
      title: 'Community Contributions',
      description: 'Make positive contributions to the community (+10 points each)',
      points: '+10',
    },
  ];

  return (
    <div className={clsx(
      'rounded-lg border p-4',
      getWarningColor(),
      className
    )}>
      {/* Warning Header */}
      <div className="flex items-start space-x-3">
        <AlertTriangle className={clsx('w-5 h-5 mt-0.5 flex-shrink-0', getIconColor())} />
        <div className="flex-1">
          <h3 className="text-sm font-medium mb-1">
            Low Trust Points ({currentPoints}/{limits.MAX})
          </h3>
          <p className="text-sm opacity-90">
            {getWarningMessage()}
          </p>
        </div>
      </div>

      {/* Current Status */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span>Current Level: <strong className={trustLevelColor}>{trustLevel}</strong></span>
        <span>Need {limits.WARNING_THRESHOLD - currentPoints} more points to reach safe level</span>
      </div>

      {/* Recommendations */}
      {showRecommendations && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-3">Ways to Improve Your Trust Points:</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-2 text-sm">
                <rec.icon className="w-4 h-4 mt-0.5 flex-shrink-0 opacity-70" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{rec.title}</span>
                    <span className="text-green-600 font-medium text-xs">{rec.points}</span>
                  </div>
                  <p className="text-xs opacity-80 mt-0.5">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span>Progress to Safe Level</span>
          <span>{Math.min(100, (currentPoints / limits.WARNING_THRESHOLD) * 100).toFixed(0)}%</span>
        </div>
        <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
          <div 
            className={clsx(
              'h-2 rounded-full transition-all duration-300',
              {
                'bg-red-500': warningLevel === 'critical',
                'bg-orange-500': warningLevel === 'warning',
                'bg-yellow-500': warningLevel === 'caution',
              }
            )}
            style={{ 
              width: `${Math.min(100, (currentPoints / limits.WARNING_THRESHOLD) * 100)}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default TrustPointsWarning;
/**
 * TrustPointsBadge Component
 * Enhanced trust points display for header with detailed information
 * Shows current points, level, and warning indicators
 * Optimized with React.memo for performance
 */

import React, { useState, memo } from 'react';
import { Award, TrendingUp, TrendingDown, AlertTriangle, Info } from 'lucide-react';
import { useTrustPoints } from '../../hooks/useTrustPoints';
import { clsx } from 'clsx';

export interface TrustPointsBadgeProps {
  className?: string;
  showTooltip?: boolean;
}

export const TrustPointsBadge: React.FC<TrustPointsBadgeProps> = memo(({
  className,
  showTooltip = true,
}) => {
  const { 
    currentPoints, 
    trustLevel, 
    shouldShowWarning, 
    limits 
  } = useTrustPoints();
  const [showDetails, setShowDetails] = useState(false);

  const getBadgeColor = () => {
    if (shouldShowWarning) {
      if (currentPoints <= 10) return 'bg-red-100 text-red-800 border-red-200';
      return 'bg-orange-100 text-orange-800 border-orange-200';
    }
    if (currentPoints >= 80) return 'bg-green-100 text-green-800 border-green-200';
    if (currentPoints >= 60) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  };

  const getIcon = () => {
    if (shouldShowWarning) return AlertTriangle;
    if (currentPoints >= 80) return Award;
    return TrendingUp;
  };

  const Icon = getIcon();

  const getProgressWidth = () => {
    return (currentPoints / limits.MAX) * 100;
  };

  return (
    <div className={clsx('relative', className)}>
      <button
        onClick={() => setShowDetails(!showDetails)}
        onMouseEnter={() => showTooltip && setShowDetails(true)}
        onMouseLeave={() => showTooltip && setShowDetails(false)}
        className={clsx(
          'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border transition-all duration-200 hover:shadow-sm',
          getBadgeColor()
        )}
      >
        <Icon className="w-4 h-4 mr-1" />
        <span className="hidden sm:inline mr-1">Trust:</span>
        <span>{currentPoints}</span>
        <span className="hidden md:inline">/{limits.MAX}</span>
        {shouldShowWarning && (
          <span className="ml-1 w-2 h-2 bg-current rounded-full animate-pulse" />
        )}
      </button>

      {/* Detailed Tooltip */}
      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900">Trust Points</h3>
            <button
              onClick={() => setShowDetails(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Current Status */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Current Level</span>
              <span className={clsx('text-sm font-medium', {
                'text-green-600': currentPoints >= 80,
                'text-blue-600': currentPoints >= 60 && currentPoints < 80,
                'text-yellow-600': currentPoints >= 40 && currentPoints < 60,
                'text-orange-600': currentPoints >= 20 && currentPoints < 40,
                'text-red-600': currentPoints < 20,
              })}>
                {trustLevel}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className={clsx('h-2 rounded-full transition-all duration-300', {
                  'bg-green-500': currentPoints >= 80,
                  'bg-blue-500': currentPoints >= 60 && currentPoints < 80,
                  'bg-yellow-500': currentPoints >= 40 && currentPoints < 60,
                  'bg-orange-500': currentPoints >= 20 && currentPoints < 40,
                  'bg-red-500': currentPoints < 20,
                })}
                style={{ width: `${getProgressWidth()}%` }}
              />
            </div>
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>0</span>
              <span>{currentPoints}/{limits.MAX}</span>
            </div>
          </div>

          {/* Warning Message */}
          {shouldShowWarning && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-yellow-800 font-medium mb-1">Low Trust Points</p>
                  <p className="text-yellow-700">
                    You need {limits.WARNING_THRESHOLD - currentPoints} more points to reach a safe level.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
              Ways to Earn Points
            </h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Attend Events</span>
                <span className="text-green-600 font-medium">+5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Organize Events</span>
                <span className="text-green-600 font-medium">+20</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Volunteer Work</span>
                <span className="text-green-600 font-medium">+15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Verify Identity</span>
                <span className="text-green-600 font-medium">+10</span>
              </div>
            </div>
          </div>

          {/* Warning about point loss */}
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-start space-x-2">
              <TrendingDown className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-600">
                <strong className="text-red-600">-10 points</strong> for not attending events you RSVP to
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

TrustPointsBadge.displayName = 'TrustPointsBadge';

export default TrustPointsBadge;
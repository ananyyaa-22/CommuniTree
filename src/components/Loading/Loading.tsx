/**
 * Loading Component - Consistent loading states across the application
 * 
 * Features:
 * - Multiple loading variants (spinner, skeleton, overlay)
 * - Customizable size and colors
 * - Accessible loading indicators
 * - Track-aware theming
 * 
 * Requirements: 10.3
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';
import clsx from 'clsx';

interface LoadingProps {
  variant?: 'spinner' | 'skeleton' | 'overlay' | 'inline';
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  className?: string;
  fullScreen?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({
  variant = 'spinner',
  size = 'md',
  text,
  className = '',
  fullScreen = false,
}) => {
  const { isImpactTrack } = useTheme();

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const spinnerColor = isImpactTrack ? 'text-impact-600' : 'text-grow-600';

  if (variant === 'spinner') {
    const content = (
      <div className={clsx(
        'flex flex-col items-center justify-center space-y-2',
        fullScreen ? 'min-h-screen' : 'py-8',
        className
      )}>
        <Loader2 className={clsx(
          'animate-spin',
          sizeClasses[size],
          spinnerColor
        )} />
        {text && (
          <p className={clsx(
            'text-gray-600 font-medium',
            textSizeClasses[size]
          )}>
            {text}
          </p>
        )}
      </div>
    );

    if (fullScreen) {
      return (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
          {content}
        </div>
      );
    }

    return content;
  }

  if (variant === 'overlay') {
    return (
      <div className={clsx(
        'absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10',
        className
      )}>
        <div className="flex flex-col items-center space-y-2">
          <Loader2 className={clsx(
            'animate-spin',
            sizeClasses[size],
            spinnerColor
          )} />
          {text && (
            <p className={clsx(
              'text-gray-600 font-medium',
              textSizeClasses[size]
            )}>
              {text}
            </p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className={clsx('flex items-center space-x-2', className)}>
        <Loader2 className={clsx(
          'animate-spin',
          sizeClasses[size],
          spinnerColor
        )} />
        {text && (
          <span className={clsx(
            'text-gray-600',
            textSizeClasses[size]
          )}>
            {text}
          </span>
        )}
      </div>
    );
  }

  if (variant === 'skeleton') {
    return (
      <div className={clsx('animate-pulse space-y-4', className)}>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
        <div className="h-32 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return null;
};

// Skeleton components for specific use cases
export const CardSkeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={clsx('animate-pulse bg-white rounded-lg border border-gray-200 p-6', className)}>
    <div className="flex items-start space-x-4">
      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
    </div>
    <div className="mt-4 space-y-2">
      <div className="h-3 bg-gray-200 rounded"></div>
      <div className="h-3 bg-gray-200 rounded w-5/6"></div>
    </div>
    <div className="mt-4 flex space-x-2">
      <div className="h-8 bg-gray-200 rounded w-20"></div>
      <div className="h-8 bg-gray-200 rounded w-16"></div>
    </div>
  </div>
);

export const FeedSkeleton: React.FC<{ count?: number; className?: string }> = ({ 
  count = 3, 
  className = '' 
}) => (
  <div className={clsx('space-y-6', className)}>
    {Array.from({ length: count }).map((_, index) => (
      <CardSkeleton key={index} />
    ))}
  </div>
);

export default Loading;
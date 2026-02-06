/**
 * TrackToggle Component
 * Central toggle for switching between Impact and Grow tracks
 * Features deep emerald styling for Impact, bright amber for Grow
 * Persists track selection in localStorage
 */

import React from 'react';
import { clsx } from 'clsx';
import { Heart, Sparkles } from 'lucide-react';
import { TrackType } from '../../types';

interface TrackToggleProps {
  currentTrack: TrackType;
  onTrackChange: (track: TrackType) => void;
  className?: string;
}

export const TrackToggle: React.FC<TrackToggleProps> = ({
  currentTrack,
  onTrackChange,
  className
}) => {
  const handleToggle = () => {
    const newTrack = currentTrack === 'impact' ? 'grow' : 'impact';
    onTrackChange(newTrack);
  };

  return (
    <div className={clsx('flex items-center justify-center mobile-padding lg:justify-start', className)}>
      <div className="relative bg-gray-100 rounded-full p-1 shadow-inner w-full max-w-sm lg:max-w-none lg:w-auto desktop-hover-glow">
        {/* Hidden checkbox for accessibility */}
        <input
          type="checkbox"
          id="track-toggle"
          className="sr-only"
          checked={currentTrack === 'grow'}
          onChange={handleToggle}
          aria-label={`Switch to ${currentTrack === 'impact' ? 'Grow' : 'Impact'} track`}
        />
        
        {/* Toggle container */}
        <div className="relative flex items-center">
          {/* Impact Track Button */}
          <label
            htmlFor="track-toggle"
            className={clsx(
              'flex items-center justify-center space-x-1 sm:space-x-2 px-4 sm:px-6 lg:px-8 py-3 rounded-full cursor-pointer transition-all duration-300 ease-in-out touch-target',
              'text-responsive-sm font-medium select-none flex-1 sm:flex-none desktop-focus-ring',
              currentTrack === 'impact'
                ? 'bg-impact-600 text-white shadow-lg transform scale-105 desktop-hover-glow'
                : 'text-impact-700 hover:bg-impact-50 active:bg-impact-100 desktop-hover-scale'
            )}
          >
            <Heart 
              size={16} 
              className={clsx(
                'transition-all duration-300 flex-shrink-0',
                currentTrack === 'impact' ? 'fill-current' : ''
              )} 
            />
            <span className="truncate">Impact</span>
          </label>

          {/* Grow Track Button */}
          <label
            htmlFor="track-toggle"
            className={clsx(
              'flex items-center justify-center space-x-1 sm:space-x-2 px-4 sm:px-6 lg:px-8 py-3 rounded-full cursor-pointer transition-all duration-300 ease-in-out touch-target',
              'text-responsive-sm font-medium select-none flex-1 sm:flex-none desktop-focus-ring',
              currentTrack === 'grow'
                ? 'bg-grow-600 text-white shadow-lg transform scale-105 desktop-hover-glow'
                : 'text-grow-700 hover:bg-grow-50 active:bg-grow-100 desktop-hover-scale'
            )}
          >
            <Sparkles 
              size={16} 
              className={clsx(
                'transition-all duration-300 flex-shrink-0',
                currentTrack === 'grow' ? 'fill-current' : ''
              )} 
            />
            <span className="truncate">Grow</span>
          </label>
        </div>
      </div>

      {/* Track description */}
      <div className="ml-4 hidden lg:block flex-shrink-0">
        <p className="text-responsive-xs text-gray-600 max-w-xs">
          {currentTrack === 'impact' 
            ? 'Community Service & NGO Partnerships'
            : 'Local Entertainment & Social Events'
          }
        </p>
      </div>
    </div>
  );
};

export default TrackToggle;
/**
 * HomePage Component - Main dashboard with track-based content
 * 
 * Features:
 * - Track toggle and welcome section
 * - Track-specific feed display (NGO/Social)
 * - Trust points warning integration
 * - Responsive layout
 * 
 * Requirements: 10.3
 */

import React from 'react';
import { TrackToggleContainer } from '../TrackToggle';
import { NGOFeed } from '../NGOCard';
import { SocialFeed } from '../SocialFeed';
import { TrustPointsWarning } from '../TrustPointsWarning';
import { useTheme } from '../../hooks/useTheme';
import { useTrustPoints } from '../../hooks/useTrustPoints';

export const HomePage: React.FC = () => {
  const { isImpactTrack, isGrowTrack, themeConfig } = useTheme();
  const { shouldShowWarning } = useTrustPoints();

  return (
    <div className="space-y-8">
      {/* Trust Points Warning - Show at top when needed */}
      {shouldShowWarning && (
        <div className="max-w-4xl mx-auto">
          <TrustPointsWarning />
        </div>
      )}

      {/* Track Toggle */}
      <div className="flex justify-center">
        <TrackToggleContainer />
      </div>

      {/* Welcome Section with Track-based Theming */}
      <div className="track-card p-8 max-w-md mx-auto">
        <h2 className="text-2xl font-semibold track-text mb-4">
          Welcome to CommuniTree
        </h2>
        <p className="text-gray-600 mb-6">
          Connect with your community through volunteering and local events.
        </p>
        
        {/* Current Track Display */}
        <div className="space-y-4">
          <div className="text-center">
            <h3 className="text-lg font-medium mb-2 track-text">
              Current Track: {themeConfig.name}
            </h3>
            <p className="text-sm track-text-light">
              {themeConfig.description}
            </p>
          </div>
          
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-4 h-4 rounded-full ${isImpactTrack ? 'bg-impact-600' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-700">Impact Track - Community Service</span>
          </div>
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-4 h-4 rounded-full ${isGrowTrack ? 'bg-grow-600' : 'bg-gray-300'}`}></div>
            <span className="text-sm text-gray-700">Grow Track - Local Entertainment</span>
          </div>
        </div>

        {/* Theme Preview */}
        <div className="mt-6 p-4 track-bg rounded-lg border track-border">
          <h4 className="text-sm font-medium track-text mb-2">Theme Preview</h4>
          <div className="flex items-center justify-center space-x-2">
            <button className="track-button px-3 py-1 rounded text-sm">
              Primary Button
            </button>
            <span className="track-badge">Badge</span>
          </div>
        </div>
      </div>

      {/* NGO Feed - Only show on Impact track */}
      {isImpactTrack && (
        <div className="max-w-6xl mx-auto">
          <NGOFeed />
        </div>
      )}

      {/* Grow Track - Social Feed */}
      {isGrowTrack && (
        <div className="max-w-6xl mx-auto">
          <SocialFeed />
        </div>
      )}
    </div>
  );
};

export default HomePage;

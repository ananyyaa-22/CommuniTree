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
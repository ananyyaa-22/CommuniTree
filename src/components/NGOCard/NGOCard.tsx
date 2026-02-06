/**
 * NGOCard Component
 * Displays NGO information with verification status and volunteer interaction
 * Supports responsive grid/list view layouts with track-based theming
 * Optimized with React.memo for performance
 */

import React, { memo } from 'react';
import { Shield, Users, MessageCircle, MapPin } from 'lucide-react';
import { NGO } from '../../types';
import { clsx } from 'clsx';
import { getVerificationStatusText, getVerificationBadgeColor, isEligibleForVerification } from '../../utils/verification';

export interface NGOCardProps {
  ngo: NGO;
  viewMode?: 'grid' | 'list';
  onVerify?: (ngoId: string) => void;
  onVolunteer?: (ngo: NGO) => void;
  className?: string;
}

const NGOCardComponent: React.FC<NGOCardProps> = ({
  ngo,
  viewMode = 'grid',
  onVerify,
  onVolunteer,
  className,
}) => {
  const handleVolunteerClick = () => {
    onVolunteer?.(ngo);
  };

  const handleVerifyClick = () => {
    onVerify?.(ngo.id);
  };

  const volunteersNeeded = ngo.volunteersNeeded - ngo.currentVolunteers;
  const isFullyStaffed = volunteersNeeded <= 0;

  return (
    <div
      className={clsx(
        'track-card responsive-card-padding hover:shadow-lg transition-all duration-200',
        {
          // Grid view: vertical card layout
          'flex flex-col space-y-3 sm:space-y-4': viewMode === 'grid',
          // List view: horizontal card layout
          'flex flex-col sm:flex-row sm:items-center sm:space-x-6 py-3 sm:py-4': viewMode === 'list',
        },
        className
      )}
    >
      {/* Header Section */}
      <div className={clsx(
        'flex items-start justify-between',
        {
          'flex-col space-y-2': viewMode === 'grid',
          'flex-col sm:flex-row sm:items-center flex-1 space-y-2 sm:space-y-0': viewMode === 'list',
        }
      )}>
        <div className={clsx(
          'flex-1 min-w-0',
          {
            'space-y-2': viewMode === 'grid',
            'space-y-1': viewMode === 'list',
          }
        )}>
          {/* Organization Name */}
          <h3 className={clsx(
            'font-semibold track-text',
            {
              'text-responsive-base': viewMode === 'grid',
              'text-responsive-sm': viewMode === 'list',
            }
          )}>
            {ngo.name}
          </h3>

          {/* Project Title */}
          <h4 className={clsx(
            'font-medium text-gray-700',
            {
              'text-responsive-sm': viewMode === 'grid',
              'text-responsive-xs': viewMode === 'list',
            }
          )}>
            {ngo.projectTitle}
          </h4>

          {/* Category Badge */}
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <span className="track-badge text-xs">
              {ngo.category}
            </span>
            
            {/* Verification Badge */}
            {ngo.isVerified && ngo.darpanId && (
              <div className={clsx(
                'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
                getVerificationBadgeColor(ngo)
              )}>
                <Shield className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{getVerificationStatusText(ngo)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Volunteer Count - Grid view only */}
        {viewMode === 'grid' && (
          <div className="flex items-center space-x-1 text-responsive-sm text-gray-600 flex-shrink-0">
            <Users className="w-4 h-4" />
            <span>{ngo.currentVolunteers}/{ngo.volunteersNeeded}</span>
          </div>
        )}
      </div>

      {/* Description - Grid view or expanded list view */}
      {(viewMode === 'grid' || viewMode === 'list') && (
        <p className={clsx(
          'text-gray-600 leading-relaxed',
          {
            'text-responsive-sm line-clamp-3': viewMode === 'grid',
            'text-responsive-xs line-clamp-2 flex-1': viewMode === 'list',
          }
        )}>
          {ngo.description}
        </p>
      )}

      {/* Contact Info - List view only */}
      {viewMode === 'list' && ngo.contactInfo.address && (
        <div className="flex items-center space-x-1 text-xs text-gray-500 sm:hidden">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate max-w-32">
            {ngo.contactInfo.address}
          </span>
        </div>
      )}

      {/* Action Section */}
      <div className={clsx(
        'flex items-center justify-between',
        {
          'flex-col space-y-3': viewMode === 'grid',
          'flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0': viewMode === 'list',
        }
      )}>
        {/* Volunteer Stats - List view only */}
        {viewMode === 'list' && (
          <div className="flex items-center space-x-4 text-responsive-sm text-gray-600 w-full sm:w-auto">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{ngo.currentVolunteers}/{ngo.volunteersNeeded}</span>
            </div>
            {!isFullyStaffed && (
              <span className="text-orange-600 font-medium">
                {volunteersNeeded} needed
              </span>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className={clsx(
          'flex items-center space-x-2',
          {
            'w-full': viewMode === 'grid',
            'flex-shrink-0 w-full sm:w-auto': viewMode === 'list',
          }
        )}>
          {/* Verify Button - Only show for unverified NGOs that are eligible */}
          {!ngo.isVerified && isEligibleForVerification(ngo) && onVerify && (
            <button
              onClick={handleVerifyClick}
              className="flex items-center justify-center space-x-1 mobile-button lg:desktop-button border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 touch-target desktop-focus-ring desktop-hover-lift"
              title="Help verify this NGO with their Darpan ID"
            >
              <Shield className="w-4 h-4" />
              <span>Verify NGO</span>
            </button>
          )}

          {/* Volunteer Button */}
          <button
            onClick={handleVolunteerClick}
            disabled={isFullyStaffed}
            className={clsx(
              'flex items-center justify-center space-x-2 mobile-button lg:desktop-button font-medium rounded-md transition-all duration-200 touch-target desktop-focus-ring',
              {
                'track-button flex-1 desktop-hover-glow': viewMode === 'grid' && !isFullyStaffed,
                'track-button flex-1 sm:flex-none desktop-hover-glow': viewMode === 'list' && !isFullyStaffed,
                'bg-gray-300 text-gray-500 cursor-not-allowed flex-1 sm:flex-none': isFullyStaffed,
              }
            )}
          >
            <MessageCircle className="w-4 h-4" />
            <span>
              {isFullyStaffed ? 'Fully Staffed' : 'Volunteer'}
            </span>
          </button>
        </div>
      </div>

      {/* Volunteer Need Indicator - Grid view only */}
      {viewMode === 'grid' && !isFullyStaffed && (
        <div className="text-center">
          <span className="text-responsive-sm text-orange-600 font-medium">
            {volunteersNeeded} volunteer{volunteersNeeded !== 1 ? 's' : ''} needed
          </span>
        </div>
      )}
    </div>
  );
};

// Memoize the component for performance optimization
export const NGOCard = memo(NGOCardComponent, (prevProps, nextProps) => {
  // Custom comparison function for better performance
  return (
    prevProps.ngo.id === nextProps.ngo.id &&
    prevProps.ngo.isVerified === nextProps.ngo.isVerified &&
    prevProps.ngo.currentVolunteers === nextProps.ngo.currentVolunteers &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.className === nextProps.className
  );
});

NGOCard.displayName = 'NGOCard';

export default NGOCard;
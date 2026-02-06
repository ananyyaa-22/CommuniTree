/**
 * EventCard Component
 * Displays event information with safety ratings and RSVP functionality
 * Supports responsive layouts with track-based theming for Grow track events
 * Optimized with React.memo for performance
 */

import React, { useState, memo } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  MessageCircle, 
  Shield,
  CheckCircle
} from 'lucide-react';
import { Event } from '../../types';
import { clsx } from 'clsx';
import { 
  getVenueRatingColor, 
  getVenueRatingBadge, 
  getVenueRatingDescription 
} from '../../utils/venueRating';
import { useEvents } from '../../hooks/useEvents';
import { useTrustPoints } from '../../hooks/useTrustPoints';
import { RSVPModal } from '../RSVPModal';
import { format } from 'date-fns';

export interface EventCardProps {
  event: Event;
  viewMode?: 'grid' | 'list';
  onChat?: (event: Event) => void;
  className?: string;
}

export const EventCard: React.FC<EventCardProps> = memo(({
  event,
  viewMode = 'grid',
  onChat,
  className,
}) => {
  const { hasUserRSVPd } = useEvents();
  const { canRSVP } = useTrustPoints();
  const [showRSVPModal, setShowRSVPModal] = useState(false);

  const isUserRSVPd = hasUserRSVPd(event.id);
  const spotsRemaining = event.maxAttendees - event.rsvpList.length;
  const isEventFull = spotsRemaining <= 0;
  const isEventPast = event.dateTime < new Date();
  const canUserRSVP = canRSVP() && !isEventFull && !isEventPast;

  const handleRSVPClick = () => {
    setShowRSVPModal(true);
  };

  const handleChatClick = () => {
    onChat?.(event);
  };

  const formatEventDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  const formatEventTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const getEventDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  return (
    <div
      className={clsx(
        'track-card responsive-card-padding hover:shadow-lg transition-all duration-200',
        {
          // Grid view: vertical card layout
          'flex flex-col space-y-3 sm:space-y-4': viewMode === 'grid',
          // List view: horizontal card layout
          'flex flex-col sm:flex-row sm:items-start sm:space-x-6 py-3 sm:py-4': viewMode === 'list',
        },
        className
      )}
    >
      {/* Header Section */}
      <div className={clsx(
        'flex items-start justify-between',
        {
          'flex-col space-y-2': viewMode === 'grid',
          'flex-col sm:flex-row sm:items-start flex-1 space-y-2 sm:space-y-0': viewMode === 'list',
        }
      )}>
        <div className={clsx(
          'flex-1 min-w-0',
          {
            'space-y-2': viewMode === 'grid',
            'space-y-1': viewMode === 'list',
          }
        )}>
          {/* Event Title */}
          <h3 className={clsx(
            'font-semibold track-text',
            {
              'text-responsive-base': viewMode === 'grid',
              'text-responsive-sm': viewMode === 'list',
            }
          )}>
            {event.title}
          </h3>

          {/* Category and Safety Badge */}
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <span className="track-badge text-xs">
              {event.category}
            </span>
            
            {/* Venue Safety Rating Badge */}
            <div className={clsx(
              'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
              getVenueRatingColor(event.venue.safetyRating)
            )}>
              <Shield className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{getVenueRatingBadge(event.venue.safetyRating)}</span>
            </div>

            {/* RSVP Status Badge */}
            {isUserRSVPd && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                <CheckCircle className="w-3 h-3 flex-shrink-0" />
                <span>RSVP'd</span>
              </div>
            )}
          </div>

          {/* Event Details */}
          <div className={clsx(
            'flex items-center space-x-2 sm:space-x-4 text-responsive-xs text-gray-600',
            {
              'flex-col items-start space-x-0 space-y-1': viewMode === 'grid',
              'flex-wrap': viewMode === 'list',
            }
          )}>
            {/* Date and Time */}
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Calendar className="w-4 h-4" />
              <span>{formatEventDate(event.dateTime)}</span>
            </div>
            
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Clock className="w-4 h-4" />
              <span>{formatEventTime(event.dateTime)} ({getEventDuration(event.duration)})</span>
            </div>

            {/* Venue */}
            <div className="flex items-center space-x-1 min-w-0">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{event.venue.name}</span>
            </div>
          </div>
        </div>

        {/* Attendee Count - Grid view only */}
        {viewMode === 'grid' && (
          <div className="flex items-center space-x-1 text-responsive-sm text-gray-600 flex-shrink-0">
            <Users className="w-4 h-4" />
            <span>{event.rsvpList.length}/{event.maxAttendees}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <p className={clsx(
        'text-gray-600 leading-relaxed',
        {
          'text-responsive-sm line-clamp-3': viewMode === 'grid',
          'text-responsive-xs line-clamp-2 flex-1': viewMode === 'list',
        }
      )}>
        {event.description}
      </p>

      {/* Venue Safety Information */}
      <div className="text-xs text-gray-500 italic">
        {getVenueRatingDescription(event.venue.safetyRating)}
      </div>

      {/* Action Section */}
      <div className={clsx(
        'flex items-center justify-between',
        {
          'flex-col space-y-3': viewMode === 'grid',
          'flex-col sm:flex-row sm:space-x-4 space-y-2 sm:space-y-0': viewMode === 'list',
        }
      )}>
        {/* Event Stats - List view only */}
        {viewMode === 'list' && (
          <div className="flex items-center space-x-4 text-responsive-sm text-gray-600 w-full sm:w-auto">
            <div className="flex items-center space-x-1">
              <Users className="w-4 h-4" />
              <span>{event.rsvpList.length}/{event.maxAttendees}</span>
            </div>
            {spotsRemaining > 0 && spotsRemaining <= 5 && (
              <span className="text-orange-600 font-medium">
                {spotsRemaining} spot{spotsRemaining !== 1 ? 's' : ''} left
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
          {/* Chat Button */}
          <button
            onClick={handleChatClick}
            className="flex items-center justify-center space-x-1 mobile-button lg:desktop-button border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 touch-target desktop-focus-ring desktop-hover-lift"
            title="Chat with event organizer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Chat</span>
          </button>

          {/* RSVP Button */}
          <button
            onClick={handleRSVPClick}
            disabled={isEventPast}
            className={clsx(
              'flex items-center justify-center space-x-2 mobile-button lg:desktop-button font-medium rounded-md transition-all duration-200 touch-target desktop-focus-ring',
              {
                // RSVP'd state
                'bg-green-600 text-white hover:bg-green-700 flex-1 sm:flex-none desktop-hover-glow': isUserRSVPd,
                // Available to RSVP
                'track-button flex-1 sm:flex-none desktop-hover-glow': !isUserRSVPd && !isEventPast,
                // Disabled states
                'bg-gray-300 text-gray-500 cursor-not-allowed flex-1 sm:flex-none': isEventPast,
              }
            )}
          >
            {isUserRSVPd ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Manage RSVP</span>
              </>
            ) : (
              <>
                <Users className="w-4 h-4" />
                <span>
                  {isEventPast ? 'Event Ended' : 'RSVP'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Spots Remaining Indicator - Grid view only */}
      {viewMode === 'grid' && spotsRemaining > 0 && spotsRemaining <= 5 && !isEventFull && (
        <div className="text-center">
          <span className="text-responsive-sm text-orange-600 font-medium">
            Only {spotsRemaining} spot{spotsRemaining !== 1 ? 's' : ''} remaining!
          </span>
        </div>
      )}

      {/* Organizer Info */}
      <div className="text-xs text-gray-500 border-t pt-2">
        Organized by <span className="font-medium">{event.organizer.name}</span>
      </div>

      {/* RSVP Modal */}
      <RSVPModal
        isOpen={showRSVPModal}
        event={event}
        onClose={() => setShowRSVPModal(false)}
      />
    </div>
  );
});

EventCard.displayName = 'EventCard';

export default EventCard;
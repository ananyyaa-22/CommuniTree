/**
 * RSVPModal Component
 * Displays RSVP confirmation modal with trust points warning
 * Handles attendance tracking and trust points deduction warnings
 */

import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Shield,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { Event } from '../../types';
import { useAppState } from '../../hooks/useAppState';
import { useRSVP } from '../../hooks/useRSVP';
import { useTrustPoints } from '../../hooks/useTrustPoints';
import { format } from 'date-fns';
import { clsx } from 'clsx';
import { 
  getVenueRatingColor, 
  getVenueRatingBadge, 
  getVenueRatingDescription 
} from '../../utils/venueRating';

export interface RSVPModalProps {
  isOpen: boolean;
  event: Event | null;
  onClose: () => void;
}

export const RSVPModal: React.FC<RSVPModalProps> = ({
  isOpen,
  event,
  onClose,
}) => {
  const { user } = useAppState();
  const { createRSVP, cancelRSVP, isRSVPd } = useRSVP(user?.id || '');
  const { 
    currentPoints, 
    shouldShowWarning, 
    getRSVPWarning, 
    getPointsAfterAction,
    limits 
  } = useTrustPoints();
  const [isConfirming, setIsConfirming] = useState(false);

  if (!isOpen || !event) return null;

  const isUserRSVPd = isRSVPd(event.id);
  const spotsRemaining = event.maxAttendees - event.rsvpList.length;
  const isEventFull = spotsRemaining <= 0;
  const isEventPast = event.dateTime < new Date();
  const pointsAfterNoShow = getPointsAfterAction('NO_SHOW');
  const warningMessage = getRSVPWarning();

  const handleConfirmRSVP = async () => {
    try {
      if (isUserRSVPd) {
        await cancelRSVP(event.id);
      } else {
        await createRSVP(event.id);
      }
      setIsConfirming(false);
      onClose();
    } catch (error) {
      console.error('Failed to update RSVP:', error);
      setIsConfirming(false);
    }
  };

  const handleClose = () => {
    setIsConfirming(false);
    onClose();
  };

  const formatEventDate = (date: Date) => {
    return format(date, 'EEEE, MMMM dd, yyyy');
  };

  const formatEventTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const getEventDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours} hour${hours !== 1 ? 's' : ''}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={handleClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {isUserRSVPd ? 'Cancel RSVP' : 'RSVP to Event'}
            </h3>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Event Details */}
          <div className="mb-6">
            <h4 className="text-xl font-semibold text-gray-900 mb-2">
              {event.title}
            </h4>
            
            {/* Category and Safety Badge */}
            <div className="flex items-center space-x-2 mb-3">
              <span className="track-badge text-sm">
                {event.category}
              </span>
              
              <div className={clsx(
                'flex items-center space-x-1 px-2 py-1 rounded-full text-sm font-medium',
                getVenueRatingColor(event.venue.safetyRating)
              )}>
                <Shield className="w-3 h-3" />
                <span>{getVenueRatingBadge(event.venue.safetyRating)}</span>
              </div>
            </div>

            {/* Event Info Grid */}
            <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4" />
                <span>{formatEventDate(event.dateTime)}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>{formatEventTime(event.dateTime)} ({getEventDuration(event.duration)})</span>
              </div>

              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4" />
                <span>{event.venue.name}</span>
              </div>

              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>{event.rsvpList.length}/{event.maxAttendees} attendees</span>
              </div>
            </div>

            {/* Venue Safety Information */}
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>Venue Safety:</strong> {getVenueRatingDescription(event.venue.safetyRating)}
              </p>
            </div>

            {/* Event Description */}
            <div className="mt-3">
              <p className="text-sm text-gray-700 leading-relaxed">
                {event.description}
              </p>
            </div>
          </div>

          {/* Trust Points Warning */}
          {!isUserRSVPd && shouldShowWarning && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">
                    Trust Points Warning
                  </h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    {warningMessage}
                  </p>
                  <div className="text-sm text-yellow-700">
                    <p>
                      <strong>Current Trust Points:</strong> {currentPoints}/{limits.MAX}
                    </p>
                    <p>
                      <strong>If you don't attend:</strong> {pointsAfterNoShow}/{limits.MAX} 
                      <span className="text-red-600 font-medium"> (-10 points)</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Cancel RSVP Warning */}
          {isUserRSVPd && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-800 mb-1">
                    Cancel RSVP
                  </h4>
                  <p className="text-sm text-blue-700">
                    Are you sure you want to cancel your RSVP? This will free up your spot for other community members.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Event Status Warnings */}
          {isEventFull && !isUserRSVPd && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-red-800 mb-1">
                    Event Full
                  </h4>
                  <p className="text-sm text-red-700">
                    This event has reached its maximum capacity. You can join the waitlist or check back later for cancellations.
                  </p>
                </div>
              </div>
            </div>
          )}

          {isEventPast && (
            <div className="mb-6 bg-gray-50 border border-gray-200 rounded-md p-4">
              <div className="flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-gray-800 mb-1">
                    Event Ended
                  </h4>
                  <p className="text-sm text-gray-700">
                    This event has already taken place. You can no longer RSVP.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            
            {!isEventPast && (!isEventFull || isUserRSVPd) && (
              <button
                onClick={handleConfirmRSVP}
                disabled={isConfirming}
                className={clsx(
                  'flex-1 px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
                  {
                    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500': isUserRSVPd,
                    'track-button': !isUserRSVPd,
                    'opacity-50 cursor-not-allowed': isConfirming,
                  }
                )}
              >
                {isConfirming ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <>
                    {isUserRSVPd ? (
                      <>
                        <XCircle className="w-4 h-4 mr-2 inline" />
                        Cancel RSVP
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2 inline" />
                        Confirm RSVP
                      </>
                    )}
                  </>
                )}
              </button>
            )}
          </div>

          {/* Spots Remaining */}
          {!isEventFull && !isEventPast && spotsRemaining <= 5 && (
            <div className="mt-3 text-center">
              <p className="text-sm text-orange-600 font-medium">
                Only {spotsRemaining} spot{spotsRemaining !== 1 ? 's' : ''} remaining!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RSVPModal;
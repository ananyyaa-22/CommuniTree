/**
 * SchedulePage Component - User's event schedule and calendar
 * 
 * Features:
 * - Display upcoming events and RSVPs
 * - Show past event history
 * - Event management (cancel RSVP, etc.)
 * - Calendar view integration
 * 
 * Requirements: 10.3
 */

import React, { useState, useMemo } from 'react';
import { Calendar, Clock, MapPin, Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useEvents } from '../../hooks/useEvents';
import { useAppState } from '../../hooks/useAppState';
import { useRSVP } from '../../hooks/useRSVP';
import { Loading } from '../Loading';
import { formatDistanceToNow, isAfter, isBefore } from 'date-fns';
import type { Event } from '../../types/Event';

type ScheduleView = 'upcoming' | 'past' | 'organized';

interface EventWithRSVP {
  event: Event;
  status: 'confirmed' | 'attended' | 'cancelled' | 'no_show';
}

export const SchedulePage: React.FC = () => {
  const { user } = useAppState();
  const { events: impactEvents, loading: impactLoading } = useEvents('impact');
  const { events: growEvents, loading: growLoading } = useEvents('grow');
  const { rsvps, loading: rsvpsLoading, cancelRSVP } = useRSVP(user?.id || '');
  const [activeView, setActiveView] = useState<ScheduleView>('upcoming');

  // Combine all events
  const allEvents = useMemo(() => [...impactEvents, ...growEvents], [impactEvents, growEvents]);

  // Filter events user has RSVP'd to
  const userRSVPEvents = useMemo(() => {
    return allEvents
      .filter(event => rsvps.some(rsvp => rsvp.eventId === event.id))
      .map(event => {
        const rsvp = rsvps.find(r => r.eventId === event.id)!;
        return {
          event,
          status: rsvp.status,
        };
      });
  }, [allEvents, rsvps]);

  // Filter events user is organizing
  const userOrganizedEvents = useMemo(() => {
    return allEvents.filter(
      event => event.organizer.id === user?.id
    );
  }, [allEvents, user?.id]);

  const now = new Date();
  
  const upcomingEvents = userRSVPEvents.filter(rsvp => 
    isAfter(new Date(rsvp.event.dateTime), now) && rsvp.status === 'confirmed'
  );
  const pastEvents = userRSVPEvents.filter(rsvp => 
    isBefore(new Date(rsvp.event.dateTime), now)
  );
  const organizedEvents = userOrganizedEvents;

  if (!user) {
    return (
      <div className="text-center py-12">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Please log in to view your schedule
        </h3>
        <p className="text-gray-500">
          Sign in to see your upcoming events and RSVPs.
        </p>
      </div>
    );
  }

  if (impactLoading || growLoading || rsvpsLoading) {
    return <Loading />;
  }

  const views = [
    { id: 'upcoming', label: 'Upcoming', count: upcomingEvents.length },
    { id: 'past', label: 'Past Events', count: pastEvents.length },
    { id: 'organized', label: 'Organized', count: organizedEvents.length },
  ] as Array<{ id: ScheduleView; label: string; count: number }>;

  const handleCancelRSVP = async (eventId: string) => {
    try {
      await cancelRSVP(eventId);
    } catch (error) {
      console.error('Failed to cancel RSVP:', error);
    }
  };

  const renderEventList = (events: EventWithRSVP[] | Event[], type: 'rsvp' | 'organized') => {
    if (events.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">
            {type === 'rsvp' 
              ? `No ${activeView} events found.`
              : 'You haven\'t organized any events yet.'
            }
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {events.map((item, index) => {
          const event = type === 'rsvp' ? (item as EventWithRSVP).event : (item as Event);
          const rsvpStatus = type === 'rsvp' ? (item as EventWithRSVP).status : null;
          
          return (
            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{event.title}</h3>
                    {type === 'rsvp' && rsvpStatus && (
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        rsvpStatus === 'confirmed' ? 'bg-green-100 text-green-800' :
                        rsvpStatus === 'attended' ? 'bg-blue-100 text-blue-800' :
                        rsvpStatus === 'no_show' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {rsvpStatus === 'confirmed' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {rsvpStatus === 'attended' && <CheckCircle className="w-3 h-3 mr-1" />}
                        {rsvpStatus === 'no_show' && <XCircle className="w-3 h-3 mr-1" />}
                        {rsvpStatus === 'cancelled' && <AlertCircle className="w-3 h-3 mr-1" />}
                        {rsvpStatus.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-4">{event.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(event.dateTime).toLocaleDateString()}</span>
                      <span>{new Date(event.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <span>{event.venue.name}</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Users className="w-4 h-4" />
                      <span>{event.attendees.length} / {event.maxAttendees} attendees</span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right text-sm text-gray-500">
                  {activeView === 'upcoming' && (
                    <p>In {formatDistanceToNow(new Date(event.dateTime))}</p>
                  )}
                  {activeView === 'past' && (
                    <p>{formatDistanceToNow(new Date(event.dateTime))} ago</p>
                  )}
                </div>
              </div>
              
              {/* Action buttons for upcoming events */}
              {activeView === 'upcoming' && type === 'rsvp' && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleCancelRSVP(event.id)}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Cancel RSVP
                    </button>
                    <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Schedule</h1>
          <p className="text-gray-600">Manage your events and RSVPs</p>
        </div>
        
        {/* Quick Stats */}
        <div className="hidden md:flex space-x-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{upcomingEvents.length}</p>
            <p className="text-sm text-gray-500">Upcoming</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{pastEvents.filter((e: EventWithRSVP) => e.status === 'attended').length}</p>
            <p className="text-sm text-gray-500">Attended</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">{organizedEvents.length}</p>
            <p className="text-sm text-gray-500">Organized</p>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8">
          {views.map((view) => (
            <button
              key={view.id}
              onClick={() => setActiveView(view.id)}
              className={`
                flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                ${activeView === view.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <span>{view.label}</span>
              {view.count > 0 && (
                <span className="bg-gray-100 text-gray-600 text-xs rounded-full px-2 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
                  {view.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div>
        {activeView === 'upcoming' && renderEventList(upcomingEvents, 'rsvp')}
        {activeView === 'past' && renderEventList(pastEvents, 'rsvp')}
        {activeView === 'organized' && renderEventList(organizedEvents, 'organized')}
      </div>
    </div>
  );
};

export default SchedulePage;

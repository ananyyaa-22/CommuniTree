/**
 * Example demonstrating how to use the CommuniTree Context and Hooks
 * This file shows the complete implementation working together
 */

import React from 'react';
import { AppProvider } from '../context';
import { 
  useUser, 
  useCurrentTrack, 
  useTrustPoints, 
  useUI 
} from '../hooks';
import { useNGOs } from '../hooks/useNGOs.supabase';
import { useEvents } from '../hooks/useEvents';
import { useRSVP } from '../hooks/useRSVP';

// Example component showing user information
const UserInfo: React.FC = () => {
  const { user, isAuthenticated, updateUser } = useUser();
  const { currentPoints, trustLevel, formattedPoints, awardPoints } = useTrustPoints();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">User Information</h3>
      <p><strong>Name:</strong> {user?.name}</p>
      <p><strong>Email:</strong> {user?.email}</p>
      <p><strong>Trust Points:</strong> {formattedPoints}</p>
      <p><strong>Trust Level:</strong> {trustLevel}</p>
      <p><strong>Verification:</strong> {user?.verificationStatus}</p>
      
      <div className="mt-4 space-x-2">
        <button 
          onClick={() => awardPoints('ATTEND_EVENT')}
          className="bg-green-500 text-white px-3 py-1 rounded text-sm"
        >
          Award Event Points (+5)
        </button>
        <button 
          onClick={() => awardPoints('ORGANIZE_EVENT')}
          className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
        >
          Award Organizer Points (+20)
        </button>
      </div>
    </div>
  );
};

// Example component showing track switching
const TrackSwitcher: React.FC = () => {
  const { currentTrack, switchTrack, isImpactTrack, isGrowTrack, toggleTrack } = useCurrentTrack();

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Track Selection</h3>
      <p className="mb-4">Current Track: <strong>{currentTrack}</strong></p>
      
      <div className="space-x-2">
        <button
          onClick={() => switchTrack('impact')}
          className={`px-4 py-2 rounded ${
            isImpactTrack 
              ? 'bg-emerald-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Impact Track
        </button>
        <button
          onClick={() => switchTrack('grow')}
          className={`px-4 py-2 rounded ${
            isGrowTrack 
              ? 'bg-amber-600 text-white' 
              : 'bg-gray-200 text-gray-700'
          }`}
        >
          Grow Track
        </button>
        <button
          onClick={toggleTrack}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Toggle Track
        </button>
      </div>
    </div>
  );
};

// Example component showing NGO data
const NGOList: React.FC = () => {
  const { ngos, loading } = useNGOs();
  
  const verifiedNGOs = ngos.filter(ngo => ngo.isVerified);
  const unverifiedNGOs = ngos.filter(ngo => !ngo.isVerified);

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">NGO Information</h3>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">NGO Information</h3>
      <p className="mb-2">Total NGOs: {ngos.length}</p>
      <p className="mb-2">Verified: {verifiedNGOs.length}</p>
      <p className="mb-4">Unverified: {unverifiedNGOs.length}</p>
      
      <div className="space-y-2">
        {ngos.slice(0, 3).map(ngo => (
          <div key={ngo.id} className="border p-2 rounded">
            <p><strong>{ngo.name}</strong></p>
            <p className="text-sm text-gray-600">{ngo.projectTitle}</p>
            <p className="text-xs">
              Status: {ngo.isVerified ? '✅ Verified' : '❌ Unverified'}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Example component showing event data
const EventList: React.FC = () => {
  const { events, loading } = useEvents('impact');
  const { user } = useUser();
  const { createRSVP, isRSVPd } = useRSVP(user?.id || '');
  
  const upcomingEvents = events.filter(event => event.dateTime > new Date());

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-2">Event Information</h3>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">Event Information</h3>
      <p className="mb-2">Total Events: {events.length}</p>
      <p className="mb-4">Upcoming: {upcomingEvents.length}</p>
      
      <div className="space-y-2">
        {upcomingEvents.slice(0, 3).map(event => (
          <div key={event.id} className="border p-2 rounded">
            <p><strong>{event.title}</strong></p>
            <p className="text-sm text-gray-600">{event.category}</p>
            <p className="text-xs">
              Venue: {event.venue.name} 
              <span className={`ml-2 px-2 py-1 rounded text-xs ${
                event.venue.safetyRating === 'green' ? 'bg-green-100 text-green-800' :
                event.venue.safetyRating === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {event.venue.safetyRating.toUpperCase()}
              </span>
            </p>
            <p className="text-xs">
              RSVP: {event.rsvpList.length}/{event.maxAttendees}
            </p>
            {user && (
              <button
                onClick={() => createRSVP(event.id)}
                disabled={isRSVPd(event.id)}
                className={`mt-1 px-2 py-1 rounded text-xs ${
                  isRSVPd(event.id)
                    ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isRSVPd(event.id) ? 'Already RSVP\'d' : 'RSVP'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Example component showing UI state
const UIControls: React.FC = () => {
  const { 
    isLoading, 
    viewMode, 
    notifications, 
    setLoading, 
    toggleViewMode, 
    addNotification,
    clearAllNotifications 
  } = useUI();

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">UI Controls</h3>
      
      <div className="space-y-2">
        <div>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <button
            onClick={() => setLoading(!isLoading)}
            className="bg-gray-500 text-white px-2 py-1 rounded text-sm"
          >
            Toggle Loading
          </button>
        </div>
        
        <div>
          <p>View Mode: {viewMode}</p>
          <button
            onClick={toggleViewMode}
            className="bg-purple-500 text-white px-2 py-1 rounded text-sm"
          >
            Toggle View Mode
          </button>
        </div>
        
        <div>
          <p>Notifications: {notifications.length}</p>
          <div className="space-x-1">
            <button
              onClick={() => addNotification({
                type: 'trust-points',
                title: 'Test Notification',
                message: 'This is a test notification',
                timestamp: new Date(),
                isRead: false,
              })}
              className="bg-green-500 text-white px-2 py-1 rounded text-xs"
            >
              Add Notification
            </button>
            <button
              onClick={clearAllNotifications}
              className="bg-red-500 text-white px-2 py-1 rounded text-xs"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main example component
const ContextUsageExample: React.FC = () => {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8">
            CommuniTree Context System Demo
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <UserInfo />
            <TrackSwitcher />
            <NGOList />
            <EventList />
            <UIControls />
          </div>
        </div>
      </div>
    </AppProvider>
  );
};

export default ContextUsageExample;
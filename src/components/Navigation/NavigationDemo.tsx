/**
 * NavigationDemo Component - Demonstrates the navigation system
 * 
 * This component shows how the navigation system works with different sections
 * and can be used for testing and demonstration purposes.
 */

import React from 'react';
import { useNavigation } from '../../hooks/useNavigation';
import { Navigation } from './Navigation';

export const NavigationDemo: React.FC = () => {
  const { activeSection, onSectionChange } = useNavigation();

  const renderContent = () => {
    switch (activeSection) {
      case 'home':
        return (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Welcome to CommuniTree</h2>
            <p className="text-lg text-gray-600 mb-8">
              Connect with your community through Impact and Grow tracks
            </p>
            <div className="bg-blue-50 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-blue-900 mb-2">Home Section Active</h3>
              <p className="text-blue-700 text-sm">
                This is where users would see the main dashboard with track toggle and feeds.
              </p>
            </div>
          </div>
        );
      case 'schedule':
        return (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">My Schedule</h2>
            <p className="text-lg text-gray-600 mb-8">
              View your upcoming events and volunteer commitments
            </p>
            <div className="bg-green-50 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-green-900 mb-2">Schedule Section Active</h3>
              <p className="text-green-700 text-sm">
                This is where users would see their RSVP'd events and volunteer activities.
              </p>
            </div>
          </div>
        );
      case 'profile':
        return (
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Profile</h2>
            <p className="text-lg text-gray-600 mb-8">
              Manage your account and view your community impact
            </p>
            <div className="bg-purple-50 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="font-semibold text-purple-900 mb-2">Profile Section Active</h3>
              <p className="text-purple-700 text-sm">
                This is where users would see their trust points, engagement history, and settings.
              </p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
              Navigation Demo
            </h1>
            <div className="text-sm text-gray-500">
              Active: <span className="font-medium capitalize">{activeSection}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Navigation System */}
        <Navigation 
          activeSection={activeSection}
          onSectionChange={onSectionChange}
        />

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {renderContent()}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default NavigationDemo;
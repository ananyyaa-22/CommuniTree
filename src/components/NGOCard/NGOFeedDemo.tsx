/**
 * NGOFeedDemo Component
 * Demonstrates the NGOFeed component with sample data and interactions
 */

import React, { useState } from 'react';
import { NGOFeed } from './NGOFeed';
import { NGO } from '../../types';

export const NGOFeedDemo: React.FC = () => {
  const [chatNGO, setChatNGO] = useState<NGO | null>(null);

  const handleChatOpen = (ngo: NGO) => {
    setChatNGO(ngo);
    // In a real app, this would open the chat modal
    console.log('Opening chat with:', ngo.name);
  };

  const handleChatClose = () => {
    setChatNGO(null);
  };

  return (
    <div className="space-y-6">
      {/* Demo Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold track-text mb-2">
          NGO Feed Demo
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          This demo showcases the NGOFeed component with filtering, sorting, and view mode functionality. 
          Try switching between grid and list views, searching for NGOs, or applying filters.
        </p>
      </div>

      {/* NGO Feed Component */}
      <NGOFeed onChatOpen={handleChatOpen} />

      {/* Chat Simulation */}
      {chatNGO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="track-card p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold track-text mb-4">
              Chat with {chatNGO.name}
            </h3>
            <p className="text-gray-600 mb-4">
              This would open the chat modal for volunteering with "{chatNGO.projectTitle}".
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={handleChatClose}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={handleChatClose}
                className="track-button px-4 py-2 rounded-md"
              >
                Start Chat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Feature Highlights */}
      <div className="track-card p-6">
        <h3 className="text-lg font-semibold track-text mb-4">
          NGOFeed Features
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">View Modes</h4>
            <p className="text-sm text-gray-600">
              Switch between grid and list views for optimal browsing experience
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Smart Filtering</h4>
            <p className="text-sm text-gray-600">
              Filter by category, verification status, and search across all NGO content
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Flexible Sorting</h4>
            <p className="text-sm text-gray-600">
              Sort by name, category, volunteer needs, or creation date with ascending/descending options
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Responsive Design</h4>
            <p className="text-sm text-gray-600">
              Optimized layouts for mobile and desktop with touch-friendly interactions
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">Real-time Updates</h4>
            <p className="text-sm text-gray-600">
              Live filtering and sorting with instant visual feedback
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-800">State Integration</h4>
            <p className="text-sm text-gray-600">
              Seamlessly integrated with global state management for consistent data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NGOFeedDemo;
/**
 * ThemeDemo Component
 * Demonstrates the track-based theming system with various UI elements
 */

import React from 'react';
import { Heart, Sparkles, Users, Calendar, MapPin, Star } from 'lucide-react';
import { useTheme } from '../../hooks';

export const ThemeDemo: React.FC = () => {
  const { currentTrack, themeConfig, switchTheme, isImpactTrack } = useTheme();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold track-text mb-2">
          Track-Based Theming Demo
        </h1>
        <p className="track-text-light">
          Current Track: {themeConfig.name} - {themeConfig.description}
        </p>
      </div>

      {/* Theme Switcher */}
      <div className="flex justify-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => switchTheme('impact')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              isImpactTrack
                ? 'bg-impact-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Heart size={18} />
            <span>Impact Track</span>
          </button>
          <button
            onClick={() => switchTheme('grow')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
              !isImpactTrack
                ? 'bg-grow-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Sparkles size={18} />
            <span>Grow Track</span>
          </button>
        </div>
      </div>

      {/* Theme Color Palette */}
      <div className="track-card p-6">
        <h2 className="text-xl font-semibold track-text mb-4">Color Palette</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-lg track-primary-bg mb-2"></div>
            <p className="text-sm track-text">Primary</p>
            <p className="text-xs text-gray-500">{themeConfig.primaryColor}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-lg track-accent-bg mb-2"></div>
            <p className="text-sm track-text">Accent</p>
            <p className="text-xs text-gray-500">{themeConfig.accentColor}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-lg track-bg border track-border mb-2"></div>
            <p className="text-sm track-text">Background</p>
            <p className="text-xs text-gray-500">{themeConfig.bgColor}</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-lg border-2 track-border mb-2 flex items-center justify-center">
              <span className="text-sm track-text">Text</span>
            </div>
            <p className="text-sm track-text">Text</p>
            <p className="text-xs text-gray-500">{themeConfig.textColor}</p>
          </div>
        </div>
      </div>

      {/* Component Examples */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Buttons */}
        <div className="track-card p-6">
          <h3 className="text-lg font-semibold track-text mb-4">Buttons</h3>
          <div className="space-y-3">
            <button className="track-button w-full py-2 rounded-lg">
              Primary Button
            </button>
            <button className="w-full py-2 rounded-lg border track-border track-text track-bg-hover">
              Secondary Button
            </button>
            <button className="w-full py-2 rounded-lg track-accent-bg text-white">
              Accent Button
            </button>
          </div>
        </div>

        {/* Badges */}
        <div className="track-card p-6">
          <h3 className="text-lg font-semibold track-text mb-4">Badges</h3>
          <div className="flex flex-wrap gap-2">
            <span className="track-badge">Featured</span>
            <span className="track-badge">New</span>
            <span className="track-badge">Popular</span>
            <span className="px-2 py-1 rounded-full text-xs font-medium border track-border track-text">
              Outlined
            </span>
          </div>
        </div>
      </div>

      {/* Sample Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold track-text">Sample Cards</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* NGO Card Example */}
          <div className="track-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 track-primary-bg rounded-lg flex items-center justify-center">
                  <Heart className="text-white" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold track-text">Green Earth Foundation</h4>
                  <p className="text-sm text-gray-600">Environmental Conservation</p>
                </div>
              </div>
              <span className="track-badge">Verified</span>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Join us in planting trees and cleaning local parks to create a greener community.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Users size={14} />
                  <span>12 volunteers</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin size={14} />
                  <span>Central Park</span>
                </div>
              </div>
              <button className="track-button px-4 py-1 rounded text-sm">
                Volunteer
              </button>
            </div>
          </div>

          {/* Event Card Example */}
          <div className="track-card p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 track-accent-bg rounded-lg flex items-center justify-center">
                  <Sparkles className="text-white" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold track-text">Poetry Night</h4>
                  <p className="text-sm text-gray-600">Creative Arts Meetup</p>
                </div>
              </div>
              <div className="flex items-center space-x-1">
                <Star className="text-yellow-400 fill-current" size={16} />
                <span className="text-sm text-gray-600">4.8</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Share your poetry and listen to amazing local talent in a cozy café setting.
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>Tonight 7 PM</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin size={14} />
                  <span>Café Luna</span>
                </div>
              </div>
              <button className="track-button px-4 py-1 rounded text-sm">
                Join Event
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CSS Custom Properties Display */}
      <div className="track-card p-6">
        <h3 className="text-lg font-semibold track-text mb-4">CSS Custom Properties</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm font-mono">
          <div>
            <p className="track-text">--track-primary: <span className="track-primary">●</span></p>
            <p className="track-text">--track-accent: <span className="track-accent">●</span></p>
            <p className="track-text">--track-text: <span className="track-text">●</span></p>
          </div>
          <div>
            <p className="track-text">--track-bg: <span className="inline-block w-4 h-4 track-bg border track-border rounded"></span></p>
            <p className="track-text">--track-border: <span className="inline-block w-4 h-4 border-2 track-border rounded"></span></p>
            <p className="track-text">--track-text-light: <span className="track-text-light">●</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeDemo;
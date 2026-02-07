/**
 * SocialFeed Component
 * Container component that manages the display of multiple Event cards
 * with filtering, sorting, search functionality, and responsive layouts
 * Designed for the Grow track to display hobby-based meetups and social events
 */

import React, { useState, useMemo, useCallback } from 'react';
import { Filter, Search, SortAsc, SortDesc, MapPin, Calendar, AlertCircle, RefreshCw } from 'lucide-react';
import { EventCard } from '../EventCard';
import { useEvents } from '../../hooks/useEvents';
import { Event, EventCategory } from '../../types';
import { clsx } from 'clsx';
import { Loading } from '../Loading';

export interface SocialFeedProps {
  className?: string;
  onChatOpen?: (event: Event) => void;
}

type SortOption = 'date' | 'title' | 'category' | 'attendees' | 'spotsLeft';
type SortDirection = 'asc' | 'desc';

const EVENT_CATEGORIES: EventCategory[] = [
  'Poetry',
  'Art', 
  'Fitness',
  'Reading',
  'Music',
  'Dance',
  'Cooking',
  'Technology',
  'Photography',
  'Gardening'
];

export const SocialFeed: React.FC<SocialFeedProps> = ({
  className,
  onChatOpen,
}) => {
  const { events, loading, error, refetch } = useEvents('grow');
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EventCategory | 'all'>('all');
  const [showUpcomingOnly, setShowUpcomingOnly] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Filter upcoming events
  const now = new Date();
  const upcomingEvents = useMemo(() => 
    events.filter(event => event.dateTime > now),
    [events, now]
  );

  // Use upcoming events by default, or all events if filter is disabled
  const baseEvents = showUpcomingOnly ? upcomingEvents : events;

  // Filtered and sorted events
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = baseEvents;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchLower) ||
        event.description.toLowerCase().includes(searchLower) ||
        event.venue.name.toLowerCase().includes(searchLower) ||
        event.organizer.name.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(event => event.category === selectedCategory);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.dateTime.getTime() - b.dateTime.getTime();
          break;
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'attendees':
          comparison = a.rsvpList.length - b.rsvpList.length;
          break;
        case 'spotsLeft':
          const spotsA = a.maxAttendees - a.rsvpList.length;
          const spotsB = b.maxAttendees - b.rsvpList.length;
          comparison = spotsA - spotsB;
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [baseEvents, searchTerm, selectedCategory, sortBy, sortDirection]);

  // Toggle sort direction for the same field
  const handleSort = useCallback((field: SortOption) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  }, [sortBy]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setShowUpcomingOnly(true);
    setSortBy('date');
    setSortDirection('asc');
  }, []);

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || !showUpcomingOnly;

  // Get category counts for filter display
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    baseEvents.forEach(event => {
      counts[event.category] = (counts[event.category] || 0) + 1;
    });
    return counts;
  }, [baseEvents]);

  // Loading state
  if (loading) {
    return (
      <div className={clsx('space-y-6', className)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold track-text">
            Social Events
          </h2>
        </div>
        <Loading />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={clsx('space-y-6', className)}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-xl font-semibold track-text">
            Social Events
          </h2>
        </div>
        <div className="text-center py-12">
          <div className="track-card p-8 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium track-text mb-2">
              Failed to Load Events
            </h3>
            <p className="text-gray-600 mb-4">
              {error.message || 'An error occurred while loading social events.'}
            </p>
            <button
              onClick={() => refetch()}
              className="track-button px-4 py-2 rounded-md inline-flex items-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header with Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-semibold track-text">
            Social Events
          </h2>
          <span className="track-badge">
            {filteredAndSortedEvents.length} {filteredAndSortedEvents.length === 1 ? 'event' : 'events'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'flex items-center space-x-2 px-3 py-2 rounded-md transition-colors duration-200',
              showFilters || hasActiveFilters
                ? 'track-button text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            )}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="bg-white text-xs px-1.5 py-0.5 rounded-full text-gray-800">
                {[searchTerm && 'search', selectedCategory !== 'all' && 'category', !showUpcomingOnly && 'all'].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search events, venues, or organizers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 track-focus-ring focus:border-transparent"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="track-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium track-text">Filters & Sorting</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interest Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as EventCategory | 'all')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-offset-2 track-focus-ring focus:border-transparent"
              >
                <option value="all">All Categories ({baseEvents.length})</option>
                {EVENT_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category} ({categoryCounts[category] || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Time Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Timing
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showUpcomingOnly}
                  onChange={(e) => setShowUpcomingOnly(e.target.checked)}
                  className="rounded border-gray-300 track-checkbox focus:ring-offset-2"
                />
                <span className="text-sm text-gray-700">Upcoming events only</span>
              </label>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-offset-2 track-focus-ring focus:border-transparent"
                >
                  <option value="date">Date & Time</option>
                  <option value="title">Event Title</option>
                  <option value="category">Category</option>
                  <option value="attendees">Attendees</option>
                  <option value="spotsLeft">Spots Available</option>
                </select>
                <button
                  onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
                  className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                  aria-label={`Sort ${sortDirection === 'asc' ? 'descending' : 'ascending'}`}
                >
                  {sortDirection === 'asc' ? (
                    <SortAsc className="w-4 h-4" />
                  ) : (
                    <SortDesc className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={clsx(
            'px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200',
            selectedCategory === 'all'
              ? 'track-button text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          All
        </button>
        {['Poetry', 'Art', 'Fitness'].map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category as EventCategory)}
            className={clsx(
              'px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200',
              selectedCategory === category
                ? 'track-button text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {category} {categoryCounts[category] && `(${categoryCounts[category]})`}
          </button>
        ))}
      </div>

      {/* Events Display - Single Column */}
      {filteredAndSortedEvents.length > 0 ? (
        <div className="space-y-4">
          {filteredAndSortedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              viewMode="list"
              onChat={onChatOpen}
              className="transition-all duration-200"
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="track-card p-8 max-w-md mx-auto">
            <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium track-text mb-2">
              No Events Found
            </h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more events.'
                : 'No social events are currently available.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="track-button px-4 py-2 rounded-md"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}

      {/* Event Statistics */}
      {filteredAndSortedEvents.length > 0 && (
        <div className="track-card p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold track-text">{filteredAndSortedEvents.length}</div>
              <div className="text-sm text-gray-600">Events</div>
            </div>
            <div>
              <div className="text-2xl font-bold track-text">
                {filteredAndSortedEvents.reduce((sum, event) => sum + event.rsvpList.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Total RSVPs</div>
            </div>
            <div>
              <div className="text-2xl font-bold track-text">
                {new Set(filteredAndSortedEvents.map(event => event.category)).size}
              </div>
              <div className="text-sm text-gray-600">Categories</div>
            </div>
            <div>
              <div className="text-2xl font-bold track-text">
                {filteredAndSortedEvents.reduce((sum, event) => sum + (event.maxAttendees - event.rsvpList.length), 0)}
              </div>
              <div className="text-sm text-gray-600">Available Spots</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialFeed;
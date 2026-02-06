/**
 * NGOFeed Component
 * Container component that manages the display of multiple NGO cards
 * with filtering, sorting, and view mode functionality
 * Optimized with React.memo and performance improvements
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import { Grid, List, Filter, Search, SortAsc, SortDesc } from 'lucide-react';
import { NGOCardContainer } from './NGOCardContainer';
import { useNGOs } from '../../hooks';
import { NGO, NGOCategory } from '../../types';
import { clsx } from 'clsx';

export interface NGOFeedProps {
  className?: string;
  onChatOpen?: (ngo: NGO) => void;
}

type ViewMode = 'grid' | 'list';
type SortOption = 'name' | 'category' | 'volunteersNeeded' | 'created';
type SortDirection = 'asc' | 'desc';

const NGO_CATEGORIES: NGOCategory[] = [
  'Education',
  'Healthcare',
  'Environment',
  'Animal Welfare',
  'Community Development',
  'Disaster Relief',
  'Women Empowerment',
  'Child Welfare'
];

const NGOFeedComponent: React.FC<NGOFeedProps> = ({
  className,
  onChatOpen,
}) => {
  const { ngos } = useNGOs();
  
  // View and filter state
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<NGOCategory | 'all'>('all');
  const [showVerifiedOnly, setShowVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Debounced search for better performance
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  // Use useEffect to debounce search term
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Filtered and sorted NGOs with performance optimization
  const filteredAndSortedNGOs = useMemo(() => {
    let filtered = ngos;

    // Apply search filter with debounced term
    if (debouncedSearchTerm.trim()) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter(ngo => 
        ngo.name.toLowerCase().includes(searchLower) ||
        ngo.projectTitle.toLowerCase().includes(searchLower) ||
        ngo.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(ngo => ngo.category === selectedCategory);
    }

    // Apply verification filter
    if (showVerifiedOnly) {
      filtered = filtered.filter(ngo => ngo.isVerified);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
        case 'volunteersNeeded':
          comparison = (a.volunteersNeeded - a.currentVolunteers) - (b.volunteersNeeded - b.currentVolunteers);
          break;
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [ngos, debouncedSearchTerm, selectedCategory, showVerifiedOnly, sortBy, sortDirection]);

  // Memoized callbacks for better performance
  const handleSort = useCallback((field: SortOption) => {
    if (sortBy === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  }, [sortBy]);

  const clearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setShowVerifiedOnly(false);
    setSortBy('name');
    setSortDirection('asc');
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value as NGOCategory | 'all');
  }, []);

  const handleVerificationToggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setShowVerifiedOnly(e.target.checked);
  }, []);

  const handleSortByChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortOption);
  }, []);

  const toggleSortDirection = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const toggleFilters = useCallback(() => {
    setShowFilters(prev => !prev);
  }, []);

  const hasActiveFilters = searchTerm || selectedCategory !== 'all' || showVerifiedOnly;

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header with View Toggle and Search */}
      <div className="responsive-flex-col sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <h2 className="text-responsive-xl font-semibold track-text">
            NGO Opportunities
          </h2>
          <span className="track-badge">
            {filteredAndSortedNGOs.length} {filteredAndSortedNGOs.length === 1 ? 'opportunity' : 'opportunities'}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={clsx(
                'p-2 rounded-md transition-colors duration-200 touch-target',
                viewMode === 'grid'
                  ? 'track-button-active text-white'
                  : 'text-gray-600 hover:text-gray-800'
              )}
              aria-label="Grid view"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                'p-2 rounded-md transition-colors duration-200 touch-target',
                viewMode === 'list'
                  ? 'track-button-active text-white'
                  : 'text-gray-600 hover:text-gray-800'
              )}
              aria-label="List view"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Filter Toggle */}
          <button
            onClick={toggleFilters}
            className={clsx(
              'flex items-center space-x-2 mobile-button rounded-md transition-colors duration-200 touch-target',
              showFilters || hasActiveFilters
                ? 'track-button text-white'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            )}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span className="bg-white text-xs px-1.5 py-0.5 rounded-full text-gray-800">
                {[searchTerm && 'search', selectedCategory !== 'all' && 'category', showVerifiedOnly && 'verified'].filter(Boolean).length}
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
          placeholder="Search NGOs, projects, or descriptions..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="w-full pl-10 pr-4 touch-input border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-2 track-focus-ring focus:border-transparent"
        />
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="track-card responsive-card-padding space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium track-text">Filters & Sorting</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-responsive-sm text-gray-600 hover:text-gray-800 underline touch-target"
              >
                Clear all
              </button>
            )}
          </div>

          <div className="responsive-grid-3 gap-4">
            {/* Category Filter */}
            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={handleCategoryChange}
                className="w-full touch-input border border-gray-300 rounded-md focus:ring-2 focus:ring-offset-2 track-focus-ring focus:border-transparent"
              >
                <option value="all">All Categories</option>
                {NGO_CATEGORIES.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {/* Verification Filter */}
            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
                Verification Status
              </label>
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showVerifiedOnly}
                  onChange={handleVerificationToggle}
                  className="rounded border-gray-300 track-checkbox focus:ring-offset-2 touch-target"
                />
                <span className="text-responsive-sm text-gray-700">Verified NGOs only</span>
              </label>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-responsive-sm font-medium text-gray-700 mb-2">
                Sort by
              </label>
              <div className="flex space-x-2">
                <select
                  value={sortBy}
                  onChange={handleSortByChange}
                  className="flex-1 touch-input border border-gray-300 rounded-md focus:ring-2 focus:ring-offset-2 track-focus-ring focus:border-transparent"
                >
                  <option value="name">Name</option>
                  <option value="category">Category</option>
                  <option value="volunteersNeeded">Volunteers Needed</option>
                  <option value="created">Date Created</option>
                </select>
                <button
                  onClick={toggleSortDirection}
                  className="mobile-button border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200 touch-target"
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

      {/* NGO Cards Grid/List */}
      {filteredAndSortedNGOs.length > 0 ? (
        <div className={clsx(
          'transition-all duration-300',
          {
            'responsive-grid-1 desktop-grid-dense gap-4 sm:gap-6': viewMode === 'grid',
            'space-y-4': viewMode === 'list',
          }
        )}>
          {filteredAndSortedNGOs.map((ngo) => (
            <NGOCardContainer
              key={ngo.id}
              ngo={ngo}
              viewMode={viewMode}
              onChatOpen={onChatOpen}
              className={clsx(
                'transition-all duration-200',
                {
                  'desktop-hover-lift': viewMode === 'grid',
                  'desktop-hover-glow': viewMode === 'list',
                }
              )}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="track-card responsive-card-padding max-w-md mx-auto desktop-hover-lift">
            <h3 className="text-responsive-base font-medium track-text mb-2">
              No NGOs Found
            </h3>
            <p className="text-gray-600 mb-4">
              {hasActiveFilters
                ? 'Try adjusting your filters to see more opportunities.'
                : 'No NGO opportunities are currently available.'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="track-button desktop-button rounded-md desktop-focus-ring"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Memoize the component for performance optimization
export const NGOFeed = memo(NGOFeedComponent, (prevProps, nextProps) => {
  return (
    prevProps.className === nextProps.className &&
    prevProps.onChatOpen === nextProps.onChatOpen
  );
});

NGOFeed.displayName = 'NGOFeed';

export default NGOFeed;
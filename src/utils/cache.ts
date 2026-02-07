/**
 * Cache Utility
 * 
 * Provides in-memory caching for frequently accessed data.
 * Implements TTL (time-to-live) based cache invalidation.
 * 
 * @see Requirements 14.1
 */

/**
 * Cache entry with data and expiration timestamp
 */
interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

/**
 * Cache configuration options
 */
interface CacheOptions {
  ttl?: number; // Time to live in milliseconds (default: 5 minutes)
}

/**
 * Simple in-memory cache with TTL support
 */
class Cache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL: number = 5 * 60 * 1000; // 5 minutes

  /**
   * Get value from cache
   * Returns null if key doesn't exist or has expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set value in cache with optional TTL
   */
  set<T>(key: string, data: T, options?: CacheOptions): void {
    const ttl = options?.ttl ?? this.defaultTTL;
    const expiresAt = Date.now() + ttl;

    this.cache.set(key, {
      data,
      expiresAt,
    });
  }

  /**
   * Invalidate (delete) a specific cache key
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all keys matching a pattern
   * Pattern can include wildcards (*)
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*') + '$'
    );

    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

// Export singleton instance
export const cache = new Cache();

/**
 * Cache key generators for different data types
 */
export const CacheKeys = {
  // NGO cache keys
  allNGOs: () => 'ngos:all',
  ngoById: (id: string) => `ngos:${id}`,
  ngoSearch: (query: string) => `ngos:search:${query}`,
  
  // Venue cache keys
  allVenues: () => 'venues:all',
  venueById: (id: string) => `venues:${id}`,
  
  // Event cache keys (not cached by default due to frequent updates)
  eventsByTrack: (track: string, page: number) => `events:${track}:page:${page}`,
  eventById: (id: string) => `events:${id}`,
  
  // RSVP cache keys
  eventRSVPCount: (eventId: string) => `rsvps:count:${eventId}`,
  userRSVPs: (userId: string) => `rsvps:user:${userId}`,
};

/**
 * Cache TTL configurations (in milliseconds)
 */
export const CacheTTL = {
  short: 1 * 60 * 1000,      // 1 minute
  medium: 5 * 60 * 1000,     // 5 minutes
  long: 15 * 60 * 1000,      // 15 minutes
  veryLong: 60 * 60 * 1000,  // 1 hour
};

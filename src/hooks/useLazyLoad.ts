/**
 * useLazyLoad Hook
 * 
 * Custom hook for managing lazy-loaded components.
 * Provides loading state and error handling for lazy components.
 * 
 * @see Requirements 14.7
 */

import { useState, useCallback } from 'react';

/**
 * Return type for useLazyLoad hook
 */
export interface UseLazyLoadReturn {
  isLoaded: boolean;
  loadComponent: () => void;
  error: Error | null;
}

/**
 * Custom hook for managing lazy-loaded components
 * 
 * Tracks whether a component has been loaded and provides
 * a method to trigger loading. Useful for deferring component
 * loading until user interaction.
 * 
 * @returns Loading state, load trigger, and error state
 * 
 * @example
 * const { isLoaded, loadComponent, error } = useLazyLoad();
 * 
 * const handleOpenChat = () => {
 *   loadComponent();
 *   // Component will now be loaded via Suspense
 * };
 * 
 * return (
 *   <div>
 *     <button onClick={handleOpenChat}>Open Chat</button>
 *     {isLoaded && (
 *       <Suspense fallback={<Loading />}>
 *         <ChatModalLazy />
 *       </Suspense>
 *     )}
 *   </div>
 * );
 */
export function useLazyLoad(): UseLazyLoadReturn {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Trigger component loading
   */
  const loadComponent = useCallback(() => {
    try {
      setIsLoaded(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load component'));
      console.error('Error loading component:', err);
    }
  }, []);

  return {
    isLoaded,
    loadComponent,
    error,
  };
}

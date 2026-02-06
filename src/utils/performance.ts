/**
 * Performance optimization utilities
 * 
 * Features:
 * - Debounce functions for performance
 * - Throttle functions for scroll/resize events
 * - Lazy loading helpers
 * - Bundle size optimization utilities
 * 
 * Requirements: 9.5
 */

import React, { useCallback, useRef, useEffect, useState } from 'react';

/**
 * Debounce function to limit the rate of function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function to limit function calls to once per interval
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Hook for debounced callbacks
 */
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);
}

/**
 * Hook for throttled callbacks
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  limit: number
): (...args: Parameters<T>) => void {
  const callbackRef = useRef(callback);
  const throttleRef = useRef(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  return useCallback((...args: Parameters<T>) => {
    if (!throttleRef.current) {
      callbackRef.current(...args);
      throttleRef.current = true;
      
      setTimeout(() => {
        throttleRef.current = false;
      }, limit);
    }
  }, [limit]);
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting);
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [elementRef, options]);

  return isIntersecting;
}

/**
 * Preload component for better performance
 */
export function preloadComponent(componentImport: () => Promise<any>): void {
  if (typeof window !== 'undefined') {
    // Preload on idle or after a short delay
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(() => {
        componentImport();
      });
    } else {
      setTimeout(() => {
        componentImport();
      }, 100);
    }
  }
}

/**
 * Memory usage monitoring (development only)
 */
export function logMemoryUsage(): void {
  if (process.env.NODE_ENV === 'development' && 'performance' in window) {
    const memory = (performance as any).memory;
    if (memory) {
      console.log('Memory Usage:', {
        used: `${Math.round(memory.usedJSHeapSize / 1024 / 1024)} MB`,
        total: `${Math.round(memory.totalJSHeapSize / 1024 / 1024)} MB`,
        limit: `${Math.round(memory.jsHeapSizeLimit / 1024 / 1024)} MB`,
      });
    }
  }
}

/**
 * Bundle size analyzer helper
 */
export function analyzeBundleSize(): void {
  if (process.env.NODE_ENV === 'development') {
    console.log('Bundle analysis available in build stats');
    console.log('Run: npm run build -- --analyze');
  }
}

/**
 * Performance measurement utility
 */
export class PerformanceMonitor {
  private static marks: Map<string, number> = new Map();

  static start(name: string): void {
    if ('performance' in window) {
      this.marks.set(name, performance.now());
    }
  }

  static end(name: string): number | null {
    if ('performance' in window && this.marks.has(name)) {
      const startTime = this.marks.get(name)!;
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`Performance [${name}]: ${duration.toFixed(2)}ms`);
      }
      
      this.marks.delete(name);
      return duration;
    }
    return null;
  }
}

/**
 * Component render optimization helper
 */
export function shouldComponentUpdate<T extends Record<string, any>>(
  prevProps: T,
  nextProps: T,
  keys?: (keyof T)[]
): boolean {
  const keysToCheck = keys || Object.keys(nextProps) as (keyof T)[];
  
  return keysToCheck.some(key => prevProps[key] !== nextProps[key]);
}

export default {
  debounce,
  throttle,
  useDebounce,
  useThrottle,
  useIntersectionObserver,
  preloadComponent,
  logMemoryUsage,
  analyzeBundleSize,
  PerformanceMonitor,
  shouldComponentUpdate,
};
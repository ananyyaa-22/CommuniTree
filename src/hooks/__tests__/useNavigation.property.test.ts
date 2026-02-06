/**
 * useNavigation Hook Property-Based Tests
 * 
 * Property 2: Navigation state consistency
 * Validates: Requirements 2.3, 2.4
 */

import { renderHook, act } from '@testing-library/react';
import * as fc from 'fast-check';
import { useNavigation, NavigationSection } from '../useNavigation';

// Mock localStorage for testing
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useNavigation Property-Based Tests', () => {
  const validSections: NavigationSection[] = ['home', 'schedule', 'profile'];
  const navigationSectionArb = fc.constantFrom(...validSections);

  beforeEach(() => {
    localStorageMock.clear();
    // Clear console warnings for localStorage errors in tests
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  /**
   * Property 2.1: Navigation state initialization consistency
   * 
   * For any valid initial navigation section stored in localStorage:
   * - The hook should initialize with that section
   * - If no section is stored, it should default to 'home'
   * - Invalid sections should fallback to 'home'
   * 
   * **Validates: Requirements 2.4**
   */
  it('Property 2.1: initializes navigation state consistently', () => {
    fc.assert(
      fc.property(
        fc.option(navigationSectionArb, { nil: undefined }),
        (storedSection) => {
          // Setup localStorage
          if (storedSection) {
            localStorageMock.setItem('communitree_active_section', storedSection);
          }

          const { result } = renderHook(() => useNavigation());

          const expectedSection = storedSection || 'home';
          expect(result.current.activeSection).toBe(expectedSection);
          expect(result.current.isHomeActive).toBe(expectedSection === 'home');
          expect(result.current.isScheduleActive).toBe(expectedSection === 'schedule');
          expect(result.current.isProfileActive).toBe(expectedSection === 'profile');
        }
      )
    );
  });

  /**
   * Property 2.2: Navigation state change consistency
   * 
   * For any sequence of valid navigation section changes:
   * - Each change should update the active section correctly
   * - The helper boolean flags should update consistently
   * - localStorage should be updated with the new section
   * 
   * **Validates: Requirements 2.3, 2.4**
   */
  it('Property 2.2: handles navigation state changes consistently', () => {
    fc.assert(
      fc.property(
        fc.array(navigationSectionArb, { minLength: 1, maxLength: 10 }),
        (sectionSequence) => {
          const { result } = renderHook(() => useNavigation());

          sectionSequence.forEach((section) => {
            act(() => {
              result.current.onSectionChange(section);
            });

            // Verify state is updated correctly
            expect(result.current.activeSection).toBe(section);
            expect(result.current.isHomeActive).toBe(section === 'home');
            expect(result.current.isScheduleActive).toBe(section === 'schedule');
            expect(result.current.isProfileActive).toBe(section === 'profile');

            // Verify localStorage is updated
            expect(localStorageMock.getItem('communitree_active_section')).toBe(section);
          });
        }
      )
    );
  });

  /**
   * Property 2.3: Navigation state persistence consistency
   * 
   * For any valid navigation section:
   * - Setting a section should persist it to localStorage
   * - Reinitializing the hook should restore the persisted section
   * - The state should remain consistent across hook instances
   * 
   * **Validates: Requirements 2.4**
   */
  it('Property 2.3: persists navigation state consistently', () => {
    fc.assert(
      fc.property(navigationSectionArb, (section) => {
        // First hook instance - set the section
        const { result: result1 } = renderHook(() => useNavigation());
        
        act(() => {
          result1.current.onSectionChange(section);
        });

        expect(result1.current.activeSection).toBe(section);
        expect(localStorageMock.getItem('communitree_active_section')).toBe(section);

        // Second hook instance - should restore the same section
        const { result: result2 } = renderHook(() => useNavigation());
        
        expect(result2.current.activeSection).toBe(section);
        expect(result2.current.isHomeActive).toBe(section === 'home');
        expect(result2.current.isScheduleActive).toBe(section === 'schedule');
        expect(result2.current.isProfileActive).toBe(section === 'profile');
      })
    );
  });

  /**
   * Property 2.4: Navigation boolean flags consistency
   * 
   * For any valid navigation section:
   * - Exactly one boolean flag should be true at any time
   * - The true flag should correspond to the active section
   * - All other flags should be false
   * 
   * **Validates: Requirements 2.4**
   */
  it('Property 2.4: maintains consistent boolean flag states', () => {
    fc.assert(
      fc.property(navigationSectionArb, (section) => {
        const { result } = renderHook(() => useNavigation());
        
        act(() => {
          result.current.onSectionChange(section);
        });

        const flags = [
          { name: 'isHomeActive', value: result.current.isHomeActive, section: 'home' },
          { name: 'isScheduleActive', value: result.current.isScheduleActive, section: 'schedule' },
          { name: 'isProfileActive', value: result.current.isProfileActive, section: 'profile' },
        ];

        // Exactly one flag should be true
        const trueFlags = flags.filter(flag => flag.value);
        expect(trueFlags).toHaveLength(1);

        // The true flag should correspond to the active section
        expect(trueFlags[0].section).toBe(section);

        // All other flags should be false
        const falseFlags = flags.filter(flag => !flag.value);
        expect(falseFlags).toHaveLength(2);
        falseFlags.forEach(flag => {
          expect(flag.section).not.toBe(section);
        });
      })
    );
  });

  /**
   * Property 2.5: Navigation callback consistency
   * 
   * For any navigation state:
   * - The onSectionChange callback should be stable across renders
   * - Multiple calls with the same section should be idempotent
   * - The callback should always update to the provided section
   * 
   * **Validates: Requirements 2.3**
   */
  it('Property 2.5: maintains consistent callback behavior', () => {
    fc.assert(
      fc.property(
        navigationSectionArb,
        fc.integer({ min: 1, max: 5 }),
        (section, callCount) => {
          const { result, rerender } = renderHook(() => useNavigation());
          
          const initialCallback = result.current.onSectionChange;

          // Callback should be stable across re-renders
          rerender();
          expect(result.current.onSectionChange).toBe(initialCallback);

          // Multiple calls with the same section should be idempotent
          for (let i = 0; i < callCount; i++) {
            act(() => {
              result.current.onSectionChange(section);
            });
            
            expect(result.current.activeSection).toBe(section);
            expect(localStorageMock.getItem('communitree_active_section')).toBe(section);
          }
        }
      )
    );
  });

  /**
   * Property 2.6: Navigation error handling consistency
   * 
   * For any navigation state when localStorage fails:
   * - The hook should continue to function normally
   * - State changes should still work in memory
   * - No errors should be thrown to the user
   * 
   * **Validates: Requirements 2.3, 2.4**
   */
  it('Property 2.6: handles localStorage errors gracefully', () => {
    fc.assert(
      fc.property(navigationSectionArb, (section) => {
        // Mock localStorage to throw errors
        const originalSetItem = localStorageMock.setItem;
        const originalGetItem = localStorageMock.getItem;
        
        localStorageMock.setItem = jest.fn(() => {
          throw new Error('localStorage error');
        });
        localStorageMock.getItem = jest.fn(() => {
          throw new Error('localStorage error');
        });

        // Hook should still initialize without throwing
        const { result } = renderHook(() => useNavigation());
        
        // Should default to 'home' when localStorage fails
        expect(result.current.activeSection).toBe('home');

        // State changes should still work in memory
        act(() => {
          result.current.onSectionChange(section);
        });

        expect(result.current.activeSection).toBe(section);
        expect(result.current.isHomeActive).toBe(section === 'home');
        expect(result.current.isScheduleActive).toBe(section === 'schedule');
        expect(result.current.isProfileActive).toBe(section === 'profile');

        // Restore original methods
        localStorageMock.setItem = originalSetItem;
        localStorageMock.getItem = originalGetItem;
      })
    );
  });
});
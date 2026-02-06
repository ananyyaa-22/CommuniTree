/**
 * Test suite index for custom hooks
 * Ensures all hook tests are properly exported and discoverable
 */

// Import all hook tests to ensure they're included in test runs
import './useUser.test';
import './useCurrentTrack.test';
import './useTrustPoints.test';
import './useEvents.test';
import './useNGOs.test';
import './useUI.test';

// This file ensures all hook tests are discovered by the test runner
// and provides a central point for hook test organization
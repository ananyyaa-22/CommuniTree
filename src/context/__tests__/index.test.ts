/**
 * Test suite index for context and state management
 * Ensures all context tests are properly exported and discoverable
 */

// Import all context tests to ensure they're included in test runs
import './AppContext.test';
import './appReducer.test';
import './initialState.test';

// This file ensures all context tests are discovered by the test runner
// and provides a central point for context test organization
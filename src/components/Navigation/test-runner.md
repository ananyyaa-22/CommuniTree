# Navigation Property-Based Tests - Test Runner Guide

## Overview

This document describes the property-based tests implemented for the Navigation system to validate Requirements 2.3 and 2.4.

## Property Tests Implemented

### Property 2: Navigation state consistency

The following property-based tests have been implemented:

#### Navigation Component Tests (`Navigation.property.test.tsx`)

1. **Property 2.1: Navigation state consistency across components**
   - Validates that both SideNav and BottomNav reflect the same active state
   - Ensures only one section is active at a time
   - **Validates: Requirements 2.4**

2. **Property 2.2: Navigation click consistency**
   - Verifies that clicking navigation items triggers consistent state changes
   - Ensures callbacks are called with correct parameters
   - **Validates: Requirements 2.3**

3. **Property 2.3: Navigation state transitions**
   - Tests that state transitions maintain consistency
   - Validates deterministic behavior across state changes
   - **Validates: Requirements 2.3, 2.4**

4. **Property 2.4: Navigation accessibility consistency**
   - Ensures consistent accessibility attributes across components
   - Validates proper ARIA attribute management
   - **Validates: Requirements 2.4**

5. **Property 2.5: Navigation component isolation**
   - Tests that components remain properly isolated
   - Verifies callback consistency between components
   - **Validates: Requirements 2.3**

#### useNavigation Hook Tests (`useNavigation.property.test.ts`)

1. **Property 2.1: Navigation state initialization consistency**
   - Tests consistent initialization from localStorage
   - Validates fallback behavior for invalid states
   - **Validates: Requirements 2.4**

2. **Property 2.2: Navigation state change consistency**
   - Verifies consistent state updates across changes
   - Tests localStorage persistence
   - **Validates: Requirements 2.3, 2.4**

3. **Property 2.3: Navigation state persistence consistency**
   - Tests state persistence across hook instances
   - Validates localStorage integration
   - **Validates: Requirements 2.4**

4. **Property 2.4: Navigation boolean flags consistency**
   - Ensures exactly one flag is true at any time
   - Validates flag correspondence to active section
   - **Validates: Requirements 2.4**

5. **Property 2.5: Navigation callback consistency**
   - Tests callback stability and idempotency
   - Validates consistent behavior across renders
   - **Validates: Requirements 2.3**

6. **Property 2.6: Navigation error handling consistency**
   - Tests graceful handling of localStorage errors
   - Ensures continued functionality during failures
   - **Validates: Requirements 2.3, 2.4**

## Running the Tests

### Prerequisites

Ensure the following dependencies are installed:

```bash
npm install --save-dev fast-check @types/jest @testing-library/jest-dom @testing-library/react @testing-library/user-event
```

### Test Commands

```bash
# Run all navigation tests
npm test -- --testPathPattern="Navigation"

# Run only property-based tests
npm test -- --testPathPattern="property.test"

# Run with coverage
npm test -- --testPathPattern="Navigation" --coverage

# Run in watch mode
npm test -- --testPathPattern="Navigation" --watch
```

### Expected Results

All property-based tests should pass, validating:

- **Requirement 2.3**: Navigation clicks trigger correct state changes
- **Requirement 2.4**: Active navigation items are properly highlighted
- Consistent behavior across mobile (BottomNav) and desktop (SideNav) components
- Proper state persistence and error handling
- Accessibility compliance

## Test Coverage

The property-based tests complement the existing unit tests by:

1. **Testing universal properties** across all possible navigation states
2. **Validating consistency** between mobile and desktop navigation components
3. **Ensuring robustness** through randomized input generation
4. **Verifying state management** across component boundaries

## Integration with CI/CD

These tests should be included in the continuous integration pipeline to ensure:

- Navigation consistency across all supported devices
- Proper state management under all conditions
- Accessibility compliance maintenance
- Regression prevention for navigation features

## Troubleshooting

If tests fail:

1. Check that all navigation items are properly defined in `navigationItems.ts`
2. Verify that both SideNav and BottomNav components handle all navigation sections
3. Ensure localStorage mocking is properly configured
4. Validate that accessibility attributes are correctly implemented

## Future Enhancements

Consider adding property-based tests for:

- Navigation performance under high-frequency state changes
- Integration with routing systems
- Navigation behavior with dynamic navigation items
- Cross-browser localStorage compatibility
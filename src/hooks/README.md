# Custom Hooks Documentation

This directory contains custom React hooks for accessing and managing different parts of the CommuniTree application state.

## Overview

The custom hooks provide a clean, type-safe interface for components to interact with the global application state managed by React Context and useReducer.

## Available Hooks

### Core State Access

#### `useAppState()`
- **Purpose**: Direct access to the complete application state
- **Returns**: `AppState` object
- **Usage**: For components that need access to multiple state slices

#### `useAppDispatch()`
- **Purpose**: Access to the dispatch function for state mutations
- **Returns**: `React.Dispatch<AppActions>`
- **Usage**: For components that need to trigger state changes

### Specialized Hooks

#### `useUser()`
- **Purpose**: User-specific state management
- **Returns**: User data, authentication status, and user-related actions
- **Key Features**:
  - User profile access
  - Trust points management
  - Authentication status
  - User update functions

#### `useCurrentTrack()`
- **Purpose**: Track switching logic (Impact/Grow)
- **Returns**: Current track, switching functions, and theme information
- **Key Features**:
  - Track state persistence to localStorage
  - Toggle between Impact and Grow tracks
  - Theme synchronization

#### `useTrustPoints()`
- **Purpose**: Trust points management and calculations
- **Returns**: Trust points data, validation functions, and utilities
- **Key Features**:
  - Trust point calculations
  - RSVP eligibility checks
  - Warning messages for low trust points
  - Trust level categorization

#### `useNGOs()`
- **Purpose**: NGO data management
- **Returns**: NGO data, filtering functions, and NGO-related actions
- **Key Features**:
  - NGO verification management
  - Category-based filtering
  - Volunteer need tracking
  - CRUD operations for NGOs

#### `useEvents()`
- **Purpose**: Event data management
- **Returns**: Event data, RSVP functions, and event-related actions
- **Key Features**:
  - Event RSVP management
  - Category and safety rating filtering
  - User event history tracking
  - Event CRUD operations

#### `useUI()`
- **Purpose**: UI state management
- **Returns**: UI state, modal controls, and notification management
- **Key Features**:
  - Loading state management
  - Modal visibility controls
  - View mode switching (grid/list)
  - Notification system

## Implementation Details

### State Access Pattern
All hooks follow a consistent pattern:
1. Access global state via `useAppContext()`
2. Provide computed values and derived state
3. Expose action functions using `useCallback` for performance
4. Include type safety and error handling

### Performance Optimizations
- All action functions are memoized with `useCallback`
- Computed values use `useMemo` where appropriate
- Hooks only re-render when relevant state changes

### Type Safety
- All hooks are fully typed with TypeScript
- Return types are explicitly defined
- Action functions include proper parameter typing

## Usage Examples

```typescript
// Basic state access
const { user, currentTrack } = useAppState();

// User management
const { user, updateUser, trustPoints, isAuthenticated } = useUser();

// Track switching
const { currentTrack, switchTrack, isImpactTrack } = useCurrentTrack();

// Trust points
const { currentPoints, canRSVP, getRSVPWarning } = useTrustPoints();

// NGO management
const { ngos, verifiedNGOs, verifyNGO } = useNGOs();

// Event management
const { upcomingEvents, rsvpToEvent, hasUserRSVPd } = useEvents();

// UI controls
const { showModal, hideModal, setLoading, notifications } = useUI();
```

## Testing

The hooks are tested using React Testing Library with a custom test wrapper that provides the AppProvider context. Tests verify:
- Proper state access
- Action function availability
- Type safety
- Default values
- State synchronization

## Requirements Fulfilled

This implementation satisfies the following requirements:
- **10.2**: React hooks for state persistence and management
- **3.4**: Track switching and state preservation
- All hooks provide clean, type-safe access to application state
- Specialized hooks for different domain areas (user, NGO, events, etc.)
- Performance optimizations and proper React patterns
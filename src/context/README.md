# CommuniTree Context System

This directory contains the global state management system for the CommuniTree platform, implemented using React Context API and useReducer pattern.

## Architecture Overview

The state management system follows a Redux-like pattern with:
- **AppContext**: Central context provider
- **appReducer**: Pure reducer function handling all state mutations
- **Custom Hooks**: Specialized hooks for accessing different parts of state
- **Initial State**: Factory function with mock data for development

## Files Structure

```
src/context/
├── AppContext.tsx      # Main context provider and hook
├── appReducer.ts       # Reducer function with all action handlers
├── initialState.ts     # Initial state factory with mock data
├── index.ts           # Barrel exports
└── README.md          # This documentation
```

## Usage

### 1. Wrap your app with AppProvider

```tsx
import { AppProvider } from './context';

function App() {
  return (
    <AppProvider>
      <YourAppComponents />
    </AppProvider>
  );
}
```

### 2. Use specialized hooks in components

```tsx
import { useUser, useCurrentTrack, useTrustPoints } from './hooks';

function MyComponent() {
  const { user, updateUser } = useUser();
  const { currentTrack, switchTrack } = useCurrentTrack();
  const { currentPoints, awardPoints } = useTrustPoints();
  
  // Component logic here
}
```

## Available Hooks

### Core State Hooks
- `useAppState()` - Access full application state
- `useAppDispatch()` - Access dispatch function for actions

### Specialized Hooks
- `useUser()` - User data and authentication
- `useCurrentTrack()` - Track switching (Impact/Grow)
- `useTrustPoints()` - Trust points management
- `useNGOs()` - NGO data and verification
- `useEvents()` - Event data and RSVP management
- `useUI()` - UI state (modals, loading, notifications)

## State Structure

```typescript
interface AppState {
  user: User | null;                    // Current authenticated user
  currentTrack: 'impact' | 'grow';      // Active track
  ngos: NGO[];                          // NGO data
  events: Event[];                      // Event data
  chatThreads: ChatThread[];            // Chat conversations
  ui: UIState;                          // UI state (modals, loading, etc.)
  preferences: UserPreferences;         // User preferences
}
```

## Actions

The reducer handles the following action types:

### User Actions
- `SET_USER` - Set current user
- `UPDATE_USER` - Update user data
- `UPDATE_TRUST_POINTS` - Modify trust points

### Track Actions
- `SWITCH_TRACK` - Change between Impact/Grow tracks
- `SET_THEME` - Update theme

### NGO Actions
- `SET_NGOS` - Set NGO list
- `ADD_NGO` - Add new NGO
- `UPDATE_NGO` - Update NGO data
- `VERIFY_NGO` - Verify NGO with Darpan ID

### Event Actions
- `SET_EVENTS` - Set event list
- `ADD_EVENT` - Add new event
- `UPDATE_EVENT` - Update event data
- `RSVP_EVENT` - RSVP to event
- `CANCEL_RSVP` - Cancel RSVP

### Chat Actions
- `SET_CHAT_THREADS` - Set chat threads
- `ADD_CHAT_THREAD` - Add new chat thread
- `SEND_MESSAGE` - Send message
- `MARK_MESSAGES_READ` - Mark messages as read

### UI Actions
- `SET_LOADING` - Set loading state
- `SHOW_MODAL` / `HIDE_MODAL` - Modal management
- `SET_VIEW_MODE` - Grid/List view toggle
- `ADD_NOTIFICATION` - Add notification
- `REMOVE_NOTIFICATION` - Remove notification

## Trust Points System

The trust points system is integrated into the state management:

```typescript
// Trust point values for different actions
const TRUST_POINT_VALUES = {
  ORGANIZE_EVENT: 20,
  ATTEND_EVENT: 5,
  NO_SHOW: -10,
  VERIFY_IDENTITY: 10,
  REPORT_VIOLATION: -5,
  VOLUNTEER_ACTIVITY: 15,
  COMMUNITY_CONTRIBUTION: 10,
};
```

## Mock Data

The initial state includes comprehensive mock data:
- Sample user with 75 trust points
- 3 NGOs (2 verified, 1 unverified)
- 4 upcoming events with different categories
- Sample notifications and preferences

## Persistence

- Track selection is persisted to localStorage
- User preferences are maintained across sessions
- Chat history and trust points are stored in state

## Example Usage

See `src/examples/ContextUsageExample.tsx` for a complete demonstration of all features working together.

## Testing

Unit tests are provided in `__tests__/AppContext.test.tsx` covering:
- Initial state loading
- Action dispatching
- Hook functionality
- Error handling

## Requirements Satisfied

This implementation satisfies the following requirements:
- **10.2**: React hooks for state persistence
- **10.3**: Data consistency across track switches and navigation
- **3.4**: Track switching with state preservation
- **6.3-6.5**: Trust points calculation and management
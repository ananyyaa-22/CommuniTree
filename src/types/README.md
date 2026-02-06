# CommuniTree TypeScript Interfaces

This directory contains all TypeScript interfaces and type definitions for the CommuniTree platform. The interfaces are organized by domain and follow a consistent naming convention.

## File Structure

```
src/types/
├── User.ts           # User-related interfaces
├── NGO.ts            # NGO-related interfaces  
├── Event.ts          # Event-related interfaces
├── Venue.ts          # Venue-related interfaces
├── ChatThread.ts     # Chat and messaging interfaces
├── AppState.ts       # Global application state
├── AppActions.ts     # Redux-style action types
├── enums.ts          # Constants and enums
├── utils.ts          # Utility types and helpers
├── index.ts          # Central export file
└── __tests__/        # Interface validation tests
```

## Core Data Models

### User Interface
Represents a platform user with authentication, trust points, and engagement history.

**Key Properties:**
- `trustPoints`: Gamified reputation system (0-100 scale)
- `verificationStatus`: Identity verification status
- `eventHistory`: Track of user's community engagement

### NGO Interface
Represents non-governmental organizations offering volunteer opportunities.

**Key Properties:**
- `darpanId`: 5-digit government verification ID
- `isVerified`: Verification status based on Darpan ID
- `category`: Type of NGO work (Education, Healthcare, etc.)

### Event Interface
Represents community events in the Grow track.

**Key Properties:**
- `category`: Event type (Poetry, Art, Fitness, etc.)
- `venue`: Location with safety rating
- `rsvpList`: Users who have confirmed attendance

### Venue Interface
Represents event locations with safety classifications.

**Key Properties:**
- `type`: Venue classification (public, commercial, private)
- `safetyRating`: Color-coded safety level (green, yellow, red)
- `coordinates`: GPS location for mapping

### ChatThread Interface
Represents messaging between users and organizations.

**Key Properties:**
- `context`: NGO or Event context for the conversation
- `participants`: Users involved in the chat
- `messages`: Array of message objects

## State Management

### AppState Interface
Global application state using React Context + useReducer pattern.

**Structure:**
```typescript
{
  user: User | null,
  currentTrack: 'impact' | 'grow',
  ngos: NGO[],
  events: Event[],
  chatThreads: ChatThread[],
  ui: UIState,
  preferences: UserPreferences
}
```

### AppActions Type Union
Redux-style actions for state management with type safety.

**Action Categories:**
- User actions (SET_USER, UPDATE_TRUST_POINTS)
- Track actions (SWITCH_TRACK, SET_THEME)
- NGO actions (VERIFY_NGO, ADD_NGO)
- Event actions (RSVP_EVENT, CANCEL_RSVP)
- Chat actions (SEND_MESSAGE, ADD_CHAT_THREAD)
- UI actions (SHOW_MODAL, SET_LOADING)

## Constants and Enums

### Trust Points System
```typescript
TRUST_POINT_ACTIONS = {
  ORGANIZE_EVENT: 20,
  ATTEND_EVENT: 5,
  NO_SHOW: -10,
  VERIFY_IDENTITY: 10,
  REPORT_VIOLATION: -5
}
```

### Venue Safety Ratings
- **Green**: Public venues (parks, libraries) - safest
- **Yellow**: Commercial venues (cafes, studios) - moderate
- **Red**: Private venues (homes) - requires caution

### Track Types
- **Impact**: Community service and NGO volunteering
- **Grow**: Local entertainment and hobby meetups

## Usage Examples

### Creating a User
```typescript
import { User, TRUST_POINT_LIMITS } from '../types';

const newUser: User = {
  id: 'user_123',
  name: 'John Doe',
  email: 'john@example.com',
  trustPoints: TRUST_POINT_LIMITS.INITIAL, // 50
  verificationStatus: 'pending',
  chatHistory: [],
  eventHistory: [],
  createdAt: new Date(),
  updatedAt: new Date()
};
```

### Dispatching Actions
```typescript
import { AppActions } from '../types';

const switchTrackAction: AppActions = {
  type: 'SWITCH_TRACK',
  payload: 'grow'
};

const updateTrustPointsAction: AppActions = {
  type: 'UPDATE_TRUST_POINTS',
  payload: {
    userId: 'user_123',
    delta: 5,
    reason: 'ATTEND_EVENT'
  }
};
```

### Working with Events
```typescript
import { Event, Venue } from '../types';

const venue: Venue = {
  id: 'venue_1',
  name: 'Central Library',
  type: 'public',
  safetyRating: 'green',
  // ... other properties
};

const event: Event = {
  id: 'event_1',
  title: 'Poetry Reading',
  category: 'Poetry',
  venue,
  // ... other properties
};
```

## Type Safety Benefits

1. **Compile-time validation**: Catch errors before runtime
2. **IntelliSense support**: Better IDE autocomplete and suggestions
3. **Refactoring safety**: Rename properties across the entire codebase
4. **Documentation**: Interfaces serve as living documentation
5. **Team collaboration**: Clear contracts between components

## Testing

The `__tests__/interfaces.test.ts` file validates that all interfaces work correctly together and can be imported without issues. Run tests to ensure type definitions are valid:

```bash
npm test src/types/__tests__/interfaces.test.ts
```

## Future Considerations

- Add JSON schema generation for API validation
- Consider using branded types for IDs (User ID vs NGO ID)
- Add runtime type validation with libraries like Zod
- Implement discriminated unions for better type narrowing
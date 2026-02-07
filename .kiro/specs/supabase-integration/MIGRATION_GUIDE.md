# Component Migration Guide

This guide provides step-by-step instructions for migrating components from mock data to Supabase.

## Overview

Each component needs to be updated to:
1. Use Supabase types instead of legacy types
2. Use Supabase hooks instead of mock data
3. Handle loading and error states
4. Display empty states when no data is available

## Type Mapping

### Old Types → New Types

| Old Type | New Type | Location |
|----------|----------|----------|
| `User` | `User` (from models.ts) | `src/types/models.ts` |
| `NGO` | `NGO` (from models.ts) | `src/types/models.ts` |
| `Event` | `Event` (from models.ts) | `src/types/models.ts` |
| `ChatThread` | `ChatThread` (from models.ts) | `src/types/models.ts` |
| `ChatMessage` | `ChatMessage` (from models.ts) | `src/types/models.ts` |

### Key Differences

#### NGO Type
**Old**:
```typescript
{
  projectTitle: string;
  isVerified: boolean;
  category: NGOCategory;
  volunteersNeeded: number;
  currentVolunteers: number;
  contactInfo: { email: string; phone: string };
}
```

**New**:
```typescript
{
  description: string | null;  // replaces projectTitle
  verificationStatus: 'pending' | 'verified' | 'rejected';  // replaces isVerified
  contactEmail: string;  // replaces contactInfo.email
  contactPhone: string | null;  // replaces contactInfo.phone
  // category, volunteersNeeded, currentVolunteers removed
}
```

#### Event Type
**Old**:
```typescript
{
  category: EventCategory;
  venue: Venue;
  organizer: User;
  attendees: User[];
  rsvpList: RSVP[];
  dateTime: Date;
  duration: number;
}
```

**New**:
```typescript
{
  eventType: string;  // replaces category
  trackType: 'impact' | 'grow';
  organizerId: string;  // replaces organizer
  organizerType: 'user' | 'ngo';
  venueId: string | null;
  venue?: Venue;  // optional, fetched via join
  startTime: Date;  // replaces dateTime
  endTime: Date;
  maxParticipants: number | null;
  rsvpCount?: number;  // optional, calculated
  // attendees, rsvpList, duration removed
}
```

#### ChatThread Type
**Old**:
```typescript
{
  participants: User[];
  context: ChatContext;
  messages: Message[];
  lastActivity: Date;
  isActive: boolean;
}
```

**New**:
```typescript
{
  participantUserId: string;
  participantNgoId: string;
  user?: User;  // optional, fetched via join
  ngo?: NGO;  // optional, fetched via join
  lastMessage?: ChatMessage;  // optional
  // participants, context, messages, isActive removed
}
```

## Hook Migration

### useEvents

**Old Usage**:
```typescript
const { 
  events,
  upcomingEvents,
  userRSVPEvents,
  userOrganizedEvents,
  rsvpToEvent,
  cancelRSVP,
  hasUserRSVPd 
} = useEvents();
```

**New Usage**:
```typescript
// For event listing
const { events, loading, error, refetch } = useEvents('impact'); // or 'grow'

// For RSVP management
const { user } = useAppState();
const { rsvps, createRSVP, cancelRSVP, isRSVPd } = useRSVP(user?.id || '');

// Check if user has RSVP'd
const hasRSVPd = isRSVPd(eventId);

// Create RSVP
await createRSVP(eventId);

// Cancel RSVP
await cancelRSVP(eventId);
```

### useChat

**Old Usage**:
```typescript
const { 
  userChatHistory,
  getUnreadMessageCount,
  createChatContext 
} = useChat();
```

**New Usage**:
```typescript
const { user } = useAppState();
const { threads, messages, loading, error, sendMessage, selectThread } = useChat(
  user?.id || '',
  activeThreadId
);

// Send a message
await sendMessage('Hello!');

// Select a thread
selectThread(threadId);
```

### useNGOs

**Old Usage**:
```typescript
const { ngos } = useAppState();
```

**New Usage**:
```typescript
const { ngos, loading, error, refetch } = useNGOs();
```

## Component Migration Examples

### Example 1: EventCard Component

**Before**:
```typescript
import { Event } from '../../types/Event';
import { useEvents } from '../../hooks/useEvents';

const { hasUserRSVPd, rsvpToEvent } = useEvents();
const isRSVPd = hasUserRSVPd(event.id);

<button onClick={() => rsvpToEvent(event.id)}>
  RSVP
</button>
```

**After**:
```typescript
import { Event } from '../../types/models';
import { useAppState } from '../../hooks/useAppState';
import { useRSVP } from '../../hooks/useRSVP';

const { user } = useAppState();
const { createRSVP, isRSVPd } = useRSVP(user?.id || '');
const isRSVPd = isRSVPd(event.id);

<button onClick={() => createRSVP(event.id)}>
  RSVP
</button>
```

### Example 2: NGOCard Component

**Before**:
```typescript
<h3>{ngo.projectTitle}</h3>
<span>{ngo.category}</span>
<span>{ngo.isVerified ? 'Verified' : 'Unverified'}</span>
<p>Email: {ngo.contactInfo.email}</p>
```

**After**:
```typescript
<h3>{ngo.description || 'Community Project'}</h3>
<span>Community Development</span> {/* Default category */}
<span>{ngo.verificationStatus === 'verified' ? 'Verified' : 'Unverified'}</span>
<p>Email: {ngo.contactEmail}</p>
```

### Example 3: SchedulePage Component

**Before**:
```typescript
const { userRSVPEvents, userOrganizedEvents } = useEvents();

return (
  <div>
    <h2>My RSVPs</h2>
    {userRSVPEvents.map(event => <EventCard event={event} />)}
    
    <h2>Events I'm Organizing</h2>
    {userOrganizedEvents.map(event => <EventCard event={event} />)}
  </div>
);
```

**After**:
```typescript
const { user } = useAppState();
const { rsvps, loading: rsvpsLoading } = useRSVP(user?.id || '');
const { events: impactEvents, loading: impactLoading } = useEvents('impact');
const { events: growEvents, loading: growLoading } = useEvents('grow');

// Filter events user has RSVP'd to
const userRSVPEvents = [...impactEvents, ...growEvents].filter(event =>
  rsvps.some(rsvp => rsvp.eventId === event.id && rsvp.status === 'confirmed')
);

// Filter events user is organizing
const userOrganizedEvents = [...impactEvents, ...growEvents].filter(event =>
  event.organizerId === user?.id && event.organizerType === 'user'
);

if (rsvpsLoading || impactLoading || growLoading) {
  return <Loading />;
}

return (
  <div>
    <h2>My RSVPs</h2>
    {userRSVPEvents.length === 0 ? (
      <p>No RSVPs yet</p>
    ) : (
      userRSVPEvents.map(event => <EventCard key={event.id} event={event} />)
    )}
    
    <h2>Events I'm Organizing</h2>
    {userOrganizedEvents.length === 0 ? (
      <p>No organized events</p>
    ) : (
      userOrganizedEvents.map(event => <EventCard key={event.id} event={event} />)
    )}
  </div>
);
```

## Common Patterns

### 1. Loading States

Always handle loading states:

```typescript
const { data, loading, error } = useSupabaseHook();

if (loading) {
  return <Loading />;
}

if (error) {
  return <ErrorMessage message={error.message} />;
}

return <YourComponent data={data} />;
```

### 2. Empty States

Always handle empty data:

```typescript
if (data.length === 0) {
  return (
    <div className="text-center py-8">
      <p className="text-gray-500">No items found</p>
    </div>
  );
}
```

### 3. Error Handling

Use try-catch for async operations:

```typescript
const handleAction = async () => {
  try {
    await someAsyncOperation();
    // Success feedback
  } catch (error) {
    console.error('Operation failed:', error);
    // Error feedback to user
  }
};
```

### 4. Null Safety

Always check for null/undefined:

```typescript
// Bad
<p>{event.venue.name}</p>

// Good
<p>{event.venue?.name || 'TBD'}</p>
```

## Testing After Migration

After migrating a component:

1. **Check compilation**: `npm run build`
2. **Run component tests**: `npm test -- ComponentName`
3. **Manual testing**:
   - Test with data
   - Test with empty data
   - Test loading states
   - Test error states
   - Test user interactions

## Troubleshooting

### Issue: Property doesn't exist on type

**Solution**: Check if you're using the correct type. Import from `src/types/models.ts` instead of legacy types.

### Issue: Hook returns undefined

**Solution**: Make sure you're passing required parameters (e.g., userId for useRSVP).

### Issue: Component doesn't update

**Solution**: Check if you're using the refetch method or if real-time subscriptions are set up correctly.

### Issue: Type errors with adapters

**Solution**: The adapter functions in hooks convert Supabase types to legacy types. If you see type errors, you may need to update the adapter or use the Supabase type directly.

## Next Steps

1. Start with simple components (display-only)
2. Move to interactive components (with actions)
3. Finally update complex components (with multiple data sources)
4. Run tests after each component migration
5. Document any issues or workarounds

## Getting Help

If you encounter issues:
1. Check the VALIDATION_REPORT.md for known issues
2. Review the design.md for architecture details
3. Look at already-migrated components for examples
4. Check Supabase documentation for API details

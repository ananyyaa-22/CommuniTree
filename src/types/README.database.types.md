# Database Types Documentation

## Overview

The `database.types.ts` file contains TypeScript type definitions for the Supabase database schema. These types provide compile-time type safety for all database operations throughout the CommuniTree application.

## Generated Types

### Main Database Interface

The `Database` interface represents the complete database schema structure:

```typescript
import type { Database } from './database.types';
```

### Table Types

Each database table has three type variants:

1. **Row**: Complete row data returned from SELECT queries
2. **Insert**: Data required/optional for INSERT operations
3. **Update**: Partial data for UPDATE operations

#### Available Tables

- `users` - User profiles with trust points and verification
- `ngos` - NGO organizations with Darpan ID verification
- `venues` - Event venues with safety ratings
- `events` - Community events (Impact and Grow tracks)
- `rsvps` - Event attendance confirmations
- `chat_threads` - Chat conversations between users and NGOs
- `chat_messages` - Individual messages in chat threads
- `trust_points_history` - Audit trail for trust point changes

### Helper Types

#### Generic Helpers

```typescript
// Get Row type for any table
type UserRow = Tables<'users'>;

// Get Insert type for any table
type UserInsert = Inserts<'users'>;

// Get Update type for any table
type UserUpdate = Updates<'users'>;
```

#### Specific Table Types

Convenience exports for direct use:

```typescript
import type {
  DbUser,
  DbUserInsert,
  DbUserUpdate,
  DbNGO,
  DbEvent,
  DbRSVP,
  // ... etc
} from './database.types';
```

### Enum Types

Type-safe enums for database constraints:

```typescript
import type {
  VerificationStatus,      // 'unverified' | 'verified'
  NGOVerificationStatus,   // 'pending' | 'verified' | 'rejected'
  SafetyRating,           // 'green' | 'yellow' | 'red'
  TrackType,              // 'impact' | 'grow'
  OrganizerType,          // 'user' | 'ngo'
  RSVPStatus,             // 'confirmed' | 'cancelled' | 'attended' | 'no_show'
  SenderType,             // 'user' | 'ngo'
} from './database.types';
```

## Usage Examples

### Querying Data

```typescript
import { supabase } from '../lib/supabase';
import type { DbUser } from '../types/database.types';

// Type-safe query
const { data, error } = await supabase
  .from('users')
  .select('*')
  .eq('id', userId)
  .single();

// data is typed as DbUser | null
if (data) {
  console.log(data.display_name); // TypeScript knows this exists
  console.log(data.trust_points); // TypeScript knows this is a number
}
```

### Inserting Data

```typescript
import type { DbEventInsert } from '../types/database.types';

const newEvent: DbEventInsert = {
  title: 'Beach Cleanup',
  event_type: 'volunteering',
  track_type: 'impact',
  organizer_id: userId,
  organizer_type: 'user',
  start_time: '2024-06-01T10:00:00Z',
  end_time: '2024-06-01T12:00:00Z',
  // Optional fields can be omitted
};

const { data, error } = await supabase
  .from('events')
  .insert(newEvent)
  .select()
  .single();
```

### Updating Data

```typescript
import type { DbUserUpdate } from '../types/database.types';

const updates: DbUserUpdate = {
  display_name: 'New Name',
  trust_points: 75,
};

const { data, error } = await supabase
  .from('users')
  .update(updates)
  .eq('id', userId)
  .select()
  .single();
```

### Using Enum Types

```typescript
import type { TrackType, RSVPStatus } from '../types/database.types';

function filterEventsByTrack(track: TrackType) {
  // TypeScript ensures only 'impact' or 'grow' can be passed
  return supabase
    .from('events')
    .select('*')
    .eq('track_type', track);
}

function updateRSVPStatus(rsvpId: string, status: RSVPStatus) {
  // TypeScript ensures only valid RSVP statuses can be used
  return supabase
    .from('rsvps')
    .update({ status })
    .eq('id', rsvpId);
}
```

## Type Safety Benefits

1. **Autocomplete**: IDEs provide intelligent suggestions for table names, column names, and values
2. **Error Prevention**: TypeScript catches typos and invalid data before runtime
3. **Refactoring Safety**: Schema changes are caught at compile time
4. **Documentation**: Types serve as inline documentation for the database schema
5. **Confidence**: Developers can trust that database operations match the actual schema

## Maintenance

### When to Regenerate Types

Regenerate types whenever the database schema changes:

- Adding/removing tables
- Adding/removing columns
- Changing column types
- Modifying constraints or enums

### How to Regenerate

If using Supabase CLI (when connected to a live database):

```bash
npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts
```

For this project, types are manually maintained based on migration files in:
`.kiro/specs/supabase-integration/migrations/`

## Related Files

- `src/lib/supabase.ts` - Supabase client configuration using these types
- `src/types/__tests__/database.types.test.ts` - Type verification tests
- `.kiro/specs/supabase-integration/migrations/` - Database schema definitions

## References

- [Supabase TypeScript Support](https://supabase.com/docs/guides/api/generating-types)
- [Supabase Database Design](https://supabase.com/docs/guides/database/overview)
- Requirements: 4.2 (Type Safety)

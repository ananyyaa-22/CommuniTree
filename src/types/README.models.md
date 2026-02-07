# Application Models Documentation

## Overview

The `models.ts` file contains TypeScript interfaces for application-level data models that align with the Supabase database schema. These types use camelCase naming convention and represent data as used in the React application layer.

## Purpose

These types serve as the bridge between the database layer (snake_case) and the application layer (camelCase). They will be used in conjunction with transformer utilities to convert data between formats.

## Type Naming Convention

To avoid conflicts with existing legacy types, the new Supabase-aligned types are exported with prefixed names:

- `User` → exported as `SupabaseUser`
- `NGO` → exported as `SupabaseNGO`
- `Event` → exported as `SupabaseEvent`
- `Venue` → exported as `SupabaseVenue`
- `RSVP` → exported as `SupabaseRSVP`
- `ChatThread` → exported as `SupabaseChatThread`
- `ChatMessage` → exported as `SupabaseChatMessage`

## Usage Examples

### Importing Types

```typescript
import {
  SupabaseUser,
  SupabaseNGO,
  SupabaseEvent,
  CreateUserInput,
  UpdateEventInput,
} from '@/types';
```

### Using with Data Transformers

```typescript
import { SupabaseUser } from '@/types';
import { dbUserToUser } from '@/utils/transformers';

// Convert database user to application user
const dbUser = await supabase.from('users').select('*').single();
const appUser: SupabaseUser = dbUserToUser(dbUser.data);
```

### Creating New Records

```typescript
import { CreateEventInput } from '@/types';

const newEvent: CreateEventInput = {
  title: 'Community Cleanup',
  description: 'Join us for a neighborhood cleanup',
  eventType: 'volunteering',
  trackType: 'impact',
  organizerId: userId,
  organizerType: 'user',
  startTime: new Date('2024-03-15T10:00:00'),
  endTime: new Date('2024-03-15T14:00:00'),
  maxParticipants: 20,
};
```

### Updating Records

```typescript
import { UpdateUserInput } from '@/types';

const updates: UpdateUserInput = {
  displayName: 'New Name',
  trustPoints: 75,
};
```

## Type Definitions

### Core Models

- **SupabaseUser**: Authenticated user with trust points and verification status
- **SupabaseNGO**: Non-governmental organization with Darpan ID verification
- **SupabaseVenue**: Event location with safety rating system
- **SupabaseEvent**: Community event with track type (impact/grow)
- **SupabaseRSVP**: Event attendance confirmation
- **SupabaseChatThread**: Conversation between user and NGO
- **SupabaseChatMessage**: Individual message in a chat thread
- **TrustPointsHistory**: Audit trail of trust point changes

### Input Types

Input types are used when creating new records. They omit auto-generated fields like `id`, `createdAt`, and `updatedAt`:

- `CreateUserInput`
- `CreateNGOInput`
- `CreateVenueInput`
- `CreateEventInput`
- `CreateRSVPInput`
- `CreateChatThreadInput`
- `CreateChatMessageInput`

### Update Types

Update types are partial versions of the main types, allowing you to update only specific fields:

- `UpdateUserInput`
- `UpdateNGOInput`
- `UpdateVenueInput`
- `UpdateEventInput`
- `UpdateRSVPInput`

## Migration Path

These types are designed to eventually replace the legacy types in:
- `src/types/User.ts`
- `src/types/NGO.ts`
- `src/types/Event.ts`
- `src/types/Venue.ts`
- `src/types/ChatThread.ts`

During the migration:
1. New Supabase-integrated code should use the `Supabase*` prefixed types
2. Legacy code continues to use the original types
3. Gradually migrate components to use the new types
4. Once migration is complete, remove legacy types and rename `Supabase*` types back to their original names

## Related Files

- **Database Types**: `src/types/database.types.ts` - Snake_case types matching Supabase schema
- **Transformers**: `src/utils/transformers.ts` - Functions to convert between database and application types
- **Services**: `src/services/*.service.ts` - Data access layer using these types

## Requirements

This implementation satisfies:
- **Requirement 4.2**: TypeScript interfaces matching database schema for type safety
- Uses camelCase naming convention for application types
- Includes proper TypeScript types for enums and optional fields

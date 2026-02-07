# CommuniTree Developer Onboarding Guide

Welcome to the CommuniTree development team! This guide will help you set up your local development environment and understand the codebase.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment Setup](#development-environment-setup)
3. [Project Architecture](#project-architecture)
4. [Development Workflow](#development-workflow)
5. [Testing Guide](#testing-guide)
6. [Common Development Tasks](#common-development-tasks)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)
9. [Resources](#resources)

---

## Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js** v16 or higher ([download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for version control
- **Code editor** (VS Code recommended)
- **Supabase account** (free tier is fine)

### Recommended VS Code Extensions

Install these extensions for the best development experience:

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - Tailwind class autocomplete
- **TypeScript Vue Plugin (Volar)** - TypeScript support
- **GitLens** - Git integration
- **Error Lens** - Inline error display
- **Auto Rename Tag** - HTML/JSX tag renaming
- **Path Intellisense** - File path autocomplete

---

## Development Environment Setup

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd CommuniTree
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages including:
- React and React DOM
- TypeScript
- Tailwind CSS
- Supabase client
- Testing libraries
- Development tools

### Step 3: Set Up Supabase

#### Create Development Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in details:
   - **Name**: CommuniTree Dev (or your name + Dev)
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to you
4. Wait for project creation (~2 minutes)

#### Get Your Credentials

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy:
   - **Project URL**
   - **anon public** key

#### Configure Environment Variables

1. Copy the example file:
```bash
cp .env.example .env
```

2. Edit `.env` and add your credentials:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Never commit `.env` to Git. It's already in `.gitignore`.

### Step 4: Set Up Database

#### Run Migrations

You need to create the database schema. In Supabase dashboard:

1. Go to **SQL Editor**
2. Run these files in order (copy/paste content and click "Run"):
   - `.kiro/specs/supabase-integration/migrations/001_create_tables.sql`
   - `.kiro/specs/supabase-integration/migrations/002_create_functions.sql`
   - `.kiro/specs/supabase-integration/migrations/003_create_rls_policies.sql`

#### Load Seed Data

For development, load sample data:

1. In **SQL Editor**, run:
   - `.kiro/specs/supabase-integration/migrations/seed_data.sql`

This creates sample users, NGOs, events, and chat data for testing.

### Step 5: Verify Setup

Start the development server:

```bash
npm start
```

The app should open at `http://localhost:3000` (or similar).

**Check for**:
- No console errors
- App loads successfully
- You can see sample data (if seed data was loaded)

### Step 6: Run Tests

Verify everything works:

```bash
npm test
```

All tests should pass. If any fail, check your setup.

---

## Project Architecture

### High-Level Overview

```
Frontend (React + TypeScript)
    ↓
Data Access Layer (Services)
    ↓
Supabase Client
    ↓
Supabase API
    ↓
PostgreSQL Database + Auth + Realtime
```

### Directory Structure

```
src/
├── components/          # React UI components
│   ├── Auth/           # Authentication forms
│   ├── ChatModal/      # Chat interface
│   ├── EventCard/      # Event display
│   ├── NGOCard/        # NGO display
│   ├── Navigation/     # App navigation
│   └── UserProfile/    # User profile
│
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication state
│   ├── useEvents.ts    # Event data fetching
│   ├── useRSVP.ts      # RSVP management
│   ├── useChat.ts      # Chat functionality
│   └── useNGOs.ts      # NGO data fetching
│
├── services/           # Data access layer
│   ├── auth.service.ts    # Auth operations
│   ├── user.service.ts    # User CRUD
│   ├── ngo.service.ts     # NGO operations
│   ├── event.service.ts   # Event operations
│   ├── rsvp.service.ts    # RSVP operations
│   ├── chat.service.ts    # Chat operations
│   └── venue.service.ts   # Venue operations
│
├── types/              # TypeScript definitions
│   ├── database.types.ts  # Auto-generated from DB
│   ├── models.ts          # Application types
│   ├── User.ts            # User interface
│   ├── NGO.ts             # NGO interface
│   ├── Event.ts           # Event interface
│   └── ...
│
├── utils/              # Utility functions
│   ├── transformers.ts    # DB ↔ App conversions
│   ├── errors.ts          # Error classes
│   ├── validation.ts      # Input validation
│   └── trustPoints.ts     # Trust point logic
│
├── context/            # React Context
│   ├── AppContext.tsx     # Global state
│   ├── appReducer.ts      # State reducer
│   └── initialState.ts    # Initial state
│
├── lib/                # Third-party setup
│   └── supabase.ts        # Supabase client
│
└── App.tsx             # Root component
```

### Key Concepts

#### 1. Data Flow

**Reading Data**:
```
Component → Custom Hook → Service Function → Supabase Client → Database
```

**Writing Data**:
```
Component → Custom Hook → Service Function → Supabase Client → Database
                                                    ↓
                                            RLS Policy Check
```

#### 2. Type Safety

We use TypeScript throughout:

- **Database Types**: Auto-generated from Supabase schema (`database.types.ts`)
- **Application Types**: Camel-case versions for the app (`models.ts`)
- **Transformers**: Convert between database and app types

Example:
```typescript
// Database type (snake_case)
type DbUser = {
  id: string;
  display_name: string;
  trust_points: number;
}

// Application type (camelCase)
type User = {
  id: string;
  displayName: string;
  trustPoints: number;
}

// Transformer
function dbUserToUser(dbUser: DbUser): User {
  return {
    id: dbUser.id,
    displayName: dbUser.display_name,
    trustPoints: dbUser.trust_points,
  };
}
```

#### 3. Authentication

Authentication uses Supabase Auth:

- **Sign Up**: Creates auth user + profile in `users` table
- **Sign In**: Returns session token
- **Session**: Persists in localStorage
- **Protected Routes**: Check auth state before rendering

#### 4. Row Level Security (RLS)

Database access is controlled by RLS policies:

- Users can only see their own profile
- Users can only manage their own RSVPs
- Chat messages only visible to participants
- Events and NGOs are publicly readable

#### 5. Real-time Subscriptions

Chat uses Supabase Realtime:

```typescript
// Subscribe to new messages
const subscription = supabase
  .channel('chat-messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'chat_messages',
    filter: `thread_id=eq.${threadId}`
  }, (payload) => {
    // Handle new message
  })
  .subscribe();

// Clean up
subscription.unsubscribe();
```

---

## Development Workflow

### Daily Workflow

1. **Pull latest changes**:
```bash
git pull origin main
```

2. **Install any new dependencies**:
```bash
npm install
```

3. **Start development server**:
```bash
npm start
```

4. **Make changes** and test in browser

5. **Run tests**:
```bash
npm test
```

6. **Commit changes**:
```bash
git add .
git commit -m "feat: add new feature"
git push origin your-branch
```

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch
- **feature/**: New features (`feature/chat-notifications`)
- **fix/**: Bug fixes (`fix/rsvp-validation`)
- **docs/**: Documentation updates

### Commit Message Format

Follow conventional commits:

```
type(scope): description

[optional body]
[optional footer]
```

**Types**:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting, no code change
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

**Examples**:
```
feat(auth): add password reset functionality
fix(rsvp): prevent duplicate RSVPs
docs(readme): update setup instructions
```

### Code Review Process

1. Create pull request with clear description
2. Ensure all tests pass
3. Request review from team member
4. Address feedback
5. Merge after approval

---

## Testing Guide

### Test Types

We use three types of tests:

1. **Unit Tests**: Test individual functions/components
2. **Property Tests**: Test universal properties across many inputs
3. **Integration Tests**: Test end-to-end flows

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- useAuth.test.ts

# Run with coverage
npm test -- --coverage
```

### Writing Tests

#### Unit Test Example

```typescript
// src/utils/__tests__/trustPoints.test.ts
import { calculateTrustPoints } from '../trustPoints';

describe('calculateTrustPoints', () => {
  it('should increment points for event completion', () => {
    const result = calculateTrustPoints(50, 'event_completed');
    expect(result).toBe(55);
  });

  it('should not exceed 100', () => {
    const result = calculateTrustPoints(98, 'event_completed');
    expect(result).toBe(100);
  });

  it('should not go below 0', () => {
    const result = calculateTrustPoints(2, 'no_show');
    expect(result).toBe(0);
  });
});
```

#### Component Test Example

```typescript
// src/components/EventCard/__tests__/EventCard.test.tsx
import { render, screen } from '@testing-library/react';
import { EventCard } from '../EventCard';

describe('EventCard', () => {
  const mockEvent = {
    id: '1',
    title: 'Beach Cleanup',
    trackType: 'impact',
    startTime: new Date('2024-03-20'),
  };

  it('should render event title', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('Beach Cleanup')).toBeInTheDocument();
  });

  it('should show Impact track badge', () => {
    render(<EventCard event={mockEvent} />);
    expect(screen.getByText('Impact')).toBeInTheDocument();
  });
});
```

#### Property Test Example

```typescript
// src/utils/__tests__/transformers.property.test.ts
import { fc, test } from '@fast-check/vitest';
import { dbUserToUser, userToDbUser } from '../transformers';

describe('Transformer Properties', () => {
  test.prop([fc.record({
    id: fc.uuid(),
    display_name: fc.string(),
    trust_points: fc.integer({ min: 0, max: 100 }),
  })])('round-trip conversion preserves data', (dbUser) => {
    const user = dbUserToUser(dbUser);
    const backToDb = userToDbUser(user);
    
    expect(backToDb.display_name).toBe(dbUser.display_name);
    expect(backToDb.trust_points).toBe(dbUser.trust_points);
  });
});
```

### Test Best Practices

- Write tests for new features
- Test edge cases and error conditions
- Keep tests simple and focused
- Use descriptive test names
- Mock external dependencies (API calls)
- Clean up after tests (subscriptions, timers)

---

## Common Development Tasks

### Task 1: Add a New Component

1. Create component file:
```bash
mkdir src/components/MyComponent
touch src/components/MyComponent/MyComponent.tsx
touch src/components/MyComponent/index.ts
```

2. Write component:
```typescript
// MyComponent.tsx
import React from 'react';

interface MyComponentProps {
  title: string;
}

export const MyComponent: React.FC<MyComponentProps> = ({ title }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold">{title}</h2>
    </div>
  );
};
```

3. Export from index:
```typescript
// index.ts
export { MyComponent } from './MyComponent';
```

4. Write tests:
```typescript
// MyComponent.test.tsx
import { render, screen } from '@testing-library/react';
import { MyComponent } from './MyComponent';

describe('MyComponent', () => {
  it('should render title', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

### Task 2: Add a New Service Function

1. Open appropriate service file (e.g., `event.service.ts`)

2. Add function:
```typescript
export async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*, venue:venues(*)')
      .gte('start_time', new Date().toISOString())
      .order('start_time', { ascending: true });

    if (error) throw new DatabaseError('Failed to fetch events', 'network_error', error);

    return data.map(dbEventToEvent);
  } catch (error) {
    if (error instanceof DatabaseError) throw error;
    throw new DatabaseError('Unexpected error', 'network_error');
  }
}
```

3. Add types if needed in `types/models.ts`

4. Write tests:
```typescript
describe('getUpcomingEvents', () => {
  it('should return events after current date', async () => {
    const events = await getUpcomingEvents();
    events.forEach(event => {
      expect(event.startTime.getTime()).toBeGreaterThan(Date.now());
    });
  });
});
```

### Task 3: Add a New Custom Hook

1. Create hook file:
```typescript
// src/hooks/useUpcomingEvents.ts
import { useState, useEffect } from 'react';
import { Event } from '../types/models';
import { getUpcomingEvents } from '../services/event.service';

export function useUpcomingEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        const data = await getUpcomingEvents();
        setEvents(data);
        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  return { events, loading, error };
}
```

2. Export from `hooks/index.ts`:
```typescript
export { useUpcomingEvents } from './useUpcomingEvents';
```

3. Use in component:
```typescript
function MyComponent() {
  const { events, loading, error } = useUpcomingEvents();

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
```

### Task 4: Update Database Schema

1. Write migration SQL:
```sql
-- migrations/004_add_event_tags.sql
ALTER TABLE events
ADD COLUMN tags TEXT[];

CREATE INDEX idx_events_tags ON events USING GIN(tags);
```

2. Run in Supabase SQL Editor

3. Regenerate types:
```bash
supabase gen types typescript --project-id your-project-ref > src/types/database.types.ts
```

4. Update application types in `types/models.ts`:
```typescript
export interface Event {
  // ... existing fields
  tags?: string[];
}
```

5. Update transformers if needed

### Task 5: Debug an Issue

1. **Check browser console** for errors

2. **Check Supabase logs**:
   - Go to Supabase dashboard → **Logs**
   - Filter by error level

3. **Add console logs**:
```typescript
console.log('Debug: user data', user);
console.error('Error fetching events', error);
```

4. **Use React DevTools**:
   - Install React DevTools extension
   - Inspect component state and props

5. **Check network requests**:
   - Open browser DevTools → Network tab
   - Look for failed requests
   - Check request/response data

6. **Verify RLS policies**:
   - Test queries in Supabase SQL Editor
   - Check if auth.uid() is set correctly

---

## Troubleshooting

### Common Issues

#### Issue: "Missing Supabase environment variables"

**Cause**: `.env` file not configured

**Solution**:
1. Ensure `.env` file exists
2. Check variable names: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. Restart development server

#### Issue: "Permission denied" errors

**Cause**: RLS policies blocking access

**Solution**:
1. Check if user is authenticated
2. Verify RLS policies in Supabase dashboard
3. Test query in SQL Editor with auth context

#### Issue: Types don't match database

**Cause**: Database schema changed but types not regenerated

**Solution**:
```bash
supabase gen types typescript --project-id your-project-ref > src/types/database.types.ts
```

#### Issue: Real-time not working

**Cause**: Replication not enabled

**Solution**:
1. Go to Supabase dashboard → **Database** → **Replication**
2. Enable replication for the table
3. Select which operations (INSERT, UPDATE, DELETE)

#### Issue: Tests failing

**Cause**: Various reasons

**Solution**:
1. Check error message
2. Ensure test database is set up
3. Clear test cache: `npm test -- --clearCache`
4. Check for async issues (missing `await`)

#### Issue: Slow queries

**Cause**: Missing indexes or inefficient queries

**Solution**:
1. Check query in Supabase SQL Editor
2. Use `EXPLAIN ANALYZE` to see query plan
3. Add indexes if needed
4. Optimize query (select specific columns, add filters)

### Getting Help

1. **Check documentation**:
   - This guide
   - [Supabase Docs](https://supabase.com/docs)
   - [React Docs](https://react.dev)

2. **Search existing issues**:
   - GitHub repository issues
   - Supabase GitHub issues

3. **Ask the team**:
   - Team chat/Slack
   - Code review comments
   - Pair programming session

4. **Community resources**:
   - Supabase Discord
   - Stack Overflow
   - React community forums

---

## Best Practices

### Code Style

- Use TypeScript for all new code
- Follow ESLint rules (run `npm run lint`)
- Format with Prettier (run `npm run format`)
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### React Best Practices

- Use functional components with hooks
- Avoid prop drilling (use Context for global state)
- Memoize expensive computations (`useMemo`)
- Memoize callbacks (`useCallback`)
- Clean up effects (return cleanup function)
- Handle loading and error states

### Supabase Best Practices

- Always use parameterized queries (Supabase does this automatically)
- Handle errors gracefully
- Use specific column selection (not `SELECT *`)
- Implement pagination for large datasets
- Clean up real-time subscriptions
- Test RLS policies thoroughly

### Security Best Practices

- Never expose `service_role` key to frontend
- Always use RLS policies
- Validate user input
- Sanitize data before display
- Use HTTPS in production
- Keep dependencies updated

### Performance Best Practices

- Lazy load components when possible
- Implement pagination for lists
- Cache frequently accessed data
- Optimize images
- Use React.memo for expensive components
- Debounce search inputs

### Git Best Practices

- Commit often with clear messages
- Keep commits focused (one feature/fix per commit)
- Pull before pushing
- Review your own changes before committing
- Don't commit sensitive data
- Use `.gitignore` properly

---

## Resources

### Documentation

- **Project Docs**:
  - [Requirements](.kiro/specs/supabase-integration/requirements.md)
  - [Design Document](.kiro/specs/supabase-integration/design.md)
  - [Tasks](.kiro/specs/supabase-integration/tasks.md)
  - [Deployment Guide](.kiro/specs/supabase-integration/DEPLOYMENT.md)

- **External Docs**:
  - [Supabase Documentation](https://supabase.com/docs)
  - [React Documentation](https://react.dev)
  - [TypeScript Handbook](https://www.typescriptlang.org/docs/)
  - [Tailwind CSS Docs](https://tailwindcss.com/docs)

### Learning Resources

- **Supabase**:
  - [Supabase YouTube Channel](https://www.youtube.com/@Supabase)
  - [Supabase Examples](https://github.com/supabase/supabase/tree/master/examples)

- **React**:
  - [React Tutorial](https://react.dev/learn)
  - [React Hooks Guide](https://react.dev/reference/react)

- **TypeScript**:
  - [TypeScript for React Developers](https://www.typescriptlang.org/docs/handbook/react.html)

### Tools

- **VS Code**: [code.visualstudio.com](https://code.visualstudio.com/)
- **Supabase CLI**: [supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli)
- **React DevTools**: Browser extension for debugging React
- **Postman**: API testing tool

### Community

- **Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)
- **React Community**: [react.dev/community](https://react.dev/community)
- **Stack Overflow**: Tag questions with `supabase`, `reactjs`, `typescript`

---

## Next Steps

Now that you're set up:

1. **Explore the codebase**: Browse through components and services
2. **Run the app**: Start the dev server and click around
3. **Pick a task**: Check the project board for beginner-friendly issues
4. **Ask questions**: Don't hesitate to ask the team for help
5. **Make your first contribution**: Start with a small bug fix or documentation update

Welcome to the team! 🎉

---

**Last Updated**: [Current Date]
**Maintained By**: [Team Name]
**Questions?**: Contact [Team Lead Email]

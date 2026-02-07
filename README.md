# CommuniTree

CommuniTree is a dual-track community engagement platform that connects users with their local community through two distinct pathways:

- **Impact Track**: Community service focused on NGO partnerships and volunteering opportunities
- **Grow Track**: Local entertainment focused on hobby-based meetups and social events

## Features

- Dual-track system for volunteering and entertainment activities
- Trust points gamification system (0-100 scale)
- NGO verification through Darpan ID validation
- Color-coded venue safety rating system
- Universal chat support for coordination
- RSVP system with trust point implications

## Technology Stack

- **Frontend**: React with TypeScript
- **Backend**: Supabase (PostgreSQL database, authentication, real-time)
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API + useReducer
- **Utilities**: date-fns, clsx
- **Development**: ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Supabase account (free tier available at [supabase.com](https://supabase.com))
- Supabase CLI (optional, for local development)

### Supabase Project Setup

#### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up or log in
2. Click "New Project" in your organization
3. Fill in the project details:
   - **Name**: CommuniTree (or your preferred name)
   - **Database Password**: Choose a strong password (save this securely)
   - **Region**: Select the region closest to your users
   - **Pricing Plan**: Free tier is sufficient for development
4. Click "Create new project" and wait for setup to complete (1-2 minutes)

#### 2. Get Your Project Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (under "Project URL")
   - **anon public** key (under "Project API keys")

#### 3. Configure Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your Supabase credentials:
   ```env
   VITE_SUPABASE_URL=your_project_url_here
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

   **Important**: Never commit the `.env` file to version control. It's already in `.gitignore`.

#### 4. Run Database Migrations

You need to set up the database schema by running the migration scripts in order:

1. In your Supabase project dashboard, go to **SQL Editor**
2. Run the migration files in this order:
   - `.kiro/specs/supabase-integration/migrations/001_create_tables.sql`
   - `.kiro/specs/supabase-integration/migrations/002_create_functions.sql`
   - `.kiro/specs/supabase-integration/migrations/003_create_rls_policies.sql`

3. For each file:
   - Copy the SQL content
   - Paste into the SQL Editor
   - Click "Run" to execute
   - Verify no errors appear

**Alternative: Using Supabase CLI**

If you have the Supabase CLI installed:

```bash
# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

#### 5. Seed Development Data (Optional)

To populate your database with sample data for testing:

1. Go to **SQL Editor** in your Supabase dashboard
2. Open and run `.kiro/specs/supabase-integration/migrations/seed_data.sql`
3. This creates sample users, NGOs, events, venues, and chat data

**Note**: Seed data is for development only. Skip this step in production.

#### 6. Verify Setup

1. In Supabase dashboard, go to **Table Editor**
2. You should see all tables: `users`, `ngos`, `events`, `venues`, `rsvps`, `chat_threads`, `chat_messages`, `trust_points_history`
3. If you ran seed data, tables should contain sample records

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd CommuniTree
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see Supabase Project Setup above)

4. Verify Supabase connection:
   ```bash
   npm start
   ```
   
   The app should start without errors. Check the browser console for any Supabase connection issues.

### Development

Start the development server:
```bash
npm start
```

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Create production build
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix auto-fixable lint issues
- `npm run format` - Format code with Prettier

### Database Management

#### Resetting Development Database

To reset your development database to a clean state with seed data:

1. Go to Supabase dashboard → **SQL Editor**
2. Run `.kiro/specs/supabase-integration/migrations/reset_database.sql`
3. This will truncate all tables and re-run seed data

**Warning**: This deletes all data. Only use in development.

#### Generating TypeScript Types

After making database schema changes, regenerate TypeScript types:

```bash
# Using Supabase CLI
supabase gen types typescript --project-id your-project-ref > src/types/database.types.ts
```

This ensures your TypeScript types match your database schema.

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── types/          # TypeScript interfaces
│   ├── database.types.ts  # Auto-generated from Supabase schema
│   └── models.ts          # Application data models
├── utils/          # Utility functions
│   ├── transformers.ts    # Database ↔ App type conversions
│   └── errors.ts          # Custom error classes
├── services/       # Data access layer
│   ├── auth.service.ts    # Authentication operations
│   ├── user.service.ts    # User CRUD operations
│   ├── ngo.service.ts     # NGO operations
│   ├── event.service.ts   # Event operations
│   ├── rsvp.service.ts    # RSVP operations
│   ├── chat.service.ts    # Chat operations
│   └── venue.service.ts   # Venue operations
├── lib/            # Third-party integrations
│   └── supabase.ts        # Supabase client configuration
├── context/        # React Context providers
├── App.tsx         # Root component
└── index.tsx       # Application entry point

.kiro/specs/supabase-integration/
├── requirements.md         # Feature requirements
├── design.md              # Technical design
├── tasks.md               # Implementation tasks
└── migrations/            # Database migration scripts
    ├── 001_create_tables.sql
    ├── 002_create_functions.sql
    ├── 003_create_rls_policies.sql
    ├── seed_data.sql
    └── reset_database.sql
```

## Development Guidelines

- Mobile-first responsive design
- TypeScript strict mode enabled
- Component-based architecture
- Utility-first CSS with Tailwind
- Custom color schemes for Impact (emerald) and Grow (amber) tracks

### Authentication Flow

The app uses Supabase Auth with email/password:

1. Users sign up with email, password, and display name
2. Supabase creates auth record and triggers user profile creation
3. Session persists across page refreshes
4. Protected routes redirect unauthenticated users to login

### Data Access Patterns

- **Services Layer**: All database operations go through service functions
- **Type Safety**: Database types auto-generated, transformed to app types
- **Error Handling**: Custom error classes for auth, database, and validation errors
- **Real-time**: Chat uses Supabase real-time subscriptions
- **Security**: Row Level Security (RLS) policies enforce data access rules

### Testing

Run the test suite:

```bash
npm test
```

Test categories:
- **Unit tests**: Individual functions and components
- **Property tests**: Universal correctness properties
- **Integration tests**: End-to-end flows with database

## Troubleshooting

### Common Issues

**"Missing Supabase environment variables" error**
- Ensure `.env` file exists with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart the development server after adding environment variables

**"Permission denied" errors in app**
- Check that RLS policies are correctly applied (run `003_create_rls_policies.sql`)
- Verify you're authenticated (check browser console for auth state)

**Database connection fails**
- Verify Supabase project is active (not paused)
- Check Project URL and API key are correct in `.env`
- Ensure no typos in environment variable names

**Types don't match database schema**
- Regenerate types: `supabase gen types typescript --project-id your-project-ref > src/types/database.types.ts`
- Restart TypeScript server in your IDE

**Real-time subscriptions not working**
- Check that Realtime is enabled in Supabase dashboard → **Database** → **Replication**
- Verify the table has replication enabled for the specific operation (INSERT, UPDATE, DELETE)

For more help, see:
- [Supabase Documentation](https://supabase.com/docs)
- [Project Design Document](.kiro/specs/supabase-integration/design.md)
- [Implementation Tasks](.kiro/specs/supabase-integration/tasks.md)

## License

This project is private and proprietary.
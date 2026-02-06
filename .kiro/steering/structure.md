# Project Structure & Organization

## Directory Structure

```
CommuniTree/
├── .kiro/                          # Kiro specification files
│   ├── specs/communitree/          # Feature specifications
│   └── steering/                   # Project guidance documents
├── src/
│   ├── components/                 # React components (PascalCase)
│   │   ├── Layout/                 # App layout and navigation
│   │   ├── TrackToggle/           # Impact/Grow track switcher
│   │   ├── NGOCard/               # NGO display components
│   │   ├── EventCard/             # Event display components
│   │   ├── ChatModal/             # Messaging interface
│   │   └── UserProfile/           # User account components
│   ├── hooks/                      # Custom React hooks (camelCase)
│   │   ├── useAppState.ts         # Global state access
│   │   ├── useUser.ts             # User-specific state
│   │   ├── useCurrentTrack.ts     # Track switching logic
│   │   └── useTrustPoints.ts      # Trust points management
│   ├── types/                      # TypeScript interfaces (PascalCase)
│   │   ├── User.ts                # User data model
│   │   ├── NGO.ts                 # NGO data model
│   │   ├── Event.ts               # Event data model
│   │   ├── ChatThread.ts          # Chat data model
│   │   └── AppState.ts            # Global state types
│   ├── utils/                      # Utility functions (camelCase)
│   │   ├── trustPoints.ts         # Trust point calculations
│   │   ├── venueRating.ts         # Safety rating logic
│   │   └── validation.ts          # Input validation
│   ├── context/                    # React Context providers
│   │   └── AppContext.tsx         # Global state context
│   ├── App.tsx                     # Root component
│   └── index.tsx                   # Application entry point
├── public/                         # Static assets
├── package.json                    # Dependencies and scripts
├── tsconfig.json                   # TypeScript configuration
├── tailwind.config.js              # Tailwind CSS configuration
└── README.md                       # Project documentation
```

## Component Architecture

### Hierarchical Organization
- **App** → **Layout** → **MainContent** + **Navigation** + **ChatSystem**
- **MainContent** → **TrackToggle** + **FeedContainer**
- **FeedContainer** → **ImpactTrack** | **GrowTrack**

### Component Naming Conventions
- **Components**: PascalCase (e.g., `NGOCard`, `EventCard`, `TrackToggle`)
- **Files**: Match component name with `.tsx` extension
- **Hooks**: camelCase starting with `use` (e.g., `useAppState`)
- **Types**: PascalCase interfaces (e.g., `User`, `NGO`, `Event`)
- **Utils**: camelCase functions (e.g., `calculateTrustPoints`)

## State Management Pattern

### Global State (React Context)
- **AppContext**: Centralized state management
- **useReducer**: Action-based state updates
- **Custom Hooks**: Specialized state access patterns

### State Organization
```typescript
AppState {
  user: User | null
  currentTrack: 'impact' | 'grow'
  ngos: NGO[]
  events: Event[]
  chatThreads: ChatThread[]
}
```

## Data Model Conventions

### Core Interfaces
- **User**: Authentication, trust points, verification status
- **NGO**: Organization details, Darpan ID verification
- **Event**: Activity details, venue safety ratings
- **Venue**: Location data with safety classifications
- **ChatThread**: Messaging between users and organizations

### ID Patterns
- **User IDs**: UUID format
- **NGO IDs**: Alphanumeric with prefix (e.g., `ngo_123`)
- **Event IDs**: Alphanumeric with prefix (e.g., `evt_456`)
- **Darpan IDs**: 5-digit numeric validation

## Responsive Design Structure

### Breakpoint Strategy
- **Mobile First**: Base styles for mobile devices
- **Desktop Enhancement**: Progressive enhancement for larger screens
- **Navigation**: Bottom bar (mobile) → Sidebar (desktop)

### Layout Patterns
- **Mobile**: Full-width content, bottom navigation
- **Desktop**: Sidebar navigation, main content area
- **Responsive Components**: Conditional rendering based on screen size

## File Organization Rules

1. **One component per file** with matching filename
2. **Index files** for clean imports from directories
3. **Co-located tests** using `.test.tsx` suffix
4. **Barrel exports** from directory index files
5. **Absolute imports** using path aliases for `src/` directories
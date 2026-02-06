# Technology Stack & Build System

## Frontend Stack

- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS (utility-first approach)
- **Icons**: Lucide React for consistent iconography
- **State Management**: React Context API + useReducer pattern
- **Utilities**: 
  - `date-fns` for date handling
  - `clsx` for conditional CSS classes

## Development Tools

- **Linting**: ESLint for code quality
- **Formatting**: Prettier for consistent code style
- **Build System**: Vite or Create React App (to be configured)
- **Package Manager**: npm or yarn

## Data Persistence

- **Database**: External database storage (PostgreSQL, MongoDB, or similar)
- **Backend API**: RESTful API or GraphQL for data operations
- **Authentication**: JWT tokens or session-based authentication
- **Development**: Mock API endpoints for local development

## Common Commands

```bash
# Project setup
npm install                 # Install dependencies
npm run dev                # Start development server
npm run build              # Create production build
npm run preview            # Preview production build

# Code quality
npm run lint               # Run ESLint
npm run lint:fix           # Fix auto-fixable lint issues
npm run format             # Format code with Prettier

# Testing
npm test                   # Run test suite
npm run test:watch         # Run tests in watch mode
npm run test:coverage      # Generate coverage report
```

## TypeScript Configuration

- Strict mode enabled for type safety
- Path aliases for clean imports
- Component prop types required
- Interface-first approach for data models

## Tailwind CSS Setup

- Mobile-first responsive design
- Custom color scheme:
  - Impact Track: Deep emerald tones
  - Grow Track: Bright amber tones
- Utility classes for rapid development
- Component-based styling patterns

## Build Optimization

- Tree shaking for smaller bundles
- Code splitting for lazy loading
- Asset optimization for web performance
- TypeScript compilation for production builds
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
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **State Management**: React Context API + useReducer
- **Utilities**: date-fns, clsx
- **Development**: ESLint, Prettier

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

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

## Project Structure

```
src/
├── components/     # React components
├── hooks/          # Custom React hooks
├── types/          # TypeScript interfaces
├── utils/          # Utility functions
├── context/        # React Context providers
├── App.tsx         # Root component
└── index.tsx       # Application entry point
```

## Development Guidelines

- Mobile-first responsive design
- TypeScript strict mode enabled
- Component-based architecture
- Utility-first CSS with Tailwind
- Custom color schemes for Impact (emerald) and Grow (amber) tracks

## License

This project is private and proprietary.
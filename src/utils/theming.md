# Track-Based Color Theming System

## Overview

The CommuniTree platform implements a dynamic track-based theming system that automatically switches between deep emerald colors for the Impact track and bright amber colors for the Grow track. This system provides consistent visual identity across all components while maintaining excellent user experience.

## Architecture

### CSS Custom Properties

The theming system uses CSS custom properties (CSS variables) to enable dynamic color switching:

```css
:root {
  /* Default Impact track colors */
  --track-primary-600: #059669;
  --track-primary-100: #d1fae5;
  /* ... other color variants */
  
  /* Semantic mappings */
  --track-primary: var(--track-primary-600);
  --track-accent: var(--track-primary-500);
  --track-text: var(--track-primary-800);
  --track-bg: var(--track-primary-50);
}

/* Grow track overrides */
[data-track="grow"] {
  --track-primary-600: #d97706;
  --track-primary-100: #fef3c7;
  /* ... other color variants */
}
```

### Utility Classes

Pre-built utility classes for common theming patterns:

- `.track-primary` - Primary text color
- `.track-primary-bg` - Primary background color
- `.track-text` - Main text color
- `.track-bg` - Background color
- `.track-border` - Border color
- `.track-button` - Styled button with track colors
- `.track-card` - Themed card component
- `.track-badge` - Themed badge component

## Usage

### 1. Using the useTheme Hook

```typescript
import { useTheme } from '../hooks';

const MyComponent = () => {
  const { currentTrack, themeConfig, switchTheme, isImpactTrack } = useTheme();
  
  return (
    <div className="track-card">
      <h2 className="track-text">{themeConfig.name} Track</h2>
      <p className="track-text-light">{themeConfig.description}</p>
      <button 
        className="track-button"
        onClick={() => switchTheme(isImpactTrack ? 'grow' : 'impact')}
      >
        Switch Track
      </button>
    </div>
  );
};
```

### 2. Using Utility Functions

```typescript
import { 
  applyTrackTheme, 
  getTrackThemeConfig, 
  switchTrackTheme 
} from '../utils/theming';

// Apply theme programmatically
applyTrackTheme('grow');

// Get theme configuration
const config = getTrackThemeConfig('impact');
console.log(config.primaryColor); // '#059669'

// Switch theme with persistence
switchTrackTheme('grow');
```

### 3. Using CSS Classes

```jsx
// Basic theming
<div className="track-card">
  <h3 className="track-text">Title</h3>
  <p className="track-text-light">Description</p>
  <button className="track-button">Action</button>
  <span className="track-badge">Badge</span>
</div>

// Custom combinations
<div className="track-bg border track-border rounded-lg p-4">
  <div className="track-primary-bg text-white p-2 rounded">
    Primary colored section
  </div>
</div>
```

## Theme Configuration

### Impact Track (Deep Emerald)
- **Primary**: #059669 (emerald-600)
- **Accent**: #10b981 (emerald-500)
- **Text**: #065f46 (emerald-800)
- **Background**: #ecfdf5 (emerald-50)
- **Description**: "Community Service & NGO Partnerships"

### Grow Track (Bright Amber)
- **Primary**: #d97706 (amber-600)
- **Accent**: #f59e0b (amber-500)
- **Text**: #92400e (amber-800)
- **Background**: #fffbeb (amber-50)
- **Description**: "Local Entertainment & Social Events"

## Component Integration

### Automatic Theme Application

Components using the theming system automatically respond to track changes:

```typescript
// TrackToggleContainer automatically applies themes
const TrackToggleContainer = () => {
  const { currentTrack, switchTheme } = useTheme();
  
  // Theme is automatically applied when track changes
  return <TrackToggle currentTrack={currentTrack} onTrackChange={switchTheme} />;
};
```

### Layout Integration

The Layout component displays track indicators with appropriate theming:

```typescript
const Layout = ({ children }) => {
  const { isImpactTrack, themeConfig } = useTheme();
  
  return (
    <div>
      <header>
        <div className={`badge ${isImpactTrack ? 'bg-impact-100 text-impact-800' : 'bg-grow-100 text-grow-800'}`}>
          {themeConfig.name} Track
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
};
```

## Persistence

The theming system automatically persists the selected track to localStorage:

- **Key**: `communitree_last_track`
- **Values**: `'impact'` | `'grow'`
- **Initialization**: Reads from localStorage on app startup
- **Updates**: Automatically saved when track changes

## Best Practices

### 1. Use Semantic Classes
Prefer semantic utility classes over direct color references:

```css
/* Good */
.my-component {
  @apply track-primary-bg track-text;
}

/* Avoid */
.my-component {
  background-color: #059669;
  color: #065f46;
}
```

### 2. Leverage CSS Custom Properties
For complex styling, use CSS custom properties:

```css
.custom-gradient {
  background: linear-gradient(135deg, var(--track-primary), var(--track-accent));
}
```

### 3. Test Both Themes
Always test components with both Impact and Grow themes to ensure proper contrast and readability.

### 4. Use the useTheme Hook
For React components, use the `useTheme` hook for theme-aware logic:

```typescript
const { isImpactTrack, themeConfig } = useTheme();

const iconColor = isImpactTrack ? 'text-impact-600' : 'text-grow-600';
```

## Accessibility

The theming system maintains WCAG AA contrast ratios:

- **Text on Background**: High contrast ratios (>4.5:1)
- **Interactive Elements**: Clear focus states with track colors
- **Color Independence**: Information not conveyed by color alone

## Performance

- **CSS Variables**: Efficient runtime theme switching
- **No JavaScript Recalculation**: Pure CSS-based color changes
- **Minimal Bundle Impact**: Utility classes are tree-shaken
- **Cached Persistence**: localStorage prevents unnecessary re-initialization

## Troubleshooting

### Theme Not Applying
1. Check if `data-track` attribute is set on `document.documentElement`
2. Verify CSS custom properties are loaded
3. Ensure component is wrapped in AppProvider

### Colors Not Updating
1. Confirm `useTheme` hook is being used
2. Check if CSS classes are properly applied
3. Verify Tailwind CSS is processing the custom colors

### Persistence Issues
1. Check localStorage availability
2. Verify `communitree_last_track` key exists
3. Ensure theme initialization runs on app startup
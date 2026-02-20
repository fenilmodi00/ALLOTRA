# Project Structure & Architecture

## Root Structure

```
ipo-app/
├── src/                    # Main source code
├── assets/                 # Static assets (icons, images)
├── App.tsx                 # Root component
├── index.ts                # Entry point
├── app.json                # Expo configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
├── babel.config.js         # Babel configuration
└── gluestack.config.ts     # Design system configuration
```

## Source Code Organization (`src/`)

### Component Architecture
```
src/components/
├── common/                 # Reusable UI components
│   ├── AppNavigator.tsx    # Main navigation setup
│   ├── BottomNavigation.tsx # Tab bar component
│   ├── CheckButton.tsx     # Custom button variants
│   ├── IPOFilterNav.tsx    # Filter navigation
│   ├── PANInput.tsx        # PAN number input
│   ├── PillButton.tsx      # Pill-style buttons
│   ├── ResultCard.tsx      # Result display cards
│   └── TabBar.tsx          # Custom tab bar
├── home/                   # Home screen components
├── ipo/                    # IPO-specific components
├── ui/                     # Base UI components
└── debug/                  # Development utilities
```

### Screen Components
```
src/screens/
├── HomeScreen.tsx          # Main dashboard
├── IPODetailsScreen.tsx    # Individual IPO details
├── CheckScreen.tsx         # Allotment checking
├── SearchScreen.tsx        # Search functionality
├── InvestmentsScreen.tsx   # User investments
└── ProfileScreen.tsx       # User profile
```

### Business Logic Layer
```
src/hooks/                  # Custom React hooks
├── useIPOData.ts          # IPO data fetching
├── useStockData.ts        # Stock market data
├── useIPOFiltering.ts     # IPO filtering logic
├── useAppInitialization.ts # App startup logic
└── useDynamicSpacing.ts   # UI spacing utilities
```

### Data Layer
```
src/services/              # API service layer
├── api.ts                 # Base API client
├── ipoService.ts          # IPO-related endpoints
└── stockService.ts        # Stock market endpoints

src/store/                 # State management
└── useIPOStore.ts         # Zustand store for IPO data

src/types/                 # TypeScript definitions
├── ipo.types.ts           # IPO data models
├── navigation.types.ts    # Navigation types
└── index.ts               # Type exports
```

### Utilities & Configuration
```
src/utils/                 # Utility functions
├── dataTransformers.ts    # Backend-to-frontend mapping
├── formatters.ts          # Data formatting utilities
└── validators.ts          # Input validation

src/config/                # Configuration
├── environment.ts         # Environment-specific config
└── index.ts               # Config exports

src/design-system/         # Design system
├── tokens/                # Design tokens (colors, spacing, typography)
├── themes/                # Theme configurations
└── components/            # Styled components
```

## Architecture Patterns

### Clean Architecture Layers
1. **Presentation Layer**: Screens and UI components
2. **Business Logic Layer**: Custom hooks and utilities
3. **Data Layer**: Services, stores, and API clients
4. **Infrastructure Layer**: Configuration and external dependencies

### Data Flow Pattern
```
Screen Component → Custom Hook → Service Layer → API Client → Backend
     ↓              ↓              ↓              ↓
State Update ← Store Update ← Data Transform ← API Response
```

### Component Patterns
- **Container/Presentational**: Screens handle logic, components handle UI
- **Custom Hooks**: Business logic abstraction from components
- **Service Layer**: API abstraction with error handling
- **State Management**: Zustand for global state, local state for UI

## File Naming Conventions

### Components
- **PascalCase**: `ComponentName.tsx`
- **Descriptive Names**: `IPOFilterNav.tsx`, `MarketIndicesSection.tsx`
- **Screen Suffix**: `HomeScreen.tsx`, `IPODetailsScreen.tsx`

### Hooks
- **camelCase with use prefix**: `useIPOData.ts`, `useStockData.ts`
- **Descriptive Purpose**: `useAppInitialization.ts`

### Services
- **camelCase with Service suffix**: `ipoService.ts`, `stockService.ts`
- **Domain-based**: Group by business domain

### Types
- **camelCase with .types suffix**: `ipo.types.ts`, `navigation.types.ts`
- **Domain-specific**: Organize by feature area

## Import/Export Patterns

### Barrel Exports
Each major directory has an `index.ts` file for clean imports:
```typescript
// src/components/index.ts
export * from './common'
export * from './home'
export * from './ipo'

// Usage
import { IPOCard, HomeHeader } from '@/components'
```

### Relative vs Absolute Imports
- **Relative**: For same-directory or nearby files
- **Absolute**: For cross-domain imports (use path aliases if configured)

## Development Guidelines

### Component Structure
1. **Imports**: External libraries first, then internal modules
2. **Types**: Interface definitions before component
3. **Component**: Main component function
4. **Styles**: Styled components or style objects at bottom
5. **Export**: Default export for main component

### Hook Structure
1. **Dependencies**: Import required hooks and services
2. **State**: Local state declarations
3. **Effects**: useEffect hooks for side effects
4. **Handlers**: Event handler functions
5. **Return**: Object with data, loading, error, and actions

### Service Structure
1. **Types**: Request/response type definitions
2. **Constants**: Endpoint URLs and configuration
3. **Functions**: Individual API call functions
4. **Error Handling**: Consistent error transformation
5. **Export**: Named exports for all functions

This structure promotes maintainability, testability, and clear separation of concerns while following React Native and Expo best practices.
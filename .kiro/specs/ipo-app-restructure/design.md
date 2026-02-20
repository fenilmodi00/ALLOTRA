# Design Document: IPO App Restructure

## Overview

This design outlines the complete restructuring of the IPO app to follow modern React Native best practices, improve maintainability, and create a clean architecture that junior developers can easily understand and work with. The restructure will consolidate duplicate folders, implement proper separation of concerns, modernize the component library, and establish a scalable project structure.

## Architecture

### Current State Analysis

The current architecture has several critical issues:
- Duplicate folder structures (`components/` and `src/components/`)
- Mixed concerns (business logic in UI components)
- Inconsistent file organization
- Heavy component library (Gluestack UI) with performance implications
- Debug code mixed with production code
- Poor separation between features

### Target Architecture

```
src/
├── design-system/           # Design tokens and base components
│   ├── tokens/             # Colors, spacing, typography
│   ├── components/         # Base styled components
│   └── themes/             # Theme configurations
├── components/             # Feature components
│   ├── ui/                # Reusable UI components
│   ├── common/            # Shared business components
│   ├── home/              # Home feature components
│   └── ipo/               # IPO feature components
├── screens/               # Navigation screens
├── services/              # API and business logic
├── hooks/                 # Custom React hooks
├── store/                 # State management (Zustand)
├── types/                 # TypeScript definitions
├── utils/                 # Pure utility functions
├── config/                # App configuration
└── __tests__/             # Test files mirroring src structure
```

## Components and Interfaces

### Design System Architecture

#### Design Tokens Structure
```typescript
// src/design-system/tokens/colors.ts
export const colors = {
  primary: {
    50: '#eef0ff',
    500: '#4e5acc',
    900: '#3a44a0',
  },
  semantic: {
    success: '#00b386',
    error: '#f35d5d',
    warning: '#ffb900',
  },
  neutral: {
    0: '#ffffff',
    100: '#f5f5f5',
    900: '#000000',
  }
} as const;

// src/design-system/tokens/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;
```

#### Component Library Migration Strategy

**Phase 1: Prepare New System**
1. Install NativeWind and Tamagui
2. Create design token system
3. Build base components (Button, Input, Card)

**Phase 2: Gradual Migration**
1. Replace components screen by screen
2. Update styling to use new system
3. Remove Gluestack dependencies

**Phase 3: Optimization**
1. Remove unused Gluestack code
2. Optimize bundle size
3. Update documentation

### File Organization Strategy

#### Component Organization
```typescript
// src/components/ui/Button/index.tsx - Base UI component
export interface ButtonProps {
  variant: 'primary' | 'secondary' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onPress?: () => void;
}

// src/components/ipo/IPOCard/index.tsx - Feature component
export interface IPOCardProps {
  ipo: DisplayIPO;
  onPress?: () => void;
  onCheckStatus?: () => void;
}

// src/components/common/LoadingState/index.tsx - Shared component
export interface LoadingStateProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
}
```

#### Service Layer Architecture
```typescript
// src/services/api/client.ts - Base API client
export class APIClient {
  private baseURL: string;
  private timeout: number;
  
  async request<T>(endpoint: string, options?: RequestOptions): Promise<APIResponse<T>>;
}

// src/services/ipo/ipoService.ts - Feature-specific service
export class IPOService {
  constructor(private apiClient: APIClient) {}
  
  async getIPOs(filters?: IPOFilters): Promise<IPO[]>;
  async getIPODetails(id: string): Promise<IPODetails>;
}
```

## Data Models

### File Structure Models

#### Directory Structure
```typescript
interface DirectoryStructure {
  src: {
    'design-system': DesignSystemStructure;
    components: ComponentStructure;
    screens: ScreenStructure;
    services: ServiceStructure;
    hooks: HookStructure;
    store: StoreStructure;
    types: TypeStructure;
    utils: UtilStructure;
    config: ConfigStructure;
    __tests__: TestStructure;
  };
}

interface ComponentStructure {
  ui: UIComponent[];
  common: CommonComponent[];
  home: HomeComponent[];
  ipo: IPOComponent[];
}
```

#### Migration Mapping
```typescript
interface MigrationMapping {
  source: string;
  destination: string;
  updateImports: string[];
  dependencies: string[];
}

// Example mappings
const componentMigrations: MigrationMapping[] = [
  {
    source: 'components/common/IPOCard.tsx',
    destination: 'src/components/ipo/IPOCard/index.tsx',
    updateImports: ['screens/HomeScreen.tsx', 'components/stocks/IPOSection.tsx'],
    dependencies: ['src/types/ipo.types.ts', 'src/design-system/components/Card.tsx']
  }
];
```

### Design System Models

#### Theme Configuration
```typescript
interface ThemeConfig {
  colors: ColorTokens;
  spacing: SpacingTokens;
  typography: TypographyTokens;
  shadows: ShadowTokens;
  borderRadius: BorderRadiusTokens;
}

interface ComponentTheme {
  Button: ButtonTheme;
  Input: InputTheme;
  Card: CardTheme;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Based on the prework analysis, here are the testable correctness properties for the IPO app restructure:

### File System Structure Properties

**Property 1: Single source directory**
*For any* project scan, there should be exactly one `src/` directory containing all source code files
**Validates: Requirements 1.1, 2.1**

**Property 2: No duplicate files after consolidation**
*For any* pair of files in the project, they should not have identical names and similar content in different locations
**Validates: Requirements 1.4, 6.4**

**Property 3: Component migration completeness**
*For any* component file that existed in the root `components/` directory, it should now exist in `src/components/` with updated imports
**Validates: Requirements 1.3**

**Property 4: Import path correctness**
*For any* import statement in the codebase, it should resolve to an existing file without errors
**Validates: Requirements 1.5, 7.1, 7.2, 7.3**

### Directory Organization Properties

**Property 5: Required directory structure**
*For any* major feature area (components, screens, services, hooks, types, utils, config), the corresponding directory should exist under `src/`
**Validates: Requirements 2.2, 2.3, 2.4**

**Property 6: File type organization**
*For any* file type (screens, hooks, services, utilities), all files of that type should be located in their designated directory
**Validates: Requirements 3.1, 3.2, 3.3**

**Property 7: Component feature organization**
*For any* component file, it should be organized into the appropriate feature directory (ui, common, home, ipo)
**Validates: Requirements 4.4**

**Property 8: Index file availability**
*For any* major component directory, an index file should exist to enable clean imports
**Validates: Requirements 4.5, 8.1**

### Test Organization Properties

**Property 9: Test directory mirroring**
*For any* source directory structure, there should be a corresponding test directory structure under `__tests__/`
**Validates: Requirements 5.1**

**Property 10: Test file organization**
*For any* test file, it should be located in the appropriate test directory and follow the naming convention `*.test.ts` or `*.test.tsx`
**Validates: Requirements 5.2, 5.4**

**Property 11: No empty test directories**
*For any* directory in the test structure, it should either contain test files or not exist
**Validates: Requirements 5.3**

### Code Quality Properties

**Property 12: Root directory cleanliness**
*For any* file in the root directory, it should be an essential configuration file (package.json, tsconfig.json, etc.)
**Validates: Requirements 6.1**

**Property 13: Build script functionality**
*For any* npm script defined in package.json, it should execute successfully with the new structure
**Validates: Requirements 6.5, 7.5**

**Property 14: Import depth limitation**
*For any* import statement, it should not exceed a reasonable depth (e.g., 3 levels) from the importing file
**Validates: Requirements 8.4**

### Design System Properties

**Property 15: Design token organization**
*For any* design token (colors, spacing, typography), it should be located in the design system tokens directory
**Validates: Requirements 10.2, 11.2**

**Property 16: Theme configuration completeness**
*For any* theme mode (light, dark), there should be complete theme configuration available
**Validates: Requirements 10.5**

**Property 17: Base component architecture**
*For any* base component in the design system, it should extend the chosen component library and have proper TypeScript interfaces
**Validates: Requirements 11.4, 11.5**

### Naming Convention Properties

**Property 18: Component file naming**
*For any* React component file, it should follow PascalCase naming convention
**Validates: Requirements 12.1**

**Property 19: Utility and service file naming**
*For any* utility or service file, it should follow camelCase naming convention
**Validates: Requirements 12.2**

**Property 20: Directory naming consistency**
*For any* directory name, it should follow kebab-case convention where appropriate
**Validates: Requirements 12.3**

**Property 21: File extension consistency**
*For any* source file, it should have the appropriate extension (.ts for TypeScript, .tsx for React components)
**Validates: Requirements 12.4**

## Error Handling

### Migration Error Handling

**File Conflict Resolution**
- When duplicate files are found, preserve the more recent version
- Log all file conflicts for manual review
- Create backup of original structure before migration

**Import Resolution Failures**
- Automatically update common import patterns
- Generate report of unresolved imports for manual fixing
- Provide suggested fixes for complex import scenarios

**Build Failures**
- Validate TypeScript compilation after each major migration step
- Rollback capability if build fails
- Clear error messages with suggested fixes

### Component Library Migration Errors

**Dependency Conflicts**
- Check for version compatibility before migration
- Handle peer dependency warnings
- Provide clear upgrade path for incompatible dependencies

**Styling Migration Issues**
- Map Gluestack styles to new component library equivalents
- Handle unsupported style properties gracefully
- Provide fallback styles for complex components

## Testing Strategy

### Dual Testing Approach

The restructure will use both unit tests and property-based tests to ensure correctness:

**Unit Tests**: Verify specific examples, edge cases, and error conditions
- Test specific file migrations work correctly
- Test import path updates for known scenarios
- Test component library migration for specific components
- Test configuration file updates

**Property Tests**: Verify universal properties across all inputs
- Test that all files are properly organized (minimum 100 iterations)
- Test that all imports resolve correctly across the entire codebase
- Test that naming conventions are followed consistently
- Test that directory structure requirements are met

### Property-Based Testing Configuration

**Testing Framework**: Jest with fast-check for property-based testing
**Minimum Iterations**: 100 per property test
**Test Tagging**: Each property test must reference its design document property

Example test tags:
- **Feature: ipo-app-restructure, Property 1: Single source directory**
- **Feature: ipo-app-restructure, Property 4: Import path correctness**

### Testing Phases

**Phase 1: Pre-Migration Validation**
- Scan current structure and identify all files
- Validate current build works
- Create baseline metrics

**Phase 2: Migration Validation**
- Test each migration step independently
- Validate imports after each file move
- Ensure build continues to work

**Phase 3: Post-Migration Validation**
- Run all property tests to verify structure
- Validate application functionality
- Performance testing to ensure no regressions

### Test Coverage Requirements

- **File Organization**: 100% of files should be in correct locations
- **Import Resolution**: 100% of imports should resolve correctly
- **Naming Conventions**: 100% of files should follow naming rules
- **Build Success**: Application should build and run successfully
- **Component Migration**: All UI components should render correctly

The testing strategy ensures that the restructure maintains application functionality while achieving the desired architectural improvements.

<function_calls>
<invoke name="prework">
<parameter name="featureName">ipo-app-restructure
# Requirements Document

## Introduction

The IPO app currently has a cluttered and inconsistent file structure that makes it difficult for junior developers to navigate and maintain. The project has duplicate folder structures, mixed concerns, and poor separation of responsibilities. This specification outlines the requirements to restructure the entire application according to industry standards and React Native best practices.

## Glossary

- **App**: The IPO tracking React Native application
- **Component**: Reusable UI components
- **Service**: Business logic and API interaction modules
- **Hook**: Custom React hooks for state management and side effects
- **Screen**: Top-level navigation screens
- **Type**: TypeScript type definitions
- **Util**: Pure utility functions
- **Config**: Application configuration files
- **Asset**: Static files like images, fonts, etc.
- **Test**: Automated test files

## Modern Component Library Recommendations

Based on current React Native ecosystem trends and your app's needs, here are the recommended alternatives to Gluestack UI:

### Option 1: NativeWind + Tamagui (Recommended)
- **NativeWind**: Tailwind CSS for React Native - provides utility-first styling
- **Tamagui**: High-performance, universal design system with excellent TypeScript support
- **Benefits**: Better performance, smaller bundle size, excellent developer experience
- **Best for**: Apps that need high performance and modern styling approach

### Option 2: React Native Elements + Styled Components
- **React Native Elements**: Mature, well-documented component library
- **Styled Components**: CSS-in-JS with excellent theming support
- **Benefits**: Stable, large community, extensive documentation
- **Best for**: Teams that prefer traditional CSS-in-JS approach

### Option 3: UI Kitten + Eva Design System
- **UI Kitten**: Based on Eva Design System principles
- **Benefits**: Comprehensive design system, good accessibility support
- **Best for**: Apps that need comprehensive design system out of the box

### Current Issues with Gluestack UI:
1. **Performance**: Heavy runtime styling calculations
2. **Bundle Size**: Larger than necessary for your use case
3. **TypeScript**: Limited type safety compared to modern alternatives
4. **Maintenance**: Less active development compared to alternatives

## Requirements

### Requirement 1: Consolidate Duplicate Folder Structures

**User Story:** As a developer, I want a single, consistent folder structure, so that I can easily locate and organize code without confusion.

#### Acceptance Criteria

1. THE App SHALL have only one `src/` directory containing all source code
2. THE App SHALL remove the duplicate `components/` folder at the root level
3. THE App SHALL move all components from root `components/` to `src/components/`
4. THE App SHALL ensure no duplicate files exist after consolidation
5. THE App SHALL update all import paths to reflect the new structure

### Requirement 2: Implement Standard React Native Project Structure

**User Story:** As a developer, I want a standardized project structure, so that the codebase follows industry conventions and is easy to navigate.

#### Acceptance Criteria

1. THE App SHALL organize all source code under `src/` directory
2. THE App SHALL create separate directories for components, screens, services, hooks, types, utils, and config
3. THE App SHALL move all screen files to `src/screens/`
4. THE App SHALL consolidate all configuration files under `src/config/`
5. THE App SHALL ensure consistent naming conventions across all directories

### Requirement 3: Separate Business Logic from UI Components

**User Story:** As a developer, I want clear separation between business logic and UI components, so that the code is maintainable and testable.

#### Acceptance Criteria

1. THE App SHALL move all API-related logic to `src/services/`
2. THE App SHALL move all custom hooks to `src/hooks/`
3. THE App SHALL move all utility functions to `src/utils/`
4. THE App SHALL ensure components only contain UI logic
5. THE App SHALL remove business logic from component files

### Requirement 4: Organize Components by Feature and Type

**User Story:** As a developer, I want components organized by feature and type, so that I can quickly find related components.

#### Acceptance Criteria

1. THE App SHALL organize components into feature-based directories (home, ipo, common, ui)
2. THE App SHALL create a `src/components/ui/` directory for reusable UI components
3. THE App SHALL create a `src/components/common/` directory for shared components
4. THE App SHALL group feature-specific components in their respective directories
5. THE App SHALL provide index files for clean imports

### Requirement 5: Consolidate and Clean Test Files

**User Story:** As a developer, I want all test files properly organized, so that I can easily run and maintain tests.

#### Acceptance Criteria

1. THE App SHALL create a `__tests__/` directory structure mirroring the source structure
2. THE App SHALL move all test files to appropriate test directories
3. THE App SHALL remove empty test directories
4. THE App SHALL ensure test files follow naming convention `*.test.ts` or `*.test.tsx`
5. THE App SHALL create test setup files if needed

### Requirement 6: Clean Up Root Directory

**User Story:** As a developer, I want a clean root directory, so that I can focus on essential configuration files.

#### Acceptance Criteria

1. THE App SHALL keep only essential files in the root directory
2. THE App SHALL move all source code to `src/` directory
3. THE App SHALL consolidate configuration files appropriately
4. THE App SHALL remove unused or duplicate files
5. THE App SHALL ensure package.json scripts work with new structure

### Requirement 7: Update Import Paths and References

**User Story:** As a developer, I want all import paths to work correctly after restructuring, so that the application builds and runs without errors.

#### Acceptance Criteria

1. WHEN files are moved, THE App SHALL update all import statements
2. WHEN directory structure changes, THE App SHALL update relative paths
3. THE App SHALL ensure all TypeScript paths resolve correctly
4. THE App SHALL update any configuration files that reference file paths
5. THE App SHALL verify the application builds successfully after changes

### Requirement 8: Create Proper Index Files for Clean Imports

**User Story:** As a developer, I want clean import statements, so that the code is more readable and maintainable.

#### Acceptance Criteria

1. THE App SHALL create index.ts files in each major directory
2. THE App SHALL export commonly used items from index files
3. THE App SHALL enable barrel exports for cleaner imports
4. THE App SHALL avoid deep import paths where possible
5. THE App SHALL maintain tree-shaking compatibility

### Requirement 9: Remove Debug and Test Utilities from Production Code

**User Story:** As a developer, I want debug and test utilities separated from production code, so that the app bundle is clean and optimized.

#### Acceptance Criteria

1. THE App SHALL move all debug utilities to a separate directory
2. THE App SHALL remove test utilities from production imports
3. THE App SHALL ensure debug code is conditionally included
4. THE App SHALL clean up development-only imports from App.tsx
5. THE App SHALL optimize the main app entry point

### Requirement 10: Modernize Component Library and Design System

**User Story:** As a developer, I want a modern, performant component library with better TypeScript support, so that the app is more maintainable and follows current best practices.

#### Acceptance Criteria

1. THE App SHALL evaluate replacing Gluestack UI with more modern alternatives (NativeWind + Tamagui or React Native Elements)
2. THE App SHALL consolidate the custom color system into a proper design tokens structure
3. THE App SHALL implement a consistent theming system with proper TypeScript support
4. THE App SHALL create reusable styled components following atomic design principles
5. THE App SHALL ensure the component library supports both light and dark themes

### Requirement 11: Implement Proper Design System Architecture

**User Story:** As a developer, I want a well-structured design system, so that UI consistency is maintained across the app.

#### Acceptance Criteria

1. THE App SHALL create a `src/design-system/` directory for design tokens, components, and themes
2. THE App SHALL separate design tokens (colors, spacing, typography) from component implementations
3. THE App SHALL implement a theme provider that works with the chosen component library
4. THE App SHALL create base components (Button, Input, Card) that extend the library components
5. THE App SHALL provide proper TypeScript interfaces for all design system components

### Requirement 12: Standardize File and Directory Naming

**User Story:** As a developer, I want consistent naming conventions, so that the codebase is professional and easy to navigate.

#### Acceptance Criteria

1. THE App SHALL use PascalCase for component files
2. THE App SHALL use camelCase for utility and service files
3. THE App SHALL use kebab-case for directory names where appropriate
4. THE App SHALL ensure consistent file extensions (.ts for TypeScript, .tsx for React components)
5. THE App SHALL follow React Native community naming conventions
# Implementation Plan: IPO App Restructure

## Overview

This implementation plan breaks down the complete restructuring of the IPO app into discrete, manageable tasks. The approach follows a phased migration strategy to minimize risk and ensure the application remains functional throughout the process. Each task builds incrementally toward the final clean architecture.

## Tasks

- [x] 1. Create new directory structure and setup
  - Create the complete `src/` directory structure with all required subdirectories
  - Set up the design system foundation with tokens, components, and themes directories
  - Create index files for barrel exports in each major directory
  - _Requirements: 2.1, 2.2, 11.1_

- [ ]* 1.1 Write property test for directory structure
  - **Property 5: Required directory structure**
  - **Validates: Requirements 2.2, 2.3, 2.4**

- [x] 2. Migrate and consolidate configuration files
  - Move `config/growwColors.ts` to `src/design-system/tokens/colors.ts`
  - Update `gluestack.config.ts` to reference new color token location
  - Consolidate all configuration files under appropriate directories
  - Update import paths in files that reference moved config files
  - _Requirements: 2.4, 6.3, 10.2_

- [ ]* 2.1 Write property test for configuration file organization
  - **Property 15: Design token organization**
  - **Validates: Requirements 10.2, 11.2**

- [x] 3. Migrate services and business logic
  - Move all files from `src/services/` to maintain existing structure
  - Ensure API client and service files are properly organized
  - Update any imports that reference these service files
  - _Requirements: 3.1_

- [ ]* 3.1 Write property test for service file organization
  - **Property 6: File type organization**
  - **Validates: Requirements 3.1, 3.2, 3.3**

- [x] 4. Migrate custom hooks
  - Move all files from `src/hooks/` to maintain existing structure
  - Ensure all hook files follow the `use*` naming convention
  - Update imports in components that use these hooks
  - _Requirements: 3.2_

- [x] 5. Migrate utility functions
  - Move all files from `src/utils/` to maintain existing structure
  - Remove test utilities from production imports (move to debug directory)
  - Update imports in files that reference utility functions
  - _Requirements: 3.3, 9.1, 9.2_

- [ ]* 5.1 Write property test for utility organization and import cleanliness
  - **Property 23: Production import cleanliness**
  - **Validates: Requirements 9.2**

- [x] 6. Migrate and organize type definitions
  - Move all files from `src/types/` to maintain existing structure
  - Ensure all TypeScript interfaces are properly exported
  - Update imports in files that reference these types
  - _Requirements: 2.2_

- [x] 7. Consolidate and migrate components (Phase 1: Preparation)
  - Create feature-based component directories: `src/components/ui/`, `src/components/common/`, `src/components/home/`, `src/components/ipo/`
  - Analyze existing components in both `components/` and `src/components/` directories
  - Create a migration mapping for each component to its new location
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 8. Migrate UI components
  - Move reusable UI components to `src/components/ui/`
  - Update `src/components/common/LoadingText.tsx`, `SkeletonBox.tsx` to UI directory
  - Create index files for clean imports
  - Update all import statements that reference these components
  - _Requirements: 4.2, 4.5_

- [ ]* 8.1 Write property test for component organization
  - **Property 7: Component feature organization**
  - **Validates: Requirements 4.4**

- [x] 9. Migrate common components
  - Move shared business components to `src/components/common/`
  - Migrate `components/common/CheckButton.tsx`, `PANInput.tsx`, `PillButton.tsx`, `ResultCard.tsx`
  - Remove duplicate `IPOCard.tsx` (keep the more complete version)
  - Update all import statements that reference these components
  - _Requirements: 4.3, 1.4_

- [ ]* 9.1 Write property test for duplicate file elimination
  - **Property 2: No duplicate files after consolidation**
  - **Validates: Requirements 1.4, 6.4**

- [x] 10. Migrate home feature components
  - Move `src/components/home/` files to maintain structure
  - Ensure all home-related components are in the home directory
  - Update imports in screens that use home components
  - _Requirements: 4.4_

- [x] 11. Migrate IPO feature components
  - Move IPO-related components to `src/components/ipo/`
  - Migrate `components/stocks/IPOSection.tsx`, `IPOStockCard.tsx`, `StockCard.tsx`, `IndexCard.tsx`
  - Consolidate IPO card components (resolve duplicates)
  - Update imports in screens that use IPO components
  - _Requirements: 4.4, 1.4_

- [x] 12. Migrate navigation components
  - Move navigation components to `src/components/common/` (since they're shared)
  - Migrate `components/navigation/AppNavigator.tsx`, `BottomNavigation.tsx`, `IPOFilterNav.tsx`, `TabBar.tsx`
  - Update imports in App.tsx and screens
  - _Requirements: 4.4_

- [x] 13. Checkpoint - Verify component migration
  - Ensure all components are in their correct locations
  - Verify no components remain in the old `components/` directory
  - Test that the application builds successfully
  - _Requirements: 1.2, 7.5_

- [ ]* 13.1 Write property test for import path correctness
  - **Property 4: Import path correctness**
  - **Validates: Requirements 1.5, 7.1, 7.2, 7.3**

- [x] 14. Migrate screens
  - Move all screen files to `src/screens/`
  - Migrate `screens/CheckScreen.tsx`, `HomeScreen.tsx`, `InvestmentsScreen.tsx`, `IPODetailsScreen.tsx`, `ProfileScreen.tsx`, `SearchScreen.tsx`
  - Update navigation configuration to reference new screen locations
  - _Requirements: 2.3_

- [x] 15. Clean up debug and test utilities
  - Create `src/debug/` directory for development utilities
  - Move debug utilities from `src/utils/` to `src/debug/`
  - Remove development-only imports from `App.tsx`
  - Ensure debug code is conditionally included with `__DEV__` checks
  - _Requirements: 9.1, 9.3, 9.4_

- [ ]* 15.1 Write property test for debug code separation
  - **Property 22: Debug code separation**
  - **Validates: Requirements 9.1, 9.3**

- [ ] 16. Organize test files
  - Create `__tests__/` directory structure mirroring `src/` structure
  - Move existing test files to appropriate test directories
  - Remove empty test directories (`components/test/`, `screens/pages/test/`)
  - Ensure all test files follow `*.test.ts` or `*.test.tsx` naming convention
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 16.1 Write property test for test organization
  - **Property 10: Test file organization**
  - **Validates: Requirements 5.2, 5.4**

- [ ]* 16.2 Write property test for test directory mirroring
  - **Property 9: Test directory mirroring**
  - **Validates: Requirements 5.1**

- [x] 17. Remove duplicate and unused files
  - Remove the root `components/` directory completely
  - Remove empty directories (`src/screens/pages/`, etc.)
  - Remove unused files and consolidate duplicates
  - Clean up any remaining files that don't belong in the new structure
  - _Requirements: 1.2, 6.4_

- [x] 18. Create comprehensive index files
  - Create index.ts files in all major directories for barrel exports
  - Export commonly used components, hooks, services, and utilities
  - Enable clean import paths throughout the application
  - Test that barrel exports work correctly and maintain tree-shaking
  - _Requirements: 8.1, 8.2, 8.3_

- [ ]* 18.1 Write property test for index file availability
  - **Property 8: Index file availability**
  - **Validates: Requirements 4.5, 8.1**

- [ ] 19. Update root directory and package.json
  - Ensure only essential files remain in root directory
  - Update package.json scripts if needed for new structure
  - Update any configuration files that reference file paths
  - Clean up root directory of any non-essential files
  - _Requirements: 6.1, 6.5, 7.4_

- [ ]* 19.1 Write property test for root directory cleanliness
  - **Property 12: Root directory cleanliness**
  - **Validates: Requirements 6.1**

- [ ]* 19.2 Write property test for build script functionality
  - **Property 13: Build script functionality**
  - **Validates: Requirements 6.5, 7.5**

- [x] 20. Validate naming conventions
  - Ensure all component files use PascalCase
  - Ensure all utility and service files use camelCase
  - Ensure all directories use appropriate naming conventions
  - Ensure all files have correct extensions (.ts/.tsx)
  - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [ ]* 20.1 Write property test for naming conventions
  - **Property 18: Component file naming**
  - **Property 19: Utility and service file naming**
  - **Property 20: Directory naming consistency**
  - **Property 21: File extension consistency**
  - **Validates: Requirements 12.1, 12.2, 12.3, 12.4**

- [ ] 21. Final validation and testing
  - Run TypeScript compilation to ensure all imports resolve
  - Test that the application builds successfully
  - Test that the application runs without errors
  - Verify all screens and components render correctly
  - _Requirements: 7.3, 7.5_

- [ ]* 21.1 Write comprehensive property test suite
  - **Property 1: Single source directory**
  - **Property 3: Component migration completeness**
  - **Property 11: No empty test directories**
  - **Validates: Requirements 1.1, 1.3, 5.3**

- [ ] 22. Final checkpoint - Complete restructure validation
  - Ensure all tests pass, ask the user if questions arise
  - Verify the new structure meets all requirements
  - Document any remaining manual steps or recommendations
  - Provide summary of changes made and benefits achieved

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation throughout the process
- Property tests validate universal correctness properties across the entire codebase
- Unit tests validate specific examples and edge cases for critical migrations
- The migration maintains application functionality while achieving architectural improvements
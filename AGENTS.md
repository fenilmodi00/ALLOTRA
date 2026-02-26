# AGENTS.md

Guidance for coding agents working in this repository.

## Project Summary

- App type: React Native + Expo (managed workflow), TypeScript, Zustand state, Gluestack UI.
- Main entry points: `index.ts`, `App.tsx`, and screen/navigation components under `src/`.
- Backend integration is REST-based through `src/services/api.ts` and domain services.
- Data contracts are defined in `src/types/`, then transformed in `src/utils/dataTransformers.ts`.

## Environment and Prerequisites

- Node.js and bun are expected (lockfiles for both bun and bun exist).
- Install dependencies with `bun install`.
- Optional env vars in `.env`:
  - `EXPO_PUBLIC_API_URL`
  - `EXPO_PUBLIC_API_TIMEOUT`
- Platform defaults are configured in `src/config/environment.ts`.

## Build, Lint, Test, and Dev Commands

### Available bun scripts (from `package.json`)

- `bun start` - start Expo dev server.
- `bun run android` - start app in Android flow.
- `bun run ios` - start app in iOS flow.
- `bun run web` - start app in web flow.

### Missing scripts to be aware of

- There is currently no `bun run build` script.
- There is currently no `bun run lint` script.
- There is currently no `bun test` script.

### Type checking

- Canonical command: `npx tsc --noEmit`.
- Current status: this command fails with a tsconfig/moduleResolution mismatch inherited from Expo base config.
- If you need to validate types, first fix tsconfig compatibility; do not claim typecheck is passing unless re-run successfully.

### Single-test execution guidance

- A test runner is not configured yet (no Jest/Vitest config and no test script).
- Therefore, there is no repo-supported command to run one test file today.
- If tests are added in the future, prefer script-backed commands, for example:
  - `bun test -- path/to/file.test.ts`
  - `bun test -- -t "test name"`
- Do not introduce a new testing framework unless explicitly requested.

### Debug and manual verification paths

- Development debug helpers exist under `src/debug/`.
- `App.tsx` conditionally imports debug runners in `__DEV__` mode.
- Treat debug helpers as diagnostics, not formal automated tests.

## Code Style and Conventions

### General formatting

- Follow existing file-local style instead of forcing one global formatter style.
- This repo currently contains mixed semicolon usage; preserve the surrounding file style.
- Keep lines readable and avoid dense inline logic where clarity suffers.

### Imports

- Import order pattern used across the repo:
  1) external libraries,
  2) internal modules,
  3) type-only imports (`import type`) near related imports.
- Prefer `import type` for purely type dependencies.
- Use relative imports (path aliases are not configured).
- Prefer barrel exports (`index.ts`) where the module already provides them.

### TypeScript and typing discipline

- TypeScript strict mode is enabled; keep new code strict-safe.
- Avoid `any`; use domain types from `src/types/`.
- Model API payloads explicitly with generic wrappers such as `APIResponse<T>`.
- Keep backend shapes (`IPO`, `IPOWithGMP`) separate from UI shapes (`DisplayIPO`).
- Add or extend types in `src/types/*.types.ts` for new domain fields.

### Naming conventions

- Components/screens: `PascalCase` filenames and component names.
- Hooks: `camelCase` with `use` prefix (example: `useIPOData`).
- Services: `camelCase` with `Service` suffix (example: `ipoService`).
- Utility modules: descriptive camelCase filenames.
- Types: domain-grouped files with `.types.ts` suffix where applicable.
- Constants: `UPPER_SNAKE_CASE` for true constants; otherwise meaningful camelCase.

### React and React Native patterns

- Prefer functional components and hooks.
- Keep side effects in `useEffect` and callbacks in `useCallback` where it helps stability.
- Keep screen components focused on orchestration; push business/data logic into hooks/services.
- Use design tokens from `src/design-system/tokens/` instead of ad hoc color literals.

### State management (Zustand)

- Keep global state in stores only when shared across screens/components.
- Expose clear action methods (`setX`, `addX`, `clearX`) in stores.
- Use selector hooks to reduce unnecessary re-renders.
- Keep ephemeral UI state local to components.

### Service and API layer rules

- Route all HTTP calls through `apiClient` in `src/services/api.ts`.
- Keep endpoint-specific logic in domain services (`ipoService`, `stockService`).
- Transform backend responses to UI-safe models in transformer utilities.
- Encode query params safely and keep endpoint strings centralized by service method.

### Error handling expectations

- Throw/propagate typed errors (`APIError`) in API layer.
- In hooks/screens, convert unknown errors to user-safe messages.
- Keep verbose `console.*` logging gated to development when possible.
- Prefer graceful fallback behavior for non-critical data paths.
- Never silently swallow errors without at least local handling intent.

### Validation and data integrity

- Reuse validators in `src/utils/validators.ts` for PAN/email/phone/app number/demat checks.
- Keep validation functions deterministic and side-effect free.
- Normalize inputs before validation where the existing code does so.

### Navigation and props typing

- Use navigation types from `src/types/navigation.types.ts`.
- Avoid untyped navigation params; add/extend param list types first.
- Replace `any` props with explicit screen prop types when touching legacy areas.

## File and Architecture Boundaries

- `src/screens/`: presentation and flow orchestration.
- `src/components/`: reusable UI sections/cards/common controls.
- `src/hooks/`: reusable async/data/stateful logic.
- `src/services/`: backend communication and API contracts.
- `src/store/`: shared Zustand state.
- `src/utils/`: pure helpers and transformations.
- `src/config/`: environment/runtime configuration.

## Agent Execution Rules for This Repo

- Prefer minimal, targeted edits; avoid broad refactors unless asked.
- Do not add dependencies/scripts/tooling without explicit request.
- Do not claim lint/test/build success when scripts are absent.
- Verify commands against `package.json` before documenting or invoking them.
- Preserve existing behavior in production paths when adding diagnostics.
- For any UI work involving Gluestack UI (new components, styling updates, migrations, or API changes), first fetch current Gluestack documentation through Context7 MCP (`resolve-library-id` then `query-docs`) and follow that guidance before implementation.
- For performance optimizations, strictly follow the framework defined in `.kiro/skills/bolt-expo-performance-reviewer.md`.

## Cursor and Copilot Rules Check

- `.cursor/rules/`: not present.
- `.cursorrules`: not present.
- `.github/copilot-instructions.md`: not present.
- No external Cursor/Copilot rule files are currently enforced in-repo.

## Additional Project Guidance Sources

- `.kiro/steering/tech.md` - stack and common command expectations.
- `.kiro/steering/structure.md` - architecture and naming guidance.
- `.kiro/steering/product.md` - domain context for feature decisions.

When in doubt, align with existing patterns in nearby files and keep changes small, typed, and verifiable.

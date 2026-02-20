# ADR-001: Typed Navigation Contracts

- Status: Accepted
- Date: 2026-02-20

## Context

Screen navigation currently mixes typed contracts and runtime-only payloads. Some screens pass route params that do not match `RootStackParamList`, which weakens compile-time guarantees and increases runtime navigation failures.

## Decision

We will enforce typed navigation contracts end-to-end:

- All stack/tab navigators will use explicit type parameters.
- Screen props will use navigation types from `src/types/navigation.types.ts`.
- Route payloads must match declared param list types.
- New navigation code must avoid `any` for `navigation` and `route` props.

## Consequences

- Positive: Compile-time validation for navigation payloads and safer refactors.
- Positive: Less runtime ambiguity between route contracts and usage.
- Negative: Initial migration effort in legacy screens/components using `any`.

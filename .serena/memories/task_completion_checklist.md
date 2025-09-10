# Task Completion Checklist

When completing development tasks, always run these commands:

1. **Type Check**: `pnpm type-check:all`
   - Ensures TypeScript compilation passes for both client and server

2. **Linting**: `pnpm lint`
   - Runs ESLint across the entire project
   - Checks both Vue/Nuxt and NestJS code

3. **Format**: `pnpm format`
   - Ensures code is properly formatted with Prettier

4. **Tests**: `pnpm test`
   - Runs all unit tests across the monorepo

## Pre-commit Hooks
The project has Husky configured with:
- Pre-commit: Runs lint-staged (lint + format)
- Commit-msg: Validates commit message format

## Build Verification
For production readiness:
- `pnpm build`: Verify all applications build successfully
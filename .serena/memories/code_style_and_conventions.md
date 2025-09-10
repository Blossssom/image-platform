# Code Style and Conventions

## Prettier Configuration
- Semi-colons: true
- Single quotes: true
- Tab width: 2
- Trailing commas: es5
- Print width: 80
- Line endings: lf
- Bracket spacing: true
- Arrow parens: avoid

## ESLint Rules
- Console/debugger warnings in production, off in development
- Unused vars: warn (ignore args starting with _)
- Explicit return types: off
- Module boundary types: off

## Frontend Specific (Nuxt/Vue)
- Vue 3 recommended rules
- Multi-word component names: off
- Multiple template root: off
- Default prop requirement: off

## Backend Specific (NestJS)
- Interface name prefix: off
- Explicit any: off
- Standard NestJS conventions

## Git Conventions
- Commit format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Pre-commit hooks run lint-staged
- Commit message validation enforced
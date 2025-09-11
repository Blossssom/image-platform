# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Structure

This is an AI Image Platform built as a full-stack monorepo with:

- **Frontend**: Nuxt 4 application in `apps/client/`
- **Backend**: NestJS API server in `apps/server/`
- **Packages**: Shared utilities in `packages/` (currently empty)

## Important file

- **Planning document**: `docs/requirements.md` -

## Development Commands

### Setup & Installation

```bash
pnpm setup          # Initial project setup
pnpm install        # Install dependencies
```

### Development

```bash
pnpm dev            # Start both client and server
pnpm dev:client     # Start Nuxt development server only
pnpm dev:server     # Start NestJS server in watch mode only
```

### Code Quality (Always run after completing tasks)

```bash
pnpm type-check:all # Type check both client and server
pnpm lint           # ESLint across entire project
pnpm format         # Format with Prettier
pnpm test           # Run all tests
```

### Building

```bash
pnpm build          # Build all applications
```

## Tech Stack Details

### Frontend (apps/client/)

- Nuxt 4 with Vue 3 and TypeScript
- @nuxt/ui for components
- @nuxt/image for image handling
- Development server runs on http://localhost:3000

### Backend (apps/server/)

- NestJS with TypeScript
- TypeORM for database operations
- PostgreSQL database
- Development server with watch mode

## Code Conventions

### Formatting (Prettier)

- 2-space indentation
- Single quotes
- Semicolons required
- 80 character line width
- Unix line endings (lf)

### Linting (ESLint)

- TypeScript recommended rules
- Vue 3 recommended rules for frontend
- NestJS conventions for backend
- Unused variables warn (prefix with \_ to ignore)
- Console/debugger allowed in development

### Git Commits

- Format: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Enforced by commit-msg hook

## Monorepo Architecture

This is a pnpm workspace with:

- Apps in `apps/*`
- Shared packages in `packages/*`
- Root-level scripts for cross-cutting concerns
- Workspace-aware dependency management

## Database

The server uses TypeORM with PostgreSQL. Database configuration is handled through NestJS configuration module.

## Important Notes

- Always run type checking, linting, and tests before considering a task complete
- The project uses Husky for Git hooks with pre-commit linting
- Both client and server have their own package.json with specific scripts
- Use pnpm workspaces commands to target specific apps when needed

## Job History

- Always record your work with the date in docs/log.
- Create a .md file name with the year and date and continue the records you worked on that date. like 2025_09_11.md
- The details of each task are as detailed as possible, but please write a summary

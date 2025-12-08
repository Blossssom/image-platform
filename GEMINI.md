# GEMINI.md

This file provides guidance to GEMINI CLI when working with code in this repository.

## Project Structure

This is an AI Image Platform built as a full-stack monorepo with:

- **Frontend**: Next.js application in `apps/client/`
- **Backend**: NestJS API server in `apps/server/`
- **Infra**: Docker Compose & Configuration in `infra/` (Postgres, Redis, Elasticsearch)
- **Docs**: Project Specifications in `docs/specs/`
- **Packages**: Shared utilities in `packages/`

## Documentation & Truth Sources (Crucial)

All development must strictly follow the specifications defined in `docs/specs/`.

- **01_requirements.md**: Business logic & functional requirements.
- **02_database.md**: Database Schema (TypeORM) & Elasticsearch Mapping.
- **03_api_spec.md**: API Endpoints, Request/Response formats, and Error codes.
- **plans/backend_wbs.md**: Development Roadmap.

**⚠️ Rule:** Before writing any code, ALWAYS read the relevant section in `docs/specs/` first.

## Development Guidelines Reference

- **Frontend Rules**: [`apps/client/GEMINI-NEXTJS.md`](apps/client/GEMINI-NEXTJS.md)
- **Backend Rules**: [`apps/server/GEMINI-NESTJS.md`](apps/server/GEMINI-NESTJS.md)

## Development Workflow (Strict: Endpoint-Centric)

To prevent chaotic development ("spaghetti code"), you must strictly follow this **Single Endpoint Cycle**.
**⛔ DO NOT move to the next endpoint until the current one is 100% complete and confirmed.**

1.  **Select Target:** Pick **ONE** endpoint from `docs/specs/03_api_spec.md` (e.g., `POST /images/upload`).
2.  **Spec & Schema Check:**
    * Read the API spec for inputs/outputs.
    * Ensure required Entities exist in `docs/specs/02_database.md`.
3.  **Implement & Document:**
    * Create DTOs with **Swagger Decorators** (`@ApiProperty`, `@IsString`, etc.).
    * Implement Service & Controller logic.
    * Apply `@ApiOperation`, `@ApiResponse` decorators to the Controller.
4.  **Verification (Swagger & Function):**
    * Start server: `pnpm dev:server`.
    * **Check Swagger UI:** Verify `http://localhost:3000/api` (or configured path) matches the Spec.
    * **Test:** Curl / Postman / Unit Test.
5.  **Report & Wait:**
    * Summarize the work.
    * **STOP** and ask the user: *"Endpoint X is done. Shall I proceed to Y?"*

## Development Commands

### Setup & Installation

```bash
pnpm setup          # Initial project setup
pnpm install        # Install dependencies
```

### Development

```bash
pnpm dev            # Start both client and server
pnpm dev:client     # Start Next.js development server only
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
- Framework: Next.js 15+ (App Router)
- State: Jotai (Client), React Query (Server)
- UI: FSD Architecture, Shadcn UI

### Backend (apps/server/)
- Framework: NestJS
- Database: PostgreSQL (Primary), Redis (Cache/Queue)
- Search: Elasticsearch (w/ nori analyzer)
- ORM: TypeORM
- Storage Strategy:
- API Docs: Swagger (OpenAPI) - via @nestjs/swagger
- Dev: Local File System (/uploads) via ServeStaticModule.
- Prod: AWS S3.

### Test

- Jest (Backend)
- React Testing Library (Frontend - to be configured)

## Code Conventions

### General
- 2-space indentation, Single quotes, Semicolons required.
- Strict Typing: No any type allowed unless absolutely necessary.

### Backend Specifics
- Swagger Mandatory: All DTOs and Controllers MUST have Swagger decorators to generate accurate API docs.
- Follow Controller-Service-Repository pattern.
- Use DTOs with class-validator for all inputs.
- Use TypeORM Entities defined in src/entities.

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

## Job History (Log)
- Mandatory: Record your work summary with the date in docs/log/YYYY_MM_DD.md.
- Example: docs/log/2025_12_08.md.
- Keep the log concise but cover all completed tasks and key decisions.

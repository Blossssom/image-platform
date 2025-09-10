# AI Image Platform - Project Overview

## Purpose
This is an AI Image Platform built as a full-stack web application with a modern monorepo architecture. The project consists of a Nuxt 4 frontend client and a NestJS backend server.

## Tech Stack
- **Frontend**: Nuxt 4, Vue 3, TypeScript, @nuxt/ui, @nuxt/image
- **Backend**: NestJS, TypeORM, PostgreSQL, TypeScript
- **Package Manager**: pnpm with workspace configuration
- **Monorepo Structure**: Apps and packages organized in a workspace
- **Database**: PostgreSQL (via TypeORM)

## Architecture
- `apps/client/`: Nuxt 4 frontend application
- `apps/server/`: NestJS backend API server
- `packages/`: Shared utilities and types (currently empty)
- `scripts/`: Setup and development scripts
- `docker/`: Docker configuration (currently empty)
# Development Commands

## Project Setup
- `pnpm setup`: Run initial project setup script
- `pnpm install`: Install all dependencies

## Development
- `pnpm dev`: Start both client and server in development mode
- `pnpm dev:client`: Start only the client (Nuxt) development server
- `pnpm dev:server`: Start only the server (NestJS) in watch mode

## Building
- `pnpm build`: Build all applications
- `pnpm run --recursive build`: Build all packages recursively

## Testing
- `pnpm test`: Run tests in all applications
- `pnpm run --recursive test`: Run tests recursively in all packages

## Code Quality
- `pnpm lint`: Run ESLint across the entire project
- `pnpm format`: Format code with Prettier

## Type Checking
- `pnpm type-check:all`: Run type checking for both client and server
- `pnpm type-check:client`: Type check client only
- `pnpm type-check:server`: Type check server only
- `pnpm type-check`: Type check server (default)

## Cleanup
- `pnpm clean`: Clean all build artifacts and node_modules
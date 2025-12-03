# Next.js Frontend Development Guidelines (GEMINI-NEXTJS.md)

## Architecture & Directory Structure

**App Router**: Use the Next.js App Router (`app/` directory).

- `app/`: Contains routes and layouts.
  - `page.tsx`: Route entry point.
  - `layout.tsx`: Layout wrapper.
  - `loading.tsx`: Loading state.
  - `error.tsx`: Error boundary.

**Component Organization**:

- `components/ui/`: Reusable, generic UI components (e.g., `Button`, `Input`, `Modal`). These should be pure and business-logic free.
- `components/features/[feature]/`: Feature-specific components (e.g., `auth/LoginForm`, `gallery/ImageGrid`).
- `lib/`: Utility functions, API clients, and constants.
- `hooks/`: Custom React hooks.

## Data Fetching & API Integration

**Server Components First**: Prefer fetching data in Server Components (`async` components) to reduce client bundle size and improve initial load performance.

**Client Data Fetching**:
- Use **SWR** or **TanStack Query** for client-side data fetching, caching, and revalidation.
- Avoid `useEffect` for data fetching.

**API Proxy**:
- All API requests to the backend should be prefixed with `/api`.
- Configure `next.config.js` rewrites to proxy `/api/*` to the NestJS backend (e.g., `http://localhost:4000`).
- This avoids CORS issues and simplifies cookie/session management.

## State Management

**Server State**: Rely on URL search params and Server Components for state where possible (e.g., pagination, filters).

**Client State**:
- **Local State**: Use `useState` / `useReducer` for component-local state.
- **Global UI State**: Use **React Context** for simple global state (e.g., Theme, Toast).
- **Complex Global State**: Use **Zustand** for complex application state (e.g., AuthUser, UploadQueue).

## Styling (CSS Modules)

**Approach**: Use **CSS Modules** (`*.module.css`) for component-scoped styling.

- **Naming**: `ComponentName.module.css`.
- **Global Styles**: Only use `globals.css` for CSS variables (colors, spacing), resets, and typography defaults.
- **Class Naming**: Use `camelCase` for class names in CSS modules (e.g., `.submitButton`) to match JavaScript property access.

## TypeScript Conventions

**Strict Typing**: Avoid `any`. Define interfaces for all component props (`interface Props { ... }`) and API responses.

**Shared Types**:
- Ideally, import shared DTOs/Interfaces from a shared package or `types/` directory that is synchronized with the backend.
- Do not duplicate types manually if possible.

## Performance & Best Practices

- **Images**: Always use `next/image` for image optimization. Configure `remotePatterns` in `next.config.js` for external images (S3).
- **Lazy Loading**: Use `next/dynamic` to lazy load heavy components or those not visible on initial render.
- **Links**: Use `Link` from `next/link` for internal navigation.
- **"use client"**: Add `"use client"` directive at the top of files only when necessary (using hooks, event listeners). Keep the leaf nodes as client components to maximize server rendering.

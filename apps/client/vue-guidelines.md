# Vue/Nuxt Development Guidelines (GEMINI-VUE-NUXT.md)

## Nuxt Framework Specifics

Version: Utilize Nuxt 3 (Composition API, Vite).

Directory Structure: Adhere strictly to the standard Nuxt 3 directory structure (pages, layouts, components, composables, stores, server).

Auto Imports: Leverage Nuxt's Auto Imports feature for components, composables, and utilities, but ensure clarity by explicitly importing non-auto-imported third-party modules.

Server-Side Rendering (SSR) Priority: Pages should prioritize SSR or Hybrid rendering for performance and SEO benefits. Client-side rendering (CSR) should only be used when necessary (e.g., highly interactive or device-specific components).

Asset Optimization: Use the built-in Nuxt modules for optimizing assets, including the use of <NuxtImg> component for optimized images.

## Component and Composition API Conventions

Script Setup: Components must use the <script setup> syntax.

Component File Extension: Use .vue extension for all components.

Component Naming:

Single File Components (SFCs): Use PascalCase (e.g., UserProfile.vue).

Base/Utility Components: Prefix general reusable components with a specific name (e.g., BaseButton.vue, AppInput.vue).

Props Declaration: Use TypeScript for defining props using defineProps<T>() with explicit runtime validation when necessary.

Props should be passed down using camelCase and consumed using camelCase.

Emits/Events: Use defineEmits<T>() and follow a kebab-case convention for event names (e.g., @update:model-value, @item-selected).

Composables: Logic encapsulation should be done using Composables (functions prefixed with use, e.g., useUserAuth). Composables must reside in the composables/ directory.

## State Management

Global Client State (Client-Side): Use Pinia for application-level client state management.

Stores must be defined in the stores/ directory.

Follow the convention of naming stores with the suffix Store (e.g., authStore.ts).

Server State & Data Fetching: Use Nuxt's built-in composables like useFetch or useAsyncData for fetching server data, ensuring proper caching and error handling.

Local Component State: Use ref() or reactive() for state local to a component or composable.

## TypeScript and Type Safety

Strict Typing: Ensure the tsconfig.json is configured for strict type checking.

Interfaces/Types: Define all application-specific data structures (API responses, model structures, props types) using Interfaces or Types in a central location (e.g., types/).

Any Avoidance: Avoid using the any type. Use unknown or specific types for clarity.

## Styling and Design

Style Scope: Styles inside SFCs should typically be scoped using <style scoped>.

Tailwind CSS & Utility: Use Tailwind CSS classes exclusively for styling.

Design Support: Components must support Dark Mode and be designed with a Mobile-First Responsive approach.

Theming: Theme colors and specific values should utilize CSS variables which are then referenced by Tailwind or in the CSS block.

## Testing Requirements

Framework: Use Vitest for unit testing.

Unit Tests: Each component and composable must have corresponding unit tests.

Component Testing: Use Vue Test Utils for component mounting and interaction testing.

Coverage: Maintain a minimum test coverage of 80% across all source files.

## Project-Specific Directives

Documentation: All components, composables, and public functions should include detailed JSDoc comments describing their purpose, parameters, and return values.

API/Error Handling: All data fetching operations (useFetch, etc.) must include robust error handling and loading state management.

Routing: Utilize Nuxt's file-system based routing (pages/). Use the <NuxtLink> component for all internal navigation.

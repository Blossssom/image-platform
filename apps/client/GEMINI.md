# Component Development Guidelines (GEMINI.md)

## Component Design Principles

Storybook Integration: Each component must have a corresponding .stories.js or .stories.ts file for documentation and isolated development.

Dark Mode Support: Components must support and be tested for dark mode.

Strong Typing (TypeScript): All component props must have explicit TypeScript type definitions.

Unit Testing: Every component must include relevant unit tests to ensure functionality and prevent regressions.

## Styling Conventions

Tailwind CSS: Use Tailwind CSS utility classes for styling.

Vue-query: manage state for api state.

Avoid Inline Styles: Inline styles should be avoided. All styling should be managed through Tailwind CSS classes.

Mobile-First Responsive Design: Components should be designed with a mobile-first approach to ensure responsive design.

## Feature-Sliced Design (FSD) Rules

FSD is a methodology for structuring your application based on the principles of isolation, modularity, and decoupling.

### 1. Isolation by Layer (Highest Level)

Components and their logic should be organized into Layers. A component in a higher layer should not import modules from a lower layer.

app (Application): Global configuration, routing, and main layout. Cannot import anything else.

pages (Pages): Composition of features and widgets to form a complete view. Can import widgets, features, entities.

widgets (Widgets): Meaningful UI blocks composed of features and entities (e.g., Header, Sidebar, Feed). Can import features, entities, shared.

features (Features): User interactions/scenarios (e.g., 'Login form', 'Add to cart button', 'Toggle theme'). Can import entities, shared.

entities (Entities): Domain-specific objects/data (e.g., 'User', 'Product', 'Comment'). Can import shared.

shared (Shared): Reusable, non-domain-specific code (e.g., UI components like Button/Input, utility functions, constants, API configs). Can't import anything specific to other layers/slices.

### 2. Component Structure within a Slice

Inside each logical slice (e.g., features/authentication, entities/user), components should be segmented for further isolation:

ui/: Presentational components (dumb components).

model/: Logic for state management, data fetching, and business logic.

lib/: Utility functions or helper logic specific to this slice.

api/: API interaction logic specific to this slice.

### 3. Strict Inter-Slice Imports

Components can only import from the same slice's shared/ segments or from other layers below them (e.g., a component in features/user-profile can import from entities/user, but not from features/post-management).

Direct import between peer slices is forbidden (e.g., features/A cannot import from features/B). Communication between slices should happen through the shared/ layer or through composition in a higher layer (like pages).

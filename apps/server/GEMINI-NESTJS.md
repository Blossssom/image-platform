# NestJS Backend Development Guidelines (GEMINI-NESTJS.md)

## Architecture & Module Principles

**Module Scope**: Follow the Single Responsibility Principle (SRP). Each Module should represent a single, cohesive domain or feature (e.g., `UsersModule`, `AuthModule`, `ProductsModule`).

**Layer Separation (Three-Tier)**: Maintain clear separation between the three main layers:

- **Controller**: Handles incoming requests, validation, and delegates business logic. It must not contain business logic.
- **Service**: Contains all the business logic and orchestrates interactions with the data layer (Repository/Database).
- **Repository/Prisma Service**: Handles direct database interaction (CRUD operations).

**Dependency Injection**: Always utilize NestJS's Dependency Injection (DI) system for services, controllers, and providers. Avoid direct instantiation (`new Class()`).

**SharedModule**: Use a dedicated `SharedModule` for providers that are truly shared across the entire application (e.g., global configuration, logging utilities). Avoid dumping unrelated providers here.

## TypeScript and DTO/Interface Conventions

**Strict Typing**: Embrace TypeScript's strictness. Use explicit types for all function arguments, return values, and class properties.

**DTOs (Data Transfer Objects)**: Use Class-based DTOs with NestJS's built-in validation pipeline (`class-validator` and `class-transformer`) for all incoming request bodies (`@Body()`) and query parameters (`@Query()`).

- Input DTOs should clearly define the structure of data coming in (e.g., `CreateUserDto`).

**Response Interfaces/Types**: Define clear Interfaces or Types for the data structure being sent out from services and controllers (e.g., `UserResponse`). This improves frontend consumption.

**Type Naming**:

- Use the suffix `Dto` for input classes (e.g., `CreateProductDto`).
- Use the suffix `Interface` or prefix `I` for domain model types/interfaces (e.g., `IUser`, `ProductInterface`).

## API Endpoint & Controller Conventions

**Resource Naming**: Use plural nouns for resource names in routes.

- Good: `/api/users`, `/api/products`
- Bad: `/api/user`, `/api/product`

**HTTP Methods & Actions (RESTful)**: Use the appropriate HTTP methods:

- `POST`: Creation of a resource (`/products`)
- `GET`: Retrieval of a resource or collection (`/products`, `/products/:id`)
- `PATCH` or `PUT`: Modification/Replacement of a resource (`/products/:id`)
- `DELETE`: Removal of a resource (`/products/:id`)

**Exception Filters**: Use Built-in HTTP Exceptions (`NotFoundException`, `BadRequestException`, etc.) within services to handle errors gracefully. Custom exception filters should only be used for complex, non-standard error handling.

## Next.js Server Integration Specifics

These rules apply when running the NestJS application within a Next.js Monorepo or utilizing a custom server integration approach.

**Custom Server Integration**: The NestJS application should be hosted via the Next.js Custom Server layer or run on a separate port and exposed via proxy.

**Proxy Configuration**: The front-end (React/Next.js) environment must proxy all API calls (e.g., requests to `/api/**`) to the dedicated NestJS server endpoint.

**Session/Authentication**:

- Authentication logic (JWT, Session, OAuth) must be entirely managed by the NestJS layer.
- The frontend must securely consume the authentication state. Use Next.js Middleware or Hooks to pre-check the authentication status during the page load lifecycle.

**Shared Types**: DTOs and response interface types must be shared between the NestJS and Next.js projects (e.g., via a dedicated shared package or `types/` directory) to maximize Type Safety across the stack.

## Testing

**Unit Tests for Services**: Services, which contain the core business logic, must be covered by unit tests. Use mocks to isolate the service from the database/repository layer.

**E2E Tests for Controllers**: Controllers should be covered by End-to-End (E2E) tests to verify that the entire request-response flow (routing, guards, pipes) works correctly.

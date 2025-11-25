# Project Implementation Plan (AI Image Platform)

> **Version:** 1.2 (Workflow Change)
> **Date:** 2025-11-25
> **Status:** In Progress
>
> **Development Workflow Note (as of 2025-11-25):** All backend development will follow a strict **"Implement -> Test -> User Confirmation"** cycle for each individual API endpoint. Work on a new endpoint will only commence after the previous one has been fully tested and approved by the user.

## 1. Overview

This document outlines the detailed implementation plan for building the AI Image Platform, based on the specifications in `docs/requirements.md`.

The project will be developed by tackling **P0 (High Priority)** features first. The backend will be developed before the frontend. The development will adhere to the **Database-First** approach.

---

## 2. Phase 1: Backend Development (Core API)

### Task 2.1: Initial Project Setup
- [x] Analyze `requirements.md` and establish a work plan.
- [x] Clarify development approach (Database-First) and update `requirements.md`.
- [x] Verify that existing TypeORM entities in `apps/server/entities/` are consistent with the project requirements.
- [x] Create foundational NestJS modules for each functional domain (`UsersModule`, `PostsModule`, `ImagesModule`).
- [x] Import all created feature modules into the root `AppModule`.
- [x] Configure `TypeOrmModule` in `AppModule` to ensure a proper database connection.
- [x] Set up environment variable handling (e.g., using `.env` files) for database credentials and other secrets.

### Task 2.2: Core Image Upload Pipeline (High Priority)
- [x] Install dependencies: `exifr`, `png-chunk-text`, `@aws-sdk/client-s3`, `uuid`.
- [x] Create a global, reusable `S3Service` in `common/services`.
- [x] Create `ImagesService` with core logic for metadata parsing, resizing, and S3 uploading.
- [x] Fix bugs in `ImagesService` related to `sharp` import and `exifr` options.
- [x] Create `PostsService` to handle `Post` entity creation.
- [x] Create `PostsController` with the `POST /api/posts/upload` endpoint.
- [x] Configure `Multer` middleware in the controller for file handling.
- [x] Write a unit test for `ImagesService`'s `parseMetadata` method.
- [x] Write an integration test for the `POST /api/posts/upload` endpoint.
- [x] **Note:** For initial development, the user associated with the upload will be mocked or temporarily ignored.
- [x] **Update (2025-11-25):** The upload logic was refactored to accept pre-parsed `generationInfo` from the client, removing the need for backend parsing during the final upload.

### Task 2.3: Content Delivery APIs (High Priority)
- [x] Implement `GET /api/posts` with cursor-based pagination for infinite scrolling.
- [x] Implement `GET /api/images/:id` to fetch data for the detail page, including `generationInfo`.
- [x] Implement `GET /api/images/:id/download` to provide a pre-signed URL for the original image from S3.

### Task 2.4: API Verification (Endpoint by Endpoint)
- [ ] **Next Up:** Test `GET /api/posts` and await user confirmation.
- [ ] Test `GET /api/images/:id` and await user confirmation.
- [ ] Test `GET /api/images/:id/download` and await user confirmation.
- [ ] Test `POST /posts/upload` (re-verify with new DTO logic) and await user confirmation.

### Task 2.5: New Upload Flow (2-Step Process)
- [ ] **Implement `POST /posts/metadata`:** Create the new endpoint for metadata extraction.
  - [ ] Make `ImagesService.parseMetadata` public.
  - [ ] Add the endpoint to `PostsController`.
  - [ ] Write tests for the new endpoint.
- [ ] **Await user confirmation.**

### Task 2.6: Authentication (OAuth & JWT) (Paused)
- [x] Create `AuthModule`, `AuthService`, `AuthController`.
- [ ] Implement Passport.js strategies for Google and GitHub.
- [ ] Define API endpoints for the OAuth flow (e.g., `/api/auth/google`, `/api/auth/google/callback`).
- [ ] Generate a JWT upon successful login.
- [ ] Create a `JwtAuthGuard` to protect routes.
- [ ] **Final Step:** Apply the `JwtAuthGuard` to the endpoints that require user authentication (e.g., upload).

---

## 3. Phase 2: Frontend Development (Nuxt.js)

### Task 3.1: Initial Project Setup
- [ ] Set up the basic Nuxt 3 project structure (`pages`, `layouts`, `components`).
- [ ] Create a global API service module for backend communication.
- [ ] Configure basic styling and a global layout.

### Task 3.2: Image Upload UI (High Priority)
- [ ] Create a dedicated upload page or modal component.
- [ ] Implement a drag-and-drop interface for file selection.
- [ ] Display upload progress and handle success/error states.

### Task 3.3: Gallery & Detail Pages (High Priority)
- [ ] **Gallery Page:** Develop a responsive masonry grid layout with infinite scrolling.
- [ ] **Detail Page (`/images/:id`):** Fetch and display the image, its metadata, and a download button.

### Task 3.4: Authentication Flow (De-prioritized)
- [ ] Create a login page with "Login with Google/GitHub" buttons.
- [ ] Handle the client-side OAuth redirects and JWT management.
- [ ] Implement state management for user authentication status.
- [ ] **Final Step:** Apply route guards to pages that require authentication.

---

## 4. Finalization

- [ ] Perform End-to-End testing of the complete user flow.
- [ ] Write a final work log in `docs/logs/` as required.
# Backend Implementation WBS

This document tracks the progress of the backend API implementation based on `docs/specs/API_SPEC.md`.

## Phase 1: Foundation & Upload (Current)

- [ ] **Infrastructure Setup**
  - [x] Configure TypeORM with PostgreSQL
  - [x] Configure Elasticsearch client
  - [x] Implement Storage Service (Local/S3 abstraction)

- [x] **API 2.1: Image Upload (POST /images/upload)**
  - [x] Create `Image` entity
  - [x] Create `ImageMetadata` entity
  - [x] Implement DTOs (`UploadImageDto`)
  - [x] Implement Controller & Service
  - [x] Verify file storage and DB insertion

## Phase 2: Metadata & Publishing

- [ ] **API 2.2: Publish Image (PATCH /images/:id/publish)**
  - [x] Implement DTOs (`PublishImageDto`)
  - [x] Implement Controller & Service
  - [x] Implement Elasticsearch Sync Logic (Decoupled w/ Events)
  - [x] Verify DB update and ES indexing


## Phase 3: Retrieval & Search

- [x] **API 2.3: Gallery List (GET /images)**
  - [x] Implement DTO (`GetImagesDto`)
  - [x] Connect to `SearchService` (Elasticsearch)
  - [x] Implement Pagination & Sorting

- [x] **API 2.4: Image Detail (GET /images/:id)**
  - [x] Implement Controller & Service - Read-Through Cache

- [x] **API 2.5: Universal Search (Merged into GET /images)**
  - [x] Implement Elasticsearch Query Logic
  - [x] Implement Bulk Sync (`POST /search/sync`)

## Phase 4: Quality Assurance

- [ ] **Testing**
  - [ ] Unit Tests for Services
  - [ ] E2E Tests for Endpoints
- [ ] **Documentation**
  - [ ] Verify Swagger UI

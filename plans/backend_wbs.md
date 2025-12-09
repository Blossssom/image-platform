# Backend Implementation WBS

This document tracks the progress of the backend API implementation based on `docs/specs/API_SPEC.md`.

## Phase 1: Foundation & Upload (Current)

- [ ] **Infrastructure Setup**
  - [x] Configure TypeORM with PostgreSQL
  - [ ] Configure Elasticsearch client
  - [x] Implement Storage Service (Local/S3 abstraction)

- [ ] **API 2.1: Image Upload (POST /images/upload)**
  - [x] Create `Image` entity
  - [x] Create `ImageMetadata` entity
  - [x] Implement DTOs (`UploadImageDto`)
  - [x] Implement Controller & Service
  - [ ] Verify file storage and DB insertion

## Phase 2: Metadata & Publishing

- [ ] **API 2.2: Publish Image (PATCH /images/:id/publish)**
  - [ ] Implement DTOs (`PublishImageDto`)
  - [ ] Implement Controller & Service
  - [ ] Implement Elasticsearch Sync Logic
  - [ ] Verify DB update and ES indexing

## Phase 3: Retrieval & Search

- [ ] **API 2.3: Gallery List (GET /images)**
  - [ ] Implement Cursor Pagination
  - [ ] Implement Controller & Service

- [ ] **API 2.4: Image Detail (GET /images/:id)**
  - [ ] Implement Controller & Service

- [ ] **API 2.5: Universal Search (GET /search)**
  - [ ] Implement Elasticsearch Query Logic
  - [ ] Implement Controller & Service

## Phase 4: Quality Assurance

- [ ] **Testing**
  - [ ] Unit Tests for Services
  - [ ] E2E Tests for Endpoints
- [ ] **Documentation**
  - [ ] Verify Swagger UI

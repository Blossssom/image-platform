# [Project Spec] AI Generative Image Sharing Platform

> **Version:** 1.0.0 (Entity Based)
> **Date:** 2025.11.24
> **Tech Stack:** NestJS, TypeORM, PostgreSQL, AWS (S3, EC2)

---

## 1. Project Overview

**Civitai**와 유사한 생성형 AI 이미지 공유 플랫폼. 단순 갤러리가 아닌 **Metadata(Prompt, Workflow, Model)**를 공유하여 이미지의 **재현 가능성(Reproducibility)**을 보장하는 것이 핵심 가치임.

---

## 2. Core Technical Strategy (핵심 로직)

### 2.1 Image Processing (3-Tier Strategy)

서버 비용 절감과 로딩 속도, 원본 보존을 위한 3단계 저장 전략.

1. **Thumbnail (`/thumb/`):** List/Grid용. **WebP**, Width 450px, Metadata 제거 (Strip).
2. **Preview (`/preview/`):** Detail용. **WebP**, Width 1600px, Metadata 제거 (Strip).
3. **Original (`/original/`):** Download/Analysis용. **PNG 원본**, Metadata 보존.

### 2.2 Metadata Parsing Flow

**순서가 매우 중요함.** 리사이징 시 메타데이터가 소실되므로 반드시 선행 처리.

1. `Multer`로 이미지 Buffer 수신.
2. **Buffer 상태에서 `exifr` / `png-chunk-text`로 메타데이터 추출.**
3. 추출된 데이터는 DB `generationInfo` (JSONB) 컬럼에 저장.
4. 이후 `Sharp`를 통해 리사이징 및 S3 업로드 수행.

### 2.3 Authentication (OAuth Only)

- ID/PW 회원가입 없음. OAuth(Google, Github) 전용.
- **확장성 구조:** `User` 테이블과 `SocialAccount` 테이블을 **1:N**으로 분리하여 추후 계정 통합 지원.

---

## 3. Functional Specifications (기능 명세)

| ID         | Category | Feature          | Description                                   | Priority | Tech Note             |
| :--------- | :------- | :--------------- | :-------------------------------------------- | :------- | :-------------------- |
| **USR-01** | Auth     | OAuth Login      | Google, GitHub 연동 (User-SocialAccount 구조) | **P0**   | Passport.js           |
| **USR-02** | User     | Profile          | 닉네임, 아바타, NSFW 필터 설정 (Blur/Hide)    | P1       |                       |
| **UP-01**  | Upload   | Image Upload     | Drag&Drop, Max 20MB, Multi-upload             | **P0**   | Multer                |
| **UP-02**  | Upload   | **Auto Parsing** | A1111/ComfyUI 메타데이터 자동 추출            | **P0**   | exifr, png-chunk-text |
| **UP-03**  | Upload   | Resizing         | 3-Tier (Thumb/Preview/Origin) 변환 저장       | **P0**   | Sharp                 |
| **GAL-01** | Gallery  | Masonry Grid     | Pinterest Style Layout (Aspect Ratio 유지)    | **P0**   | Frontend              |
| **GAL-02** | Gallery  | Infinite Scroll  | Cursor-based Pagination                       | **P0**   | QueryBuilder          |
| **DTL-01** | Detail   | Metadata View    | Prompt, Negative, Seed, Model 등 표출         | **P0**   | JSON Parser           |
| **DTL-02** | Detail   | Download         | 메타데이터가 살아있는 원본 다운로드           | **P0**   | Presigned URL         |
| **RES-01** | Resource | Model Mapping    | Model Hash 기반 리소스(LoRA/Checkpoint) 매핑  | P1       | Hash Lookup           |

---

## 4. Database Entities & Relations (TypeORM Context)

AI가 코드를 작성할 때 참고할 엔티티 구조 요약입니다. (실제 구현은 `src/entities/*.entity.ts` 참조)

### 4.1 User Domain

- **User:** `email`(Unique), `nickname`, `avatarUrl`, `nsfwFilter`(Enum: SHOW/BLUR/HIDE)
- **SocialAccount:** `provider`, `providerId`(sub), `userId` (FK). **User와 1:N 관계**.

### 4.2 Content Domain

- **Post:** `title`, `description`, `viewCount`, `userId` (FK). **여러 Image를 묶는 컨테이너**.
- **Image:**
  - **Files:** `urlOriginal`, `urlPreview`, `urlThumbnail` (3-Tier URLs).
  - **Specs:** `width`, `height`, `aspectRatio`.
  - **Metadata (Key):** `generationInfo` (**JSONB Type** - Prompt, Seed, Sampler 등 저장).
  - **Workflow:** `workflowUrl` (ComfyUI .json 파일 경로).
  - **Relation:** `Post`와 N:1 관계. `ImageResource`와 1:N 관계.

### 4.3 Resource Domain

- **Resource:** `hash`(Unique), `name`, `type`(Enum: CHECKPOINT, LORA...), `externalUrl`.
- **ImageResource:** `imageId`, `resourceId`, `weight`(Float). **Image와 Resource의 N:M 연결 테이블**.

### 4.4 Social Domain

- **ImageLike:** `userId`, `imageId` (Composite Key).
- **Comment:** `content`, `userId`, `imageId`, `parentId` (Self-referencing for replies).

---

## 5. Implementation Guidelines

### 5.1 TypeORM Pattern

- **공통 컬럼 (Database-First):** 모든 엔티티는 데이터베이스 스키마를 직접 반영하며, `id(uuid)`, `createdAt`, `updatedAt`, `deletedAt(soft-delete)` 필드를 개별적으로 포함합니다.
- **Naming:** DB 컬럼은 `snake_case`, Entity 프로퍼티는 `camelCase` 자동 매핑 사용.
- **Index:** `Image.generationInfo` 컬럼에는 반드시 **GIN Index**가 적용되어야 함 (Migration 파일에 Raw SQL 추가).

### 5.2 API Flow Example (Upload)

1. `POST /posts/upload` (Multipart)
2. Service Logic:
   - **Step 1:** `file.buffer`에서 메타데이터(JSON) 파싱.
   - **Step 2:** S3에 `Original` 업로드.
   - **Step 3:** Sharp로 `Preview(1600px)`, `Thumbnail(450px)` 리사이징 및 WebP 변환 후 S3 업로드.
   - **Step 4:** DB에 `Post` 및 `Image` 엔티티 저장 (JSONB 메타데이터 포함).

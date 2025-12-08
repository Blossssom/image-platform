# [Requirements] AI Generative Image Sharing Platform
- **Version:** v2.1 (Updated Storage Strategy)
- **Phase:** Phase 1 (Guest Mode MVP)

## 1. 프로젝트 개요
- **목표:** ComfyUI, WebUI 등으로 생성된 AI 이미지를 공유하고, 워크플로우/메타데이터를 통해 재현 가능성(Reproducibility)을 제공하는 플랫폼 구축.
- **운영 전략:** 2-Step 업로드 (Draft → Publish) 및 Cron Job을 통한 임시 파일 자동 삭제.

## 2. 기술 스택 (Tech Stack)
- **Frontend:** Next.js (App Router), TypeScript, FSD Architecture.
- **Backend:** NestJS, TypeORM, BullMQ (Queue).
- **Database:** PostgreSQL (Primary), Redis (Cache/Queue).
- **Search:** Elasticsearch (nori analyzer).
- **Infra:** Docker Compose (Local Dev), AWS (Production).
- **Storage Strategy (Hybrid):**
  - **Dev:** Local File System (`/uploads` 폴더 및 `ServeStatic` 활용).
  - **Prod:** AWS S3 (Signed URL or Public Bucket).

## 3. 핵심 기능 명세 (Functional Specs)

### 3.1 이미지 업로드 워크플로우 (2-Step)
- **UP-01 (File Upload):** - 최대 20MB 이미지 업로드.
  - **[Dev]** 로컬 디스크(`apps/server/uploads`)에 저장하고 정적 파일 URL 반환.
  - **[Prod]** S3 버킷에 저장하고 CloudFront/S3 URL 반환.
  - 원본(Original)과 썸네일(Thumbnail, WebP) 이원화 저장.
- **UP-02 (Auto Parsing):** 업로드 즉시 메타데이터(Exif/tEXt/JSON) 파싱.
- **UP-11 (Draft Saving):** 파싱 결과는 DB에 `status='DRAFT'`로 즉시 저장.
- **UP-13 (Publish):** 사용자가 파싱된 정보를 검수하고 `Draft` → `Published` 상태로 전환.

### 3.2 게시물 메타데이터 (User Input)
- **UP-08 (Title):** 게시물 제목 (필수).
- **UP-09 (Desc):** 상세 설명 (Markdown).
- **UP-12 (Tool):** 생성 툴 명시 (`WebUI`, `ComfyUI`).
- **UP-14 (Method):** 생성 방식 명시 (`txt2img`, `inpainting` 등).
- **UP-07 (Tags):** 태그 입력 (자동 추출 + 사용자 추가).

### 3.3 갤러리 및 검색
- **GAL-01 (Masonry):** 이미지 비율 유지 레이아웃.
- **GAL-04 (Search):** Elasticsearch 기반 통합 검색.

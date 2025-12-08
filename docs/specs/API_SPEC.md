# [API Specification] Endpoint Details
- **Base URL:** `/api/v1`
- **Auth:** Phase 1 Guest Mode

## 1. Developer Guide: Storage Strategy
Backend must implement **Storage Abstraction** to switch between Local FS and S3 based on `NODE_ENV`.
- **Development:** Save files to `./uploads` and serve via `ServeStaticModule`. URL format: `/uploads/{filename}`.
- **Production:** Upload to S3. URL format: `https://{bucket}.s3.{region}.amazonaws.com/{filename}`.

## 2. Endpoints

### 2.1 [Upload] Step 1: File Upload (Draft)
- **POST** `/images/upload`
- **Content-Type:** `multipart/form-data`
- **Body:** `file` (Binary), `nickname` (Optional)
- **Logic:** Storage Upload (Local/S3) -> Metadata Parsing -> DB Insert (Status: DRAFT)
- **Response (201):**
  - `id`: UUID (Draft ID)
  - `url`: String (e.g., "/uploads/1234.png" in Dev)
  - `parse_result`: { `tool`, `metadata`: { ... } }

### 2.2 [Publish] Step 2: Input Info (Publish)
- **PATCH** `/images/:id/publish`
- **Body:**
  - `title` (Required), `description`
  - `generation_tool` (Enum: 'WebUI', 'ComfyUI')
  - `generation_method` (Enum: 'txt2img', 'img2img', 'inpainting', 'controlnet', 'other')
  - `is_nsfw`, `tags`
- **Logic:** Update DB (`Draft` -> `Published`) -> Sync to Elasticsearch
- **Response (200):** `{ "id": "...", "status": "PUBLISHED" }`

### 2.3 [List] Gallery
- **GET** `/images`
- **Query:** `cursor`, `limit` (Default 20), `sort`
- **Response:** `{ "items": [ { "id", "url_thumbnail", "width", "height", "title", ... } ], "next_cursor": "..." }`

### 2.4 [Detail] Image View
- **GET** `/images/:id`
- **Response:** Full metadata, workflow JSON, stats, tags.

### 2.5 [Search] Universal Search
- **GET** `/search`
- **Query:** `q`, `type`, `sort`, `page`
- **Logic:** Query Elasticsearch `images_v1`.

## 3. Error Codes
- `FILE_TOO_LARGE` (413)
- `UNSUPPORTED_TYPE` (415)
- `PARSE_FAILED` (422)
- `DRAFT_NOT_FOUND` (404)

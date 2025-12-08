# [Data Modeling] Database & Search Schema
- **Version:** v1.3 (Draft/Publish Fields & Storage Path)

## 1. PostgreSQL Schema (TypeORM Entities)

### 1.1 Users
Phase 1에서는 Guest 처리를 위해 존재하며, `images.user_id`는 Nullable임.
- `id` (UUID, PK)
- `nickname` (Varchar, Optional)
- `created_at` (Timestamp)

### 1.2 Images (Master)
- `id` (UUID, PK)
- `user_id` (UUID, FK -> Users, Nullable)
- `url_original` (Varchar) -- Example: "/uploads/origin/abc.png" (Dev) or "https://s3.../abc.png" (Prod)
- `url_thumbnail` (Varchar) -- Example: "/uploads/thumb/abc.webp"
- `width` (Int), `height` (Int)
- `is_nsfw` (Boolean, Default: false)
- `status` (Varchar, Default: 'DRAFT') -- 'DRAFT' | 'PUBLISHED'
- `created_at` (Timestamp, Index)

### 1.3 ImageMetadata (1:1 with Images)
- `image_id` (UUID, PK/FK)
- `title` (Varchar, Nullable)
- `description` (Text, Nullable)
- `generation_tool` (Varchar, Nullable)
- `generation_method` (Varchar, Nullable)
- `positive_prompt` (Text), `negative_prompt` (Text)
- `model_hash` (Varchar, Index)
- `sampler`, `steps`, `cfg_scale`, `seed`
- `workflow` (JSONB)
- `raw_params` (JSONB)

### 1.4 ImageStats (1:1 with Images)
- `image_id` (UUID, PK/FK)
- `view_count` (BigInt, Default 0)
- `download_count` (BigInt, Default 0)
- `like_count` (BigInt, Default 0)

### 1.5 Tags & ImageTags (N:M)
- **Tags:** `id`, `name`, `type`
- **ImageTags:** `image_id`, `tag_id`

### 1.6 Models (Reference)
- `id`, `name`, `hash_v2`, `type`

---

## 2. Elasticsearch Mapping (JSON)
`images_v1` 인덱스 매핑 설정 (nori 분석기 포함).

```json
{
  "settings": {
    "number_of_shards": 1,
    "analysis": {
      "analyzer": {
        "prompt_analyzer": { "type": "standard" },
        "korean_analyzer": { "type": "custom", "tokenizer": "nori_tokenizer" }
      }
    }
  },
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "url_thumbnail": { "type": "keyword", "index": false },
      "width": { "type": "integer" },
      "height": { "type": "integer" },
      "is_nsfw": { "type": "boolean" },
      "created_at": { "type": "date" },
      "title": { "type": "text", "analyzer": "korean_analyzer" },
      "prompt": {
        "properties": {
          "positive": { "type": "text", "analyzer": "prompt_analyzer" },
          "negative": { "type": "text", "analyzer": "prompt_analyzer" }
        }
      },
      "model": {
        "properties": {
          "name": { "type": "text", "fields": { "raw": { "type": "keyword" } } },
          "hash": { "type": "keyword" }
        }
      },
      "tags": { "type": "keyword" },
      "user": {
        "properties": { "nickname": { "type": "text" } }
      },
      "stats": {
        "properties": {
          "view_count": { "type": "long" },
          "like_count": { "type": "long" }
        }
      }
    }
  }
}

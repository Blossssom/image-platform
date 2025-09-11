# 개요

ComfyUI/A1111 워크플로우 특화 이미지 공유 플랫폼을 위한 PostgreSQL 데이터베이스 스키마입니다. Pinterest/Civitai 스타일의 무한 스크롤 갤러리와 복잡한 AI 생성 파라미터 관리를 지원합니다.

## 기술 스택

데이터베이스: PostgreSQL 15+
확장 기능: uuid-ossp, pg_trgm, btree_gin
ORM: TypeORM (Nest.js)
인증: OAuth (Google, Discord, Facebook) + 이메일

## 테이블 구조

-- ==========================================
-- 1. 사용자 관련
-- ==========================================

-- 사용자 기본 정보
create table users (
id uuid primary key default uuid_generate_v4(),
email varchar(255) unique not null,
username varchar(50) unique not null,
display_name varchar(100),
password_hash varchar(255) not null,
avatar_url varchar(500),
bio text,
-- 계정 상태
is_verified boolean default false,
is_active boolean default true,
is_admin boolean default false,
-- 통계 (비정규화)
total_uploads integer default 0,
total_likes_received integer default 0,
follower_count integer default 0,
following_count integer default 0,
--시간 정보
email_verified_at timestamp,
last_login_at timestamp,
created_at timestamp default current_timestamp,
update_at timestamp default current_timestamp
);

-- 사용자 설정
create table user_preferences (
user_id uuid primary key references users(id) on delete cascade,
-- UI 설정
theme integer default 0, -- light, dark
grid_columns integer default 5, -- masonry 그리드 컬럼 수 (모바일: 2, 태블릿: 3, 데스크톱: 4-6)
image_quality integer default 0, -- thumbnail, medium, high
-- 콘텐츠 필터
nsfw_filter boolean default true,
show_ai_generated_only boolean default false,
show_metadata_images_only boolean default false,
-- 인터렉션 설정
auto_play_gifs boolean default true,
infinite_scroll boolean default true,
-- 알림 설정
notification_likes boolean default true,
notification_comments boolean default true,
notification_follows boolean default true,
email_notifications boolean default false,
created_at timestamp default current_timestamp,
updated_at timestamp default current_timestamp
);

-- 팔로우 시스템 (기획 예정)
create table user_follows (
follower_id uuid references users(id) on delete cascade,
following_id uuid references users(id) on delete cascade,
created_at timestamp default current_timestamp,
primary key (follower_id, following_id),
check (follower_id != following_id)
);

-- ==========================================
-- 2. 이미지 관련
-- ==========================================

-- 이미지 메인 테이블
create table images (
id uuid primary key default uuid_generate_v4(),
user_id uuid references users(id) on delete cascade,
-- 파일 정보
filename varchar(255) not null,
original_filename varchar(255), -- 업로드 시 원본 파일 명
image_path varchar(500) not null,
file_hash varchar(64), -- 파일 무결성 검증 (sha256)
file_size integer not null,
mime_type varchar(100) not null,
-- 이미지 차원
width integer not null,
height integer not null,
aspect_ratio decimal(10, 6) not null, -- width/height 정밀도 향상
-- 시각적 특성
dominant_color char(7), -- #RRGGBB 형태
average_brightness decimal(5, 2), -- 0-100 어두운/밝은 이미지 분류
color_palette jsonb, -- 주요 색상 팔레트 [#color1, #color2, ...]
-- 사용자 입력 정보
title varchar(200),
description text,
-- metadata (exif 및 ai 생성 정보)
exif_data jsonb,
generation_params jsonb,
-- ai 생성 관련 구조화 필드 (검색 최적화)
ai_model varchar(200),
ai_sampler varchar(100),
ai_steps integer,
ai_cfg_scale decimal(4, 1),
ai_seed bigint,
prompt text,
negative_prompt text,
-- 워크플로우 관련
has_workflow boolean default false,
workflow_complexity integer default 0, -- workflow 노드 수
-- 콘텐츠 분류 및 상태
is_nsfw boolean default false,
is_public boolean default true,
is_ai_generated boolean default true,
content_warning jsonb,
-- 라이센스 정보
license_type integer default 0, -- 0: all_rights_reserved, 1: cc0 ...
commercial_use boolean default false,
-- 통계 (성능 최적화를 위한 비정규화)
view_count integer default 0,
unique_view_count integer default 0, -- 중복제거된 뷰
like_count integer default 0,
bookmark_count integer default 0,
download_count integer default 0,
comment_count integer default 0,
share_count integer default 0,
workflow_download_count integer default 0,
-- 검색 및 추천 최적화
popularity_score integer default 0, -- 종합 인기도
trending_score integer default 0,
last_interaction_at timestamp default current_timestamp,
-- 시간 정보
taken_at timestamp, -- 원본 촬영/생성 시각
uploaded_at timestamp default current_timestamp,
updated_at timestamp default current_timestamp,
-- soft delete
deleted_at timestamp,
deleted_reason varchar(100)
);

-- ==========================================
-- 3. 워크플로우 관련
-- ==========================================

create table workflows (
id uuid primary key default uuid_generate_v4(),
image_id uuid references images(id) on delete cascade,
-- 워크플로우 데이터
workflow_data jsonb not null, -- comfyui workflow json
workflow_hash varchar(64) unique not null, -- sha256 해시
workflow_type integer default 0, -- 0: comfyui, 1: a1111 ...
workflow_version varchar(20), -- 워크플로우 포맷 버전
-- 사용자 입력 정보
title varchar(200),
description text,
category varchar(50), -- t2i, i2i ...
-- 워크플로우 분석 정보 (캐싱용)
node_count integer default 0,
node_types jsonb, -- 노드 종류 (ex: KSampler)
required_models jsonb, -- 필요한 모델 파일들
required_loras jsonb, -- 필요한 lora 파일들
difficulty_level integer default 0, -- 0: beginner, 1: intermediate ...
-- 라이센스
license_type integer default 0, -- 0: all_rights_reserved, 1: cc0 ...
commercial_use boolean default true,
-- 통계
download_count integer default 0,
favorite_count integer default 0,
rating_avg decimal(3, 2) default 0, -- 평점 (1.00 ~ 5.00)
rating_count integer default 0,
-- 상태
is_public boolean default true,
-- 시간 정보
created_at timestamp default current_timestamp,
updated_at timestamp default current_timestamp
);

-- 워크플로우 평점 시스템
create table workflow_ratings (
id uuid primary key default uuid_generate_v4(),
workflow_id uuid references workflows(id) on delete cascade,
user_id uuid references users(id) on delete cascade,
rating integer not null check (rating >= 1 and rating <= 5),
review text,
created_at timestamp default current_timestamp,
updated_at timestamp default current_timestamp,
unique(workflow_id, user_id)
);

-- ==========================================
-- 4. 태그 시스템 (자동 + 수동 태깅)
-- ==========================================

create table tags (
id serial primary key,
name varchar(100) unique not null,
slug varchar(100) unique not null, -- url 친화적 버전
-- 분류
category varchar(50),
parent_tag_id integer references tags(id), -- 계층형 태그
-- 시각적 표현
color char(7), -- 태그 표시용 색상
icon varchar(50), -- 아이콘 클래스 명
-- 설명
description text,
aliases jsonb, -- 동의어들
-- 통계 및 메타
usage_count integer default 0, -- 사용 횟수 (인기도 측정)
trending_score decimal(10, 2) default 0,
is_nsfw boolean default false,
is_verified boolean default true, -- 관리자 승인 태그
-- 생성 정보
created_by_user_id uuid references users(id), -- 최초 생성자
created_at timestamp default current_timestamp,
updated_at timestamp default current_timestamp
);

-- 이미지 - 태그 연결
create table image_tags (
image_id uuid references images(id) on delete cascade,
tag_id integer references tags(id) on delete cascade,
-- 태그 출처 및 신뢰도
tag_source integer not null, -- 'auto_exif', 'auto_ai', 'manual_user', 'manual_admin'
confidence decimal(4, 3), -- 자동 태그 신뢰도 (0.000 ~ 1.000)
-- 추가 정보
add_by_user_ud uuid references users(id), -- 수동 태그 추가자
verified_by_admin boolean default true, -- 관리자 검증 여부
created_at timestamp default current_timestamp,
primary key (image_id, tag_id)
);

-- ==========================================
-- 5. 사용자 인터랙션
-- ==========================================

create table user_interactions (
id uuid primary key default uuid_generate_v4(),
user_id uuid references users(id) on delete cascade,
image_id uuid references images(id) on delete cascade,
interaction_type integer not null, -- 0: like, 1: bookmark, 2: view, 3: share, 4: download
-- 추가 메타데이터
ip_hash inet,
user_agent text,
referrer varchar(500),
created_at timestamp default current_timestamp,
unique(user_id, image_id, interaction_type)
);

-- 컬렌셕 시스템
create table collections (
id uuid primary key default uuid_generate_v4(),
user_id uuid references users(id) on delete cascade,
name varchar(100) not null,
description text,
cover_image_id uuid references images(id), -- 컬렌션 대표 이미지
is_public boolean default true,
is_featured boolean default false, -- 관리자 추천 컬렉션
item_count integer default 0, -- 포함된 이미지 수
view_count integer default 0,
like_count integer default 0,
created_at timestamp default current_timestamp,
updated_at timestamp default current_timestamp
);

-- 컬렉션 - 이미지 연결
create table collection_items (
collection_id uuid references collections(id) on delete cascade,
image_id uuid references images(id) on delete cascade,
sort_order integer default 0, -- 컬렉션 내 정렬 순서
added_by_user_id uuid references users(id), -- 추가한 사용자 (협업 컬렉션용)
created_at timestamp default current_timestamp,
primary key (collection_id, image_id)
);

-- ==========================================
-- 6. 댓글 시스템
-- ==========================================

create table comments (
id uuid primary key default uuid_generate_v4(),
image_id uuid references images(id) on delete cascade,
user_id uuid references users(id) on delete cascade,
parent_comment_id uuid references comments(id), -- 답글용
content text not null,
content_type integer default 0, -- 0: text, 1: markdown
-- 상태
is_edited boolean default false,
is_pinned boolean default false, -- 고정 댓글 (이미지 업로더가 설정)
is_verified boolean default false,
-- 통계
like_count integer default 0,
reply_count integer default 0,
-- 시간
edited_at timestamp,
created_at timestamp default current_timestamp,
updated_at timestamp default current_timestamp,
deleted_at timestamp -- soft delete
);

-- 댓글 좋아요
create table comment_likes (
user_id uuid references users(id) on delete cascade,
comment_id uuid references comments(id) on delete cascade,
created_at timestamp default current_timestamp,
primary key (user_id, comment_id)
);

-- ==========================================
-- 7. 알림 시스템
-- ==========================================

create table notifications (
id uuid primary key default uuid_generate_v4(),
user_id uuid references users(id) on delete cascade,
actor_user_id uuid references users(id) on delete cascade, -- 액션을 수행한 사용자
-- 대상 객체들
target_image_id uuid references images(id) on delete cascade,
target_comment_id uuid references comments(id) on delete cascade,
target_workflow_id uuid references workflows(id) on delete cascade,
target_collection_id uuid references collections(id) on delete cascade,
-- 알림 정보
notification_type integer not null, -- 0: like, 1: comment, 2: follow, 3: workflow_download, 4: mention
title varchar(200) not null,
content text,
action_url varchar(500), -- 클릭 시 이동할 url
-- 상태
is_read boolean default false,
is_email_sent boolean default false,
created_at timestamp default current_timestamp
);

-- ==========================================
-- 8. 시스템 관리
-- ==========================================

create table reports (
id uuid primary key default uuid_generate_v4(),
reporter_user_id uuid references users(id) on delete cascade,
-- 신고 대상
reported_image_id uuid references images(id) on delete cascade,
reported_user_id uuid references users(id) on delete cascade,
reported_comment_id uuid references comments(id) on delete cascade,
reported_workflow_id uuid references workflows(id) on delete cascade,
-- 신고 내용
report_type integer not null, -- 'inappropriate', 'copyright', 'spam', 'harassment', 'fake'
category varchar(50), -- 세부 카테고리
reason text not null,
-- 처리 상태
status integer default 0, -- 0: pending, 1: investigating, 2: resolved, 3: dismissed
priority integer default 1, -- 0: low, 1: normal, 2: high, 3: urgent
-- 관리자 처리
reviewed_by_admin_id uuid references users(id),
reviewed_at timestamp,
admin_notes text,
resolution_action varchar(50), -- content_removed, user_warned, user_banned, no_action
created_at timestamp default current_timestamp,
updated_at timestamp default current_timestamp
);

-- 이미지 처리 큐 (백그라운드 작업용)
create table image_processing_jobs (
id uuid primary key default uuid_generate_v4(),
image_id uuid references images(id) on delete cascade,
job_type integer not null, -- 1: metadata_extract, 2: workflow_parse, 3: hash_generate, 4: ai_tag, 5: nsfw_detect
status integer default 0, -- pending, processing, completed, failed, cancelled
priority integer default 0, -- 우선순위 (높을수록 먼저 처리)
-- 진행 상황
progress integer default 0, -- 0 ~ 100
current_step varchar(100), -- 현재 처리 단계 설명
-- 결과 및 오류
result_data jsonb, -- 처리 결과 데이터
error_message text,
retry_count integer default 0,
max_retries integer default 3,
-- 시간 추적
scheduled_at timestamp default current_timestamp,
started_at timestamp,
completed_at timestamp,
created_at timestamp default current_timestamp
);

-- 시스템 설정
create table system_settings (
key varchar(100) primary key,
value jsonb not null,
description text,
category integer, -- 0: ui, 1: upload, 2: processing, 3: security
is_public boolean default false, -- ui에서 제어 가능 여부
updated_by_admin_id uuid references users(id),
created_at timestamp default current_timestamp,
updated_at timestamp default current_timestamp
);

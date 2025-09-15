AI 이미지 공유 플랫폼 기획서
ComfyUI/A1111 워크플로우 특화 커뮤니티

프로젝트 개요
목적

포트폴리오 목표: 현대적 풀스택 개발 역량 증명 (Nuxt.js + Nest.js)
기술적 도전: JSON 파싱, 이미지 처리, 워크플로우 시각화 등 복합 기술 구현
실무 경험: 기획부터 배포까지 전체 개발 생명주기 경험

서비스 정의
ComfyUI와 A1111의 워크플로우 및 생성 파라미터를 시각적으로 공유하는 특화 플랫폼
핵심 가치:

완전한 재현성: 워크플로우와 파라미터의 투명한 공유
학습 도구: 초보자가 전문가 기법을 쉽게 학습
기술 특화: ComfyUI/A1111에 최적화된 전문 기능

기술적 도전 과제

복잡한 JSON 구조 해석: ComfyUI 워크플로우 노드 관계 분석
실시간 그래프 렌더링: 워크플로우 시각화 성능 최적화
대용량 이미지 처리: 효율적 업로드/압축/CDN 연동
메타데이터 자동 추출: EXIF 및 생성 정보 파싱

기술 환경 분석
ComfyUI 워크플로우 구조
json{
"nodes": [
{
"id": 1,
"type": "CheckpointLoaderSimple",
"pos": [100, 200],
"widgets_values": ["model.safetensors"]
}
],
"links": [[1, 0, 2, 0, "MODEL"]],
"version": 0.4
}
A1111 메타데이터 구조
Steps: 20, Sampler: DPM++ 2M Karras, CFG scale: 7,
Seed: 123456789, Size: 512x768, Model: model_v1.5
경쟁 환경 분석

Civitai: 모델 중심, 워크플로우 시각화 부족
OpenArt: 프롬프트 중심, 복잡한 워크플로우 표현 한계
차별화 포인트: ComfyUI 워크플로우 전용 시각화 도구

핵심 요구사항
Must Have (핵심 기능)
이미지 관리

Pinterest 스타일 반응형 그리드 갤러리
드래그앤드롭 다중 이미지 업로드 (최대 10개, 50MB/개)
자동 메타데이터 추출 및 저장
원본 품질 유지한 다운로드

워크플로우 처리

ComfyUI workflow.json 파싱 및 시각화
이미지 드래그 시 워크플로우 오버레이 표시
노드 그래프 인터랙티브 렌더링 (줌/팬)
워크플로우 파일 다운로드 지원

메타데이터 표시

이미지 호버 시 생성 정보 툴팁
모델, LoRA, 프롬프트 등 구조화된 표시
파라미터 클립보드 복사 기능

Should Have (추가 기능)

태그/모델명 기반 검색 필터링
사용자 북마크/즐겨찾기 시스템
이미지별 댓글 시스템
개인 갤러리 및 컬렉션 관리

성능 요구사항

페이지 초기 로딩: 3초 이내
이미지 그리드 무한 스크롤: 1초 이내
워크플로우 렌더링: 복잡한 그래프 2초 이내
동시 사용자: 최소 100명 지원

기술 스택
프론트엔드
Nuxt.js 3.8+
├── Vue 3 Composition API
├── TypeScript 5.0+
├── Tailwind CSS 3.3+
└── Nuxt Modules
├── @nuxtjs/google-fonts
├── @pinia/nuxt (상태 관리)
└── @nuxt/image (이미지 최적화)
백엔드
Nest.js 10+
├── TypeScript 5.0+
├── TypeORM (PostgreSQL ORM)
├── Passport.js (인증)
├── Multer (파일 업로드)
└── Sharp (이미지 처리)
데이터베이스 & 인프라
PostgreSQL 15+
├── JSONB 컬럼 활용
└── Full-text 검색

AWS Services
├── S3 (이미지 저장)
├── CloudFront (CDN)
└── EC2/RDS (호스팅)
워크플로우 시각화

LiteGraph.js: ComfyUI 호환 노드 그래프 엔진
D3.js: 커스텀 시각화 및 인터랙션
Canvas API: 고성능 그래프 렌더링

개발 도구
개발 환경
├── ESLint + Prettier (코드 품질)
├── Husky + lint-staged (Pre-commit)
├── Jest + Vue Test Utils (테스팅)
└── Docker Compose (로컬 환경)

배포
├── GitHub Actions (CI/CD)
├── Vercel (프론트엔드 배포)
└── Railway (백엔드 API 배포)

시스템 아키텍처
전체 구조
┌─────────────────┐ ┌─────────────────┐
│ Nuxt.js App │ │ Nest.js API │
│ │────│ │
│ • Vue Components│ │ • Controllers │
│ • Pinia Stores │ │ • Services │
│ • Composables │ │ • Guards │
└─────────────────┘ └─────────────────┘
│ │
│ │
┌─────────────────┐ ┌─────────────────┐
│ Static CDN │ │ PostgreSQL DB │
│ │ │ │
│ • Images (S3) │ │ • User Data │
│ • Thumbnails │ │ • Image Meta │
│ • Assets │ │ • Workflows │
└─────────────────┘ └─────────────────┘
주요 API 엔드포인트
typescript// OAuth 인증
GET /api/auth/google
GET /api/auth/google/callback
GET /api/auth/github
GET /api/auth/github/callback
GET /api/auth/facebook
GET /api/auth/facebook/callback
POST /api/auth/logout
GET /api/auth/profile

// 이미지 관리
GET /api/images?page=1&limit=20&tags=[]
POST /api/images/upload
GET /api/images/:id
DELETE /api/images/:id

// 워크플로우
GET /api/workflows/:imageId
POST /api/workflows/parse
GET /api/workflows/:id/download

// 검색
GET /api/search?q=query&filters={}
데이터베이스 설계
핵심 테이블
sql-- 사용자 (OAuth 지원)
CREATE TABLE users (
id UUID PRIMARY KEY,
email VARCHAR UNIQUE,
username VARCHAR UNIQUE,
display_name VARCHAR,
avatar_url VARCHAR,
bio TEXT,
oauth_provider VARCHAR, -- 'google', 'github', 'facebook'
oauth_provider_id VARCHAR,
is_verified BOOLEAN DEFAULT FALSE,
is_active BOOLEAN DEFAULT TRUE,
total_uploads INTEGER DEFAULT 0,
total_likes_received INTEGER DEFAULT 0,
follower_count INTEGER DEFAULT 0,
following_count INTEGER DEFAULT 0,
created_at TIMESTAMP,
updated_at TIMESTAMP
);

-- 이미지 (핵심 테이블)
CREATE TABLE images (
id UUID PRIMARY KEY,
user_id UUID REFERENCES users(id),
filename VARCHAR,
width INTEGER,
height INTEGER,
aspect_ratio DECIMAL(5,3), -- Masonry 레이아웃 최적화용
file_size INTEGER,
storage_urls JSONB, -- 다중 해상도 URL 저장
metadata JSONB, -- EXIF, 색상 정보 등
generation_params JSONB, -- A1111/ComfyUI 생성 정보
has_workflow BOOLEAN DEFAULT false,
created_at TIMESTAMP
);

-- 워크플로우
CREATE TABLE workflows (
id UUID PRIMARY KEY,
image_id UUID REFERENCES images(id),
workflow_data JSONB, -- ComfyUI workflow.json
workflow_hash VARCHAR UNIQUE, -- 중복 워크플로우 감지용
download_count INTEGER DEFAULT 0,
created_at TIMESTAMP
);

-- 북마크/좋아요
CREATE TABLE user_interactions (
user_id UUID REFERENCES users(id),
image_id UUID REFERENCES images(id),
interaction_type VARCHAR, -- 'like', 'bookmark'
created_at TIMESTAMP,
PRIMARY KEY (user_id, image_id, interaction_type)
);
성능 최적화 인덱스
sqlCREATE INDEX idx_images_created_at ON images(created_at DESC);
CREATE INDEX idx_images_aspect_ratio ON images(aspect_ratio);
CREATE INDEX idx_images_has_workflow ON images(has_workflow) WHERE has_workflow = true;
CREATE INDEX idx_generation_params_model ON images USING GIN((generation_params->>'model'));
CREATE INDEX idx_user_interactions_image ON user_interactions(image_id, interaction_type);
이미지 처리 전략
다중 해상도 생성
typescriptinterface ImageUrls {
thumbnail: string; // 300px (그리드용)
medium: string; // 800px (모달용)
large: string; // 1200px (상세보기용)
original: string; // 원본 (다운로드용)
}

// S3 저장 구조
// /images/{user_id}/{image_id}/
// ├── thumbnail_300.webp
// ├── medium_800.webp
// ├── large_1200.webp
// └── original.{ext}
성능 최적화
typescript// 무한 스크롤 구현
const useInfiniteImages = (filters: FilterOptions) => {
return useInfiniteQuery({
queryKey: ['images', filters],
queryFn: ({ pageParam = 1 }) =>
fetchImages({ ...filters, page: pageParam }),
getNextPageParam: (lastPage) =>
lastPage.pagination.hasMore ? lastPage.pagination.nextPage : undefined,
staleTime: 5 _ 60 _ 1000, // 5분 캐싱
});
};

// Masonry 그리드 최적화
interface MasonryItem {
id: string;
aspectRatio: number; // DB에서 미리 계산된 값
url: string; // 적절한 해상도 선택
hasWorkflow: boolean; // 아이콘 표시용
}

개발 계획 (12주)
Phase 1: 기반 구축 (3주)
Week 1-2: 환경 설정
□ Nuxt.js 프로젝트 초기화
□ Nest.js API 서버 구축
□ PostgreSQL 스키마 설계
□ Docker 개발 환경 구성

Week 3: OAuth 인증 시스템
□ Google/GitHub/Facebook OAuth 통합
□ JWT 토큰 인증
□ OAuth 사용자 생성 및 계정 연동
□ 프론트엔드 OAuth 콜백 처리
Phase 2: 핵심 기능 (5주)
Week 4-5: 이미지 업로드 시스템
□ 파일 업로드 API (Multer + Sharp)
□ S3 연동 및 썸네일 생성
□ 드래그앤드롭 업로드 UI
□ 이미지 갤러리 구현

Week 6-7: 메타데이터 처리
□ EXIF 추출 및 파싱 시스템
□ A1111 파라미터 정규식 처리
□ 메타데이터 표시 UI
□ 검색 및 필터링 기능

Week 8: 워크플로우 시각화
□ ComfyUI JSON 파서 구현
□ LiteGraph.js 통합
□ 노드 그래프 렌더링
□ 인터랙티브 뷰어 구현
Phase 3: 고급 기능 (2주)
Week 9-10: 사용자 기능
□ 북마크/즐겨찾기 시스템
□ 댓글 시스템
□ 개인 갤러리
□ 사용자 프로필 페이지
Phase 4: 완성 및 배포 (2주)
Week 11: 테스트 및 최적화
□ 단위/통합 테스트 작성
□ 성능 최적화
□ 접근성 개선
□ 모바일 반응형 검증

Week 12: 배포 및 문서화
□ CI/CD 파이프라인 구축
□ 프로덕션 배포
□ API 문서화
□ 사용자 가이드 작성
주요 마일스톤

Week 3: OAuth 인증 시스템 완료
Week 7: 이미지 갤러리 + 메타데이터 완료
Week 8: 워크플로우 시각화 완료
Week 10: 모든 핵심 기능 완료
Week 12: 배포 완료

리스크 관리
기술적 리스크
높은 리스크
워크플로우 시각화 복잡성

문제: LiteGraph.js와 ComfyUI 호환성 이슈 가능
완화방안: D3.js 대안 준비, 단계적 구현
비상계획: 단순한 텍스트 기반 표시로 대체

대용량 이미지 처리 성능

문제: 서버 리소스 부족 시 업로드 실패
완화방안: Sharp.js 최적화, 클라우드 처리 활용
비상계획: 파일 크기 제한 강화

중간 리스크
메타데이터 파싱 정확도

문제: A1111/ComfyUI 버전별 형식 차이
완화방안: 다양한 샘플 데이터로 테스트
비상계획: 수동 입력 옵션 제공

성능 최적화

문제: 대용량 이미지 그리드 로딩 지연
완화방안: 가상 스크롤링, CDN 활용
비상계획: 페이지네이션으로 대체

성공 기준
최소 성공 기준 (MVP)

이미지 업로드/다운로드 정상 작동
메타데이터 표시 기능 구현
기본적인 워크플로우 시각화
검색/필터링 기능

완전 성공 기준

모든 계획된 기능 구현
90% 이상 테스트 커버리지
3초 이내 페이지 로딩
프로덕션 배포 완료

최종 목표
ComfyUI/A1111 사용자들이 실제로 사용할 만한 품질의 특화 플랫폼 구축을 통한 포트폴리오 완성

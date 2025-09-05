#!/bin/bash
set -e

# 색상 정의
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}🚀 개발 환경 시작...${NC}"

# 환경 변수 체크
check_env() {
    if [ ! -f ".env" ]; then
        echo -e "${YELLOW}⚠️  .env 파일이 없습니다. setup.sh를 먼저 실행하세요.${NC}"
        exit 1
    fi
}

# Docker 서비스 시작 (PostgreSQL, Redis 등)
start_services() {
    if [ -f "docker-compose.yml" ]; then
        echo -e "${BLUE}🐳 Docker 서비스 시작...${NC}"
        docker-compose up -d postgres redis
        
        # DB 연결 대기
        echo -e "${BLUE}⏳ 데이터베이스 준비 대기...${NC}"
        sleep 3
    fi
}

# 의존성 확인 및 설치
check_dependencies() {
    echo -e "${BLUE}📦 의존성 확인...${NC}"
    
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  의존성을 설치합니다...${NC}"
        pnpm install
    fi
}

# 개발 서버 시작
start_dev_servers() {
    echo -e "${GREEN}🚀 개발 서버 시작...${NC}"
    echo ""
    echo -e "${BLUE}접속 URL:${NC}"
    echo "Frontend: http://localhost:3000"
    echo "Backend:  http://localhost:3001"
    echo "API Docs: http://localhost:3001/api/docs"
    echo ""
    echo -e "${YELLOW}중지하려면 Ctrl+C를 누르세요${NC}"
    echo ""
    
    # 병렬로 개발 서버 실행
    pnpm dev
}

# 메인 실행
main() {
    check_env
    start_services
    check_dependencies
    start_dev_servers
}

# 인터럽트 핸들러
cleanup() {
    echo -e "\n${YELLOW}🛑 개발 서버 중지 중...${NC}"
    if [ -f "docker-compose.yml" ]; then
        docker-compose stop
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM

main "$@"
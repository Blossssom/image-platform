#!/bin/bash
set -e

echo "🚀 AI Image Platform 초기 설정 시작..."

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 필수 도구 체크
check_requirements() {
    echo -e "${BLUE}📋 필수 도구 확인 중...${NC}"
    
    if ! command -v node &> /dev/null; then
        echo -e "${RED}❌ Node.js가 설치되지 않았습니다.${NC}"
        exit 1
    fi
    
    if ! command -v pnpm &> /dev/null; then
        echo -e "${YELLOW}⚠️  pnpm이 설치되지 않았습니다. 설치 중...${NC}"
        npm install -g pnpm
    fi
    
    if ! command -v docker &> /dev/null; then
        echo -e "${YELLOW}⚠️  Docker가 설치되지 않았습니다. (선택사항)${NC}"
    fi
    
    echo -e "${GREEN}✅ 필수 도구 확인 완료${NC}"
}

# 환경 변수 파일 생성
setup_env_files() {
# 의존성 설치
install_dependencies() {
    echo -e "${BLUE}📦 의존성 설치 중...${NC}"
    
    # 루트 의존성 설치
    pnpm install
    
    # 각 앱별 의존성 확인
    echo -e "${BLUE}🔍 앱별 설정 확인...${NC}"
    if [ -d "apps/frontend" ] && [ -f "apps/frontend/package.json" ]; then
        echo -e "${GREEN}✅ Frontend 앱 감지${NC}"
    fi
    
    if [ -d "apps/backend" ] && [ -f "apps/backend/package.json" ]; then
        echo -e "${GREEN}✅ Backend 앱 감지${NC}"
    fi
    
    echo -e "${GREEN}✅ 의존성 설치 완료${NC}"
}

# Git hooks 설정
setup_git_hooks() {
    echo -e "${BLUE}🪝 Git hooks 설정 중...${NC}"
    
    # Husky 설치 및 설정
    if [ -f "package.json" ]; then
        pnpm add -D -w husky lint-staged
        npx husky install
        
        # Pre-commit hook
        cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

pnpm lint-staged
EOF
        chmod +x .husky/pre-commit
        
        # Commit-msg hook
        cat > .husky/commit-msg << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Commit message convention check
commit_regex='^(feat|fix|docs|style|refactor|test|chore)(\(.+\))?: .{1,50}'
if ! grep -qE "$commit_regex" "$1"; then
    echo "❌ 커밋 메시지가 규칙에 맞지 않습니다."
    echo "형식: type(scope): description"
    echo "예시: feat(frontend): add image upload component"
    exit 1
fi
EOF
        chmod +x .husky/commit-msg
        
        echo -e "${GREEN}✅ Git hooks 설정 완료${NC}"
    fi
}

# VSCode 설정
setup_vscode() {
    echo -e "${BLUE}💻 VSCode 설정 중...${NC}"
    
    mkdir -p .vscode
    
    # Settings
    cat > .vscode/settings.json << 'EOF'
{
  "typescript.preferences.preferTypeOnlyAutoImports": true,
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.css": "tailwindcss"
  },
  "tailwindCSS.includeLanguages": {
    "vue": "html",
    "typescript": "javascript"
  },
  "vue.inlayHints.missingProps": true,
  "vue.inlayHints.inlineHandlerLeading": true
}
EOF
    
    # Extensions recommendations
    cat > .vscode/extensions.json << 'EOF'
{
  "recommendations": [
    "Vue.volar",
    "bradlc.vscode-tailwindcss", 
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-json"
  ]
}
EOF
    
    echo -e "${GREEN}✅ VSCode 설정 완료${NC}"
}

# 스크립트 실행 권한 부여
setup_script_permissions() {
    echo -e "${BLUE}🔐 스크립트 실행 권한 설정 중...${NC}"
    
    find scripts -name "*.sh" -type f -exec chmod +x {} \;
    
    echo -e "${GREEN}✅ 스크립트 권한 설정 완료${NC}"
}

# 메인 실행
main() {
    check_requirements
    install_dependencies
    setup_git_hooks
    setup_vscode
    setup_script_permissions
    
    echo ""
    echo -e "${GREEN}🎉 프로젝트 초기 설정이 완료되었습니다!${NC}"
    echo ""
    echo -e "${BLUE}다음 단계:${NC}"
    echo "1. .env 파일들을 실제 값으로 수정"
    echo "2. 데이터베이스 설정: ./scripts/db/reset.sh"
    echo "3. 개발 서버 실행: pnpm dev"
    echo ""
}

# 스크립트 실행
main "$@"
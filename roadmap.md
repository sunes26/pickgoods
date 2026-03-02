# PickGoods 프로젝트 구현 로드맵

## 📋 프로젝트 개요
**목표**: 지마켓 위탁판매 상품 979개의 구매전환율을 높이기 위한 AI 기반 상황 맞춤형 큐레이션 서비스

**핵심 전략**: 단순 상품 나열이 아닌, 고객의 상황에 맞춘 스토리텔링으로 구매 명분 제공

**현재 보유 데이터**: goods-list-result.xlsx (979개 상품)
- 판매 가능: 979개
- 주요 카테고리: 식품(322), 컴퓨터(238), 건강의료용품(117), 의류(84), 패션잡화(74), 문구/사무용품(46), 홈인테리어/가구(40) 등
- 가격대: 1,500원 ~ 3,452,000원 (중간값: 65,000원)

---

## 🎯 Phase 1: 프로젝트 초기 세팅 (1주차)

### 1.1 개발 환경 구축
- [ ] Node.js 18+ 설치 확인
- [ ] Python 3.9+ 설치 (크롤러용)
- [ ] Git 리포지토리 세팅
- [ ] 프로젝트 구조 설계

### 1.2 기술 스택 확정
**프론트엔드**
- Next.js 14 (App Router)
- React 18
- Tailwind CSS
- TypeScript

**백엔드/AI**
- Next.js API Routes (풀스택 구조)
- OpenAI GPT-4o-mini API
- Python (크롤러 전용)

**데이터베이스**
- JSON 파일 기반 (초기)
- 추후 SQLite 또는 PostgreSQL 고려

**배포**
- Vercel (프론트엔드 + API)
- Cloudflare 또는 AWS S3 (이미지 저장)

### 1.3 Next.js 프로젝트 생성
```bash
npx create-next-app@latest pickgoods --typescript --tailwind --app
cd pickgoods
npm install
```

---

## 🕷️ Phase 2: 데이터 수집 시스템 구축 (1-2주차)

### 2.1 지마켓 상품 데이터 정리 ✅
- [x] 현재 위탁판매 중인 979개 상품 데이터 확보 (goods-list-result.xlsx)
  - 컬럼: `상품번호`, `상품명`, `판매가`, `카테고리`, `판매상태` 등
  - 지마켓 URL 생성 가능: `http://item.gmarket.co.kr/Item?goodscode={상품번호}`
- [x] 카테고리 분류 체계 확정
  - 식품(322개), 컴퓨터(238개), 건강의료용품(117개), 의류(84개), 패션잡화(74개), 문구/사무용품(46개), 홈인테리어/가구(40개), 기타

### 2.2 image_scraper.py 개발
**목적**: 지마켓 상품 페이지에서 썸네일 이미지 URL 추출

**기능**
- [ ] Selenium WebDriver 세팅 (Chrome)
- [ ] goods-list-result.xlsx에서 상품번호 읽기
- [ ] 각 상품 페이지 접속 (`http://item.gmarket.co.kr/Item?goodscode={상품번호}`)
- [ ] 썸네일 이미지 URL 추출
- [ ] 상품 설명 크롤링 (가능 시)
- [ ] JSON 파일로 저장 (`products.json`)
- [ ] 에러 핸들링 (로그 기록, 크롤링 실패 상품 리스트)
- [ ] 주기적 업데이트 스크립트 (cron 또는 GitHub Actions)

**필수 라이브러리**
```bash
pip install selenium webdriver-manager pandas openpyxl
```

**출력 형식** (`products.json`)
```json
[
  {
    "id": "4683847702",
    "name": "전동마사지기 진동 마사지건 DDOL_7030450",
    "price": 68500,
    "category": "건강의료용품",
    "image_url": "https://gdimg.gmarket.co.kr/...",
    "product_url": "http://item.gmarket.co.kr/Item?goodscode=4683847702",
    "tags": ["마사지", "전동", "진동", "안마"],
    "description": "...",
    "status": "판매가능"
  }
]
```

### 2.3 이미지 호스팅 전략
- [ ] Option 1: 지마켓 썸네일 URL 직접 사용 (빠름, 외부 의존)
- [ ] Option 2: 이미지 다운로드 후 Cloudflare R2/AWS S3 업로드 (안정적)

---

## 🎨 Phase 3: 프론트엔드 구현 (2-3주차)

### 3.1 기본 레이아웃 구성
- [ ] `app/layout.tsx`: 전역 스타일, 메타태그, 폰트
- [ ] Navigation 컴포넌트 구현 (AI 추천 / 상품 목록 토글)
- [ ] Footer 컴포넌트

### 3.2 페이지별 구현
**1) 홈 화면** (`app/page.tsx`)
- [ ] "맞춤 추천 시작" / "전체 상품 보기" 버튼
- [ ] 히어로 섹션 애니메이션
- [ ] example.js의 `HomeStep` 컴포넌트 재현

**2) AI 추천 플로우** (`app/curation/page.tsx`)
- [ ] **Step 1: 입력 폼**
  - 상황/고민 textarea
  - 우선순위 선택 (가성비/밸런스/디자인)
  - 예산 range 슬라이더
- [ ] **Step 2: 로딩 화면**
  - 스피너 애니메이션
  - "979개 데이터 분석 중..." 메시지
- [ ] **Step 3: 추천 결과**
  - 3개의 추천 상품 카드
  - AI 추천 이유 텍스트
  - 지마켓 바로가기 버튼 (affiliate 링크)

**3) 전체 상품 목록** (`app/products/page.tsx`)
- [ ] 카테고리 필터 (전체, 식품, 컴퓨터, 건강의료용품, 의류, 패션잡화, 문구/사무용품, 홈인테리어/가구)
- [ ] 그리드 레이아웃 (2열 모바일 / 6열 데스크톱)
- [ ] 상품 카드 컴포넌트
- [ ] 무한 스크롤 또는 페이지네이션 (979개 상품)

### 3.3 컴포넌트 설계
```
/components
  /ui
    - Button.tsx
    - Card.tsx
    - CategoryFilter.tsx
  /products
    - ProductCard.tsx
    - ProductGrid.tsx
  /curation
    - SituationForm.tsx
    - RecommendationCard.tsx
    - LoadingState.tsx
```

### 3.4 반응형 디자인 적용
- [ ] 모바일 우선 (320px~)
- [ ] 태블릿 (768px~)
- [ ] 데스크톱 (1024px~)

---

## 🤖 Phase 4: AI 추천 시스템 구현 (3-4주차)

### 4.1 OpenAI API 세팅
- [ ] OpenAI API 키 발급
- [ ] `.env.local` 파일 생성
```env
OPENAI_API_KEY=sk-...
```
- [ ] `npm install openai` 설치

### 4.2 추천 로직 API 개발
**엔드포인트**: `POST /api/recommend`

**입력**
```json
{
  "situation": "자취를 처음 시작해서 주방 용품이 필요해요",
  "priority": "price",
  "budget": 50000
}
```

**처리 흐름**
1. `products.json` 로드
2. 예산 범위 필터링 (budget ± 20%)
3. GPT-4o-mini에게 프롬프트 전송
   ```
   역할: 지마켓 쇼핑 큐레이터

   상황: {situation}
   우선순위: {priority}
   예산: {budget}원

   다음 상품 목록 중에서 가장 적합한 3개를 선택하고,
   각 상품이 왜 이 상황에 필요한지 2문장으로 설명해주세요.

   상품 목록:
   {filtered_products}

   응답 형식:
   [
     {
       "product_id": 1,
       "reason": "설명..."
     }
   ]
   ```
4. GPT 응답 파싱
5. 선택된 상품의 전체 정보 반환

**출력**
```json
{
  "recommendations": [
    {
      "id": 1,
      "name": "원룸 필수 미니 냄비 세트",
      "price": 25000,
      "image_url": "...",
      "product_url": "...",
      "reason": "자취 초보에게 꼭 필요한 기본 조리 도구입니다..."
    }
  ]
}
```

### 4.3 성능 최적화
- [ ] 응답 캐싱 (동일 입력 → 같은 결과 재사용)
- [ ] GPT 토큰 사용량 모니터링
- [ ] Rate limiting (과도한 API 호출 방지)

### 4.4 태그 시스템 구축
- [ ] 각 상품에 태그 자동 생성 (GPT 활용)
  - 예: "캠핑용품" → `["캠핑", "아웃도어", "텐트", "1인"]`
- [ ] 태그 기반 1차 필터링으로 GPT 호출 효율화

---

## 🚀 Phase 5: 배포 및 테스트 (4주차)

### 5.1 Vercel 배포
- [ ] Vercel 계정 연동
- [ ] 환경 변수 설정 (OPENAI_API_KEY)
- [ ] 도메인 연결 (예: pickgoods.com)
- [ ] HTTPS 적용

### 5.2 성능 테스트
- [ ] 로딩 속도 최적화 (이미지 lazy loading)
- [ ] Lighthouse 점수 90+ 달성
- [ ] 모바일 성능 체크

### 5.3 A/B 테스트 준비
- [ ] Google Analytics 4 설치
- [ ] 전환율 추적 이벤트 설정
  - `curation_start`: 맞춤 추천 시작
  - `curation_submit`: 분석 요청
  - `product_click`: 지마켓 바로가기 클릭
- [ ] 히트맵 도구 설치 (Hotjar 또는 Microsoft Clarity)

---

## 📈 Phase 6: 마케팅 및 운영 (5주차~)

### 6.1 콘텐츠 마케팅 (월 5만원)
- [ ] Instagram 릴스: "이런 상황엔 이 물건" 시리즈
- [ ] YouTube 숏폼: PickGoods 사용 후기
- [ ] 블로그 포스팅: "합리적인 쇼핑을 위한 AI 활용법"

### 6.2 SNS 광고 (월 20만원)
**타겟팅**
- 연령: 25-45세
- 관심사: 지마켓, 쿠팡, 인테리어, 자취생활
- 지역: 수도권 우선

**광고 소재**
- "979개 상품 중 딱 맞는 3개만 골라드려요"
- "지마켓 위탁판매 + AI 추천 = 구매전환율 3배↑"

### 6.3 전환율 개선 실험
- [ ] 추천 개수 조정 (3개 vs 5개)
- [ ] 추천 이유 길이 최적화
- [ ] CTA 버튼 문구 테스트
- [ ] 상품 이미지 크기/품질 개선

### 6.4 운영 자동화
- [ ] 주 1회 자동 크롤링 (GitHub Actions)
- [ ] 품절 상품 자동 제외
- [ ] 가격 변동 자동 업데이트

---

## 🔧 Phase 7: 고도화 (6주차~)

### 7.1 기능 추가
- [ ] 사용자 피드백 수집 ("이 추천이 도움됐나요?")
- [ ] 추천 결과 공유 기능 (카카오톡, Instagram)
- [ ] 위시리스트 기능
- [ ] 과거 추천 기록 저장

### 7.2 AI 정확도 개선
- [ ] 사용자 피드백 기반 프롬프트 튜닝
- [ ] 구매 전환된 패턴 분석
- [ ] Fine-tuning 데이터셋 구축 (장기)

### 7.3 데이터베이스 마이그레이션
- [ ] JSON → PostgreSQL 전환
- [ ] 상품 검색 인덱싱
- [ ] 사용자 행동 로그 저장

### 7.4 멀티 플랫폼 확장
- [ ] 옥션 상품 추가
- [ ] 11번가 연동
- [ ] 네이버 스마트스토어 연동

---

## 📊 성공 지표 (KPI)

| 지표 | 목표 (1개월) | 목표 (3개월) |
|------|--------------|--------------|
| 일 방문자 수 (DAU) | 100명 | 500명 |
| AI 추천 사용률 | 60% | 70% |
| 지마켓 클릭률 (CTR) | 15% | 25% |
| 구매 전환율 | 3% | 5% |
| 평균 체류 시간 | 2분 | 3분 |

---

## 💰 예산 배분 (월 30만원)

| 항목 | 금액 | 비고 |
|------|------|------|
| SNS 광고 (Instagram) | 20만원 | 주 5만원 집행 |
| 콘텐츠 제작 | 5만원 | 프리랜서 에디터 |
| OpenAI API 비용 | 2만원 | 월 1000회 추천 가정 |
| 도메인/호스팅 | 1만원 | Vercel Pro (필요시) |
| 이미지 스토리지 | 1만원 | Cloudflare R2 |
| 예비비 | 1만원 | 돌발 상황 대응 |

---

## ⚠️ 리스크 및 대응 방안

### 1. 크롤링 차단
**문제**: 지마켓이 크롤러 IP 차단
**대응**: User-Agent 랜덤화, 요청 간 딜레이 추가, Proxy 사용

### 2. AI 추천 부정확
**문제**: GPT가 엉뚱한 상품 추천
**대응**: 프롬프트 엔지니어링 개선, 태그 기반 1차 필터링 강화

### 3. 상품 품절
**문제**: 추천했는데 품절된 상품
**대응**: 실시간 재고 API 연동 (지마켓 API 활용), 주 1회 자동 크롤링

### 4. 낮은 전환율
**문제**: 클릭은 많은데 구매가 안 됨
**대응**: 추천 이유 품질 개선, 가격대 조정, 상품 퀄리티 재검토

---

## 📅 타임라인 요약

| 주차 | 주요 작업 | 완료 기준 |
|------|-----------|-----------|
| 1주 | 프로젝트 세팅, 기술 스택 확정 | Next.js 프로젝트 생성 완료 |
| 2주 | 크롤러 개발, products.json 생성 | 979개 상품 이미지 URL 수집 완료 |
| 3주 | 프론트엔드 UI 구현 | example.js 디자인 완벽 재현 |
| 4주 | AI 추천 API 개발 | GPT 연동 및 추천 결과 출력 |
| 5주 | 배포 및 베타 테스트 | Vercel 배포, 지인 10명 테스트 |
| 6주~ | 마케팅 시작, 지속 개선 | 일 100명 방문자 달성 |

---

## 🎯 진행 상황

1. ✅ readme.md 이해 완료
2. ✅ example.js UI 디자인 분석 완료
3. ✅ goods-list-result.xlsx 데이터 확인 완료 (979개 상품)
4. 🔄 **Next.js 프로젝트 초기 세팅** ← 지금 여기
5. ⬜ 엑셀 데이터 → JSON 변환 스크립트
6. ⬜ image_scraper.py 개발

---

**작성일**: 2026-02-25
**최종 수정**: 2026-02-25
**버전**: 1.1
**작성자**: PickGoods Project Team

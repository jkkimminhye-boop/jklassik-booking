# JKLASSIK 시원스쿨 화상 유학상담 예약 시스템

제이클래식의 시원스쿨 학생 전용 화상 유학상담 예약 및 관리 시스템입니다.

## 기술 스택

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **SMS/카톡**: 알리고문자 API
- **Deployment**: Vercel

## 주요 기능

### 학생용
- 📅 주간 캘린더 기반 예약 시스템
- 🎯 실시간 슬롯 상태 확인 (예약가능, 마감, 예약종료)
- 📝 예약 정보 입력 폼
- 🔗 예약 취소/변경 (토큰 기반 링크)
- 📱 자동 문자(카톡/SMS) 발송

### 관리자
- 🔐 로그인 시스템
- 📊 대시보드 (통계 및 예약 목록)
- ✏️ 예약 상태 관리 (신청중, 확정, 취소)
- 📅 슬롯 관리 (비활성화)

## 설치 및 실행

### 1. 환경 설정

```bash
npm install
```

### 2. 환경변수 설정 (.env.local)

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
ALIGO_API_KEY=your_aligo_api_key
ALIGO_USER_ID=your_aligo_user_id
NEXT_PUBLIC_APP_URL=https://booking.jklassik.com
```

### 3. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 에서 접속 가능

## URL 구조

- `/` - 학생 예약 페이지
- `/manage?token=xxx` - 예약 취소/변경
- `/admin/login` - 관리자 로그인
- `/admin/dashboard` - 관리자 대시보드

## 관리자 테스트 계정

- 이메일: `admin@jklassik.com`
- 비밀번호: `admin123`

## Vercel 배포

### 1. GitHub에 저장소 생성

```bash
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jklassik-booking.git
git push -u origin main
```

### 2. Vercel에서 배포

1. https://vercel.com 에 접속
2. GitHub 계정으로 로그인
3. "Import Project" → 이 저장소 선택
4. Environment Variables 설정:
   - `ALIGO_API_KEY`
   - `ALIGO_USER_ID`
   - `NEXT_PUBLIC_APP_URL` (Vercel 배포 URL)
5. Deploy 클릭

## API 엔드포인트

### POST /api/bookings/create
예약 생성 및 문자 발송

**요청:**
```json
{
  "student_name": "홍길동",
  "phone_number": "010-1234-5678",
  "email": "student@email.com",
  "education_level": "대학교 졸업",
  "major": "음악",
  "consultation_content": "독일 음악 유학 계획",
  "consultation_date": "2026-06-02",
  "consultation_time": "14:00"
}
```

**응답:**
```json
{
  "success": true,
  "booking_no": "JK-260602-1234",
  "message": "예약이 완료되었습니다."
}
```

## 라이선스

Internal Use Only

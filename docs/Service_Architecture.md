# Course Optimizer 서비스 아키텍처

## 1. 시스템 개요

Course Optimizer는 산업공학과 학생들의 졸업요건 관리와 수강 계획 최적화를 도와주는 웹 애플리케이션입니다.

### 주요 기능
- 사용자 인증 및 관리
- 졸업요건 진도 확인
- 수강 과목 추천
- 개인 수강 계획 관리

## 2. 아키텍처 구조도

```
┌─────────────────────────────────────────────────────────────┐
│                    사용자 (브라우저)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/HTTPS
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                 Frontend Layer                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │            React.js Application                         ││
│  │  ┌─────────────┬──────────────┬──────────────────────┐  ││
│  │  │    Pages    │  Components  │       Context        │  ││
│  │  │  - HomePage │  - Progress  │   - AuthContext     │  ││
│  │  │  - LoginPage│    Card      │                      │  ││
│  │  │  - MyPage   │  - Recommend │                      │  ││
│  │  │  - Signup   │    Courses   │                      │  ││
│  │  │  - Require  │              │                      │  ││
│  │  │    ments    │              │                      │  ││
│  │  └─────────────┴──────────────┴──────────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────┬───────────────────────────────────┘
                          │ REST API
                          │ (JSON)
┌─────────────────────────▼───────────────────────────────────┐
│                 Backend Layer                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Flask Application                          ││
│  │  ┌─────────────┬──────────────┬──────────────────────┐  ││
│  │  │  API Routes │   Services   │    Middleware        │  ││
│  │  │  - /auth    │  - AuthSvc   │  - JWT Token        │  ││
│  │  │  - /users   │  - UserSvc   │    Validation       │  ││
│  │  │  - /courses │  - CourseSvc │  - CORS Handler     │  ││
│  │  │  - /recommend│ - RecommendSvc│                    │  ││
│  │  └─────────────┴──────────────┴──────────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────┬───────────────────────────────────┘
                          │ SQL Queries
                          │ (SQLAlchemy ORM)
┌─────────────────────────▼───────────────────────────────────┐
│                   Data Layer                                │
│  ┌─────────────────────────────────────────────────────────┐│
│  │                SQLite Database                          ││
│  │  ┌─────────────┬──────────────┬──────────────────────┐  ││
│  │  │    Users    │   Courses    │    User_Courses      │  ││
│  │  │  - id       │  - code      │  - user_id          │  ││
│  │  │  - email    │  - name      │  - course_code      │  ││
│  │  │  - password │  - credits   │  - status           │  ││
│  │  │  - created  │  - category  │  - grade            │  ││
│  │  │             │  - semester  │  - completed_date   │  ││
│  │  └─────────────┴──────────────┴──────────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘

```

## 3. 기술 스택

### Frontend
- **Framework**: React.js 19.1.0
- **Routing**: React Router DOM 7.6.3
- **Build Tool**: Vite 7.0.2
- **Styling**: CSS3
- **HTTP Client**: Fetch API

### Backend
- **Framework**: Flask
- **Database ORM**: Flask-SQLAlchemy
- **Authentication**: JWT (PyJWT)
- **CORS**: Flask-CORS
- **Language**: Python 3.x

### Database
- **Type**: SQLite
- **Location**: Local file (users.db)

## 4. API 설계

### 인증 관련 API
```
POST /signup              # 사용자 회원가입
POST /login               # 사용자 로그인
POST /logout              # 사용자 로그아웃
GET  /protected           # 토큰 검증
```

### 사용자 관리 API
```
GET  /user/profile        # 사용자 프로필 조회
PUT  /user/profile        # 사용자 프로필 수정
```

### 과목 관리 API
```
GET  /courses             # 전체 과목 목록 조회
GET  /courses/search      # 과목 검색
GET  /courses/categories  # 과목 카테고리별 조회
```

### 수강 관리 API
```
GET  /user/courses        # 사용자 수강 과목 조회
POST /user/courses        # 수강 과목 추가
PUT  /user/courses/:id    # 수강 과목 수정
DELETE /user/courses/:id  # 수강 과목 삭제
```

### 추천 시스템 API
```
GET  /recommend/courses   # 개인화된 과목 추천
GET  /graduation/progress # 졸업요건 진도 조회
```

## 5. 데이터 모델

### User 테이블
```sql
CREATE TABLE user (
    id INTEGER PRIMARY KEY,
    email VARCHAR(120) UNIQUE NOT NULL,
    password_hash VARCHAR(256) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Courses 테이블
```sql
CREATE TABLE courses (
    id INTEGER PRIMARY KEY,
    course_code VARCHAR(20) UNIQUE NOT NULL,
    course_name VARCHAR(100) NOT NULL,
    credits INTEGER NOT NULL,
    category VARCHAR(50) NOT NULL,
    semester VARCHAR(10) NOT NULL,
    description TEXT
);
```

### User_Courses 테이블
```sql
CREATE TABLE user_courses (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    course_code VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'planned',  -- planned, completed, in_progress
    grade VARCHAR(5),
    completed_date DATE,
    FOREIGN KEY (user_id) REFERENCES user (id),
    FOREIGN KEY (course_code) REFERENCES courses (course_code)
);
```

## 6. 보안 설계

### 인증 & 인가
- **JWT Token**: 사용자 인증용 토큰 기반 인증
- **Password Hashing**: Werkzeug를 이용한 비밀번호 해싱
- **CORS**: 크로스 오리진 요청 제어

### 데이터 보안
- **Input Validation**: 모든 사용자 입력 검증
- **SQL Injection 방지**: SQLAlchemy ORM 사용
- **XSS 방지**: React의 기본 XSS 보호 활용

## 7. 배포 아키텍처

### 개발 환경
```
Local Development
├── Frontend: http://localhost:5173 (Vite Dev Server)
├── Backend: http://localhost:5000 (Flask Dev Server)
└── Database: SQLite (로컬 파일)
```

### 프로덕션 환경 (권장)
```
Production Environment
├── Frontend: Netlify/Vercel (정적 호스팅)
├── Backend: Heroku/AWS EC2 (Flask 서버)
├── Database: PostgreSQL (AWS RDS/Heroku Postgres)
└── CDN: CloudFlare (정적 자산 배포)
```

## 8. 폴더 구조

```
Course_Optimizer/
├── docs/                           # 문서 및 보고서
├── src/
│   ├── Backend/                    # Flask 백엔드
│   │   ├── app.py                  # Flask 애플리케이션
│   │   ├── requirements.txt        # Python 의존성
│   │   └── users.db               # SQLite 데이터베이스
│   ├── Frontend/                   # React 프론트엔드
│   │   ├── src/
│   │   │   ├── components/         # 재사용 가능한 컴포넌트
│   │   │   ├── pages/             # 페이지 컴포넌트
│   │   │   ├── context/           # React Context
│   │   │   └── assets/            # 정적 자산
│   │   ├── public/                # 공개 자산
│   │   └── package.json           # Node.js 의존성
│   └── 2025course_data.csv         # 과목 데이터 (초기 데이터)
└── README.md                       # 프로젝트 설명
```

## 9. 향후 개선 사항

### 성능 최적화
- **캐싱**: Redis를 이용한 API 응답 캐싱
- **Database Indexing**: 자주 조회되는 컬럼에 인덱스 추가
- **Code Splitting**: React 컴포넌트 지연 로딩

### 기능 확장
- **알림 시스템**: 수강신청 기간, 성적 발표 알림
- **데이터 분석**: 사용자 수강 패턴 분석
- **모바일 앱**: React Native를 이용한 모바일 버전
- **소셜 기능**: 동기들과의 수강 계획 공유

### 인프라 개선
- **Container화**: Docker를 이용한 배포 환경 표준화
- **CI/CD**: GitHub Actions를 이용한 자동 배포
- **모니터링**: 애플리케이션 성능 모니터링 시스템 구축
- **로깅**: 구조화된 로그 시스템 구축

---

*본 문서는 Course Optimizer 프로젝트의 서비스 아키텍처를 설명합니다.*
*작성일: 2025년 7월 6일*

# Smart Course Recommendation System 🎓
> An intelligent, transparent EdTech web application engineered for college computer science curriculum and capstone projects.

[![React](https://img.shields.io/badge/Frontend-React_19_%2B_TypeScript-61dafb.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/Backend-Python_FastAPI_%2B_Express-009688.svg)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/Database-SQLite_with_FKs-003B57.svg)](https://www.sqlite.org/)
[![Recommendation](https://img.shields.io/badge/Algorithm-Weighted_Content--Based-indigo.svg)](#recommendation-algorithm)

---

## 1. Project Overview

The **Smart Course Recommendation System** is a full-stack learning platform designed to solve information overload for computer science students. Rather than relying on untrustworthy black-box algorithms, it utilizes an **explainable, content-based weighted similarity model** that factors in:

1. **Learning Goals (30% Weight)**: Career transition, skill advancement, academic/interview preparation, practical project building, and cloud/security certifications.
2. **Preferred Topics (30% Weight)**: Multi-tag keyword vector overlap with course subjects (React, TypeScript, Python, PyTorch, Docker, Kubernetes, System Design, Cybersecurity, etc.).
3. **Skill Level Suitability (20% Weight)**: Beginner, Intermediate, Advanced, and All Levels.
4. **Learning Format (10% Weight)**: Project-Based, Interactive Coding, Video Lectures, and Reading & Quizzes.
5. **Duration & Weekly Pace (10% Weight)**: Hours per week commitment vs estimated course duration.
6. **Active Feedback Loop**: Interactive *Relevant* (+8 pts) or *Not Relevant* (-25 pts) rating controls to dynamically adapt ongoing recommendations.

---

## 2. Key Features

- **Personalized Onboarding**: 6-step guided wizard that captures student aspirations, weekly study commitment, format preferences, and interest tags.
- **Smart Recommendations Hub**: Ranked courses with dynamic match percentages (e.g., `96% Match`), detailed algorithmic score breakdown drawers, and relevance feedback controls.
- **Explore Catalog**: 35+ realistic courses across 7 domains with full-text search, multi-faceted filtering (category, difficulty, format, duration), and sorting.
- **Course Details & Curriculum**: Detailed syllabi, prerequisites, learning outcomes, and interactive lesson completion checkmarks.
- **My Learning Portfolio**: Active enrollments, progress bars, completed lesson trackers, and certificate completion triggers.
- **Wishlist & Saved Courses**: Bookmark courses and enroll with one click.
- **Student Profile & Tuning**: Live slider and dropdown controls to fine-tune recommendation weights.
- **Admin Management Panel**: Protected role-based admin dashboard with real-time analytics (Recharts bar and line charts), course CRUD modals (create, edit, delete), and registered student rosters.

---

## 3. Technology Stack & Architecture

### Frontend
- **React 19 & TypeScript**: Component-driven architecture with strict type safety.
- **Vite 8**: Ultra-fast build tool and development server.
- **Tailwind CSS v4**: Modern, responsive EdTech SaaS design with light theme discipline.
- **React Router 7**: Client-side routing with protected routes.
- **Lucide React**: Clean, accessible iconography.
- **Recharts**: Interactive data visualizations for study activity and admin metrics.

### Backend Options (Dual Architecture)
1. **Interactive Node.js / Express Backend (`server.ts`)**: Runs synchronously with Vite middleware on port 3000 in this container using `better-sqlite3`, JWT authentication, and bcrypt.
2. **Python FastAPI Backend (`backend/`)**: Standalone, production-grade Python implementation using FastAPI, Pydantic v2, SQLAlchemy ORM, and SQLite.

### Database
- **SQLite 3**: Zero-configuration relational database with foreign keys, cascading deletes, unique constraints, and WAL journal mode. Prepared for seamless migration to PostgreSQL.

---

## 4. Database Schema

The database consists of 8 interconnected relational tables:

```
[users]
  ├── id (PK, Integer)
  ├── email (Unique, Text)
  ├── password_hash (Text)
  ├── full_name (Text)
  ├── role ('student' | 'admin')
  └── created_at (Timestamp)
        │
        ├── [student_profiles] (1-to-1)
        │     ├── id (PK)
        │     ├── user_id (FK -> users.id)
        │     ├── learning_goal (Text)
        │     ├── preferred_topics (JSON Array)
        │     ├── skill_level (Text)
        │     ├── preferred_format (Text)
        │     ├── weekly_study_hours (Integer)
        │     └── preferred_duration (Text)
        │
        ├── [enrollments] (1-to-Many)
        │     ├── id (PK)
        │     ├── user_id (FK -> users.id)
        │     ├── course_id (FK -> courses.id)
        │     ├── progress_percent (Integer, 0-100)
        │     └── status ('active' | 'completed')
        │
        ├── [lesson_progress] (1-to-Many)
        │     ├── id (PK)
        │     ├── user_id (FK -> users.id)
        │     ├── lesson_id (FK -> lessons.id)
        │     └── completed (Boolean)
        │
        ├── [saved_courses] (1-to-Many)
        │     ├── user_id (FK -> users.id)
        │     └── course_id (FK -> courses.id)
        │
        └── [recommendation_feedback] (1-to-Many)
              ├── user_id (FK -> users.id)
              ├── course_id (FK -> courses.id)
              └── feedback ('relevant' | 'not_relevant')

[courses]
  ├── id (PK, Integer)
  ├── title, slug, instructor, category, difficulty, format, duration_hours, rating
  └── [lessons] (1-to-Many)
        ├── id (PK)
        ├── course_id (FK -> courses.id)
        ├── title, duration_minutes, order_index, description
```

---

## 5. Recommendation Algorithm Explained

The recommendation engine implements a **weighted content-based filtering model**:

$$\text{Final Score} = \min(99, \max(10, S_{\text{goal}} + S_{\text{topic}} + S_{\text{skill}} + S_{\text{format}} + S_{\text{duration}} + \Delta_{\text{feedback}}))$$

### Weight Matrix Breakdown
| Factor | Weight | Evaluation Method |
|---|---|---|
| **Learning Goal** | 30% | Keyword mapping matching course title, category, description, and outcomes. |
| **Topic Vector Overlap** | 30% | Jaccard-inspired intersection ratio: $\frac{|\text{User Topics} \cap \text{Course Topics}|}{\min(|\text{User Topics}|, 3)}$. |
| **Skill Suitability** | 20% | Exact match: 20 pts; 1-step difference: 13-15 pts; 2-step difference: 5 pts. |
| **Learning Format** | 10% | Exact match: 10 pts; Mismatch: 4 pts; "Any": 10 pts. |
| **Duration & Pace** | 10% | Evaluates total hours and weekly pace feasibility ($\lceil \text{Hours} / \text{Weekly Pace} \rceil$). |
| **Student Feedback** | $\pm$ Adjustment | `Relevant` (+8 pts bonus); `Not Relevant` (-25 pts penalty). |

*Note: Enrolled or completed courses are automatically filtered out from recommendations.*

---

## 6. Pre-Seeded Demo Credentials

The database is initialized with development test accounts:

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Demo Student** | `student@example.com` | `student123` | Dashboard, Onboarding, Recommendations, My Learning, Wishlist |
| **Demo Admin** | `admin@example.com` | `admin123` | Full Course CRUD, System Analytics, Student Directory |

*(Quick 1-click login buttons are also provided on the Sign In page and Top Navbar).*

---

## 7. Local Setup Instructions (Windows / VS Code)

### Prerequisites
- Node.js (v18 or v20+)
- Python (v3.10+) (Optional if running FastAPI backend)
- VS Code or preferred IDE

---

### Method A: Running the Full-Stack Node / Express + React App

This runs the complete integrated application with SQLite database and Vite hot-reloading:

1. **Clone or extract the repository**:
   ```powershell
   cd smart-course-recommender
   ```

2. **Install Node dependencies**:
   ```powershell
   npm install
   ```

3. **Start the Development Server**:
   ```powershell
   npm run dev
   ```

4. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000).

---

### Method B: Running the Python FastAPI Backend

If you wish to run the separate Python FastAPI backend:

1. **Open a terminal in the `/backend` folder**:
   ```powershell
   cd backend
   ```

2. **Create and activate a virtual environment**:
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Install Python requirements**:
   ```powershell
   pip install -r requirements.txt
   ```

4. **Seed the SQLite database**:
   ```powershell
   python scripts/seed.py
   ```

5. **Start the FastAPI server**:
   ```powershell
   uvicorn app.main:app --reload --port 8000
   ```

6. **Interactive Swagger Documentation**:
   Visit [http://localhost:8000/docs](http://localhost:8000/docs).

---

## 8. Running Automated Tests

### 1. Recommendation Engine Unit Tests (Node / TypeScript)
Tests pure recommendation scoring, intersection math, and feedback penalties:
```powershell
npm test
# or
npx tsx --test src/services/recommendationEngine.test.ts
```

### 2. Backend Pytest Tests (Python)
Tests FastAPI authentication, health endpoint, and recommendation engine:
```powershell
pytest backend/tests/
```

---

## 9. Project Directory Structure

```
smart-course-recommender/
├── index.html                   # HTML entry point with metadata
├── package.json                 # Node dependencies and scripts
├── server.ts                    # Full-stack Express server with SQLite API & Vite
├── tsconfig.json                # TypeScript strict configuration
├── vite.config.ts               # Vite bundler configuration
│
├── src/
│   ├── App.tsx                  # React Router setup & protected routes
│   ├── main.tsx                 # React DOM mount point
│   ├── index.css                # Tailwind CSS styling
│   ├── types/
│   │   └── index.ts             # Domain TypeScript interfaces
│   ├── context/
│   │   └── AuthContext.tsx      # JWT session & authentication state
│   ├── services/
│   │   ├── api.ts               # Centralized REST API client
│   │   ├── recommendationEngine.ts      # Pure weighted similarity ranker
│   │   └── recommendationEngine.test.ts # Fast-feedback unit tests
│   ├── components/
│   │   ├── Navbar.tsx           # Global header with 1-click demo logins
│   │   ├── Sidebar.tsx          # Responsive dashboard navigation
│   │   ├── CourseCard.tsx       # Reusable course card with match tags
│   │   └── Footer.tsx           # Academic project footer
│   └── pages/
│       ├── LandingPage.tsx      # Hero, features, search, and featured catalog
│       ├── AuthPage.tsx         # Login, register, and quick-fill buttons
│       ├── OnboardingPage.tsx   # 6-step student preference wizard
│       ├── DashboardPage.tsx    # Metrics, Recharts activity chart, resume learning
│       ├── ExplorePage.tsx      # 35+ courses catalog with multi-filter & search
│       ├── CourseDetailsPage.tsx# Syllabus, outcomes, enrollment, lesson checks
│       ├── RecommendationsPage.tsx # Ranked matches, score inspector, feedback
│       ├── MyLearningPage.tsx   # Enrolled portfolio & progress tracking
│       ├── SavedCoursesPage.tsx # Wishlist management
│       ├── ProfilePage.tsx      # Student settings & weight adjustments
│       └── AdminPage.tsx        # Management KPIs, analytics charts, course CRUD
│
├── backend/                     # Python FastAPI standalone implementation
│   ├── requirements.txt         # FastAPI, Pydantic, SQLAlchemy, Pytest
│   ├── .env.example             # Backend environment template
│   ├── app/
│   │   ├── main.py              # FastAPI endpoints & CORS
│   │   ├── config.py            # Pydantic BaseSettings
│   │   ├── database.py          # SQLAlchemy session & SQLite engine
│   │   ├── models.py            # Relational models with foreign keys
│   │   ├── schemas.py           # Request & response Pydantic models
│   │   └── services/
│   │       └── recommendation.py # Content-based scoring service
│   ├── scripts/
│   │   └── seed.py              # Idempotent database population script
│   └── tests/
│       ├── test_recommendation.py
│       └── test_api.py
│
├── scripts/
│   └── export_zip.py            # Clean project zip generator
├── smart_course_recommendation_system.zip # Downloadable project zip
└── README.md                    # Project documentation
```

---

## 10. Common Errors & Troubleshooting

1. **Port 3000 already in use**:
   - Run `npx kill-port 3000` or change the `PORT` variable in `.env`.
2. **SQLite database locked**:
   - WAL mode (`PRAGMA journal_mode = WAL;`) is enabled by default to allow concurrent reads and writes without locking.
3. **Admin page shows permission error**:
   - Ensure you are logged in as `admin@example.com` or click the "Log in as Demo Admin (1-Click)" button.
4. **Execution Policy Error in PowerShell**:
   - If running `Activate.ps1` gives a script execution policy error, run:
     `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process`.

---

## 11. Academic Project Attribution

This project is authored as a computer science degree capstone demonstration of **information retrieval and recommender systems**. It adheres to transparent algorithmic principles, data normalization, and accessible UI/UX design standards.

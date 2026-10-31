from typing import List, Optional
from pydantic import BaseModel, EmailStr
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "student"

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(UserBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    token: str
    user: UserOut
    message: str

class StudentProfileBase(BaseModel):
    learning_goal: Optional[str] = "career_transition"
    preferred_topics: List[str] = []
    skill_level: Optional[str] = "Intermediate"
    preferred_format: Optional[str] = "Project-Based"
    weekly_study_hours: Optional[int] = 6
    preferred_duration: Optional[str] = "Medium (10-30 hrs)"
    bio: Optional[str] = ""

class StudentProfileOut(StudentProfileBase):
    id: int
    user_id: int
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LessonBase(BaseModel):
    title: str
    duration_minutes: int
    order_index: int
    description: str = ""

class LessonOut(LessonBase):
    id: int
    course_id: int
    completed: Optional[bool] = False

    class Config:
        from_attributes = True

class CourseBase(BaseModel):
    title: str
    description: str
    short_description: str
    instructor: str
    category: str
    difficulty: str
    format: str
    duration_hours: float
    thumbnail_url: str
    topics: List[str] = []
    prerequisites: List[str] = []
    learning_outcomes: List[str] = []
    is_featured: bool = False

class CourseCreate(CourseBase):
    lessons: Optional[List[LessonBase]] = []

class CourseOut(CourseBase):
    id: int
    slug: str
    rating: float
    review_count: int
    created_at: datetime
    lessons: Optional[List[LessonOut]] = None
    is_saved: Optional[bool] = False
    is_enrolled: Optional[bool] = False
    enrollment_progress: Optional[int] = 0

    class Config:
        from_attributes = True

class EnrollmentOut(BaseModel):
    id: int
    user_id: int
    course_id: int
    enrolled_at: datetime
    progress_percent: int
    status: str
    completed_at: Optional[datetime] = None
    course: CourseOut
    completed_lessons: List[int] = []

    class Config:
        from_attributes = True

class RecommendationScoreBreakdown(BaseModel):
    goalScore: float
    topicScore: float
    skillScore: float
    formatScore: float
    durationScore: float
    feedbackAdjustment: float

class RecommendationOut(BaseModel):
    course: CourseOut
    score: int
    matchPercentage: int
    breakdown: RecommendationScoreBreakdown
    reasons: List[str]
    matchingTopics: List[str]
    estimatedWeeks: int
    userFeedback: Optional[str] = None

class FeedbackCreate(BaseModel):
    course_id: int
    feedback: str
    note: Optional[str] = None

class AdminStatsOut(BaseModel):
    totalCourses: int
    totalStudents: int
    totalEnrollments: int
    completedEnrollments: int
    averageRating: float
    categoryBreakdown: List[dict]
    difficultyBreakdown: List[dict]
    weeklyEnrollments: List[dict]

class AdminStudentRowOut(BaseModel):
    id: int
    email: str
    full_name: str
    learning_goal: Optional[str] = None
    skill_level: Optional[str] = None
    enrolled_count: int
    completed_count: int
    created_at: datetime

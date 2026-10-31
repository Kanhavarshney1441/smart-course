import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, Text, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(String(50), default="student", nullable=False)  # "student" | "admin"
    created_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)

    profile = relationship("StudentProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="user", cascade="all, delete-orphan")
    saved_courses = relationship("SavedCourse", back_populates="user", cascade="all, delete-orphan")
    feedback = relationship("RecommendationFeedback", back_populates="user", cascade="all, delete-orphan")


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    learning_goal = Column(String(100), default="career_transition")
    preferred_topics = Column(Text, default="[]")  # JSON encoded list of strings
    skill_level = Column(String(50), default="Intermediate")
    preferred_format = Column(String(50), default="Project-Based")
    weekly_study_hours = Column(Integer, default=6)
    preferred_duration = Column(String(50), default="Medium (10-30 hrs)")
    bio = Column(Text, default="")
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="profile")


class Course(Base):
    __tablename__ = "courses"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    slug = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=False)
    short_description = Column(String(500), nullable=False)
    instructor = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False, index=True)
    difficulty = Column(String(50), nullable=False, index=True)
    format = Column(String(50), nullable=False)
    duration_hours = Column(Float, nullable=False)
    rating = Column(Float, default=5.0)
    review_count = Column(Integer, default=0)
    thumbnail_url = Column(String(500), nullable=False)
    topics = Column(Text, nullable=False, default="[]")  # JSON encoded list
    prerequisites = Column(Text, nullable=False, default="[]")  # JSON encoded list
    learning_outcomes = Column(Text, nullable=False, default="[]")  # JSON encoded list
    is_featured = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    lessons = relationship("Lesson", back_populates="course", cascade="all, delete-orphan")
    enrollments = relationship("Enrollment", back_populates="course", cascade="all, delete-orphan")


class Lesson(Base):
    __tablename__ = "lessons"

    id = Column(Integer, primary_key=True, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    duration_minutes = Column(Integer, nullable=False)
    order_index = Column(Integer, nullable=False)
    description = Column(Text, default="")

    course = relationship("Course", back_populates="lessons")


class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    enrolled_at = Column(DateTime, default=datetime.datetime.utcnow)
    progress_percent = Column(Integer, default=0)
    status = Column(String(50), default="active")  # "active" | "completed"
    completed_at = Column(DateTime, nullable=True)

    __table_args__ = (UniqueConstraint("user_id", "course_id", name="unique_user_course_enrollment"),)

    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")


class LessonProgress(Base):
    __tablename__ = "lesson_progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    lesson_id = Column(Integer, ForeignKey("lessons.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    completed = Column(Boolean, default=True)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "lesson_id", name="unique_user_lesson_progress"),)


class SavedCourse(Base):
    __tablename__ = "saved_courses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    saved_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "course_id", name="unique_user_saved_course"),)

    user = relationship("User", back_populates="saved_courses")
    course = relationship("Course")


class RecommendationFeedback(Base):
    __tablename__ = "recommendation_feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    course_id = Column(Integer, ForeignKey("courses.id", ondelete="CASCADE"), nullable=False, index=True)
    feedback = Column(String(50), nullable=False)  # "relevant" | "not_relevant"
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    __table_args__ = (UniqueConstraint("user_id", "course_id", name="unique_user_course_feedback"),)

    user = relationship("User", back_populates="feedback")
    course = relationship("Course")

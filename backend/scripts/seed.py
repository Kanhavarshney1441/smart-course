"""
Database Seeding Script for Smart Course Recommendation System (Python/SQLAlchemy).
Safe to run multiple times without duplicating entries.
"""
import sys
import os
import json
from passlib.context import CryptContext

# Add parent directory to path so imports work
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import engine, SessionLocal, Base
from app.models import User, StudentProfile, Course, Lesson, Enrollment, LessonProgress, SavedCourse

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check users
        if db.query(User).count() == 0:
            print("[Seed] Creating demo users...")
            student = User(
                email="student@example.com",
                password_hash=pwd_context.hash("student123"),
                full_name="Alex Rivera",
                role="student"
            )
            admin = User(
                email="admin@example.com",
                password_hash=pwd_context.hash("admin123"),
                full_name="Dr. Eleanor Vance (Admin)",
                role="admin"
            )
            db.add_all([student, admin])
            db.commit()
            db.refresh(student)

            student_profile = StudentProfile(
                user_id=student.id,
                learning_goal="career_transition",
                preferred_topics=json.dumps(["React", "TypeScript", "Node.js", "Python", "DevOps"]),
                skill_level="Intermediate",
                preferred_format="Project-Based",
                weekly_study_hours=8,
                preferred_duration="Medium (10-30 hrs)",
                bio="Computer Science undergrad preparing for full-stack engineering roles."
            )
            db.add(student_profile)
            db.commit()
            print("[Seed] Users created.")

        # Check courses
        if db.query(Course).count() == 0:
            print("[Seed] Seeding sample courses...")
            # Load from sample courses JSON or define high-yield catalog
            courses_data = [
                {
                    "title": "Modern Full-Stack React & Node.js Masterclass",
                    "slug": "react-node-masterclass",
                    "description": "Master full-stack engineering with React 19, TypeScript, Node.js, Express, and PostgreSQL.",
                    "short_description": "Build production SaaS web apps from scratch using React, Node, and TypeScript.",
                    "instructor": "Dr. Sarah Connor",
                    "category": "Web Development",
                    "difficulty": "Intermediate",
                    "format": "Project-Based",
                    "duration_hours": 28.0,
                    "rating": 4.85,
                    "review_count": 428,
                    "thumbnail_url": "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800",
                    "topics": ["React", "TypeScript", "Node.js", "Express", "PostgreSQL", "REST API"],
                    "prerequisites": ["HTML/CSS & JavaScript fundamentals", "Basic ES6 syntax"],
                    "learning_outcomes": ["Architect scalable React frontend applications", "Design robust REST APIs in Node.js"],
                    "is_featured": True,
                    "lessons": [
                        {"title": "Modern React Architecture & Component Composition", "duration_minutes": 45, "description": "Hooks, context, and state machines."},
                        {"title": "Server API Engineering with Express & Middleware", "duration_minutes": 50, "description": "REST endpoints with validation."},
                        {"title": "Database Design & SQL Migrations", "duration_minutes": 55, "description": "Relational schemas, foreign keys, and indexes."},
                        {"title": "End-to-End Authentication & Session Management", "duration_minutes": 60, "description": "Password hashing and JWT."},
                        {"title": "Full-Stack Project Capstone", "duration_minutes": 80, "description": "Complete production SaaS integration."}
                    ]
                },
                {
                    "title": "Python for Absolute Beginners: Zero to Hero",
                    "slug": "python-for-beginners",
                    "description": "Learn programming fundamentals from scratch with Python 3. Explore data structures and write clean code.",
                    "short_description": "Learn programming from scratch with intuitive Python code and hands-on exercises.",
                    "instructor": "Prof. David Vance",
                    "category": "Computer Science",
                    "difficulty": "Beginner",
                    "format": "Interactive Coding",
                    "duration_hours": 12.0,
                    "rating": 4.92,
                    "review_count": 1250,
                    "thumbnail_url": "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800",
                    "topics": ["Python", "Programming Fundamentals", "Data Structures", "Automation"],
                    "prerequisites": ["No prior coding experience needed"],
                    "learning_outcomes": ["Understand variables, loops, and control flow", "Work with lists and dictionaries"],
                    "is_featured": True,
                    "lessons": [
                        {"title": "Introduction to Python & Variables", "duration_minutes": 30, "description": "Types and operators."},
                        {"title": "Control Flow & Loops", "duration_minutes": 40, "description": "Branching and loops."},
                        {"title": "Collections: Lists & Dicts", "duration_minutes": 45, "description": "Manipulating structured data."}
                    ]
                },
                {
                    "title": "Deep Learning & Neural Networks with PyTorch",
                    "slug": "deep-learning-pytorch",
                    "description": "Dive deep into modern artificial intelligence. Implement CNNs, RNNs, and attention mechanisms with PyTorch.",
                    "short_description": "Build and train advanced neural network models with PyTorch.",
                    "instructor": "Elena Rostova",
                    "category": "Data Science & AI",
                    "difficulty": "Advanced",
                    "format": "Video Lectures",
                    "duration_hours": 36.0,
                    "rating": 4.88,
                    "review_count": 340,
                    "thumbnail_url": "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800",
                    "topics": ["Deep Learning", "PyTorch", "Neural Networks", "Computer Vision", "Machine Learning"],
                    "prerequisites": ["Python proficiency", "Linear algebra basics"],
                    "learning_outcomes": ["Construct tensor computation graphs", "Train convolutional networks for image classification"],
                    "is_featured": True,
                    "lessons": [
                        {"title": "Tensors & Autograd in PyTorch", "duration_minutes": 50, "description": "GPU acceleration."},
                        {"title": "Building Multilayer Perceptrons", "duration_minutes": 60, "description": "Forward and backward pass."},
                        {"title": "Convolutional Networks (CNNs)", "duration_minutes": 65, "description": "Vision classification."}
                    ]
                },
                {
                    "title": "System Design for Scalable Distributed Systems",
                    "slug": "system-design-distributed-systems",
                    "description": "Learn how to architect internet-scale systems handling millions of users. Load balancing, sharding, and caching.",
                    "short_description": "Design robust, scalable distributed systems for millions of users.",
                    "instructor": "Arjun Mehta",
                    "category": "Computer Science",
                    "difficulty": "Advanced",
                    "format": "Video Lectures",
                    "duration_hours": 24.0,
                    "rating": 4.95,
                    "review_count": 880,
                    "thumbnail_url": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800",
                    "topics": ["System Design", "Distributed Systems", "Architecture", "Databases", "Scalability"],
                    "prerequisites": ["Backend web development and SQL experience"],
                    "learning_outcomes": ["Evaluate CAP theorem tradeoffs", "Implement database sharding and caching"],
                    "is_featured": True,
                    "lessons": [
                        {"title": "Latency, Throughput & High Availability", "duration_minutes": 45, "description": "Core distributed tenets."},
                        {"title": "Load Balancing & Reverse Proxies", "duration_minutes": 45, "description": "Nginx and HAProxy patterns."},
                        {"title": "Distributed Caching with Redis", "duration_minutes": 50, "description": "Cache-aside and eviction policies."}
                    ]
                }
            ]

            for c_data in courses_data:
                lessons_data = c_data.pop("lessons", [])
                c_model = Course(
                    title=c_data["title"],
                    slug=c_data["slug"],
                    description=c_data["description"],
                    short_description=c_data["short_description"],
                    instructor=c_data["instructor"],
                    category=c_data["category"],
                    difficulty=c_data["difficulty"],
                    format=c_data["format"],
                    duration_hours=c_data["duration_hours"],
                    rating=c_data["rating"],
                    review_count=c_data["review_count"],
                    thumbnail_url=c_data["thumbnail_url"],
                    topics=json.dumps(c_data["topics"]),
                    prerequisites=json.dumps(c_data["prerequisites"]),
                    learning_outcomes=json.dumps(c_data["learning_outcomes"]),
                    is_featured=c_data["is_featured"]
                )
                db.add(c_model)
                db.commit()
                db.refresh(c_model)

                for idx, l_data in enumerate(lessons_data):
                    l_model = Lesson(
                        course_id=c_model.id,
                        title=l_data["title"],
                        duration_minutes=l_data["duration_minutes"],
                        order_index=idx + 1,
                        description=l_data["description"]
                    )
                    db.add(l_model)
                db.commit()

            print(f"[Seed] Successfully seeded {len(courses_data)} initial courses in SQLite database.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()

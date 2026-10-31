export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
export type CourseFormat = 'Video Lectures' | 'Interactive Coding' | 'Project-Based' | 'Reading & Quizzes';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'student' | 'admin';
  created_at: string;
}

export interface StudentProfile {
  id: number;
  user_id: number;
  learning_goal: string;
  preferred_topics: string[];
  skill_level: DifficultyLevel;
  preferred_format: CourseFormat | 'Any';
  weekly_study_hours: number;
  preferred_duration: 'Short (< 10 hrs)' | 'Medium (10-30 hrs)' | 'Long (> 30 hrs)' | 'Any';
  bio?: string;
  updated_at?: string;
}

export interface Lesson {
  id: number;
  course_id: number;
  title: string;
  duration_minutes: number;
  order_index: number;
  description: string;
  completed?: boolean;
}

export interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  instructor: string;
  category: string;
  difficulty: DifficultyLevel;
  format: CourseFormat;
  duration_hours: number;
  rating: number;
  review_count: number;
  thumbnail_url: string;
  topics: string[];
  prerequisites: string[];
  learning_outcomes: string[];
  is_featured: boolean;
  lessons?: Lesson[];
  is_saved?: boolean;
  is_enrolled?: boolean;
  enrollment_progress?: number;
}

export interface Enrollment {
  id: number;
  user_id: number;
  course_id: number;
  enrolled_at: string;
  progress_percent: number;
  status: 'active' | 'completed';
  completed_at?: string;
  course: Course;
  completed_lessons?: number[];
}

export interface RecommendationResult {
  course: Course;
  score: number;
  matchPercentage: number;
  breakdown: {
    goalScore: number;
    topicScore: number;
    skillScore: number;
    formatScore: number;
    durationScore: number;
    feedbackAdjustment: number;
  };
  reasons: string[];
  matchingTopics: string[];
  estimatedWeeks: number;
  userFeedback?: 'relevant' | 'not_relevant' | null;
}

export interface AdminStats {
  totalCourses: number;
  totalStudents: number;
  totalEnrollments: number;
  completedEnrollments: number;
  averageRating: number;
  categoryBreakdown: { category: string; count: number }[];
  difficultyBreakdown: { difficulty: string; count: number }[];
  weeklyEnrollments: { date: string; enrollments: number; completions: number }[];
}

export interface AdminStudentRow {
  id: number;
  email: string;
  full_name: string;
  learning_goal?: string;
  skill_level?: string;
  enrolled_count: number;
  completed_count: number;
  created_at: string;
}

export interface LearningStreak {
  current_streak: number;
  longest_streak: number;
  last_active_date: string;
  total_minutes_spent: number;
}

export interface DailyGoal {
  target_minutes: number;
  completed_minutes: number;
  target_lessons: number;
  completed_lessons: number;
  is_achieved: boolean;
}

export interface LearningDashboardOverview {
  streak: LearningStreak;
  stats: {
    total_enrolled: number;
    active_courses: number;
    completed_courses: number;
  };
  active_courses: {
    id: number;
    title: string;
    slug: string;
    category: string;
    difficulty: string;
    progress_percent: number;
    thumbnail_url: string;
    estimated_hours_remaining: number;
  }[];
  next_recommended_lesson?: {
    id: number;
    title: string;
    duration_minutes: number;
    order_index: number;
    description: string;
    course_id: number;
    course_title: string;
  };
  upcoming_assessments: {
    course_id: number;
    course_title: string;
    module_title: string;
    passing_score: number;
    estimated_mins: number;
  }[];
  daily_goal: DailyGoal;
}

export interface CurriculumLesson {
  id: number;
  title: string;
  chapter: string;
  duration_minutes: number;
  objectives: string[];
  exercises: string[];
}

export interface CurriculumModule {
  module_number: number;
  title: string;
  description: string;
  estimated_hours: number;
  lessons: CurriculumLesson[];
  mini_project?: {
    title: string;
    description: string;
    requirements: string[];
    tech_stack: string[];
  };
}

export interface CourseCurriculum {
  course_id: number;
  course_title: string;
  category: string;
  difficulty: string;
  modules: CurriculumModule[];
  capstone_project: {
    title: string;
    problem_statement: string;
    key_features: string[];
    tech_stack: string[];
    milestones: string[];
    evaluation_criteria: string[];
  };
}

export interface AdaptiveLessonContent {
  lessonTitle: string;
  courseTitle: string;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  simpleDefinition: string;
  detailedNotes: {
    heading: string;
    content: string;
    tips?: string[];
    codeSnippet?: {
      language: string;
      code: string;
      expectedOutput: string;
    };
  }[];
  commonMistakes: {
    pitfall: string;
    solution: string;
  }[];
  keyTakeaways: string[];
  practiceQuestions: {
    question: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  }[];
  summary: string;
}

export interface LearningResource {
  id: number;
  course_id: number;
  module_title: string;
  title: string;
  url: string;
  resource_type: 'documentation' | 'course' | 'video' | 'interactive' | 'cheatsheet';
  provider: string;
  duration_or_pages: string;
  difficulty: string;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  type: 'mcq' | 'true_false' | 'code_prediction';
  codeSnippet?: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface ModuleAssessment {
  id: number;
  course_id: number;
  module_title: string;
  title: string;
  passing_score: number;
  questions: AssessmentQuestion[];
}

export interface AssessmentAttempt {
  id: number;
  user_id: number;
  course_id: number;
  assessment_id: number;
  score: number;
  total_questions: number;
  passed: number;
  answers_json: string;
  created_at: string;
}

export interface RoadmapDay {
  day_number: number;
  week_number: number;
  title: string;
  task_type: 'Concept' | 'Coding' | 'Exercise' | 'Review' | 'Assessment' | 'Project';
  description: string;
  estimated_minutes: number;
  completed?: boolean;
}

export interface CourseRoadmap {
  course_id: number;
  weekly_study_hours: number;
  total_weeks: number;
  daily_study_mins: number;
  days: RoadmapDay[];
}

export interface StudentNote {
  id: number;
  user_id: number;
  course_id: number;
  lesson_id: number;
  lesson_title?: string;
  title: string;
  content: string;
  tags: string[];
  updated_at: string;
}

export interface TutorChatMessage {
  role: 'user' | 'model';
  content: string;
}

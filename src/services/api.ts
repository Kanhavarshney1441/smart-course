import {
  User,
  StudentProfile,
  Course,
  Enrollment,
  RecommendationResult,
  AdminStats,
  AdminStudentRow,
  LearningDashboardOverview,
  CourseCurriculum,
  AdaptiveLessonContent,
  LearningResource,
  ModuleAssessment,
  AssessmentAttempt,
  CourseRoadmap,
  StudentNote,
  TutorChatMessage
} from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP error ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  async register(data: { email: string; password: string; full_name: string; role?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ token: string; user: User; message: string }>(res);
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse<{ token: string; user: User; message: string }>(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ user: User; profile?: StudentProfile }>(res);
  },

  // Courses
  async getCourses(params?: {
    search?: string;
    category?: string;
    difficulty?: string;
    format?: string;
    duration?: string;
    sort?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.category && params.category !== 'All') query.set('category', params.category);
    if (params?.difficulty && params.difficulty !== 'All') query.set('difficulty', params.difficulty);
    if (params?.format && params.format !== 'All') query.set('format', params.format);
    if (params?.duration && params.duration !== 'All') query.set('duration', params.duration);
    if (params?.sort) query.set('sort', params.sort);
    if (params?.page) query.set('page', params.page.toString());
    if (params?.limit) query.set('limit', params.limit.toString());

    const res = await fetch(`${API_BASE}/courses?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ courses: Course[]; total: number }>(res);
  },

  async getCourse(id: number) {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ course: Course }>(res);
  },

  // Admin Courses CRUD
  async createCourse(data: Partial<Course>) {
    const res = await fetch(`${API_BASE}/courses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ id: number; message: string }>(res);
  },

  async updateCourse(id: number, data: Partial<Course>) {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string }>(res);
  },

  async deleteCourse(id: number) {
    const res = await fetch(`${API_BASE}/courses/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ message: string }>(res);
  },

  // Student Profile
  async getProfile() {
    const res = await fetch(`${API_BASE}/profile`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ profile: StudentProfile }>(res);
  },

  async updateProfile(data: Partial<StudentProfile>) {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ profile: StudentProfile; message: string }>(res);
  },

  // Recommendations
  async getRecommendations() {
    const res = await fetch(`${API_BASE}/recommendations`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ recommendations: RecommendationResult[]; total: number }>(res);
  },

  async submitRecommendationFeedback(course_id: number, feedback: 'relevant' | 'not_relevant', note?: string) {
    const res = await fetch(`${API_BASE}/recommendations/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ course_id, feedback, note }),
    });
    return handleResponse<{ message: string }>(res);
  },

  // Saved Courses
  async getSavedCourses() {
    const res = await fetch(`${API_BASE}/saved-courses`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ courses: Course[]; total: number }>(res);
  },

  async saveCourse(course_id: number) {
    const res = await fetch(`${API_BASE}/saved-courses/${course_id}`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ message: string }>(res);
  },

  async unsaveCourse(course_id: number) {
    const res = await fetch(`${API_BASE}/saved-courses/${course_id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ message: string }>(res);
  },

  // Enrollments & Progress
  async getEnrollments() {
    const res = await fetch(`${API_BASE}/enrollments`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ enrollments: Enrollment[] }>(res);
  },

  async enrollCourse(course_id: number) {
    const res = await fetch(`${API_BASE}/enrollments/${course_id}`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ message: string }>(res);
  },

  async completeLesson(lesson_id: number) {
    const res = await fetch(`${API_BASE}/lessons/${lesson_id}/complete`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{
      lesson_id: number;
      completed: boolean;
      progress_percent: number;
      course_status: 'active' | 'completed';
      message: string;
    }>(res);
  },

  // Admin Stats & Students
  async getAdminStats() {
    const res = await fetch(`${API_BASE}/admin/statistics`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<AdminStats>(res);
  },

  async getAdminStudents() {
    const res = await fetch(`${API_BASE}/admin/students`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ students: AdminStudentRow[] }>(res);
  },

  // ==========================================
  // AI-POWERED LEARNING HUB METHODS
  // ==========================================
  async getLearningDashboardOverview() {
    const res = await fetch(`${API_BASE}/learning/dashboard-overview`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<LearningDashboardOverview>(res);
  },

  async getCurriculum(courseId: number) {
    const res = await fetch(`${API_BASE}/curriculum/${courseId}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ curriculum: CourseCurriculum }>(res);
  },

  async getAdaptiveLessonContent(courseId: number, lessonId: number, skillLevel?: string) {
    const query = skillLevel ? `?skillLevel=${encodeURIComponent(skillLevel)}` : '';
    const res = await fetch(`${API_BASE}/learning/lesson-content/${courseId}/${lessonId}${query}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ content: AdaptiveLessonContent }>(res);
  },

  async getCuratedResources(courseId: number) {
    const res = await fetch(`${API_BASE}/learning/resources/${courseId}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ resources: LearningResource[] }>(res);
  },

  async getModuleAssessment(courseId: number, moduleNumber: number = 1) {
    const res = await fetch(`${API_BASE}/learning/assessments/${courseId}/${moduleNumber}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ assessment: ModuleAssessment }>(res);
  },

  async submitAssessment(data: {
    course_id: number;
    module_number?: number;
    answers: Record<number, number>;
  }) {
    const res = await fetch(`${API_BASE}/learning/assessments/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{
      score: number;
      totalQuestions: number;
      correctCount: number;
      passed: boolean;
      passingScore: number;
      feedback: {
        questionId: number;
        question: string;
        userAnswer: number;
        correctAnswer: number;
        isCorrect: boolean;
        explanation: string;
      }[];
      message: string;
    }>(res);
  },

  async getAssessmentHistory(courseId: number) {
    const res = await fetch(`${API_BASE}/learning/assessments/history/${courseId}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ attempts: AssessmentAttempt[] }>(res);
  },

  async getRoadmap(courseId: number) {
    const res = await fetch(`${API_BASE}/learning/roadmap/${courseId}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ roadmap: CourseRoadmap; weekly_study_hours: number }>(res);
  },

  async updateRoadmapStudyHours(courseId: number, weekly_study_hours: number) {
    const res = await fetch(`${API_BASE}/learning/roadmap/${courseId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ weekly_study_hours }),
    });
    return handleResponse<{ roadmap: CourseRoadmap; weekly_study_hours: number; message: string }>(res);
  },

  async toggleRoadmapDay(courseId: number, day_number: number) {
    const res = await fetch(`${API_BASE}/learning/roadmap/${courseId}/toggle-day`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ day_number }),
    });
    return handleResponse<{ roadmap: CourseRoadmap; message: string }>(res);
  },

  async getStudentNotes(courseId: number) {
    const res = await fetch(`${API_BASE}/learning/notes/${courseId}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ notes: StudentNote[] }>(res);
  },

  async saveStudentNote(data: {
    course_id: number;
    lesson_id: number;
    title: string;
    content: string;
    tags?: string[];
  }) {
    const res = await fetch(`${API_BASE}/learning/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ message: string }>(res);
  },

  async deleteStudentNote(id: number) {
    const res = await fetch(`${API_BASE}/learning/notes/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ message: string }>(res);
  },

  async getBookmarks(courseId: number) {
    const res = await fetch(`${API_BASE}/learning/bookmarks/${courseId}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ bookmarked_lesson_ids: number[] }>(res);
  },

  async toggleBookmark(courseId: number, lessonId: number) {
    const res = await fetch(`${API_BASE}/learning/bookmarks/${courseId}/${lessonId}`, {
      method: 'POST',
      headers: { ...getAuthHeader() },
    });
    return handleResponse<{ bookmarked: boolean; message: string }>(res);
  },

  async askAiTutor(data: {
    course_id: number;
    lesson_id?: number;
    messages: TutorChatMessage[];
    code_snippet?: string;
  }) {
    const res = await fetch(`${API_BASE}/tutor/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse<{ reply: string }>(res);
  },
};

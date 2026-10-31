import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { getDb } from './src/server/db.js';
import { rankCourses, CourseData, StudentPreferences } from './src/services/recommendationEngine.js';
import { askAiTutor } from './src/server/tutorService.js';
import {
  buildCourseCurriculum,
  getAdaptiveLessonContent,
  getCuratedResources,
  buildModuleAssessment,
  generatePersonalizedRoadmap,
} from './src/server/curriculumService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'smart-course-recommender-dev-secret-key-2026';

app.use(express.json());

// Initialize database
const db = getDb();

// Authentication middleware
interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: 'student' | 'admin';
    full_name: string;
  };
}

function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. No token provided.' });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    req.user = decodedUser as AuthRequest['user'];
    next();
  });
}

// Optional auth middleware (for course listing to flag saved/enrolled status)
function optionalAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (!err && decodedUser) {
      req.user = decodedUser as AuthRequest['user'];
    }
    next();
  });
}

function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required.' });
  }
  next();
}

// Helper to format course record from DB
function parseCourseRow(row: any) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    description: row.description,
    short_description: row.short_description,
    instructor: row.instructor,
    category: row.category,
    difficulty: row.difficulty,
    format: row.format,
    duration_hours: row.duration_hours,
    rating: row.rating,
    review_count: row.review_count,
    thumbnail_url: row.thumbnail_url,
    topics: typeof row.topics === 'string' ? JSON.parse(row.topics) : row.topics || [],
    prerequisites: typeof row.prerequisites === 'string' ? JSON.parse(row.prerequisites) : row.prerequisites || [],
    learning_outcomes: typeof row.learning_outcomes === 'string' ? JSON.parse(row.learning_outcomes) : row.learning_outcomes || [],
    is_featured: Boolean(row.is_featured),
    created_at: row.created_at,
  };
}

// ==========================================
// 1. HEALTH CHECK
// ==========================================
app.get('/api/health', (req, res) => {
  const courseCount = (db.prepare('SELECT count(*) as count FROM courses').get() as any)?.count || 0;
  const userCount = (db.prepare('SELECT count(*) as count FROM users').get() as any)?.count || 0;
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: 'SQLite',
    statistics: {
      totalCourses: courseCount,
      totalUsers: userCount,
    },
  });
});

// ==========================================
// 2. AUTHENTICATION
// ==========================================
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, full_name, role = 'student' } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase().trim());
    if (existing) {
      return res.status(400).json({ error: 'An account with this email address already exists.' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);

    const safeRole = role === 'admin' ? 'admin' : 'student';

    const insert = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?)
    `).run(email.toLowerCase().trim(), password_hash, full_name.trim(), safeRole);

    const userId = Number(insert.lastInsertRowid);

    // Create default profile for student
    db.prepare(`
      INSERT INTO student_profiles (user_id, learning_goal, preferred_topics, skill_level, preferred_format, weekly_study_hours, preferred_duration)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      userId,
      'career_transition',
      JSON.stringify(['Web Development', 'React', 'Python']),
      'Beginner',
      'Project-Based',
      5,
      'Medium (10-30 hrs)'
    );

    const token = jwt.sign(
      { id: userId, email: email.toLowerCase().trim(), role: safeRole, full_name: full_name.trim() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: userId,
        email: email.toLowerCase().trim(),
        full_name: full_name.trim(),
        role: safeRole,
      },
      message: 'Account registered successfully.',
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Failed to register account.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase().trim()) as any;
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, full_name: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
      },
      message: 'Logged in successfully.',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req: AuthRequest, res) => {
  try {
    const user = db.prepare('SELECT id, email, full_name, role, created_at FROM users WHERE id = ?').get(req.user!.id) as any;
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    let profile = db.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(req.user!.id) as any;
    if (profile) {
      profile.preferred_topics = JSON.parse(profile.preferred_topics || '[]');
    }

    res.json({
      user,
      profile,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch user data.' });
  }
});

// ==========================================
// 3. COURSES API
// ==========================================
app.get('/api/courses', optionalAuth, (req: AuthRequest, res) => {
  try {
    const { search, category, difficulty, format, duration, sort = 'rating', page = '1', limit = '50' } = req.query;

    let query = 'SELECT * FROM courses WHERE 1=1';
    const params: any[] = [];

    if (search && typeof search === 'string' && search.trim()) {
      const term = `%${search.trim().toLowerCase()}%`;
      query += ` AND (LOWER(title) LIKE ? OR LOWER(description) LIKE ? OR LOWER(topics) LIKE ? OR LOWER(instructor) LIKE ?)`;
      params.push(term, term, term, term);
    }

    if (category && typeof category === 'string' && category !== 'All') {
      query += ' AND category = ?';
      params.push(category);
    }

    if (difficulty && typeof difficulty === 'string' && difficulty !== 'All') {
      query += ' AND difficulty = ?';
      params.push(difficulty);
    }

    if (format && typeof format === 'string' && format !== 'All') {
      query += ' AND format = ?';
      params.push(format);
    }

    if (duration && typeof duration === 'string' && duration !== 'All') {
      if (duration === 'Short') {
        query += ' AND duration_hours < 15';
      } else if (duration === 'Medium') {
        query += ' AND duration_hours >= 15 AND duration_hours <= 28';
      } else if (duration === 'Long') {
        query += ' AND duration_hours > 28';
      }
    }

    // Sorting
    if (sort === 'rating') {
      query += ' ORDER BY rating DESC, review_count DESC';
    } else if (sort === 'duration_asc') {
      query += ' ORDER BY duration_hours ASC';
    } else if (sort === 'duration_desc') {
      query += ' ORDER BY duration_hours DESC';
    } else if (sort === 'newest') {
      query += ' ORDER BY id DESC';
    } else {
      query += ' ORDER BY is_featured DESC, rating DESC';
    }

    const rows = db.prepare(query).all(...params) as any[];

    // Fetch user saved and enrolled courses if authenticated
    let savedSet = new Set<number>();
    let enrolledMap = new Map<number, number>();

    if (req.user) {
      const saved = db.prepare('SELECT course_id FROM saved_courses WHERE user_id = ?').all(req.user.id) as any[];
      saved.forEach((s) => savedSet.add(s.course_id));

      const enrollments = db.prepare('SELECT course_id, progress_percent FROM enrollments WHERE user_id = ?').all(req.user.id) as any[];
      enrollments.forEach((e) => enrolledMap.set(e.course_id, e.progress_percent));
    }

    const courses = rows.map((r) => {
      const parsed = parseCourseRow(r);
      return {
        ...parsed,
        is_saved: savedSet.has(parsed.id),
        is_enrolled: enrolledMap.has(parsed.id),
        enrollment_progress: enrolledMap.get(parsed.id),
      };
    });

    res.json({
      courses,
      total: courses.length,
    });
  } catch (err: any) {
    console.error('Fetch courses error:', err);
    res.status(500).json({ error: 'Failed to fetch courses.' });
  }
});

app.get('/api/courses/:id', optionalAuth, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const row = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as any;

    if (!row) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    const course = parseCourseRow(row);
    const lessons = db.prepare('SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC').all(courseId) as any[];

    let is_saved = false;
    let is_enrolled = false;
    let enrollment_progress = 0;
    let completedLessonIds = new Set<number>();

    if (req.user) {
      const saved = db.prepare('SELECT id FROM saved_courses WHERE user_id = ? AND course_id = ?').get(req.user.id, courseId);
      is_saved = Boolean(saved);

      const enrollment = db.prepare('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?').get(req.user.id, courseId) as any;
      if (enrollment) {
        is_enrolled = true;
        enrollment_progress = enrollment.progress_percent;

        const progressRows = db.prepare('SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND course_id = ? AND completed = 1').all(req.user.id, courseId) as any[];
        progressRows.forEach((p) => completedLessonIds.add(p.lesson_id));
      }
    }

    const lessonsWithStatus = lessons.map((l) => ({
      ...l,
      completed: completedLessonIds.has(l.id),
    }));

    res.json({
      course: {
        ...course,
        lessons: lessonsWithStatus,
        is_saved,
        is_enrolled,
        enrollment_progress,
      },
    });
  } catch (err: any) {
    console.error('Fetch course details error:', err);
    res.status(500).json({ error: 'Failed to load course details.' });
  }
});

// Admin: Add course
app.post('/api/courses', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const {
      title,
      description,
      short_description,
      instructor,
      category,
      difficulty,
      format,
      duration_hours,
      thumbnail_url,
      topics = [],
      prerequisites = [],
      learning_outcomes = [],
      lessons = [],
      is_featured = false,
    } = req.body;

    if (!title || !description || !instructor || !category || !difficulty || !duration_hours) {
      return res.status(400).json({ error: 'Missing required course fields.' });
    }

    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Date.now().toString().slice(-4);

    const insertCourse = db.prepare(`
      INSERT INTO courses (
        title, slug, description, short_description, instructor, category,
        difficulty, format, duration_hours, rating, review_count, thumbnail_url,
        topics, prerequisites, learning_outcomes, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = insertCourse.run(
      title,
      slug,
      description,
      short_description || description.slice(0, 120),
      instructor,
      category,
      difficulty,
      format || 'Video Lectures',
      Number(duration_hours),
      5.0,
      1,
      thumbnail_url || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      JSON.stringify(topics),
      JSON.stringify(prerequisites),
      JSON.stringify(learning_outcomes),
      is_featured ? 1 : 0
    );

    const newCourseId = Number(result.lastInsertRowid);

    if (Array.isArray(lessons) && lessons.length > 0) {
      const insertLesson = db.prepare(`
        INSERT INTO lessons (course_id, title, duration_minutes, order_index, description)
        VALUES (?, ?, ?, ?, ?)
      `);
      let idx = 1;
      for (const les of lessons) {
        insertLesson.run(newCourseId, les.title, les.duration_minutes || 30, idx++, les.description || '');
      }
    }

    res.status(201).json({ id: newCourseId, message: 'Course created successfully.' });
  } catch (err: any) {
    console.error('Create course error:', err);
    res.status(500).json({ error: 'Failed to create course.' });
  }
});

// Admin: Edit course
app.put('/api/courses/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    const {
      title,
      description,
      short_description,
      instructor,
      category,
      difficulty,
      format,
      duration_hours,
      thumbnail_url,
      topics,
      prerequisites,
      learning_outcomes,
      is_featured,
    } = req.body;

    const existing = db.prepare('SELECT id FROM courses WHERE id = ?').get(courseId);
    if (!existing) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    db.prepare(`
      UPDATE courses SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        short_description = COALESCE(?, short_description),
        instructor = COALESCE(?, instructor),
        category = COALESCE(?, category),
        difficulty = COALESCE(?, difficulty),
        format = COALESCE(?, format),
        duration_hours = COALESCE(?, duration_hours),
        thumbnail_url = COALESCE(?, thumbnail_url),
        topics = COALESCE(?, topics),
        prerequisites = COALESCE(?, prerequisites),
        learning_outcomes = COALESCE(?, learning_outcomes),
        is_featured = COALESCE(?, is_featured)
      WHERE id = ?
    `).run(
      title,
      description,
      short_description,
      instructor,
      category,
      difficulty,
      format,
      duration_hours ? Number(duration_hours) : null,
      thumbnail_url,
      topics ? JSON.stringify(topics) : null,
      prerequisites ? JSON.stringify(prerequisites) : null,
      learning_outcomes ? JSON.stringify(learning_outcomes) : null,
      typeof is_featured === 'boolean' ? (is_featured ? 1 : 0) : null,
      courseId
    );

    res.json({ message: 'Course updated successfully.' });
  } catch (err: any) {
    console.error('Update course error:', err);
    res.status(500).json({ error: 'Failed to update course.' });
  }
});

// Admin: Delete course
app.delete('/api/courses/:id', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.id, 10);
    db.prepare('DELETE FROM courses WHERE id = ?').run(courseId);
    res.json({ message: 'Course deleted successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete course.' });
  }
});

// ==========================================
// 4. STUDENT PROFILE
// ==========================================
app.get('/api/profile', authenticateToken, (req: AuthRequest, res) => {
  try {
    const profile = db.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(req.user!.id) as any;
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found.' });
    }
    profile.preferred_topics = JSON.parse(profile.preferred_topics || '[]');
    res.json({ profile });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch student profile.' });
  }
});

app.put('/api/profile', authenticateToken, (req: AuthRequest, res) => {
  try {
    const {
      learning_goal,
      preferred_topics,
      skill_level,
      preferred_format,
      weekly_study_hours,
      preferred_duration,
      bio,
    } = req.body;

    const existing = db.prepare('SELECT id FROM student_profiles WHERE user_id = ?').get(req.user!.id);

    if (existing) {
      db.prepare(`
        UPDATE student_profiles SET
          learning_goal = COALESCE(?, learning_goal),
          preferred_topics = COALESCE(?, preferred_topics),
          skill_level = COALESCE(?, skill_level),
          preferred_format = COALESCE(?, preferred_format),
          weekly_study_hours = COALESCE(?, weekly_study_hours),
          preferred_duration = COALESCE(?, preferred_duration),
          bio = COALESCE(?, bio),
          updated_at = datetime('now')
        WHERE user_id = ?
      `).run(
        learning_goal,
        preferred_topics ? JSON.stringify(preferred_topics) : null,
        skill_level,
        preferred_format,
        weekly_study_hours ? Number(weekly_study_hours) : null,
        preferred_duration,
        bio,
        req.user!.id
      );
    } else {
      db.prepare(`
        INSERT INTO student_profiles (
          user_id, learning_goal, preferred_topics, skill_level, preferred_format, weekly_study_hours, preferred_duration, bio
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        req.user!.id,
        learning_goal || 'career_transition',
        JSON.stringify(preferred_topics || []),
        skill_level || 'Beginner',
        preferred_format || 'Project-Based',
        weekly_study_hours || 5,
        preferred_duration || 'Medium (10-30 hrs)',
        bio || ''
      );
    }

    const updated = db.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(req.user!.id) as any;
    updated.preferred_topics = JSON.parse(updated.preferred_topics || '[]');
    res.json({ profile: updated, message: 'Learning preferences updated successfully.' });
  } catch (err: any) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Failed to update preferences.' });
  }
});

// ==========================================
// 5. RECOMMENDATIONS ENGINE
// ==========================================
app.get('/api/recommendations', authenticateToken, (req: AuthRequest, res) => {
  try {
    const profileRow = db.prepare('SELECT * FROM student_profiles WHERE user_id = ?').get(req.user!.id) as any;
    const preferences: StudentPreferences = profileRow
      ? {
          learning_goal: profileRow.learning_goal,
          preferred_topics: JSON.parse(profileRow.preferred_topics || '[]'),
          skill_level: profileRow.skill_level,
          preferred_format: profileRow.preferred_format,
          weekly_study_hours: profileRow.weekly_study_hours,
          preferred_duration: profileRow.preferred_duration,
        }
      : {
          preferred_topics: [],
          skill_level: 'All Levels',
        };

    // Get all courses
    const courseRows = db.prepare('SELECT * FROM courses').all() as any[];
    const courses: CourseData[] = courseRows.map(parseCourseRow);

    // Get enrolled courses to filter out
    const enrollments = db.prepare('SELECT course_id FROM enrollments WHERE user_id = ?').all(req.user!.id) as any[];
    const enrolledIds = enrollments.map((e) => e.course_id);

    // Get feedback records
    const feedbackRows = db.prepare('SELECT course_id, feedback FROM recommendation_feedback WHERE user_id = ?').all(req.user!.id) as any[];
    const feedbackRecords = feedbackRows.map((f) => ({
      course_id: f.course_id,
      feedback: f.feedback as 'relevant' | 'not_relevant',
    }));

    // Get saved courses
    const saved = db.prepare('SELECT course_id FROM saved_courses WHERE user_id = ?').all(req.user!.id) as any[];
    const savedSet = new Set(saved.map((s) => s.course_id));

    // Rank courses with algorithm
    const ranked = rankCourses(courses, preferences, enrolledIds, feedbackRecords);

    // Attach saved and user feedback status
    const feedbackMap = new Map<number, 'relevant' | 'not_relevant'>();
    feedbackRecords.forEach((f) => feedbackMap.set(f.course_id, f.feedback));

    const recommendations = ranked.map((r) => ({
      ...r,
      course: {
        ...r.course,
        is_saved: savedSet.has(r.course.id),
        is_enrolled: false,
      },
      userFeedback: feedbackMap.get(r.course.id) || null,
    }));

    res.json({
      recommendations,
      total: recommendations.length,
      userPreferences: preferences,
    });
  } catch (err: any) {
    console.error('Recommendations error:', err);
    res.status(500).json({ error: 'Failed to compute recommendations.' });
  }
});

app.post('/api/recommendations/feedback', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { course_id, feedback, note } = req.body;
    if (!course_id || !feedback || !['relevant', 'not_relevant'].includes(feedback)) {
      return res.status(400).json({ error: 'Invalid feedback parameters.' });
    }

    db.prepare(`
      INSERT INTO recommendation_feedback (user_id, course_id, feedback, note, created_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id, course_id) DO UPDATE SET
        feedback = excluded.feedback,
        note = excluded.note,
        created_at = datetime('now')
    `).run(req.user!.id, course_id, feedback, note || null);

    res.json({ message: 'Feedback recorded. Recommendation scores updated.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to record feedback.' });
  }
});

// ==========================================
// 6. SAVED COURSES
// ==========================================
app.get('/api/saved-courses', authenticateToken, (req: AuthRequest, res) => {
  try {
    const rows = db.prepare(`
      SELECT c.*, sc.saved_at
      FROM saved_courses sc
      JOIN courses c ON c.id = sc.course_id
      WHERE sc.user_id = ?
      ORDER BY sc.saved_at DESC
    `).all(req.user!.id) as any[];

    const enrollments = db.prepare('SELECT course_id FROM enrollments WHERE user_id = ?').all(req.user!.id) as any[];
    const enrolledSet = new Set(enrollments.map((e) => e.course_id));

    const courses = rows.map((r) => ({
      ...parseCourseRow(r),
      saved_at: r.saved_at,
      is_saved: true,
      is_enrolled: enrolledSet.has(r.id),
    }));

    res.json({ courses, total: courses.length });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch saved courses.' });
  }
});

app.post('/api/saved-courses/:course_id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.course_id, 10);
    db.prepare(`
      INSERT OR IGNORE INTO saved_courses (user_id, course_id)
      VALUES (?, ?)
    `).run(req.user!.id, courseId);

    res.json({ message: 'Course saved to wishlist.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save course.' });
  }
});

app.delete('/api/saved-courses/:course_id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.course_id, 10);
    db.prepare('DELETE FROM saved_courses WHERE user_id = ? AND course_id = ?').run(req.user!.id, courseId);
    res.json({ message: 'Course removed from saved courses.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to unsave course.' });
  }
});

// ==========================================
// 7. ENROLLMENTS & LESSON PROGRESS
// ==========================================
app.get('/api/enrollments', authenticateToken, (req: AuthRequest, res) => {
  try {
    const rows = db.prepare(`
      SELECT e.*, c.title, c.slug, c.description, c.short_description, c.instructor,
             c.category, c.difficulty, c.format, c.duration_hours, c.rating, c.thumbnail_url,
             c.topics, c.prerequisites, c.learning_outcomes
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE e.user_id = ?
      ORDER BY e.enrolled_at DESC
    `).all(req.user!.id) as any[];

    const enrollments = rows.map((r) => {
      const course = parseCourseRow(r);
      const completedLessons = db.prepare(`
        SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND course_id = ? AND completed = 1
      `).all(req.user!.id, r.course_id) as any[];

      return {
        id: r.id,
        user_id: r.user_id,
        course_id: r.course_id,
        enrolled_at: r.enrolled_at,
        progress_percent: r.progress_percent,
        status: r.status,
        completed_at: r.completed_at,
        course,
        completed_lessons: completedLessons.map((l) => l.lesson_id),
      };
    });

    res.json({ enrollments });
  } catch (err: any) {
    console.error('Fetch enrollments error:', err);
    res.status(500).json({ error: 'Failed to fetch enrollments.' });
  }
});

app.post('/api/enrollments/:course_id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.course_id, 10);
    const existing = db.prepare('SELECT id FROM enrollments WHERE user_id = ? AND course_id = ?').get(req.user!.id, courseId);
    if (existing) {
      return res.status(400).json({ error: 'You are already enrolled in this course.' });
    }

    db.prepare(`
      INSERT INTO enrollments (user_id, course_id, progress_percent, status)
      VALUES (?, ?, 0, 'active')
    `).run(req.user!.id, courseId);

    res.status(201).json({ message: 'Enrolled in course successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to enroll in course.' });
  }
});

app.get('/api/enrollments/:course_id/progress', authenticateToken, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.course_id, 10);
    const enrollment = db.prepare('SELECT * FROM enrollments WHERE user_id = ? AND course_id = ?').get(req.user!.id, courseId) as any;
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found.' });
    }

    const completed = db.prepare(`
      SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND course_id = ? AND completed = 1
    `).all(req.user!.id, courseId) as any[];

    res.json({
      enrollment,
      completed_lessons: completed.map((c) => c.lesson_id),
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to load progress.' });
  }
});

app.post('/api/lessons/:lesson_id/complete', authenticateToken, (req: AuthRequest, res) => {
  try {
    const lessonId = parseInt(req.params.lesson_id, 10);
    const lesson = db.prepare('SELECT id, course_id FROM lessons WHERE id = ?').get(lessonId) as any;
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found.' });
    }

    // Toggle completion or mark complete
    const existing = db.prepare('SELECT completed FROM lesson_progress WHERE user_id = ? AND lesson_id = ?').get(req.user!.id, lessonId) as any;
    const newStatus = existing && existing.completed === 1 ? 0 : 1;

    db.prepare(`
      INSERT INTO lesson_progress (user_id, lesson_id, course_id, completed, completed_at)
      VALUES (?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id, lesson_id) DO UPDATE SET
        completed = excluded.completed,
        completed_at = datetime('now')
    `).run(req.user!.id, lessonId, lesson.course_id, newStatus);

    // Recalculate course progress percentage
    const totalLessons = (db.prepare('SELECT count(*) as count FROM lessons WHERE course_id = ?').get(lesson.course_id) as any)?.count || 1;
    const completedCount = (db.prepare('SELECT count(*) as count FROM lesson_progress WHERE user_id = ? AND course_id = ? AND completed = 1').get(req.user!.id, lesson.course_id) as any)?.count || 0;

    const progress_percent = Math.round((completedCount / totalLessons) * 100);
    const isCompleted = progress_percent >= 100;

    db.prepare(`
      UPDATE enrollments SET
        progress_percent = ?,
        status = ?,
        completed_at = ?
      WHERE user_id = ? AND course_id = ?
    `).run(
      progress_percent,
      isCompleted ? 'completed' : 'active',
      isCompleted ? new Date().toISOString() : null,
      req.user!.id,
      lesson.course_id
    );

    res.json({
      lesson_id: lessonId,
      completed: newStatus === 1,
      progress_percent,
      course_status: isCompleted ? 'completed' : 'active',
      message: newStatus === 1 ? 'Lesson marked complete.' : 'Lesson marked incomplete.',
    });
  } catch (err: any) {
    console.error('Complete lesson error:', err);
    res.status(500).json({ error: 'Failed to update lesson status.' });
  }
});

// ==========================================
// 8. ADMIN DASHBOARD & STATISTICS
// ==========================================
app.get('/api/admin/statistics', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const totalCourses = (db.prepare('SELECT count(*) as c FROM courses').get() as any)?.c || 0;
    const totalStudents = (db.prepare("SELECT count(*) as c FROM users WHERE role = 'student'").get() as any)?.c || 0;
    const totalEnrollments = (db.prepare('SELECT count(*) as c FROM enrollments').get() as any)?.c || 0;
    const completedEnrollments = (db.prepare("SELECT count(*) as c FROM enrollments WHERE status = 'completed'").get() as any)?.c || 0;
    const avgRating = (db.prepare('SELECT avg(rating) as a FROM courses').get() as any)?.a || 4.8;

    const categoryBreakdown = db.prepare(`
      SELECT category, count(*) as count FROM courses GROUP BY category ORDER BY count DESC
    `).all() as any[];

    const difficultyBreakdown = db.prepare(`
      SELECT difficulty, count(*) as count FROM courses GROUP BY difficulty ORDER BY count DESC
    `).all() as any[];

    // 7-day mock trend data based on real database records
    const weeklyEnrollments = [
      { date: 'Mon', enrollments: Math.max(2, totalEnrollments - 8), completions: 1 },
      { date: 'Tue', enrollments: Math.max(3, totalEnrollments - 6), completions: 2 },
      { date: 'Wed', enrollments: Math.max(4, totalEnrollments - 5), completions: 2 },
      { date: 'Thu', enrollments: Math.max(3, totalEnrollments - 3), completions: 3 },
      { date: 'Fri', enrollments: Math.max(5, totalEnrollments - 2), completions: 4 },
      { date: 'Sat', enrollments: Math.max(4, totalEnrollments - 1), completions: 3 },
      { date: 'Sun', enrollments: totalEnrollments, completions: completedEnrollments },
    ];

    res.json({
      totalCourses,
      totalStudents,
      totalEnrollments,
      completedEnrollments,
      averageRating: parseFloat(avgRating.toFixed(2)),
      categoryBreakdown,
      difficultyBreakdown,
      weeklyEnrollments,
    });
  } catch (err: any) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Failed to fetch admin stats.' });
  }
});

app.get('/api/admin/students', authenticateToken, requireAdmin, (req: AuthRequest, res) => {
  try {
    const students = db.prepare(`
      SELECT u.id, u.email, u.full_name, u.created_at,
             sp.learning_goal, sp.skill_level,
             (SELECT count(*) FROM enrollments e WHERE e.user_id = u.id) as enrolled_count,
             (SELECT count(*) FROM enrollments e WHERE e.user_id = u.id AND e.status = 'completed') as completed_count
      FROM users u
      LEFT JOIN student_profiles sp ON sp.user_id = u.id
      WHERE u.role = 'student'
      ORDER BY u.id DESC
    `).all() as any[];

    res.json({ students });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch students list.' });
  }
});

// ==========================================
// 10. AI-POWERED LEARNING HUB ENDPOINTS
// ==========================================

// Dashboard Overview (streaks, next lesson, study goals, upcoming assessments)
app.get('/api/learning/dashboard-overview', authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;

    // 1. Learning streak & study time
    let streakRow = db.prepare('SELECT * FROM learning_streaks WHERE user_id = ?').get(userId) as any;
    if (!streakRow) {
      db.prepare(`
        INSERT INTO learning_streaks (user_id, current_streak, longest_streak, last_active_date, total_minutes_spent)
        VALUES (?, 1, 1, date('now'), 30)
      `).run(userId);
      streakRow = db.prepare('SELECT * FROM learning_streaks WHERE user_id = ?').get(userId) as any;
    }

    // 2. Enrollments summary
    const enrollments = db.prepare(`
      SELECT e.*, c.title, c.slug, c.category, c.difficulty, c.duration_hours, c.thumbnail_url
      FROM enrollments e
      JOIN courses c ON c.id = e.course_id
      WHERE e.user_id = ?
      ORDER BY e.progress_percent DESC
    `).all(userId) as any[];

    const activeCourses = enrollments.filter(e => e.status === 'active');
    const completedCourses = enrollments.filter(e => e.status === 'completed');

    // 3. Recommended next lesson across active courses
    let nextRecommendedLesson: any = null;
    for (const enc of activeCourses) {
      const remainingLesson = db.prepare(`
        SELECT l.id, l.title, l.duration_minutes, l.order_index, l.description, c.id as course_id, c.title as course_title
        FROM lessons l
        JOIN courses c ON c.id = l.course_id
        WHERE l.course_id = ?
          AND l.id NOT IN (
            SELECT lesson_id FROM lesson_progress WHERE user_id = ? AND course_id = ? AND completed = 1
          )
        ORDER BY l.order_index ASC
        LIMIT 1
      `).get(enc.course_id, userId, enc.course_id) as any;

      if (remainingLesson) {
        nextRecommendedLesson = remainingLesson;
        break;
      }
    }

    // 4. Upcoming assessments for active courses
    const upcomingAssessments = activeCourses.slice(0, 3).map(enc => ({
      course_id: enc.course_id,
      course_title: enc.title,
      module_title: 'Module 1 Assessment',
      passing_score: 75,
      estimated_mins: 15,
    }));

    // 5. Daily goals calculation
    const dailyGoal = {
      target_minutes: 45,
      completed_minutes: Math.min(45, (streakRow.total_minutes_spent % 45) + 15),
      target_lessons: 2,
      completed_lessons: Math.min(2, Math.max(1, (streakRow.total_minutes_spent > 60 ? 2 : 1))),
      is_achieved: streakRow.total_minutes_spent >= 45,
    };

    res.json({
      streak: {
        current_streak: streakRow.current_streak,
        longest_streak: streakRow.longest_streak,
        last_active_date: streakRow.last_active_date,
        total_minutes_spent: streakRow.total_minutes_spent,
      },
      stats: {
        total_enrolled: enrollments.length,
        active_courses: activeCourses.length,
        completed_courses: completedCourses.length,
      },
      active_courses: activeCourses.map(c => ({
        id: c.course_id,
        title: c.title,
        slug: c.slug,
        category: c.category,
        difficulty: c.difficulty,
        progress_percent: c.progress_percent,
        thumbnail_url: c.thumbnail_url,
        estimated_hours_remaining: Math.max(1, Math.round(c.duration_hours * (1 - c.progress_percent / 100))),
      })),
      next_recommended_lesson: nextRecommendedLesson,
      upcoming_assessments: upcomingAssessments,
      daily_goal: dailyGoal,
    });
  } catch (err: any) {
    console.error('Learning dashboard overview error:', err);
    res.status(500).json({ error: 'Failed to load learning dashboard overview.' });
  }
});

// Get or generate structured curriculum
app.get('/api/curriculum/:course_id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.course_id, 10);
    const courseRow = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as any;
    if (!courseRow) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    const course = parseCourseRow(courseRow);

    // Check cache in course_curricula
    const cached = db.prepare('SELECT curriculum_json FROM course_curricula WHERE course_id = ?').get(courseId) as any;
    if (cached) {
      return res.json({ curriculum: JSON.parse(cached.curriculum_json) });
    }

    // Generate curriculum
    const curriculum = buildCourseCurriculum(course);

    // Save to DB cache
    db.prepare(`
      INSERT OR REPLACE INTO course_curricula (course_id, curriculum_json)
      VALUES (?, ?)
    `).run(courseId, JSON.stringify(curriculum));

    res.json({ curriculum });
  } catch (err: any) {
    console.error('Curriculum error:', err);
    res.status(500).json({ error: 'Failed to retrieve course curriculum.' });
  }
});

// Get adaptive lesson learning content
app.get('/api/learning/lesson-content/:course_id/:lesson_id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.course_id, 10);
    const lessonId = parseInt(req.params.lesson_id, 10);
    const requestedLevel = (req.query.skillLevel as any) || 'Intermediate';

    const courseRow = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as any;
    const lessonRow = db.prepare('SELECT * FROM lessons WHERE id = ?').get(lessonId) as any;

    if (!courseRow || !lessonRow) {
      return res.status(404).json({ error: 'Course or lesson not found.' });
    }

    const course = parseCourseRow(courseRow);
    const content = getAdaptiveLessonContent(course, lessonRow.title, requestedLevel);

    res.json({ content });
  } catch (err: any) {
    console.error('Lesson content error:', err);
    res.status(500).json({ error: 'Failed to generate lesson content.' });
  }
});

// Recommended high-quality external resources & videos
app.get('/api/learning/resources/:course_id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.course_id, 10);
    const courseRow = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as any;
    if (!courseRow) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    const course = parseCourseRow(courseRow);
    const resources = getCuratedResources(course);

    res.json({ resources });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch curated resources.' });
  }
});

// Module Assessment
app.get('/api/learning/assessments/:course_id/:module_number', authenticateToken, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.course_id, 10);
    const moduleNumber = parseInt(req.params.module_number, 10) || 1;

    const courseRow = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as any;
    if (!courseRow) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    const course = parseCourseRow(courseRow);
    const assessment = buildModuleAssessment(course, moduleNumber);

    res.json({ assessment });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch module assessment.' });
  }
});

// Submit Assessment Attempt
app.post('/api/learning/assessments/submit', authenticateToken, (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { course_id, module_number = 1, answers } = req.body;

    const courseRow = db.prepare('SELECT * FROM courses WHERE id = ?').get(course_id) as any;
    if (!courseRow) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    const course = parseCourseRow(courseRow);
    const assessment = buildModuleAssessment(course, module_number);

    let correctCount = 0;
    const feedback: any[] = [];

    assessment.questions.forEach((q) => {
      const userAnswer = answers?.[q.id];
      const isCorrect = userAnswer === q.correct_index;
      if (isCorrect) correctCount++;

      feedback.push({
        questionId: q.id,
        question: q.question,
        userAnswer,
        correctAnswer: q.correct_index,
        isCorrect,
        explanation: q.explanation,
      });
    });

    const totalQuestions = assessment.questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const passed = score >= assessment.passing_score;

    // Save attempt in database
    db.prepare(`
      INSERT INTO assessment_attempts (user_id, course_id, assessment_id, score, total_questions, passed, answers_json)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, course_id, module_number, score, totalQuestions, passed ? 1 : 0, JSON.stringify(answers));

    // Update study time (+15 mins) & streak
    db.prepare(`
      INSERT INTO learning_streaks (user_id, current_streak, longest_streak, last_active_date, total_minutes_spent)
      VALUES (?, 1, 1, date('now'), 15)
      ON CONFLICT(user_id) DO UPDATE SET
        total_minutes_spent = total_minutes_spent + 15,
        last_active_date = date('now')
    `).run(userId);

    res.json({
      score,
      totalQuestions,
      correctCount,
      passed,
      passingScore: assessment.passing_score,
      feedback,
      message: passed ? 'Congratulations! You passed the module assessment.' : 'You can review the concepts and retry the questions.',
    });
  } catch (err: any) {
    console.error('Submit assessment error:', err);
    res.status(500).json({ error: 'Failed to grade assessment.' });
  }
});

// Assessment History
app.get('/api/learning/assessments/history/:course_id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.course_id, 10);
    const attempts = db.prepare(`
      SELECT * FROM assessment_attempts
      WHERE user_id = ? AND course_id = ?
      ORDER BY created_at DESC
      LIMIT 10
    `).all(req.user!.id, courseId) as any[];

    res.json({ attempts });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch assessment history.' });
  }
});

// Personalized Learning Roadmap
app.get('/api/learning/roadmap/:course_id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.course_id, 10);
    const userId = req.user!.id;

    // Check DB for saved roadmap
    const saved = db.prepare('SELECT roadmap_json, weekly_study_hours FROM learning_roadmaps WHERE user_id = ? AND course_id = ?').get(userId, courseId) as any;
    if (saved) {
      return res.json({ roadmap: JSON.parse(saved.roadmap_json), weekly_study_hours: saved.weekly_study_hours });
    }

    // Generate roadmap
    const courseRow = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as any;
    if (!courseRow) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    const course = parseCourseRow(courseRow);
    const profile = db.prepare('SELECT weekly_study_hours FROM student_profiles WHERE user_id = ?').get(userId) as any;
    const weeklyHours = profile?.weekly_study_hours || 6;

    const roadmap = generatePersonalizedRoadmap(course, weeklyHours);

    db.prepare(`
      INSERT OR REPLACE INTO learning_roadmaps (user_id, course_id, weekly_study_hours, roadmap_json)
      VALUES (?, ?, ?, ?)
    `).run(userId, courseId, weeklyHours, JSON.stringify(roadmap));

    res.json({ roadmap, weekly_study_hours: weeklyHours });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve roadmap.' });
  }
});

// Update Roadmap Study Hours
app.post('/api/learning/roadmap/:course_id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.course_id, 10);
    const userId = req.user!.id;
    const { weekly_study_hours } = req.body;

    const hours = Math.max(2, Math.min(30, parseInt(weekly_study_hours, 10) || 6));
    const courseRow = db.prepare('SELECT * FROM courses WHERE id = ?').get(courseId) as any;
    if (!courseRow) {
      return res.status(404).json({ error: 'Course not found.' });
    }
    const course = parseCourseRow(courseRow);
    const roadmap = generatePersonalizedRoadmap(course, hours);

    db.prepare(`
      INSERT OR REPLACE INTO learning_roadmaps (user_id, course_id, weekly_study_hours, roadmap_json, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'))
    `).run(userId, courseId, hours, JSON.stringify(roadmap));

    res.json({ roadmap, weekly_study_hours: hours, message: 'Learning roadmap updated according to your new study schedule.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update roadmap.' });
  }
});

// Toggle Roadmap Task Completed
app.post('/api/learning/roadmap/:course_id/toggle-day', authenticateToken, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.course_id, 10);
    const userId = req.user!.id;
    const { day_number } = req.body;

    const row = db.prepare('SELECT roadmap_json, weekly_study_hours FROM learning_roadmaps WHERE user_id = ? AND course_id = ?').get(userId, courseId) as any;
    if (!row) {
      return res.status(404).json({ error: 'Roadmap not found.' });
    }

    const roadmap = JSON.parse(row.roadmap_json);
    const day = roadmap.days.find((d: any) => d.day_number === day_number);
    if (day) {
      day.completed = !day.completed;
      db.prepare('UPDATE learning_roadmaps SET roadmap_json = ?, updated_at = datetime(\'now\') WHERE user_id = ? AND course_id = ?')
        .run(JSON.stringify(roadmap), userId, courseId);
    }

    res.json({ roadmap, message: 'Milestone updated.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to toggle roadmap day.' });
  }
});

// Student Notes CRUD
app.get('/api/learning/notes/:course_id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.course_id, 10);
    const notes = db.prepare(`
      SELECT sn.*, l.title as lesson_title
      FROM student_notes sn
      LEFT JOIN lessons l ON l.id = sn.lesson_id
      WHERE sn.user_id = ? AND sn.course_id = ?
      ORDER BY sn.updated_at DESC
    `).all(req.user!.id, courseId) as any[];

    res.json({
      notes: notes.map(n => ({
        ...n,
        tags: JSON.parse(n.tags || '[]'),
      }))
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch notes.' });
  }
});

app.post('/api/learning/notes', authenticateToken, (req: AuthRequest, res) => {
  try {
    const { course_id, lesson_id, title, content, tags = [] } = req.body;
    if (!course_id || !lesson_id || !title || !content) {
      return res.status(400).json({ error: 'Missing required note parameters.' });
    }

    db.prepare(`
      INSERT INTO student_notes (user_id, course_id, lesson_id, title, content, tags, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(user_id, course_id, lesson_id) DO UPDATE SET
        title = excluded.title,
        content = excluded.content,
        tags = excluded.tags,
        updated_at = datetime('now')
    `).run(req.user!.id, course_id, lesson_id, title, content, JSON.stringify(tags));

    res.json({ message: 'Note saved successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to save note.' });
  }
});

app.delete('/api/learning/notes/:id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const noteId = parseInt(req.params.id, 10);
    db.prepare('DELETE FROM student_notes WHERE id = ? AND user_id = ?').run(noteId, req.user!.id);
    res.json({ message: 'Note deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to delete note.' });
  }
});

// Bookmarks
app.get('/api/learning/bookmarks/:course_id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.course_id, 10);
    const rows = db.prepare('SELECT lesson_id FROM student_bookmarks WHERE user_id = ? AND course_id = ?').all(req.user!.id, courseId) as any[];
    res.json({ bookmarked_lesson_ids: rows.map(r => r.lesson_id) });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to fetch bookmarks.' });
  }
});

app.post('/api/learning/bookmarks/:course_id/:lesson_id', authenticateToken, (req: AuthRequest, res) => {
  try {
    const courseId = parseInt(req.params.course_id, 10);
    const lessonId = parseInt(req.params.lesson_id, 10);
    const userId = req.user!.id;

    const existing = db.prepare('SELECT id FROM student_bookmarks WHERE user_id = ? AND course_id = ? AND lesson_id = ?').get(userId, courseId, lessonId);
    if (existing) {
      db.prepare('DELETE FROM student_bookmarks WHERE id = ?').run((existing as any).id);
      return res.json({ bookmarked: false, message: 'Bookmark removed.' });
    } else {
      db.prepare('INSERT INTO student_bookmarks (user_id, course_id, lesson_id) VALUES (?, ?, ?)').run(userId, courseId, lessonId);
      return res.json({ bookmarked: true, message: 'Lesson bookmarked.' });
    }
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to toggle bookmark.' });
  }
});

// AI Personal Tutor Conversation Endpoint
app.post('/api/tutor/chat', authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { course_id, lesson_id, messages, code_snippet } = req.body;
    const userId = req.user!.id;

    if (!course_id || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Missing course_id or messages array.' });
    }

    const courseRow = db.prepare('SELECT * FROM courses WHERE id = ?').get(course_id) as any;
    if (!courseRow) {
      return res.status(404).json({ error: 'Course not found.' });
    }

    const lessonRow = lesson_id ? db.prepare('SELECT title FROM lessons WHERE id = ?').get(lesson_id) as any : null;
    const profile = db.prepare('SELECT skill_level FROM student_profiles WHERE user_id = ?').get(userId) as any;

    const tutorResponse = await askAiTutor(messages, {
      courseTitle: courseRow.title,
      category: courseRow.category,
      difficulty: courseRow.difficulty,
      lessonTitle: lessonRow ? lessonRow.title : undefined,
      codeSnippet: code_snippet,
      studentSkillLevel: profile?.skill_level || courseRow.difficulty,
    });

    // Save recent messages into tutor_messages
    const lastUserMsg = messages[messages.length - 1];
    if (lastUserMsg && lastUserMsg.content) {
      db.prepare('INSERT INTO tutor_messages (user_id, course_id, role, content) VALUES (?, ?, ?, ?)').run(userId, course_id, 'user', lastUserMsg.content);
      db.prepare('INSERT INTO tutor_messages (user_id, course_id, role, content) VALUES (?, ?, ?, ?)').run(userId, course_id, 'model', tutorResponse);
    }

    // Award study minutes for consulting tutor
    db.prepare(`
      INSERT INTO learning_streaks (user_id, current_streak, longest_streak, last_active_date, total_minutes_spent)
      VALUES (?, 1, 1, date('now'), 10)
      ON CONFLICT(user_id) DO UPDATE SET
        total_minutes_spent = total_minutes_spent + 10,
        last_active_date = date('now')
    `).run(userId);

    res.json({ reply: tutorResponse });
  } catch (err: any) {
    console.error('Tutor chat error:', err);
    res.status(500).json({ error: 'Failed to process AI tutor request.' });
  }
});

// ==========================================
// 11. VITE DEV SERVER INTEGRATION
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Smart Course Recommender] Full-stack Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});

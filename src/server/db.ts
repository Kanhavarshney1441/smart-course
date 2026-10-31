import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';
import { SAMPLE_COURSES } from './sampleCourses.js';

const DB_PATH = path.resolve(process.cwd(), 'database.sqlite');

export function initDatabase() {
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      learning_goal TEXT DEFAULT 'career_transition',
      preferred_topics TEXT DEFAULT '["React", "TypeScript", "Python"]',
      skill_level TEXT DEFAULT 'Intermediate',
      preferred_format TEXT DEFAULT 'Project-Based',
      weekly_study_hours INTEGER DEFAULT 6,
      preferred_duration TEXT DEFAULT 'Medium (10-30 hrs)',
      bio TEXT DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT NOT NULL,
      short_description TEXT NOT NULL,
      instructor TEXT NOT NULL,
      category TEXT NOT NULL,
      difficulty TEXT NOT NULL,
      format TEXT NOT NULL,
      duration_hours REAL NOT NULL,
      rating REAL NOT NULL DEFAULT 5.0,
      review_count INTEGER NOT NULL DEFAULT 0,
      thumbnail_url TEXT NOT NULL,
      topics TEXT NOT NULL,
      prerequisites TEXT NOT NULL,
      learning_outcomes TEXT NOT NULL,
      is_featured INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      order_index INTEGER NOT NULL,
      description TEXT NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      enrolled_at TEXT NOT NULL DEFAULT (datetime('now')),
      progress_percent INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      completed_at TEXT,
      UNIQUE(user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      completed INTEGER NOT NULL DEFAULT 1,
      completed_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS saved_courses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      saved_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recommendation_feedback (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      feedback TEXT NOT NULL, -- 'relevant' | 'not_relevant'
      note TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS course_curricula (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      course_id INTEGER UNIQUE NOT NULL,
      generated_at TEXT NOT NULL DEFAULT (datetime('now')),
      curriculum_json TEXT NOT NULL,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS assessment_attempts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      assessment_id INTEGER NOT NULL,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      passed INTEGER NOT NULL DEFAULT 0,
      answers_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS student_notes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      tags TEXT DEFAULT '[]',
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, course_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS student_bookmarks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      lesson_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, course_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning_roadmaps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      weekly_study_hours INTEGER NOT NULL DEFAULT 6,
      roadmap_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS learning_streaks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER UNIQUE NOT NULL,
      current_streak INTEGER NOT NULL DEFAULT 1,
      longest_streak INTEGER NOT NULL DEFAULT 1,
      last_active_date TEXT NOT NULL DEFAULT (date('now')),
      total_minutes_spent INTEGER NOT NULL DEFAULT 45,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS tutor_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      course_id INTEGER NOT NULL,
      role TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );
  `);

  seedDataIfEmpty(db);
  return db;
}

export function seedDataIfEmpty(db: Database.Database) {
  const userCount = db.prepare('SELECT count(*) as count FROM users').get() as { count: number };
  if (userCount.count === 0) {
    console.log('[DB] Seeding initial users...');

    const salt = bcrypt.genSaltSync(10);
    const studentPassHash = bcrypt.hashSync('student123', salt);
    const adminPassHash = bcrypt.hashSync('admin123', salt);

    const insertUser = db.prepare(`
      INSERT INTO users (email, password_hash, full_name, role)
      VALUES (?, ?, ?, ?)
    `);

    const studentInsert = insertUser.run('student@example.com', studentPassHash, 'Alex Rivera', 'student');
    const studentId = studentInsert.lastInsertRowid;

    insertUser.run('admin@example.com', adminPassHash, 'Dr. Eleanor Vance (Admin)', 'admin');

    // Create student profile
    db.prepare(`
      INSERT INTO student_profiles (user_id, learning_goal, preferred_topics, skill_level, preferred_format, weekly_study_hours, preferred_duration, bio)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      studentId,
      'career_transition',
      JSON.stringify(['React', 'TypeScript', 'Node.js', 'Python', 'DevOps']),
      'Intermediate',
      'Project-Based',
      8,
      'Medium (10-30 hrs)',
      'Computer Science undergrad preparing for full-stack engineering roles.'
    );
  }

  const courseCount = db.prepare('SELECT count(*) as count FROM courses').get() as { count: number };
  if (courseCount.count === 0) {
    console.log('[DB] Seeding courses catalog...');
    const insertCourse = db.prepare(`
      INSERT INTO courses (
        title, slug, description, short_description, instructor, category,
        difficulty, format, duration_hours, rating, review_count, thumbnail_url,
        topics, prerequisites, learning_outcomes, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertLesson = db.prepare(`
      INSERT INTO lessons (course_id, title, duration_minutes, order_index, description)
      VALUES (?, ?, ?, ?, ?)
    `);

    const insertTransaction = db.transaction(() => {
      for (const c of SAMPLE_COURSES) {
        const res = insertCourse.run(
          c.title,
          c.slug,
          c.description,
          c.short_description,
          c.instructor,
          c.category,
          c.difficulty,
          c.format,
          c.duration_hours,
          c.rating,
          c.review_count,
          c.thumbnail_url,
          JSON.stringify(c.topics),
          JSON.stringify(c.prerequisites),
          JSON.stringify(c.learning_outcomes),
          c.is_featured ? 1 : 0
        );
        const courseId = res.lastInsertRowid;

        let idx = 1;
        for (const lesson of c.lessons) {
          insertLesson.run(courseId, lesson.title, lesson.duration_minutes, idx++, lesson.description);
        }
      }
    });

    insertTransaction();
    console.log(`[DB] Successfully seeded ${SAMPLE_COURSES.length} courses with curriculum.`);

    // Seed sample enrollments for the demo student
    const studentUser = db.prepare("SELECT id FROM users WHERE email = 'student@example.com'").get() as { id: number } | undefined;
    if (studentUser) {
      const course1 = db.prepare("SELECT id FROM courses WHERE slug = 'react-node-masterclass'").get() as { id: number } | undefined;
      const course2 = db.prepare("SELECT id FROM courses WHERE slug = 'python-for-beginners'").get() as { id: number } | undefined;
      const course3 = db.prepare("SELECT id FROM courses WHERE slug = 'system-design-distributed-systems'").get() as { id: number } | undefined;

      if (course1) {
        db.prepare(`
          INSERT OR IGNORE INTO enrollments (user_id, course_id, progress_percent, status)
          VALUES (?, ?, 60, 'active')
        `).run(studentUser.id, course1.id);

        // Mark first 3 lessons complete for course1
        const lessons = db.prepare('SELECT id FROM lessons WHERE course_id = ? ORDER BY order_index ASC LIMIT 3').all(course1.id) as { id: number }[];
        for (const l of lessons) {
          db.prepare('INSERT OR IGNORE INTO lesson_progress (user_id, lesson_id, course_id, completed) VALUES (?, ?, ?, 1)').run(studentUser.id, l.id, course1.id);
        }
      }

      if (course2) {
        db.prepare(`
          INSERT OR IGNORE INTO enrollments (user_id, course_id, progress_percent, status, completed_at)
          VALUES (?, ?, 100, 'completed', datetime('now', '-2 days'))
        `).run(studentUser.id, course2.id);

        // Mark all lessons complete for course2
        const lessons = db.prepare('SELECT id FROM lessons WHERE course_id = ?').all(course2.id) as { id: number }[];
        for (const l of lessons) {
          db.prepare('INSERT OR IGNORE INTO lesson_progress (user_id, lesson_id, course_id, completed) VALUES (?, ?, ?, 1)').run(studentUser.id, l.id, course2.id);
        }
      }

      if (course3) {
        db.prepare(`
          INSERT OR IGNORE INTO saved_courses (user_id, course_id)
          VALUES (?, ?)
        `).run(studentUser.id, course3.id);
      }

      // Seed student streak
      db.prepare(`
        INSERT OR IGNORE INTO learning_streaks (user_id, current_streak, longest_streak, last_active_date, total_minutes_spent)
        VALUES (?, 5, 7, date('now'), 340)
      `).run(studentUser.id);

      // Seed sample note on Course 1 Lesson 1
      if (course1) {
        const firstLesson = db.prepare('SELECT id FROM lessons WHERE course_id = ? ORDER BY order_index ASC LIMIT 1').get(course1.id) as { id: number } | undefined;
        if (firstLesson) {
          db.prepare(`
            INSERT OR IGNORE INTO student_notes (user_id, course_id, lesson_id, title, content, tags)
            VALUES (?, ?, ?, 'Component Composition Best Practices', 'Key insight: keep component trees shallow by passing JSX children instead of prop-drilling callbacks.', '["React", "Architecture", "Hooks"]')
          `).run(studentUser.id, course1.id, firstLesson.id);

          db.prepare(`
            INSERT OR IGNORE INTO student_bookmarks (user_id, course_id, lesson_id)
            VALUES (?, ?, ?)
          `).run(studentUser.id, course1.id, firstLesson.id);
        }
      }
    }
  }
}

let dbInstance: Database.Database | null = null;
export function getDb(): Database.Database {
  if (!dbInstance) {
    dbInstance = initDatabase();
  }
  return dbInstance;
}

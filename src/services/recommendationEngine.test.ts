import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTopicOverlap,
  calculateGoalMatch,
  calculateSkillSuitability,
  calculateFormatMatch,
  calculateDurationMatch,
  rankCourses,
  CourseData,
  StudentPreferences
} from './recommendationEngine';

const mockCourses: CourseData[] = [
  {
    id: 1,
    title: 'Full-Stack React & Node.js Masterclass',
    slug: 'react-node-masterclass',
    description: 'Learn modern web development with React, TypeScript, and Node.js for career transition.',
    short_description: 'Full-stack web development course.',
    instructor: 'Dr. Sarah Connor',
    category: 'Web Development',
    difficulty: 'Intermediate',
    format: 'Project-Based',
    duration_hours: 24,
    rating: 4.8,
    review_count: 320,
    thumbnail_url: '/thumbnails/react.jpg',
    topics: ['React', 'TypeScript', 'Node.js', 'REST API', 'PostgreSQL'],
  },
  {
    id: 2,
    title: 'Deep Learning & Neural Networks with PyTorch',
    slug: 'deep-learning-pytorch',
    description: 'Advanced machine learning, deep neural networks, and computer vision with PyTorch.',
    short_description: 'Deep learning for experienced programmers.',
    instructor: 'Alex Rivera',
    category: 'Data Science & AI',
    difficulty: 'Advanced',
    format: 'Video Lectures',
    duration_hours: 45,
    rating: 4.9,
    review_count: 512,
    thumbnail_url: '/thumbnails/ai.jpg',
    topics: ['Machine Learning', 'Deep Learning', 'PyTorch', 'Python', 'Computer Vision'],
  },
  {
    id: 3,
    title: 'Python for Absolute Beginners',
    slug: 'python-beginners',
    description: 'Start programming from scratch with clean Python code and interactive exercises.',
    short_description: 'Introductory Python programming.',
    instructor: 'Emily Watson',
    category: 'Computer Science',
    difficulty: 'Beginner',
    format: 'Interactive Coding',
    duration_hours: 8,
    rating: 4.7,
    review_count: 1400,
    thumbnail_url: '/thumbnails/python.jpg',
    topics: ['Python', 'Programming Fundamentals', 'Logic', 'Data Structures'],
  }
];

test('calculateTopicOverlap correctly computes intersection score', () => {
  const result = calculateTopicOverlap(['React', 'TypeScript'], ['React', 'TypeScript', 'Node.js']);
  assert.equal(result.score, 30);
  assert.equal(result.matchingTopics.length, 2);

  const noOverlap = calculateTopicOverlap(['Rust', 'Go'], ['React', 'Node.js']);
  assert.equal(noOverlap.score, 0);
  assert.equal(noOverlap.matchingTopics.length, 0);
});

test('calculateSkillSuitability rewards exact matches and discounts distant levels', () => {
  const exact = calculateSkillSuitability('Intermediate', 'Intermediate');
  assert.equal(exact.score, 20);

  const stepUp = calculateSkillSuitability('Beginner', 'Intermediate');
  assert.ok(stepUp.score < 20 && stepUp.score >= 12);

  const farDiff = calculateSkillSuitability('Beginner', 'Advanced');
  assert.ok(farDiff.score < 10);
});

test('calculateFormatMatch awards full weight on format match', () => {
  const match = calculateFormatMatch('Project-Based', 'Project-Based');
  assert.equal(match.score, 10);

  const mismatch = calculateFormatMatch('Video Lectures', 'Interactive Coding');
  assert.equal(mismatch.score, 4);
});

test('calculateDurationMatch calculates estimated weeks based on weekly pace', () => {
  const duration = calculateDurationMatch('Medium (10-30 hrs)', 6, 24);
  assert.equal(duration.estimatedWeeks, 4);
  assert.equal(duration.score, 10);
});

test('rankCourses properly ranks courses by overall alignment and filters enrolled courses', () => {
  const userPrefs: StudentPreferences = {
    learning_goal: 'career_transition',
    preferred_topics: ['React', 'TypeScript', 'Node.js'],
    skill_level: 'Intermediate',
    preferred_format: 'Project-Based',
    weekly_study_hours: 6,
    preferred_duration: 'Medium (10-30 hrs)',
  };

  // When course 1 is enrolled, it should be excluded from recommendations
  const rankedWithEnrollment = rankCourses(mockCourses, userPrefs, [1]);
  assert.equal(rankedWithEnrollment.find(r => r.course.id === 1), undefined);

  // When none are enrolled, course 1 should rank #1 with high match percentage
  const ranked = rankCourses(mockCourses, userPrefs, []);
  assert.ok(ranked.length > 0);
  assert.equal(ranked[0].course.id, 1);
  assert.ok(ranked[0].score >= 85);
  assert.ok(ranked[0].matchingTopics.includes('React'));
});

test('rankCourses applies feedback penalty when user marks not_relevant', () => {
  const userPrefs: StudentPreferences = {
    learning_goal: 'career_transition',
    preferred_topics: ['React', 'TypeScript'],
    skill_level: 'Intermediate',
    preferred_format: 'Project-Based',
  };

  const initial = rankCourses(mockCourses, userPrefs, []);
  const initialScore = initial.find(r => r.course.id === 1)!.score;

  const withNegativeFeedback = rankCourses(mockCourses, userPrefs, [], [
    { course_id: 1, feedback: 'not_relevant' }
  ]);
  const penalizedScore = withNegativeFeedback.find(r => r.course.id === 1)!.score;

  assert.ok(penalizedScore < initialScore, 'Score should be lower after negative feedback');
});

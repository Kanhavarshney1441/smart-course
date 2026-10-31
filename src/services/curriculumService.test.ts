import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  buildCourseCurriculum,
  getAdaptiveLessonContent,
  getCuratedResources,
  buildModuleAssessment,
  generatePersonalizedRoadmap
} from '../server/curriculumService.js';

describe('AI-Powered Curriculum Service Tests', () => {
  const samplePythonCourse = {
    id: 2,
    title: 'Python for Absolute Beginners: Zero to Hero',
    slug: 'python-for-beginners',
    category: 'Computer Science',
    difficulty: 'Beginner',
    duration_hours: 12,
    topics: ['Python', 'Data Structures', 'Automation'],
  };

  const sampleReactCourse = {
    id: 1,
    title: 'Modern Full-Stack React & Node.js Masterclass',
    slug: 'react-node-masterclass',
    category: 'Web Development',
    difficulty: 'Intermediate',
    duration_hours: 28,
    topics: ['React', 'TypeScript', 'Node.js', 'Express'],
  };

  it('buildCourseCurriculum generates modular curriculum tailored for Python courses', () => {
    const curriculum = buildCourseCurriculum(samplePythonCourse);
    assert.strictEqual(curriculum.course_id, 2);
    assert.ok(curriculum.modules.length >= 4, 'Should contain at least 4 modules');
    assert.ok(curriculum.modules[0].title.includes('Module 1: Introduction to Python'));
    assert.ok(curriculum.modules[2].title.includes('Data Structures'));
    assert.ok(curriculum.capstone_project.title.includes('Capstone'));
    assert.ok(curriculum.capstone_project.milestones.length > 0);
  });

  it('buildCourseCurriculum generates modular curriculum tailored for React courses', () => {
    const curriculum = buildCourseCurriculum(sampleReactCourse);
    assert.strictEqual(curriculum.course_id, 1);
    assert.ok(curriculum.modules[0].title.includes('React 19 Architecture'));
    assert.ok(curriculum.capstone_project.tech_stack.includes('React 19'));
  });

  it('getAdaptiveLessonContent adjusts concept definitions based on learner skill level', () => {
    const beginnerContent = getAdaptiveLessonContent(samplePythonCourse, 'Working with Collections', 'Beginner');
    const advancedContent = getAdaptiveLessonContent(samplePythonCourse, 'Working with Collections', 'Advanced');

    assert.ok(beginnerContent.simpleDefinition.includes('fundamental recipe'));
    assert.ok(advancedContent.simpleDefinition.includes('architectural abstraction'));
    assert.ok(beginnerContent.practiceQuestions.length >= 2);
    assert.ok(beginnerContent.detailedNotes.length >= 2);
  });

  it('getCuratedResources returns verified links and metadata for course category', () => {
    const resources = getCuratedResources(samplePythonCourse);
    assert.ok(resources.length >= 3);
    const docRes = resources.find(r => r.resource_type === 'documentation');
    assert.ok(docRes);
    assert.ok(docRes.url.startsWith('https://docs.python.org'));
    assert.strictEqual(docRes.provider, 'Python Software Foundation');
  });

  it('buildModuleAssessment provides auto-gradeable questions with explanations', () => {
    const assessment = buildModuleAssessment(samplePythonCourse, 1);
    assert.strictEqual(assessment.id, 1);
    assert.ok(assessment.questions.length >= 4);
    for (const q of assessment.questions) {
      assert.ok(q.question.length > 5);
      assert.ok(q.options.length >= 2);
      assert.ok(q.correct_index >= 0 && q.correct_index < q.options.length);
      assert.ok(q.explanation.length > 10, 'Each question must have an educational explanation');
    }
  });

  it('generatePersonalizedRoadmap computes weekly breakdown according to study pace', () => {
    // 12 hour course at 6 hours/week -> 2 weeks (8 study days)
    const roadmap6h = generatePersonalizedRoadmap(samplePythonCourse, 6);
    assert.strictEqual(roadmap6h.weekly_study_hours, 6);
    assert.strictEqual(roadmap6h.total_weeks, 2);
    assert.strictEqual(roadmap6h.days.length, 8);

    // 12 hour course at 4 hours/week -> 3 weeks (12 study days)
    const roadmap4h = generatePersonalizedRoadmap(samplePythonCourse, 4);
    assert.strictEqual(roadmap4h.weekly_study_hours, 4);
    assert.strictEqual(roadmap4h.total_weeks, 3);
    assert.strictEqual(roadmap4h.days.length, 12);
  });
});

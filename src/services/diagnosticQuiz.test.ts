import test from 'node:test';
import assert from 'node:assert/strict';
import {
  evaluateQuiz,
  DIAGNOSTIC_QUESTIONS,
  PREDEFINED_LEARNING_PATHS
} from './diagnosticQuiz';

test('evaluateQuiz handles perfect score correctly as Advanced', () => {
  const perfectAnswers: Record<string, number> = {};
  for (const q of DIAGNOSTIC_QUESTIONS) {
    perfectAnswers[q.id] = q.correctAnswer;
  }

  const result = evaluateQuiz(perfectAnswers, DIAGNOSTIC_QUESTIONS);

  assert.equal(result.correctCount, DIAGNOSTIC_QUESTIONS.length);
  assert.equal(result.percentage, 100);
  assert.equal(result.overallSkillLevel, 'Advanced');
  assert.ok(result.strengths.length > 0);
  assert.ok(result.recommendedPath);
  assert.equal(result.detailedReview.every(r => r.isCorrect), true);
});

test('evaluateQuiz handles empty or all-incorrect answers as Beginner', () => {
  const emptyAnswers: Record<string, number> = {};
  const result = evaluateQuiz(emptyAnswers, DIAGNOSTIC_QUESTIONS);

  assert.equal(result.correctCount, 0);
  assert.equal(result.percentage, 0);
  assert.equal(result.overallSkillLevel, 'Beginner');
  assert.equal(result.recommendedPath.id, 'foundational-cs-engineer');
  assert.ok(result.growthAreas.length > 0);
});

test('evaluateQuiz maps high AI performance to AI & Deep Learning path', () => {
  const aiAnswers: Record<string, number> = {};
  // Answer all Data Science questions correctly
  for (const q of DIAGNOSTIC_QUESTIONS) {
    if (q.domain === 'Data Science & AI') {
      aiAnswers[q.id] = q.correctAnswer;
    } else {
      // Intentionally wrong answer
      aiAnswers[q.id] = (q.correctAnswer + 1) % 4;
    }
  }

  const result = evaluateQuiz(aiAnswers, DIAGNOSTIC_QUESTIONS);
  assert.ok(result.domainScores['Data Science & AI'].percentage === 100);
  assert.equal(result.recommendedPath.id, 'ai-deep-learning-specialist');
  assert.ok(result.recommendedPath.focusTopics.includes('PyTorch') || result.recommendedPath.focusTopics.includes('Machine Learning'));
});

test('evaluateQuiz maps high CS / Algorithm performance to Algorithms & Systems path', () => {
  const csAnswers: Record<string, number> = {};
  // Answer all Computer Science questions correctly
  for (const q of DIAGNOSTIC_QUESTIONS) {
    if (q.domain === 'Computer Science') {
      csAnswers[q.id] = q.correctAnswer;
    } else {
      csAnswers[q.id] = (q.correctAnswer + 1) % 4;
    }
  }

  const result = evaluateQuiz(csAnswers, DIAGNOSTIC_QUESTIONS);
  assert.equal(result.domainScores['Computer Science'].percentage, 100);
  assert.equal(result.recommendedPath.id, 'algorithms-distributed-systems');
});

test('PREDEFINED_LEARNING_PATHS contains valid college tracks', () => {
  assert.ok(PREDEFINED_LEARNING_PATHS.length >= 4);
  for (const path of PREDEFINED_LEARNING_PATHS) {
    assert.ok(path.id);
    assert.ok(path.title);
    assert.ok(path.focusTopics.length > 0);
    assert.ok(path.priorityCourseSlugs.length > 0);
  }
});

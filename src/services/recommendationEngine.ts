export interface StudentPreferences {
  learning_goal?: string;
  preferred_topics: string[];
  skill_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  preferred_format?: 'Video Lectures' | 'Interactive Coding' | 'Project-Based' | 'Reading & Quizzes' | 'Any';
  weekly_study_hours?: number;
  preferred_duration?: 'Short (< 10 hrs)' | 'Medium (10-30 hrs)' | 'Long (> 30 hrs)' | 'Any';
}

export interface CourseData {
  id: number;
  title: string;
  slug: string;
  description: string;
  short_description: string;
  instructor: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  format: 'Video Lectures' | 'Interactive Coding' | 'Project-Based' | 'Reading & Quizzes';
  duration_hours: number;
  rating: number;
  review_count: number;
  thumbnail_url: string;
  topics: string[];
  prerequisites?: string[];
  learning_outcomes?: string[];
  is_featured?: boolean;
}

export interface RecommendationFeedbackRecord {
  course_id: number;
  feedback: 'relevant' | 'not_relevant';
}

export interface RecommendationScoreResult {
  course: CourseData;
  score: number; // 0 to 100
  matchPercentage: number;
  breakdown: {
    goalScore: number; // out of 30
    topicScore: number; // out of 30
    skillScore: number; // out of 20
    formatScore: number; // out of 10
    durationScore: number; // out of 10
    feedbackAdjustment: number;
  };
  reasons: string[];
  matchingTopics: string[];
  estimatedWeeks: number;
}

export const SCORING_WEIGHTS = {
  GOAL: 30,
  TOPIC: 30,
  SKILL: 20,
  FORMAT: 10,
  DURATION: 10,
};

// Map goals to keyword associations
const GOAL_KEYWORDS: Record<string, string[]> = {
  'career_transition': ['full-stack', 'developer', 'engineer', 'architect', 'data science', 'cybersecurity', 'cloud', 'system design'],
  'skill_advancement': ['advanced', 'mastery', 'deep learning', 'microservices', 'devops', 'kubernetes', 'performance'],
  'academic_exam_prep': ['algorithms', 'data structures', 'fundamentals', 'discrete', 'database internals', 'operating systems'],
  'hobby_building': ['project', 'game', 'interactive', 'creative', 'design', 'ui/ux', 'flutter', 'react'],
  'certification': ['aws', 'security', 'docker', 'certified', 'cloud practitioner', 'ethical hacking'],
};

/**
 * Calculates topic overlap between user topics and course topics
 */
export function calculateTopicOverlap(userTopics: string[], courseTopics: string[]): {
  score: number;
  matchingTopics: string[];
} {
  if (!userTopics || userTopics.length === 0 || !courseTopics || courseTopics.length === 0) {
    return { score: 10, matchingTopics: [] }; // Neutral baseline if unspecified
  }

  const normalizedUser = userTopics.map(t => t.toLowerCase().trim());
  const normalizedCourse = courseTopics.map(t => t.toLowerCase().trim());

  const matching: string[] = [];
  for (const ut of normalizedUser) {
    const originalTopic = courseTopics.find(ct => {
      const lower = ct.toLowerCase().trim();
      return lower.includes(ut) || ut.includes(lower);
    });
    if (originalTopic && !matching.includes(originalTopic)) {
      matching.push(originalTopic);
    }
  }

  // Calculate ratio: matching topics / user preferred topics
  const ratio = Math.min(1.0, matching.length / Math.max(1, Math.min(userTopics.length, 3)));
  const score = Math.round(ratio * SCORING_WEIGHTS.TOPIC);

  return { score, matchingTopics: matching };
}

/**
 * Calculates learning goal alignment based on keywords
 */
export function calculateGoalMatch(goal: string | undefined, course: CourseData): {
  score: number;
  reason?: string;
} {
  if (!goal) {
    return { score: Math.round(SCORING_WEIGHTS.GOAL * 0.5) }; // neutral fallback
  }

  const normalizedGoal = goal.toLowerCase().trim().replace(/[\s-]+/g, '_');
  const targetKeywords = GOAL_KEYWORDS[normalizedGoal] || [goal.toLowerCase()];

  const textToInspect = `${course.title} ${course.category} ${course.description} ${course.topics.join(' ')}`.toLowerCase();

  let matchedKeyword: string | null = null;
  for (const kw of targetKeywords) {
    if (textToInspect.includes(kw.toLowerCase())) {
      matchedKeyword = kw;
      break;
    }
  }

  if (matchedKeyword) {
    return {
      score: SCORING_WEIGHTS.GOAL,
      reason: `Directly aligns with your goal: "${goal.replace(/_/g, ' ')}"`,
    };
  }

  return {
    score: Math.round(SCORING_WEIGHTS.GOAL * 0.4),
    reason: `Provides complementary skills for your learning path`,
  };
}

/**
 * Calculates skill level compatibility
 */
export function calculateSkillSuitability(
  userSkill: string,
  courseDifficulty: CourseData['difficulty']
): { score: number; reason: string } {
  if (!userSkill || userSkill === 'All Levels' || courseDifficulty === 'All Levels') {
    return { score: SCORING_WEIGHTS.SKILL, reason: 'Suitable for all learning experience levels' };
  }

  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const userIdx = levels.indexOf(userSkill);
  const courseIdx = levels.indexOf(courseDifficulty);

  if (userIdx === -1 || courseIdx === -1) {
    return { score: Math.round(SCORING_WEIGHTS.SKILL * 0.7), reason: 'Adaptable difficulty curve' };
  }

  const diff = Math.abs(userIdx - courseIdx);

  if (diff === 0) {
    return { score: SCORING_WEIGHTS.SKILL, reason: `Exact match for your ${userSkill} level` };
  } else if (diff === 1) {
    // 1 step away (e.g. Beginner -> Intermediate or Intermediate -> Advanced)
    if (userIdx < courseIdx) {
      return { score: Math.round(SCORING_WEIGHTS.SKILL * 0.65), reason: `Great step-up challenge from ${userSkill}` };
    } else {
      return { score: Math.round(SCORING_WEIGHTS.SKILL * 0.75), reason: `Solid comprehensive review at ${courseDifficulty} level` };
    }
  } else {
    // 2 steps away (Beginner -> Advanced or vice versa)
    return { score: Math.round(SCORING_WEIGHTS.SKILL * 0.25), reason: `Challenging jump for ${userSkill}` };
  }
}

/**
 * Calculates format preference match
 */
export function calculateFormatMatch(userFormat: string | undefined, courseFormat: CourseData['format']): {
  score: number;
  reason?: string;
} {
  if (!userFormat || userFormat === 'Any') {
    return { score: SCORING_WEIGHTS.FORMAT, reason: `Delivered in ${courseFormat} format` };
  }

  if (userFormat.toLowerCase() === courseFormat.toLowerCase()) {
    return { score: SCORING_WEIGHTS.FORMAT, reason: `Matches your preferred format (${courseFormat})` };
  }

  return { score: Math.round(SCORING_WEIGHTS.FORMAT * 0.4), reason: `Format: ${courseFormat}` };
}

/**
 * Calculates duration and weekly pace suitability
 */
export function calculateDurationMatch(
  preferredDuration: string | undefined,
  weeklyHours: number | undefined,
  courseHours: number
): { score: number; estimatedWeeks: number; reason?: string } {
  const pace = weeklyHours && weeklyHours > 0 ? weeklyHours : 5;
  const estimatedWeeks = Math.max(1, Math.ceil(courseHours / pace));

  if (!preferredDuration || preferredDuration === 'Any') {
    return {
      score: SCORING_WEIGHTS.DURATION,
      estimatedWeeks,
      reason: `Estimated completion: ~${estimatedWeeks} weeks (${courseHours} total hrs at ${pace} hrs/wk)`,
    };
  }

  let matches = false;
  if (preferredDuration.includes('Short') && courseHours < 12) matches = true;
  else if (preferredDuration.includes('Medium') && courseHours >= 10 && courseHours <= 30) matches = true;
  else if (preferredDuration.includes('Long') && courseHours > 25) matches = true;

  if (matches) {
    return {
      score: SCORING_WEIGHTS.DURATION,
      estimatedWeeks,
      reason: `Matches your preferred timeframe (~${courseHours}h total, ~${estimatedWeeks} weeks)`,
    };
  }

  return {
    score: Math.round(SCORING_WEIGHTS.DURATION * 0.5),
    estimatedWeeks,
    reason: `Paced at ~${estimatedWeeks} weeks (~${courseHours} hrs total)`,
  };
}

/**
 * Full content-based recommendation ranker
 */
export function rankCourses(
  courses: CourseData[],
  preferences: StudentPreferences,
  enrolledCourseIds: number[] = [],
  feedbackRecords: RecommendationFeedbackRecord[] = []
): RecommendationScoreResult[] {
  const completedOrEnrolledSet = new Set(enrolledCourseIds);
  const feedbackMap = new Map<number, 'relevant' | 'not_relevant'>();
  for (const fb of feedbackRecords) {
    feedbackMap.set(fb.course_id, fb.feedback);
  }

  const results: RecommendationScoreResult[] = [];

  for (const course of courses) {
    // Avoid recommending enrolled or completed courses
    if (completedOrEnrolledSet.has(course.id)) {
      continue;
    }

    const goalResult = calculateGoalMatch(preferences.learning_goal, course);
    const topicResult = calculateTopicOverlap(preferences.preferred_topics, course.topics);
    const skillResult = calculateSkillSuitability(preferences.skill_level, course.difficulty);
    const formatResult = calculateFormatMatch(preferences.preferred_format, course.format);
    const durationResult = calculateDurationMatch(
      preferences.preferred_duration,
      preferences.weekly_study_hours,
      course.duration_hours
    );

    // Feedback adjustment
    let feedbackAdjustment = 0;
    const fb = feedbackMap.get(course.id);
    if (fb === 'relevant') {
      feedbackAdjustment = 8; // bonus
    } else if (fb === 'not_relevant') {
      feedbackAdjustment = -25; // penalty
    }

    const rawScore =
      goalResult.score +
      topicResult.score +
      skillResult.score +
      formatResult.score +
      durationResult.score +
      feedbackAdjustment;

    // Normalize between 10 and 99 (practical pedagogical range)
    const normalizedScore = Math.max(10, Math.min(99, Math.round(rawScore)));

    const reasons: string[] = [];
    if (topicResult.matchingTopics.length > 0) {
      reasons.push(`Topics: Covers ${topicResult.matchingTopics.slice(0, 3).join(', ')}`);
    }
    if (skillResult.reason) {
      reasons.push(skillResult.reason);
    }
    if (goalResult.reason) {
      reasons.push(goalResult.reason);
    }
    if (formatResult.reason) {
      reasons.push(formatResult.reason);
    }
    if (durationResult.reason) {
      reasons.push(durationResult.reason);
    }

    results.push({
      course,
      score: normalizedScore,
      matchPercentage: normalizedScore,
      breakdown: {
        goalScore: goalResult.score,
        topicScore: topicResult.score,
        skillScore: skillResult.score,
        formatScore: formatResult.score,
        durationScore: durationResult.score,
        feedbackAdjustment,
      },
      reasons,
      matchingTopics: topicResult.matchingTopics,
      estimatedWeeks: durationResult.estimatedWeeks,
    });
  }

  // Sort descending by score, then by rating
  return results.sort((a, b) => b.score - a.score || b.course.rating - a.course.rating);
}

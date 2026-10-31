import math
from typing import List, Dict, Any, Tuple

SCORING_WEIGHTS = {
    "GOAL": 30,
    "TOPIC": 30,
    "SKILL": 20,
    "FORMAT": 10,
    "DURATION": 10,
}

GOAL_KEYWORDS = {
    "career_transition": ["full-stack", "developer", "engineer", "architect", "data science", "cybersecurity", "cloud", "system design"],
    "skill_advancement": ["advanced", "mastery", "deep learning", "microservices", "devops", "kubernetes", "performance"],
    "academic_exam_prep": ["algorithms", "data structures", "fundamentals", "discrete", "database internals", "operating systems"],
    "hobby_building": ["project", "game", "interactive", "creative", "design", "ui/ux", "flutter", "react"],
    "certification": ["aws", "security", "docker", "certified", "cloud practitioner", "ethical hacking"],
}

def calculate_topic_overlap(user_topics: List[str], course_topics: List[str]) -> Tuple[float, List[str]]:
    if not user_topics or not course_topics:
        return 10.0, []

    normalized_user = [t.lower().strip() for t in user_topics]
    matching = []

    for ut in normalized_user:
        for ct in course_topics:
            lower_ct = ct.lower().strip()
            if ut in lower_ct or lower_ct in ut:
                if ct not in matching:
                    matching.append(ct)
                break

    ratio = min(1.0, len(matching) / max(1, min(len(user_topics), 3)))
    score = round(ratio * SCORING_WEIGHTS["TOPIC"], 1)
    return score, matching

def calculate_goal_match(goal: str, course_text: str) -> Tuple[float, str]:
    if not goal:
        return SCORING_WEIGHTS["GOAL"] * 0.5, "Provides complementary learning value"

    norm_goal = goal.lower().strip().replace(" ", "_").replace("-", "_")
    keywords = GOAL_KEYWORDS.get(norm_goal, [goal.lower()])

    found_kw = None
    for kw in keywords:
        if kw in course_text:
            found_kw = kw
            break

    if found_kw:
        return float(SCORING_WEIGHTS["GOAL"]), f"Directly aligns with your goal: '{goal.replace('_', ' ')}'"

    return round(SCORING_WEIGHTS["GOAL"] * 0.4, 1), "Provides supporting cross-disciplinary skills"

def calculate_skill_suitability(user_skill: str, course_difficulty: str) -> Tuple[float, str]:
    if not user_skill or user_skill == "All Levels" or course_difficulty == "All Levels":
        return float(SCORING_WEIGHTS["SKILL"]), "Suitable for all experience levels"

    levels = ["Beginner", "Intermediate", "Advanced"]
    try:
        u_idx = levels.index(user_skill)
        c_idx = levels.index(course_difficulty)
    except ValueError:
        return round(SCORING_WEIGHTS["SKILL"] * 0.7, 1), "Adaptable difficulty progression"

    diff = abs(u_idx - c_idx)
    if diff == 0:
        return float(SCORING_WEIGHTS["SKILL"]), f"Exact match for your {user_skill} level"
    elif diff == 1:
        if u_idx < c_idx:
            return round(SCORING_WEIGHTS["SKILL"] * 0.65, 1), f"Great step-up challenge from {user_skill}"
        else:
            return round(SCORING_WEIGHTS["SKILL"] * 0.75, 1), f"Solid foundational review at {course_difficulty} level"
    else:
        return round(SCORING_WEIGHTS["SKILL"] * 0.25, 1), f"Challenging leap from {user_skill}"

def calculate_format_match(user_format: str, course_format: str) -> Tuple[float, str]:
    if not user_format or user_format == "Any":
        return float(SCORING_WEIGHTS["FORMAT"]), f"Delivered in {course_format} format"

    if user_format.lower() == course_format.lower():
        return float(SCORING_WEIGHTS["FORMAT"]), f"Matches your preferred format ({course_format})"

    return round(SCORING_WEIGHTS["FORMAT"] * 0.4, 1), f"Format: {course_format}"

def calculate_duration_match(preferred_duration: str, weekly_hours: int, course_hours: float) -> Tuple[float, int, str]:
    pace = weekly_hours if weekly_hours and weekly_hours > 0 else 5
    estimated_weeks = max(1, math.ceil(course_hours / pace))

    if not preferred_duration or preferred_duration == "Any":
        return float(SCORING_WEIGHTS["DURATION"]), estimated_weeks, f"Estimated ~{estimated_weeks} weeks at {pace} hrs/wk"

    matches = False
    if "Short" in preferred_duration and course_hours < 12:
        matches = True
    elif "Medium" in preferred_duration and 10 <= course_hours <= 30:
        matches = True
    elif "Long" in preferred_duration and course_hours > 25:
        matches = True

    if matches:
        return float(SCORING_WEIGHTS["DURATION"]), estimated_weeks, f"Matches your preferred timeframe (~{estimated_weeks} wks)"

    return round(SCORING_WEIGHTS["DURATION"] * 0.5, 1), estimated_weeks, f"Paced at ~{estimated_weeks} weeks ({course_hours} hrs)"

def score_course(
    course_dict: Dict[str, Any],
    profile_dict: Dict[str, Any],
    feedback: str = None
) -> Dict[str, Any]:
    goal = profile_dict.get("learning_goal", "")
    course_text = f"{course_dict.get('title', '')} {course_dict.get('category', '')} {course_dict.get('description', '')} {' '.join(course_dict.get('topics', []))}".lower()

    goal_score, goal_reason = calculate_goal_match(goal, course_text)
    topic_score, matching_topics = calculate_topic_overlap(profile_dict.get("preferred_topics", []), course_dict.get("topics", []))
    skill_score, skill_reason = calculate_skill_suitability(profile_dict.get("skill_level", "Intermediate"), course_dict.get("difficulty", "Intermediate"))
    format_score, format_reason = calculate_format_match(profile_dict.get("preferred_format", "Project-Based"), course_dict.get("format", "Project-Based"))
    duration_score, estimated_weeks, duration_reason = calculate_duration_match(
        profile_dict.get("preferred_duration", "Medium (10-30 hrs)"),
        profile_dict.get("weekly_study_hours", 6),
        course_dict.get("duration_hours", 20.0)
    )

    feedback_adj = 0.0
    if feedback == "relevant":
        feedback_adj = 8.0
    elif feedback == "not_relevant":
        feedback_adj = -25.0

    raw_total = goal_score + topic_score + skill_score + format_score + duration_score + feedback_adj
    normalized = max(10, min(99, round(raw_total)))

    reasons = []
    if matching_topics:
        reasons.append(f"Topics: Covers {', '.join(matching_topics[:3])}")
    if skill_reason:
        reasons.append(skill_reason)
    if goal_reason:
        reasons.append(goal_reason)
    if format_reason:
        reasons.append(format_reason)
    if duration_reason:
        reasons.append(duration_reason)

    return {
        "score": normalized,
        "matchPercentage": normalized,
        "breakdown": {
            "goalScore": goal_score,
            "topicScore": topic_score,
            "skillScore": skill_score,
            "formatScore": format_score,
            "durationScore": duration_score,
            "feedbackAdjustment": feedback_adj,
        },
        "reasons": reasons,
        "matchingTopics": matching_topics,
        "estimatedWeeks": estimated_weeks,
        "userFeedback": feedback
    }

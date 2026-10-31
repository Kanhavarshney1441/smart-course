import math
from app.services.recommendation import (
    calculate_topic_overlap,
    calculate_goal_match,
    calculate_skill_suitability,
    calculate_format_match,
    calculate_duration_match,
    score_course
)

def test_calculate_topic_overlap():
    score, matching = calculate_topic_overlap(["React", "TypeScript"], ["React", "TypeScript", "Node.js"])
    assert score == 30.0
    assert len(matching) == 2
    assert "React" in matching

    score_empty, matching_empty = calculate_topic_overlap(["Rust"], ["Python", "Flask"])
    assert score_empty == 0.0
    assert len(matching_empty) == 0

def test_calculate_skill_suitability():
    exact_score, reason = calculate_skill_suitability("Intermediate", "Intermediate")
    assert exact_score == 20.0

    step_up_score, _ = calculate_skill_suitability("Beginner", "Intermediate")
    assert step_up_score < 20.0
    assert step_up_score >= 12.0

    far_score, _ = calculate_skill_suitability("Beginner", "Advanced")
    assert far_score < 10.0

def test_calculate_format_match():
    score, reason = calculate_format_match("Project-Based", "Project-Based")
    assert score == 10.0

    mismatch_score, _ = calculate_format_match("Video Lectures", "Interactive Coding")
    assert mismatch_score == 4.0

def test_calculate_duration_match():
    score, weeks, _ = calculate_duration_match("Medium (10-30 hrs)", 6, 24.0)
    assert weeks == 4
    assert score == 10.0

def test_score_course_with_feedback():
    mock_course = {
        "title": "Full-Stack React & Node.js",
        "category": "Web Development",
        "description": "Full stack engineer career transition",
        "topics": ["React", "Node.js", "TypeScript"],
        "difficulty": "Intermediate",
        "format": "Project-Based",
        "duration_hours": 24.0
    }
    mock_profile = {
        "learning_goal": "career_transition",
        "preferred_topics": ["React", "TypeScript"],
        "skill_level": "Intermediate",
        "preferred_format": "Project-Based",
        "weekly_study_hours": 6,
        "preferred_duration": "Medium (10-30 hrs)"
    }

    initial_result = score_course(mock_course, mock_profile)
    assert initial_result["score"] >= 80

    # Negative feedback should reduce score
    penalized_result = score_course(mock_course, mock_profile, feedback="not_relevant")
    assert penalized_result["score"] < initial_result["score"]

    # Positive feedback should boost score
    boosted_result = score_course(mock_course, mock_profile, feedback="relevant")
    assert boosted_result["score"] >= initial_result["score"]

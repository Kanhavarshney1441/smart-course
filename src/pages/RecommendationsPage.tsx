import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { RecommendationResult, StudentProfile } from '../types';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Layers,
  Bookmark,
  CheckCircle2,
  ArrowRight,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Award,
  BookOpen
} from 'lucide-react';

export const RecommendationsPage: React.FC = () => {
  const { profile } = useAuth();
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState<number | null>(null);
  const [expandedScoreId, setExpandedScoreId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const res = await api.getRecommendations();
      setRecommendations(res.recommendations || []);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await api.getRecommendations();
      setRecommendations(res.recommendations || []);
      setNotification('Recommendations updated based on latest preference weights.');
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setRefreshing(false);
    }
  };

  const handleFeedback = async (courseId: number, feedback: 'relevant' | 'not_relevant') => {
    setFeedbackLoading(courseId);
    try {
      await api.submitRecommendationFeedback(courseId, feedback);
      setNotification(feedback === 'relevant' ? 'Marked as relevant! Boosted in future ranks.' : 'Marked as not relevant. Ranking penalized.');
      // Refresh list to show updated score
      const res = await api.getRecommendations();
      setRecommendations(res.recommendations || []);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      console.error('Feedback error:', err);
    } finally {
      setFeedbackLoading(null);
    }
  };

  const handleEnroll = async (courseId: number) => {
    try {
      await api.enrollCourse(courseId);
      setNotification('🎉 Enrolled successfully! Now available in My Learning.');
      const res = await api.getRecommendations();
      setRecommendations(res.recommendations || []);
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setNotification(err.message || 'Enrollment failed.');
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleToggleSave = async (courseId: number, currentSaved: boolean) => {
    try {
      if (currentSaved) {
        await api.unsaveCourse(courseId);
      } else {
        await api.saveCourse(courseId);
      }
      setRecommendations((prev) =>
        prev.map((r) =>
          r.course.id === courseId
            ? { ...r, course: { ...r.course, is_saved: !currentSaved } }
            : r
        )
      );
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        {notification && (
          <div className="mb-6 p-3 bg-blue-600 text-white text-xs font-semibold rounded-xl text-center shadow-md animate-in fade-in">
            {notification}
          </div>
        )}

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intelligent Content-Based Ranker</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Personalized Recommendations</h1>
            <p className="text-xs text-slate-500 mt-1">
              Courses dynamically scored against your learning goal, topic interests, skill level, and schedule.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/onboarding"
              className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Adjust Preferences
            </Link>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh Matches</span>
            </button>
          </div>
        </div>

        {/* Active Profile Summary Banner */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs mb-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="font-bold text-slate-700">Active Criteria:</span>
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-semibold border border-blue-200">
              Goal: {profile?.learning_goal?.replace(/_/g, ' ') || 'Career Transition'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200">
              Level: {profile?.skill_level || 'Intermediate'}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 font-semibold border border-purple-200">
              Pace: {profile?.weekly_study_hours || 6} hrs/wk
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-semibold border border-amber-200">
              Format: {profile?.preferred_format || 'Project-Based'}
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            Enrolled/completed courses are excluded from recommendations
          </span>
        </div>

        {/* Recommendations List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-48 bg-white rounded-3xl border border-slate-200 p-6 animate-pulse" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
            <Sparkles className="w-12 h-12 text-indigo-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No new recommendations available</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              You may have already enrolled in all top matching courses! Try expanding your preferred topics in the onboarding wizard.
            </p>
            <Link
              to="/onboarding"
              className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
            >
              Update Preferences
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations.map((rec, index) => {
              const isScoreExpanded = expandedScoreId === rec.course.id;
              return (
                <div
                  key={rec.course.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 relative overflow-hidden"
                >
                  <div className="flex flex-col lg:flex-row gap-6">
                    {/* Thumbnail & Ranking Badge */}
                    <div className="relative w-full lg:w-60 h-44 rounded-2xl overflow-hidden bg-slate-100 shrink-0">
                      <img
                        src={rec.course.thumbnail_url}
                        alt={rec.course.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex items-center gap-1.5">
                        <span className="px-2.5 py-1 text-xs font-black rounded-lg bg-slate-900/90 text-white backdrop-blur-sm">
                          #{index + 1} Rank
                        </span>
                      </div>
                    </div>

                    {/* Middle: Info & Match Breakdown */}
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                            {rec.course.category}
                          </span>
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                            {rec.course.difficulty}
                          </span>
                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {rec.course.duration_hours}h total (~{rec.estimatedWeeks} weeks)
                          </span>
                        </div>

                        {/* Match Score Badge */}
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm shadow-xs">
                          <Sparkles className="w-4 h-4" />
                          <span>{rec.matchPercentage}% Match</span>
                        </div>
                      </div>

                      <Link to={`/courses/${rec.course.id}`}>
                        <h3 className="font-bold text-slate-900 text-lg hover:text-blue-600 transition-colors leading-snug">
                          {rec.course.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {rec.course.short_description || rec.course.description}
                      </p>

                      {/* Matching Topics Chips */}
                      {rec.matchingTopics.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 pt-1">
                          <span className="text-[11px] font-bold text-slate-500">Matching Topics:</span>
                          {rec.matchingTopics.map((topic, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              ✓ {topic}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Reasons list */}
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1">
                        <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wider block mb-1">
                          Why this course was recommended:
                        </span>
                        {rec.reasons.slice(0, 3).map((reason, idx) => (
                          <div key={idx} className="flex items-start gap-1.5">
                            <span className="text-blue-600 font-bold">•</span>
                            <span>{reason}</span>
                          </div>
                        ))}
                      </div>

                      {/* Toggleable Score Breakdown Button */}
                      <button
                        type="button"
                        onClick={() => setExpandedScoreId(isScoreExpanded ? null : rec.course.id)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        {isScoreExpanded ? 'Hide Weight Breakdown' : 'Inspect Algorithmic Score Breakdown'}
                        {isScoreExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>

                      {isScoreExpanded && (
                        <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 text-xs space-y-2 animate-in fade-in">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Learning Goal Alignment (Max 30%):</span>
                            <span className="font-bold text-slate-900">{rec.breakdown.goalScore} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Topic Vector Overlap (Max 30%):</span>
                            <span className="font-bold text-slate-900">{rec.breakdown.topicScore} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Skill Level Suitability (Max 20%):</span>
                            <span className="font-bold text-slate-900">{rec.breakdown.skillScore} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Learning Format Preference (Max 10%):</span>
                            <span className="font-bold text-slate-900">{rec.breakdown.formatScore} pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600">Duration & Weekly Pace Feasibility (Max 10%):</span>
                            <span className="font-bold text-slate-900">{rec.breakdown.durationScore} pts</span>
                          </div>
                          {rec.breakdown.feedbackAdjustment !== 0 && (
                            <div className="flex justify-between text-indigo-700 font-bold border-t border-indigo-200 pt-1">
                              <span>User Feedback Adjustment:</span>
                              <span>{rec.breakdown.feedbackAdjustment > 0 ? `+${rec.breakdown.feedbackAdjustment}` : rec.breakdown.feedbackAdjustment} pts</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Right: Actions & Relevance Feedback */}
                    <div className="flex flex-col justify-between shrink-0 lg:w-48 lg:border-l lg:border-slate-100 lg:pl-6 space-y-4">
                      {/* Enroll & Wishlist */}
                      <div className="space-y-2">
                        <button
                          onClick={() => handleEnroll(rec.course.id)}
                          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Enroll Free</span>
                        </button>

                        <button
                          onClick={() => handleToggleSave(rec.course.id, Boolean(rec.course.is_saved))}
                          className={`w-full py-2 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 ${
                            rec.course.is_saved
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${rec.course.is_saved ? 'fill-current' : ''}`} />
                          <span>{rec.course.is_saved ? 'Saved' : 'Save'}</span>
                        </button>

                        <Link
                          to={`/courses/${rec.course.id}`}
                          className="w-full block py-2 text-center text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50"
                        >
                          View Details
                        </Link>
                      </div>

                      {/* Feedback Controls (Relevant / Not Relevant) */}
                      <div className="pt-3 border-t border-slate-100 text-center">
                        <p className="text-[11px] font-semibold text-slate-500 mb-2">Is this recommendation helpful?</p>
                        <div className="flex items-center justify-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleFeedback(rec.course.id, 'relevant')}
                            disabled={feedbackLoading === rec.course.id}
                            className={`p-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1 ${
                              rec.userFeedback === 'relevant'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 ring-2 ring-emerald-500/20'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                            title="Mark Relevant (Boost in future)"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Relevant</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleFeedback(rec.course.id, 'not_relevant')}
                            disabled={feedbackLoading === rec.course.id}
                            className={`p-2 rounded-xl border text-xs font-semibold transition-colors flex items-center gap-1 ${
                              rec.userFeedback === 'not_relevant'
                                ? 'bg-red-50 text-red-700 border-red-300 ring-2 ring-red-500/20'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                            title="Mark Not Relevant (Penalize in future)"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                            <span className="text-[10px]">Not for me</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Enrollment, LearningDashboardOverview } from '../types';
import { Sidebar } from '../components/Sidebar';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Play,
  Award,
  Compass,
  ArrowRight,
  Sparkles,
  Check,
  Flame,
  Target,
  FileQuestion,
  TrendingUp,
  BrainCircuit,
  GraduationCap,
  CalendarCheck
} from 'lucide-react';

export const MyLearningPage: React.FC = () => {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [overview, setOverview] = useState<LearningDashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [activeCourseId, setActiveCourseId] = useState<number | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [enrollRes, overviewRes] = await Promise.all([
        api.getEnrollments(),
        api.getLearningDashboardOverview().catch(() => null),
      ]);
      setEnrollments(enrollRes.enrollments || []);
      if (overviewRes) {
        setOverview(overviewRes);
      }
    } catch (err) {
      console.error('Error fetching learning dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLessonToggle = async (lessonId: number) => {
    try {
      const res = await api.completeLesson(lessonId);
      setNotification(res.message);
      await fetchData();
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Error toggling lesson:', err);
    }
  };

  const filtered = enrollments.filter((e) => {
    if (filter === 'active') return e.status === 'active';
    if (filter === 'completed') return e.status === 'completed';
    return true;
  });

  // Calculate primary active course for resume learning banner
  const primaryActiveEnrollment = enrollments.find(e => e.status === 'active') || enrollments[0];
  const completedLessonsCount = primaryActiveEnrollment?.completed_lessons?.length || 0;
  const totalLessonsCount = primaryActiveEnrollment?.course?.lessons?.length || 5;
  const remainingLessonsCount = Math.max(0, totalLessonsCount - completedLessonsCount);
  const estimatedHoursRemaining = primaryActiveEnrollment
    ? Math.max(1, Math.round(primaryActiveEnrollment.course.duration_hours * (1 - primaryActiveEnrollment.progress_percent / 100)))
    : 0;

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        {notification && (
          <div className="mb-6 p-3 bg-blue-600 text-white text-xs font-semibold rounded-xl text-center shadow-md animate-in fade-in">
            {notification}
          </div>
        )}

        {/* ========================================================= */}
        {/* 1. PERSONALIZED LEARNING DASHBOARD (HERO METRICS & STREAK) */}
        {/* ========================================================= */}
        <section className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
                <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
                <span>AI-Powered Learning Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                My Learning Dashboard
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Monitor your daily goals, learning streak, active modules, and next recommended steps.
              </p>
            </div>

            {/* Quick Stats Pills */}
            {overview && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 px-3.5 py-2 rounded-2xl shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Flame className="w-4 h-4 fill-amber-500" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block">Daily Streak</span>
                    <span className="text-sm font-extrabold text-slate-900">{overview.streak.current_streak} Days 🔥</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200/80 px-3.5 py-2 rounded-2xl shadow-xs">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider block">Study Time</span>
                    <span className="text-sm font-extrabold text-slate-900">{overview.streak.total_minutes_spent} mins</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Top 3 Interactive Dashboard Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Card A: Resume Active Learning Banner */}
            <div className="lg:col-span-2 bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg relative overflow-hidden flex flex-col justify-between">
              {/* Subtle background glow */}
              <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-300 text-[11px] font-semibold border border-white/10">
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>In-Progress Masterclass</span>
                  </span>
                  <span className="text-xs font-medium text-slate-300">
                    Estimated ~{estimatedHoursRemaining}h remaining
                  </span>
                </div>

                {primaryActiveEnrollment ? (
                  <>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mb-2">
                      {primaryActiveEnrollment.course.title}
                    </h2>
                    <p className="text-xs text-slate-300 line-clamp-2 mb-6 max-w-xl">
                      {primaryActiveEnrollment.course.short_description || primaryActiveEnrollment.course.description}
                    </p>

                    {/* Progress Bar & Lesson Stats */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-slate-300">
                          {completedLessonsCount} of {totalLessonsCount} lessons completed ({remainingLessonsCount} remaining)
                        </span>
                        <span className="text-blue-400 font-bold">{primaryActiveEnrollment.progress_percent}% Complete</span>
                      </div>
                      <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-400 to-indigo-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${primaryActiveEnrollment.progress_percent}%` }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="py-6 text-slate-300 text-sm">
                    No active courses found. Explore our AI-curated catalog to enroll in your next masterclass.
                  </div>
                )}
              </div>

              {primaryActiveEnrollment && (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to={`/learn/${primaryActiveEnrollment.course_id}${overview?.next_recommended_lesson ? `?lesson=${overview.next_recommended_lesson.id}` : ''}`}
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>Resume Learning</span>
                  </Link>

                  <Link
                    to={`/courses/${primaryActiveEnrollment.course_id}`}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-xs rounded-xl transition-all"
                  >
                    View Syllabus & Syllabus Map
                  </Link>
                </div>
              )}
            </div>

            {/* Card B: Daily Goal & Next Step Side Column */}
            <div className="flex flex-col gap-5">
              {/* Daily Goals Card */}
              <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Target className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Today's Study Goal</h3>
                    </div>
                    {overview?.daily_goal.is_achieved ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Achieved! 🎉
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-500">In Progress</span>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Study Time:</span>
                        <span>{overview?.daily_goal.completed_minutes || 30} / {overview?.daily_goal.target_minutes || 45} mins</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, Math.round(((overview?.daily_goal.completed_minutes || 30) / (overview?.daily_goal.target_minutes || 45)) * 100))}%`
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                        <span>Lessons Target:</span>
                        <span>{overview?.daily_goal.completed_lessons || 1} / {overview?.daily_goal.target_lessons || 2} completed</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, Math.round(((overview?.daily_goal.completed_lessons || 1) / (overview?.daily_goal.target_lessons || 2)) * 100))}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100">
                  Consistency is key. 45 daily minutes improves memory retention by up to 68%.
                </p>
              </div>

              {/* Recommended Next Lesson Card */}
              {overview?.next_recommended_lesson && (
                <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 rounded-3xl p-5 border border-blue-200/70 shadow-xs">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">Next Recommended Lesson</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 line-clamp-1 mb-1">
                    {overview.next_recommended_lesson.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 mb-3">
                    {overview.next_recommended_lesson.course_title} &bull; ~{overview.next_recommended_lesson.duration_minutes} mins
                  </p>
                  <Link
                    to={`/learn/${overview.next_recommended_lesson.course_id}?lesson=${overview.next_recommended_lesson.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-all shadow-xs"
                  >
                    <span>Start Lesson</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* 2. ENROLLED COURSES PORTFOLIO WITH MODULES & CERTIFICATES */}
        {/* ========================================================= */}
        <section className="mt-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                My Enrolled Courses ({enrollments.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Access your interactive classroom, AI tutor, curriculum modules, and verified course certificates.
              </p>
            </div>

            <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-xs self-start">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({enrollments.length})
              </button>
              <button
                onClick={() => setFilter('active')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === 'active' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                In Progress ({enrollments.filter((e) => e.status === 'active').length})
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === 'completed' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Completed ({enrollments.filter((e) => e.status === 'completed').length})
              </button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2].map((n) => (
                <div key={n} className="h-44 bg-white rounded-2xl border border-slate-200 p-6 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-800">
                {filter === 'completed' ? 'No completed courses yet' : 'No courses enrolled yet'}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Explore the catalog or view your personalized recommendations to start learning.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Link
                  to="/recommendations"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl hover:opacity-95 shadow-xs flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  View Recommendations
                </Link>
                <Link
                  to="/explore"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Explore Catalog
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {filtered.map((enr) => {
                const isExpanded = activeCourseId === enr.course_id;
                return (
                  <div
                    key={enr.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all overflow-hidden"
                  >
                    <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <img
                          src={enr.course.thumbnail_url}
                          alt={enr.course.title}
                          className="w-20 h-20 rounded-xl object-cover shrink-0 bg-slate-100"
                        />
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                              {enr.course.category}
                            </span>
                            {enr.status === 'completed' ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />
                                Completed
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                                In Progress
                              </span>
                            )}
                          </div>

                          <Link to={`/courses/${enr.course_id}`}>
                            <h3 className="font-bold text-slate-900 text-base hover:text-blue-600 transition-colors line-clamp-1">
                              {enr.course.title}
                            </h3>
                          </Link>
                          <p className="text-xs text-slate-500">
                            Instructor: {enr.course.instructor} • {enr.course.duration_hours} hrs total
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 shrink-0 md:w-80">
                        <div className="w-full">
                          <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                            <span>Progress</span>
                            <span>{enr.progress_percent}%</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-300 ${
                                enr.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-600'
                              }`}
                              style={{ width: `${enr.progress_percent}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto">
                          <Link
                            to={`/learn/${enr.course_id}`}
                            className="flex-1 sm:flex-initial px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl transition-all shrink-0 text-center shadow-md shadow-blue-500/20 flex items-center justify-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Classroom</span>
                          </Link>

                          <button
                            onClick={() => setActiveCourseId(isExpanded ? null : enr.course_id)}
                            className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
                          >
                            {isExpanded ? 'Hide' : 'Curriculum'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Quick Lesson Completion & Direct Jump Panel */}
                    {isExpanded && (
                      <div className="p-5 bg-slate-50/70 border-t border-slate-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                            Curriculum Lessons & Module Progress
                          </h4>
                          <Link
                            to={`/courses/${enr.course_id}`}
                            className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                          >
                            Full Course Details &rarr;
                          </Link>
                        </div>

                        <div className="space-y-2">
                          {enr.course.lessons?.map((lesson, idx) => {
                            const isCompleted = enr.completed_lessons?.includes(lesson.id);
                            return (
                              <div
                                key={lesson.id}
                                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                                  isCompleted
                                    ? 'bg-emerald-50/40 border-emerald-200 text-slate-600'
                                    : 'bg-white border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <div
                                  onClick={() => handleLessonToggle(lesson.id)}
                                  className="flex items-center gap-3 cursor-pointer flex-1"
                                >
                                  <div
                                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                                      isCompleted ? 'bg-emerald-600 text-white' : 'border border-slate-400 bg-white hover:border-emerald-600'
                                    }`}
                                    title={isCompleted ? 'Mark incomplete' : 'Mark completed'}
                                  >
                                    {isCompleted && <Check className="w-3.5 h-3.5" />}
                                  </div>
                                  <div>
                                    <span className={`text-xs font-medium block ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                                      {idx + 1}. {lesson.title}
                                    </span>
                                    <span className="text-[10px] text-slate-400">
                                      {lesson.duration_minutes} minutes &bull; {isCompleted ? 'Completed' : 'Click checkmark to toggle'}
                                    </span>
                                  </div>
                                </div>

                                <Link
                                  to={`/learn/${enr.course_id}?lesson=${lesson.id}`}
                                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ml-2"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>Open Lesson</span>
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

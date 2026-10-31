import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Course, Lesson } from '../types';
import { useAuth } from '../context/AuthContext';
import {
  Star,
  Clock,
  BookOpen,
  CheckCircle2,
  Bookmark,
  Share2,
  Sparkles,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Play,
  Layers,
  Code,
  Video,
  Award,
  ShieldCheck,
  Check
} from 'lucide-react';

export const CourseDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user, loginAsDemoStudent } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [savingBookmark, setSavingBookmark] = useState(false);
  const [openLessonIndex, setOpenLessonIndex] = useState<number | null>(0);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchCourse = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await api.getCourse(parseInt(id, 10));
      setCourse(res.course);
    } catch (err) {
      console.error('Error fetching course:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      await loginAsDemoStudent();
    }
    if (!course) return;

    setEnrolling(true);
    try {
      await api.enrollCourse(course.id);
      setNotification('🎉 Enrolled successfully! Launching classroom...');
      await fetchCourse();
      setTimeout(() => {
        navigate(`/learn/${course.id}`);
      }, 700);
    } catch (err: any) {
      setNotification(err.message || 'Already enrolled or enrollment failed.');
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setEnrolling(false);
    }
  };

  const handleToggleSave = async () => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    if (!course) return;

    setSavingBookmark(true);
    const newSaved = !course.is_saved;
    setCourse({ ...course, is_saved: newSaved });

    try {
      if (newSaved) {
        await api.saveCourse(course.id);
        setNotification('Added to your saved wishlist.');
      } else {
        await api.unsaveCourse(course.id);
        setNotification('Removed from saved courses.');
      }
    } catch (err) {
      setCourse({ ...course, is_saved: !newSaved });
    } finally {
      setSavingBookmark(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleToggleLessonComplete = async (lessonId: number) => {
    if (!isAuthenticated || !course?.is_enrolled) return;

    try {
      const res = await api.completeLesson(lessonId);
      // update local state
      if (course.lessons) {
        const updatedLessons = course.lessons.map((l) =>
          l.id === lessonId ? { ...l, completed: res.completed } : l
        );
        setCourse({
          ...course,
          enrollment_progress: res.progress_percent,
          lessons: updatedLessons,
        });
      }
      setNotification(res.message);
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Error completing lesson:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 rounded w-1/4" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="h-40 bg-slate-200 rounded-2xl" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-800">Course Not Found</h2>
        <p className="text-xs text-slate-500">The course you are looking for does not exist or has been removed.</p>
        <Link to="/explore" className="inline-block px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
          Back to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pb-16">
      {/* Toast Notification Banner */}
      {notification && (
        <div className="sticky top-16 z-30 bg-blue-600 text-white text-xs font-semibold py-2.5 px-4 text-center shadow-md animate-in slide-in-from-top">
          {notification}
        </div>
      )}

      {/* Top Breadcrumb */}
      <div className="bg-white border-b border-slate-200 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-slate-500">
          <Link to="/explore" className="flex items-center gap-1.5 hover:text-blue-600 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Explore
          </Link>
          <span className="truncate max-w-xs text-slate-400">{course.category} / {course.title}</span>
        </div>
      </div>

      {/* Hero Header Area */}
      <section className="bg-slate-900 text-white py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Left 2 Cols: Course Overview */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-600 text-white">
                  {course.category}
                </span>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/10 text-slate-200">
                  {course.difficulty} Level
                </span>
                <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/10 text-slate-200">
                  {course.format}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white">
                {course.title}
              </h1>

              <p className="text-sm text-slate-300 leading-relaxed max-w-2xl">
                {course.description}
              </p>

              {/* Stats & Instructor */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-300">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-white">{course.rating.toFixed(2)}</span>
                  <span>({course.review_count} ratings)</span>
                </div>
                <div>
                  Created by <span className="font-bold text-white">{course.instructor}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{course.duration_hours} total hours</span>
                </div>
              </div>

              {/* Subject Tag Chips */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {course.topics.map((t, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded text-[11px] bg-slate-800 text-slate-300 border border-slate-700">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right 1 Col: Floating Enrollment Card */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200 space-y-5 lg:-mb-24 relative z-10">
              <div className="h-44 rounded-2xl overflow-hidden relative bg-slate-100">
                <img
                  src={course.thumbnail_url}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <p className="text-2xl font-black text-slate-900">
                  {course.is_enrolled ? 'Enrolled Course' : 'Free Enrollment'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">Full lifetime access to all lessons & capstones</p>
              </div>

              {/* Progress bar if enrolled */}
              {course.is_enrolled && (
                <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200">
                  <div className="flex justify-between text-xs font-bold text-blue-900 mb-1">
                    <span>Course Progress</span>
                    <span>{course.enrollment_progress || 0}%</span>
                  </div>
                  <div className="w-full bg-blue-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all"
                      style={{ width: `${course.enrollment_progress || 0}%` }}
                    />
                  </div>
                  {course.enrollment_progress === 100 && (
                    <p className="text-[11px] font-bold text-emerald-700 mt-2 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      Course Complete! Congratulations.
                    </p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2.5">
                {course.is_enrolled ? (
                  <div className="space-y-2">
                    <Link
                      to={`/learn/${course.id}`}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs text-center transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 cursor-pointer"
                    >
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Learning (Open Classroom)</span>
                    </Link>
                    <Link
                      to="/my-learning"
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs text-center transition-colors block"
                    >
                      View All Enrolled Courses
                    </Link>
                  </div>
                ) : (
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:opacity-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md shadow-blue-500/20 disabled:opacity-50"
                  >
                    {enrolling ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Enroll Now (Free)</span>
                      </>
                    )}
                  </button>
                )}

                <button
                  onClick={handleToggleSave}
                  disabled={savingBookmark}
                  className={`w-full py-2.5 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-center gap-2 ${
                    course.is_saved
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${course.is_saved ? 'fill-current' : ''}`} />
                  <span>{course.is_saved ? 'Saved to Wishlist' : 'Save to Wishlist'}</span>
                </button>
              </div>

              {/* Course includes summary list */}
              <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{course.duration_hours} hours on-demand learning</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  <span>{course.lessons?.length || 5} structured lesson modules</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-3.5 h-3.5 text-slate-400" />
                  <span>Verified completion capstone</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Details Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 lg:mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-10">
            {/* 1. What You'll Learn */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                What You'll Learn in This Course
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {course.learning_outcomes.map((outcome, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{outcome}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Course Curriculum & Interactive Lessons */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Course Curriculum & Lessons</h2>
                  <p className="text-xs text-slate-500">
                    {course.lessons?.length || 0} lessons • Interactive progress tracking
                  </p>
                </div>
                {course.is_enrolled && (
                  <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    Click checkboxes to mark complete
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {course.lessons?.map((lesson, idx) => {
                  const isOpen = openLessonIndex === idx;
                  return (
                    <div
                      key={lesson.id}
                      className="border border-slate-200 rounded-2xl overflow-hidden transition-all"
                    >
                      <div
                        onClick={() => setOpenLessonIndex(isOpen ? null : idx)}
                        className="p-4 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center gap-3">
                          {course.is_enrolled ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleLessonComplete(lesson.id);
                              }}
                              className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors ${
                                lesson.completed
                                  ? 'bg-emerald-600 text-white'
                                  : 'border border-slate-400 bg-white hover:border-emerald-600'
                              }`}
                              title={lesson.completed ? 'Mark incomplete' : 'Mark completed'}
                            >
                              {lesson.completed && <Check className="w-3.5 h-3.5" />}
                            </button>
                          ) : (
                            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center">
                              {idx + 1}
                            </div>
                          )}

                          <div>
                            <h4 className={`text-xs font-bold ${lesson.completed ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                              {lesson.title}
                            </h4>
                            <span className="text-[10px] text-slate-400">{lesson.duration_minutes} minutes</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-slate-400">
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="p-4 bg-white border-t border-slate-100 text-xs text-slate-600 space-y-3">
                          <p className="leading-relaxed">{lesson.description}</p>
                          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-50">
                            {course.is_enrolled ? (
                              <>
                                <div className="flex items-center gap-3">
                                  <span className="text-[11px] text-slate-500">
                                    Status: <strong className={lesson.completed ? 'text-emerald-600' : 'text-slate-700'}>{lesson.completed ? 'Completed' : 'Pending'}</strong>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleToggleLessonComplete(lesson.id)}
                                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                                  >
                                    {lesson.completed ? 'Mark Incomplete' : 'Mark Completed'}
                                  </button>
                                </div>
                                <Link
                                  to={`/learn/${course.id}?lesson=${lesson.id}`}
                                  className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                                >
                                  <Play className="w-3 h-3 fill-current" />
                                  <span>Study Lesson in Classroom</span>
                                </Link>
                              </>
                            ) : (
                              <button
                                type="button"
                                onClick={handleEnroll}
                                className="px-3.5 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <span>Enroll to access full lesson content</span>
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Prerequisites */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
              <h2 className="text-lg font-bold text-slate-900 mb-3">Prerequisites & Requirements</h2>
              <ul className="space-y-2 text-xs text-slate-600 list-disc list-inside">
                {course.prerequisites.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

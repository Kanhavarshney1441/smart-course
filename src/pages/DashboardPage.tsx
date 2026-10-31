import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Enrollment, RecommendationResult, Course } from '../types';
import { CourseCard } from '../components/CourseCard';
import { Sidebar } from '../components/Sidebar';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Sparkles,
  TrendingUp,
  ArrowRight,
  PlayCircle,
  Award,
  Layers,
  BarChart2,
  Calendar,
  Compass,
  GraduationCap
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Weekly study data for Recharts
  const weeklyActivityData = [
    { day: 'Mon', hours: 1.5, lessons: 2 },
    { day: 'Tue', hours: 2.0, lessons: 3 },
    { day: 'Wed', hours: 0.8, lessons: 1 },
    { day: 'Thu', hours: 2.5, lessons: 4 },
    { day: 'Fri', hours: 1.2, lessons: 2 },
    { day: 'Sat', hours: 3.0, lessons: 5 },
    { day: 'Sun', hours: 2.2, lessons: 3 },
  ];

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [enrRes, recRes] = await Promise.all([
          api.getEnrollments().catch(() => ({ enrollments: [] })),
          api.getRecommendations().catch(() => ({ recommendations: [] })),
        ]);
        setEnrollments(enrRes.enrollments || []);
        setRecommendations(recRes.recommendations || []);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const totalEnrolled = enrollments.length;
  const inProgressCourses = enrollments.filter(e => e.status === 'active');
  const completedCourses = enrollments.filter(e => e.status === 'completed');

  const overallProgress = totalEnrolled > 0
    ? Math.round(enrollments.reduce((acc, curr) => acc + curr.progress_percent, 0) / totalEnrolled)
    : 0;

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto overflow-y-auto">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-md">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-semibold mb-3 backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Intelligence Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.full_name || 'Alex'}!
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-xl">
                Goal: <span className="text-blue-300 font-semibold">{profile?.learning_goal?.replace(/_/g, ' ') || 'Career Transition'}</span> • Pace: <span className="text-indigo-300 font-semibold">{profile?.weekly_study_hours || 6} hrs/week</span>. You're making solid progress on your engineering roadmap.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/recommendations"
                className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                View Recommendations
              </Link>
              <Link
                to="/onboarding"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors backdrop-blur-sm"
              >
                Update Preferences
              </Link>
            </div>
          </div>
        </div>

        {/* Diagnostic Calibration Callout */}
        <div className="mb-8 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-600 text-white rounded-xl shadow-md shadow-blue-500/20">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                Calibrate Your Learning Roadmap
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white">New</span>
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Take the 5-minute diagnostic quiz to assess your CS knowledge and generate tailored learning paths.
              </p>
            </div>
          </div>
          <Link
            to="/quiz"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors whitespace-nowrap shadow-xs"
          >
            <span>Start Quiz</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{totalEnrolled}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Across all learning tracks</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">In Progress</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{inProgressCourses.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Actively studying</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{completedCourses.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Certificates & capstones finished</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Progress</span>
              <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-slate-900">{overallProgress}%</p>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-purple-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Grid: Continue Learning + Weekly Activity Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Continue Learning (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PlayCircle className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-slate-900">Continue Learning</h2>
              </div>
              <Link to="/my-learning" className="text-xs font-semibold text-blue-600 hover:text-blue-700">
                View All Enrolled ({totalEnrolled})
              </Link>
            </div>

            {inProgressCourses.length === 0 ? (
              <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
                <Compass className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-700">No courses in progress</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Browse our catalog of 30+ engineering courses or inspect smart recommendations to enroll in your next course.
                </p>
                <Link
                  to="/explore"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Explore Catalog
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {inProgressCourses.map((enr) => (
                  <div
                    key={enr.id}
                    className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 hover:border-slate-300 transition-colors shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <img
                        src={enr.course.thumbnail_url}
                        alt={enr.course.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 bg-slate-100"
                      />
                      <div>
                        <span className="text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {enr.course.category}
                        </span>
                        <Link to={`/courses/${enr.course_id}`}>
                          <h3 className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors mt-1 line-clamp-1">
                            {enr.course.title}
                          </h3>
                        </Link>
                        <p className="text-xs text-slate-500 mt-0.5">Instructor: {enr.course.instructor}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 sm:w-60">
                      <div className="flex-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                          <span>Progress</span>
                          <span>{enr.progress_percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-blue-600 h-full rounded-full transition-all"
                            style={{ width: `${enr.progress_percent}%` }}
                          />
                        </div>
                      </div>

                      <Link
                        to={`/learn/${enr.course_id}`}
                        className="px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold transition-all shrink-0 shadow-md shadow-blue-500/20 flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlayCircle className="w-3.5 h-3.5 fill-current" />
                        <span>Resume</span>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Weekly Activity Chart (1 col) */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-indigo-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Weekly Study Activity</h3>
                </div>
                <span className="text-[11px] font-medium text-slate-400">Past 7 Days</span>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                12.7 total study hours logged this week. Consistently meeting your target.
              </p>

              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      itemStyle={{ color: '#93c5fd' }}
                      formatter={(val: any) => [`${val} hrs`, 'Study Time']}
                    />
                    <Bar dataKey="hours" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span>Goal: 6 hrs/week</span>
              <span className="font-bold text-emerald-600">Goal Exceeded +110%</span>
            </div>
          </div>
        </div>

        {/* Recommended For You Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">Personalized Recommendations For You</h2>
                <p className="text-xs text-slate-500">Calculated via content-based similarity matching</p>
              </div>
            </div>
            <Link
              to="/recommendations"
              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View Full Ranked List
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendations.slice(0, 3).map((rec) => (
              <CourseCard
                key={rec.course.id}
                course={rec.course}
                matchScore={rec.matchPercentage}
                matchReasons={rec.reasons}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

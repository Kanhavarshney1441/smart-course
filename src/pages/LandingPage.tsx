import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  Search,
  CheckCircle2,
  TrendingUp,
  Brain,
  Layers,
  ArrowRight,
  Target,
  BarChart3,
  Clock,
  ShieldCheck,
  Star,
  BookOpen
} from 'lucide-react';
import { Course } from '../types';
import { api } from '../services/api';
import { CourseCard } from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loginAsDemoStudent } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [featuredCourses, setFeaturedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.getCourses({ limit: 6, sort: 'rating' });
        setFeaturedCourses(res.courses.slice(0, 6));
      } catch (err) {
        console.error('Error loading featured courses:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-16 pb-20 lg:pt-24 lg:pb-28">
        {/* Subtle decorative background blur */}
        <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-blue-100/60 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 -z-10 w-96 h-96 bg-indigo-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intelligent Learning Discovery Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Smart Courses Tailored to Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Goals & Schedule
              </span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Stop guessing what to learn next. Our weighted recommendation engine analyzes your career objectives, skill level, and available weekly study hours to curate an optimized learning path.
            </p>

            {/* Live Search Box */}
            <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto pt-4">
              <div className="relative flex items-center shadow-md rounded-2xl overflow-hidden bg-white border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-4 shrink-0" />
                <input
                  type="text"
                  placeholder="Search Python, React, PyTorch, Cloud, System Design..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
                />
                <button
                  type="submit"
                  className="mr-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl transition-colors shrink-0 shadow-sm"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                to="/explore"
                className="px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-colors shadow-sm flex items-center gap-2"
              >
                <Compass className="w-4 h-4" />
                Explore 30+ Courses
              </Link>

              {isAuthenticated ? (
                <Link
                  to="/recommendations"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:opacity-95 transition-all shadow-sm flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  View My Recommendations
                </Link>
              ) : (
                <Link
                  to="/onboarding"
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-sm hover:opacity-95 transition-all shadow-sm flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Get Personalized Matches
                </Link>
              )}

              {!isAuthenticated && (
                <button
                  onClick={async () => {
                    await loginAsDemoStudent();
                    navigate('/dashboard');
                  }}
                  className="px-5 py-3 rounded-xl bg-white text-slate-700 font-semibold text-sm border border-slate-300 hover:bg-slate-50 transition-colors"
                >
                  Try Demo Student Account
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS BANNER */}
      <section className="bg-slate-900 text-white py-8 border-y border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-3xl font-extrabold text-blue-400">30+</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Curated CS Courses</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-indigo-400">5 Weights</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Transparent Algorithm</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-blue-400">100%</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">College Capstone Scope</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-indigo-400">SQLite</p>
              <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">Relational Database</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">Step-by-Step Architecture</h2>
            <p className="text-3xl font-bold text-slate-900 tracking-tight">How the Smart Recommender Works</p>
            <p className="text-slate-600 text-sm mt-3">
              Built with a transparent, explainable content-based recommendation model to eliminate algorithmic black boxes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-blue-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg mb-4">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Student Profile Input</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Students define learning goals, desired skill topics, current experience level, and available weekly study hours.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg mb-4">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Weighted Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                The engine evaluates course metadata against student preferences using calibrated pedagogical weight matrices.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-purple-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-lg mb-4">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Explainable Ranking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Courses are ranked from 0% to 100% with transparent breakdowns: goal match, topic overlap, and difficulty suitability.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg mb-4">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">Progress & Feedback</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Students enroll, complete lessons, track completion %, and provide relevance feedback to adapt ongoing rankings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. RECOMMENDATION FEATURES BREAKDOWN */}
      <section className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
                <Brain className="w-3.5 h-3.5" />
                <span>Explainable Algorithm</span>
              </div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
                No Black Boxes. Every Recommendation Has Clear Rationale.
              </h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                Traditional AI platforms make recommendations without explaining why. Our system shows the exact contribution of each factor to your final match percentage score.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    30%
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Career & Learning Goal Match</h4>
                    <p className="text-[11px] text-slate-500">Maps user aspirations (e.g. career change vs interview prep) to curriculum outcomes.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    30%
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Topic Vector Overlap</h4>
                    <p className="text-[11px] text-slate-500">Computes intersection between student interests and specific course subject tags.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    20%
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Skill Level Suitability</h4>
                    <p className="text-[11px] text-slate-500">Ensures students are not overwhelmed by advanced prerequisites or bored by basics.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center shrink-0 text-xs">
                    20%
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Learning Format & Weekly Pace</h4>
                    <p className="text-[11px] text-slate-500">10% for format preference (interactive vs video) + 10% for realistic time-to-completion.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Illustration / Demo Card Graphic */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span className="font-bold text-sm text-slate-900">Live Scoring Inspector</span>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  94% Match Score
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Goal: Career Transition (Full-Stack)</span>
                    <span className="font-bold text-blue-600">30 / 30 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Topic Overlap: React, TypeScript, Node.js</span>
                    <span className="font-bold text-indigo-600">28 / 30 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full rounded-full" style={{ width: '93%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Skill Level: Intermediate Match</span>
                    <span className="font-bold text-purple-600">20 / 20 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Format: Project-Based</span>
                    <span className="font-bold text-amber-600">10 / 10 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
                    <span>Pace: 6 hrs/week (4 weeks total)</span>
                    <span className="font-bold text-emerald-600">10 / 10 pts</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
                <span>Calculated in 4ms</span>
                <span className="font-semibold text-blue-600">High Confidence Recommendation</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FEATURED COURSES SECTION */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
            <div>
              <h2 className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">High-Rated Curriculum</h2>
              <p className="text-3xl font-bold text-slate-900 tracking-tight">Featured Engineering Courses</p>
            </div>
            <Link
              to="/explore"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700"
            >
              Browse all 30+ courses
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredCourses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 6. CALL TO ACTION SECTION */}
      <section className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900 text-white py-16">
        <div className="max-w-5xl mx-auto px-4 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Discover Your Personalized Learning Path?
          </h2>
          <p className="text-slate-300 text-sm max-w-xl mx-auto leading-relaxed">
            Answer 6 quick questions in the Student Onboarding wizard to unlock tailored recommendations designed around your specific career targets.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/onboarding"
              className="px-6 py-3.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-500 shadow-md transition-all flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Start Onboarding Wizard
            </Link>
            <Link
              to="/explore"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-sm backdrop-blur-sm transition-all"
            >
              Explore Catalog Directly
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

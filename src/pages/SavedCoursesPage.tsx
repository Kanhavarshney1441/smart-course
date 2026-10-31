import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Course } from '../types';
import { Sidebar } from '../components/Sidebar';
import {
  Bookmark,
  Compass,
  Sparkles,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Clock,
  Star
} from 'lucide-react';

export const SavedCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const fetchSavedCourses = async () => {
    try {
      const res = await api.getSavedCourses();
      setCourses(res.courses || []);
    } catch (err) {
      console.error('Error fetching saved courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedCourses();
  }, []);

  const handleRemove = async (courseId: number) => {
    try {
      await api.unsaveCourse(courseId);
      setCourses((prev) => prev.filter((c) => c.id !== courseId));
      setNotification('Course removed from your saved wishlist.');
      setTimeout(() => setNotification(null), 3000);
    } catch (err) {
      console.error('Error removing saved course:', err);
    }
  };

  const handleEnroll = async (courseId: number) => {
    try {
      await api.enrollCourse(courseId);
      setNotification('🎉 Enrolled successfully! Now active in My Learning.');
      await fetchSavedCourses();
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setNotification(err.message || 'Already enrolled.');
      setTimeout(() => setNotification(null), 3000);
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

        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Personal Wishlist</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Saved Courses</h1>
            <p className="text-xs text-slate-500 mt-1">
              Courses bookmarked for future study sessions. Enroll directly when you're ready.
            </p>
          </div>

          <Link
            to="/explore"
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            Explore More
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
            <Bookmark className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Your wishlist is empty</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              When exploring courses or browsing recommendations, click the bookmark icon to save courses here for later.
            </p>
            <Link
              to="/explore"
              className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 shadow-xs"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col overflow-hidden"
              >
                <div className="relative h-40 bg-slate-100">
                  <img
                    src={course.thumbnail_url}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-white/95 text-slate-800 shadow-xs backdrop-blur-sm">
                      {course.category}
                    </span>
                  </div>
                  <button
                    onClick={() => handleRemove(course.id)}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-white/90 text-red-600 hover:bg-white shadow-xs"
                    title="Remove from saved"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-2">
                      <span className="font-semibold text-slate-700">{course.difficulty}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {course.duration_hours}h
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {course.rating.toFixed(1)}
                      </span>
                    </div>

                    <Link to={`/courses/${course.id}`}>
                      <h3 className="font-bold text-slate-900 text-sm hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                        {course.title}
                      </h3>
                    </Link>

                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {course.short_description || course.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
                    {course.is_enrolled ? (
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Enrolled
                      </span>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course.id)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                      >
                        Enroll Now
                      </button>
                    )}

                    <Link
                      to={`/courses/${course.id}`}
                      className="text-xs font-semibold text-slate-600 hover:text-blue-600 flex items-center gap-1"
                    >
                      Details
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

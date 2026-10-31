import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Course } from '../types';
import { Star, Clock, Video, Code, BookOpen, Layers, Bookmark, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CourseCardProps {
  course: Course;
  matchScore?: number;
  matchReasons?: string[];
  onSaveToggle?: (courseId: number, isSaved: boolean) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({
  course,
  matchScore,
  matchReasons,
  onSaveToggle,
}) => {
  const { isAuthenticated } = useAuth();
  const [isSaved, setIsSaved] = useState(course.is_saved || false);
  const [saving, setSaving] = useState(false);

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      window.location.href = '/auth';
      return;
    }

    setSaving(true);
    const newSaved = !isSaved;
    setIsSaved(newSaved);

    try {
      if (newSaved) {
        await api.saveCourse(course.id);
      } else {
        await api.unsaveCourse(course.id);
      }
      if (onSaveToggle) {
        onSaveToggle(course.id, newSaved);
      }
    } catch (err) {
      // rollback
      setIsSaved(!newSaved);
      console.error('Failed to toggle save:', err);
    } finally {
      setSaving(false);
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'Video Lectures':
        return <Video className="w-3.5 h-3.5" />;
      case 'Interactive Coding':
        return <Code className="w-3.5 h-3.5" />;
      case 'Project-Based':
        return <Layers className="w-3.5 h-3.5" />;
      default:
        return <BookOpen className="w-3.5 h-3.5" />;
    }
  };

  const getDifficultyBadgeColor = (diff: string) => {
    switch (diff) {
      case 'Beginner':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Intermediate':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Advanced':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden relative">
      {/* Top Banner / Image */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={course.thumbnail_url}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />

        {/* Category Pill */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white/95 text-slate-800 shadow-sm backdrop-blur-sm">
            {course.category}
          </span>
          {matchScore !== undefined && (
            <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-sm flex items-center gap-1 animate-pulse">
              <Sparkles className="w-3 h-3" />
              {matchScore}% Match
            </span>
          )}
        </div>

        {/* Bookmark Action */}
        <button
          onClick={handleSaveClick}
          disabled={saving}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isSaved
              ? 'bg-blue-600 text-white shadow-sm'
              : 'bg-white/90 text-slate-700 hover:bg-white hover:text-blue-600'
          }`}
          aria-label={isSaved ? 'Remove from wishlist' : 'Save course to wishlist'}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Rating overlay at bottom of thumbnail */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-medium">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="font-bold">{course.rating.toFixed(1)}</span>
            <span className="text-white/80">({course.review_count})</span>
          </div>
          <span className="text-white/90 text-[11px] truncate max-w-[150px]">{course.instructor}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata chips */}
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 rounded text-[11px] font-medium border ${getDifficultyBadgeColor(course.difficulty)}`}>
              {course.difficulty}
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              <Clock className="w-3 h-3 text-slate-400" />
              {course.duration_hours}h
            </span>
            <span className="flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 truncate max-w-[130px]">
              {getFormatIcon(course.format)}
              <span className="truncate">{course.format}</span>
            </span>
          </div>

          {/* Title */}
          <Link to={`/courses/${course.id}`}>
            <h3 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 text-sm leading-snug mb-1.5">
              {course.title}
            </h3>
          </Link>

          {/* Short Description */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {course.short_description || course.description}
          </p>

          {/* Key Topics preview */}
          <div className="flex flex-wrap gap-1 mb-3">
            {course.topics.slice(0, 3).map((topic, i) => (
              <span key={i} className="px-1.5 py-0.5 text-[10px] bg-slate-100 text-slate-600 rounded">
                {topic}
              </span>
            ))}
            {course.topics.length > 3 && (
              <span className="px-1.5 py-0.5 text-[10px] text-slate-400">
                +{course.topics.length - 3}
              </span>
            )}
          </div>

          {/* Match Reason snippet if provided */}
          {matchReasons && matchReasons.length > 0 && (
            <div className="mb-3 p-2 rounded-lg bg-indigo-50/70 border border-indigo-100 text-[11px] text-indigo-900 flex items-start gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0 mt-0.5" />
              <span className="line-clamp-1 font-medium">{matchReasons[0]}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          {course.is_enrolled ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Enrolled ({course.enrollment_progress || 0}%)
            </span>
          ) : (
            <span className="text-xs font-semibold text-slate-700">Free with Enrollment</span>
          )}

          <Link
            to={`/courses/${course.id}`}
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 group-hover:translate-x-0.5 transition-transform"
          >
            {course.is_enrolled ? 'Continue' : 'Details'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { Course } from '../types';
import { CourseCard } from '../components/CourseCard';
import { useAuth } from '../context/AuthContext';
import {
  loadSearchHistory,
  saveSearchHistory,
  addSearchQuery,
  removeSearchQuery,
  SearchHistoryItem
} from '../utils/searchHistory';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Compass,
  ArrowUpDown,
  Sparkles,
  BookOpen,
  History,
  Clock,
  Trash2,
  TrendingUp,
  Tag,
  ArrowRight,
  ChevronRight
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Web Development',
  'Data Science & AI',
  'Cloud & DevOps',
  'Computer Science',
  'Cybersecurity',
  'Mobile Development',
  'UI/UX Design',
];

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];
const FORMATS = ['All', 'Video Lectures', 'Interactive Coding', 'Project-Based', 'Reading & Quizzes'];
const DURATIONS = ['All', 'Short', 'Medium', 'Long'];

const POPULAR_SEARCHES = [
  'Python',
  'React',
  'Machine Learning',
  'Docker',
  'AWS',
  'System Design',
  'TypeScript',
  'Cybersecurity'
];

export const ExplorePage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'All');
  const [selectedDifficulty, setSelectedDifficulty] = useState(searchParams.get('difficulty') || 'All');
  const [selectedFormat, setSelectedFormat] = useState(searchParams.get('format') || 'All');
  const [selectedDuration, setSelectedDuration] = useState(searchParams.get('duration') || 'All');
  const [selectedSort, setSelectedSort] = useState(searchParams.get('sort') || 'rating');

  // Search History state
  const storageKey = `edupath_search_history_${user?.id || 'guest'}`;
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Pagination
  const [visibleCount, setVisibleCount] = useState(9);

  // Load search history from localStorage on mount and when user changes
  useEffect(() => {
    const loaded = loadSearchHistory(storageKey);
    setSearchHistory(loaded);
  }, [storageKey]);

  const fetchCourses = async (overrideQuery?: string) => {
    setLoading(true);
    const activeSearch = overrideQuery !== undefined ? overrideQuery : searchQuery;
    try {
      const res = await api.getCourses({
        search: activeSearch,
        category: selectedCategory,
        difficulty: selectedDifficulty,
        format: selectedFormat,
        duration: selectedDuration,
        sort: selectedSort,
      });
      setCourses(res.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [selectedCategory, selectedDifficulty, selectedFormat, selectedDuration, selectedSort]);

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      const updatedHistory = addSearchQuery(query, searchHistory);
      setSearchHistory(updatedHistory);
      saveSearchHistory(updatedHistory, storageKey);
    }
    fetchCourses();
  };

  // Quick Access: Select a recent search query from the sidebar
  const handleSelectRecentSearch = (query: string) => {
    setSearchQuery(query);
    const updatedHistory = addSearchQuery(query, searchHistory);
    setSearchHistory(updatedHistory);
    saveSearchHistory(updatedHistory, storageKey);
    setMobileSidebarOpen(false);
    fetchCourses(query);
  };

  // Quick Access: Select a popular trending search
  const handleSelectTrending = (query: string) => {
    setSearchQuery(query);
    const updatedHistory = addSearchQuery(query, searchHistory);
    setSearchHistory(updatedHistory);
    saveSearchHistory(updatedHistory, storageKey);
    setMobileSidebarOpen(false);
    fetchCourses(query);
  };

  // Remove individual item from search history
  const handleRemoveHistoryItem = (e: React.MouseEvent, query: string) => {
    e.stopPropagation();
    const updated = removeSearchQuery(query, searchHistory);
    setSearchHistory(updated);
    saveSearchHistory(updated, storageKey);
  };

  // Clear all search history
  const handleClearAllHistory = () => {
    setSearchHistory([]);
    saveSearchHistory([], storageKey);
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedDifficulty('All');
    setSelectedFormat('All');
    setSelectedDuration('All');
    setSelectedSort('rating');
    setVisibleCount(9);
    fetchCourses('');
  };

  const hasActiveFilters =
    searchQuery !== '' ||
    selectedCategory !== 'All' ||
    selectedDifficulty !== 'All' ||
    selectedFormat !== 'All' ||
    selectedDuration !== 'All';

  const visibleCourses = courses.slice(0, visibleCount);

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Course Catalog Directory</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Explore All Courses</h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              Search by title, instructor, or technical topic, and access recent queries from your search history.
            </p>
          </div>

          {/* Mobile Search History Toggle Button */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
              className="px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs font-semibold flex items-center gap-2 shadow-xs"
            >
              <History className="w-4 h-4 text-blue-600" />
              <span>Search History</span>
              {searchHistory.length > 0 && (
                <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {searchHistory.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Main Content Layout with Search History Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* SEARCH HISTORY & QUICK ACCESS SIDEBAR (Desktop) */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6 sticky top-20">
            {/* 1. Recent Searches Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                    <History className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Search History</h2>
                    <p className="text-[10px] text-slate-400">Quick access to past queries</p>
                  </div>
                </div>

                {searchHistory.length > 0 && (
                  <button
                    onClick={handleClearAllHistory}
                    className="text-[11px] font-semibold text-slate-400 hover:text-red-600 transition-colors"
                    title="Clear search history"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {searchHistory.length === 0 ? (
                <div className="text-center py-6 px-2 space-y-2">
                  <Clock className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-medium text-slate-600">No search history yet</p>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Search queries you enter will appear here for fast one-click re-searching.
                  </p>
                </div>
              ) : (
                <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
                  {searchHistory.map((item, idx) => {
                    const isActive = searchQuery.toLowerCase() === item.query.toLowerCase();
                    return (
                      <div
                        key={idx}
                        onClick={() => handleSelectRecentSearch(item.query)}
                        className={`group flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                            : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Clock className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="truncate">{item.query}</span>
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleRemoveHistoryItem(e, item.query)}
                          className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 p-0.5 rounded transition-opacity"
                          title="Remove from history"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Popular & Trending Topics Card */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Trending Topics</h3>
                  <p className="text-[10px] text-slate-400">Frequently searched subjects</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 pt-1">
                {POPULAR_SEARCHES.map((topic) => {
                  const isSelected = searchQuery.toLowerCase() === topic.toLowerCase();
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => handleSelectTrending(topic)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                      }`}
                    >
                      <Tag className="w-2.5 h-2.5 opacity-60" />
                      <span>{topic}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Quick Presets Card */}
            <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-2xl p-4 text-white space-y-2 shadow-xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-200">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Curriculum Shortcut</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Looking for tailored recommendations instead of manual search?
              </p>
              <a
                href="/recommendations"
                className="inline-flex items-center gap-1 text-xs font-bold text-white hover:text-blue-200 pt-1"
              >
                <span>View Smart Matches</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </aside>

          {/* MOBILE SLIDE-OVER SIDEBAR DRAWER */}
          {mobileSidebarOpen && (
            <div className="fixed inset-0 z-50 lg:hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
              <div className="w-80 bg-white h-full p-6 shadow-2xl overflow-y-auto space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900">Recent Searches</h3>
                  </div>
                  <button
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {searchHistory.length === 0 ? (
                  <p className="text-xs text-slate-400 text-center py-6">No recent search history yet.</p>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs text-slate-500 mb-1">
                      <span>Recent queries</span>
                      <button onClick={handleClearAllHistory} className="text-red-600 font-semibold text-[11px]">
                        Clear All
                      </button>
                    </div>
                    {searchHistory.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectRecentSearch(item.query)}
                        className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs text-slate-800 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate">{item.query}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveHistoryItem(e, item.query)}
                          className="p-1 text-slate-400 hover:text-red-500"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Popular Searches</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {POPULAR_SEARCHES.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => handleSelectTrending(topic)}
                        className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-lg font-medium"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* MAIN SEARCH & CATALOG COLUMN (3 COLS) */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search & Sort Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                {/* Search Input with History hint */}
                <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search Python, React, PyTorch, Cloud, System Design..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-16 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors"
                  >
                    Search
                  </button>
                </form>

                {/* Dropdown Filters & Sort */}
                <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                  {/* Difficulty */}
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="All">All Difficulties</option>
                    {DIFFICULTIES.slice(1).map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>

                  {/* Format */}
                  <select
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="All">All Formats</option>
                    {FORMATS.slice(1).map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>

                  {/* Duration */}
                  <select
                    value={selectedDuration}
                    onChange={(e) => setSelectedDuration(e.target.value)}
                    className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500"
                  >
                    <option value="All">All Durations</option>
                    <option value="Short">Short (&lt; 15 hrs)</option>
                    <option value="Medium">Medium (15 - 28 hrs)</option>
                    <option value="Long">Long (&gt; 28 hrs)</option>
                  </select>

                  {/* Sort By */}
                  <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
                    <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                    <select
                      value={selectedSort}
                      onChange={(e) => setSelectedSort(e.target.value)}
                      className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500"
                    >
                      <option value="rating">Highest Rated</option>
                      <option value="duration_asc">Duration: Short to Long</option>
                      <option value="duration_desc">Duration: Long to Short</option>
                      <option value="newest">Recently Added</option>
                    </select>
                  </div>

                  {hasActiveFilters && (
                    <button
                      onClick={clearAllFilters}
                      className="px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition-colors flex items-center gap-1 border border-red-200"
                    >
                      <X className="w-3.5 h-3.5" />
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Horizontal Category Pill Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto pt-4 mt-3 border-t border-slate-100 pb-1 scrollbar-none">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active search filter badge */}
            {searchQuery && (
              <div className="flex items-center justify-between bg-blue-50/80 border border-blue-200 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2 text-xs text-blue-900">
                  <Search className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Searching for: <strong className="font-bold text-blue-950">"{searchQuery}"</strong>
                  </span>
                </div>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    fetchCourses('');
                  }}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear Search</span>
                </button>
              </div>
            )}

            {/* Results Counter */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <p>
                Showing <span className="font-bold text-slate-800">{visibleCourses.length}</span> of{' '}
                <span className="font-bold text-slate-800">{courses.length}</span> matching courses
              </p>
            </div>

            {/* Courses Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-80 bg-white rounded-2xl border border-slate-200 p-4 animate-pulse">
                    <div className="h-40 bg-slate-200 rounded-xl mb-4" />
                    <div className="h-4 bg-slate-200 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-slate-200 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto">
                <Compass className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-800">No courses match your search</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  No matches found for <span className="font-semibold text-slate-700">"{searchQuery}"</span>. Try clicking a recent query from the search history sidebar or choosing a trending topic.
                </p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {visibleCourses.map((course, idx) => (
                    <div
                      key={`${course.id}-${searchQuery}-${selectedCategory}-${selectedDifficulty}-${selectedFormat}-${selectedDuration}-${selectedSort}`}
                      className="animate-card-entrance h-full flex flex-col"
                      style={{
                        animationDelay: `${Math.min(idx * 35, 245)}ms`,
                      }}
                    >
                      <CourseCard course={course} />
                    </div>
                  ))}
                </div>

                {/* Load More Button */}
                {visibleCount < courses.length && (
                  <div className="text-center pt-4">
                    <button
                      onClick={() => setVisibleCount((prev) => prev + 6)}
                      className="px-6 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-xs transition-colors"
                    >
                      Load More Courses ({courses.length - visibleCount} remaining)
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

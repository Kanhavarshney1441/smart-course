import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { AdminStats, AdminStudentRow, Course } from '../types';
import { Sidebar } from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  BookOpen,
  Users,
  GraduationCap,
  Plus,
  Trash2,
  Edit3,
  BarChart2,
  CheckCircle2,
  Clock,
  Layers,
  Search,
  X,
  Save,
  AlertCircle
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line
} from 'recharts';

export const AdminPage: React.FC = () => {
  const { user, isAdmin, loginAsDemoAdmin } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'courses' | 'students' | 'analytics'>('courses');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<AdminStudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);
  const [courseSearch, setCourseSearch] = useState('');

  // Course Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null);
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsData, coursesData, studentsData] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getCourses({ limit: 100 }),
        api.getAdminStudents().catch(() => ({ students: [] })),
      ]);
      setStats(statsData);
      setCourses(coursesData.courses || []);
      setStudents(studentsData.students || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin]);

  const handleDeleteCourse = async (courseId: number, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      await api.deleteCourse(courseId);
      setNotification(`Course "${title}" successfully deleted.`);
      await fetchData();
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setNotification(err.message || 'Failed to delete course.');
    }
  };

  const handleOpenAddModal = () => {
    setEditingCourse({
      title: '',
      short_description: '',
      description: '',
      instructor: 'Staff Professor',
      category: 'Web Development',
      difficulty: 'Beginner',
      format: 'Project-Based',
      duration_hours: 15,
      thumbnail_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800',
      topics: ['Web Development', 'JavaScript'],
      prerequisites: ['Basic computer skills'],
      learning_outcomes: ['Build functional web applications'],
      is_featured: false,
    });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (course: Course) => {
    setEditingCourse({ ...course });
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleSaveCourseModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    if (!editingCourse.title || !editingCourse.description || !editingCourse.instructor) {
      setModalError('Title, description, and instructor are required.');
      return;
    }

    setModalSaving(true);
    setModalError(null);

    try {
      if (editingCourse.id) {
        await api.updateCourse(editingCourse.id, editingCourse);
        setNotification('Course updated successfully.');
      } else {
        await api.createCourse(editingCourse);
        setNotification('New course added to catalog and recommendation engine.');
      }
      setIsModalOpen(false);
      setEditingCourse(null);
      await fetchData();
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setModalError(err.message || 'Error saving course.');
    } finally {
      setModalSaving(false);
    }
  };

  // If user is not admin, offer 1-click switch to Demo Admin
  if (!isAdmin) {
    return (
      <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
        <Sidebar />
        <main className="flex-1 p-8 max-w-xl mx-auto flex flex-col justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Admin Authorization Required</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            This dashboard is protected by server-side role validation. To view management statistics, add/delete courses, or inspect registered students, log in with an administrator account.
          </p>
          <div className="pt-2">
            <button
              onClick={async () => {
                await loginAsDemoAdmin();
                await fetchData();
              }}
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
            >
              Log in as Demo Admin (1-Click)
            </button>
          </div>
        </main>
      </div>
    );
  }

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.instructor.toLowerCase().includes(courseSearch.toLowerCase()) ||
    c.category.toLowerCase().includes(courseSearch.toLowerCase())
  );

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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>System Administrator Control Panel</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Operations & Analytics</h1>
            <p className="text-xs text-slate-500 mt-1">
              Curate courses, audit registered students, and inspect enrollment statistics.
            </p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5 self-start"
          >
            <Plus className="w-4 h-4" />
            Add New Course
          </button>
        </div>

        {/* Stats Row */}
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Courses</span>
              <p className="text-2xl font-black text-slate-900">{stats.totalCourses}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Active in catalog</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Students</span>
              <p className="text-2xl font-black text-slate-900">{stats.totalStudents}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Registered accounts</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Enrollments</span>
              <p className="text-2xl font-black text-slate-900">{stats.totalEnrollments}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Total course seats</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Completions</span>
              <p className="text-2xl font-black text-emerald-600">{stats.completedEnrollments}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">100% finished</p>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Avg Rating</span>
              <p className="text-2xl font-black text-amber-600">{stats.averageRating}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Out of 5.0 stars</p>
            </div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-xs mb-6 w-full sm:w-auto inline-flex">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'courses' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Manage Courses ({courses.length})
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'students' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Registered Students ({students.length})
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'analytics' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            System Visual Analytics
          </button>
        </div>

        {/* TAB 1: COURSES MANAGEMENT */}
        {activeTab === 'courses' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Table Search */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="relative w-full max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter courses by title or instructor..."
                  value={courseSearch}
                  onChange={(e) => setCourseSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <span className="text-xs text-slate-400">
                {filteredCourses.length} courses listed
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4">Duration</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCourses.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-900 max-w-xs">
                        <div className="truncate">{c.title}</div>
                        <div className="text-[10px] text-slate-400 font-normal">{c.instructor}</div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {c.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="text-slate-700 font-medium">{c.difficulty}</span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">{c.duration_hours}h</td>
                      <td className="py-3 px-4 whitespace-nowrap font-bold text-amber-600">
                        ★ {c.rating.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenEditModal(c)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit course"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCourse(c.id, c.title)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete course"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: REGISTERED STUDENTS */}
        {activeTab === 'students' && (
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Student Enrollment Directory</h3>
              <p className="text-[11px] text-slate-500">Live accounts stored in database</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Learning Goal</th>
                    <th className="py-3 px-4">Skill Level</th>
                    <th className="py-3 px-4">Enrolled</th>
                    <th className="py-3 px-4">Completed</th>
                    <th className="py-3 px-4">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900">{s.full_name}</td>
                      <td className="py-3 px-4 text-slate-500">{s.email}</td>
                      <td className="py-3 px-4 capitalize">
                        <span className="px-2 py-0.5 rounded text-[10px] bg-blue-50 text-blue-700 font-semibold border border-blue-200">
                          {s.learning_goal?.replace(/_/g, ' ') || 'Career Transition'}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium">{s.skill_level || 'Intermediate'}</td>
                      <td className="py-3 px-4 font-bold text-slate-800">{s.enrolled_count} courses</td>
                      <td className="py-3 px-4 font-bold text-emerald-600">{s.completed_count} courses</td>
                      <td className="py-3 px-4 text-slate-400">{new Date(s.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: SYSTEM VISUAL ANALYTICS */}
        {activeTab === 'analytics' && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Category Breakdown Bar Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Courses by Category</h3>
              <p className="text-xs text-slate-500 mb-4">Distribution of courses across academic curriculum</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.categoryBreakdown} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis dataKey="category" type="category" tick={{ fontSize: 10, fill: '#64748b' }} width={110} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly Enrollments Trend Line Chart */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Weekly Student Activity</h3>
              <p className="text-xs text-slate-500 mb-4">Daily enrollment and completion velocities</p>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.weeklyEnrollments} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="enrollments" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="completions" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Course Add / Edit Modal */}
        {isModalOpen && editingCourse && (
          <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl shadow-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 border border-slate-200">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
                <h3 className="text-lg font-bold text-slate-900">
                  {editingCourse.id ? 'Edit Course Details' : 'Add New Engineering Course'}
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              <form onSubmit={handleSaveCourseModal} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Course Title</label>
                  <input
                    type="text"
                    required
                    value={editingCourse.title || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Instructor</label>
                    <input
                      type="text"
                      required
                      value={editingCourse.instructor || ''}
                      onChange={(e) => setEditingCourse({ ...editingCourse, instructor: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Category</label>
                    <select
                      value={editingCourse.category || 'Web Development'}
                      onChange={(e) => setEditingCourse({ ...editingCourse, category: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Web Development">Web Development</option>
                      <option value="Data Science & AI">Data Science & AI</option>
                      <option value="Cloud & DevOps">Cloud & DevOps</option>
                      <option value="Computer Science">Computer Science</option>
                      <option value="Cybersecurity">Cybersecurity</option>
                      <option value="Mobile Development">Mobile Development</option>
                      <option value="UI/UX Design">UI/UX Design</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Difficulty</label>
                    <select
                      value={editingCourse.difficulty || 'Beginner'}
                      onChange={(e) => setEditingCourse({ ...editingCourse, difficulty: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="All Levels">All Levels</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Format</label>
                    <select
                      value={editingCourse.format || 'Project-Based'}
                      onChange={(e) => setEditingCourse({ ...editingCourse, format: e.target.value as any })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    >
                      <option value="Project-Based">Project-Based</option>
                      <option value="Interactive Coding">Interactive Coding</option>
                      <option value="Video Lectures">Video Lectures</option>
                      <option value="Reading & Quizzes">Reading & Quizzes</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Duration (Hours)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={editingCourse.duration_hours || 10}
                      onChange={(e) => setEditingCourse({ ...editingCourse, duration_hours: parseInt(e.target.value, 10) || 1 })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Short Description</label>
                  <input
                    type="text"
                    value={editingCourse.short_description || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, short_description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Detailed Description</label>
                  <textarea
                    rows={3}
                    required
                    value={editingCourse.description || ''}
                    onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Topics (comma separated)</label>
                  <input
                    type="text"
                    value={editingCourse.topics?.join(', ') || ''}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        topics: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={modalSaving}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{modalSaving ? 'Saving...' : 'Save Course'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

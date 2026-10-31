import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  BookOpen,
  Compass,
  Bookmark,
  User as UserIcon,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  GraduationCap,
  Layers,
  ChevronDown
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout, loginAsDemoStudent, loginAsDemoAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setUserDropdownOpen(false);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                EduPath <span className="text-blue-600 font-semibold text-xs px-2 py-0.5 rounded-full bg-blue-50 border border-blue-200">AI Recommender</span>
              </span>
              <p className="text-[11px] text-slate-500 hidden sm:block">Smart Course Recommendation System</p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-700">
            <Link
              to="/explore"
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/explore')
                  ? 'bg-blue-50 text-blue-700 font-semibold'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Compass className="w-4 h-4 text-blue-600" />
              Explore Courses
            </Link>
            <Link
              to="/quiz"
              className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                isActive('/quiz')
                  ? 'bg-purple-50 text-purple-700 font-semibold'
                  : 'hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-4 h-4 text-purple-600" />
              Diagnostic Quiz
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/recommendations"
                  className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/recommendations')
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Recommendations
                </Link>

                <Link
                  to="/my-learning"
                  className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/my-learning')
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  My Learning
                </Link>

                <Link
                  to="/saved"
                  className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                    isActive('/saved')
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Bookmark className="w-4 h-4 text-slate-500" />
                  Saved
                </Link>
              </>
            )}

            {isAdmin && (
              <Link
                to="/admin"
                className={`px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/admin')
                    ? 'bg-amber-50 text-amber-800 font-semibold'
                    : 'hover:bg-slate-100 hover:text-slate-900 text-amber-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                Admin Panel
              </Link>
            )}
          </nav>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={async () => {
                    await loginAsDemoStudent();
                    navigate('/dashboard');
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-300"
                  title="Log in as Demo Student"
                >
                  Demo Student
                </button>

                <button
                  onClick={async () => {
                    await loginAsDemoAdmin();
                    navigate('/admin');
                  }}
                  className="px-3 py-1.5 text-xs font-medium text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors border border-amber-300"
                  title="Log in as Demo Admin"
                >
                  Demo Admin
                </button>

                <Link
                  to="/auth"
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                  aria-expanded={userDropdownOpen}
                >
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold flex items-center justify-center text-sm shadow-sm">
                    {user?.full_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.full_name}</p>
                    <p className="text-[10px] text-slate-500 capitalize">{user?.role}</p>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-sm font-bold text-slate-900 truncate">{user?.email}</p>
                    </div>

                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Layers className="w-4 h-4 text-blue-600" />
                      Student Dashboard
                    </Link>

                    <Link
                      to="/onboarding"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      Retake Onboarding
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <UserIcon className="w-4 h-4 text-slate-500" />
                      Profile & Preferences
                    </Link>

                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-amber-800 hover:bg-amber-50"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-600" />
                        Admin Dashboard
                      </Link>
                    )}

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            <Link
              to="/explore"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
            >
              Explore Courses
            </Link>
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                >
                  Dashboard
                </Link>
                <Link
                  to="/recommendations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-base font-medium text-indigo-700 hover:bg-indigo-50 flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Recommendations
                </Link>
                <Link
                  to="/my-learning"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                >
                  My Learning
                </Link>
                <Link
                  to="/saved"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                >
                  Saved Courses
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
                >
                  Profile & Settings
                </Link>
                {isAdmin && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-md text-base font-medium text-amber-700 hover:bg-amber-50"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="pt-2 flex flex-col gap-2">
                <Link
                  to="/auth"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg shadow-sm"
                >
                  Sign In / Register
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={async () => {
                      await loginAsDemoStudent();
                      setMobileMenuOpen(false);
                      navigate('/dashboard');
                    }}
                    className="flex-1 py-1.5 text-xs text-center font-medium text-slate-700 bg-slate-100 rounded-lg border border-slate-300"
                  >
                    Demo Student
                  </button>
                  <button
                    onClick={async () => {
                      await loginAsDemoAdmin();
                      setMobileMenuOpen(false);
                      navigate('/admin');
                    }}
                    className="flex-1 py-1.5 text-xs text-center font-medium text-amber-800 bg-amber-50 rounded-lg border border-amber-300"
                  >
                    Demo Admin
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

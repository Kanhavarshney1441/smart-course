import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  Compass,
  BookOpen,
  Bookmark,
  User,
  ShieldCheck,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { isAdmin } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Smart Matches', path: '/recommendations', icon: Sparkles, badge: 'AI' },
    { name: 'Diagnostic Quiz', path: '/quiz', icon: GraduationCap, badge: 'New' },
    { name: 'Explore Catalog', path: '/explore', icon: Compass },
    { name: 'My Learning', path: '/my-learning', icon: BookOpen },
    { name: 'Saved Courses', path: '/saved', icon: Bookmark },
    { name: 'Preferences & Profile', path: '/profile', icon: User },
  ];

  if (isAdmin) {
    navItems.push({
      name: 'Admin Dashboard',
      path: '/admin',
      icon: ShieldCheck,
      badge: 'Staff',
    });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col flex-shrink-0 min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-1">
        <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Learning Navigation
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-500" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    item.badge === 'AI'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* College Project Badge in Sidebar footer */}
      <div className="mt-auto p-4 border-t border-slate-100">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-slate-800 mb-1">
            <GraduationCap className="w-4 h-4 text-blue-600" />
            CS Capstone Project
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Content-based course recommendation system with normalized similarity vectors.
          </p>
        </div>
      </div>
    </aside>
  );
};

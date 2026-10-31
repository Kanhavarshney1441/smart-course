import React from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ShieldCheck, Heart, Sparkles, BookOpen, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">EduPath</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart Course Recommendation System designed for college computer science curricula. Matches students with courses using a transparent content-based weighted similarity model.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-950 text-blue-300 border border-blue-800">
                Algorithm: Content-Based
              </span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/explore" className="hover:text-white transition-colors">
                  Explore Catalog
                </Link>
              </li>
              <li>
                <Link to="/recommendations" className="hover:text-white transition-colors">
                  Smart Recommendations
                </Link>
              </li>
              <li>
                <Link to="/my-learning" className="hover:text-white transition-colors">
                  My Learning Progress
                </Link>
              </li>
              <li>
                <Link to="/onboarding" className="hover:text-white transition-colors">
                  Recommendation Wizard
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-4">Popular Tracks</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>Web Development (React, Node, Next.js)</li>
              <li>Data Science & AI (PyTorch, Machine Learning)</li>
              <li>Cloud & DevOps (Docker, Kubernetes, AWS)</li>
              <li>Cybersecurity & Network Defense</li>
              <li>Computer Science & Algorithms</li>
            </ul>
          </div>

          {/* Algorithm Info & Academic Demo */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider mb-2">College Project</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Implements weighted heuristics:
              <br />• 30% Learning Goal Alignment
              <br />• 30% Topic Vector Similarity
              <br />• 20% Skill Level Suitability
              <br />• 10% Preferred Learning Format
              <br />• 10% Time & Pace Feasibility
            </p>
            <div className="pt-2 text-xs text-slate-500">
              Database: SQLite with relational foreign keys.
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Smart Course Recommendation System. College Capstone Project.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              Built with React, TypeScript & SQLite
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

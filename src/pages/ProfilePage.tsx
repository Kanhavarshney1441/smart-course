import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Sidebar } from '../components/Sidebar';
import {
  User,
  Mail,
  Shield,
  SlidersHorizontal,
  Clock,
  BookOpen,
  Award,
  Check,
  Save,
  LogOut,
  Sparkles
} from 'lucide-react';

const ALL_TOPICS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Machine Learning',
  'Deep Learning', 'PyTorch', 'AWS', 'Docker', 'Kubernetes',
  'DevOps', 'Algorithms', 'Data Structures', 'System Design',
  'Cybersecurity', 'Ethical Hacking', 'UI/UX Design', 'Figma',
  'Flutter', 'iOS', 'Next.js', 'PostgreSQL', 'GraphQL', 'Go'
];

export const ProfilePage: React.FC = () => {
  const { user, profile, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();

  const [learningGoal, setLearningGoal] = useState(profile?.learning_goal || 'career_transition');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(profile?.preferred_topics || []);
  const [skillLevel, setSkillLevel] = useState(profile?.skill_level || 'Intermediate');
  const [preferredFormat, setPreferredFormat] = useState(profile?.preferred_format || 'Project-Based');
  const [weeklyStudyHours, setWeeklyStudyHours] = useState<number>(profile?.weekly_study_hours || 6);
  const [preferredDuration, setPreferredDuration] = useState(profile?.preferred_duration || 'Medium (10-30 hrs)');
  const [bio, setBio] = useState(profile?.bio || '');

  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      if (profile.learning_goal) setLearningGoal(profile.learning_goal);
      if (profile.preferred_topics) setSelectedTopics(profile.preferred_topics);
      if (profile.skill_level) setSkillLevel(profile.skill_level);
      if (profile.preferred_format) setPreferredFormat(profile.preferred_format);
      if (profile.weekly_study_hours) setWeeklyStudyHours(profile.weekly_study_hours);
      if (profile.preferred_duration) setPreferredDuration(profile.preferred_duration);
      if (profile.bio !== undefined) setBio(profile.bio);
    }
  }, [profile]);

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length > 1) {
        setSelectedTopics(selectedTopics.filter((t) => t !== topic));
      }
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.updateProfile({
        learning_goal: learningGoal,
        preferred_topics: selectedTopics,
        skill_level: skillLevel as any,
        preferred_format: preferredFormat as any,
        weekly_study_hours: weeklyStudyHours,
        preferred_duration: preferredDuration as any,
        bio,
      });
      await refreshProfile();
      setNotification('✅ Learning preferences and profile successfully updated!');
      setTimeout(() => setNotification(null), 3000);
    } catch (err: any) {
      setNotification('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto overflow-y-auto">
        {notification && (
          <div className="mb-6 p-3 bg-blue-600 text-white text-xs font-semibold rounded-xl text-center shadow-md animate-in fade-in">
            {notification}
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold mb-2">
              <User className="w-3.5 h-3.5" />
              <span>Student Account Settings</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Profile & Preferences</h1>
            <p className="text-xs text-slate-500 mt-1">
              Manage your personal details and adjust recommendation algorithm weights.
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 self-start"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: User Card */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center mx-auto shadow-md shadow-blue-500/20">
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900">{user?.full_name}</h3>
                <p className="text-xs text-slate-500">{user?.email}</p>
                <div className="mt-2 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200 capitalize">
                  <Shield className="w-3 h-3" />
                  {user?.role} Account
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 text-left space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Pace:</span>
                  <span className="font-semibold text-slate-800">{weeklyStudyHours} hrs/week</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Skill Level:</span>
                  <span className="font-semibold text-slate-800">{skillLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Favorite Format:</span>
                  <span className="font-semibold text-slate-800">{preferredFormat}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Preferences Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900">Recommender Tuning Parameters</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Changes made here directly calibrate the live content similarity scores.
                </p>
              </div>

              {/* Learning Goal */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Learning Goal (Weight: 30%)</label>
                <select
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                >
                  <option value="career_transition">Career Transition (Software Engineering / Full-Stack)</option>
                  <option value="skill_advancement">Skill Advancement (Deep Tech & Cloud)</option>
                  <option value="academic_exam_prep">Academic & Interview Preparation (DSA & System Design)</option>
                  <option value="hobby_building">Building Practical Projects</option>
                  <option value="certification">Cloud & Cybersecurity Certification</option>
                </select>
              </div>

              {/* Topics Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Topic Interests (Weight: 30%)
                </label>
                <p className="text-[11px] text-slate-500 mb-2">Click tags to include or exclude from matching:</p>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_TOPICS.map((topic) => {
                    const isSelected = selectedTopics.includes(topic);
                    return (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleTopic(topic)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${
                          isSelected
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                        <span>{topic}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Skill Level & Format in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Skill Level (Weight: 20%)</label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Preferred Format (Weight: 10%)</label>
                  <select
                    value={preferredFormat}
                    onChange={(e) => setPreferredFormat(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Project-Based">Project-Based</option>
                    <option value="Interactive Coding">Interactive Coding</option>
                    <option value="Video Lectures">Video Lectures</option>
                    <option value="Reading & Quizzes">Reading & Quizzes</option>
                    <option value="Any">Any Format</option>
                  </select>
                </div>
              </div>

              {/* Study Hours & Duration in Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Weekly Study Commitment</label>
                  <select
                    value={weeklyStudyHours}
                    onChange={(e) => setWeeklyStudyHours(parseInt(e.target.value, 10))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value={3}>3 hrs / week (Casual)</option>
                    <option value={6}>6 hrs / week (Moderate)</option>
                    <option value={10}>10 hrs / week (Dedicated)</option>
                    <option value={15}>15+ hrs / week (Intensive)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Course Duration Preference (Weight: 10%)</label>
                  <select
                    value={preferredDuration}
                    onChange={(e) => setPreferredDuration(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="Short (< 10 hrs)">Short (&lt; 10 hrs)</option>
                    <option value="Medium (10-30 hrs)">Medium (10-30 hrs)</option>
                    <option value="Long (> 30 hrs)">Long (&gt; 30 hrs)</option>
                    <option value="Any">Any Duration</option>
                  </select>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Student Bio / Learning Objectives</label>
                <textarea
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="e.g. 2nd-year computer science undergraduate preparing for backend engineering internships..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Scores update dynamically across all pages upon saving.
                </span>

                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Save Preferences'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
};

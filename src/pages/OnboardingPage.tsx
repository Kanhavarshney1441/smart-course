import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Target,
  Code,
  Layers,
  Clock,
  Calendar,
  BookOpen,
  Award,
  Video,
  MonitorCheck
} from 'lucide-react';

const GOALS = [
  { id: 'career_transition', label: 'Career Transition', desc: 'Transitioning into software engineering, web development, or data roles.' },
  { id: 'skill_advancement', label: 'Skill Advancement', desc: 'Deepening advanced expertise in current stack (microservices, cloud, AI).' },
  { id: 'academic_exam_prep', label: 'Academic & Interview Prep', desc: 'Mastering data structures, algorithms, operating systems, and system design.' },
  { id: 'hobby_building', label: 'Building Practical Projects', desc: 'Shipping real applications, mobile apps, or creative web experiments.' },
  { id: 'certification', label: 'Cloud & Security Certification', desc: 'Preparing for industry exams like AWS Solutions Architect or security certs.' },
];

const AVAILABLE_TOPICS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Machine Learning',
  'Deep Learning', 'PyTorch', 'AWS', 'Docker', 'Kubernetes',
  'DevOps', 'Algorithms', 'Data Structures', 'System Design',
  'Cybersecurity', 'Ethical Hacking', 'UI/UX Design', 'Figma',
  'Flutter', 'iOS', 'Next.js', 'PostgreSQL', 'GraphQL', 'Go'
];

const SKILL_LEVELS = [
  { id: 'Beginner', title: 'Beginner', desc: 'New to coding or programming basics. Looking for structured fundamentals.' },
  { id: 'Intermediate', title: 'Intermediate', desc: 'Comfortable with core syntax. Ready for full-stack apps and architectural design.' },
  { id: 'Advanced', title: 'Advanced', desc: 'Experienced developer tackling distributed systems, performance, and deep learning.' },
  { id: 'All Levels', title: 'All Levels', desc: 'Open to comprehensive courses spanning basics to advanced implementations.' },
];

const FORMATS = [
  { id: 'Project-Based', title: 'Project-Based', desc: 'Hands-on projects with end-to-end coding.' },
  { id: 'Interactive Coding', title: 'Interactive Coding', desc: 'Step-by-step challenges and live problem solving.' },
  { id: 'Video Lectures', title: 'Video Lectures', desc: 'High-production visual conceptual walkthroughs.' },
  { id: 'Reading & Quizzes', title: 'Reading & Quizzes', desc: 'In-depth architectural text with knowledge checks.' },
  { id: 'Any', title: 'Any Format', desc: 'No strict format preference.' },
];

const STUDY_HOURS = [
  { hours: 3, label: '3 hrs / week', desc: 'Casual, relaxed pace for busy schedules' },
  { hours: 6, label: '6 hrs / week', desc: 'Steady, consistent weekend or evening pace' },
  { hours: 10, label: '10 hrs / week', desc: 'Dedicated learning track for fast progress' },
  { hours: 15, label: '15+ hrs / week', desc: 'Immersive bootcamp-style acceleration' },
];

const DURATIONS = [
  { id: 'Short (< 10 hrs)', title: 'Short (< 10 hours)', desc: 'Quick targeted sprint to master one specific concept.' },
  { id: 'Medium (10-30 hrs)', title: 'Medium (10-30 hours)', desc: 'Balanced comprehensive course with a capstone project.' },
  { id: 'Long (> 30 hrs)', title: 'Long (> 30 hours)', desc: 'In-depth masterclass covering an entire domain.' },
  { id: 'Any', title: 'Flexible / Any Duration', desc: 'Open to courses of all lengths.' },
];

export const OnboardingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, profile, refreshProfile, isAuthenticated, loginAsDemoStudent } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 6;

  // Form State
  const [learningGoal, setLearningGoal] = useState<string>('career_transition');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['React', 'TypeScript', 'Node.js']);
  const [skillLevel, setSkillLevel] = useState<string>('Intermediate');
  const [preferredFormat, setPreferredFormat] = useState<string>('Project-Based');
  const [weeklyStudyHours, setWeeklyStudyHours] = useState<number>(6);
  const [preferredDuration, setPreferredDuration] = useState<string>('Medium (10-30 hrs)');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load existing profile values if available
  useEffect(() => {
    if (profile) {
      if (profile.learning_goal) setLearningGoal(profile.learning_goal);
      if (profile.preferred_topics && profile.preferred_topics.length > 0) {
        setSelectedTopics(profile.preferred_topics);
      }
      if (profile.skill_level) setSkillLevel(profile.skill_level);
      if (profile.preferred_format) setPreferredFormat(profile.preferred_format);
      if (profile.weekly_study_hours) setWeeklyStudyHours(profile.weekly_study_hours);
      if (profile.preferred_duration) setPreferredDuration(profile.preferred_duration);
    }
  }, [profile]);

  const toggleTopic = (topic: string) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length > 1) {
        setSelectedTopics(selectedTopics.filter(t => t !== topic));
      }
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleNext = () => {
    if (currentStep === 2 && selectedTopics.length === 0) {
      setError('Please select at least 1 topic of interest.');
      return;
    }
    setError(null);
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSavePreferences();
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setError(null);

    try {
      if (!isAuthenticated) {
        // If student is not logged in, log in as demo student first
        await loginAsDemoStudent();
      }

      await api.updateProfile({
        learning_goal: learningGoal,
        preferred_topics: selectedTopics,
        skill_level: skillLevel as any,
        preferred_format: preferredFormat as any,
        weekly_study_hours: weeklyStudyHours,
        preferred_duration: preferredDuration as any,
      });

      await refreshProfile();
      navigate('/recommendations');
    } catch (err: any) {
      setError(err.message || 'Failed to save preferences.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Personalized Recommender Engine Setup</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Learning Assessment</h1>
          <p className="text-xs text-slate-500 mt-1">
            Step {currentStep} of {totalSteps}: Tailor your recommendation algorithm weights
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Wizard Card Container */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          {/* STEP 1: LEARNING GOAL */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">1. What is your primary learning goal?</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Helps our model weigh foundational vs capstone architecture courses (Weight: 30%).
                </p>
              </div>

              <div className="space-y-2.5">
                {GOALS.map((goal) => {
                  const isSelected = learningGoal === goal.id;
                  return (
                    <div
                      key={goal.id}
                      onClick={() => setLearningGoal(goal.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{goal.label}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{goal.desc}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-3 ${
                            isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 2: PREFERRED TOPICS */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">2. Which topics and skills interest you?</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Select at least 1 or more subjects for topic vector similarity matching (Weight: 30%).
                </p>
              </div>

              <div className="flex flex-wrap gap-2 pt-2">
                {AVAILABLE_TOPICS.map((topic) => {
                  const isSelected = selectedTopics.includes(topic);
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => toggleTopic(topic)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{topic}</span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 text-xs text-slate-400">
                Selected {selectedTopics.length} topics. The recommender evaluates mutual overlap with course catalogs.
              </div>
            </div>
          )}

          {/* STEP 3: SKILL LEVEL */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">3. What is your current skill level?</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adjusts course prerequisite rigor and challenge levels (Weight: 20%).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {SKILL_LEVELS.map((level) => {
                  const isSelected = skillLevel === level.id;
                  return (
                    <div
                      key={level.id}
                      onClick={() => setSkillLevel(level.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="text-sm font-bold text-slate-900">{level.title}</h4>
                          {isSelected && <Check className="w-4 h-4 text-indigo-600" />}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed">{level.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: PREFERRED FORMAT */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">4. Which learning format do you prefer?</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Matches your individual learning style (Weight: 10%).
                </p>
              </div>

              <div className="space-y-2.5">
                {FORMATS.map((fmt) => {
                  const isSelected = preferredFormat === fmt.id;
                  return (
                    <div
                      key={fmt.id}
                      onClick={() => setPreferredFormat(fmt.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{fmt.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{fmt.desc}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-3 ${
                            isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: WEEKLY STUDY TIME */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">5. How much time can you study each week?</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Used to estimate realistic completion pace and avoid burnout (Part of Duration factor: 10%).
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {STUDY_HOURS.map((sh) => {
                  const isSelected = weeklyStudyHours === sh.hours;
                  return (
                    <div
                      key={sh.hours}
                      onClick={() => setWeeklyStudyHours(sh.hours)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-900">{sh.label}</span>
                        {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                      </div>
                      <p className="text-xs text-slate-500">{sh.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: COURSE DURATION PREFERENCE */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">6. What is your preferred course duration?</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Final parameter for total course commitment weighting (Weight: 10%).
                </p>
              </div>

              <div className="space-y-2.5">
                {DURATIONS.map((dur) => {
                  const isSelected = preferredDuration === dur.id;
                  return (
                    <div
                      key={dur.id}
                      onClick={() => setPreferredDuration(dur.id)}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{dur.title}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{dur.desc}</p>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-3 ${
                            isSelected ? 'bg-indigo-600 text-white' : 'border border-slate-300'
                          }`}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* WIZARD ACTIONS */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : <div />}

            <button
              type="button"
              onClick={handleNext}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <span>Saving Preferences...</span>
              ) : currentStep === totalSteps ? (
                <>
                  <span>Save Preferences & View Matches</span>
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

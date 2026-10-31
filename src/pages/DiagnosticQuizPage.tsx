import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Compass,
  BookOpen,
  Target,
  Zap,
  TrendingUp,
  AlertCircle,
  Layers,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Sidebar } from '../components/Sidebar';
import {
  DIAGNOSTIC_QUESTIONS,
  evaluateQuiz,
  QuizEvaluationResult,
  PREDEFINED_LEARNING_PATHS
} from '../services/diagnosticQuiz';

export default function DiagnosticQuizPage() {
  const { user, refreshProfile } = useAuth();

  // Quiz state
  const [phase, setPhase] = useState<'intro' | 'quiz' | 'results'>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<QuizEvaluationResult | null>(null);

  // Results UI state
  const [filterReview, setFilterReview] = useState<'all' | 'correct' | 'incorrect'>('all');
  const [isApplyingProfile, setIsApplyingProfile] = useState<boolean>(false);
  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const totalQuestions = DIAGNOSTIC_QUESTIONS.length;
  const currentQuestion = DIAGNOSTIC_QUESTIONS[currentQuestionIndex];
  const answeredCount = Object.keys(userAnswers).length;

  const handleStartQuiz = () => {
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setQuizResult(null);
    setAppliedSuccess(false);
    setApplyError(null);
    setPhase('quiz');
  };

  const handleSelectOption = (optionIndex: number) => {
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = () => {
    const evaluation = evaluateQuiz(userAnswers, DIAGNOSTIC_QUESTIONS);
    setQuizResult(evaluation);
    setPhase('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleApplyToProfile = async () => {
    if (!quizResult || !user) return;
    setIsApplyingProfile(true);
    setApplyError(null);

    try {
      const updatedProfile = await api.updateProfile({
        skill_level: quizResult.overallSkillLevel,
        preferred_topics: quizResult.recommendedPath.focusTopics,
        learning_goal: quizResult.recommendedPath.suggestedGoal
      });

      await refreshProfile();
      setAppliedSuccess(true);
    } catch (err: any) {
      setApplyError(err?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsApplyingProfile(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row bg-slate-50 min-h-[calc(100vh-4rem)]">
      {user && <Sidebar />}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full space-y-8 pb-16">
        {/* Top Banner / Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl border border-blue-800">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-4 border border-blue-400/20">
            <Sparkles className="w-3.5 h-3.5" />
            Adaptive Knowledge Diagnostics
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Smart CS Knowledge & Learning Path Calibration
          </h1>
          <p className="text-blue-100/90 text-base sm:text-lg leading-relaxed">
            Take an interactive, multi-domain diagnostic assessment to gauge your real-world software
            engineering proficiency and receive an algorithmic roadmap mapped directly to our curriculum.
          </p>
        </div>
      </div>

      {/* PHASE 1: INTRO */}
      {phase === 'intro' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">How This Diagnostic Works</h2>
              <p className="text-slate-600 leading-relaxed">
                Rather than generic self-assessment checkboxes, this diagnostic evaluates core computational
                thinking, full-stack concepts, machine learning fundamentals, systems architecture, and defensive
                security.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 flex items-start gap-3">
                <div className="p-2 bg-blue-600 text-white rounded-xl mt-0.5">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">12 Vetted Questions</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Graduated difficulty from Beginner to Advanced, testing conceptual understanding and code patterns.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-start gap-3">
                <div className="p-2 bg-indigo-600 text-white rounded-xl mt-0.5">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">5 Technical Domains</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Web Architecture, AI & ML, CS Foundations & Algorithms, Cloud & DevOps, and Cybersecurity.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
                <div className="p-2 bg-emerald-600 text-white rounded-xl mt-0.5">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">Tailored Learning Path</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Directly maps your strengths and blindspots to one of 5 structured college learning tracks.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex items-start gap-3">
                <div className="p-2 bg-amber-600 text-white rounded-xl mt-0.5">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm">1-Click Profile Sync</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Instantly sync your diagnosed skill level and priority topics into your student profile.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                Diagnostic Recommendations & Guidelines
              </h4>
              <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
                <li>Estimated time: <strong>5 to 7 minutes</strong>.</li>
                <li>No penalty for guessing, but choosing your genuine best answer provides the most accurate roadmap calibration.</li>
                <li>You can navigate back and forth between questions before submitting.</li>
                <li>Detailed conceptual explanations are provided for every question in the results summary.</li>
              </ul>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={handleStartQuiz}
                className="w-full sm:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 cursor-pointer"
              >
                <span>Start Diagnostic Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <Link
                to="/explore"
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl text-center transition-colors"
              >
                Explore Courses Directly
              </Link>
            </div>
          </div>

          {/* Right sidebar: Target Career Tracks */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-blue-600" />
              Calibrated Learning Paths
            </h3>
            <p className="text-xs text-slate-500">
              Your results will align you with one of these comprehensive curriculum paths:
            </p>

            <div className="space-y-3">
              {PREDEFINED_LEARNING_PATHS.map((path) => (
                <div key={path.id} className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-blue-50/40 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm text-slate-900">{path.title}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                      {path.targetSkillLevel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">{path.tagline}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 2: ACTIVE QUIZ */}
      {phase === 'quiz' && (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Progress & Stats */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                {currentQuestionIndex + 1}/{totalQuestions}
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </div>
                <div className="text-sm font-bold text-slate-900">
                  {currentQuestion.domain} &bull; <span className="text-blue-600">{currentQuestion.concept}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="flex-1 sm:w-48 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">
                {answeredCount} Answered
              </span>
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                  Domain: {currentQuestion.domain}
                </span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    currentQuestion.difficulty === 'Beginner'
                      ? 'bg-emerald-100 text-emerald-700'
                      : currentQuestion.difficulty === 'Intermediate'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {currentQuestion.difficulty}
                </span>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                +{currentQuestion.points} pts
              </span>
            </div>

            {/* Question Text */}
            <div className="py-2">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
                {currentQuestion.question}
              </h3>
            </div>

            {/* Options */}
            <div className="space-y-3">
              {currentQuestion.options.map((option, idx) => {
                const isSelected = userAnswers[currentQuestion.id] === idx;
                const letter = String.fromCharCode(65 + idx);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-start gap-4 cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                      }`}
                    >
                      {letter}
                    </div>
                    <div className="flex-1 text-sm sm:text-base text-slate-800 leading-normal pt-1">
                      {option.text}
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentQuestionIndex === 0}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-3">
                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    Next Question
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    className="px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md shadow-emerald-500/25 flex items-center gap-2 transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Submit & Generate Path
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Jump Bar Navigation */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 mb-2">Question Quick Jump:</div>
            <div className="flex flex-wrap gap-2">
              {DIAGNOSTIC_QUESTIONS.map((q, idx) => {
                const isCurrent = idx === currentQuestionIndex;
                const isAnswered = userAnswers[q.id] !== undefined;

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQuestionIndex(idx)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                        : isAnswered
                        ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* PHASE 3: RESULTS & LEARNING PATH */}
      {phase === 'results' && quizResult && (
        <div className="space-y-8">
          {/* Top Score Banner */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
              <div className="text-center md:text-left md:border-r md:border-slate-100 md:pr-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Overall Score
                </span>
                <div className="text-4xl sm:text-5xl font-black text-slate-900 mt-1">
                  {quizResult.percentage}%
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  {quizResult.correctCount} of {quizResult.totalQuestions} questions correct ({quizResult.totalPointsEarned} / {quizResult.maxPoints} pts)
                </p>
              </div>

              <div className="text-center md:text-left md:border-r md:border-slate-100 md:pr-6">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Diagnosed Skill Level
                </span>
                <div className="mt-2">
                  <span
                    className={`inline-block px-4 py-1.5 rounded-full text-base font-extrabold ${
                      quizResult.overallSkillLevel === 'Advanced'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : quizResult.overallSkillLevel === 'Intermediate'
                        ? 'bg-blue-100 text-blue-800 border border-blue-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {quizResult.overallSkillLevel} Level
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Calibrated across algorithmic analysis, web patterns, and infrastructure
                </p>
              </div>

              <div className="md:col-span-2 space-y-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 block">
                  Identified Strengths & Growth Areas
                </span>
                <div className="flex flex-wrap gap-2">
                  {quizResult.strengths.map((s, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {s}
                    </span>
                  ))}
                  {quizResult.growthAreas.map((g, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                      Needs Focus: {g}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* HERO SPOTLIGHT: RECOMMENDED LEARNING PATH */}
          <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl border border-indigo-700 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/20 text-blue-200 text-xs font-semibold border border-blue-300/20">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  Algorithmically Recommended Roadmap
                </div>
                <span className="text-xs font-medium text-blue-200">
                  Target Proficiency: <strong className="text-white">{quizResult.recommendedPath.targetSkillLevel}</strong>
                </span>
              </div>

              <div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-2">
                  {quizResult.recommendedPath.title}
                </h2>
                <p className="text-blue-100 text-base leading-relaxed max-w-3xl">
                  {quizResult.recommendedPath.tagline}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Diagnostic Evaluation Rationale
                </div>
                <p className="text-sm text-slate-100 leading-relaxed">
                  {quizResult.recommendedPath.rationale}
                </p>
              </div>

              {/* Focus Topics */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                  Priority Curriculum Topics:
                </span>
                <div className="flex flex-wrap gap-2">
                  {quizResult.recommendedPath.focusTopics.map((topic, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-xl bg-white/15 text-white text-xs font-medium border border-white/10"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* 1-Click Profile Apply Action */}
              <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="font-semibold text-sm">
                    {appliedSuccess
                      ? '✓ Profile Calibrated Successfully'
                      : 'Sync This Path to Your Student Profile'}
                  </div>
                  <p className="text-xs text-blue-200">
                    Updates your skill level and focus topics to recalculate all recommendation match scores.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleApplyToProfile}
                  disabled={isApplyingProfile || appliedSuccess}
                  className={`px-6 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer ${
                    appliedSuccess
                      ? 'bg-emerald-500 text-white cursor-default'
                      : 'bg-white text-blue-950 hover:bg-blue-50 shadow-lg shadow-black/20 hover:scale-102 active:scale-98'
                  }`}
                >
                  {appliedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      Profile Synced!
                    </>
                  ) : isApplyingProfile ? (
                    <>
                      <div className="w-4 h-4 border-2 border-blue-900 border-t-transparent rounded-full animate-spin" />
                      Applying...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-500" />
                      Apply Diagnosed Level & Topics
                    </>
                  )}
                </button>
              </div>

              {applyError && (
                <div className="p-3 bg-red-500/20 border border-red-400/40 rounded-xl text-xs text-red-200">
                  {applyError}
                </div>
              )}
            </div>
          </div>

          {/* DOMAIN BREAKDOWN CARDS */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              Domain Proficiency Breakdown
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(quizResult.domainScores).map((dom) => (
                <div
                  key={dom.domain}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-slate-900">{dom.domain}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        dom.level === 'Advanced'
                          ? 'bg-purple-100 text-purple-700'
                          : dom.level === 'Intermediate'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {dom.level}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Proficiency</span>
                      <span className="font-bold text-slate-900">{dom.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          dom.percentage >= 75
                            ? 'bg-purple-600'
                            : dom.percentage >= 40
                            ? 'bg-blue-600'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${dom.percentage}%` }}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 flex justify-between pt-1 border-t border-slate-100">
                    <span>
                      {dom.correctQuestions} of {dom.totalQuestions} questions
                    </span>
                    <span>
                      {dom.pointsEarned} / {dom.totalPoints} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* DETAILED QUESTION REVIEW ACCORDION */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-blue-600" />
                  Pedagogical Question Review & Explanations
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Examine full computer science solutions and concept breakdowns for every question.
                </p>
              </div>

              {/* Review Filter */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFilterReview('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                    filterReview === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All ({quizResult.totalQuestions})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterReview('correct')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                    filterReview === 'correct'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Correct ({quizResult.correctCount})
                </button>
                <button
                  type="button"
                  onClick={() => setFilterReview('incorrect')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer ${
                    filterReview === 'incorrect'
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Needs Review ({quizResult.totalQuestions - quizResult.correctCount})
                </button>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-4">
              {quizResult.detailedReview
                .filter((item) => {
                  if (filterReview === 'correct') return item.isCorrect;
                  if (filterReview === 'incorrect') return !item.isCorrect;
                  return true;
                })
                .map((item, idx) => (
                  <div
                    key={item.questionId}
                    className={`p-5 rounded-2xl border transition-all ${
                      item.isCorrect
                        ? 'border-emerald-100 bg-emerald-50/30'
                        : 'border-red-100 bg-red-50/20'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        {item.isCorrect ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                        )}
                        <span className="font-bold text-sm text-slate-900">
                          {item.domain} &bull; {item.concept}
                        </span>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                        {item.difficulty}
                      </span>
                    </div>

                    <p className="text-sm text-slate-800 font-medium my-2 pl-7">
                      {item.question}
                    </p>

                    <div className="pl-7 space-y-2 mt-3 text-xs">
                      <div className="flex items-start gap-2">
                        <strong className="text-slate-600 w-28 shrink-0">Your Answer:</strong>
                        <span
                          className={
                            item.isCorrect
                              ? 'text-emerald-800 font-semibold'
                              : 'text-red-700 font-semibold'
                          }
                        >
                          {item.userAnswerText}
                        </span>
                      </div>

                      {!item.isCorrect && (
                        <div className="flex items-start gap-2">
                          <strong className="text-slate-600 w-28 shrink-0">Correct Answer:</strong>
                          <span className="text-slate-900 font-semibold">
                            {item.correctAnswerText}
                          </span>
                        </div>
                      )}

                      <div className="mt-2 p-3 bg-white rounded-xl border border-slate-200 text-slate-600 leading-relaxed">
                        <strong className="text-slate-800 block mb-1">Concept Rationale:</strong>
                        {item.explanation}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Navigation Footer */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
            <button
              type="button"
              onClick={handleStartQuiz}
              className="px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Retake Assessment
            </button>

            <div className="flex items-center gap-3">
              <Link
                to="/recommendations"
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-2xl shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <span>View Recommended Courses</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/explore"
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-2xl transition-colors"
              >
                Explore All Courses
              </Link>
            </div>
          </div>
        </div>
      )}
      </main>
    </div>
  );
}

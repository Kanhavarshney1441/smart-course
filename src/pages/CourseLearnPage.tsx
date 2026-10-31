import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import {
  Course,
  Lesson,
  CourseCurriculum,
  LearningResource,
  ModuleAssessment,
  CourseRoadmap
} from '../types';
import { useAuth } from '../context/AuthContext';
import { getLessonDetails, LessonContentDetails } from '../services/courseContent';
import { AiTutorDrawer } from '../components/AiTutorDrawer';
import { PersonalNotesSection } from '../components/PersonalNotesSection';
import {
  Play,
  Pause,
  CheckCircle2,
  Circle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Code2,
  HelpCircle,
  FolderDown,
  Award,
  Sparkles,
  ChevronRight,
  Maximize2,
  Volume2,
  Settings,
  Copy,
  Check,
  RotateCcw,
  ExternalLink,
  Clock,
  Layers,
  GraduationCap,
  X,
  BrainCircuit,
  FileText,
  Calendar,
  CheckSquare,
  AlertTriangle,
  Flame,
  Send,
  Video,
  Eye,
  Sliders
} from 'lucide-react';

export default function CourseLearnPage() {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [curriculum, setCurriculum] = useState<CourseCurriculum | null>(null);
  const [resources, setResources] = useState<LearningResource[]>([]);
  const [roadmap, setRoadmap] = useState<CourseRoadmap | null>(null);
  const [assessment, setAssessment] = useState<ModuleAssessment | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [activeLessonIndex, setActiveLessonIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<
    'notes' | 'sandbox' | 'assessment' | 'resources' | 'my_notes' | 'roadmap' | 'projects'
  >('notes');

  // Adaptive Skill Level State (Beginner, Intermediate, Advanced)
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  // AI Tutor Drawer State
  const [isTutorOpen, setIsTutorOpen] = useState<boolean>(false);

  // Video player simulation state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [playedSeconds, setPlayedSeconds] = useState<number>(145);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [sandboxCode, setSandboxCode] = useState<string>('');
  const [sandboxOutput, setSandboxOutput] = useState<string | null>(null);
  const [isRunningCode, setIsRunningCode] = useState<boolean>(false);

  // Module Assessment State
  const [selectedAssessmentAnswers, setSelectedAssessmentAnswers] = useState<Record<number, number>>({});
  const [assessmentResult, setAssessmentResult] = useState<any | null>(null);
  const [isSubmittingAssessment, setIsSubmittingAssessment] = useState<boolean>(false);

  // Watched videos tracking
  const [watchedResources, setWatchedResources] = useState<Record<number, boolean>>({});

  // Study hours customization
  const [customStudyHours, setCustomStudyHours] = useState<number>(6);

  // Completion & Notification
  const [actionNotification, setActionNotification] = useState<string | null>(null);
  const [showCertificateModal, setShowCertificateModal] = useState<boolean>(false);

  // Fetch course and full curriculum data
  const fetchCourseData = async () => {
    if (!id) return;
    try {
      const courseId = parseInt(id, 10);
      const [courseRes, currRes, resRes, roadRes, assessRes] = await Promise.all([
        api.getCourse(courseId),
        api.getCurriculum(courseId).catch(() => null),
        api.getCuratedResources(courseId).catch(() => null),
        api.getRoadmap(courseId).catch(() => null),
        api.getModuleAssessment(courseId, 1).catch(() => null),
      ]);

      setCourse(courseRes.course);
      if (currRes?.curriculum) setCurriculum(currRes.curriculum);
      if (resRes?.resources) setResources(resRes.resources);
      if (roadRes?.roadmap) {
        setRoadmap(roadRes.roadmap);
        setCustomStudyHours(roadRes.weekly_study_hours || 6);
      }
      if (assessRes?.assessment) setAssessment(assessRes.assessment);

      // Handle query param ?lesson=ID
      const lessonQuery = searchParams.get('lesson');
      if (lessonQuery && courseRes.course.lessons) {
        const foundIdx = courseRes.course.lessons.findIndex(l => l.id === parseInt(lessonQuery, 10));
        if (foundIdx !== -1) {
          setActiveLessonIndex(foundIdx);
        }
      }
    } catch (err) {
      console.error('Error loading course:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  // Video playback timer simulation
  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
        setPlayedSeconds(prev => prev + 1);
      }, 1000 / playbackSpeed);
    }
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Loading AI-Powered Learning Classroom...</p>
        </div>
      </div>
    );
  }

  if (!course || !course.lessons || course.lessons.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center max-w-md shadow-sm space-y-4">
          <GraduationCap className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Course Not Found</h2>
          <p className="text-xs text-slate-500">The requested course could not be loaded or has no lessons yet.</p>
          <Link
            to="/my-learning"
            className="inline-block px-5 py-2.5 bg-blue-600 text-white font-semibold text-xs rounded-xl"
          >
            Back to My Learning
          </Link>
        </div>
      </div>
    );
  }

  const activeLesson: Lesson = course.lessons[activeLessonIndex] || course.lessons[0];
  const totalLessons = course.lessons.length;
  const completedLessonsCount = course.lessons.filter(l => l.completed).length;
  const progressPercent = Math.round((completedLessonsCount / totalLessons) * 100);
  const isCourseFullyCompleted = progressPercent >= 100;

  // Retrieve rich real content for active lesson
  const lessonDetails: LessonContentDetails = getLessonDetails(
    course.slug,
    activeLesson.title,
    course.title,
    course.category,
    course.difficulty
  );

  const handleSelectLesson = (idx: number) => {
    setActiveLessonIndex(idx);
    setPlayedSeconds(0);
    setIsPlaying(false);
    setSandboxOutput(null);
    setSearchParams({ lesson: course.lessons![idx].id.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleComplete = async (lessonId: number) => {
    try {
      const res = await api.completeLesson(lessonId);
      setActionNotification(res.message);
      await fetchCourseData();
      if (res.course_status === 'completed') {
        setShowCertificateModal(true);
      }
      setTimeout(() => setActionNotification(null), 3000);
    } catch (err) {
      console.error('Error toggling lesson completion:', err);
    }
  };

  const handleCompleteAndNext = async () => {
    if (!activeLesson.completed) {
      await handleToggleComplete(activeLesson.id);
    }
    if (activeLessonIndex < totalLessons - 1) {
      handleSelectLesson(activeLessonIndex + 1);
    } else {
      setShowCertificateModal(true);
    }
  };

  const handleRunCode = () => {
    setIsRunningCode(true);
    setSandboxOutput(null);
    setTimeout(() => {
      setIsRunningCode(false);
      setSandboxOutput(
        lessonDetails.codeSnippet?.expectedOutput ||
        `=== Execution Result ===\n[Success] Processed in 12ms.\nOutput matches expected test suite.`
      );
    }, 600);
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleAssessmentAnswerSelect = (questionId: number, optionIdx: number) => {
    setSelectedAssessmentAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleSubmitAssessment = async () => {
    if (!assessment) return;
    setIsSubmittingAssessment(true);
    try {
      const res = await api.submitAssessment({
        course_id: course.id,
        module_number: assessment.id,
        answers: selectedAssessmentAnswers
      });
      setAssessmentResult(res);
      setActionNotification(res.message);
      setTimeout(() => setActionNotification(null), 4000);
    } catch (err) {
      console.error('Assessment submit error:', err);
    } finally {
      setIsSubmittingAssessment(false);
    }
  };

  const handleRetryAssessment = () => {
    setSelectedAssessmentAnswers({});
    setAssessmentResult(null);
  };

  const handleToggleRoadmapDay = async (dayNumber: number) => {
    try {
      const res = await api.toggleRoadmapDay(course.id, dayNumber);
      setRoadmap(res.roadmap);
    } catch (err) {
      console.error('Toggle roadmap day error:', err);
    }
  };

  const handleUpdateStudyPace = async (hours: number) => {
    setCustomStudyHours(hours);
    try {
      const res = await api.updateRoadmapStudyHours(course.id, hours);
      setRoadmap(res.roadmap);
      setActionNotification('Study schedule and roadmap updated!');
      setTimeout(() => setActionNotification(null), 3000);
    } catch (err) {
      console.error('Update study pace error:', err);
    }
  };

  const handleToggleWatchResource = (resId: number) => {
    setWatchedResources(prev => ({
      ...prev,
      [resId]: !prev[resId]
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Action Notification Toast */}
      {actionNotification && (
        <div className="fixed top-5 right-5 z-50 bg-blue-600 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{actionNotification}</span>
        </div>
      )}

      {/* Classroom Top Header */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link
            to="/my-learning"
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-2 text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">My Learning</span>
          </Link>
          <div className="h-5 w-px bg-slate-800 hidden sm:block" />
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
              {course.title}
            </h1>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              Module {activeLessonIndex + 1} of {totalLessons}: {activeLesson.title}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress Indicator */}
          <div className="hidden md:flex items-center gap-3 bg-slate-800/80 px-3.5 py-1.5 rounded-full border border-slate-700">
            <span className="text-xs text-slate-300 font-medium">
              Progress: <strong className="text-white">{progressPercent}%</strong>
            </span>
            <div className="w-24 bg-slate-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[11px] text-slate-400">
              ({completedLessonsCount}/{totalLessons})
            </span>
          </div>

          {/* AI Tutor Toggle Button */}
          <button
            onClick={() => setIsTutorOpen(prev => !prev)}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>AI Tutor</span>
          </button>

          {/* Certificate Action */}
          {isCourseFullyCompleted && (
            <button
              onClick={() => setShowCertificateModal(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-extrabold text-xs rounded-xl shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-slate-950" />
              <span>Certificate Ready</span>
            </button>
          )}

          <Link
            to={`/courses/${course.id}`}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium rounded-xl transition-colors"
          >
            Overview
          </Link>
        </div>
      </header>

      {/* Main Classroom Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* Left / Center Stage */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* 1. Real Lecture Media Theater */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-2xl relative">
            <div className="aspect-video bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950/60 relative flex flex-col justify-between p-6 overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                <div className="w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
              </div>

              {/* Top Video Overlay */}
              <div className="relative z-10 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold text-[11px]">
                    HD Lecture {activeLessonIndex + 1}
                  </span>
                  <span className="hidden sm:inline text-slate-300 font-medium">
                    {course.category} &bull; {course.instructor}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-400">
                    Duration: {activeLesson.duration_minutes} mins
                  </span>
                </div>
              </div>

              {/* Center Lecture Visual Title */}
              <div className="relative z-10 my-auto text-center max-w-xl mx-auto space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-medium">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Module {activeLessonIndex + 1}: Practical Masterclass</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                  {activeLesson.title}
                </h2>
                <p className="text-xs text-slate-300 line-clamp-2">
                  {activeLesson.description}
                </p>
              </div>

              {/* Player Controls Bar */}
              <div className="relative z-10 bg-slate-950/80 backdrop-blur-md rounded-2xl p-3 border border-slate-800 flex flex-col gap-2">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden cursor-pointer">
                  <div
                    className="bg-blue-500 h-full transition-all duration-200"
                    style={{ width: `${Math.min(100, (playedSeconds / (activeLesson.duration_minutes * 60)) * 100)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                    </button>
                    <span className="text-slate-400 font-mono text-[11px]">
                      {Math.floor(playedSeconds / 60)}:{(playedSeconds % 60).toString().padStart(2, '0')} / {activeLesson.duration_minutes}:00
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 text-[11px] text-slate-300">
                      <span>Speed:</span>
                      <select
                        value={playbackSpeed}
                        onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                        className="bg-transparent text-white outline-none cursor-pointer"
                      >
                        <option value="0.75" className="bg-slate-900">0.75x</option>
                        <option value="1.0" className="bg-slate-900">1.0x</option>
                        <option value="1.25" className="bg-slate-900">1.25x</option>
                        <option value="1.5" className="bg-slate-900">1.5x</option>
                        <option value="2.0" className="bg-slate-900">2.0x</option>
                      </select>
                    </div>

                    <Volume2 className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                    <Maximize2 className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Completion / Navigation Bar */}
            <div className="bg-slate-900 border-t border-slate-800 p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleToggleComplete(activeLesson.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                    activeLesson.completed
                      ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <CheckCircle2 className={`w-4 h-4 ${activeLesson.completed ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{activeLesson.completed ? 'Lesson Completed' : 'Mark Lesson as Complete'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={activeLessonIndex === 0}
                  onClick={() => handleSelectLesson(activeLessonIndex - 1)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleCompleteAndNext}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                >
                  <span>{activeLessonIndex === totalLessons - 1 ? 'Finish Course' : 'Complete & Next'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 2. Multi-Tab AI Learning Workspace */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-800 px-4 pt-3 gap-2 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab('notes')}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
                  activeTab === 'notes'
                    ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Lecture Notes</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sandbox')}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
                  activeTab === 'sandbox'
                    ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <Code2 className="w-4 h-4" />
                <span>Code Sandbox</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('assessment')}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
                  activeTab === 'assessment'
                    ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                <span>Module Assessment</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('resources')}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
                  activeTab === 'resources'
                    ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <FolderDown className="w-4 h-4" />
                <span>Recommended Resources</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('my_notes')}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
                  activeTab === 'my_notes'
                    ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>My Notes & Revision</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('roadmap')}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
                  activeTab === 'roadmap'
                    ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Roadmap</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('projects')}
                className={`px-3.5 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 transition-all border-b-2 cursor-pointer ${
                  activeTab === 'projects'
                    ? 'border-blue-500 text-blue-400 bg-slate-800/60'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Capstone Project</span>
              </button>
            </div>

            {/* TAB 1: LECTURE NOTES & ADAPTIVE CONTENT */}
            {activeTab === 'notes' && (
              <div className="p-6 sm:p-8 space-y-8">
                {/* Skill Level Adaptive Switch */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <div>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      Adaptive Difficulty Level
                    </span>
                    <span className="text-xs text-slate-300">
                      Explanations adapt to your current knowledge level:
                    </span>
                  </div>
                  <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 self-start">
                    {(['Beginner', 'Intermediate', 'Advanced'] as const).map(level => (
                      <button
                        key={level}
                        onClick={() => setSkillLevel(level)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                          skillLevel === level
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Beginner Definition Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-800/40 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Plain English Definition ({skillLevel} Mode)
                  </span>
                  <p className="text-sm text-blue-100/90 leading-relaxed">
                    {skillLevel === 'Beginner'
                      ? `In simple terms, ${activeLesson.title} is like a fundamental recipe in ${course.category} that allows your program to make decisions, remember information, or execute tasks without repeating code.`
                      : skillLevel === 'Advanced'
                      ? `${activeLesson.title} represents an architectural abstraction in ${course.category} focused on minimizing algorithmic complexity, decoupling responsibilities, and ensuring deterministic runtime execution under heavy loads.`
                      : `${activeLesson.title} is a core mechanism in ${course.category} designed to structure logic cleanly, manage state transitions, and build modular, testable software.`}
                  </p>
                </div>

                {/* Key Takeaways Card */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    Key Takeaways Checklist
                  </h3>
                  <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                    {lessonDetails.keyTakeaways.map((takeaway, i) => (
                      <li key={i}>{takeaway}</li>
                    ))}
                  </ul>
                </div>

                {/* Structured Notes Sections */}
                <div className="space-y-6">
                  {lessonDetails.lectureNotes.map((section, idx) => (
                    <div key={idx} className="space-y-3 border-b border-slate-800/80 pb-6 last:border-b-0">
                      <h3 className="text-base sm:text-lg font-bold text-white">
                        {section.heading}
                      </h3>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {section.body}
                      </p>

                      {section.codeBlock && (
                        <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden font-mono text-xs">
                          <div className="bg-slate-900/90 px-4 py-2 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                            <span>Code Walkthrough</span>
                            <button
                              onClick={() => handleCopyCode(section.codeBlock!)}
                              className="text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              Copy
                            </button>
                          </div>
                          <pre className="p-4 overflow-x-auto text-emerald-300 leading-normal">
                            <code>{section.codeBlock}</code>
                          </pre>
                        </div>
                      )}

                      {section.tips && section.tips.length > 0 && (
                        <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700/50 space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                            Pro Tips & Edge Cases:
                          </span>
                          <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
                            {section.tips.map((tip, tIdx) => (
                              <li key={tIdx}>{tip}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Common Mistakes & Anti-Patterns */}
                <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-900/40 space-y-3">
                  <h4 className="text-xs font-bold text-rose-300 flex items-center gap-2 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    Common Pitfalls & How to Avoid Them
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-rose-950">
                      <strong className="text-rose-400 text-xs block mb-1">Mistake: Mutating State Directly</strong>
                      <p className="text-[11px] text-slate-400">Always create immutable copies to avoid broken re-renders and subtle multi-threaded race conditions.</p>
                    </div>
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-rose-950">
                      <strong className="text-rose-400 text-xs block mb-1">Mistake: Missing Error Handling</strong>
                      <p className="text-[11px] text-slate-400">Catch specific errors and return safe fallback states instead of letting the application crash silently.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: INTERACTIVE CODE SANDBOX */}
            {activeTab === 'sandbox' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Code2 className="w-5 h-5 text-blue-400" />
                      <span>{lessonDetails.codeSnippet?.filename || 'solution.ts'}</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Language: {lessonDetails.codeSnippet?.language || 'typescript'} &bull; In-browser interactive sandbox
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleCopyCode(sandboxCode || lessonDetails.codeSnippet?.code || '')}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied' : 'Copy Code'}</span>
                    </button>

                    <button
                      type="button"
                      disabled={isRunningCode}
                      onClick={handleRunCode}
                      className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{isRunningCode ? 'Running...' : 'Run Snippet'}</span>
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-800 overflow-hidden bg-slate-950 font-mono text-xs">
                  <div className="bg-slate-900 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                      <span className="ml-2">Editor (Editable code)</span>
                    </div>
                  </div>
                  <textarea
                    rows={12}
                    value={sandboxCode || lessonDetails.codeSnippet?.code || ''}
                    onChange={(e) => setSandboxCode(e.target.value)}
                    className="w-full bg-transparent p-4 text-emerald-300 font-mono text-xs outline-none resize-none leading-relaxed"
                  />
                </div>

                {sandboxOutput && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2 font-mono text-xs">
                    <span className="text-[11px] text-slate-400 font-bold block">Console Output:</span>
                    <pre className="text-blue-300 whitespace-pre-wrap">{sandboxOutput}</pre>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: MODULE ASSESSMENT */}
            {activeTab === 'assessment' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                      Module Assessment & Knowledge Check
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1">
                      {assessment?.title || 'Interactive Diagnostic Assessment'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Passing Score: {assessment?.passing_score || 75}% &bull; Instant auto-grading with thorough rationale.
                    </p>
                  </div>

                  {assessmentResult && (
                    <div className={`px-4 py-2 rounded-2xl border font-bold text-xs flex items-center gap-2 ${
                      assessmentResult.passed
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}>
                      <span>Score: {assessmentResult.score}%</span>
                      <span>({assessmentResult.passed ? 'Passed 🎉' : 'Needs Review'})</span>
                    </div>
                  )}
                </div>

                {/* Questions List */}
                <div className="space-y-6">
                  {(assessment?.questions || []).map((q, qIdx) => {
                    const resultItem = assessmentResult?.feedback?.find((f: any) => f.questionId === q.id);
                    const selectedOpt = selectedAssessmentAnswers[q.id];

                    return (
                      <div
                        key={q.id}
                        className={`p-5 rounded-2xl border transition-all ${
                          resultItem
                            ? resultItem.isCorrect
                              ? 'bg-emerald-950/20 border-emerald-800/40'
                              : 'bg-rose-950/20 border-rose-800/40'
                            : 'bg-slate-950/60 border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <h4 className="text-sm font-semibold text-white">
                            {qIdx + 1}. {q.question}
                          </h4>
                          {resultItem && (
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              resultItem.isCorrect ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {resultItem.isCorrect ? 'Correct +1' : 'Incorrect'}
                            </span>
                          )}
                        </div>

                        {q.codeSnippet && (
                          <pre className="p-3 mb-4 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-amber-300 overflow-x-auto">
                            <code>{q.codeSnippet}</code>
                          </pre>
                        )}

                        <div className="space-y-2">
                          {q.options.map((opt, optIdx) => {
                            const isSelected = selectedOpt === optIdx;
                            const isCorrectAnswer = resultItem && resultItem.correctAnswer === optIdx;

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                disabled={Boolean(assessmentResult)}
                                onClick={() => handleAssessmentAnswerSelect(q.id, optIdx)}
                                className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between cursor-pointer ${
                                  isCorrectAnswer
                                    ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-200 font-semibold'
                                    : isSelected
                                    ? resultItem && !resultItem.isCorrect
                                      ? 'bg-rose-500/20 border-rose-500/60 text-rose-200'
                                      : 'bg-blue-600/20 border-blue-500 text-blue-200 font-medium'
                                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                                }`}
                              >
                                <span>{opt}</span>
                                {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                              </button>
                            );
                          })}
                        </div>

                        {/* Rationale Explanation */}
                        {resultItem && (
                          <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300">
                            <strong className="text-blue-400 block mb-1">Explanation:</strong>
                            {resultItem.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Submit / Retry Actions */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  {!assessmentResult ? (
                    <button
                      onClick={handleSubmitAssessment}
                      disabled={isSubmittingAssessment || Object.keys(selectedAssessmentAnswers).length === 0}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                    >
                      <span>Submit for Automatic Grading</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      onClick={handleRetryAssessment}
                      className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl transition-all cursor-pointer flex items-center gap-2"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Retry Assessment Questions</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* TAB 4: RECOMMENDED RESOURCES & VIDEOS */}
            {activeTab === 'resources' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FolderDown className="w-5 h-5 text-blue-400" />
                    <span>Curated External Learning Resources</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Official documentation, free reputable courses, and verified video lectures.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources.map((res) => {
                    const isWatched = watchedResources[res.id];
                    return (
                      <div
                        key={res.id}
                        className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between hover:border-slate-700 transition-all space-y-3"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {res.resource_type}
                            </span>
                            <span className="text-[11px] text-slate-400">{res.duration_or_pages}</span>
                          </div>

                          <h4 className="text-sm font-bold text-white mb-1.5">{res.title}</h4>
                          <p className="text-xs text-slate-400">
                            Provider: <strong className="text-slate-300">{res.provider}</strong> &bull; Level: {res.difficulty}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
                          <button
                            type="button"
                            onClick={() => handleToggleWatchResource(res.id)}
                            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                              isWatched
                                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                                : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>{isWatched ? 'Completed' : 'Mark as Watched'}</span>
                          </button>

                          <a
                            href={res.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                          >
                            <span>Open Resource</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: PERSONAL NOTES & REVISION */}
            {activeTab === 'my_notes' && (
              <PersonalNotesSection
                courseId={course.id}
                courseTitle={course.title}
                lessonId={activeLesson.id}
                lessonTitle={activeLesson.title}
              />
            )}

            {/* TAB 6: PERSONALIZED ROADMAP */}
            {activeTab === 'roadmap' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-400" />
                      <span>Adaptive Day-by-Day Study Roadmap</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Target duration: {roadmap?.total_weeks || 4} weeks &bull; {roadmap?.daily_study_mins || 45} mins per study day
                    </p>
                  </div>

                  {/* Study Pace Selector */}
                  <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
                    <Sliders className="w-3.5 h-3.5 text-slate-400 ml-2" />
                    <span className="text-xs text-slate-300 font-medium">Study Pace:</span>
                    <select
                      value={customStudyHours}
                      onChange={(e) => handleUpdateStudyPace(parseInt(e.target.value, 10))}
                      className="bg-slate-900 text-white text-xs px-2.5 py-1 rounded-lg border border-slate-700 outline-none cursor-pointer"
                    >
                      <option value="4">4 hrs/wk (Relaxed)</option>
                      <option value="6">6 hrs/wk (Balanced)</option>
                      <option value="10">10 hrs/wk (Accelerated)</option>
                      <option value="15">15 hrs/wk (Intensive)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {(roadmap?.days || []).map((day) => (
                    <div
                      key={day.day_number}
                      className={`p-4 rounded-2xl border flex items-center justify-between transition-colors ${
                        day.completed
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-slate-400'
                          : 'bg-slate-950/60 border-slate-800 text-white'
                      }`}
                    >
                      <div
                        onClick={() => handleToggleRoadmapDay(day.day_number)}
                        className="flex items-center gap-3 cursor-pointer flex-1"
                      >
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-colors ${
                          day.completed ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-600 bg-slate-900'
                        }`}>
                          {day.completed && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-800 text-blue-300 border border-slate-700">
                              Week {day.week_number} &bull; Day {day.day_number}
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400 uppercase">
                              [{day.task_type}]
                            </span>
                          </div>
                          <h4 className={`text-xs font-bold mt-1 ${day.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                            {day.title}
                          </h4>
                          <p className="text-[11px] text-slate-400">
                            {day.description} (~{day.estimated_minutes} mins)
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 7: MINI-PROJECTS & CAPSTONE */}
            {activeTab === 'projects' && (
              <div className="p-6 sm:p-8 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="w-5 h-5 text-indigo-400" />
                    <span>Capstone Project & Milestone Specs</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Build and submit your production-grade portfolio capstone project.
                  </p>
                </div>

                {curriculum?.capstone_project && (
                  <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-950 border border-indigo-800/40 space-y-5">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-300 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                        Final Capstone Project
                      </span>
                      <h4 className="text-xl font-extrabold text-white mt-2">
                        {curriculum.capstone_project.title}
                      </h4>
                      <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                        {curriculum.capstone_project.problem_statement}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
                        <strong className="text-xs font-bold text-blue-400 uppercase tracking-wider block">
                          Key Requirements & Deliverables:
                        </strong>
                        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                          {curriculum.capstone_project.key_features.map((feat, i) => (
                            <li key={i}>{feat}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
                        <strong className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">
                          Evaluation Criteria Checklist:
                        </strong>
                        <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
                          {curriculum.capstone_project.evaluation_criteria.map((crit, i) => (
                            <li key={i}>{crit}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>

        {/* Right Sidebar: Structured Curriculum Navigator */}
        <aside className="w-full lg:w-96 bg-slate-900 border-l border-slate-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-slate-800 bg-slate-950/40">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Curriculum Syllabus</span>
              <span className="text-slate-400 font-mono text-[11px]">
                {completedLessonsCount}/{totalLessons} Done
              </span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {course.lessons.map((lesson, idx) => {
              const isActive = idx === activeLessonIndex;
              const isCompleted = lesson.completed;

              return (
                <div
                  key={lesson.id}
                  onClick={() => handleSelectLesson(idx)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isActive
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10'
                      : isCompleted
                      ? 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleComplete(lesson.id);
                      }}
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                        isCompleted
                          ? 'bg-emerald-500 text-slate-950'
                          : 'border border-slate-600 bg-slate-900 hover:border-emerald-500 text-transparent'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    <div>
                      <h4 className={`text-xs font-semibold line-clamp-1 ${isActive ? 'text-blue-300' : ''}`}>
                        {idx + 1}. {lesson.title}
                      </h4>
                      <span className="text-[10px] text-slate-500">
                        {lesson.duration_minutes} mins
                      </span>
                    </div>
                  </div>

                  {isActive && <ChevronRight className="w-4 h-4 text-blue-400" />}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Floating AI Tutor FAB Button */}
        <button
          onClick={() => setIsTutorOpen(true)}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs rounded-2xl shadow-2xl flex items-center gap-2 transform hover:scale-105 transition-all cursor-pointer"
        >
          <BrainCircuit className="w-4 h-4" />
          <span>Ask AI Tutor</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        {/* Slide-in AI Tutor Drawer */}
        <AiTutorDrawer
          isOpen={isTutorOpen}
          onClose={() => setIsTutorOpen(false)}
          courseId={course.id}
          courseTitle={course.title}
          lessonId={activeLesson.id}
          lessonTitle={activeLesson.title}
          activeCodeSnippet={lessonDetails.codeSnippet?.code}
        />
      </div>

      {/* Certificate Modal */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 sm:p-8 text-center space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowCertificateModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                Official Completion Certificate
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                Congratulations, {user?.full_name || 'Student'}!
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                You have successfully completed 100% of all required modules, code sandboxes, and milestone assessments for <strong>{course.title}</strong>.
              </p>
            </div>

            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-mono text-slate-300">
              Certificate ID: CERT-EP-{course.id}-{Date.now().toString().slice(-6)}
            </div>

            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Download / Print Certificate
              </button>
              <button
                onClick={() => setShowCertificateModal(false)}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

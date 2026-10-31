import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StudentNote } from '../types';
import {
  FileText,
  Save,
  Download,
  Bookmark,
  Trash2,
  Tag,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  BookOpen
} from 'lucide-react';

interface PersonalNotesSectionProps {
  courseId: number;
  courseTitle: string;
  lessonId: number;
  lessonTitle: string;
}

export const PersonalNotesSection: React.FC<PersonalNotesSectionProps> = ({
  courseId,
  courseTitle,
  lessonId,
  lessonTitle,
}) => {
  const [notes, setNotes] = useState<StudentNote[]>([]);
  const [currentNoteTitle, setCurrentNoteTitle] = useState('');
  const [currentNoteText, setCurrentNoteText] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load existing notes and bookmark status
  const fetchNotesAndBookmarks = async () => {
    try {
      const [notesRes, bookmarkRes] = await Promise.all([
        api.getStudentNotes(courseId),
        api.getBookmarks(courseId),
      ]);
      setNotes(notesRes.notes || []);

      const isCurrentBookmarked = bookmarkRes.bookmarked_lesson_ids?.includes(lessonId) || false;
      setIsBookmarked(isCurrentBookmarked);

      // Check if note exists for current lesson
      const existing = notesRes.notes?.find(n => n.lesson_id === lessonId);
      if (existing) {
        setCurrentNoteTitle(existing.title);
        setCurrentNoteText(existing.content);
        setTagsInput(existing.tags.join(', '));
      } else {
        setCurrentNoteTitle(`${lessonTitle} - Key Insights`);
        setCurrentNoteText('');
        setTagsInput('');
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotesAndBookmarks();
  }, [courseId, lessonId]);

  const handleSaveNote = async () => {
    if (!currentNoteText.trim()) return;
    try {
      const tags = tagsInput
        .split(',')
        .map(t => t.trim())
        .filter(Boolean);

      await api.saveStudentNote({
        course_id: courseId,
        lesson_id: lessonId,
        title: currentNoteTitle.trim() || `${lessonTitle} Notes`,
        content: currentNoteText,
        tags,
      });

      setStatusMessage('Note saved to your student profile.');
      await fetchNotesAndBookmarks();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('Error saving note:', err);
    }
  };

  const handleDeleteNote = async (noteId: number) => {
    try {
      await api.deleteStudentNote(noteId);
      setStatusMessage('Note deleted.');
      await fetchNotesAndBookmarks();
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting note:', err);
    }
  };

  const handleToggleBookmark = async () => {
    try {
      const res = await api.toggleBookmark(courseId, lessonId);
      setIsBookmarked(res.bookmarked);
      setStatusMessage(res.message);
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const handleExportMarkdown = () => {
    const markdownContent = `# ${courseTitle} - Student Study Notes
Generated: ${new Date().toLocaleDateString()}

## Current Lesson: ${lessonTitle}
**Bookmark Status**: ${isBookmarked ? 'Bookmarked for Review' : 'Standard'}

### My Lesson Notes:
${currentNoteText || '(No notes entered for this lesson yet)'}

---
### All Course Notes (${notes.length} total):
${notes.map(n => `#### ${n.title} (Lesson: ${n.lesson_title || 'General'})\n*Updated: ${n.updated_at}*\n*Tags: ${n.tags.join(', ') || 'None'}*\n\n${n.content}\n`).join('\n---\n')}
`;

    const blob = new Blob([markdownContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${courseTitle.replace(/[^a-z0-9]/gi, '_')}_notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrintNotes = () => {
    window.print();
  };

  return (
    <div className="p-6 sm:p-8 space-y-8">
      {statusMessage && (
        <div className="p-3 bg-blue-600/20 border border-blue-500/40 text-blue-300 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Personal Study Journal</span>
            <span className="text-xs text-slate-500">&bull;</span>
            <span className="text-xs text-slate-400">{lessonTitle}</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1">Lesson Notes & Quick Revision</h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleBookmark}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-400 text-amber-400' : ''}`} />
            <span>{isBookmarked ? 'Bookmarked' : 'Bookmark Lesson'}</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export MD</span>
          </button>

          <button
            onClick={handlePrintNotes}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </button>
        </div>
      </div>

      {/* Active Lesson Note Editor */}
      <div className="bg-slate-950/60 rounded-2xl border border-slate-800 p-5 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Note Title</label>
          <input
            type="text"
            value={currentNoteTitle}
            onChange={(e) => setCurrentNoteTitle(e.target.value)}
            placeholder="E.g. Core architectural takeaways from this lesson"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-400 mb-1">Your Personal Notes & Code Insights</label>
          <textarea
            rows={6}
            value={currentNoteText}
            onChange={(e) => setCurrentNoteText(e.target.value)}
            placeholder="Type your personal observations, syntax tips, gotchas, or interview notes here. Saved securely to your database profile."
            className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-500 outline-none focus:border-blue-500 font-mono leading-relaxed resize-y"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="Tags (comma-separated, e.g. React, Hooks, Performance)"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-300 placeholder-slate-500 outline-none focus:border-blue-500"
            />
          </div>

          <button
            onClick={handleSaveNote}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/30 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save Lesson Note</span>
          </button>
        </div>
      </div>

      {/* Past Notes for this Course */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>Saved Course Notes ({notes.length})</span>
          </h3>
          <span className="text-xs text-slate-500">Persisted across all sessions</span>
        </div>

        {notes.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-dashed border-slate-800 text-center text-xs text-slate-500">
            No notes written for this course yet. Capture your takeaways in the editor above!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notes.map((note) => (
              <div
                key={note.id}
                className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h4 className="text-xs font-bold text-white line-clamp-1">{note.title}</h4>
                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded transition-colors"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-300 whitespace-pre-line line-clamp-4 font-mono leading-relaxed bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                    {note.content}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-[10px] text-slate-500">
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((tag, i) => (
                      <span key={i} className="px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <span className="flex items-center gap-1 shrink-0">
                    <Clock className="w-3 h-3" />
                    {new Date(note.updated_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

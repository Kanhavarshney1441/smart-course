import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { TutorChatMessage } from '../types';
import {
  Sparkles,
  Send,
  X,
  Bot,
  User,
  RotateCcw,
  Lightbulb,
  Bug,
  HelpCircle,
  Code2,
  BrainCircuit,
  Loader2
} from 'lucide-react';

interface AiTutorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: number;
  courseTitle: string;
  lessonId?: number;
  lessonTitle?: string;
  activeCodeSnippet?: string;
}

export const AiTutorDrawer: React.FC<AiTutorDrawerProps> = ({
  isOpen,
  onClose,
  courseId,
  courseTitle,
  lessonId,
  lessonTitle,
  activeCodeSnippet,
}) => {
  const [messages, setMessages] = useState<TutorChatMessage[]>([
    {
      role: 'model',
      content: `👋 Hi! I'm your **AI Personal Tutor** for **${courseTitle}**.\n\nI can explain difficult concepts, give real-world analogies, debug your code snippets, or provide hints for your module quizzes without giving away the answer.\n\nWhat would you like to explore today?`
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const content = (textToSend || inputText).trim();
    if (!content || isSending) return;

    const userMessage: TutorChatMessage = { role: 'user', content };
    const newHistory = [...messages, userMessage];
    setMessages(newHistory);
    setInputText('');
    setIsSending(true);

    try {
      const res = await api.askAiTutor({
        course_id: courseId,
        lesson_id: lessonId,
        messages: newHistory,
        code_snippet: activeCodeSnippet,
      });

      setMessages(prev => [...prev, { role: 'model', content: res.reply }]);
    } catch (err: any) {
      console.error('Tutor chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          role: 'model',
          content: 'I had trouble connecting to the tutoring engine. Please try again or rephrase your question!'
        }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: 'model',
        content: `Conversation restarted! How can I help you master **${lessonTitle || courseTitle}**?`
      }
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="h-16 px-5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">AI Personal Tutor</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Gemini
              </span>
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[260px]">
              {lessonTitle ? `Topic: ${lessonTitle}` : courseTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetChat}
            title="Reset Conversation"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            title="Close Tutor"
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Prompt Chips */}
      <div className="px-4 py-2.5 bg-slate-950/40 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
        <button
          onClick={() => handleSendMessage('Can you explain this concept in simple words with an analogy?')}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-blue-300 border border-slate-700/80 whitespace-nowrap flex items-center gap-1 transition-colors"
        >
          <Lightbulb className="w-3 h-3 text-amber-400" />
          <span>Explain simply</span>
        </button>

        <button
          onClick={() => handleSendMessage('Give me a helpful hint for solving the practice questions in this lesson.')}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 whitespace-nowrap flex items-center gap-1 transition-colors"
        >
          <HelpCircle className="w-3 h-3 text-emerald-400" />
          <span>Quiz Hint</span>
        </button>

        <button
          onClick={() => handleSendMessage('What are common bugs or pitfalls that beginner and intermediate developers encounter here?')}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 whitespace-nowrap flex items-center gap-1 transition-colors"
        >
          <Bug className="w-3 h-3 text-rose-400" />
          <span>Common Pitfalls</span>
        </button>

        <button
          onClick={() => handleSendMessage('Can you give me a practical coding challenge to test my understanding?')}
          className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 whitespace-nowrap flex items-center gap-1 transition-colors"
        >
          <Code2 className="w-3 h-3 text-indigo-400" />
          <span>Code Challenge</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-blue-400 border border-slate-700'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                  isUser
                    ? 'bg-blue-600 text-white rounded-tr-none'
                    : 'bg-slate-800/90 text-slate-200 border border-slate-700/80 rounded-tl-none whitespace-pre-line'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-slate-800 text-blue-400 border border-slate-700 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
              <span>AI Tutor is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="p-4 bg-slate-950/80 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask your tutor anything..."
            disabled={isSending}
            className="flex-1 bg-slate-900 border border-slate-700 focus:border-blue-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-500 mt-2 text-center">
          Tutor answers are aligned to your course curriculum and current skill level.
        </p>
      </div>
    </div>
  );
};

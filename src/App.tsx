import { useState, useRef, useEffect } from 'react';
import { StudyDeck } from './types/result';
import { generateStudyDeck, AppError } from './lib/api';
import { PromptInput } from './components/PromptInput';
import { ResultView } from './components/ResultView';
import { LoadingState } from './components/LoadingState';
import { ErrorState } from './components/ErrorState';
import { SavedSessionsModal } from './components/SavedSessionsModal';
import {
  BrainCircuit,
  Moon,
  Sun,
  Bookmark,
  Sparkles,
  ShieldCheck,
  Zap,
  Code2
} from 'lucide-react';

const STORAGE_KEY = 'omni_study_decks_v1';
const THEME_KEY = 'omni_study_theme';

export default function App() {
  const [deck, setDeck] = useState<StudyDeck | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorInfo, setErrorInfo] = useState<{
    message: string;
    details?: string[];
    raw?: unknown;
  } | null>(null);
  const [lastInput, setLastInput] = useState<string>('');
  const [isMock, setIsMock] = useState(false);
  const [provider, setProvider] = useState<string | undefined>(undefined);

  // Saved Sessions
  const [savedDecks, setSavedDecks] = useState<StudyDeck[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [isSessionsModalOpen, setIsSessionsModalOpen] = useState(false);

  // Dark Mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved !== null) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [darkMode]);

  // Guard against stale asynchronous responses
  const requestId = useRef(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleGenerate = async (input: string, refinement?: string) => {
    // Increment request ID so previous pending requests are discarded
    const id = ++requestId.current;

    // Abort previous in-flight HTTP request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setErrorInfo(null);
    setLastInput(input);

    try {
      const result = await generateStudyDeck({
        input,
        refinement,
        existingDeck: refinement ? deck : null,
        signal: controller.signal
      });

      // Stale response guard: if a newer request began, ignore this completion
      if (id !== requestId.current) {
        return;
      }

      setDeck(result.deck);
      setIsMock(Boolean(result.isMock));
      setProvider(result.provider);
    } catch (err: unknown) {
      // If request was discarded or superseded, ignore
      if (id !== requestId.current) {
        return;
      }

      if (err instanceof AppError) {
        if (err.message !== 'Request was cancelled.') {
          setErrorInfo({
            message: err.message,
            details: err.details,
            raw: err.raw
          });
        }
      } else {
        const error = err as Error;
        setErrorInfo({
          message: error?.message || 'An unexpected error occurred while communicating with the AI service.',
          details: ['Please check network connectivity or try again.']
        });
      }
    } finally {
      if (id === requestId.current) {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleRetry = () => {
    if (lastInput) {
      handleGenerate(lastInput);
    }
  };

  const handleRefine = (refinementText: string) => {
    if (deck) {
      handleGenerate(deck.topic, refinementText);
    }
  };

  const handleSaveDeck = (deckToSave: StudyDeck) => {
    setSavedDecks((prev) => {
      const exists = prev.some((d) => d.id === deckToSave.id);
      const updated = exists ? prev : [deckToSave, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save deck locally:', e);
      }
      return updated;
    });
  };

  const handleDeleteDeck = (id: string) => {
    setSavedDecks((prev) => {
      const updated = prev.filter((d) => d.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to update stored decks:', e);
      }
      return updated;
    });
  };

  const isCurrentDeckSaved = deck ? savedDecks.some((d) => d.id === deck.id) : false;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 transition-colors duration-200 relative overflow-x-hidden">
      {/* Ambient background lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-tr from-brand-500/15 via-purple-500/15 to-transparent blur-3xl rounded-full dark:from-brand-600/20 dark:via-purple-600/15" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-500/10 via-brand-500/5 to-transparent blur-3xl rounded-full" />
        <div className="absolute bottom-10 -left-40 w-[500px] h-[500px] bg-gradient-to-tr from-emerald-500/10 to-transparent blur-3xl rounded-full" />
      </div>

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/75 dark:bg-slate-950/75 border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 transition-colors">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-brand-500/25 ring-2 ring-brand-500/20">
              <BrainCircuit className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 dark:text-white">
                  OmniLearn<span className="text-brand-600 dark:text-brand-400">.ai</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Proxy Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Interactive Study System & Quiz Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsSessionsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 shadow-xs transition-all active:scale-95"
            >
              <Bookmark className="w-3.5 h-3.5 text-brand-500" />
              <span>Saved Decks</span>
              <span className="ml-1 px-1.5 py-0.2 rounded-md bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400 font-mono text-[10px]">
                {savedDecks.length}
              </span>
            </button>

            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle theme"
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 shadow-xs transition-all active:scale-95"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">
        {/* Intro Hero when no deck exists */}
        {!deck && !isLoading && (
          <div className="text-center py-6 sm:py-10 max-w-2xl mx-auto space-y-4 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/50 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Structured AI Learning Platform
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              Transform Notes into <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-500">Interactive Mastery</span>
            </h1>

            <p className="text-base text-slate-600 dark:text-slate-400 leading-relaxed">
              Paste raw topics, meeting notes, or textbook extracts. Our model validates and compiles structured 3D flashcards, active-recall quizzes, and concept checklists.
            </p>

            {/* Architecture Highlights pills */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-4 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                Defensive Schema Parsing
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-amber-500" />
                Stale Response Protection
              </span>
              <span className="flex items-center gap-1.5">
                <Code2 className="w-4 h-4 text-brand-500" />
                Secure Server Proxy
              </span>
            </div>
          </div>
        )}

        {/* Free-form Input Area (The primary input interface) */}
        <PromptInput onSubmit={(val) => handleGenerate(val)} isLoading={isLoading} />

        {/* Loading State with progressive step feedback */}
        {isLoading && <LoadingState onCancel={handleCancel} />}

        {/* Error State with actionable retry and diagnostics */}
        {errorInfo && (
          <ErrorState
            title="AI Generation Error"
            message={errorInfo.message}
            details={errorInfo.details}
            raw={errorInfo.raw}
            onRetry={handleRetry}
            onLoadSample={() => handleGenerate('React Fiber Architecture')}
            onDismiss={() => setErrorInfo(null)}
          />
        )}

        {/* Result View: Interactive Flashcards, Quiz, Checklist */}
        {deck && !isLoading && (
          <ResultView
            deck={deck}
            isMock={isMock}
            provider={provider}
            onRefine={handleRefine}
            onSaveDeck={handleSaveDeck}
            isSaved={isCurrentDeckSaved}
            isLoading={isLoading}
          />
        )}

        {/* Empty State Help when no deck and no error */}
        {!deck && !isLoading && !errorInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-6">
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                1
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Active Flashcards</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Flip with 3D animation, tag cards for review or mastery, and navigate using full keyboard shortcuts.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                2
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Targeted Quiz & Re-Test</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Instant score feedback with full explanations. Failed answers can be re-tested in dedicated review mode!
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold text-sm">
                3
              </div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Refinement Loop</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Send follow-up prompts to tune difficulty, add cards, or adjust quiz scope without losing session progress.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200 dark:border-slate-800 py-6 px-4 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            Built with React hooks, defensive parsing & secure backend proxy for Flam Frontend Internship.
          </div>
          <div className="flex items-center gap-4">
            <span>TypeScript</span>
            <span>•</span>
            <span>Tailwind CSS</span>
            <span>•</span>
            <span>Express Proxy</span>
          </div>
        </div>
      </footer>

      {/* Saved Sessions Modal */}
      <SavedSessionsModal
        isOpen={isSessionsModalOpen}
        onClose={() => setIsSessionsModalOpen(false)}
        savedDecks={savedDecks}
        onSelectDeck={(selectedDeck) => {
          setDeck(selectedDeck);
          setErrorInfo(null);
        }}
        onDeleteDeck={handleDeleteDeck}
      />
    </div>
  );
}

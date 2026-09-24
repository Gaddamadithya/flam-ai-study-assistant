import React, { useState } from 'react';
import { StudyDeck, ViewMode } from '../types/result';
import { FlashcardDeck } from './FlashcardDeck';
import { QuizView } from './QuizView';
import { KeyConceptsView } from './KeyConceptsView';
import { RefinementInput } from './RefinementInput';
import {
  Layers,
  HelpCircle,
  BookmarkCheck,
  Download,
  Share2,
  Bookmark,
  Check,
  Cpu,
  Sparkles
} from 'lucide-react';

interface ResultViewProps {
  deck: StudyDeck;
  isMock?: boolean;
  provider?: string;
  onRefine: (refinementText: string) => void;
  onSaveDeck: (deck: StudyDeck) => void;
  isSaved?: boolean;
  isLoading: boolean;
}

export const ResultView: React.FC<ResultViewProps> = ({
  deck,
  isMock,
  provider,
  onRefine,
  onSaveDeck,
  isSaved = false,
  isLoading
}) => {
  const [activeTab, setActiveTab] = useState<ViewMode>('cards');
  const [copied, setCopied] = useState(false);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(deck, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${deck.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(deck, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fade-in pb-16">
      {/* Header Deck Information Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        {/* Subtle decorative background gradient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/10 dark:bg-brand-500/15 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-700 dark:text-brand-300 border border-brand-500/20">
                {deck.topic}
              </span>

              {isMock ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-500" />
                  Simulated Preview
                </span>
              ) : (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                  Live {provider || 'Gemini'} AI
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onSaveDeck(deck)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-2xl border transition-all shadow-xs active:scale-95 ${
                  isSaved
                    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
                }`}
              >
                {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span>{isSaved ? 'Saved in Sessions' : 'Save Session'}</span>
              </button>

              <button
                onClick={handleExportJSON}
                title="Download JSON deck"
                className="p-2 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-xs active:scale-95"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={handleCopy}
                title="Copy JSON to clipboard"
                className="p-2 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-all shadow-xs active:scale-95"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {deck.title}
          </h2>

          <p className="text-slate-600 dark:text-slate-300 mt-3 text-sm sm:text-base leading-relaxed max-w-3xl">
            {deck.summary}
          </p>

          {isMock && (
            <div className="mt-4 p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-2xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Simulated Mode:</strong> Displaying pre-validated structured study schema. To connect to live model streaming, provide your GEMINI_API_KEY in <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded font-mono">.env</code>.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Navigation Tabs with Pill Design */}
      <div className="p-1.5 rounded-2xl glass-panel flex gap-2">
        <button
          onClick={() => setActiveTab('cards')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'cards'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>3D Flashcards</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
            activeTab === 'cards'
              ? 'bg-white/20 text-white'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            {deck.cards.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'quiz'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Practice Quiz</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
            activeTab === 'quiz'
              ? 'bg-white/20 text-white'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            {deck.quiz.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('concepts')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'concepts'
              ? 'bg-brand-600 text-white shadow-md shadow-brand-500/25'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-slate-800/50'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Key Concepts</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-mono ${
            activeTab === 'concepts'
              ? 'bg-white/20 text-white'
              : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
          }`}>
            {deck.keyConcepts.length}
          </span>
        </button>
      </div>

      {/* Main Tab Content Display */}
      <div className="pt-2">
        {activeTab === 'cards' && <FlashcardDeck cards={deck.cards} />}
        {activeTab === 'quiz' && <QuizView questions={deck.quiz} />}
        {activeTab === 'concepts' && <KeyConceptsView concepts={deck.keyConcepts} />}
      </div>

      {/* Stretch Goal: Refinement Loop Input Bar */}
      <div className="pt-6">
        <RefinementInput onRefine={onRefine} isLoading={isLoading} />
      </div>
    </div>
  );
};

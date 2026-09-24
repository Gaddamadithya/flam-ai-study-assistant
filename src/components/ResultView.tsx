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
  Cpu
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800">
              {deck.topic}
            </span>

            {isMock ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Simulated AI Preview
              </span>
            ) : (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/40 flex items-center gap-1">
                <Cpu className="w-3 h-3" />
                Live {provider || 'Gemini'} AI
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSaveDeck(deck)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all ${
                isSaved
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50'
              }`}
            >
              {isSaved ? <Check className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
              <span>{isSaved ? 'Saved in Sessions' : 'Save Session'}</span>
            </button>

            <button
              onClick={handleExportJSON}
              title="Download JSON deck"
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopy}
              title="Copy JSON to clipboard"
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {deck.title}
        </h2>

        <p className="text-slate-600 dark:text-slate-300 mt-2 text-sm sm:text-base leading-relaxed">
          {deck.summary}
        </p>

        {isMock && (
          <div className="mt-4 p-3 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/70 dark:border-amber-900/40 rounded-xl text-xs text-amber-800 dark:text-amber-300">
            <strong>Pro Tip:</strong> Currently displaying pre-configured sample schema. To experience live AI generation, paste your Gemini API key in <code className="bg-amber-100 dark:bg-amber-900/50 px-1 py-0.5 rounded">.env</code> and restart.
          </div>
        )}
      </div>

      {/* Interactive Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-2">
        <button
          onClick={() => setActiveTab('cards')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'cards'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Flashcards</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {deck.cards.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('quiz')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'quiz'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          <span>Practice Quiz</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
            {deck.quiz.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('concepts')}
          className={`flex items-center gap-2 py-3 px-4 font-bold text-sm border-b-2 transition-all ${
            activeTab === 'concepts'
              ? 'border-brand-600 text-brand-600 dark:text-brand-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <BookmarkCheck className="w-4 h-4" />
          <span>Key Concepts</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
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

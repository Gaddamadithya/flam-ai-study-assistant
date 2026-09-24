import React, { useState, useEffect, useCallback } from 'react';
import { Flashcard } from '../types/result';
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Shuffle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  RotateCcw,
  Zap,
  Lightbulb
} from 'lucide-react';

interface FlashcardDeckProps {
  cards: Flashcard[];
}

export const FlashcardDeck: React.FC<FlashcardDeckProps> = ({ cards: initialCards }) => {
  const [deck, setDeck] = useState<Flashcard[]>(initialCards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  
  // Track mastery status: card.id -> 'mastered' | 'review'
  const [masteryStatus, setMasteryStatus] = useState<Record<string, 'mastered' | 'review'>>({});
  const [filterMode, setFilterMode] = useState<'all' | 'review' | 'mastered'>('all');

  // Update deck when props change
  useEffect(() => {
    setDeck(initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setMasteryStatus({});
  }, [initialCards]);

  // Compute filtered deck
  const activeDeck = deck.filter((card) => {
    if (filterMode === 'all') return true;
    if (filterMode === 'review') return masteryStatus[card.id] === 'review';
    if (filterMode === 'mastered') return masteryStatus[card.id] === 'mastered';
    return true;
  });

  const currentCard = activeDeck[currentIndex] || activeDeck[0];

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev < activeDeck.length - 1 ? prev + 1 : 0));
  }, [activeDeck.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setShowHint(false);
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : activeDeck.length - 1));
  }, [activeDeck.length]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const markMastery = useCallback((status: 'mastered' | 'review') => {
    if (!currentCard) return;
    setMasteryStatus((prev) => ({
      ...prev,
      [currentCard.id]: status
    }));
    // Auto advance to next card after marking
    setTimeout(() => {
      handleNext();
    }, 250);
  }, [currentCard, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === '1') {
        markMastery('review');
      } else if (e.key === '2') {
        markMastery('mastered');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev, markMastery]);

  const handleShuffle = () => {
    setIsFlipped(false);
    setShowHint(false);
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setCurrentIndex(0);
  };

  const handleReset = () => {
    setDeck(initialCards);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowHint(false);
    setMasteryStatus({});
    setFilterMode('all');
  };

  const masteredCount = deck.filter((c) => masteryStatus[c.id] === 'mastered').length;
  const reviewCount = deck.filter((c) => masteryStatus[c.id] === 'review').length;

  if (activeDeck.length === 0) {
    return (
      <div className="text-center py-16 px-6 glass-panel rounded-3xl shadow-sm">
        <Sparkles className="w-12 h-12 text-amber-500 mx-auto mb-3" />
        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          No cards in this filter
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-5">
          You currently have no flashcards categorized as "{filterMode}".
        </p>
        <button
          onClick={() => setFilterMode('all')}
          className="px-5 py-2.5 text-sm font-bold rounded-2xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/25 transition-all"
        >
          View All Flashcards
        </button>
      </div>
    );
  }

  const currentStatus = currentCard ? masteryStatus[currentCard.id] : undefined;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Top Deck Stats & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl glass-panel shadow-sm">
        <div className="flex items-center gap-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <span className="font-mono text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {currentIndex + 1} / {activeDeck.length}
          </span>
          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {masteredCount} Mastered
          </span>
          <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold text-xs bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-800/40">
            <AlertCircle className="w-3.5 h-3.5" />
            {reviewCount} Review
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold">
            <button
              onClick={() => { setFilterMode('all'); setCurrentIndex(0); }}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              All ({deck.length})
            </button>
            <button
              onClick={() => { setFilterMode('review'); setCurrentIndex(0); }}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterMode === 'review'
                  ? 'bg-amber-500 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Review ({reviewCount})
            </button>
            <button
              onClick={() => { setFilterMode('mastered'); setCurrentIndex(0); }}
              className={`px-3 py-1 rounded-lg transition-all ${
                filterMode === 'mastered'
                  ? 'bg-emerald-600 text-white shadow-xs font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Mastered ({masteredCount})
            </button>
          </div>

          <button
            onClick={handleShuffle}
            title="Shuffle Deck"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            title="Reset Progress"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress Dots Strip */}
      <div className="flex items-center gap-1.5 px-2">
        {activeDeck.map((c, i) => {
          const status = masteryStatus[c.id];
          return (
            <button
              key={c.id}
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex(i);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === currentIndex
                  ? 'w-6 bg-brand-600 dark:bg-brand-400'
                  : status === 'mastered'
                  ? 'w-2 bg-emerald-500'
                  : status === 'review'
                  ? 'w-2 bg-amber-500'
                  : 'w-2 bg-slate-200 dark:bg-slate-800'
              }`}
            />
          );
        })}
      </div>

      {/* 3D Flashcard */}
      <div
        onClick={handleFlip}
        className="perspective-1000 w-full min-h-[360px] cursor-pointer select-none group"
      >
        <div
          className={`relative w-full min-h-[360px] rounded-3xl transition-transform duration-500 transform-style-3d shadow-2xl border border-slate-200/90 dark:border-slate-800/90 ${
            isFlipped ? 'rotate-y-180 ambient-glow-emerald' : 'ambient-glow-indigo'
          }`}
        >
          {/* Card Front */}
          <div className="absolute inset-0 p-8 flex flex-col justify-between backface-hidden rounded-3xl bg-gradient-to-b from-white via-slate-50/50 to-indigo-50/20 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950/80">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                <Zap className="w-3.5 h-3.5 text-brand-500" />
                Prompt • Question
              </span>

              <div className="flex items-center gap-2">
                {currentCard.difficulty && (
                  <span
                    className={`text-[11px] font-bold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${
                      currentCard.difficulty === 'hard'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                        : currentCard.difficulty === 'medium'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900'
                    }`}
                  >
                    {currentCard.difficulty}
                  </span>
                )}
                {currentStatus && (
                  <span
                    className={`text-xs flex items-center gap-1 font-bold px-2 py-0.5 rounded-full ${
                      currentStatus === 'mastered'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                    }`}
                  >
                    {currentStatus === 'mastered' ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5" />
                    )}
                    {currentStatus === 'mastered' ? 'Mastered' : 'Review'}
                  </span>
                )}
              </div>
            </div>

            <div className="my-auto py-8 text-center px-2">
              <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-800 dark:text-white leading-relaxed tracking-tight">
                {currentCard.question}
              </h3>

              {currentCard.hint && (
                <div className="mt-5">
                  {showHint ? (
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-brand-700 dark:text-brand-300 bg-brand-50/80 dark:bg-brand-950/60 px-4 py-2 rounded-2xl border border-brand-200/70 dark:border-brand-900/60 animate-fade-in shadow-xs">
                      <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>{currentCard.hint}</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(true);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Need a clue? Reveal Hint
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <span className="flex items-center gap-1.5 font-medium group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                <RotateCw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500" />
                Click card or press Space to reveal answer
              </span>
              <span className="font-mono text-[11px] font-bold">#{currentIndex + 1}</span>
            </div>
          </div>

          {/* Card Back */}
          <div className="absolute inset-0 p-8 flex flex-col justify-between backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-b from-emerald-50/30 via-white to-slate-50/50 dark:from-slate-900 dark:via-slate-900/90 dark:to-slate-950/90 border-2 border-emerald-500/25">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Verified Answer
              </span>
              <span className="text-xs text-slate-400 font-mono font-bold">#{currentIndex + 1}</span>
            </div>

            <div className="my-auto py-6 px-2">
              <div className="p-6 rounded-2xl bg-white/80 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 shadow-sm">
                <p className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                  {currentCard.answer}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800/80">
              <span className="font-medium">Press Space to flip back</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active Retrieval Encoded</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Controls: Navigation & Mastery */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Previous / Next */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handlePrev}
            type="button"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm shadow-xs transition-all active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={handleNext}
            type="button"
            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-bold text-sm shadow-xs transition-all active:scale-95"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Mastery Marking Controls */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => markMastery('review')}
            type="button"
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-95 ${
              currentStatus === 'review'
                ? 'bg-amber-500 text-white shadow-amber-500/20'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-400 border border-amber-200/70 dark:border-amber-900/50'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Need Review <span className="text-xs opacity-75 font-mono hidden md:inline">(1)</span>
          </button>

          <button
            onClick={() => markMastery('mastered')}
            type="button"
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-95 ${
              currentStatus === 'mastered'
                ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-900/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Mastered <span className="text-xs opacity-75 font-mono hidden md:inline">(2)</span>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint Bar */}
      <div className="hidden sm:flex items-center justify-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 font-mono pt-1">
        <span><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">Space</kbd> Flip</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">→</kbd> Navigate</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">1</kbd> Review</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">2</kbd> Mastered</span>
      </div>
    </div>
  );
};

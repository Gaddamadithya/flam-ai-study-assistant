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
  RotateCcw
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
    }, 200);
  }, [currentCard, handleNext]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if typing in input/textarea
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
      <div className="text-center py-12 px-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <Sparkles className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">
          No cards in this filter
        </h4>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
          You have no cards tagged as "{filterMode}".
        </p>
        <button
          onClick={() => setFilterMode('all')}
          className="px-4 py-2 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors"
        >
          View All Cards
        </button>
      </div>
    );
  }

  const currentStatus = currentCard ? masteryStatus[currentCard.id] : undefined;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Top Deck Stats & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-400">
          <span>Card {currentIndex + 1} of {activeDeck.length}</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{masteredCount} Mastered</span>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <span className="text-amber-600 dark:text-amber-400 font-semibold">{reviewCount} To Review</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
            <button
              onClick={() => { setFilterMode('all'); setCurrentIndex(0); }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterMode === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All ({deck.length})
            </button>
            <button
              onClick={() => { setFilterMode('review'); setCurrentIndex(0); }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterMode === 'review'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Review ({reviewCount})
            </button>
            <button
              onClick={() => { setFilterMode('mastered'); setCurrentIndex(0); }}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterMode === 'mastered'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
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

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-brand-600 dark:bg-brand-500 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / activeDeck.length) * 100}%` }}
        />
      </div>

      {/* 3D Flashcard */}
      <div
        onClick={handleFlip}
        className="perspective-1000 w-full min-h-[340px] cursor-pointer select-none group"
      >
        <div
          className={`relative w-full min-h-[340px] rounded-3xl transition-transform duration-500 transform-style-3d shadow-xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Card Front */}
          <div className="absolute inset-0 p-8 flex flex-col justify-between backface-hidden rounded-3xl bg-gradient-to-b from-white to-slate-50/50 dark:from-slate-900 dark:to-slate-900/80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200/50 dark:border-brand-800/50">
                Front • Question
              </span>

              <div className="flex items-center gap-2">
                {currentCard.difficulty && (
                  <span
                    className={`text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                      currentCard.difficulty === 'hard'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400'
                        : currentCard.difficulty === 'medium'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400'
                    }`}
                  >
                    {currentCard.difficulty}
                  </span>
                )}
                {currentStatus && (
                  <span
                    className={`text-xs flex items-center gap-1 font-semibold ${
                      currentStatus === 'mastered'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {currentStatus === 'mastered' ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {currentStatus === 'mastered' ? 'Mastered' : 'Review'}
                  </span>
                )}
              </div>
            </div>

            <div className="my-auto py-6 text-center">
              <h3 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
                {currentCard.question}
              </h3>

              {currentCard.hint && (
                <div className="mt-4">
                  {showHint ? (
                    <p className="text-sm text-brand-600 dark:text-brand-400 bg-brand-50/60 dark:bg-brand-950/40 p-2.5 rounded-xl border border-brand-200/50 dark:border-brand-900/50 inline-block">
                      💡 Hint: {currentCard.hint}
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowHint(true);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Show Hint
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span className="flex items-center gap-1.5">
                <RotateCw className="w-3.5 h-3.5 text-brand-500" />
                Click card or press Space to reveal answer
              </span>
              <span className="font-mono">#{currentIndex + 1}</span>
            </div>
          </div>

          {/* Card Back */}
          <div className="absolute inset-0 p-8 flex flex-col justify-between backface-hidden rotate-y-180 rounded-3xl bg-gradient-to-b from-brand-50/30 to-white dark:from-slate-900 dark:to-slate-900/90 border-2 border-brand-500/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50">
                Back • Key Answer
              </span>
              <span className="text-xs text-slate-400 font-mono">#{currentIndex + 1}</span>
            </div>

            <div className="my-auto py-6">
              <p className="text-lg sm:text-xl font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                {currentCard.answer}
              </p>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500 pt-4 border-t border-slate-100 dark:border-slate-800">
              <span>Click card or press Space to flip back</span>
              <span className="text-brand-600 dark:text-brand-400 font-semibold">Active Recall</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Action Controls: Navigation & Mastery */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Previous / Next */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm shadow-xs transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <button
            onClick={handleNext}
            type="button"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-sm shadow-xs transition-colors"
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
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs ${
              currentStatus === 'review'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:hover:bg-amber-900/60 dark:text-amber-400 border border-amber-200/60 dark:border-amber-900/40'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            Need Review <span className="text-xs opacity-75 font-mono hidden md:inline">(1)</span>
          </button>

          <button
            onClick={() => markMastery('mastered')}
            type="button"
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-xs ${
              currentStatus === 'mastered'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/60 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/40'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            Mastered <span className="text-xs opacity-75 font-mono hidden md:inline">(2)</span>
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint Bar */}
      <div className="hidden sm:flex items-center justify-center gap-4 text-[11px] text-slate-400 dark:text-slate-500 font-mono pt-2">
        <span><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">Space</kbd> Flip</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">←</kbd> <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">→</kbd> Navigate</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">1</kbd> Review</span>
        <span><kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">2</kbd> Mastered</span>
      </div>
    </div>
  );
};

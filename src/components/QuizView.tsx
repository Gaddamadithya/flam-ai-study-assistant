import React, { useState, useEffect } from 'react';
import { QuizQuestion } from '../types/result';
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Trophy,
  RotateCcw,
  ArrowRight,
  Sparkles,
  BookOpen,
  Target,
  Flame,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface QuizViewProps {
  questions: QuizQuestion[];
}

export const QuizView: React.FC<QuizViewProps> = ({ questions: initialQuestions }) => {
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>(initialQuestions);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isReTestingWrong, setIsReTestingWrong] = useState(false);

  useEffect(() => {
    setActiveQuestions(initialQuestions);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsCompleted(false);
    setIsReTestingWrong(false);
  }, [initialQuestions]);

  const currentQ = activeQuestions[currentIndex];
  const selectedOptionId = currentQ ? selectedAnswers[currentQ.id] : undefined;
  const isAnswered = selectedOptionId !== undefined;

  // Calculate score
  const correctCount = activeQuestions.filter(
    (q) => selectedAnswers[q.id] === q.correctOptionId
  ).length;

  const wrongQuestions = activeQuestions.filter(
    (q) => selectedAnswers[q.id] && selectedAnswers[q.id] !== q.correctOptionId
  );

  const handleSelectOption = (optionId: string) => {
    if (isAnswered) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optionId
    }));
  };

  const handleNext = () => {
    if (currentIndex < activeQuestions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      const finalScore = (correctCount / activeQuestions.length) * 100;
      if (finalScore >= 70) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleRetestWrongAnswers = () => {
    if (wrongQuestions.length === 0) return;
    setActiveQuestions(wrongQuestions);
    setCurrentIndex(0);
    const nextAnswers = { ...selectedAnswers };
    wrongQuestions.forEach((q) => {
      delete nextAnswers[q.id];
    });
    setSelectedAnswers(nextAnswers);
    setIsCompleted(false);
    setIsReTestingWrong(true);
  };

  const handleResetFullQuiz = () => {
    setActiveQuestions(initialQuestions);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setIsCompleted(false);
    setIsReTestingWrong(false);
  };

  if (!currentQ && !isCompleted) {
    return (
      <div className="text-center py-16 p-6 glass-panel rounded-3xl shadow-sm">
        <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
        <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
          No quiz questions available for this topic.
        </h4>
      </div>
    );
  }

  // Quiz Finished Screen
  if (isCompleted) {
    const total = activeQuestions.length;
    const percentage = Math.round((correctCount / total) * 100);
    const hasWrong = wrongQuestions.length > 0;

    return (
      <div className="w-full max-w-2xl mx-auto my-6 p-8 sm:p-10 glass-panel rounded-3xl shadow-2xl text-center animate-scale-in">
        <div className="inline-flex p-5 rounded-3xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white shadow-lg shadow-brand-500/25 mb-4">
          <Trophy className="w-12 h-12" />
        </div>

        <h3 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isReTestingWrong ? 'Missed Questions Review Complete!' : 'Quiz Session Complete!'}
        </h3>

        <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 max-w-md mx-auto">
          {percentage >= 80
            ? 'Exceptional mastery! Your conceptual foundations are locked in.'
            : percentage >= 50
            ? 'Solid effort! Re-test your missed questions to achieve total mastery.'
            : 'Active recall repetition is key. Practice with wrong answers to reinforce retention.'}
        </p>

        {/* Score Metric Cards Grid */}
        <div className="my-8 grid grid-cols-3 gap-3">
          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
            <div className="text-xs uppercase font-extrabold tracking-wider text-slate-400">Score</div>
            <div className="text-2xl sm:text-3xl font-black text-brand-600 dark:text-brand-400 mt-1">
              {percentage}%
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
            <div className="text-xs uppercase font-extrabold tracking-wider text-emerald-500">Correct</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {correctCount}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/70 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 shadow-xs">
            <div className="text-xs uppercase font-extrabold tracking-wider text-amber-500">Missed</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1">
              {wrongQuestions.length}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {hasWrong && (
            <button
              onClick={handleRetestWrongAnswers}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Re-Test Wrong Answers Only ({wrongQuestions.length})
            </button>
          )}

          <button
            onClick={handleResetFullQuiz}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-sm transition-all active:scale-95"
          >
            <Sparkles className="w-4 h-4 text-brand-500" />
            Restart Full Quiz
          </button>
        </div>
      </div>
    );
  }

  const isCurrentCorrect = selectedOptionId === currentQ.correctOptionId;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Quiz Header & Live Score Card */}
      <div className="p-4 sm:p-5 rounded-2xl glass-panel shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {isReTestingWrong ? (
            <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-500" />
              Wrong Answers Focused Drill
            </span>
          ) : (
            <span className="text-xs uppercase font-extrabold px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-brand-500" />
              Active Recall Assessment
            </span>
          )}

          <span className="text-xs font-mono font-bold text-slate-400">
            {currentIndex + 1} of {activeQuestions.length}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
          <span className="text-slate-400">Score:</span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400 text-sm">
            {correctCount}
          </span>
          <span className="text-slate-400">/</span>
          <span className="font-mono text-slate-500">{Object.keys(selectedAnswers).length}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-gradient-to-r from-brand-600 to-indigo-600 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel shadow-xl space-y-6">
        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrect = opt.id === currentQ.correctOptionId;

            let buttonStyle = 'border-slate-200/90 dark:border-slate-800 bg-white/70 dark:bg-slate-800/40 hover:border-brand-500/60 hover:bg-brand-50/20 text-slate-800 dark:text-slate-200';

            if (isAnswered) {
              if (isCorrect) {
                buttonStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100 font-bold shadow-sm shadow-emerald-500/10';
              } else if (isSelected) {
                buttonStyle = 'border-rose-500 bg-rose-500/10 text-rose-900 dark:text-rose-100 shadow-sm shadow-rose-500/10';
              } else {
                buttonStyle = 'border-slate-200/60 dark:border-slate-800/60 opacity-40';
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={isAnswered}
                className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all duration-200 flex items-start gap-4 relative card-hover-fx ${buttonStyle}`}
              >
                <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-extrabold text-xs uppercase shrink-0 transition-colors ${
                  isAnswered && isCorrect
                    ? 'bg-emerald-500 text-white'
                    : isAnswered && isSelected
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>

                <span className="text-sm sm:text-base leading-snug pt-1 flex-1 font-medium">
                  {opt.text}
                </span>

                {isAnswered && isCorrect && (
                  <CheckCircle className="w-5 h-5 text-emerald-500 ml-2 shrink-0 mt-1 animate-scale-in" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-500 ml-2 shrink-0 mt-1 animate-scale-in" />
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback & Detailed Explanation */}
        {isAnswered && (
          <div className={`p-5 rounded-2xl text-sm animate-slide-up border ${
            isCurrentCorrect
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-900 dark:text-rose-200'
          }`}>
            <div className="flex items-center gap-2 font-bold mb-1.5 text-base">
              {isCurrentCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              ) : (
                <HelpCircle className="w-5 h-5 text-rose-500" />
              )}
              <span>{isCurrentCorrect ? 'Correct! High-Yield Insight:' : 'Incorrect. Key Clarification:'}</span>
            </div>
            <p className="leading-relaxed opacity-95 text-sm sm:text-base">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Next Question Navigation */}
        {isAnswered && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 shadow-lg shadow-brand-500/25 transition-all active:scale-95"
            >
              <span>{currentIndex < activeQuestions.length - 1 ? 'Next Question' : 'View Results'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

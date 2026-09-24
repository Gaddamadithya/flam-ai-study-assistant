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
  BookOpen
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
    if (isAnswered) return; // Cannot change answer once submitted
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
      // Trigger celebratory confetti if passed well
      const finalScore = (correctCount / activeQuestions.length) * 100;
      if (finalScore >= 70) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const handleRetestWrongAnswers = () => {
    if (wrongQuestions.length === 0) return;
    setActiveQuestions(wrongQuestions);
    setCurrentIndex(0);
    // Clear answers for the re-tested questions
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
      <div className="text-center py-12 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-slate-700 dark:text-slate-300">
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
      <div className="w-full max-w-2xl mx-auto my-6 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl text-center animate-scale-in">
        <div className="inline-flex p-4 rounded-3xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 mb-4">
          <Trophy className="w-12 h-12" />
        </div>

        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
          {isReTestingWrong ? 'Wrong Answers Re-Test Completed!' : 'Quiz Completed!'}
        </h3>

        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          {percentage >= 80
            ? 'Outstanding mastery of this subject!'
            : percentage >= 50
            ? 'Good progress! Review your missed questions to cement concepts.'
            : 'Keep practicing! Active recall repetition will reinforce retention.'}
        </p>

        {/* Score Ring */}
        <div className="my-8 inline-block p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          <div className="text-4xl font-extrabold text-brand-600 dark:text-brand-400">
            {correctCount} / {total}
          </div>
          <div className="text-xs uppercase tracking-wider font-bold text-slate-400 mt-1">
            Score: {percentage}%
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {hasWrong && (
            <button
              onClick={handleRetestWrongAnswers}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white bg-amber-500 hover:bg-amber-600 shadow-md transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              Re-Test Wrong Answers ({wrongQuestions.length})
            </button>
          )}

          <button
            onClick={handleResetFullQuiz}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
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
      {/* Quiz Header & Progress */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isReTestingWrong && (
            <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 mr-1">
              Re-Testing Missed
            </span>
          )}
          <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            Question {currentIndex + 1} of {activeQuestions.length}
          </span>
        </div>

        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Current Score: {correctCount} / {Object.keys(selectedAnswers).length}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className="bg-brand-600 dark:bg-brand-500 h-full transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / activeQuestions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl space-y-6">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-relaxed">
          {currentQ.question}
        </h3>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            const isSelected = selectedOptionId === opt.id;
            const isCorrect = opt.id === currentQ.correctOptionId;

            let buttonStyle = 'border-slate-200 dark:border-slate-800 hover:border-brand-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-800 dark:text-slate-200';

            if (isAnswered) {
              if (isCorrect) {
                buttonStyle = 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100 font-medium';
              } else if (isSelected) {
                buttonStyle = 'border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-100';
              } else {
                buttonStyle = 'border-slate-200 dark:border-slate-800 opacity-50';
              }
            }

            return (
              <button
                key={opt.id}
                onClick={() => handleSelectOption(opt.id)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all duration-200 flex items-start gap-3.5 relative ${buttonStyle}`}
              >
                <span className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0 ${
                  isAnswered && isCorrect
                    ? 'bg-emerald-500 text-white'
                    : isAnswered && isSelected
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>

                <span className="text-sm sm:text-base leading-snug pt-0.5">
                  {opt.text}
                </span>

                {isAnswered && isCorrect && (
                  <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 ml-auto shrink-0 mt-0.5" />
                )}
                {isAnswered && isSelected && !isCorrect && (
                  <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 ml-auto shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback & Detailed Explanation */}
        {isAnswered && (
          <div className={`p-4 rounded-2xl text-sm animate-slide-up border ${
            isCurrentCorrect
              ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
          }`}>
            <div className="flex items-center gap-2 font-bold mb-1">
              <HelpCircle className="w-4 h-4" />
              <span>{isCurrentCorrect ? 'Correct!' : 'Incorrect'}</span>
            </div>
            <p className="leading-relaxed opacity-95">
              {currentQ.explanation}
            </p>
          </div>
        )}

        {/* Next Question Navigation */}
        {isAnswered && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm text-white bg-brand-600 hover:bg-brand-700 shadow-md transition-all active:scale-95"
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

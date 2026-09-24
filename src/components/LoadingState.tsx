import React, { useEffect, useState } from 'react';
import { Loader2, XCircle } from 'lucide-react';

interface LoadingStateProps {
  onCancel?: () => void;
}

const STEPS = [
  'Querying secure backend proxy...',
  'Generating structured educational schema...',
  'Executing defensive parsing on raw model output...',
  'Validating flashcards and quiz constraints...',
  'Assembling interactive component tree...'
];

export const LoadingState: React.FC<LoadingStateProps> = ({ onCancel }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2400);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto my-8 p-8 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl text-center animate-fade-in">
      <div className="relative inline-flex items-center justify-center mb-6">
        <div className="w-16 h-16 rounded-full bg-brand-50 dark:bg-brand-950/60 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-600 dark:text-brand-400 animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-full border-4 border-brand-500/20 animate-ping pointer-events-none" />
      </div>

      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
        Building Your Interactive Study Tool
      </h3>
      
      <p className="text-sm font-medium text-brand-600 dark:text-brand-400 h-6 transition-all duration-300">
        {STEPS[currentStepIndex]}
      </p>

      {/* Progress pill indicators */}
      <div className="flex justify-center items-center gap-2 mt-6 mb-8">
        {STEPS.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              idx <= currentStepIndex
                ? 'w-8 bg-brand-600 dark:bg-brand-500'
                : 'w-2 bg-slate-200 dark:bg-slate-800'
            }`}
          />
        ))}
      </div>

      {/* Simulated skeleton cards to provide realistic UI feedback */}
      <div className="space-y-3 opacity-60 pointer-events-none mb-6">
        <div className="h-24 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
        <div className="h-16 bg-slate-100 dark:bg-slate-800/60 rounded-xl animate-pulse" />
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          type="button"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 transition-colors"
        >
          <XCircle className="w-4 h-4" />
          Cancel Generation
        </button>
      )}
    </div>
  );
};

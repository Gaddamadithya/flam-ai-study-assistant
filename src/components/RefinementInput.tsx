import React, { useState } from 'react';
import { Wand2, Sparkles } from 'lucide-react';

interface RefinementInputProps {
  onRefine: (refinement: string) => void;
  isLoading: boolean;
}

const QUICK_REFINEMENTS = [
  'Add 3 more advanced flashcards',
  'Simplify explanations for beginners',
  'Add tricky edge-case quiz questions',
  'Focus on practical real-world scenarios'
];

export const RefinementInput: React.FC<RefinementInputProps> = ({ onRefine, isLoading }) => {
  const [text, setText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim() && !isLoading) {
      onRefine(text.trim());
      setText('');
    }
  };

  return (
    <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <Wand2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
          Refine Existing Deck (Refinement Loop)
        </h4>
        <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-full ml-auto">
          AI Modifier
        </span>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isLoading}
          placeholder="e.g. 'Add 2 questions on memory leaks', 'Make the quiz tougher'..."
          className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />

        <button
          type="submit"
          disabled={!text.trim() || isLoading}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors shadow-xs shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Apply</span>
        </button>
      </form>

      {/* Suggested Quick Refinements */}
      <div className="flex flex-wrap items-center gap-1.5 pt-1">
        <span className="text-[11px] text-slate-400 font-medium">Suggestions:</span>
        {QUICK_REFINEMENTS.map((suggestion, i) => (
          <button
            key={i}
            type="button"
            disabled={isLoading}
            onClick={() => {
              setText(suggestion);
            }}
            className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

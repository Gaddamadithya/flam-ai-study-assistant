import React, { useState } from 'react';
import { KeyConcept } from '../types/result';
import { CheckSquare, Square, BookmarkCheck, Filter } from 'lucide-react';

interface KeyConceptsViewProps {
  concepts: KeyConcept[];
}

export const KeyConceptsView: React.FC<KeyConceptsViewProps> = ({ concepts }) => {
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState<'all' | 'core' | 'supporting' | 'advanced'>('all');

  const toggleCheck = (id: string) => {
    setCheckedIds((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredConcepts = concepts.filter((c) => {
    if (filter === 'all') return true;
    return (c.importance || 'core') === filter;
  });

  const checkedCount = concepts.filter((c) => checkedIds[c.id]).length;
  const progressPct = concepts.length > 0 ? Math.round((checkedCount / concepts.length) * 100) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      {/* Header and Progress Bar */}
      <div className="p-6 rounded-3xl glass-panel shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
              <BookmarkCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Conceptual Mastery Checklist
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Check off concepts as you internalize their definitions
              </p>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm font-extrabold text-slate-800 dark:text-slate-200">
              {checkedCount} / {concepts.length} Mastered
            </div>
            <div className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
              {progressPct}% Completion
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-bold">Filter:</span>
          {(['all', 'core', 'supporting', 'advanced'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`text-xs px-3 py-1 rounded-xl capitalize font-bold transition-all ${
                filter === mode
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Concept Items */}
      <div className="space-y-3">
        {filteredConcepts.map((concept) => {
          const isChecked = !!checkedIds[concept.id];
          const importance = concept.importance || 'core';

          return (
            <div
              key={concept.id}
              onClick={() => toggleCheck(concept.id)}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 select-none card-hover-fx ${
                isChecked
                  ? 'bg-emerald-500/10 border-emerald-500/40 shadow-xs'
                  : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 hover:border-brand-400/50'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-brand-600 dark:text-brand-400 shrink-0 transition-transform active:scale-90"
              >
                {isChecked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-500" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h4 className={`text-base font-extrabold transition-all ${
                    isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                  }`}>
                    {concept.title}
                  </h4>
                  <span className={`text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full ${
                    importance === 'core'
                      ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20'
                      : importance === 'advanced'
                      ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                      : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20'
                  }`}>
                    {importance}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {concept.summary}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredConcepts.length === 0 && (
        <div className="p-8 text-center glass-panel rounded-2xl text-slate-500 text-sm">
          No concepts found under the "{filter}" filter.
        </div>
      )}
    </div>
  );
};

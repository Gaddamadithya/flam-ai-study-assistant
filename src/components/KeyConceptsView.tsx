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
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookmarkCheck className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Key Conceptual Checklist
            </h3>
          </div>

          <div className="text-sm font-semibold text-slate-600 dark:text-slate-400">
            {checkedCount} of {concepts.length} Mastered ({progressPct}%)
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-emerald-500 h-full transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-400 font-medium">Filter:</span>
          {(['all', 'core', 'supporting', 'advanced'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFilter(mode)}
              className={`text-xs px-2.5 py-1 rounded-lg capitalize transition-colors ${
                filter === mode
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
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
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-4 select-none ${
                isChecked
                  ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-brand-800'
              }`}
            >
              <button
                type="button"
                className="mt-0.5 text-brand-600 dark:text-brand-400 shrink-0"
              >
                {isChecked ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={`text-base font-bold transition-all ${
                    isChecked ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-900 dark:text-white'
                  }`}>
                    {concept.title}
                  </h4>
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                    importance === 'core'
                      ? 'bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:text-brand-400'
                      : importance === 'advanced'
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400'
                      : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {importance}
                  </span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {concept.summary}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {filteredConcepts.length === 0 && (
        <div className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 text-sm">
          No concepts found under the "{filter}" filter.
        </div>
      )}
    </div>
  );
};

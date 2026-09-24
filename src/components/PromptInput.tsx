import React, { useState, KeyboardEvent } from 'react';
import { Send, Sparkles, Eraser } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

const PRESET_TOPICS = [
  {
    title: 'React Fiber & Reconciliation',
    prompt: 'Explain the React Fiber reconciliation architecture, work loops, priority queues, and how concurrent rendering operates.'
  },
  {
    title: 'Distributed Systems & CAP',
    prompt: 'Detailed study notes on the CAP theorem, PACELC theorem, distributed consensus (Raft/Paxos), and eventual consistency models.'
  },
  {
    title: 'JavaScript Event Loop & Microtasks',
    prompt: 'JavaScript event loop mechanics: call stack, task queue (macrotasks), microtask queue (Promise, queueMicrotask), and rendering phase.'
  }
];

export const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (value.trim() && !isLoading) {
      onSubmit(value.trim());
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSelectPreset = (prompt: string) => {
    setValue(prompt);
  };

  return (
    <div className="w-full max-w-3xl mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative rounded-2xl border-2 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-lg focus-within:border-brand-500 dark:focus-within:border-brand-500 transition-all duration-200">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={4}
            placeholder="Paste your lecture notes, article excerpts, or any topic you want to master (e.g. 'React Fiber Reconciliation', 'Kubernetes Architecture', 'Photosynthesis')..."
            className="w-full resize-none rounded-2xl bg-transparent p-4 pb-14 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none text-base leading-relaxed"
          />

          {/* Bottom Bar inside Input Box */}
          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500 pointer-events-auto">
              <span>{value.length} characters</span>
              {value.length > 0 && (
                <button
                  type="button"
                  onClick={() => setValue('')}
                  className="hover:text-rose-500 flex items-center gap-1 transition-colors"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                <span>Ctrl/⌘</span> + <span>Enter</span>
              </span>

              <button
                type="submit"
                disabled={!value.trim() || isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all active:scale-95"
              >
                {isLoading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <span>Generate Deck</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Preset Topics for Quick Evaluation */}
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          Quick Try:
        </span>
        {PRESET_TOPICS.map((preset, index) => (
          <button
            key={index}
            type="button"
            disabled={isLoading}
            onClick={() => handleSelectPreset(preset.prompt)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors font-medium border border-slate-200 dark:border-slate-700/60"
          >
            {preset.title}
          </button>
        ))}
      </div>
    </div>
  );
};

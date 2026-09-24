import React, { useState, KeyboardEvent } from 'react';
import { Send, Sparkles, Eraser, ArrowUpRight } from 'lucide-react';

interface PromptInputProps {
  onSubmit: (input: string) => void;
  isLoading: boolean;
}

const PRESET_TOPICS = [
  {
    icon: '⚛️',
    title: 'React Fiber Architecture',
    prompt: 'Explain React Fiber reconciliation, work loops, priority levels, lane model, and how concurrent rendering works.'
  },
  {
    icon: '🌐',
    title: 'Distributed Systems & CAP',
    prompt: 'Comprehensive breakdown of CAP theorem, PACELC theorem, distributed consensus (Raft/Paxos), and eventual consistency models.'
  },
  {
    icon: '⚡',
    title: 'JavaScript Event Loop',
    prompt: 'JavaScript event loop mechanics: call stack, task queue, microtasks (Promises, queueMicrotask), and frame rendering pipeline.'
  }
];

export const PromptInput: React.FC<PromptInputProps> = ({ onSubmit, isLoading }) => {
  const [value, setValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

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
        {/* Glow halo on focus */}
        <div
          className={`absolute -inset-1 rounded-3xl bg-gradient-to-r from-brand-500/30 via-purple-500/30 to-indigo-500/30 blur-lg transition-opacity duration-300 pointer-events-none ${
            isFocused ? 'opacity-100' : 'opacity-0'
          }`}
        />

        <div className="relative rounded-3xl border-2 border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl transition-all duration-300">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={4}
            placeholder="Paste your lecture notes, textbook excerpt, or any complex topic you want to master (e.g. 'React Fiber Reconciliation', 'Docker & Kubernetes', 'System Design: Distributed Caching')..."
            className="w-full resize-none rounded-3xl bg-transparent p-5 pb-16 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none text-base leading-relaxed"
          />

          {/* Bottom Bar inside Input Box */}
          <div className="absolute bottom-3.5 left-5 right-5 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500 pointer-events-auto">
              <span className="font-mono">{value.length} characters</span>
              {value.length > 0 && (
                <button
                  type="button"
                  onClick={() => setValue('')}
                  className="hover:text-rose-500 flex items-center gap-1 transition-colors font-medium"
                >
                  <Eraser className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>

            <div className="flex items-center gap-2.5 pointer-events-auto">
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Ctrl/⌘</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">Enter</kbd>
              </span>

              <button
                type="submit"
                disabled={!value.trim() || isLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg shadow-brand-500/20 transition-all active:scale-95"
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
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 mr-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          Quick Presets:
        </span>
        {PRESET_TOPICS.map((preset, index) => (
          <button
            key={index}
            type="button"
            disabled={isLoading}
            onClick={() => handleSelectPreset(preset.prompt)}
            className="group inline-flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 hover:bg-brand-50 dark:hover:bg-brand-950/40 text-slate-700 dark:text-slate-200 hover:text-brand-600 dark:hover:text-brand-400 transition-all font-semibold border border-slate-200/90 dark:border-slate-800 shadow-xs hover:border-brand-300 dark:hover:border-brand-700"
          >
            <span>{preset.icon}</span>
            <span>{preset.title}</span>
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-brand-500" />
          </button>
        ))}
      </div>
    </div>
  );
};

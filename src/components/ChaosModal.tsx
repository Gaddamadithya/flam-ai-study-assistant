import { CHAOS_SCENARIOS, ChaosScenario } from '../lib/chaosSimulator';
import { ShieldAlert, X, Play } from 'lucide-react';

interface ChaosModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerChaos: (scenario: ChaosScenario) => void;
}

export const ChaosModal: React.FC<ChaosModalProps> = ({
  isOpen,
  onClose,
  onTriggerChaos
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 animate-scale-in">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  AI Chaos & Failure Testing Sandbox
                </h3>
                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                  Reviewer Playground
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Simulate realistic LLM failure modes to verify defensive parsing and zero-crash recovery.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scenarios Grid */}
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {CHAOS_SCENARIOS.map((scenario) => (
            <div
              key={scenario.id}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-rose-400/50 dark:hover:border-rose-800 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {scenario.title}
                  </h4>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                    {scenario.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                  {scenario.description}
                </p>
                <div className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ {scenario.expectedBehavior}
                </div>
              </div>

              <button
                onClick={() => {
                  onTriggerChaos(scenario.id);
                  onClose();
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-all active:scale-95 shrink-0"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Simulate</span>
              </button>
            </div>
          ))}
        </div>

        {/* Note */}
        <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
          Evaluates Section 7 of the Candidate Guide: <em>"Handling failure well is what separates people who've built AI features."</em>
        </div>
      </div>
    </div>
  );
};

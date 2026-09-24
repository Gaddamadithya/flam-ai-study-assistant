import React, { useState } from 'react';
import { AlertTriangle, RefreshCw, ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react';

interface ErrorStateProps {
  title?: string;
  message: string;
  details?: string[];
  raw?: unknown;
  onRetry?: () => void;
  onLoadSample?: () => void;
  onDismiss?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'AI Generation Error',
  message,
  details,
  raw,
  onRetry,
  onLoadSample,
  onDismiss,
}) => {
  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto my-6 p-6 bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl shadow-sm text-slate-800 dark:text-slate-200 animate-slide-up">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-rose-900 dark:text-rose-200">
              {title}
            </h4>
            <p className="text-sm text-rose-700 dark:text-rose-300 mt-1">
              {message}
            </p>
          </div>
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss error"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center gap-3 mt-5 pt-4 border-t border-rose-200/60 dark:border-rose-900/40">
        {onRetry && (
          <button
            onClick={onRetry}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 dark:bg-rose-700 dark:hover:bg-rose-600 rounded-xl transition-colors shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Retry Request
          </button>
        )}

        {onLoadSample && (
          <button
            onClick={onLoadSample}
            type="button"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded-xl transition-colors shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            Load Sample Deck
          </button>
        )}

        {Boolean((details && details.length > 0) || raw !== undefined) && (
          <button
            onClick={() => setShowTechnicalDetails(!showTechnicalDetails)}
            type="button"
            className="inline-flex items-center gap-1.5 ml-auto text-xs font-semibold text-rose-700 dark:text-rose-400 hover:underline"
          >
            {showTechnicalDetails ? 'Hide Diagnostics' : 'Inspect Diagnostics'}
            {showTechnicalDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Expandable Technical Diagnostics / Defensive Parser Logs */}
      {showTechnicalDetails && (
        <div className="mt-4 p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 space-y-2">
          {details && details.length > 0 && (
            <div>
              <div className="text-rose-400 font-semibold mb-1">Validation Failures:</div>
              <ul className="list-disc list-inside space-y-1 text-slate-300">
                {details.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          )}

          {raw !== undefined && (
            <div className="pt-2 border-t border-slate-800">
              <div className="text-amber-400 font-semibold mb-1">Raw Model Payload:</div>
              <pre className="text-slate-400 max-h-48 overflow-y-auto whitespace-pre-wrap">
                {typeof raw === 'string' ? raw : JSON.stringify(raw, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { StudyDeck } from '../types/result';
import { Bookmark, Trash2, ArrowRight, X, Clock, Layers } from 'lucide-react';

interface SavedSessionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedDecks: StudyDeck[];
  onSelectDeck: (deck: StudyDeck) => void;
  onDeleteDeck: (id: string) => void;
}

export const SavedSessionsModal: React.FC<SavedSessionsModalProps> = ({
  isOpen,
  onClose,
  savedDecks,
  onSelectDeck,
  onDeleteDeck
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 space-y-5 animate-scale-in">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Saved Study Sessions
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedDecks.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <Layers className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm">No saved sessions yet.</p>
            <p className="text-xs text-slate-400 mt-1">
              Generate a study deck and click "Save Session" to store it locally.
            </p>
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto space-y-3 pr-1">
            {savedDecks.map((deck) => (
              <div
                key={deck.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800 transition-colors flex items-center justify-between gap-4"
              >
                <div
                  onClick={() => {
                    onSelectDeck(deck);
                    onClose();
                  }}
                  className="flex-1 cursor-pointer min-w-0"
                >
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {deck.title}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <span>{deck.cards.length} cards</span>
                    <span>•</span>
                    <span>{deck.quiz.length} quiz questions</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(deck.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onSelectDeck(deck);
                      onClose();
                    }}
                    className="p-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onDeleteDeck(deck.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { X, Star, Trash2, Copy, Check, Share2, Sparkles, BookOpen } from 'lucide-react';
import { getBookmarks, toggleBookmark } from '../services/studyTracker.js';

export default function BookmarksModal({ isOpen, onClose, onOpenInChat }) {
  const [bookmarks, setBookmarks] = useState([]);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setBookmarks(getBookmarks());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRemove = (bm) => {
    const updated = toggleBookmark(bm);
    setBookmarks(updated);
  };

  const handleCopy = (bm) => {
    navigator.clipboard.writeText(bm.content || '');
    setCopiedId(bm.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-scale-up">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-50/80 via-orange-50/60 to-white dark:from-slate-800/80 dark:via-amber-950/40 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-amber-500/20">
              ⭐
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Мои закладки и задачи
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-semibold">
                  {bookmarks.length} сохранено
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Важные решения и конспекты для повторения перед уроком
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {bookmarks.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-3xl">
                ⭐
              </div>
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Пока нет сохранённых решений
              </h3>
              <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                Нажми на звездочку ⭐ на любом решении от ИИ в чате, чтобы сохранить его сюда и быстро повторить перед уроком!
              </p>
            </div>
          ) : (
            bookmarks.map((bm) => {
              const isCopied = copiedId === bm.id;
              return (
                <div
                  key={bm.id}
                  className="p-4 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-amber-300 dark:hover:border-amber-700/60 transition-all space-y-2.5 shadow-2xs group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {bm.title || 'Решение задания'}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-medium">
                        {bm.date}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleCopy(bm)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Скопировать"
                      >
                        {isCopied ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleRemove(bm)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                        title="Удалить из закладок"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Snippet of content */}
                  <div className="text-xs text-slate-700 dark:text-slate-300 line-clamp-3 bg-white dark:bg-slate-900/80 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800 whitespace-pre-wrap leading-relaxed">
                    {bm.content}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <span>Закладки хранятся на твоём устройстве и доступны без интернета</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold cursor-pointer transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

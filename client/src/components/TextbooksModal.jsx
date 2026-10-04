import React, { useState } from 'react';
import { X, BookOpen, ExternalLink, MessageSquare, ChevronDown, ChevronUp, Sparkles, Download } from 'lucide-react';
import { TEXTBOOKS } from '../constants/textbooks.js';

export default function TextbooksModal({ isOpen, onClose, onAskBookTopic }) {
  const [activeBookId, setActiveBookId] = useState(TEXTBOOKS[0].id);
  const [expandedChapter, setExpandedChapter] = useState(0);
  const [pdfViewerUrl, setPdfViewerUrl] = useState(null);

  if (!isOpen) return null;

  const currentBook = TEXTBOOKS.find(b => b.id === activeBookId) || TEXTBOOKS[0];

  const handleOpenPdf = (fileUrl) => {
    // Determine base path (relative to origin/base)
    const base = import.meta.env.BASE_URL || '/';
    const cleanBase = base.endsWith('/') ? base : base + '/';
    const fullUrl = cleanBase + fileUrl;
    setPdfViewerUrl(fullUrl);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-2 sm:p-4 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      >
        {/* Modal Window */}
        <div
          className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-xl font-bold shadow-md shadow-indigo-500/20">
                📚
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  Школьные учебники (7 класс)
                  <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800">
                    ФГОС 2023
                  </span>
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Алгебра, геометрия и русский язык с оглавлением и поддержкой ИИ
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

          {/* Book Tabs */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 overflow-x-auto no-scrollbar bg-white dark:bg-slate-900">
            {TEXTBOOKS.map((b) => {
              const isSelected = b.id === activeBookId;
              return (
                <button
                  key={b.id}
                  onClick={() => {
                    setActiveBookId(b.id);
                    setExpandedChapter(0);
                  }}
                  className={`
                    flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shadow-2xs
                    ${isSelected
                      ? `bg-gradient-to-r ${b.color} text-white shadow-md shadow-indigo-500/10`
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}
                  `}
                >
                  <span className="text-sm">{b.icon}</span>
                  <span>{b.subject} ({b.grade})</span>
                </button>
              );
            })}
          </div>

          {/* Book Detail & Chapters Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Textbook Info Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-indigo-50/30 dark:from-slate-800/80 dark:to-indigo-950/20 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-lg ${currentBook.badgeColor}`}>
                    {currentBook.grade}
                  </span>
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                    {currentBook.publisher}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {currentBook.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Авторы:</span> {currentBook.authors}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap sm:flex-col gap-2 shrink-0">
                <button
                  onClick={() => handleOpenPdf(currentBook.file)}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-all shadow-sm shadow-indigo-500/20 cursor-pointer"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Открыть учебник (PDF)</span>
                </button>

                <button
                  onClick={() => {
                    onAskBookTopic(`Я учусь по учебнику "${currentBook.title}" (${currentBook.authors}). Помоги мне разобраться с домашним заданием: `);
                    onClose();
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 text-slate-700 dark:text-slate-200 font-medium text-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Задать вопрос ИИ</span>
                </button>
              </div>
            </div>

            {/* Chapters & Topics List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                Оглавление и темы для изучения
              </h4>

              <div className="space-y-2">
                {currentBook.chapters.map((chap, cIdx) => {
                  const isExpanded = expandedChapter === cIdx;
                  return (
                    <div
                      key={cIdx}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 overflow-hidden shadow-2xs transition-all"
                    >
                      {/* Chapter Accordion Header */}
                      <button
                        type="button"
                        onClick={() => setExpandedChapter(isExpanded ? null : cIdx)}
                        className="w-full flex items-center justify-between p-3.5 text-left text-xs font-bold text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-500" />
                          {chap.title}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </button>

                      {/* Topics */}
                      {isExpanded && (
                        <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-100 dark:border-slate-700/60 space-y-1.5 animate-fadeIn">
                          {chap.topics.map((top, tIdx) => (
                            <div
                              key={tIdx}
                              className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/50 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/50 transition-all text-xs"
                            >
                              <span className="text-slate-700 dark:text-slate-300 pr-2">
                                {top}
                              </span>
                              <button
                                onClick={() => {
                                  onAskBookTopic(`Объясни тему из учебника "${currentBook.title}" (${currentBook.authors}):\n«${top}». Приведи правила, формулы и 2 примера с решением.`);
                                  onClose();
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] shrink-0 transition-colors cursor-pointer"
                                title="Изучить тему с ИИ"
                              >
                                <Sparkles className="w-3 h-3 text-indigo-500" />
                                <span>Объяснить</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen PDF Viewer Modal */}
      {pdfViewerUrl && (
        <div className="fixed inset-0 z-60 bg-black/80 flex flex-col p-2 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-5xl h-full mx-auto flex flex-col bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 text-white border-b border-slate-800">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-semibold truncate max-w-xs sm:max-w-md">
                  {currentBook.title}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={pdfViewerUrl}
                  download
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Скачать</span>
                </a>
                <button
                  onClick={() => setPdfViewerUrl(null)}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Embedded Iframe */}
            <iframe
              src={pdfViewerUrl}
              title={currentBook.title}
              className="w-full flex-1 border-0 bg-slate-100"
            />
          </div>
        </div>
      )}
    </>
  );
}

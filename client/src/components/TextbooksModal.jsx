import React, { useState, useEffect } from 'react';
import { X, BookOpen, ChevronDown, ChevronUp, Sparkles, Download, Camera, ArrowLeft, ArrowRight, Loader2, Search } from 'lucide-react';
import { TEXTBOOKS } from '../constants/textbooks.js';
import { renderPdfPageToDataUrl } from '../services/pdfRenderer.js';
import { findPageForExercise } from '../constants/exerciseIndex.js';

export default function TextbooksModal({ isOpen, onClose, onAskBookTopic, onSendBookPage }) {
  const [activeBookId, setActiveBookId] = useState(TEXTBOOKS[0].id);
  const [expandedChapter, setExpandedChapter] = useState(0);
  const [pdfViewerUrl, setPdfViewerUrl] = useState(null);

  // Page selector & image render state
  const [pageInput, setPageInput] = useState('36');
  const [currentPage, setCurrentPage] = useState(36);
  const [totalPages, setTotalPages] = useState(257);
  const [exerciseInput, setExerciseInput] = useState('');
  const [pagePreview, setPagePreview] = useState(null);
  const [loadingPage, setLoadingPage] = useState(false);

  const currentBook = TEXTBOOKS.find(b => b.id === activeBookId) || TEXTBOOKS[0];

  // Set default page when changing book
  useEffect(() => {
    setExerciseInput('');
    if (activeBookId === 'algebra_7') {
      setCurrentPage(36);
      setPageInput('36');
      setTotalPages(257);
    } else if (activeBookId === 'geometry_7_9') {
      setCurrentPage(29);
      setPageInput('29');
      setTotalPages(417);
    } else if (activeBookId === 'russian_7_1') {
      setCurrentPage(89);
      setPageInput('89');
      setTotalPages(249);
    }
  }, [activeBookId]);

  // Load preview when currentPage changes and modal is open
  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;

    async function loadPage() {
      setLoadingPage(true);
      try {
        const res = await renderPdfPageToDataUrl(currentBook.file, currentPage, 0.9);
        if (!cancelled) {
          setPagePreview(res.dataUrl);
          setTotalPages(res.totalPages);
        }
      } catch (err) {
        console.warn('Preview error:', err);
      } finally {
        if (!cancelled) setLoadingPage(false);
      }
    }

    loadPage();
    return () => { cancelled = true; };
  }, [currentBook.file, currentPage, isOpen]);

  if (!isOpen) return null;

  const handleOpenPdf = (fileUrl) => {
    const base = import.meta.env.BASE_URL || './';
    const cleanBase = base.endsWith('/') ? base : base + '/';
    const cleanPath = fileUrl.startsWith('/') ? fileUrl.slice(1) : fileUrl;
    const fullUrl = fileUrl.startsWith('http')
      ? fileUrl
      : new URL(cleanBase + cleanPath, window.location.href).href;
    setPdfViewerUrl(fullUrl);
  };

  const handleGoToPage = (num) => {
    const p = Math.max(1, Math.min(num, totalPages));
    setCurrentPage(p);
    setPageInput(String(p));
  };

  const handleSearchExercise = (val) => {
    setExerciseInput(val);
    const num = parseInt(val, 10);
    if (num && num > 0) {
      const p = findPageForExercise(activeBookId, num);
      handleGoToPage(p);
    }
  };

  const handleSendToAi = async () => {
    setLoadingPage(true);
    try {
      // High-res render for AI
      const res = await renderPdfPageToDataUrl(currentBook.file, currentPage, 1.5);
      const exNumText = exerciseInput.trim() ? `задание №${exerciseInput.trim()}` : `задания`;
      const textPrompt = `Реши ${exNumText} со страницы ${currentPage} учебника «${currentBook.title}» (${currentBook.authors}). Объясни всё подробно и пошагово с формулами:`;
      if (onSendBookPage) {
        onSendBookPage(textPrompt, [res.dataUrl]);
      } else if (onAskBookTopic) {
        onAskBookTopic(textPrompt);
      }
      onClose();
    } catch (err) {
      alert('Ошибка при подготовке страницы: ' + err.message);
    } finally {
      setLoadingPage(false);
    }
  };

  return (
    <>
      {/* Full screen on mobile, elegant dialog on desktop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center sm:p-4 bg-slate-950/80 animate-fade-in"
        onClick={onClose}
      >
        {/* Modal / Screen Window */}
        <div
          className="relative w-full h-full sm:h-auto sm:max-w-4xl sm:max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 sm:rounded-3xl shadow-2xl sm:border border-slate-200 dark:border-slate-800 overflow-hidden pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:pt-0 sm:pb-0 animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 shrink-0">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={onClose}
                className="sm:hidden p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Назад"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-lg sm:text-xl font-bold shadow-md shadow-indigo-500/20 shrink-0">
                📚
              </div>
              <div className="min-w-0">
                <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5 sm:gap-2 truncate">
                  <span>Учебники</span>
                  <span className="text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-300 dark:border-emerald-800 shrink-0">
                    PDF
                  </span>
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                  Выбирай страницу или номер задания
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
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
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            {/* Quick Page Sender to AI */}
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-50/80 via-white to-purple-50/50 dark:from-slate-800/90 dark:via-slate-800/60 dark:to-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/60 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <span>📸 Отправить страницу учебника нейросети</span>
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Укажи номер страницы — нейросеть с фото-зрением сама прочитает номера заданий и решит их!
                  </p>
                </div>

                {/* Exercise Search & Page Navigation Controls */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  {/* Quick Task # Input */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/90 dark:border-indigo-800 text-xs">
                    <span className="text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">№ задачи:</span>
                    <input
                      type="number"
                      placeholder="148"
                      value={exerciseInput}
                      onChange={(e) => handleSearchExercise(e.target.value)}
                      className="w-14 px-1.5 py-1 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 text-center font-bold text-xs text-indigo-900 dark:text-indigo-200 outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleGoToPage(currentPage - 1)}
                      disabled={currentPage <= 1}
                      className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                      title="Предыдущая страница"
                    >
                      <ArrowLeft className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                    </button>

                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-500">Стр.</span>
                      <input
                        type="number"
                        value={pageInput}
                        onChange={(e) => setPageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleGoToPage(parseInt(pageInput, 10) || 1);
                        }}
                        className="w-14 px-1.5 py-1 rounded-lg border border-indigo-300 dark:border-indigo-700 bg-white dark:bg-slate-800 text-center font-bold text-xs text-indigo-900 dark:text-indigo-200 outline-none"
                      />
                      <span className="text-slate-400">из {totalPages}</span>
                    </div>

                    <button
                      onClick={() => handleGoToPage(currentPage + 1)}
                      disabled={currentPage >= totalPages}
                      className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 disabled:opacity-40 transition-colors cursor-pointer"
                      title="Следующая страница"
                    >
                      <ArrowRight className="w-4 h-4 text-slate-700 dark:text-slate-200" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview & Send Button Area */}
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-indigo-100 dark:border-slate-700/60">
                {/* Page Preview Thumbnail */}
                <div className="relative w-36 h-48 sm:w-40 sm:h-52 bg-slate-100 dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 shadow-md shrink-0 flex items-center justify-center">
                  {loadingPage ? (
                    <div className="flex flex-col items-center gap-2 text-indigo-500">
                      <Loader2 className="w-6 h-6 animate-spin" />
                      <span className="text-[10px]">Загрузка стр...</span>
                    </div>
                  ) : pagePreview ? (
                    <img
                      src={pagePreview}
                      alt={`Стр. ${currentPage}`}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-slate-400">Нет превью</span>
                  )}
                </div>

                {/* Info & Big Send Button */}
                <div className="flex-1 space-y-3 w-full">
                  <div className="text-xs text-slate-600 dark:text-slate-300 space-y-1">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">
                      📖 {currentBook.title} — Страница {currentPage}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                      Нейросеть получит снимок этой страницы в максимальном качестве, прочитает условие нужного номера и выдаст пошаговое оформление в тетрадь.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-1">
                    <button
                      onClick={handleSendToAi}
                      disabled={loadingPage}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer disabled:opacity-60"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Отправить эту страницу ИИ для решения</span>
                    </button>

                    <button
                      onClick={() => handleOpenPdf(currentBook.file)}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium text-xs transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>Открыть всю книгу</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Chapters & Topics List */}
            <div className="space-y-2.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                Оглавление и темы программы
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

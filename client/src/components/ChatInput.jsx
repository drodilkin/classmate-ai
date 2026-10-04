import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Plus, Camera, Image as GalleryIcon, X, StopCircle, Zap, ListOrdered, CheckCircle2, BookOpen, Sparkles } from 'lucide-react';
import { detectExerciseInQuery } from '../constants/exerciseIndex.js';
import { renderPdfPageToDataUrl } from '../services/pdfRenderer.js';
import { triggerHaptic } from '../utils/haptics.js';

const QUICK_MATH = ['√', 'x²', 'π', '±', '≤', '≥', '÷', '≈', '°'];

export default function ChatInput({ onSend, onStop, streaming, onOpenTextbooks, activeSubject }) {
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [attachingExercise, setAttachingExercise] = useState(false);
  const [selectedSubjectOverride, setSelectedSubjectOverride] = useState(null);

  const textareaRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const menuRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [text]);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [menuOpen]);

  // Handle files selection
  const handleFiles = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
    if (e.target) e.target.value = '';
    setMenuOpen(false);
  };

  // Handle clipboard paste (Ctrl+V)
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            setImages(prev => [...prev, ev.target.result]);
          };
          reader.readAsDataURL(file);
        }
      }
    }
  };

  const removeImage = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const detectedExercise = detectExerciseInQuery(text, activeSubject);
  const currentAlternative = detectedExercise
    ? (detectedExercise.alternatives?.find(a => a.id === selectedSubjectOverride) ||
       detectedExercise.alternatives?.find(a => a.id === detectedExercise.subject) ||
       detectedExercise.alternatives?.[0] ||
       detectedExercise)
    : null;

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if ((!text.trim() && images.length === 0) || streaming) return;

    triggerHaptic('medium');

    onSend(text.trim(), images, currentAlternative);
    setText('');
    setImages([]);
    setSelectedSubjectOverride(null);
    setMenuOpen(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Append Quick Modifier (e.g. "Кратко в строчку")
  const appendModifierAndSend = (instruction) => {
    const baseText = text.trim();
    if (!baseText && images.length === 0) return;
    triggerHaptic('light');
    const finalText = baseText ? `${baseText}\n\n[Инструкция: ${instruction}]` : `[Инструкция: ${instruction}]`;
    onSend(finalText, images, currentAlternative);
    setText('');
    setImages([]);
    setSelectedSubjectOverride(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleAttachExercisePage = async () => {
    if (!currentAlternative || attachingExercise) return;
    triggerHaptic('medium');
    setAttachingExercise(true);
    try {
      const res = await renderPdfPageToDataUrl(currentAlternative.bookFile, currentAlternative.page, 1.4);
      setImages(prev => [...prev, res.dataUrl]);
    } catch (err) {
      alert('Ошибка при загрузке страницы: ' + err.message);
    } finally {
      setAttachingExercise(false);
    }
  };

  const insertSymbol = (sym) => {
    triggerHaptic('selection');
    setText((prev) => prev + sym);
    textareaRef.current?.focus();
  };

  return (
    <div className="p-2.5 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 relative transition-colors">
      <div className="max-w-3xl mx-auto space-y-2">
        {/* Quick action chips & formula toolbar */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
          {/* "Кратко в строчку" chip */}
          <button
            type="button"
            onClick={() => appendModifierAndSend('Ответь максимально кратко, ровно в одну строчку.')}
            disabled={!text.trim() && images.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/80 hover:bg-amber-100 dark:hover:bg-amber-900/60 transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
            title="Получить ответ ровно в одну строчку"
          >
            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            <span>⚡ Кратко в строчку</span>
          </button>

          {/* "Пошагово" chip */}
          <button
            type="button"
            onClick={() => appendModifierAndSend('Объясни подробное решение пошагово по пунктам с правилами.')}
            disabled={!text.trim() && images.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            <ListOrdered className="w-3 h-3 text-indigo-500" />
            <span>Пошагово</span>
          </button>

          {/* "Только ответ" chip */}
          <button
            type="button"
            onClick={() => appendModifierAndSend('Напиши только итоговый ответ без лишних рассуждений.')}
            disabled={!text.trim() && images.length === 0}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/80 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-all cursor-pointer shrink-0 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xs"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Только ответ</span>
          </button>

          {/* "Арт 4K" image generation chip */}
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              setText(prev => {
                const base = prev.trim();
                return base ? `Нарисуй арт: ${base}` : 'Нарисуй арт: ';
              });
              if (textareaRef.current) textareaRef.current.focus();
            }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800/80 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-all cursor-pointer shrink-0 shadow-2xs native-touch"
            title="Сгенерировать 4K изображение нейросетью Midjourney Ultra"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-500 fill-purple-500/20" />
            <span>✨ Арт 4K</span>
          </button>

          {/* Math symbols */}
          <div className="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1 shrink-0" />
          {QUICK_MATH.map((sym) => (
            <button
              key={sym}
              type="button"
              onClick={() => insertSymbol(sym)}
              className="px-2 py-0.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-200/60 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-mono text-xs border border-slate-200/60 dark:border-slate-700/60 transition-colors shrink-0 cursor-pointer"
            >
              {sym}
            </button>
          ))}
        </div>

        {/* Auto-detected Textbook Exercise Chip with 1-tap Subject Switch */}
        {detectedExercise && currentAlternative && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-2.5 sm:px-3 sm:py-2 rounded-2xl bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50 dark:from-slate-800 dark:via-indigo-950/60 dark:to-purple-950/40 border border-indigo-200/90 dark:border-indigo-800/80 shadow-xs animate-fadeIn">
            <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar py-0.5">
              <span className="text-base shrink-0">📖</span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 shrink-0">
                №{detectedExercise.number}:
              </span>
              <div className="flex items-center gap-1.5 shrink-0">
                {detectedExercise.alternatives?.map((alt) => {
                  const isSelected = alt.id === currentAlternative.id;
                  return (
                    <button
                      key={alt.id}
                      type="button"
                      onClick={() => setSelectedSubjectOverride(alt.id)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 text-white font-bold shadow-xs scale-102 ring-2 ring-indigo-500/30'
                          : 'bg-white/90 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/70 dark:border-slate-600/70'
                      }`}
                      title={alt.fullName}
                    >
                      <span>{alt.icon}</span>
                      <span>{alt.shortLabel}</span>
                      <span className={`text-[10px] px-1 py-0.2 rounded-md ${
                        isSelected 
                          ? 'bg-indigo-700 text-indigo-100 font-semibold' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}>
                        стр. {alt.page}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
            <button
              type="button"
              onClick={handleAttachExercisePage}
              disabled={attachingExercise}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer shrink-0 disabled:opacity-60"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>{attachingExercise ? 'Подготовка...' : 'Прикрепить страницу'}</span>
            </button>
          </div>
        )}

        {/* Images Preview Strip */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 dark:border-slate-600 shadow-2xs group">
                <img src={img} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-slate-900/80 hover:bg-slate-900 text-white rounded-full p-0.5 transition-colors cursor-pointer"
                  title="Удалить фото"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Card */}
        <div className={`relative flex items-end gap-1.5 sm:gap-2 bg-slate-50/90 dark:bg-slate-800/80 border ${
          isListening 
            ? 'border-red-500 ring-2 ring-red-500/20 bg-red-50/20 dark:bg-red-950/20' 
            : 'border-slate-200 dark:border-slate-700/80 focus-within:border-indigo-500/60 focus-within:ring-2 focus-within:ring-indigo-500/10'
        } rounded-2xl p-1.5 sm:p-2 transition-all shadow-2xs`}>
          
          {/* Hidden Inputs for Camera and Gallery */}
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleFiles}
          />
          <input
            ref={galleryInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFiles}
          />

          {/* Direct Mobile Camera Button for instant photo of homework */}
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            className="sm:hidden p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 active:scale-90"
            title="Сделать фото задания"
          >
            <Camera className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </button>

          {/* Plus Button Container with Popover Menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(prev => !prev)}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center active:scale-90 ${
                menuOpen 
                  ? 'bg-indigo-600 text-white rotate-45 shadow-sm' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
              }`}
              title="Добавить фото: Камера или Галерея"
            >
              <Plus className="w-5 h-5 transition-transform duration-200" />
            </button>

            {/* Popup Menu */}
            {menuOpen && (
              <div className="absolute bottom-12 left-0 z-50 w-56 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700 p-1.5 animate-scale-up">
                <div className="px-2.5 py-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-700/60 mb-1">
                  Прикрепить задание
                </div>

                {/* Option 1: Camera */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    cameraInputRef.current?.click();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/40 hover:text-orange-950 dark:hover:text-orange-200 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Сделать фото</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">Открыть камеру телефона</div>
                  </div>
                </button>

                {/* Option 2: Gallery */}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    galleryInputRef.current?.click();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-950 dark:hover:text-indigo-200 transition-colors cursor-pointer group"
                >
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <GalleryIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Галерея / Файлы</div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">Выбрать готовые фото</div>
                  </div>
                </button>

                {/* Option 3: Textbook Page */}
                {onOpenTextbooks && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onOpenTextbooks();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-950 dark:hover:text-amber-200 transition-colors cursor-pointer group border-t border-slate-100 dark:border-slate-700/60 mt-0.5"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>Страница из учебника</span>
                        <span className="text-[9px] px-1 py-0.2 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 font-bold">
                          7 кл
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">Алгебра, геометрия, русский</div>
                    </div>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Задай вопрос, прикрепи фото задачи или номер №..."
            className="w-full bg-transparent resize-none outline-none text-slate-800 dark:text-slate-100 text-sm placeholder:text-slate-400 dark:placeholder:text-slate-500 py-1.5 px-1 max-h-44 leading-relaxed"
          />

          {/* Action Button: Send or Stop */}
          {streaming ? (
            <button
              type="button"
              onClick={onStop}
              className="p-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Остановить ответ"
            >
              <StopCircle className="w-5 h-5 text-orange-400" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!text.trim() && images.length === 0}
              className={`
                p-2 rounded-xl transition-all cursor-pointer shrink-0 shadow-2xs
                ${(!text.trim() && images.length === 0)
                  ? 'bg-slate-200 dark:bg-slate-700/60 text-slate-400 dark:text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white active:scale-95 shadow-sm shadow-indigo-500/20'}
              `}
              title="Отправить (Enter)"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="hidden sm:flex items-center justify-between px-2 text-[11px] text-slate-400 dark:text-slate-500">
          <span>Нажми ⚡ «Кратко в строчку» для моментального лаконичного ответа</span>
          <span>ClassMate AI</span>
        </div>
      </div>
    </div>
  );
}

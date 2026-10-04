import React, { useState, useEffect, useRef } from 'react';
import {
  Copy, Check, ZoomIn, X, Share2, Volume2, VolumeX,
  Star, Sparkles, ThumbsUp, HelpCircle, ArrowRight
} from 'lucide-react';
import { parseMarkdown } from '../utils/markdown.js';
import { toggleBookmark, isItemBookmarked, recordTaskCompleted } from '../services/studyTracker.js';

export default function MessageItem({ message, isLast, streaming, onFollowUp }) {
  const [copied, setCopied] = useState(false);
  const [copiedAnswer, setCopiedAnswer] = useState(false);
  const [shared, setShared] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [understood, setUnderstood] = useState(false);

  const isUser = message.role === 'user';

  // Check if bookmarked on load
  useEffect(() => {
    if (!isUser && message.content) {
      setBookmarked(isItemBookmarked(message.content));
    }
  }, [message.content, isUser]);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (isSpeaking && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Smart Answer Extraction
  const handleCopyOnlyAnswer = () => {
    const text = message.content || '';
    const match = text.match(/(?:Ответ|Итоговый ответ|Итог|Вывод)\s*[:—–-]\s*([^\n]+(?:\n[^\n]+)?)/i);
    let answer = match ? match[1].trim() : '';
    if (!answer) {
      const lines = text.trim().split('\n').filter(l => l.trim().length > 0);
      answer = lines[lines.length - 1] || text;
    }
    // Clean markdown bold/stars
    answer = answer.replace(/\*\*/g, '').replace(/`/g, '');
    navigator.clipboard.writeText(answer);
    setCopiedAnswer(true);
    setTimeout(() => setCopiedAnswer(false), 2000);
  };

  const handleShare = async () => {
    const textToShare = message.content || '';
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Решение от ClassMate AI',
          text: textToShare,
        });
        return;
      } catch (err) {
        if (err.name === 'AbortError') return;
      }
    }
    // Fallback: copy to clipboard
    navigator.clipboard.writeText(textToShare);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  // Text to Speech
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Озвучка не поддерживается вашим браузером');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text for speech
    const cleanText = (message.content || '')
      .replace(/[#*`$]/g, '')
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 делить на $2')
      .replace(/\\[a-zA-Z]+/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const ruVoice = voices.find(v => v.lang.startsWith('ru') || v.lang.includes('RU'));
    if (ruVoice) utterance.voice = ruVoice;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Toggle Bookmark
  const handleBookmark = () => {
    toggleBookmark({
      id: message.id || 'msg_' + (message.timestamp || Date.now()),
      title: (message.content || '').slice(0, 32) + '...',
      content: message.content,
      subject: 'Учёба',
      timestamp: Date.now()
    });
    setBookmarked(!bookmarked);
  };

  // Mark as Understood & Completed
  const handleMarkUnderstood = () => {
    if (understood) return;
    setUnderstood(true);
    recordTaskCompleted();
  };

  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  // 1. USER MESSAGE (Bubble on the Right)
  if (isUser) {
    return (
      <div className="py-2.5 px-3 sm:px-6 flex justify-end animate-slide-right">
        <div className="max-w-[88%] sm:max-w-[75%] flex flex-col items-end gap-1.5">
          {/* Images if attached */}
          {message.images && message.images.length > 0 && (
            <div className="flex flex-wrap justify-end gap-2 mb-1">
              {message.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImg(img)}
                  className="relative group w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border border-indigo-200/50 dark:border-indigo-900/50 cursor-pointer shadow-md hover:scale-105 transition-all"
                >
                  <img
                    src={img}
                    alt={`attachment-${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ZoomIn className="w-5 h-5 text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Text Bubble */}
          {message.content && (
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 text-white px-4 py-3 rounded-2xl rounded-tr-xs text-sm leading-relaxed shadow-sm shadow-indigo-500/10 break-words whitespace-pre-wrap selection:bg-white/30">
              {message.content}
            </div>
          )}

          {/* Timestamp */}
          {formattedTime && (
            <span className="text-[11px] text-slate-400 dark:text-slate-500 pr-1 select-none">
              {formattedTime}
            </span>
          )}

          {/* Lightbox for attachments */}
          {selectedImg && (
            <div
              className="fixed inset-0 bg-slate-950/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
              onClick={() => setSelectedImg(null)}
            >
              <div className="relative max-w-4xl max-h-[90vh]">
                <button
                  onClick={() => setSelectedImg(null)}
                  className="absolute -top-10 right-0 text-white hover:text-slate-300 p-1"
                >
                  <X className="w-6 h-6" />
                </button>
                <img
                  src={selectedImg}
                  alt="full preview"
                  className="max-w-full max-h-[85vh] rounded-2xl shadow-2xl object-contain bg-white dark:bg-slate-900"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 2. ASSISTANT MESSAGE (Card on the Left)
  const isTyping = isLast && streaming && !message.content;

  return (
    <div className="py-2.5 px-3 sm:px-6 flex justify-start gap-2.5 sm:gap-3.5 animate-slide-left">
      {/* Bot Avatar */}
      <div className="shrink-0 mt-0.5">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/25 ring-2 ring-white/20">
          🎓
        </div>
      </div>

      <div className="max-w-[94%] sm:max-w-[85%] flex flex-col items-start gap-1.5 flex-1 min-w-0">
        {/* Assistant Card with Glass Gradient */}
        <div className="bg-white/95 dark:bg-slate-800/90 border border-slate-200/90 dark:border-slate-700/70 rounded-3xl rounded-tl-xs px-4 sm:px-5 py-3.5 sm:py-4 text-sm text-slate-800 dark:text-slate-100 shadow-xs backdrop-blur-xs break-words w-full space-y-2.5 relative overflow-hidden">
          
          {/* Top highlight gradient strip */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-90" />

          {/* Header row in card */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-700/50 text-xs">
            <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1">
                ClassMate AI
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200/50 dark:border-indigo-800/40">
                Репетитор 7 класс
              </span>
              <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Проверено
              </span>
            </div>

            {/* Top action buttons */}
            {message.content && (
              <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
                {/* Text-to-Speech (Озвучка) */}
                <button
                  type="button"
                  onClick={toggleSpeech}
                  className={`p-1.5 rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1 ${
                    isSpeaking
                      ? 'bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-bold ring-1 ring-indigo-500/40'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                  title={isSpeaking ? 'Остановить озвучку' : 'Озвучить решение вслух'}
                >
                  {isSpeaking ? (
                    <>
                      <VolumeX className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 animate-pulse" />
                      <span className="text-[10px] hidden sm:inline text-indigo-600 dark:text-indigo-400">Стоп</span>
                    </>
                  ) : (
                    <>
                      <Volume2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] hidden sm:inline">Озвучить</span>
                    </>
                  )}
                </button>

                {/* Bookmark ⭐ */}
                <button
                  type="button"
                  onClick={handleBookmark}
                  className={`p-1.5 rounded-xl transition-colors cursor-pointer text-xs ${
                    bookmarked
                      ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                      : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                  }`}
                  title={bookmarked ? 'Удалить из закладок' : 'Сохранить в закладки'}
                >
                  <Star className={`w-3.5 h-3.5 ${bookmarked ? 'fill-amber-400 text-amber-500' : ''}`} />
                </button>

                {/* Share button */}
                <button
                  type="button"
                  onClick={handleShare}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer text-xs"
                  title="Поделиться решением"
                >
                  {shared ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Share2 className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Copy button */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/60 transition-colors cursor-pointer text-xs"
                  title="Скопировать всё решение"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Equalizer animation banner while speaking */}
          {isSpeaking && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-xs text-indigo-800 dark:text-indigo-200 animate-fade-in">
              <div className="flex items-end gap-1 h-3.5 shrink-0 px-1">
                <span className="w-1 bg-indigo-600 rounded-full animate-sound-1" />
                <span className="w-1 bg-indigo-600 rounded-full animate-sound-2" />
                <span className="w-1 bg-indigo-600 rounded-full animate-sound-3" />
                <span className="w-1 bg-indigo-600 rounded-full animate-sound-1" />
              </div>
              <span className="font-medium text-[11px]">Озвучиваю решение вслух (русский голос)...</span>
            </div>
          )}

          {/* Typing dots indicator */}
          {isTyping && (
            <div className="flex items-center gap-2 py-3 px-1">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse-dot" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse-dot" style={{ animationDelay: '200ms' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-pulse-dot" style={{ animationDelay: '400ms' }} />
              </div>
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 ml-1">
                Решаю задание и оформляю пошаговый ответ...
              </span>
            </div>
          )}

          {/* Rendered content */}
          {message.content && (
            <div
              className="prose-mistral dark:text-slate-100"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
            />
          )}

          {/* Streaming cursor if content is still arriving */}
          {isLast && streaming && message.content && (
            <span className="cursor-blink" />
          )}

          {/* Interactive Action Bar on Solved Solution */}
          {!streaming && message.content && (
            <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-700/50 flex flex-wrap items-center justify-between gap-1.5 text-xs">
              <div className="flex flex-wrap items-center gap-1.5">
                {/* 🎯 Copy Only Answer */}
                <button
                  type="button"
                  onClick={handleCopyOnlyAnswer}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100/80 dark:bg-slate-700/60 hover:bg-slate-200/70 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold transition-all cursor-pointer shadow-2xs active:scale-95"
                  title="Скопировать только итоговый ответ"
                >
                  {copiedAnswer ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Ответ скопирован!</span>
                    </>
                  ) : (
                    <>
                      <span>🎯</span>
                      <span>Только ответ</span>
                    </>
                  )}
                </button>

                {/* 💡 Explain simpler */}
                {onFollowUp && (
                  <button
                    type="button"
                    onClick={() => onFollowUp('Объясни это решение проще и понятнее, простыми словами для 7 класса')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    <Sparkles className="w-3 h-3 text-indigo-500" />
                    <span>Объясни проще</span>
                  </button>
                )}

                {/* 📝 Similar task */}
                {onFollowUp && (
                  <button
                    type="button"
                    onClick={() => onFollowUp('Дай похожее тренировочное задание для закрепления темы с ответом')}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 font-medium transition-all cursor-pointer shadow-2xs active:scale-95"
                  >
                    <span>📝</span>
                    <span>Похожий номер</span>
                  </button>
                )}
              </div>

              {/* "Понятно!" completion feedback */}
              <button
                type="button"
                onClick={handleMarkUnderstood}
                disabled={understood}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-xl transition-all cursor-pointer font-semibold shadow-2xs active:scale-95 ${
                  understood
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-300'
                }`}
                title="Отметить задание как понятое и добавить в дневной трекер"
              >
                <ThumbsUp className="w-3 h-3" />
                <span>{understood ? '🎉 Решено!' : 'Понятно!'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Timestamp */}
        {formattedTime && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500 pl-2 select-none">
            {formattedTime}
          </span>
        )}
      </div>
    </div>
  );
}

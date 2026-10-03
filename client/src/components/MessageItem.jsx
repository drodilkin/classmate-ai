import React, { useState } from 'react';
import { Copy, Check, ZoomIn, X, Share2 } from 'lucide-react';
import { parseMarkdown } from '../utils/markdown.js';

export default function MessageItem({ message, isLast, streaming }) {
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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

  const formattedTime = message.timestamp
    ? new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  // 1. USER MESSAGE (Bubble on the Right)
  if (isUser) {
    return (
      <div className="py-2.5 px-4 sm:px-6 flex justify-end animate-slide-right">
        <div className="max-w-[85%] sm:max-w-[75%] flex flex-col items-end gap-1.5">
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
    <div className="py-2.5 px-4 sm:px-6 flex justify-start gap-3 animate-slide-left">
      {/* Bot Avatar */}
      <div className="shrink-0 mt-0.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-orange-500/20">
          🎓
        </div>
      </div>

      <div className="max-w-[92%] sm:max-w-[85%] flex flex-col items-start gap-1">
        {/* Assistant Card */}
        <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 rounded-2xl rounded-tl-xs px-4 py-3.5 text-sm text-slate-800 dark:text-slate-100 shadow-2xs break-words w-full">
          {/* Header row in card */}
          <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-200/40 dark:border-slate-700/40 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
              ClassMate AI
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-400 font-medium">
                Помощник
              </span>
            </span>

            {message.content && (
              <div className="flex items-center gap-1">
                {/* Share button */}
                <button
                  onClick={handleShare}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer text-xs flex items-center gap-1"
                  title="Поделиться решением"
                >
                  {shared ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Отправлено!</span>
                    </>
                  ) : (
                    <>
                      <Share2 className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">Поделиться</span>
                    </>
                  )}
                </button>

                {/* Copy button */}
                <button
                  onClick={handleCopy}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer text-xs flex items-center gap-1"
                  title="Скопировать ответ"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Скопировано</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span className="text-[11px] hidden sm:inline">Копировать</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Typing dots indicator */}
          {isTyping && (
            <div className="flex items-center gap-1.5 py-2 px-1">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse-dot" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse-dot" style={{ animationDelay: '200ms' }} />
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse-dot" style={{ animationDelay: '400ms' }} />
              <span className="text-xs text-slate-400 dark:text-slate-500 ml-2">Формирую ответ...</span>
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
        </div>

        {/* Timestamp */}
        {formattedTime && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500 pl-1 select-none">
            {formattedTime}
          </span>
        )}
      </div>
    </div>
  );
}

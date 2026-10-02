import React, { useState } from 'react';
import { Copy, Check, User, Bot, ZoomIn, X } from 'lucide-react';
import { parseMarkdown } from '../utils/markdown.js';


export default function MessageItem({ message, isLast, streaming }) {
  const [copied, setCopied] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="py-4 px-4 sm:px-6 hover:bg-slate-50/50 transition-colors animate-msg-in">
      <div className="max-w-3xl mx-auto flex items-start gap-3.5">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-xs shadow-2xs">
              <User className="w-4 h-4" />
            </div>
          ) : (
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
              M
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Author label + time */}
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-800">
              {isUser ? 'Вы' : 'ClassMate AI'}
            </span>


            {!isUser && message.content && (
              <button
                onClick={handleCopy}
                className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-100 transition-colors cursor-pointer text-xs flex items-center gap-1"
                title="Скопировать"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[11px] text-emerald-600">Скопировано</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px]">Копировать</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Attached images preview (if user uploaded photos) */}
          {message.images && message.images.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1 pb-1">
              {message.images.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedImg(img)}
                  className="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-200 cursor-pointer shadow-2xs hover:shadow-md transition-all"
                >
                  <img
                    src={img}
                    alt={`attachment-${idx}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <ZoomIn className="w-4 h-4 text-white" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Text Content */}
          {message.content && (
            <div
              className="prose-mistral"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
            />
          )}

          {/* Typing blinker while streaming */}
          {isLast && streaming && !isUser && (
            <span className="cursor-blink" />
          )}
        </div>
      </div>

      {/* Image Modal (Lightbox) */}
      {selectedImg && (
        <div
          className="fixed inset-0 bg-slate-900/80 z-50 flex items-center justify-center p-4 backdrop-blur-xs"
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
              className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain bg-white"
            />
          </div>
        </div>
      )}
    </div>
  );
}

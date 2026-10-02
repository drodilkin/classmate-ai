import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Image as ImgIcon, X, StopCircle } from 'lucide-react';

export default function ChatInput({ onSend, onStop, streaming }) {
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 180) + 'px';
    }
  }, [text]);

  // Handle files selection
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImages(prev => [...prev, ev.target.result]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = '';
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

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if ((!text.trim() && images.length === 0) || streaming) return;
    onSend(text.trim(), images);
    setText('');
    setImages([]);
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

  return (
    <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
      <div className="max-w-3xl mx-auto">
        {/* Images Preview Strip */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 p-2 bg-slate-50 border border-slate-200 rounded-xl">
            {images.map((img, idx) => (
              <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-300 shadow-2xs group">
                <img src={img} alt="preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 bg-slate-900/70 hover:bg-slate-900 text-white rounded-full p-0.5 transition-colors cursor-pointer"
                  title="Удалить фото"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input Card */}
        <div className="relative flex items-end gap-2 bg-slate-50/80 border border-slate-200 focus-within:border-orange-500/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-orange-500/10 rounded-2xl p-2 transition-all shadow-2xs">
          {/* File Upload Button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-500 hover:text-orange-600 hover:bg-slate-200/50 rounded-xl transition-colors cursor-pointer shrink-0"
            title="Прикрепить фото (можно перетащить или вставить Ctrl+V)"
          >
            <ImgIcon className="w-5 h-5" />
          </button>

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            placeholder="Спроси о чём угодно или прикрепи фото..."
            className="w-full bg-transparent resize-none outline-none text-slate-800 text-sm placeholder:text-slate-400 py-1.5 px-1 max-h-44 leading-relaxed"
          />

          {/* Action Button: Send or Stop */}
          {streaming ? (
            <button
              type="button"
              onClick={onStop}
              className="p-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs"
              title="Остановить генерацию"
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
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white active:scale-95'}
              `}
              title="Отправить (Enter)"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between mt-1.5 px-2 text-[11px] text-slate-400">
          <span>Поддерживается загрузка фото заданий (Ctrl+V)</span>
          <span>ClassMate AI • РФ Без VPN</span>
        </div>
      </div>
    </div>
  );
}

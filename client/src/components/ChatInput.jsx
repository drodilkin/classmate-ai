import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, Plus, Camera, Image as GalleryIcon, X, StopCircle } from 'lucide-react';

export default function ChatInput({ onSend, onStop, streaming }) {
  const [text, setText] = useState('');
  const [images, setImages] = useState([]);
  const [menuOpen, setMenuOpen] = useState(false);

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

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if ((!text.trim() && images.length === 0) || streaming) return;
    onSend(text.trim(), images);
    setText('');
    setImages([]);
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

  return (
    <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 relative transition-colors">
      <div className="max-w-3xl mx-auto">
        {/* Images Preview Strip */}
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2 p-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl">
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
        <div className="relative flex items-end gap-2 bg-slate-50/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 focus-within:border-indigo-500/60 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-2 focus-within:ring-indigo-500/10 rounded-2xl p-2 transition-all shadow-2xs">
          
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

          {/* Plus Button Container with Popover Menu */}
          <div className="relative shrink-0" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen(prev => !prev)}
              className={`p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center ${
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
                  Прикрепить фото задания
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
            placeholder="Спроси о чём угодно или отправь фото задания..."
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

        <div className="flex items-center justify-between mt-1.5 px-2 text-[11px] text-slate-400 dark:text-slate-500">
          <span>Нажми «+» для камеры или фото (или Ctrl+V)</span>
          <span>ClassMate AI • Быстро и без VPN</span>
        </div>
      </div>
    </div>
  );
}

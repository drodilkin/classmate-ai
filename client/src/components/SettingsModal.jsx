import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Trash2 } from 'lucide-react';

const SYSTEM_PROMPT_KEY = 'classmate_system_prompt';

export default function SettingsModal({ isOpen, onClose, darkMode, setDarkMode, onClearAll }) {
  const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem(SYSTEM_PROMPT_KEY) || '');

  useEffect(() => {
    if (isOpen) {
      setSystemPrompt(localStorage.getItem(SYSTEM_PROMPT_KEY) || '');
    }
  }, [isOpen]);

  const handleSystemPromptChange = (e) => {
    const val = e.target.value;
    setSystemPrompt(val);
    localStorage.setItem(SYSTEM_PROMPT_KEY, val);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        {/* Modal panel */}
        <div
          className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200/50 dark:border-slate-700/60 animate-scale-up"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-700/60">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">Настройки</h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">ClassMate AI • Версия 2.0</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-5">
            {/* Dark mode toggle */}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-800 dark:text-slate-200">Тёмная тема</div>
                <div className="text-xs text-slate-400 dark:text-slate-500">Смена оформления</div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                  darkMode ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow-sm transform transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
                <span className="sr-only">{darkMode ? 'Светлая тема' : 'Тёмная тема'}</span>
              </button>
            </div>

            {/* System Prompt */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800 dark:text-slate-200">
                Системная инструкция (System Prompt)
              </label>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Задай контекст или роль для ИИ. Применяется к каждому новому запросу.
              </p>
              <textarea
                rows={4}
                value={systemPrompt}
                onChange={handleSystemPromptChange}
                placeholder="Например: Ты умный репетитор по математике для 10 класса. Объясняй подробно, шаг за шагом..."
                className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-sm p-3 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all"
              />
            </div>

            {/* Clear all chats */}
            <div className="pt-1 border-t border-slate-100 dark:border-slate-700/60">
              <div className="text-sm font-medium text-slate-800 dark:text-slate-200 mb-1">Данные</div>
              <button
                onClick={onClearAll}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 text-sm font-medium transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                Очистить все диалоги
              </button>
            </div>

            {/* About */}
            <div className="pt-1 border-t border-slate-100 dark:border-slate-700/60 text-xs text-slate-400 dark:text-slate-500 space-y-0.5">
              <div className="font-medium text-slate-500 dark:text-slate-400">О приложении</div>
              <div>ClassMate AI — умный помощник для школы</div>
              <div>Версия 2.0 • Mistral / Pixtral Vision</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

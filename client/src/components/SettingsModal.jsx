import React, { useState, useEffect } from 'react';
import { X, Moon, Sun, Trash2, User, LogOut, LogIn, Flame, Sparkles } from 'lucide-react';
import { getStudyStreak, getDailyTasksCount } from '../services/studyTracker.js';

const SYSTEM_PROMPT_KEY = 'classmate_system_prompt';

export default function SettingsModal({
  isOpen,
  onClose,
  darkMode,
  setDarkMode,
  onClearAll,
  user,
  onLogout,
  onOpenLogin
}) {
  const [systemPrompt, setSystemPrompt] = useState(() => localStorage.getItem(SYSTEM_PROMPT_KEY) || '');
  const [streak, setStreak] = useState({ count: 1 });
  const [dailyCount, setDailyCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setSystemPrompt(localStorage.getItem(SYSTEM_PROMPT_KEY) || '');
      setStreak(getStudyStreak());
      setDailyCount(getDailyTasksCount());
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
        className="fixed inset-0 bg-slate-950/70 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 backdrop-blur-xs animate-fade-in"
        onClick={onClose}
      >
        {/* Modal panel */}
        <div
          className="w-full sm:max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-scale-up max-h-[92vh] flex flex-col pb-[max(1rem,env(safe-area-inset-bottom))]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Профиль и настройки
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                ClassMate AI • Версия 2.0
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-5 py-4 space-y-4 overflow-y-auto">
            {/* User Profile Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-indigo-50/80 to-purple-50/50 dark:from-slate-800/90 dark:to-indigo-950/40 border border-indigo-100/80 dark:border-slate-700">
              {user ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-11 h-11 rounded-2xl object-cover ring-2 ring-indigo-500/30"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                        {user.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{user.name}</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-200/80 dark:bg-indigo-900/60 text-indigo-900 dark:text-indigo-200 font-semibold">
                          7 класс
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {user.email || 'Яндекс ID подключён'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onLogout) onLogout();
                      onClose();
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors cursor-pointer"
                    title="Выйти"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-xs text-slate-800 dark:text-slate-200">
                        Гостевой режим
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500">
                        Синхронизируй историю через Яндекс
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (onOpenLogin) onOpenLogin();
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Войти</span>
                  </button>
                </div>
              )}
            </div>

            {/* Streak & Daily progress */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                <span className="text-xl">🔥</span>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Ударный режим: {streak.count} дн.
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                    Решено сегодня: {dailyCount} заданий
                  </div>
                </div>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold">
                Активен
              </span>
            </div>

            {/* Dark mode toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5">
                {darkMode ? (
                  <Moon className="w-4 h-4 text-indigo-400" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                    Тёмная тема
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                    {darkMode ? 'Тёмное оформление' : 'Светлое оформление'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer focus:outline-none ${
                  darkMode ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transform transition-transform ${
                    darkMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* System Prompt */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Инструкция для ИИ-репетитора
              </label>
              <textarea
                rows={3}
                value={systemPrompt}
                onChange={handleSystemPromptChange}
                placeholder="Например: Объясняй пошагово, используй формулы ФСУ для 7 класса..."
                className="w-full resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 text-xs p-3 outline-none focus:border-indigo-400 transition-all"
              />
            </div>

            {/* Clear all chats */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => {
                  if (onClearAll) onClearAll();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/80 dark:border-red-900/60 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Очистить все диалоги</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

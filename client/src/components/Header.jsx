import React, { useState, useEffect } from 'react';
import {
  Menu, ChevronDown, Check, Trash2, Download,
  Sun, Moon, Settings as SettingsIcon, Sparkles,
  Flame, BookOpen, Star, HelpCircle, X
} from 'lucide-react';
import { MODELS } from '../constants/models.js';
import { getStudyStreak, getDailyTasksCount, getBookmarks } from '../services/studyTracker.js';

export default function Header({
  sidebarOpen, setSidebarOpen,
  modelId, onModel,
  onClear, onExport,
  darkMode, setDarkMode, onSettings,
  onOpenCheatSheet, onOpenBookmarks, onOpenTextbooks, onOpenReviews
}) {
  const [modelOpen, setModelOpen] = useState(false);
  const [streakOpen, setStreakOpen] = useState(false);
  const [streak, setStreak] = useState({ count: 1 });
  const [dailyCount, setDailyCount] = useState(0);
  const [bookmarkCount, setBookmarkCount] = useState(0);

  const activeModel = MODELS.find(m => m.id === modelId) || MODELS[0];

  const updateStats = () => {
    setStreak(getStudyStreak());
    setDailyCount(getDailyTasksCount());
    setBookmarkCount(getBookmarks().length);
  };

  useEffect(() => {
    updateStats();
    const handleTask = () => updateStats();
    const handleBm = () => updateStats();
    window.addEventListener('classmate:task_completed', handleTask);
    window.addEventListener('classmate:bookmarks_updated', handleBm);
    return () => {
      window.removeEventListener('classmate:task_completed', handleTask);
      window.removeEventListener('classmate:bookmarks_updated', handleBm);
    };
  }, []);

  const dailyGoal = 5;
  const progressPercent = Math.min(100, Math.round((dailyCount / dailyGoal) * 100));

  return (
    <header className="pt-[env(safe-area-inset-top)] h-[calc(3.5rem+env(safe-area-inset-top))] border-b border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md px-2.5 sm:px-4 flex items-center justify-between z-30 shrink-0 transition-all select-none">
      
      {/* Left section: Toggle & Model Selector */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-xl transition-all cursor-pointer active:scale-95"
            title="Открыть меню"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Model dropdown */}
        <div className="relative">
          <button
            onClick={() => setModelOpen(!modelOpen)}
            className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/90 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all text-xs font-medium text-slate-800 dark:text-slate-100 cursor-pointer shadow-2xs active:scale-98"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20 animate-pulse" />
            <span className="font-bold">{activeModel.name}</span>
            <span className="hidden md:inline text-slate-400 dark:text-slate-500 font-normal">| {activeModel.badge}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </button>

          {modelOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setModelOpen(false)}
              />
              <div className="absolute left-0 mt-2 w-80 sm:w-84 max-h-[75vh] overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 z-50 animate-scale-up space-y-0.5">
                <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider sticky top-0 bg-white dark:bg-slate-900 z-10 border-b border-slate-100 dark:border-slate-800 mb-1">
                  Выбор нейросети ({MODELS.length} моделей)
                </div>

                {MODELS.map(m => {
                  const isCur = m.id === modelId;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        onModel(m.id);
                        setModelOpen(false);
                      }}
                      className={`
                        w-full flex items-start gap-2.5 p-2 rounded-xl text-left text-xs transition-colors cursor-pointer
                        ${isCur
                          ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}
                      `}
                    >
                      <div className="mt-0.5 w-4 h-4 shrink-0 flex items-center justify-center">
                        {isCur ? (
                          <Check className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{m.name}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-semibold">
                            {m.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                          {m.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Center/Right section: Streak widget & Human tool buttons */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        
        {/* Streak Popover Widget */}
        <div className="relative">
          <button
            onClick={() => setStreakOpen(!streakOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950/40 dark:to-amber-950/30 border border-orange-200/90 dark:border-orange-800/80 text-orange-700 dark:text-orange-300 hover:bg-orange-100/60 transition-all cursor-pointer shadow-2xs text-xs font-bold active:scale-95"
            title="Ударный режим и цель дня"
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-bounce" />
            <span>{streak.count} дн.</span>
          </button>

          {streakOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setStreakOpen(false)}
              />
              <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-4 z-50 animate-scale-up space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🔥</span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        Ударный режим: {streak.count} {streak.count === 1 ? 'день' : streak.count < 5 ? 'дня' : 'дней'}!
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Заходи каждый день для сохранения серии
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setStreakOpen(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Daily Goal Bar */}
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Цель дня:</span>
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{dailyCount} из {dailyGoal} заданий</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
                    {dailyCount >= dailyGoal
                      ? '🎉 Отличная работа! Дневная норма выполнена!'
                      : `Осталось решить ${dailyGoal - dailyCount} заданий до цели!`}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Отзывы Button (desktop header, on mobile it is in bottom nav) */}
        <button
          onClick={onOpenReviews}
          className="hidden sm:flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-300 text-slate-700 dark:text-slate-200 transition-all cursor-pointer text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80 shadow-2xs active:scale-95"
          title="Отзывы учеников"
        >
          <span className="text-amber-500">★</span>
          <span>Отзывы</span>
        </button>

        {/* Шпаргалка формул Button */}
        <button
          onClick={onOpenCheatSheet}
          className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:text-indigo-600 dark:hover:text-indigo-300 text-slate-700 dark:text-slate-200 transition-all cursor-pointer text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80 shadow-2xs active:scale-95"
          title="Открыть шпаргалку формул"
        >
          <span>📐</span>
          <span>Формулы</span>
        </button>

        {/* Закладки Button */}
        <button
          onClick={onOpenBookmarks}
          className="hidden sm:flex items-center gap-1 p-2 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:text-amber-600 dark:hover:text-amber-300 text-slate-700 dark:text-slate-200 transition-all cursor-pointer text-xs font-semibold border border-slate-200/80 dark:border-slate-700/80 shadow-2xs active:scale-95"
          title="Мои закладки"
        >
          <Star className={`w-3.5 h-3.5 ${bookmarkCount > 0 ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />
          <span>Закладки</span>
          {bookmarkCount > 0 && (
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-200 dark:bg-amber-900/80 text-amber-900 dark:text-amber-100 font-bold">
              {bookmarkCount}
            </span>
          )}
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer active:scale-95"
          title={darkMode ? 'Включить светлую тему' : 'Включить тёмную тему'}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={onSettings}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer active:scale-95"
          title="Настройки"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        {/* Clear chat */}
        <button
          onClick={onClear}
          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer active:scale-95 hidden sm:inline-flex"
          title="Очистить диалог"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Export */}
        <button
          onClick={onExport}
          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer active:scale-95 hidden sm:inline-flex"
          title="Экспорт в Markdown"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

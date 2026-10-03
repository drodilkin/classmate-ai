import React, { useState } from 'react';
import {
  Menu, ChevronDown, Check, Trash2, Download,
  Sun, Moon, Settings as SettingsIcon, Sparkles
} from 'lucide-react';
import { MODELS } from '../constants/models.js';

export default function Header({
  sidebarOpen, setSidebarOpen,
  modelId, onModel,
  onClear, onExport,
  darkMode, setDarkMode, onSettings
}) {
  const [modelOpen, setModelOpen] = useState(false);
  const activeModel = MODELS.find(m => m.id === modelId) || MODELS[0];

  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm px-3 sm:px-4 flex items-center justify-between z-30 shrink-0 transition-colors">
      {/* Left section: Toggle & Model Selector */}
      <div className="flex items-center gap-2">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title="Открыть меню"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Model dropdown */}
        <div className="relative">
          <button
            onClick={() => setModelOpen(!modelOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all text-xs font-medium text-slate-800 dark:text-slate-100 cursor-pointer shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="font-semibold">{activeModel.name}</span>
            <span className="hidden sm:inline text-slate-400 dark:text-slate-500 font-normal">| {activeModel.badge}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          </button>

          {modelOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setModelOpen(false)}
              />
              <div className="absolute left-0 mt-1.5 w-68 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-1.5 z-50 animate-scale-up">
                <div className="px-2.5 py-1 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  Выбор нейросети
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
                          ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-950 dark:text-orange-200 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}
                      `}
                    >
                      <div className="mt-0.5 w-4 h-4 shrink-0 flex items-center justify-center">
                        {isCur ? (
                          <Check className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900 dark:text-slate-100">{m.name}</span>
                          <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
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

      {/* Right section: Theme toggle, Settings, Clear, Export */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Dark/Light mode toggle */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          title={darkMode ? 'Включить светлую тему' : 'Включить тёмную тему'}
        >
          {darkMode ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Settings button */}
        <button
          onClick={onSettings}
          className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          title="Настройки"
        >
          <SettingsIcon className="w-4 h-4" />
        </button>

        {/* Clear chat */}
        <button
          onClick={onClear}
          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          title="Очистить диалог"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Export */}
        <button
          onClick={onExport}
          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          title="Экспорт диалога в Markdown"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

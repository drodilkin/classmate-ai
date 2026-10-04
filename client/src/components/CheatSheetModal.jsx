import React, { useState } from 'react';
import { X, Search, Copy, Check, Send, Sparkles, BookOpen, ChevronRight, ArrowLeft, Lightbulb } from 'lucide-react';
import { STUDY_DATA } from '../data/studyData.js';

const CHEAT_DATA = {
  russian: STUDY_DATA.russian,
  algebra: STUDY_DATA.algebra,
  geometry: STUDY_DATA.geometry,
  physics: {
    key: 'physics',
    name: 'Физика',
    grade: 'Формулы',
    icon: '⚛️',
    color: 'from-amber-500 to-orange-600',
    accentColor: 'amber',
    sections: [
      {
        id: 'phys_mechanics',
        title: 'Механика и движение',
        description: 'Базовые формулы кинематики и динамики',
        items: [
          {
            name: 'Скорость равномерного движения',
            formula: 'v = s / t',
            rule: 'Скорость равна отношению пройденного пути ко времени движения.',
            desc: 's — путь (м), t — время (с), v — скорость (м/с)',
            tip: 'Чтобы перевести км/ч в м/с, раздели на 3.6: 36 км/ч = 10 м/с.'
          },
          {
            name: 'Плотность вещества',
            formula: 'ρ = m / V',
            rule: 'Плотность показывает массу единицы объёма данного вещества.',
            desc: 'm — масса (кг), V — объем (м³), ρ — плотность (кг/м³)',
            tip: 'Плотность чистой воды: 1000 кг/м³ (или 1 г/см³).'
          },
          {
            name: 'Сила тяжести',
            formula: 'Fт = m · g',
            rule: 'Сила, с которой Земля притягивает к себе тело.',
            desc: 'm — масса (кг), g ≈ 9.8 Н/кг (ускорение свободного падения)',
            tip: 'Не путай массу (в кг, мера инертности) и вес/силу тяжести (в Ньютонах)!'
          },
          {
            name: 'Давление твердых тел',
            formula: 'p = F / S',
            rule: 'Давление равно отношению силы нормального давления к площади поверхности.',
            desc: 'F — сила давления (Н), S — площадь (м²), p — Паскали (Па)',
            tip: 'Чем меньше площадь опоры (лезвие ножа, игла), тем выше давление.'
          }
        ]
      }
    ]
  }
};

export default function CheatSheetModal({ isOpen, onClose, onInsertToChat }) {
  const [activeTab, setActiveTab] = useState('russian');
  const [search, setSearch] = useState('');
  const [copiedFormula, setCopiedFormula] = useState(null);

  if (!isOpen) return null;

  const currentCategory = CHEAT_DATA[activeTab] || CHEAT_DATA.russian;

  const handleCopy = (formula) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  const handleInsert = (item) => {
    if (onInsertToChat) {
      const details = item.formula ? `(${item.formula})` : '';
      onInsertToChat(`Объясни мне подробно формулу или правило: «${item.name}» ${details} с примерами решения.`);
      onClose();
    }
  };

  // Filter items
  const filterQuery = search.toLowerCase().trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full h-full sm:h-auto sm:max-w-2xl bg-white dark:bg-slate-900 sm:border border-slate-200 dark:border-slate-800 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:max-h-[90vh] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:pt-0 sm:pb-0 animate-scale-up">
        
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/90 via-violet-50/60 to-white dark:from-slate-800/90 dark:via-indigo-950/40 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Назад"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center text-base sm:text-lg font-bold shadow-md shadow-indigo-500/20 shrink-0">
              ⚡
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span className="truncate">Шпаргалки и формулы</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold shrink-0">
                  База знаний
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Русский язык (НЕ, причастия, Н/НН), ФСУ, геометрия и физика
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar & Search */}
        <div className="p-3 sm:px-5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 space-y-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            {Object.entries(CHEAT_DATA).map(([key, data]) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20 scale-102'
                      : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  <span>{data.icon}</span>
                  <span>{data.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Поиск в «${currentCategory.name}» (например: причастие, не, квадрат, параллельные)...`}
              className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-500 transition-all shadow-2xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {currentCategory.sections.map((section, sIdx) => {
            const matchedItems = section.items.filter(item => {
              if (!filterQuery) return true;
              return (
                item.name.toLowerCase().includes(filterQuery) ||
                (item.formula && item.formula.toLowerCase().includes(filterQuery)) ||
                (item.rule && item.rule.toLowerCase().includes(filterQuery)) ||
                (item.desc && item.desc.toLowerCase().includes(filterQuery)) ||
                (item.tip && item.tip.toLowerCase().includes(filterQuery))
              );
            });

            if (matchedItems.length === 0) return null;

            return (
              <div key={sIdx} className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {section.title}
                </h3>

                <div className="grid grid-cols-1 gap-2.5">
                  {matchedItems.map((item, iIdx) => {
                    const isCopied = copiedFormula === (item.formula || item.rule);
                    return (
                      <div
                        key={iIdx}
                        className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-600/60 transition-all group flex flex-col justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-2 flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                              {item.name}
                            </span>

                            {/* Action buttons */}
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                onClick={() => handleCopy(item.formula || item.rule)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                                title="Скопировать"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-500" />
                                    <span className="text-emerald-600 dark:text-emerald-400">Скопировано</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3 text-slate-400" />
                                    <span>Копировать</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleInsert(item)}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-2xs cursor-pointer active:scale-95"
                                title="Разобрать эту тему с ИИ"
                              >
                                <Sparkles className="w-3 h-3" />
                                <span>В чат</span>
                              </button>
                            </div>
                          </div>

                          {/* Formula / Rule Header Box */}
                          {item.formula && (
                            <div className="font-mono text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900/90 py-1.5 px-2.5 rounded-xl border border-indigo-100 dark:border-indigo-950/60 inline-block">
                              {item.formula}
                            </div>
                          )}

                          {/* Rule text */}
                          {item.rule && (
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                              {item.rule}
                            </p>
                          )}

                          {/* Description if present */}
                          {item.desc && !item.rule && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                              {item.desc}
                            </p>
                          )}

                          {/* Examples */}
                          {item.examples && item.examples.length > 0 && (
                            <div className="pt-1 space-y-1">
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Примеры:</span>
                              <div className="space-y-1">
                                {item.examples.map((ex, exIdx) => (
                                  <div
                                    key={exIdx}
                                    className="text-xs py-1 px-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-900/40"
                                  >
                                    ✓ {ex.text}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Tip / Mnemonic */}
                          {item.tip && (
                            <div className="flex items-start gap-1.5 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50/80 dark:bg-amber-950/40 p-2 rounded-xl border border-amber-200/70 dark:border-amber-900/60">
                              <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span>{item.tip}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 shrink-0 text-xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Нажмите <strong>«В чат»</strong>, чтобы ИИ решил номер или объяснил правило
          </span>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
            ClassMate AI
          </span>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Search, Copy, Check, Send, Sparkles, BookOpen, ChevronRight } from 'lucide-react';

const CHEAT_DATA = {
  algebra: {
    name: 'Алгебра',
    icon: '🔢',
    color: 'from-blue-500 to-indigo-600',
    sections: [
      {
        title: 'Формулы сокращенного умножения (ФСУ)',
        items: [
          { name: 'Квадрат суммы', formula: '(a + b)² = a² + 2ab + b²', desc: 'Квадрат первого плюс удвоенное произведение плюс квадрат второго' },
          { name: 'Квадрат разности', formula: '(a - b)² = a² - 2ab + b²', desc: 'Квадрат первого минус удвоенное произведение плюс квадрат второго' },
          { name: 'Разность квадратов', formula: 'a² - b² = (a - b)(a + b)', desc: 'Разность квадратов равна произведению разности на сумму' },
          { name: 'Куб суммы', formula: '(a + b)³ = a³ + 3a²b + 3ab² + b³', desc: 'Куб первого плюс 3 на квадрат первого на второй...' },
          { name: 'Куб разности', formula: '(a - b)³ = a³ - 3a²b + 3ab² - b³', desc: 'Куб первого минус 3 на квадрат первого на второй...' },
          { name: 'Сумма кубов', formula: 'a³ + b³ = (a + b)(a² - ab + b²)', desc: 'Сумма на неполный квадрат разности' },
          { name: 'Разность кубов', formula: 'a³ - b³ = (a - b)(a² + ab + b²)', desc: 'Разность на неполный квадрат суммы' }
        ]
      },
      {
        title: 'Свойства степеней',
        items: [
          { name: 'Умножение степеней', formula: 'aⁿ · aᵐ = aⁿ⁺ᵐ', desc: 'При умножении с одинаковым основанием показатели складываются' },
          { name: 'Деление степеней', formula: 'aⁿ / aᵐ = aⁿ⁻ᵐ', desc: 'При делении с одинаковым основанием показатели вычитаются' },
          { name: 'Возведение степени в степень', formula: '(aⁿ)ᵐ = aⁿᵐ', desc: 'Показатели перемножаются' },
          { name: 'Степень произведения', formula: '(a · b)ⁿ = aⁿ · bⁿ', desc: 'Каждый множитель возводится в эту степень' },
          { name: 'Отрицательная степень', formula: 'a⁻ⁿ = 1 / aⁿ', desc: 'Обратное число в положительной степени (a ≠ 0)' },
          { name: 'Нулевая степень', formula: 'a⁰ = 1', desc: 'Любое число (кроме нуля) в нулевой степени равно единице' }
        ]
      },
      {
        title: 'Линейные уравнения и функции',
        items: [
          { name: 'Общий вид линейного уравнения', formula: 'ax + b = 0', desc: 'При a ≠ 0 корень: x = -b / a' },
          { name: 'Линейная функция', formula: 'y = kx + b', desc: 'k — угловой коэффициент (наклон), b — точка пересечения с осью Y' }
        ]
      }
    ]
  },
  geometry: {
    name: 'Геометрия',
    icon: '📐',
    color: 'from-emerald-500 to-teal-600',
    sections: [
      {
        title: 'Признаки равенства треугольников',
        items: [
          { name: 'I признак (по двум сторонам и углу)', formula: 'a₁ = a₂, b₁ = b₂, ∠C₁ = ∠C₂', desc: 'Если две стороны и угол между ними одного треугольника соответственно равны двум сторонам и углу между ними другого' },
          { name: 'II признак (по стороне и двум углам)', formula: 'c₁ = c₂, ∠A₁ = ∠A₂, ∠B₁ = ∠B₂', desc: 'Если сторона и два прилежащих к ней угла одного треугольника равны стороне и двум прилежащим углам другого' },
          { name: 'III признак (по трем сторонам)', formula: 'a₁ = a₂, b₁ = b₂, c₁ = c₂', desc: 'Если три стороны одного треугольника соответственно равны трем сторонам другого' }
        ]
      },
      {
        title: 'Углы и прямые',
        items: [
          { name: 'Смежные углы', formula: '∠1 + ∠2 = 180°', desc: 'Сумма двух смежных углов всегда равна 180 градусов' },
          { name: 'Вертикальные углы', formula: '∠1 = ∠2', desc: 'Вертикальные углы всегда равны между собой' },
          { name: 'Сумма углов треугольника', formula: '∠A + ∠B + ∠C = 180°', desc: 'Сумма всех внутренних углов любого треугольника равна 180°' },
          { name: 'Внешний угол треугольника', formula: '∠внеш = ∠1 + ∠2', desc: 'Внешний угол равен сумме двух внутренних углов, не смежных с ним' }
        ]
      },
      {
        title: 'Теорема Пифагора и площади',
        items: [
          { name: 'Теорема Пифагора', formula: 'a² + b² = c²', desc: 'В прямоугольном треугольнике квадрат гипотенузы равен сумме квадратов катетов' },
          { name: 'Площадь треугольника', formula: 'S = ½ · a · h', desc: 'Половина произведения основания на высоту' }
        ]
      }
    ]
  },
  russian: {
    name: 'Русский язык',
    icon: '📝',
    color: 'from-rose-500 to-pink-600',
    sections: [
      {
        title: 'Причастия и Деепричастия (7 класс)',
        items: [
          { name: 'Причастный оборот', formula: 'Определяемое слово, |причастный оборот|, ...', desc: 'Выделяется запятыми, если стоит ПОСЛЕ определяемого существительного. Если стоит ДО — запятыми обычно НЕ выделяется' },
          { name: 'Деепричастный оборот', formula: '|Деепричастный оборот|, ...', desc: 'ВСЕГДА выделяется запятыми с обеих сторон, независимо от места в предложении' },
          { name: 'Суффиксы причастий настоящего времени', formula: '-ущ-/-ющ- (I спр.), -ащ-/-ящ- (II спр.)', desc: 'Зависят от спряжения глагола: читать (I спр.) -> читающий, клеить (II спр.) -> клеящий' },
          { name: 'Н и НН в причастиях', formula: 'НН пишется, если есть:', desc: '1) Приставка (кроме не-); 2) Зависимые слова; 3) Суффиксы -ова-/-ева-; 4) Образовано от глагола сов. вида' }
        ]
      },
      {
        title: 'Мягкий знак и слитное написание',
        items: [
          { name: '-тся и -ться в глаголах', formula: 'Что делает? -> -тся | Что делать? -> -ться', desc: 'Если в вопросе есть Ь, то и в глаголе пишется Ь' },
          { name: 'НЕ с причастиями', formula: 'НЕ пишется раздельно при:', desc: '1) Наличии зависимых слов; 2) Противопоставлении с союзом «а»; 3) С краткими причастиями' }
        ]
      }
    ]
  },
  physics: {
    name: 'Физика',
    icon: '⚛️',
    color: 'from-amber-500 to-orange-600',
    sections: [
      {
        title: 'Механика и движение (7 класс)',
        items: [
          { name: 'Скорость движения', formula: 'v = s / t', desc: 's — путь (м), t — время (с), v — скорость (м/с)' },
          { name: 'Плотность вещества', formula: 'ρ = m / V', desc: 'm — масса (кг), V — объем (м³), ρ — плотность (кг/м³)' },
          { name: 'Сила тяжести', formula: 'Fт = m · g', desc: 'g ≈ 9.8 Н/кг (ускорение свободного падения)' },
          { name: 'Давление твердых тел', formula: 'p = F / S', desc: 'F — сила давления (Н), S — площадь (м²), p — Паскали (Па)' }
        ]
      }
    ]
  }
};

export default function CheatSheetModal({ isOpen, onClose, onInsertToChat }) {
  const [activeTab, setActiveTab] = useState('algebra');
  const [search, setSearch] = useState('');
  const [copiedFormula, setCopiedFormula] = useState(null);

  if (!isOpen) return null;

  const currentCategory = CHEAT_DATA[activeTab];

  const handleCopy = (formula) => {
    navigator.clipboard.writeText(formula);
    setCopiedFormula(formula);
    setTimeout(() => setCopiedFormula(null), 2000);
  };

  const handleInsert = (item) => {
    if (onInsertToChat) {
      onInsertToChat(`Объясни мне подробно формулу или правило: «${item.name}» (${item.formula}) с примерами решения.`);
      onClose();
    }
  };

  // Filter items
  const filterQuery = search.toLowerCase().trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] animate-scale-up">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-white dark:from-slate-800/80 dark:via-indigo-950/40 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-indigo-500/20">
              📐
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Шпаргалка формул и правил
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 font-semibold">
                  7 класс
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Быстрый доступ к формулам ФСУ, теоремам и правилам русского языка
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
              placeholder={`Поиск в «${currentCategory.name}» (например: квадрат, причастие, пифагор)...`}
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
            const matchedItems = section.items.filter(item =>
              !filterQuery ||
              item.name.toLowerCase().includes(filterQuery) ||
              item.formula.toLowerCase().includes(filterQuery) ||
              item.desc.toLowerCase().includes(filterQuery)
            );

            if (matchedItems.length === 0) return null;

            return (
              <div key={sIdx} className="space-y-2.5">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  {section.title}
                </h3>

                <div className="grid grid-cols-1 gap-2.5">
                  {matchedItems.map((item, iIdx) => {
                    const isCopied = copiedFormula === item.formula;
                    return (
                      <div
                        key={iIdx}
                        className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 hover:border-indigo-300 dark:hover:border-indigo-600/60 transition-all group flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                      >
                        <div className="space-y-1 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                              {item.name}
                            </span>
                          </div>
                          <div className="font-mono text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900/90 py-1.5 px-2.5 rounded-xl border border-indigo-100 dark:border-indigo-950/60 inline-block">
                            {item.formula}
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleCopy(item.formula)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            title="Скопировать формулу"
                          >
                            {isCopied ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400">Скопировано</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5 text-slate-400" />
                                <span>Копировать</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleInsert(item)}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-2xs cursor-pointer active:scale-95"
                            title="Разобрать эту тему с ИИ"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>В чат</span>
                          </button>
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
        <div className="p-3 sm:px-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Нажми «В чат», чтобы ИИ подробно объяснил любую формулу на примерах</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-medium cursor-pointer transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

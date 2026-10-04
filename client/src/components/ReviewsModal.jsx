import React, { useState, useEffect } from 'react';
import {
  X, Star, MessageSquare, Send, Check, ShieldCheck,
  User, Sparkles, Filter, Download, Eye, ThumbsUp
} from 'lucide-react';
import { getReviews, addReview, getReviewsStats } from '../services/reviewsStorage.js';

export default function ReviewsModal({ isOpen, onClose, user }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: '5.0', total: 0, breakdown: {} });
  
  // New review form state
  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('Ученик 7 класса');
  const [rating, setRating] = useState(5);
  const [subject, setSubject] = useState('Общее');
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  
  // Admin toggle to see full author metadata
  const [showAdminDetails, setShowAdminDetails] = useState(false);
  const [filterSubject, setFilterSubject] = useState('all');

  const reload = () => {
    setReviews(getReviews());
    setStats(getReviewsStats());
  };

  useEffect(() => {
    if (isOpen) {
      reload();
      if (user && user.name && !author) {
        setAuthor(user.name);
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    addReview({
      author: author.trim() || (user ? user.name : 'Ученик 7 класса'),
      role,
      rating,
      subject,
      text: text.trim(),
      email: user ? (user.email || user.id || '') : ''
    });

    setText('');
    setSubmitted(true);
    reload();
    setTimeout(() => setSubmitted(false), 3000);
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reviews, null, 2));
    const dl = document.createElement('a');
    dl.setAttribute("href", dataStr);
    dl.setAttribute("download", `classmate_reviews_${Date.now()}.json`);
    dl.click();
  };

  const filteredReviews = filterSubject === 'all'
    ? reviews
    : reviews.filter(r => r.subject === filterSubject);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-scale-up">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-50/80 via-orange-50/50 to-white dark:from-slate-800/80 dark:via-amber-950/40 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-amber-500/20">
              ⭐
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Отзывы о ClassMate AI
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold flex items-center gap-1">
                  <span>★</span> {stats.average} / 5.0
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Реальные отзывы учеников и родителей ({stats.total} отзывов)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Admin view toggle */}
            <button
              onClick={() => setShowAdminDetails(!showAdminDetails)}
              className={`p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                showAdminDetails
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Переключить детальный режим (кто оставил отзыв)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Кто оставил</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content list & form */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          
          {/* Write a review card */}
          <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-slate-50/90 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/70 space-y-3 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Оставить свой отзыв
              </span>
              
              {/* Star selector */}
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-0.5 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= rating
                          ? 'fill-amber-400 text-amber-500'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Твоё имя или ник..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
              />
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500"
              >
                <option value="Общее">Предмет: Общее впечатление</option>
                <option value="Русский язык">Предмет: Русский язык</option>
                <option value="Алгебра">Предмет: Алгебра</option>
                <option value="Геометрия">Предмет: Геометрия</option>
                <option value="Физика">Предмет: Физика</option>
              </select>
            </div>

            <textarea
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Напиши, как ClassMate помог с уроками, домашкой или контрольной..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between pt-1">
              {submitted ? (
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  Спасибо за твой отзыв! Он опубликован.
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">
                  {user ? `От автора: ${user.name}` : 'Можно оставить анонимно или с именем'}
                </span>
              )}

              <button
                type="submit"
                disabled={!text.trim()}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95"
              >
                <Send className="w-3 h-3" />
                <span>Опубликовать</span>
              </button>
            </div>
          </form>

          {/* Subject Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Фильтр:
            </span>
            {['all', 'Русский язык', 'Алгебра', 'Геометрия', 'Общее'].map((sub) => (
              <button
                key={sub}
                onClick={() => setFilterSubject(sub)}
                className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all cursor-pointer shrink-0 ${
                  filterSubject === sub
                    ? 'bg-amber-500 text-white font-bold shadow-2xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {sub === 'all' ? 'Все отзывы' : sub}
              </button>
            ))}
          </div>

          {/* Reviews list */}
          <div className="space-y-3">
            {filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs space-y-2 hover:border-amber-300 dark:hover:border-amber-700/60 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${rev.color || 'from-indigo-500 to-purple-600'} text-white flex items-center justify-center font-bold text-xs shadow-2xs`}>
                      {rev.avatarLetter || rev.author?.[0]?.toUpperCase() || 'У'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {rev.author}
                        </span>
                        {rev.verified && (
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold" title="Проверенный ученик">
                            ✓
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300">
                          {rev.subject}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {rev.role} · {rev.date}
                      </div>
                    </div>
                  </div>

                  {/* Stars */}
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= rev.rating
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-slate-200 dark:text-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Review Text */}
                <p className="text-xs text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {rev.text}
                </p>

                {/* Admin metadata preview if toggled */}
                {showAdminDetails && (
                  <div className="p-2 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-800/60 text-[11px] text-indigo-950 dark:text-indigo-200 flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <strong>ID:</strong> {rev.id} | <strong>Аккаунт / Email:</strong> {rev.email || 'Без привязки почты'}
                    </div>
                    <div>
                      <strong>Время:</strong> {new Date(rev.timestamp).toLocaleString('ru-RU')}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer with Export for Owner */}
        <div className="p-3 sm:px-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportJson}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 font-medium cursor-pointer"
              title="Скачать все отзывы файлом JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Экспорт отзывов (JSON)</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-bold cursor-pointer transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import {
  X, Star, MessageSquare, Send, Check, ShieldCheck,
  User, Sparkles, Filter, Download, Eye, ThumbsUp, ArrowLeft,
  AlertCircle, ShieldAlert, ExternalLink, RefreshCw, Bot
} from 'lucide-react';
import {
  getReviews,
  fetchAllReviews,
  addReview,
  getReviewsStats,
  generateMathCaptcha,
  getGitHubReviewIssueUrl
} from '../services/reviewsStorage.js';

export default function ReviewsModal({ isOpen, onClose, user }) {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ average: '5.0', total: 0, breakdown: {} });
  const [isLoading, setIsLoading] = useState(false);
  
  // New review form state
  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('Ученик 7 класса');
  const [rating, setRating] = useState(5);
  const [subject, setSubject] = useState('Общее');
  const [text, setText] = useState('');
  const [submittedReview, setSubmittedReview] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Anti-bot state
  const [captcha, setCaptcha] = useState(() => generateMathCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [honeypot, setHoneypot] = useState('');

  // Admin toggle to see full author metadata
  const [showAdminDetails, setShowAdminDetails] = useState(false);
  const [filterSubject, setFilterSubject] = useState('all');

  const refreshCaptcha = () => {
    setCaptcha(generateMathCaptcha());
    setCaptchaInput('');
  };

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const data = await fetchAllReviews();
      setReviews(data);
      setStats(getReviewsStats(data));
    } catch {
      const fallback = getReviews();
      setReviews(fallback);
      setStats(getReviewsStats(fallback));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
      refreshCaptcha();
      setErrorMessage('');
      setSubmittedReview(null);
      if (user && user.name && !author) {
        setAuthor(user.name);
      }
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const newRev = addReview({
        author: author.trim() || (user ? user.name : ''),
        role,
        rating,
        subject,
        text,
        user,
        honeypot,
        captchaAnswer: captchaInput,
        expectedCaptcha: captcha.answer
      });

      setText('');
      setCaptchaInput('');
      setSubmittedReview(newRev);
      loadAll();
      refreshCaptcha();
    } catch (err) {
      setErrorMessage(err.message || 'Ошибка отправки отзыва.');
      refreshCaptcha();
    }
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

  const isAuthenticated = Boolean(user && (user.name || user.email));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:p-5 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full h-full sm:h-auto sm:max-w-2xl bg-white dark:bg-slate-900 sm:border border-slate-200 dark:border-slate-800 sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col sm:max-h-[90vh] pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] sm:pt-0 sm:pb-0 animate-scale-up">
        
        {/* Header */}
        <div className="p-3.5 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-50/90 via-orange-50/60 to-white dark:from-slate-800/90 dark:via-amber-950/40 dark:to-slate-900 shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="sm:hidden p-2 -ml-1 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Назад"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center text-base sm:text-lg font-bold shadow-md shadow-amber-500/20 shrink-0">
              ⭐
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                  Отзывы учеников
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200 font-bold flex items-center gap-1 shrink-0">
                  <span>★</span> {stats.average}
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 truncate">
                Реальные отзывы без ботов ({stats.total})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Refresh button */}
            <button
              onClick={loadAll}
              disabled={isLoading}
              className="p-2 sm:p-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              title="Обновить отзывы"
            >
              <RefreshCw className={`w-4 h-4 sm:w-3.5 sm:h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Admin toggle */}
            <button
              onClick={() => setShowAdminDetails(!showAdminDetails)}
              className={`p-2 sm:p-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                showAdminDetails
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              title="Режим создателя (кто оставил отзыв)"
            >
              <Eye className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
              <span className="hidden sm:inline">Инфо</span>
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          
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

            {/* Error message banner */}
            {errorMessage && (
              <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs flex items-start gap-2 animate-shake">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success message banner with GitHub sync button */}
            {submittedReview && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-800 dark:text-emerald-200 text-xs space-y-2 animate-fade-in">
                <div className="flex items-center gap-2 font-bold">
                  <Check className="w-4 h-4 text-emerald-500" />
                  <span>Спасибо! Ваш отзыв успешно сохранён и отображается на сайте.</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
                    Хотите, чтобы ваш отзыв был навсегда виден всем в репозитории проекта?
                  </span>
                  <a
                    href={getGitHubReviewIssueUrl(submittedReview)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] transition-colors"
                  >
                    <span>На GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Твоё реальное имя (напр. Иван К.)..."
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

            {/* Hidden honeypot field to trap spam bots */}
            <input
              type="text"
              name="classmate_check_website"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
            />

            <textarea
              rows={2}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Напиши честный отзыв, как ClassMate помог с уроками или домашкой..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-amber-500 resize-none leading-relaxed"
            />

            {/* Anti-bot Human Verification section */}
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
              {isAuthenticated ? (
                <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>Вход выполнен ({user.name}). Защита от ботов пройдена автоматически.</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300 font-medium">
                    <Bot className="w-3.5 h-3.5 text-amber-500" />
                    <span>Антибот проверка:</span>
                    <strong className="text-slate-900 dark:text-white px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800">
                      {captcha.question}
                    </strong>
                  </div>
                  <input
                    type="number"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value)}
                    placeholder="Ответ"
                    className="w-16 px-2 py-1 text-xs border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-center font-bold text-slate-900 dark:text-white outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={refreshCaptcha}
                    className="text-[10px] text-slate-400 hover:text-slate-600 underline cursor-pointer"
                  >
                    другой пример
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={!text.trim() || (!isAuthenticated && !captchaInput)}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 active:scale-95 ml-auto"
              >
                <Send className="w-3 h-3" />
                <span>Опубликовать отзыв</span>
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-slate-400" />
              <span>Действует автоматический фильтр нецензурных и непристойных слов. Сервис модерируется.</span>
            </p>
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
            {filteredReviews.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Пока нет отзывов по выбранному предмету. Будьте первыми!
              </div>
            ) : (
              filteredReviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-white dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 shadow-2xs space-y-2 hover:border-amber-300 dark:hover:border-amber-700/60 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {rev.avatarUrl ? (
                        <img
                          src={rev.avatarUrl}
                          alt={rev.author}
                          className="w-8 h-8 rounded-full object-cover shadow-2xs border border-slate-200 dark:border-slate-700"
                        />
                      ) : (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${rev.color || 'from-indigo-500 to-purple-600'} text-white flex items-center justify-center font-bold text-xs shadow-2xs`}>
                          {rev.avatarLetter || rev.author?.[0]?.toUpperCase() || 'У'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {rev.author}
                          </span>
                          
                          {/* Yandex Verified Badge */}
                          {rev.isYandex && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-red-50 dark:bg-red-950/60 text-[#fc3f1d] font-semibold border border-red-200/60 dark:border-red-900/60 flex items-center gap-1" title="Пользователь авторизован через Яндекс ID">
                              <span className="font-bold">Я</span> Проверен
                            </span>
                          )}

                          {/* GitHub Community Badge */}
                          {rev.isGitHub && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-semibold border border-purple-200/60 flex items-center gap-1" title="Отзыв из репозитория GitHub">
                              <span>GitHub</span>
                            </span>
                          )}

                          {/* School Verified Badge */}
                          {!rev.isYandex && !rev.isGitHub && rev.verified && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5" title="Реальный ученик">
                              <Check className="w-3 h-3" /> Ученик
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {rev.role} · {rev.subject} · {rev.date}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= (rev.rating || 5)
                              ? 'fill-amber-400 text-amber-500'
                              : 'text-slate-200 dark:text-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
                    {rev.text}
                  </p>

                  {/* Admin Metadata Inspector */}
                  {showAdminDetails && (
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                      <span>ID: {rev.id}</span>
                      <span>Источник: {rev.source || 'локально'}</span>
                      {rev.githubUrl && (
                        <a
                          href={rev.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-indigo-500 hover:underline flex items-center gap-0.5"
                        >
                          <span>Смотреть на GitHub</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80 shrink-0 text-xs">
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 text-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Экспорт JSON</span>
          </button>

          <span className="text-[11px] text-slate-400">
            ClassMate AI · Отзывы без ботов
          </span>
        </div>
      </div>
    </div>
  );
}

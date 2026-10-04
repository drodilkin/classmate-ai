import React, { useState } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Heart, X } from 'lucide-react';
import { getYandexAuthUrl, loginWithYandexAndroid } from '../services/yandexAuth.js';
import { Capacitor } from '@capacitor/core';

export default function WelcomeModal({ isOpen, onClose, onLogin }) {
  const [loading, setLoading] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const isAndroid = Capacitor.isNativePlatform();

  if (!isOpen) return null;

  const handleYandexAuth = () => {
    setLoading(true);
    if (dontShowAgain) {
      localStorage.setItem('classmate_welcomed', 'true');
    }

    if (isAndroid) {
      loginWithYandexAndroid(
        (user) => {
          setLoading(false);
          onLogin(user);
          onClose();
        },
        (err) => {
          setLoading(false);
          console.error(err);
        }
      );
    } else {
      window.location.href = getYandexAuthUrl();
    }
  };

  const handleDismiss = () => {
    if (dontShowAgain) {
      localStorage.setItem('classmate_welcomed', 'true');
    } else {
      sessionStorage.setItem('classmate_welcomed_session', 'true');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-6 animate-scale-up">
        
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
          title="Продолжить как гость"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Icon */}
        <div className="flex flex-col items-center text-center space-y-3 pt-2">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-600 to-amber-500 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/25">
            🎓
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              Добро пожаловать в ClassMate AI!
            </h2>
            <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center justify-center gap-1 mt-1">
              <Sparkles className="w-3.5 h-3.5" />
              Умный школьный ИИ-помощник
            </span>
          </div>
        </div>

        {/* Greeting message text */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed space-y-3">
          <p className="font-semibold text-slate-900 dark:text-white">
            Здравствуйте, уважаемый пользователь!
          </p>
          <p>
            Вы зашли на наш сайт <strong>ClassMate AI</strong>. Здесь вы можете зарегистрироваться через <strong>Яндекс</strong>, чтобы сохранять историю решений, использовать школьные учебники и оставлять подтверждённые отзывы.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">
            Удачного пользования!
            <br />
            <span className="font-semibold text-slate-700 dark:text-slate-300">С уважением, Команда Разработки.</span>
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleYandexAuth}
            disabled={loading}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#fc3f1d] hover:bg-[#e03718] active:scale-98 text-white font-bold text-sm shadow-lg shadow-red-500/20 flex items-center justify-center gap-2.5 transition-all cursor-pointer"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/60 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="w-5 h-5 rounded-full bg-white text-[#fc3f1d] flex items-center justify-center font-black text-xs">
                  Я
                </span>
                <span>Зарегистрироваться через Яндекс</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </>
            )}
          </button>

          <button
            onClick={handleDismiss}
            className="w-full py-3 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold text-xs sm:text-sm transition-all cursor-pointer"
          >
            Продолжить без регистрации (как гость)
          </button>
        </div>

        {/* Remember choice */}
        <label className="flex items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={(e) => setDontShowAgain(e.target.checked)}
            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <span>Больше не показывать это приветствие</span>
        </label>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Capacitor } from '@capacitor/core';
import { loginWithYandexAndroid, getYandexAuthUrl } from '../services/yandexAuth.js';

const features = [
  {
    icon: '📸',
    title: 'Фото задания',
    desc: 'Сфотографируй задачу из учебника — AI решит и объяснит'
  },
  {
    icon: '🤖',
    title: '6 моделей AI',
    desc: 'Mistral, DeepSeek, Llama и другие — выбирай лучшую'
  },
  {
    icon: '⚡',
    title: 'Без VPN',
    desc: 'Работает в России, в школьной сети и с мобильного'
  }
];

export default function AuthModal({ isOpen, onLogin }) {
  const [slide, setSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(false);
  const isAndroid = Capacitor.isNativePlatform();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setVisible(true), 10);
    } else {
      setVisible(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleYandexLogin = () => {
    setLoading(true);
    setError('');

    if (isAndroid) {
      loginWithYandexAndroid(
        (user) => {
          setLoading(false);
          onLogin(user);
        },
        (err) => {
          setLoading(false);
          setError('Ошибка входа. Попробуй ещё раз.');
          console.error(err);
        }
      );
    } else {
      window.location.href = getYandexAuthUrl();
    }
  };

  // SLIDE 0 — Welcome
  if (slide === 0) {
    return (
      <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-indigo-100/60 blur-3xl" />
        </div>

        <div className="relative flex flex-col items-center gap-8 px-8 max-w-sm w-full">
          {/* Logo */}
          <div className="flex flex-col items-center gap-4 animate-[fadeInDown_0.6s_ease_both]">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-5xl shadow-xl shadow-indigo-200">
              🎓
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">ClassMate AI</h1>
              <p className="text-slate-500 text-sm mt-1">Умный помощник для школы</p>
            </div>
          </div>

          {/* CTA */}
          <div className="w-full flex flex-col gap-3 animate-[fadeInUp_0.6s_0.2s_ease_both_backwards]">
            <button
              onClick={() => setSlide(1)}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-base shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
            >
              Начать →
            </button>
            <button
              onClick={handleYandexLogin}
              disabled={loading}
              className="w-full py-3.5 rounded-2xl border-2 border-slate-200 text-slate-700 font-semibold text-sm active:scale-95 transition-transform flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="w-6 h-6 rounded-full bg-[#fc3f1d] text-white flex items-center justify-center font-bold text-xs">Я</span>
                  Войти через Яндекс
                </>
              )}
            </button>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  // SLIDES 1-3 — Feature onboarding
  if (slide <= features.length) {
    const f = features[slide - 1];
    const isLast = slide === features.length;

    return (
      <div className={`fixed inset-0 z-50 flex flex-col bg-white transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
        {/* Skip */}
        <div className="flex justify-end p-5">
          <button
            onClick={() => setSlide(features.length + 1)}
            className="text-slate-400 text-sm font-medium"
          >
            Пропустить
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col items-center justify-center px-8 gap-8">
          <div key={slide} className="flex flex-col items-center gap-6 animate-[fadeInUp_0.4s_ease_both]">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-50 to-violet-100 flex items-center justify-center text-6xl shadow-lg">
              {f.icon}
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-slate-900">{f.title}</h2>
              <p className="text-slate-500 text-base leading-relaxed">{f.desc}</p>
            </div>
          </div>

          {/* Dots */}
          <div className="flex gap-2">
            {features.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === slide - 1
                    ? 'w-6 bg-indigo-600'
                    : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Next button */}
        <div className="p-8">
          <button
            onClick={() => setSlide(isLast ? features.length + 1 : slide + 1)}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-base shadow-lg shadow-indigo-200 active:scale-95 transition-transform"
          >
            {isLast ? 'Войти и начать 🚀' : 'Далее →'}
          </button>
        </div>
      </div>
    );
  }

  // SLIDE final — Login
  return (
    <div className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white transition-opacity duration-500 ${visible ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-violet-100/60 blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center gap-8 px-8 max-w-sm w-full animate-[fadeInUp_0.5s_ease_both]">
        <div className="text-center space-y-2">
          <div className="text-5xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-slate-900">Войди чтобы начать</h2>
          <p className="text-slate-500 text-sm">Сессия сохраняется на 24 часа</p>
        </div>

        <div className="w-full flex flex-col gap-3">
          <button
            onClick={handleYandexLogin}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-[#fc3f1d] text-white font-bold text-base shadow-lg shadow-red-200 active:scale-95 transition-transform flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-2xl font-black">Я</span>
                Войти через Яндекс ID
              </>
            )}
          </button>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <p className="text-center text-xs text-slate-400 mt-2">
            Безопасно · Без паролей · Данные защищены
          </p>
        </div>

        <button
          onClick={() => setSlide(0)}
          className="text-slate-400 text-sm"
        >
          ← Назад
        </button>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, ShieldCheck, Zap, Sparkles, Check, ArrowRight } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLogin, user }) {
  const [customName, setCustomName] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  if (!isOpen) return null;

  const handleYandexLogin = () => {
    // Fast Yandex Auth
    const yandexUser = {
      id: 'yandex_' + Date.now(),
      name: customName.trim() || 'Пользователь Яндекс',
      email: customName.trim() ? `${customName.trim().toLowerCase().replace(/\s+/g, '.')}@yandex.ru` : 'user@yandex.ru',
      provider: 'yandex',
      avatar: 'https://avatars.yandex.net/get-yapic/0/0-0/islands-200',
      badge: 'Яндекс ID',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
      isLoggedIn: true,
      tier: 'Бесплатный Премиум'
    };
    onLogin(yandexUser);
    onClose();
  };

  const handleGoogleLogin = () => {
    // Fast Google Auth
    const googleUser = {
      id: 'google_' + Date.now(),
      name: customName.trim() || 'Google Пользователь',
      email: customName.trim() ? `${customName.trim().toLowerCase().replace(/\s+/g, '.')}@gmail.com` : 'user@gmail.com',
      provider: 'google',
      avatar: 'https://lh3.googleusercontent.com/a/default-user=s96-c',
      badge: 'Google',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      isLoggedIn: true,
      tier: 'Бесплатный Премиум'
    };
    onLogin(googleUser);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0f1422] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col relative">
        {/* Glow decorative blur */}
        <div className="absolute -top-16 -left-16 w-40 h-40 bg-red-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-40 h-40 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-red-600 via-amber-500 to-blue-600 p-0.5 shadow-xl shadow-red-900/30 mb-4">
            <div className="w-full h-full bg-[#0b0f19] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-amber-400" />
            </div>
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">
            Вход в AI Omni Hub
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            Авторизуйтесь, чтобы пользоваться <strong className="text-white">Claude</strong>, <strong className="text-white">DeepSeek</strong> и <strong className="text-white">Gemini</strong> бесплатно и без ключей
          </p>
        </div>

        {/* Benefits List */}
        <div className="px-6 py-2">
          <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800/80 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Бесплатный доступ ко всем нейросетям без API-ключей</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Анализ фото, скриншотов и документов</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span>Сохранение истории диалогов на всех устройствах</span>
            </div>
          </div>
        </div>

        {/* Name input (optional) */}
        <div className="px-6 pt-3">
          <input
            type="text"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="Ваше имя (необязательно, например: Иван)"
            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-red-500/70"
          />
        </div>

        {/* Login Buttons */}
        <div className="p-6 space-y-3">
          {/* Yandex ID Button */}
          <button
            onClick={handleYandexLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#fc3f1d] hover:bg-[#e03415] text-white font-semibold text-xs sm:text-sm shadow-lg shadow-red-900/30 transition-all cursor-pointer group"
          >
            {/* Yandex 'Я' icon */}
            <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center text-[#fc3f1d] font-bold text-xs">
              Я
            </div>
            <span>Войти с Яндекс ID</span>
            <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs sm:text-sm shadow-md transition-all cursor-pointer group"
          >
            {/* Google 'G' icon */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Войти через Google</span>
            <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-0.5 transition-transform text-slate-700" />
          </button>

          {/* Continue as guest */}
          <button
            onClick={onClose}
            className="w-full py-2 text-center text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            Продолжить в гостевом режиме
          </button>
        </div>
      </div>
    </div>
  );
}

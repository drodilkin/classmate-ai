import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Check, ArrowRight } from 'lucide-react';

export default function YandexAuthModal({ isOpen, onClose, onLogin }) {
  const [customName, setCustomName] = useState('');
  const [showInput, setShowInput] = useState(false);

  if (!isOpen) return null;

  const handleQuickLogin = (name = 'Школьник') => {
    const finalName = customName.trim() || name;
    const user = {
      name: finalName,
      email: `${finalName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'student'}@yandex.ru`,
      provider: 'yandex',
      avatar: `https://avatars.yandex.net/get-yapic/0/0-0/islands-200`,
      avatarLetter: finalName[0]?.toUpperCase() || 'Я',
      signedAt: new Date().toISOString()
    };
    onLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-msg-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 p-1.5 px-3 rounded-full bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
            <span className="w-5 h-5 rounded-full bg-[#fc3f1d] text-white flex items-center justify-center font-bold text-[11px]">
              Я
            </span>
            <span>Яндекс ID Авторизация</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Добро пожаловать в <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
              ClassMate AI
            </span>
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Авторизуйся через Яндекс ID, чтобы сохранять историю решений домашки и получать доступ ко всем нейросетям.
          </p>
        </div>

        {/* Benefits list */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5 text-xs text-slate-600">
          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Решение задач по фото через <strong>Pixtral Vision</strong></span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Безлимитный доступ без VPN на любых телефонах</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Синхронизация школьных диалогов на всех устройствах</span>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="space-y-3">
          {showInput ? (
            <div className="space-y-2">
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Как тебя зовут? (Имя или ник)"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm text-slate-900"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleQuickLogin(customName || 'Ученик')}
              />
              <button
                type="button"
                onClick={() => handleQuickLogin(customName || 'Ученик')}
                className="w-full py-3.5 px-4 rounded-xl bg-[#fc3f1d] hover:bg-[#e03314] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
              >
                <span>Подтвердить вход в Яндекс</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Official Yandex ID Button */
            <button
              type="button"
              onClick={() => setShowInput(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-black hover:bg-slate-900 text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer group active:scale-98"
            >
              {/* Official Red Circle "Я" */}
              <div className="w-7 h-7 rounded-full bg-[#fc3f1d] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                Я
              </div>
              <span className="tracking-wide">Войти с Яндекс ID</span>
            </button>
          )}

          {/* Continue as Guest */}
          <button
            type="button"
            onClick={() => {
              handleQuickLogin('Гость');
            }}
            className="w-full py-2.5 px-4 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-center"
          >
            Продолжить без аккаунта (как гость)
          </button>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Безопасный вход через экосистему Яндекса</span>
        </div>

      </div>
    </div>
  );
}

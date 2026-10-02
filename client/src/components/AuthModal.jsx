import React, { useState } from 'react';
import { Sparkles, ShieldCheck, Check, ArrowRight, User } from 'lucide-react';

export default function AuthModal({ isOpen, onClose, onLogin }) {
  const [activeProvider, setActiveProvider] = useState(null); // 'yandex' | 'vk' | null
  const [customName, setCustomName] = useState('');

  if (!isOpen) return null;

  const handleProviderClick = (provider) => {
    setActiveProvider(provider);
  };

  const handleConfirmLogin = (name = 'Школьник') => {
    const finalName = customName.trim() || name;
    const isYandex = activeProvider === 'yandex';
    
    const user = {
      name: finalName,
      provider: isYandex ? 'yandex' : 'vk',
      email: isYandex 
        ? `${finalName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'student'}@yandex.ru`
        : `id_${Math.floor(10000000 + Math.random() * 90000000)}@vk.com`,
      avatarLetter: finalName[0]?.toUpperCase() || (isYandex ? 'Я' : 'V'),
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
            <span className="w-4 h-4 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-center text-[10px]">
              🎓
            </span>
            <span>Школьный аккаунт</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Вход в <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">ClassMate AI</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Авторизуйся через любимый сервис, чтобы сохранять историю диалогов и решения домашки по фото.
          </p>
        </div>

        {/* Benefits list */}
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Решение задач по фото через <strong>Pixtral Vision</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Работает в РФ без VPN на всех устройствах</span>
          </div>
        </div>

        {/* Main Buttons Area */}
        <div className="space-y-3">
          {activeProvider ? (
            /* Name Confirmation for Selected Provider */
            <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 animate-msg-in">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                {activeProvider === 'yandex' ? (
                  <>
                    <div className="w-5 h-5 rounded-full bg-[#fc3f1d] text-white flex items-center justify-center text-xs font-bold">
                      Я
                    </div>
                    <span>Вход через Яндекс ID</span>
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 rounded-lg bg-[#0077ff] text-white flex items-center justify-center text-[10px] font-bold">
                      VK
                    </div>
                    <span>Вход через VK ID</span>
                  </>
                )}
              </div>

              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Введи твоё имя или ник..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none text-xs text-slate-900"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleConfirmLogin(customName || 'Ученик')}
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveProvider(null)}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                >
                  Назад
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmLogin(customName || 'Ученик')}
                  className={`flex-1 py-2.5 px-4 rounded-xl text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 ${
                    activeProvider === 'yandex' 
                      ? 'bg-[#fc3f1d] hover:bg-[#e03314]' 
                      : 'bg-[#0077ff] hover:bg-[#0066dd]'
                  }`}
                >
                  <span>Войти в аккаунт</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            /* Providers Buttons */
            <div className="space-y-2.5">
              {/* VK ID Button */}
              <button
                type="button"
                onClick={() => handleProviderClick('vk')}
                className="w-full py-3 px-4 rounded-2xl bg-[#0077ff] hover:bg-[#0066dd] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer group active:scale-98"
              >
                {/* Official VK Logo */}
                <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M15.07 2H8.93C4.33 2 2 4.33 2 8.93v6.14C2 19.67 4.33 22 8.93 22h6.14c4.6 0 6.93-2.33 6.93-6.93V8.93C22 4.33 19.67 2 15.07 2zm3.38 13.91c-.49.62-1.35 1.15-2.22 1.15h-.62c-.34 0-.54-.22-.72-.45-.37-.48-.82-1.07-1.28-1.07-.15 0-.27.07-.36.21-.18.28-.24.63-.24.98 0 .23-.15.38-.38.38h-.87c-1.92 0-3.64-1.12-4.9-2.91-1.89-2.69-3.23-5.74-3.26-5.81-.08-.18.06-.38.25-.38h1.84c.17 0 .3.1.37.26.96 2.33 2.24 4.38 2.82 4.38.1 0 .19-.05.24-.14.12-.23.15-.9.15-1.52V9.45c0-.49-.14-.71-.52-.76-.13-.02-.21-.1-.21-.21 0-.17.15-.35.39-.35h2.29c.28 0 .42.15.42.42v3.17c0 .15.07.24.16.24.08 0 .16-.06.24-.16.71-.97 1.63-2.73 2.1-4.08.06-.18.2-.28.38-.28h1.84c.23 0 .38.19.33.42-.25 1.07-1.39 2.92-2.14 3.92-.12.16-.14.26-.04.38.21.26.79.87 1.18 1.41.69.96 1.15 1.77 1.15 2.11 0 .2-.13.34-.33.34z"/>
                </svg>
                <span>Войти с VK ID</span>
              </button>

              {/* Yandex ID Button */}
              <button
                type="button"
                onClick={() => handleProviderClick('yandex')}
                className="w-full py-3 px-4 rounded-2xl bg-black hover:bg-slate-900 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer group active:scale-98"
              >
                {/* Official Red Circle "Я" */}
                <div className="w-5 h-5 rounded-full bg-[#fc3f1d] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                  Я
                </div>
                <span>Войти с Яндекс ID</span>
              </button>
            </div>
          )}

          {/* Continue as Guest */}
          <button
            type="button"
            onClick={() => handleConfirmLogin('Гость')}
            className="w-full py-2 px-4 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer text-center"
          >
            Продолжить без входа (как гость)
          </button>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 pt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Быстрая авторизация без паролей и SMS</span>
        </div>

      </div>
    </div>
  );
}

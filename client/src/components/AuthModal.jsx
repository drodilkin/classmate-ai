import React, { useState } from 'react';
import { ShieldCheck, Check, ArrowRight, RefreshCw, Sparkles, Clock, Lock } from 'lucide-react';
import { getYandexAuthUrl } from '../services/yandexAuth.js';

export default function AuthModal({ isOpen }) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleYandexOAuth = () => {
    setLoading(true);
    window.location.href = getYandexAuthUrl();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      {/* Background Animated Glow */}
      <div className="absolute w-72 h-72 rounded-full bg-gradient-to-tr from-red-500/20 to-indigo-500/20 blur-3xl pointer-events-none animate-pulse" />

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6 animate-scale-up">
        
        {/* Brand Header */}
        <div className="text-center space-y-2.5">
          <div className="inline-flex items-center justify-center gap-2 py-1 px-3.5 rounded-full bg-gradient-to-r from-red-50 to-orange-50 border border-red-200/60 text-xs font-semibold text-slate-800 shadow-2xs">
            <span className="w-5 h-5 rounded-full bg-[#fc3f1d] text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
              Я
            </span>
            <span>Яндекс ID Авторизация</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Вход в <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700">ClassMate AI</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            Авторизуйся через официальный Яндекс ID для защиты от спама и безлимитного доступа к решению домашки.
          </p>
        </div>

        {/* Features Card with Icons */}
        <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/60 space-y-2.5 text-xs text-slate-700">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span>Решение задач и домашки по фото через <strong>Pixtral Vision</strong></span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span>Топовые модели: DeepSeek R1, Qwen 72B, Codestral</span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <span>Сессия активна <strong>24 часа</strong> для безопасности</span>
          </div>
        </div>

        {/* Main Action Button */}
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleYandexOAuth}
            disabled={loading}
            className="w-full py-4 px-5 rounded-2xl bg-slate-950 hover:bg-black text-white font-semibold text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer group"
          >
            {loading ? (
              <RefreshCw className="w-5 h-5 animate-spin text-white" />
            ) : (
              <>
                {/* Signature Red Circle "Я" */}
                <div className="w-6 h-6 rounded-full bg-[#fc3f1d] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                  Я
                </div>
                <span className="tracking-wide">Войти с Яндекс ID</span>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </div>

        {/* Security Footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 pt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Официальный протокол OAuth 2.0 • РФ Без VPN</span>
        </div>

      </div>
    </div>
  );
}

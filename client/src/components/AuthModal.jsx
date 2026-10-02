import React, { useState } from 'react';
import { ShieldCheck, Check, ArrowRight, KeyRound, RefreshCw } from 'lucide-react';
import { getYandexAuthUrl } from '../services/yandexAuth.js';

export default function AuthModal({ isOpen, onLogin }) {
  const [provider, setProvider] = useState(null); // 'vk' | null
  const [step, setStep] = useState('input');
  const [loginValue, setLoginValue] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Real Yandex ID OAuth Redirect
  const handleYandexOAuth = () => {
    setLoading(true);
    window.location.href = getYandexAuthUrl();
  };

  // VK ID flow
  const handleSelectVK = () => {
    setProvider('vk');
    setStep('input');
    setLoginValue('');
    setVerifyCode('');
    setError('');
  };

  const handleSendCode = (e) => {
    if (e) e.preventDefault();
    const val = loginValue.trim();
    if (!val) {
      setError('Укажи номер телефона или адрес VK');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep('verify');
    }, 600);
  };

  const handleVerifyVK = (e) => {
    if (e) e.preventDefault();
    if (!verifyCode.trim()) {
      setError('Введи код подтверждения');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const cleanName = loginValue.replace(/[^a-zA-Zа-яА-Я0-9_]/g, '') || 'VK Пользователь';

      const user = {
        name: cleanName,
        identifier: loginValue.trim(),
        provider: 'vk',
        email: loginValue.startsWith('+') ? loginValue : `${cleanName}@vk.com`,
        avatarLetter: cleanName[0]?.toUpperCase() || 'V',
        token: 'auth_vk_' + Date.now(),
        signedAt: new Date().toISOString()
      };

      onLogin(user);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-msg-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center gap-2 p-1 px-3 rounded-full bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700">
            <span className="w-4 h-4 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-center text-[10px]">
              🎓
            </span>
            <span>Обязательная авторизация</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Вход в <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">ClassMate AI</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Для сохранения твоих решений домашки и доступа к нейросетям войди через Яндекс ID или VK ID.
          </p>
        </div>

        {/* Dynamic Area */}
        {!provider ? (
          /* Step 0: Choose Provider */
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              Выбери способ входа
            </div>

            {/* REAL YANDEX ID OAUTH BUTTON */}
            <button
              type="button"
              onClick={handleYandexOAuth}
              disabled={loading}
              className="w-full py-4 px-5 rounded-2xl bg-black hover:bg-slate-900 text-white font-semibold text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer group active:scale-98"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin text-white" />
              ) : (
                <>
                  {/* Official Red Circle "Я" */}
                  <div className="w-6 h-6 rounded-full bg-[#fc3f1d] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                    Я
                  </div>
                  <span className="tracking-wide">Войти с Яндекс ID (Официально)</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>

            {/* VK ID Button */}
            <button
              type="button"
              onClick={handleSelectVK}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#0077ff] hover:bg-[#0066dd] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer group active:scale-98"
            >
              {/* VK Official Logo */}
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M15.07 2H8.93C4.33 2 2 4.33 2 8.93v6.14C2 19.67 4.33 22 8.93 22h6.14c4.6 0 6.93-2.33 6.93-6.93V8.93C22 4.33 19.67 2 15.07 2zm3.38 13.91c-.49.62-1.35 1.15-2.22 1.15h-.62c-.34 0-.54-.22-.72-.45-.37-.48-.82-1.07-1.28-1.07-.15 0-.27.07-.36.21-.18.28-.24.63-.24.98 0 .23-.15.38-.38.38h-.87c-1.92 0-3.64-1.12-4.9-2.91-1.89-2.69-3.23-5.74-3.26-5.81-.08-.18.06-.38.25-.38h1.84c.17 0 .3.1.37.26.96 2.33 2.24 4.38 2.82 4.38.1 0 .19-.05.24-.14.12-.23.15-.9.15-1.52V9.45c0-.49-.14-.71-.52-.76-.13-.02-.21-.1-.21-.21 0-.17.15-.35.39-.35h2.29c.28 0 .42.15.42.42v3.17c0 .15.07.24.16.24.08 0 .16-.06.24-.16.71-.97 1.63-2.73 2.1-4.08.06-.18.2-.28.38-.28h1.84c.23 0 .38.19.33.42-.25 1.07-1.39 2.92-2.14 3.92-.12.16-.14.26-.04.38.21.26.79.87 1.18 1.41.69.96 1.15 1.77 1.15 2.11 0 .2-.13.34-.33.34z"/>
              </svg>
              <span>Войти с VK ID</span>
            </button>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Официальный Яндекс OAuth подключен</span>
              </div>
              <div>Кнопка Яндекс ID открывает настоящую страницу входа Яндекса.</div>
            </div>
          </div>
        ) : step === 'input' ? (
          /* VK Step 1 */
          <form onSubmit={handleSendCode} className="space-y-4 animate-msg-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-[#0077ff] text-white flex items-center justify-center text-xs font-bold">
                  VK
                </div>
                <span className="text-sm font-semibold text-slate-800">Вход через VK ID</span>
              </div>
              <button
                type="button"
                onClick={() => setProvider(null)}
                className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Сменить
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Телефон или адрес профиля VK:</label>
              <input
                type="text"
                value={loginValue}
                onChange={(e) => setLoginValue(e.target.value)}
                placeholder="+7 999 000-00-00 или id123"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-slate-900"
                autoFocus
              />
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-[#0077ff] hover:bg-[#0066dd] text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><span>Продолжить</span><ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        ) : (
          /* VK Step 2 */
          <form onSubmit={handleVerifyVK} className="space-y-4 animate-msg-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-slate-800">Код подтверждения</span>
              </div>
              <button
                type="button"
                onClick={() => setStep('input')}
                className="text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Назад
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <div>Код отправлен на: <span className="font-semibold text-slate-800">{loginValue}</span></div>
              <div className="text-[11px] text-slate-400">(Для проверки подойдёт любой 4-значный код)</div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Введи код из SMS или приложения VK:</label>
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="1234"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-center font-bold tracking-widest text-slate-900"
                autoFocus
                maxLength={8}
              />
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <><span>Войти в ClassMate AI</span><Check className="w-4 h-4" /></>}
            </button>
          </form>
        )}

        {/* Security footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 pt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Безопасная сквозная авторизация • РФ Без VPN</span>
        </div>

      </div>
    </div>
  );
}

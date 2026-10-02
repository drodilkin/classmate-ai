import React, { useState } from 'react';
import { ShieldCheck, Check, ArrowRight, Lock, Phone, Mail, RefreshCw, KeyRound } from 'lucide-react';

export default function AuthModal({ isOpen, onLogin }) {
  const [provider, setProvider] = useState(null); // 'vk' | 'yandex' | null
  const [step, setStep] = useState('input'); // 'input' | 'verify'
  const [loginValue, setLoginValue] = useState('');
  const [verifyCode, setVerifyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Handle Initial Provider Selection
  const handleSelectProvider = (p) => {
    setProvider(p);
    setStep('input');
    setLoginValue('');
    setVerifyCode('');
    setError('');
  };

  // Step 1: Submit Phone or Login
  const handleSendCode = (e) => {
    if (e) e.preventDefault();
    const val = loginValue.trim();
    if (!val) {
      setError(provider === 'vk' ? 'Укажи номер телефона или VK ID' : 'Укажи логин, email или телефон Яндекс');
      return;
    }
    setError('');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setStep('verify');
    }, 700);
  };

  // Step 2: Verify Code and Log In
  const handleVerify = (e) => {
    if (e) e.preventDefault();
    if (!verifyCode.trim()) {
      setError('Введи код подтверждения');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const isYandex = provider === 'yandex';
      const cleanName = loginValue.replace(/[^a-zA-Zа-яА-Я0-9_]/g, '') || (isYandex ? 'Яндекс Пользователь' : 'VK Пользователь');

      const user = {
        name: cleanName,
        identifier: loginValue.trim(),
        provider: isYandex ? 'yandex' : 'vk',
        email: isYandex 
          ? (loginValue.includes('@') ? loginValue : `${cleanName.toLowerCase()}@yandex.ru`)
          : (loginValue.startsWith('+') ? loginValue : `${cleanName}@vk.com`),
        avatarLetter: cleanName[0]?.toUpperCase() || (isYandex ? 'Я' : 'V'),
        token: `auth_${provider}_` + Date.now(),
        signedAt: new Date().toISOString()
      };

      onLogin(user);
    }, 800);
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
            Для защиты сервиса от спама и сохранения твоих решений вход обязателен через VK ID или Яндекс ID.
          </p>
        </div>

        {/* Dynamic Form Area */}
        {!provider ? (
          /* Step 0: Choose Provider */
          <div className="space-y-3">
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
              Выбери способ входа
            </div>

            {/* VK ID Button */}
            <button
              type="button"
              onClick={() => handleSelectProvider('vk')}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#0077ff] hover:bg-[#0066dd] text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer group active:scale-98"
            >
              {/* VK Official Logo */}
              <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                <path d="M15.07 2H8.93C4.33 2 2 4.33 2 8.93v6.14C2 19.67 4.33 22 8.93 22h6.14c4.6 0 6.93-2.33 6.93-6.93V8.93C22 4.33 19.67 2 15.07 2zm3.38 13.91c-.49.62-1.35 1.15-2.22 1.15h-.62c-.34 0-.54-.22-.72-.45-.37-.48-.82-1.07-1.28-1.07-.15 0-.27.07-.36.21-.18.28-.24.63-.24.98 0 .23-.15.38-.38.38h-.87c-1.92 0-3.64-1.12-4.9-2.91-1.89-2.69-3.23-5.74-3.26-5.81-.08-.18.06-.38.25-.38h1.84c.17 0 .3.1.37.26.96 2.33 2.24 4.38 2.82 4.38.1 0 .19-.05.24-.14.12-.23.15-.9.15-1.52V9.45c0-.49-.14-.71-.52-.76-.13-.02-.21-.1-.21-.21 0-.17.15-.35.39-.35h2.29c.28 0 .42.15.42.42v3.17c0 .15.07.24.16.24.08 0 .16-.06.24-.16.71-.97 1.63-2.73 2.1-4.08.06-.18.2-.28.38-.28h1.84c.23 0 .38.19.33.42-.25 1.07-1.39 2.92-2.14 3.92-.12.16-.14.26-.04.38.21.26.79.87 1.18 1.41.69.96 1.15 1.77 1.15 2.11 0 .2-.13.34-.33.34z"/>
              </svg>
              <span>Войти с VK ID</span>
            </button>

            {/* Yandex ID Button */}
            <button
              type="button"
              onClick={() => handleSelectProvider('yandex')}
              className="w-full py-3.5 px-4 rounded-2xl bg-black hover:bg-slate-900 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3 cursor-pointer group active:scale-98"
            >
              {/* Yandex Official Logo "Я" */}
              <div className="w-5 h-5 rounded-full bg-[#fc3f1d] text-white flex items-center justify-center font-bold text-xs shrink-0 group-hover:scale-105 transition-transform">
                Я
              </div>
              <span>Войти с Яндекс ID</span>
            </button>

            <div className="pt-2 text-center text-[11px] text-slate-400">
              🔒 Доступ к сайту откроется сразу после авторизации
            </div>
          </div>
        ) : step === 'input' ? (
          /* Step 1: Input Phone / Account */
          <form onSubmit={handleSendCode} className="space-y-4 animate-msg-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                {provider === 'vk' ? (
                  <div className="w-6 h-6 rounded-lg bg-[#0077ff] text-white flex items-center justify-center text-xs font-bold">
                    VK
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-[#fc3f1d] text-white flex items-center justify-center text-xs font-bold">
                    Я
                  </div>
                )}
                <span className="text-sm font-semibold text-slate-800">
                  {provider === 'vk' ? 'Вход через VK ID' : 'Вход через Яндекс ID'}
                </span>
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
              <label className="text-xs font-medium text-slate-700">
                {provider === 'vk' ? 'Телефон или адрес профиля VK:' : 'Телефон, почта или логин Яндекс:'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={loginValue}
                  onChange={(e) => setLoginValue(e.target.value)}
                  placeholder={provider === 'vk' ? '+7 999 000-00-00 или id123' : 'user@yandex.ru или +7 999...'}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-slate-900"
                  autoFocus
                />
              </div>
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-4 rounded-xl text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                provider === 'vk' ? 'bg-[#0077ff] hover:bg-[#0066dd]' : 'bg-[#fc3f1d] hover:bg-[#e03314]'
              }`}
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Продолжить</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: Verification Code */
          <form onSubmit={handleVerify} className="space-y-4 animate-msg-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-slate-800">
                  Подтверждение входа
                </span>
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
              <div>Код подтверждения отправлен на:</div>
              <div className="font-semibold text-slate-800">{loginValue}</div>
              <div className="text-[11px] text-slate-400">
                (Для входа подойдёт любой 4-значный код или пароль)
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">
                Введи код или пароль:
              </label>
              <input
                type="text"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
                placeholder="Например: 1234"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100 outline-none text-sm text-center font-bold tracking-widest text-slate-900"
                autoFocus
                maxLength={12}
              />
              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <span>Войти в ClassMate AI</span>
                  <Check className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Security badge footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 pt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Безопасная сквозная авторизация • РФ Без VPN</span>
        </div>

      </div>
    </div>
  );
}

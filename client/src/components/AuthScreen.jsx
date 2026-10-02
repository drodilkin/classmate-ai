import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, X, Brain, Code, Globe } from 'lucide-react';

/* ------------------------------------------------------------------
   Google Sign-In via GSI (accounts.google.com/gsi/client)
   The token is sent to our server for minimal validation.
   ------------------------------------------------------------------ */

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function AuthScreen({ onLogin, onGuest }) {
  const [name, setName] = useState('');
  const [gsiReady, setGsiReady] = useState(false);
  const [loading, setLoading] = useState(false);

  // Wait for GSI SDK
  useEffect(() => {
    const check = setInterval(() => {
      if (window.google?.accounts?.id) {
        setGsiReady(true);
        clearInterval(check);
      }
    }, 200);
    return () => clearInterval(check);
  }, []);

  // Initialize GSI once ready
  useEffect(() => {
    if (!gsiReady || !GOOGLE_CLIENT_ID) return;
    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: handleGoogleCredential,
      ux_mode: 'popup',
    });
  }, [gsiReady]);

  const handleGoogleCredential = async ({ credential }) => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (data.user) onLogin(data.user);
    } catch {
      // Fallback: decode locally
      try {
        const payload = JSON.parse(atob(credential.split('.')[1]));
        onLogin({
          id: 'google_' + payload.sub,
          name: payload.name || 'Google User',
          email: payload.email || '',
          avatar: payload.picture || '',
          provider: 'google',
          badge: 'Google',
          badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
          isLoggedIn: true,
        });
      } catch {}
    }
    setLoading(false);
  };

  const triggerGoogleSignIn = () => {
    if (!gsiReady || !GOOGLE_CLIENT_ID) {
      // No client ID configured → create a basic Google account from name field
      const guestName = name.trim() || 'Пользователь';
      onLogin({
        id: 'google_' + Date.now(),
        name: guestName,
        email: guestName.toLowerCase().replace(/\s+/g, '.') + '@gmail.com',
        avatar: '',
        provider: 'google',
        badge: 'Google',
        badgeColor: 'bg-blue-500/10 text-blue-300 border-blue-500/20',
        isLoggedIn: true,
      });
      return;
    }
    window.google.accounts.id.prompt();
  };

  const handleYandex = () => {
    const guestName = name.trim() || 'Пользователь';
    onLogin({
      id: 'yandex_' + Date.now(),
      name: guestName,
      email: guestName.toLowerCase().replace(/\s+/g, '.') + '@yandex.ru',
      avatar: '',
      provider: 'yandex',
      badge: 'Яндекс ID',
      badgeColor: 'bg-red-500/10 text-red-400 border-red-500/20',
      isLoggedIn: true,
    });
  };

  return (
    <div className="min-h-screen bg-animated flex items-center justify-center p-4">
      {/* Floating orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #2563eb, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-8 blur-3xl"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full opacity-6 blur-3xl -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'radial-gradient(circle, #059669, transparent)' }} />
      </div>

      <div className="relative scale-bounce w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl mx-auto"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed, #059669)' }}>
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-[#060810]">
              <div className="pulse-ring text-emerald-400" />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight mb-1">
            <span className="text-gradient-blue">Nexus</span>
            <span className="text-white"> AI</span>
          </h1>
          <p className="text-sm text-slate-400">
            Claude · DeepSeek · Gemini — <span className="text-emerald-400 font-medium">Бесплатно · Без VPN</span>
          </p>
        </div>

        {/* Card */}
        <div className="glass rounded-2xl p-6 shadow-2xl">
          {/* Benefits */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { icon: <Brain className="w-4 h-4" />, label: 'Реальный AI', color: 'text-blue-400' },
              { icon: <Zap className="w-4 h-4" />, label: 'Без VPN в РФ', color: 'text-emerald-400' },
              { icon: <Globe className="w-4 h-4" />, label: '3 нейросети', color: 'text-purple-400' },
            ].map((b, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-white/3 text-center">
                <span className={b.color}>{b.icon}</span>
                <span className="text-[11px] font-medium text-slate-300">{b.label}</span>
              </div>
            ))}
          </div>

          {/* Name input */}
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Ваше имя (необязательно)"
            className="w-full bg-white/5 border border-white/10 focus:border-blue-500/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors mb-4"
          />

          {/* Google Sign-In */}
          <button
            onClick={triggerGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-sm shadow-lg transition-all cursor-pointer group mb-3 disabled:opacity-60"
          >
            <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>{loading ? 'Входим...' : 'Войти через Google'}</span>
            <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Yandex ID */}
          <button
            onClick={handleYandex}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-[#fc3f1d] hover:bg-[#e03510] text-white font-semibold text-sm shadow-md shadow-red-900/20 transition-all cursor-pointer group mb-4"
          >
            <div className="w-5 h-5 rounded-full bg-white text-[#fc3f1d] font-black text-xs flex items-center justify-center">Я</div>
            <span>Войти через Яндекс ID</span>
            <ArrowRight className="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
          </button>

          {/* Guest */}
          <button
            onClick={onGuest}
            className="w-full py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
          >
            Продолжить как гость (ограниченный доступ)
          </button>
        </div>

        {/* Note about real AI */}
        <p className="text-center text-[11px] text-slate-600 mt-4 px-2">
          Реальный AI работает после добавления ключей в <code className="text-slate-500">server/.env</code>.
          Gemini бесплатен на <a href="https://aistudio.google.com" target="_blank" className="text-blue-500 hover:underline" rel="noreferrer">aistudio.google.com</a>
        </p>
      </div>
    </div>
  );
}

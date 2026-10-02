import React, { useState } from 'react';
import {
  Sparkles, Key, ExternalLink, Check, ChevronRight,
  Zap, Brain, Globe, ArrowRight, Eye, EyeOff,
  AlertCircle, Loader, CheckCircle2, Info
} from 'lucide-react';

export default function SetupWizard({ user, onComplete }) {
  const [step, setStep] = useState(0); // 0=intro, 1=gemini, 2=deepseek, 3=done
  const [geminiKey, setGeminiKey] = useState('');
  const [deepseekKey, setDeepseekKey] = useState('');
  const [showGemini, setShowGemini] = useState(false);
  const [showDeepseek, setShowDeepseek] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // null | 'ok' | 'error'
  const [testMsg, setTestMsg] = useState('');

  const testGemini = async () => {
    if (!geminiKey.trim()) return;
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: 'Hello' }] }] })
        }
      );
      if (res.ok) {
        setTestResult('ok');
        setTestMsg('✅ Ключ работает! Gemini подключён бесплатно.');
      } else {
        const j = await res.json();
        setTestResult('error');
        setTestMsg(`❌ ${j.error?.message || `Ошибка ${res.status}`}`);
      }
    } catch (e) {
      setTestResult('error');
      setTestMsg('❌ Ошибка сети. Попробуй ещё раз.');
    }
    setTesting(false);
  };

  const finish = () => {
    onComplete({
      geminiKey: geminiKey.trim() || null,
      deepseekKey: deepseekKey.trim() || null,
    });
  };

  return (
    <div className="min-h-screen bg-animated flex items-center justify-center p-4">
      {/* Ambient orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #2563eb, transparent)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-6 blur-3xl animate-pulse"
          style={{ background: 'radial-gradient(circle, #7c3aed, transparent)', animationDelay: '1s' }} />
      </div>

      <div className="relative w-full max-w-lg scale-bounce">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[0,1,2,3].map(i => (
            <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-500 ${
              i <= step ? 'bg-blue-500' : 'bg-white/10'
            }`} />
          ))}
        </div>

        {/* ── Step 0: Intro ──────────────────────────────────────────── */}
        {step === 0 && (
          <div className="glass rounded-2xl p-6 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-14 h-14 mx-auto rounded-2xl mb-4 flex items-center justify-center shadow-xl"
                style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">
                Привет, {user?.name?.split(' ')[0] || 'друг'}! 👋
              </h2>
              <p className="text-sm text-slate-400">
                Настроим <strong className="text-white">реальный AI</strong> бесплатно — займёт 2 минуты
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {[
                { icon: '🆓', title: 'Gemini от Google', sub: '1500 запросов в день бесплатно. Ключ за 30 секунд.', color: 'text-emerald-400' },
                { icon: '🔵', title: 'DeepSeek R1 + V3', sub: 'Очень дёшево (~$0.001 за запрос). Мыслящая модель.', color: 'text-blue-400' },
                { icon: '📸', title: 'Анализ фото', sub: 'Скидывай скриншоты, фото задач, кода — нейросеть разберёт.', color: 'text-violet-400' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/4 border border-white/7">
                  <span className="text-xl">{item.icon}</span>
                  <div>
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setStep(1)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white cursor-pointer transition-all"
              style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow: '0 4px 20px rgba(37,99,235,0.4)' }}>
              Настроить бесплатный AI
              <ArrowRight className="w-4 h-4" />
            </button>

            <button onClick={finish}
              className="w-full mt-2 py-2 text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer">
              Пропустить — использовать демо-режим
            </button>
          </div>
        )}

        {/* ── Step 1: Gemini ─────────────────────────────────────────── */}
        {step === 1 && (
          <div className="glass rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#10b981,#0891b2)' }}>
                <span className="text-white font-bold text-sm">G</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Gemini от Google</h2>
                <p className="text-xs text-emerald-400 font-medium">🆓 Полностью бесплатно · Без карты</p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-3 mb-5">
              {[
                { n: '1', text: 'Открой Google AI Studio — нажми кнопку ниже', action: (
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-500 transition-colors cursor-pointer no-underline">
                    Открыть <ExternalLink className="w-3 h-3" />
                  </a>
                )},
                { n: '2', text: 'Нажми «Create API key» → выбери проект (или создай новый)' },
                { n: '3', text: 'Скопируй ключ (начинается с AIza...) и вставь ниже' },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/4 border border-white/7">
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-300 flex-shrink-0">
                    {s.n}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-300">{s.text}</p>
                    {s.action && <div className="mt-2">{s.action}</div>}
                  </div>
                </div>
              ))}
            </div>

            {/* Key input */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Твой Gemini API ключ</label>
              <div className="relative">
                <input
                  type={showGemini ? 'text' : 'password'}
                  value={geminiKey}
                  onChange={e => { setGeminiKey(e.target.value); setTestResult(null); }}
                  placeholder="AIzaSy..."
                  className="w-full bg-white/5 border border-white/10 focus:border-emerald-500/60 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors font-mono"
                />
                <button onClick={() => setShowGemini(!showGemini)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer">
                  {showGemini ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Test result */}
              {testResult && (
                <div className={`mt-2 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                  testResult === 'ok'
                    ? 'bg-emerald-950/40 border border-emerald-500/25 text-emerald-300'
                    : 'bg-red-950/40 border border-red-500/25 text-red-300'
                }`}>
                  {testResult === 'ok' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                  {testMsg}
                </div>
              )}

              {/* Info */}
              <div className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-500">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <span>Ключ хранится в твоём браузере. Сервер использует его для запросов к Gemini. Квота: 1500 запросов/день бесплатно.</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={testGemini} disabled={!geminiKey.trim() || testing}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white bg-white/8 hover:bg-white/12 border border-white/10 transition-all cursor-pointer disabled:opacity-50">
                {testing ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-emerald-400" />}
                {testing ? 'Проверяю...' : 'Проверить ключ'}
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer"
                style={{ background: testResult === 'ok' ? 'linear-gradient(135deg,#10b981,#0891b2)' : 'rgba(255,255,255,0.08)', boxShadow: testResult === 'ok' ? '0 4px 16px rgba(16,185,129,0.3)' : 'none' }}>
                {testResult === 'ok' ? <><Check className="w-4 h-4" />Далее</> : <>Пропустить <ChevronRight className="w-4 h-4" /></>}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: DeepSeek ───────────────────────────────────────── */}
        {step === 2 && (
          <div className="glass rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)' }}>
                <span className="text-white font-bold text-sm">D</span>
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">DeepSeek R1 / V3</h2>
                <p className="text-xs text-blue-400 font-medium">💸 ~0.08₽ за 1000 слов · Из РФ без VPN</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { n: '1', text: 'Зайди на platform.deepseek.com и зарегистрируйся', action: (
                  <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors cursor-pointer no-underline">
                    Открыть DeepSeek <ExternalLink className="w-3 h-3" />
                  </a>
                )},
                { n: '2', text: 'API Keys → Create new API key' },
                { n: '3', text: 'При регистрации дают бесплатные стартовые кредиты ($5)' },
              ].map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/4 border border-white/7">
                  <div className="w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-300 flex-shrink-0">
                    {s.n}
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-300">{s.text}</p>
                    {s.action && <div className="mt-2">{s.action}</div>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">DeepSeek API ключ (необязательно)</label>
              <div className="relative">
                <input
                  type={showDeepseek ? 'text' : 'password'}
                  value={deepseekKey}
                  onChange={e => setDeepseekKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full bg-white/5 border border-white/10 focus:border-blue-500/60 rounded-xl px-3.5 py-2.5 pr-10 text-sm text-white placeholder-slate-600 focus:outline-none transition-colors font-mono"
                />
                <button onClick={() => setShowDeepseek(!showDeepseek)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer">
                  {showDeepseek ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button onClick={() => setStep(3)}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm text-white cursor-pointer transition-all"
              style={{ background: 'linear-gradient(135deg,#2563eb,#4f46e5)', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}>
              {deepseekKey.trim() ? <><Check className="w-4 h-4" />Готово!</> : <>Пропустить <ChevronRight className="w-4 h-4" /></>}
            </button>
          </div>
        )}

        {/* ── Step 3: Done ───────────────────────────────────────────── */}
        {step === 3 && (
          <div className="glass rounded-2xl p-6 shadow-2xl text-center">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>

            <h2 className="text-xl font-bold text-white mb-2">Всё готово! 🎉</h2>
            <p className="text-sm text-slate-400 mb-6">
              {geminiKey.trim() && deepseekKey.trim()
                ? 'Подключены Gemini + DeepSeek. Это настоящий реальный AI!'
                : geminiKey.trim()
                ? 'Gemini подключён — это настоящий AI от Google, бесплатно!'
                : deepseekKey.trim()
                ? 'DeepSeek подключён — реальный AI!'
                : 'Ключи не добавлены. Работает демо-режим.'}
            </p>

            <div className="space-y-2 mb-6 text-left">
              {[
                { active: Boolean(geminiKey.trim()), label: 'Gemini 2.0 Flash + 1.5 Pro', note: 'Бесплатно' },
                { active: Boolean(deepseekKey.trim()), label: 'DeepSeek R1 + V3', note: 'Мыслящая модель' },
                { active: true, label: 'Анализ фото и скриншотов', note: 'Всегда включено' },
                { active: true, label: 'Без VPN · Работает в РФ', note: '' },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 p-2.5 rounded-xl ${item.active ? 'bg-emerald-950/30 border border-emerald-500/20' : 'bg-white/4 border border-white/7 opacity-50'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.active ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
                    <Check className={`w-3 h-3 ${item.active ? 'text-emerald-400' : 'text-slate-600'}`} />
                  </div>
                  <span className={`text-sm flex-1 ${item.active ? 'text-slate-200' : 'text-slate-500'}`}>{item.label}</span>
                  {item.note && <span className="text-[10px] text-emerald-400 font-medium">{item.note}</span>}
                </div>
              ))}
            </div>

            <button onClick={finish}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white cursor-pointer"
              style={{ background: 'linear-gradient(135deg,#10b981,#2563eb)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}>
              <Sparkles className="w-4 h-4" />
              Начать общение с AI!
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

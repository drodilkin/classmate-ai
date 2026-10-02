import React, { useState } from 'react';
import { 
  X, 
  Key, 
  Sliders, 
  HelpCircle, 
  ExternalLink, 
  Check, 
  Eye, 
  EyeOff, 
  Zap, 
  ShieldCheck, 
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { DEFAULT_SETTINGS } from '../constants/models';

export default function SettingsModal({
  isOpen,
  onClose,
  settings,
  onSaveSettings
}) {
  const [activeTab, setActiveTab] = useState('provider'); // 'provider' | 'params' | 'guide'
  const [formData, setFormData] = useState(settings);
  const [showKey, setShowKey] = useState(false);
  const [testStatus, setTestStatus] = useState(null); // null | 'testing' | 'success' | 'error'
  const [testMessage, setTestMessage] = useState('');

  if (!isOpen) return null;

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  const handleSave = () => {
    onSaveSettings(formData);
    onClose();
  };

  const handleReset = () => {
    setFormData(DEFAULT_SETTINGS);
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    setTestMessage('Проверка соединения с сервером...');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat',
          messages: [{ role: 'user', content: 'ping' }],
          provider: formData.provider,
          apiKey: formData.apiKey,
          customBaseUrl: formData.customBaseUrl,
          maxTokens: 5
        })
      });

      if (!res.ok) {
        throw new Error(`Ошибка сервера: ${res.status}`);
      }

      setTestStatus('success');
      setTestMessage('Соединение успешно установлено! Нейросеть отвечает.');
    } catch (err) {
      setTestStatus('error');
      setTestMessage(`Ошибка проверки: ${err.message}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0f1422] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Key className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Настройки подключения</h2>
              <p className="text-xs text-slate-400">Настройка доступа к Claude, DeepSeek и Gemini без VPN</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-slate-800/80 px-6 bg-[#0c101c]">
          <button
            onClick={() => setActiveTab('provider')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'provider'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Провайдер & Ключи</span>
          </button>
          <button
            onClick={() => setActiveTab('params')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'params'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Параметры генерации</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Как это работает в РФ</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'provider' && (
            <>
              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Выберите источник API (Провайдер)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Option 1: OpenRouter */}
                  <div
                    onClick={() => handleChange('provider', 'openrouter')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      formData.provider === 'openrouter'
                        ? 'bg-blue-600/10 border-blue-500/80 shadow-md ring-1 ring-blue-500/30'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-white flex items-center gap-1.5">
                        <span>OpenRouter</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-semibold border border-emerald-500/30">
                          Рекомендуется в РФ
                        </span>
                      </span>
                      {formData.provider === 'openrouter' && (
                        <Check className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      1 ключ на ВСЕ нейросети: Claude 3.7, DeepSeek R1 и Gemini 2.0. Работает в РФ напрямую без VPN!
                    </p>
                  </div>

                  {/* Option 2: DeepSeek Direct */}
                  <div
                    onClick={() => handleChange('provider', 'deepseek')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      formData.provider === 'deepseek'
                        ? 'bg-blue-600/10 border-blue-500/80 shadow-md ring-1 ring-blue-500/30'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-white">DeepSeek Official API</span>
                      {formData.provider === 'deepseek' && (
                        <Check className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Прямой китайский API DeepSeek (R1 и V3). Официально работает из России без VPN.
                    </p>
                  </div>

                  {/* Option 3: ProxyAPI / РФ Карты */}
                  <div
                    onClick={() => handleChange('provider', 'proxyapi')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      formData.provider === 'proxyapi'
                        ? 'bg-blue-600/10 border-blue-500/80 shadow-md ring-1 ring-blue-500/30'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-white">ProxyAPI / РФ карты (МИР)</span>
                      {formData.provider === 'proxyapi' && (
                        <Check className="w-4 h-4 text-blue-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Российский шлюз. Оплата рублями с карт РФ и СБП. Все модели без VPN.
                    </p>
                  </div>

                  {/* Option 4: Demo Mode */}
                  <div
                    onClick={() => handleChange('provider', 'demo')}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      formData.provider === 'demo'
                        ? 'bg-amber-600/10 border-amber-500/80 shadow-md ring-1 ring-amber-500/30'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-amber-300">✨ Демо-режим (Без ключей)</span>
                      {formData.provider === 'demo' && (
                        <Check className="w-4 h-4 text-amber-400" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Работает сразу из коробки без ввода ключей. Симулирует ответы всех моделей.
                    </p>
                  </div>
                </div>
              </div>

              {/* API Key Input */}
              {formData.provider !== 'demo' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      API-ключ ({formData.provider === 'openrouter' ? 'OpenRouter' : formData.provider === 'deepseek' ? 'DeepSeek' : 'ProxyAPI'})
                    </label>
                    {formData.provider === 'openrouter' && (
                      <a
                        href="https://openrouter.ai/keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>Получить ключ OpenRouter</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {formData.provider === 'deepseek' && (
                      <a
                        href="https://platform.deepseek.com/api_keys"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>Получить ключ DeepSeek</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {formData.provider === 'proxyapi' && (
                      <a
                        href="https://proxyapi.ru/"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                      >
                        <span>Получить ключ ProxyAPI</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  <div className="relative">
                    <input
                      type={showKey ? 'text' : 'password'}
                      value={formData.apiKey || ''}
                      onChange={(e) => handleChange('apiKey', e.target.value)}
                      placeholder={
                        formData.provider === 'openrouter' 
                          ? 'sk-or-v1-xxxxxxxx...' 
                          : formData.provider === 'deepseek'
                          ? 'sk-xxxxxxxx...'
                          : 'Вставьте ваш API ключ...'
                      }
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowKey(!showKey)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    🔒 Ключ сохраняется безопасно в вашем браузере (LocalStorage) и используется только для обращений к выбранному сервису.
                  </p>
                </div>
              )}

              {/* Custom Base URL (Optional) */}
              {formData.provider !== 'demo' && (
                <div className="space-y-1.5 pt-1">
                  <label className="text-xs font-semibold text-slate-400">
                    Пользовательский URL шлюза (Опционально)
                  </label>
                  <input
                    type="text"
                    value={formData.customBaseUrl || ''}
                    onChange={(e) => handleChange('customBaseUrl', e.target.value)}
                    placeholder="https://openrouter.ai/api/v1/chat/completions"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              )}

              {/* Test Connection Button */}
              {formData.provider !== 'demo' && (
                <div className="pt-2">
                  <button
                    onClick={handleTestConnection}
                    disabled={testStatus === 'testing' || !formData.apiKey}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Zap className="w-3.5 h-3.5 text-blue-400" />
                    <span>{testStatus === 'testing' ? 'Проверяем...' : 'Проверить соединение'}</span>
                  </button>

                  {testMessage && (
                    <div className={`mt-2 p-2.5 rounded-lg text-xs flex items-center gap-2 ${
                      testStatus === 'success' ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/20' : 'bg-red-950/40 text-red-300 border border-red-500/20'
                    }`}>
                      {testStatus === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />}
                      <span>{testMessage}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {activeTab === 'params' && (
            <div className="space-y-6">
              {/* Temperature */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-200">Креативность (Температура): {formData.temperature}</span>
                  <span className="text-[11px] text-slate-400">
                    {formData.temperature < 0.4 ? 'Строгий и точный код' : formData.temperature > 1 ? 'Максимальная фантазия' : 'Сбалансированный'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0.0"
                  max="1.5"
                  step="0.05"
                  value={formData.temperature}
                  onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Max Tokens */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-200">Максимальная длина ответа (Токены): {formData.maxTokens}</span>
                  <span className="text-[11px] text-slate-400">~{Math.round(formData.maxTokens * 0.75)} слов</span>
                </div>
                <input
                  type="range"
                  min="512"
                  max="8192"
                  step="256"
                  value={formData.maxTokens}
                  onChange={(e) => handleChange('maxTokens', parseInt(e.target.value, 10))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>

              {/* Default System Prompt */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Пользовательский системный промпт (Инструкция для нейросети)
                </label>
                <textarea
                  rows={4}
                  value={formData.systemPrompt || ''}
                  onChange={(e) => handleChange('systemPrompt', e.target.value)}
                  placeholder="Опишите, как модель должна себя вести..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none font-sans"
                />
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-blue-950/30 border border-blue-500/20">
                <h3 className="font-bold text-sm text-blue-300 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  Как работает доступ без VPN в России
                </h3>
                <p className="text-slate-300 text-[11px] mt-1">
                  Официальные API Google (Gemini) и Anthropic (Claude) возвращают ошибку геолокации 403 при запросах с российских IP. Наше приложение решает эту проблему тремя надежными путями:
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="font-bold text-slate-100 mb-1">1. OpenRouter (Рекомендуемый способ)</div>
                  <p className="text-slate-400 text-[11px]">
                    OpenRouter — глобальный шлюз нейросетей, серверы которого находятся за пределами ограничений. Запросы от вашего ПК к OpenRouter идут напрямую без VPN на полной скорости вашего интернета. В одном месте доступны и Claude 3.7 Sonnet, и DeepSeek R1, и Gemini 2.0 Flash.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="font-bold text-slate-100 mb-1">2. DeepSeek Direct API</div>
                  <p className="text-slate-400 text-[11px]">
                    Компания DeepSeek (Китай) не блокирует пользователей из России. Их официальный API (<code className="text-blue-300">api.deepseek.com</code>) прекрасно работает напрямую без всяких прокси и VPN.
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="font-bold text-slate-100 mb-1">3. Российские шлюзы (ProxyAPI / VseGPT)</div>
                  <p className="text-slate-400 text-[11px]">
                    Специализированные шлюзы, позволяющие пополнять баланс российскими банковскими картами (МИР, СБП) и предоставляющие доступ ко всем зарубежным нейросетям без VPN.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-slate-300 hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Отмена
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              Сохранить настройки
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

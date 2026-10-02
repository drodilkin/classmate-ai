import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Check, ArrowRight, RefreshCw } from 'lucide-react';
import { getYandexAuthUrl } from '../services/yandexAuth.js';
import { getVKAuthUrl, fetchVKUserProfile } from '../services/vkAuth.js';

export default function AuthModal({ isOpen, onLogin }) {
  const [loading, setLoading] = useState(null); // 'yandex' | 'vk' | null
  const vkContainerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Initialize official VK ID OneTap widget if SDK is available
    if (window.VKIDSDK && vkContainerRef.current) {
      try {
        const VKID = window.VKIDSDK;
        VKID.Config.init({
          app: 54801813,
          redirectUrl: window.location.origin + window.location.pathname,
          responseMode: VKID.ConfigResponseMode.Callback,
          source: VKID.ConfigSource.LOWCODE,
          scope: '',
        });

        const oAuth = new VKID.OAuthList();
        oAuth.render({
          container: vkContainerRef.current,
          oauthList: ['vkid']
        })
        .on(VKID.OAuthListInternalEvents.LOGIN_SUCCESS, async function (payload) {
          if (payload.token || payload.access_token) {
            const token = payload.token || payload.access_token;
            const userId = payload.user_id || payload.id;
            const profile = userId ? await fetchVKUserProfile(userId, token) : null;
            
            const user = {
              id: userId || 'vk_user',
              name: profile?.name || 'Пользователь ВКонтакте',
              email: payload.email || (userId ? `id${userId}@vk.com` : 'user@vk.com'),
              provider: 'vk',
              avatar: profile?.avatar || null,
              avatarLetter: profile?.avatarLetter || 'V',
              token: token,
              signedAt: new Date().toISOString()
            };
            onLogin(user);
          }
        });
      } catch (err) {
        console.warn('VK SDK init error:', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Real Yandex ID OAuth Redirect
  const handleYandexOAuth = () => {
    setLoading('yandex');
    window.location.href = getYandexAuthUrl();
  };

  // Real VK ID OAuth Redirect
  const handleVKOAuth = () => {
    setLoading('vk');
    window.location.href = getVKAuthUrl();
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
            <span>Официальная авторизация</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Вход в <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">ClassMate AI</span>
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Для сохранения твоих решений домашки и доступа к нейросетям войди через официальный Яндекс ID или VK ID.
          </p>
        </div>

        {/* Buttons List */}
        <div className="space-y-3">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center">
            Официальные способы входа
          </div>

          {/* OFFICIAL VK ID BUTTON */}
          <button
            type="button"
            onClick={handleVKOAuth}
            disabled={loading !== null}
            className="w-full py-4 px-5 rounded-2xl bg-[#0077ff] hover:bg-[#0066dd] text-white font-semibold text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer group active:scale-98"
          >
            {loading === 'vk' ? (
              <RefreshCw className="w-5 h-5 animate-spin text-white" />
            ) : (
              <>
                {/* Official VK Logo */}
                <svg className="w-5 h-5 fill-current shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                  <path d="M15.07 2H8.93C4.33 2 2 4.33 2 8.93v6.14C2 19.67 4.33 22 8.93 22h6.14c4.6 0 6.93-2.33 6.93-6.93V8.93C22 4.33 19.67 2 15.07 2zm3.38 13.91c-.49.62-1.35 1.15-2.22 1.15h-.62c-.34 0-.54-.22-.72-.45-.37-.48-.82-1.07-1.28-1.07-.15 0-.27.07-.36.21-.18.28-.24.63-.24.98 0 .23-.15.38-.38.38h-.87c-1.92 0-3.64-1.12-4.9-2.91-1.89-2.69-3.23-5.74-3.26-5.81-.08-.18.06-.38.25-.38h1.84c.17 0 .3.1.37.26.96 2.33 2.24 4.38 2.82 4.38.1 0 .19-.05.24-.14.12-.23.15-.9.15-1.52V9.45c0-.49-.14-.71-.52-.76-.13-.02-.21-.1-.21-.21 0-.17.15-.35.39-.35h2.29c.28 0 .42.15.42.42v3.17c0 .15.07.24.16.24.08 0 .16-.06.24-.16.71-.97 1.63-2.73 2.1-4.08.06-.18.2-.28.38-.28h1.84c.23 0 .38.19.33.42-.25 1.07-1.39 2.92-2.14 3.92-.12.16-.14.26-.04.38.21.26.79.87 1.18 1.41.69.96 1.15 1.77 1.15 2.11 0 .2-.13.34-.33.34z"/>
                </svg>
                <span className="tracking-wide">Войти с VK ID (Официально)</span>
                <ArrowRight className="w-4 h-4 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          {/* Optional VK OneTap Container */}
          <div ref={vkContainerRef} className="flex justify-center empty:hidden" />

          {/* OFFICIAL YANDEX ID BUTTON */}
          <button
            type="button"
            onClick={handleYandexOAuth}
            disabled={loading !== null}
            className="w-full py-4 px-5 rounded-2xl bg-black hover:bg-slate-900 text-white font-semibold text-sm shadow-md hover:shadow-xl transition-all flex items-center justify-center gap-3 cursor-pointer group active:scale-98"
          >
            {loading === 'yandex' ? (
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

          {/* Info Badge */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 space-y-1.5">
            <div className="flex items-center gap-2 font-semibold text-slate-800">
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Официальные ключи авторизации подключены:</span>
            </div>
            <div className="text-[10px] text-slate-500 pl-6 space-y-0.5">
              <div>• VK ID (App 54801813)</div>
              <div>• Яндекс ID (App 7220f879)</div>
            </div>
          </div>
        </div>

        {/* Security footer */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 border-t border-slate-100 pt-3">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Безопасный официальный OAuth • РФ Без VPN</span>
        </div>

      </div>
    </div>
  );
}

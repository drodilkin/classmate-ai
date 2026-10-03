import { Capacitor } from '@capacitor/core';

export const YANDEX_CLIENT_ID = '7220f879144a492fa7aa7fa2e21e2630';

const WEB_REDIRECT_URI = 'https://drodilkin.github.io/classmate-ai/';
const ANDROID_REDIRECT_URI = 'classmate://auth';

function getRedirectUri() {
  return Capacitor.isNativePlatform() ? ANDROID_REDIRECT_URI : WEB_REDIRECT_URI;
}

export function getYandexAuthUrl() {
  const redirectUri = getRedirectUri();
  return `https://oauth.yandex.ru/authorize?response_type=token&client_id=${YANDEX_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}

async function fetchYandexUser(accessToken) {
  const res = await fetch(`https://login.yandex.ru/info?format=json&oauth_token=${accessToken}`);
  if (!res.ok) throw new Error(`Yandex error: ${res.status}`);
  const data = await res.json();
  const name = data.real_name || data.display_name || data.first_name || 'Пользователь';
  return {
    id: data.id,
    name,
    email: data.default_email || `${data.login}@yandex.ru`,
    provider: 'yandex',
    avatar: data.default_avatar_id
      ? `https://avatars.yandex.net/get-yapic/${data.default_avatar_id}/islands-200`
      : null,
    avatarLetter: name[0]?.toUpperCase() || 'Я',
    token: accessToken,
    signedAt: new Date().toISOString()
  };
}

// For Android — opens in-app browser, listens for deep link callback
export async function loginWithYandexAndroid(onSuccess, onError) {
  try {
    const { Browser } = await import('@capacitor/browser');
    const { App } = await import('@capacitor/app');

    const authUrl = getYandexAuthUrl();

    const listener = await App.addListener('appUrlOpen', async ({ url }) => {
      if (url && url.startsWith('classmate://auth')) {
        await listener.remove();
        await Browser.close();

        const hashPart = url.includes('#') ? url.split('#')[1] : '';
        const params = new URLSearchParams(hashPart);
        const token = params.get('access_token');

        if (token) {
          try {
            const user = await fetchYandexUser(token);
            onSuccess(user);
          } catch (err) {
            onError(err);
          }
        } else {
          onError(new Error('Токен не получен'));
        }
      }
    });

    await Browser.open({ url: authUrl, presentationStyle: 'popover' });
  } catch (err) {
    onError(err);
  }
}

// For Web — standard redirect flow
export async function checkAndHandleYandexToken() {
  if (Capacitor.isNativePlatform()) return null;

  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token=')) return null;

  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const accessToken = params.get('access_token');
  if (!accessToken) return null;

  window.history.replaceState(null, '', window.location.pathname + window.location.search);

  try {
    return await fetchYandexUser(accessToken);
  } catch (err) {
    console.error('Yandex user info error:', err);
    return null;
  }
}

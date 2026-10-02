// Official Yandex ID OAuth (Implicit Flow / Token)
export const YANDEX_CLIENT_ID = '7220f879144a492fa7aa7fa2e21e2630';

export function getYandexAuthUrl() {
  const redirectUri = window.location.origin + window.location.pathname;
  return `https://oauth.yandex.ru/authorize?response_type=token&client_id=${YANDEX_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}`;
}

export async function checkAndHandleYandexToken() {
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token=')) {
    return null;
  }

  // Parse token from URL fragment
  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const accessToken = params.get('access_token');

  if (!accessToken) return null;

  // Clear hash from URL without reloading
  window.history.replaceState(null, '', window.location.pathname + window.location.search);

  try {
    const res = await fetch(`https://login.yandex.ru/info?format=json&oauth_token=${accessToken}`);
    if (!res.ok) {
      throw new Error(`Ошибка получения данных Яндекса: ${res.status}`);
    }

    const data = await res.json();
    const name = data.real_name || data.display_name || data.first_name || 'Пользователь Яндекс';
    const avatar = data.default_avatar_id
      ? `https://avatars.yandex.net/get-yapic/${data.default_avatar_id}/islands-200`
      : null;

    const user = {
      id: data.id,
      name: name,
      email: data.default_email || `${data.login || 'user'}@yandex.ru`,
      provider: 'yandex',
      avatar: avatar,
      avatarLetter: name[0]?.toUpperCase() || 'Я',
      token: accessToken,
      signedAt: new Date().toISOString()
    };

    return user;
  } catch (err) {
    console.error('Yandex user info error:', err);
    return null;
  }
}

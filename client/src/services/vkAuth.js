// Official VK ID OAuth (Implicit Flow / Token)
export const VK_APP_ID = 54801813;

export function getVKAuthUrl() {
  const redirectUri = window.location.origin + window.location.pathname;
  return `https://oauth.vk.com/authorize?client_id=${VK_APP_ID}&display=page&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=email&v=5.131`;
}

// Fetch VK user profile (first_name, last_name, photo) via JSONP to bypass CORS
export function fetchVKUserProfile(userId, accessToken) {
  return new Promise((resolve) => {
    const callbackName = 'vk_profile_cb_' + Date.now();
    const script = document.createElement('script');
    script.src = `https://api.vk.com/method/users.get?user_ids=${userId}&fields=photo_200,first_name,last_name&access_token=${accessToken}&v=5.131&callback=${callbackName}`;
    
    const timeout = setTimeout(() => {
      if (window[callbackName]) {
        delete window[callbackName];
        try { document.body.removeChild(script); } catch {}
        resolve(null);
      }
    }, 4000);

    window[callbackName] = (data) => {
      clearTimeout(timeout);
      delete window[callbackName];
      try { document.body.removeChild(script); } catch {}

      if (data && data.response && data.response[0]) {
        const u = data.response[0];
        resolve({
          name: `${u.first_name} ${u.last_name}`,
          avatar: u.photo_200,
          avatarLetter: u.first_name?.[0]?.toUpperCase() || 'V'
        });
      } else {
        resolve(null);
      }
    };

    script.onerror = () => {
      clearTimeout(timeout);
      delete window[callbackName];
      try { document.body.removeChild(script); } catch {}
      resolve(null);
    };

    document.body.appendChild(script);
  });
}

// Check and parse VK OAuth callback from URL hash
export async function checkAndHandleVKToken() {
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token=') || !hash.includes('user_id=')) {
    return null;
  }

  const params = new URLSearchParams(hash.replace(/^#/, ''));
  const accessToken = params.get('access_token');
  const userId = params.get('user_id');
  const email = params.get('email');

  if (!accessToken || !userId) return null;

  // Clear hash from URL
  window.history.replaceState(null, '', window.location.pathname + window.location.search);

  // Fetch real profile details
  const profile = await fetchVKUserProfile(userId, accessToken);

  const fullName = profile?.name || (email ? email.split('@')[0] : `VK ID ${userId}`);
  const user = {
    id: userId,
    name: fullName,
    email: email || `id${userId}@vk.com`,
    provider: 'vk',
    avatar: profile?.avatar || null,
    avatarLetter: profile?.avatarLetter || fullName[0]?.toUpperCase() || 'V',
    token: accessToken,
    signedAt: new Date().toISOString()
  };

  return user;
}

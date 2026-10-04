// Reviews Storage & Sync Service for ClassMate AI
// Supports:
// 1. Static reviews from /data/reviews.json (GitHub Pages)
// 2. Real-time community reviews from GitHub Issues API
// 3. Local verified submissions with Anti-bot (CAPTCHA, Honeypot, Cooldown)
// 4. Profanity and obscenity filter integration

import { validateReviewText } from '../utils/profanityFilter.js';

const STORAGE_REVIEWS = 'classmate_reviews_v2';
const STORAGE_LAST_SUBMIT = 'classmate_last_review_submit';
const GITHUB_REPO = 'drodilkin/classmate-ai';

// Fallback initial reviews if offline
const FALLBACK_REVIEWS = [
  {
    id: 'rev_real_1',
    author: 'Даниил Волков',
    role: 'Ученик 7Б класса',
    avatarLetter: 'Д',
    color: 'from-blue-500 to-indigo-600',
    rating: 5,
    subject: 'Русский язык',
    text: 'Очень выручает, когда делаешь домашку вечером! Написал номер упражнения — сразу показал правило и как правильно разобрать по составу. Спасибо разработчикам за такой сервис.',
    date: 'Вчера в 17:40',
    timestamp: Date.now() - 86400000,
    verified: true,
    isYandex: true,
    source: 'school'
  },
  {
    id: 'rev_real_2',
    author: 'Алина С.',
    role: 'Пользователь',
    avatarLetter: 'А',
    color: 'from-pink-500 to-rose-600',
    rating: 5,
    subject: 'Геометрия',
    text: 'Геометрия для меня всегда была самым сложным предметом, особенно доказательства теорем. ClassMate AI объясняет каждый шаг простыми словами без заумных фраз. Очень классная озвучка ответов!',
    date: '2 дня назад',
    timestamp: Date.now() - 172800000,
    verified: true,
    isYandex: false,
    source: 'school'
  }
];

/**
 * Generate a simple anti-bot math question
 */
export function generateMathCaptcha() {
  const a = Math.floor(Math.random() * 8) + 2; // 2..9
  const b = Math.floor(Math.random() * 8) + 1; // 1..8
  return {
    question: `Сколько будет ${a} + ${b}?`,
    answer: String(a + b)
  };
}

/**
 * Get locally stored user-submitted reviews
 */
export function getLocalReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_REVIEWS);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data)) return data;
    }
  } catch {}
  return [];
}

/**
 * Parse an issue from GitHub Issues into a review item
 */
function parseIssueToReview(issue) {
  try {
    let rating = 5;
    let subject = 'Общее';
    let text = issue.body || '';

    // Check for formatted metadata in issue body: [Предмет: Алгебра] [Оценка: 5]
    const ratingMatch = text.match(/(?:Оценка|Рейтинг|Звезд|Stars?)\s*[:=]\s*([1-5])/i);
    if (ratingMatch) rating = parseInt(ratingMatch[1], 10);

    const subjectMatch = text.match(/(?:Предмет|Subject)\s*[:=]\s*([^\n\r\]]+)/i);
    if (subjectMatch) subject = subjectMatch[1].trim();

    // Clean metadata lines from body
    text = text
      .replace(/^#+.*$/gm, '')
      .replace(/(?:Оценка|Рейтинг|Звезд|Предмет|Subject)\s*[:=].*$/gmi, '')
      .trim();

    const authorName = issue.user?.login || 'Пользователь GitHub';

    return {
      id: 'gh_' + issue.id,
      author: authorName,
      role: 'Пользователь GitHub',
      avatarUrl: issue.user?.avatar_url,
      avatarLetter: authorName[0]?.toUpperCase() || 'G',
      color: 'from-violet-500 to-purple-600',
      rating,
      subject,
      text: text || issue.title,
      date: new Date(issue.created_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
      timestamp: new Date(issue.created_at).getTime(),
      verified: true,
      isGitHub: true,
      githubUrl: issue.html_url,
      source: 'github'
    };
  } catch {
    return null;
  }
}

/**
 * Fetch and merge reviews from:
 * 1. public/data/reviews.json
 * 2. GitHub Issues API (label=review or title=[Отзыв])
 * 3. LocalStorage user submissions
 */
export async function fetchAllReviews() {
  const localList = getLocalReviews();
  let publicList = [];
  let gitHubList = [];

  // 1. Fetch bundled public reviews
  try {
    const res = await fetch('./data/reviews.json');
    if (res.ok) {
      publicList = await res.json();
    }
  } catch (err) {
    console.warn('Could not load /data/reviews.json, using fallback:', err);
    publicList = FALLBACK_REVIEWS;
  }

  // 2. Fetch live community reviews from GitHub Issues
  try {
    const ghRes = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/issues?state=all&per_page=30`, {
      headers: { Accept: 'application/vnd.github.v3+json' }
    });
    if (ghRes.ok) {
      const issues = await ghRes.json();
      if (Array.isArray(issues)) {
        gitHubList = issues
          .filter(issue => !issue.pull_request)
          .filter(issue => {
            const hasReviewLabel = issue.labels?.some(l => l.name?.toLowerCase().includes('review') || l.name?.toLowerCase().includes('отзыв'));
            const hasReviewTitle = issue.title?.toLowerCase().includes('отзыв') || issue.title?.toLowerCase().includes('[review]');
            return hasReviewLabel || hasReviewTitle;
          })
          .map(parseIssueToReview)
          .filter(Boolean);
      }
    }
  } catch (err) {
    console.warn('Could not load GitHub issues reviews:', err);
  }

  // Merge and deduplicate by ID
  const map = new Map();
  // Local first (newest user's reviews on top)
  localList.forEach(r => map.set(r.id, r));
  // Then GitHub issues
  gitHubList.forEach(r => { if (!map.has(r.id)) map.set(r.id, r); });
  // Then public base reviews
  publicList.forEach(r => { if (!map.has(r.id)) map.set(r.id, r); });

  const all = Array.from(map.values());
  // Sort descending by timestamp
  all.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

  return all;
}

/**
 * Returns currently cached or local reviews synchronously for instant render
 */
export function getReviews() {
  const local = getLocalReviews();
  const map = new Map();
  local.forEach(r => map.set(r.id, r));
  FALLBACK_REVIEWS.forEach(r => { if (!map.has(r.id)) map.set(r.id, r); });
  const list = Array.from(map.values());
  list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  return list;
}

/**
 * Add a new review with full Anti-bot, Cooldown and Profanity validation
 */
export function addReview({
  author,
  role = 'Пользователь',
  rating = 5,
  subject = 'Общее',
  text,
  user = null,
  honeypot = '',
  captchaAnswer = '',
  expectedCaptcha = ''
}) {
  // 1. Honeypot check (anti-bot trap)
  if (honeypot && honeypot.trim().length > 0) {
    throw new Error('Обнаружен подозрительный бот-запрос.');
  }

  // 2. Anti-bot Math check for non-authenticated guests
  const isAuthenticated = Boolean(user && (user.name || user.email));
  if (!isAuthenticated) {
    if (!expectedCaptcha || captchaAnswer.trim() !== expectedCaptcha.trim()) {
      throw new Error('Неверный ответ на антибот-проверку. Попробуйте еще раз.');
    }
  }

  // 3. Cooldown check (prevent spamming multiple reviews)
  const lastSubmit = localStorage.getItem(STORAGE_LAST_SUBMIT);
  if (lastSubmit) {
    const diffSec = Math.floor((Date.now() - Number(lastSubmit)) / 1000);
    if (diffSec < 30) {
      throw new Error(`Пожалуйста, подождите еще ${30 - diffSec} сек. перед отправкой следующего отзыва.`);
    }
  }

  // 4. Author name check
  const authorName = (author || (user ? user.name : '')).trim();
  if (!authorName || authorName.length < 2) {
    throw new Error('Пожалуйста, укажите ваше имя (минимум 2 символа).');
  }

  // 5. Profanity & content validation
  const validation = validateReviewText(text);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // Assign visually appealing avatar color
  const colors = [
    'from-indigo-500 to-violet-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-red-600',
    'from-cyan-500 to-blue-600'
  ];
  const chosenColor = colors[Math.floor(Math.random() * colors.length)];

  const newRev = {
    id: 'rev_' + Date.now(),
    author: authorName,
    role: role || (isAuthenticated ? 'Авторизованный пользователь' : 'Пользователь'),
    avatarLetter: authorName[0].toUpperCase(),
    avatarUrl: user?.avatar || null,
    color: chosenColor,
    rating: Math.max(1, Math.min(5, Number(rating) || 5)),
    subject: subject || 'Общее',
    text: text.trim(),
    email: user ? (user.email || '') : '',
    date: 'Только что',
    timestamp: Date.now(),
    verified: true,
    isYandex: isAuthenticated,
    source: 'user'
  };

  const currentLocal = getLocalReviews();
  const updated = [newRev, ...currentLocal];

  try {
    localStorage.setItem(STORAGE_REVIEWS, JSON.stringify(updated));
    localStorage.setItem(STORAGE_LAST_SUBMIT, String(Date.now()));
    window.dispatchEvent(new CustomEvent('classmate:review_added', { detail: newRev }));
  } catch (e) {
    console.error('Failed to save review in localStorage:', e);
  }

  return newRev;
}

/**
 * Creates pre-filled GitHub Issue URL so users can post directly to the public repository
 */
export function getGitHubReviewIssueUrl({ author, rating, subject, text }) {
  const stars = '★'.repeat(rating) + '☆'.repeat(5 - rating);
  const title = encodeURIComponent(`[Отзыв] ${author} — ${stars}`);
  const body = encodeURIComponent(
`### 🎓 Отзыв от реального пользователя ClassMate AI

- **Автор:** ${author}
- **Предмет:** ${subject}
- **Оценка:** ${rating} / 5 (${stars})
- **Дата:** ${new Date().toLocaleString('ru-RU')}

---

${text}

---
*Опубликовано через сервис ClassMate AI*`
  );

  return `https://github.com/${GITHUB_REPO}/issues/new?title=${title}&body=${body}&labels=review`;
}

/**
 * Calculate statistical breakdown of ratings
 */
export function getReviewsStats(reviewsList = []) {
  const reviews = Array.isArray(reviewsList) && reviewsList.length > 0 ? reviewsList : getReviews();
  if (!reviews.length) return { average: '5.0', total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };

  const sum = reviews.reduce((acc, r) => acc + (r.rating || 5), 0);
  const average = (sum / reviews.length).toFixed(1);

  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach(r => {
    const rate = Math.round(r.rating || 5);
    if (breakdown[rate] !== undefined) breakdown[rate]++;
  });

  return {
    average,
    total: reviews.length,
    breakdown
  };
}

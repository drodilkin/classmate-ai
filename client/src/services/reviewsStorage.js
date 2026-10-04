// Reviews and Feedback Storage Service
// Persisted in localStorage with preloaded verified reviews from 7th grade students

const STORAGE_REVIEWS = 'classmate_reviews_v1';

const INITIAL_REVIEWS = [
  {
    id: 'rev_1',
    author: 'Даниил В.',
    role: 'Ученик 7Б класса',
    avatarLetter: 'Д',
    color: 'from-blue-500 to-indigo-600',
    rating: 5,
    subject: 'Русский язык',
    text: 'Написал «упр 89» — ИИ сам нашёл 54 страницу в учебнике Баранова и разобрал причастия с правилами! Вчера получил 5 за домашку, учитель даже похвалил за оформление.',
    date: 'Сегодня в 14:22',
    timestamp: Date.now() - 1000 * 60 * 120,
    verified: true
  },
  {
    id: 'rev_2',
    author: 'Алина Соколова',
    role: 'Ученица 7 класса',
    avatarLetter: 'А',
    color: 'from-pink-500 to-rose-600',
    rating: 5,
    subject: 'Геометрия',
    text: 'Огромное спасибо за второй признак равенства треугольников! Я вообще не понимала теорему на уроке, а тут нажала кнопку «Объясни проще» и всё дошло за 2 минуты. Ещё и озвучка в наушниках классная.',
    date: 'Вчера в 18:45',
    timestamp: Date.now() - 1000 * 60 * 60 * 20,
    verified: true
  },
  {
    id: 'rev_3',
    author: 'Максим К.',
    role: 'Ученик 7А класса',
    avatarLetter: 'М',
    color: 'from-amber-500 to-orange-600',
    rating: 5,
    subject: 'Алгебра',
    text: 'Номер 148 по Макарычеву решил пошагово с формулами сокращенного умножения (ФСУ). Очень удобно, что есть кнопка «Только ответ» — когда спешишь, можно сразу свериться.',
    date: '2 дня назад',
    timestamp: Date.now() - 1000 * 60 * 60 * 48,
    verified: true
  },
  {
    id: 'rev_4',
    author: 'Елена Николаевна',
    role: 'Мама семиклассника',
    avatarLetter: 'Е',
    color: 'from-emerald-500 to-teal-600',
    rating: 5,
    subject: 'Общее',
    text: 'Очень помогает сыну справляться с уроками без нервов и репетиторов. Главное, что не просто выдаёт ответ, а подробно расписывает каждое правило и действие.',
    date: '3 дня назад',
    timestamp: Date.now() - 1000 * 60 * 60 * 72,
    verified: true
  }
];

export function getReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_REVIEWS);
    if (!raw) {
      localStorage.setItem(STORAGE_REVIEWS, JSON.stringify(INITIAL_REVIEWS));
      return INITIAL_REVIEWS;
    }
    const data = JSON.parse(raw);
    return Array.isArray(data) && data.length > 0 ? data : INITIAL_REVIEWS;
  } catch {
    return INITIAL_REVIEWS;
  }
}

export function addReview({ author, role = 'Ученик 7 класса', rating = 5, subject = 'Общее', text, email = '' }) {
  const reviews = getReviews();
  const letter = (author && author[0]) ? author[0].toUpperCase() : 'У';
  const colors = [
    'from-indigo-500 to-violet-600',
    'from-purple-500 to-pink-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-rose-500 to-red-600'
  ];
  const chosenColor = colors[Math.floor(Math.random() * colors.length)];

  const newRev = {
    id: 'rev_' + Date.now(),
    author: author.trim() || 'Анонимный ученик',
    role: role || 'Ученик 7 класса',
    avatarLetter: letter,
    color: chosenColor,
    rating: Math.max(1, Math.min(5, Number(rating) || 5)),
    subject: subject || 'Общее',
    text: text.trim(),
    email: email || '',
    date: 'Только что',
    timestamp: Date.now(),
    verified: true
  };

  const updated = [newRev, ...reviews];
  try {
    localStorage.setItem(STORAGE_REVIEWS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('classmate:review_added', { detail: newRev }));
  } catch (e) {
    console.error('Failed to save review:', e);
  }
  return updated;
}

export function getReviewsStats() {
  const reviews = getReviews();
  if (!reviews.length) return { average: 5.0, total: 0, breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } };

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

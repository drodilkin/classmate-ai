// Study Tracker: Streaks, Daily Task Counter & Bookmarks
// Persisted in localStorage for a human, personalized experience

const STORAGE_STREAK = 'classmate_streak_v1';
const STORAGE_BOOKMARKS = 'classmate_bookmarks_v1';
const STORAGE_DAILY = 'classmate_daily_tasks_v1';

export function getTodayDateStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getStudyStreak() {
  try {
    const raw = localStorage.getItem(STORAGE_STREAK);
    if (!raw) return { count: 1, lastDate: getTodayDateStr() };
    const data = JSON.parse(raw);
    const today = getTodayDateStr();
    
    // Check if yesterday or today
    const last = new Date(data.lastDate);
    const curr = new Date(today);
    const diffDays = Math.round((curr - last) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return data;
    } else if (diffDays === 1) {
      return data;
    } else {
      // Streak broken, reset to 1
      return { count: 1, lastDate: today };
    }
  } catch {
    return { count: 1, lastDate: getTodayDateStr() };
  }
}

export function incrementStudyStreak() {
  try {
    const current = getStudyStreak();
    const today = getTodayDateStr();
    if (current.lastDate !== today) {
      const updated = { count: current.count + 1, lastDate: today };
      localStorage.setItem(STORAGE_STREAK, JSON.stringify(updated));
      return updated;
    }
    return current;
  } catch {
    return { count: 1, lastDate: getTodayDateStr() };
  }
}

export function getDailyTasksCount() {
  try {
    const raw = localStorage.getItem(STORAGE_DAILY);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    if (data.date === getTodayDateStr()) {
      return data.count || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

export function recordTaskCompleted() {
  try {
    const today = getTodayDateStr();
    const currentCount = getDailyTasksCount();
    const newCount = currentCount + 1;
    localStorage.setItem(STORAGE_DAILY, JSON.stringify({ date: today, count: newCount }));
    incrementStudyStreak();
    window.dispatchEvent(new CustomEvent('classmate:task_completed', { detail: { count: newCount } }));
    return newCount;
  } catch {
    return 1;
  }
}

export function getBookmarks() {
  try {
    const raw = localStorage.getItem(STORAGE_BOOKMARKS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleBookmark(item) {
  try {
    const bookmarks = getBookmarks();
    const existsIdx = bookmarks.findIndex(b => b.id === item.id || (b.content && b.content === item.content));
    let updated;
    if (existsIdx >= 0) {
      updated = bookmarks.filter((_, i) => i !== existsIdx);
    } else {
      const newBookmark = {
        id: item.id || 'bm_' + Date.now(),
        title: item.title || 'Решение задачи',
        content: item.content,
        subject: item.subject || 'Общее',
        date: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
        timestamp: Date.now()
      };
      updated = [newBookmark, ...bookmarks];
    }
    localStorage.setItem(STORAGE_BOOKMARKS, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('classmate:bookmarks_updated', { detail: updated }));
    return updated;
  } catch {
    return [];
  }
}

export function isItemBookmarked(content) {
  if (!content) return false;
  const bookmarks = getBookmarks();
  return bookmarks.some(b => b.content === content);
}

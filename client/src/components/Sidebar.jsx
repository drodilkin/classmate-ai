import React, { useState, useEffect } from 'react';
import {
  Home, Plus, MessageSquare, Trash2, Search,
  PanelLeftClose, Zap, Image as ImgIcon, LogOut, X, BookOpen,
  Star, Flame, Sparkles
} from 'lucide-react';
import { getBookmarks, getDailyTasksCount, getStudyStreak } from '../services/studyTracker.js';

const SUBJECTS = [
  { emoji: '🔢', name: 'Алгебра' },
  { emoji: '📐', name: 'Геометрия' },
  { emoji: '📝', name: 'Русский язык' },
  { emoji: '⚛️', name: 'Физика' },
  { emoji: '🧪', name: 'Химия' },
  { emoji: '📖', name: 'Литература' },
  { emoji: '📜', name: 'История' },
  { emoji: '🇬🇧', name: 'Английский' },
  { emoji: '🌿', name: 'Биология' },
  { emoji: '💻', name: 'Информатика' },
];

export default function Sidebar({
  open, setOpen,
  chats, activeChatId, onSelectChat, onNewChat, onDeleteChat,
  onNewChatWithSubject, onOpenTextbooks, onOpenCheatSheet, onOpenBookmarks,
  user, onLogout, onOpenLogin
}) {
  const [search, setSearch] = useState('');
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [dailyCount, setDailyCount] = useState(0);
  const [streak, setStreak] = useState({ count: 1 });

  const updateStats = () => {
    setBookmarkCount(getBookmarks().length);
    setDailyCount(getDailyTasksCount());
    setStreak(getStudyStreak());
  };

  useEffect(() => {
    updateStats();
    window.addEventListener('classmate:bookmarks_updated', updateStats);
    window.addEventListener('classmate:task_completed', updateStats);
    return () => {
      window.removeEventListener('classmate:bookmarks_updated', updateStats);
      window.removeEventListener('classmate:task_completed', updateStats);
    };
  }, []);

  const filteredChats = chats.filter(c =>
    (c.title || 'Новый диалог').toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-72 bg-slate-50/95 dark:bg-slate-900/95 backdrop-blur-md border-r border-slate-200/90 dark:border-slate-800
        flex flex-col justify-between
        transition-all duration-200 ease-in-out select-none
        ${open ? 'translate-x-0' : '-translate-x-full lg:-translate-x-full lg:w-0 lg:border-none overflow-hidden'}
      `}>
        {/* Top Header */}
        <div className="flex flex-col border-b border-slate-200/80 dark:border-slate-800 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 font-semibold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
              {/* Brand Logo */}
              <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white font-bold text-sm shadow-sm shadow-indigo-500/25 ring-2 ring-white/20">
                🎓
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">ClassMate</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/60 dark:border-indigo-800/60">
                AI
              </span>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Свернуть меню"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* Action Row: New Chat */}
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) setOpen(false);
            }}
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Новый диалог</span>
          </button>

          {/* Tool shortcuts: Textbooks, Cheat Sheet, Bookmarks */}
          <div className="grid grid-cols-3 gap-1.5 pt-0.5">
            {/* Textbooks */}
            <button
              onClick={() => {
                if (onOpenTextbooks) onOpenTextbooks();
                if (window.innerWidth < 1024) setOpen(false);
              }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-400 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs group"
              title="Учебники 7 класс"
            >
              <span className="text-base group-hover:scale-110 transition-transform">📚</span>
              <span className="mt-0.5 truncate">Учебники</span>
            </button>

            {/* Cheat Sheet */}
            <button
              onClick={() => {
                if (onOpenCheatSheet) onOpenCheatSheet();
                if (window.innerWidth < 1024) setOpen(false);
              }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-400 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs group"
              title="Шпаргалка формул"
            >
              <span className="text-base group-hover:scale-110 transition-transform">📐</span>
              <span className="mt-0.5 truncate">Формулы</span>
            </button>

            {/* Bookmarks */}
            <button
              onClick={() => {
                if (onOpenBookmarks) onOpenBookmarks();
                if (window.innerWidth < 1024) setOpen(false);
              }}
              className="flex flex-col items-center justify-center p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-amber-400 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs group relative"
              title="Мои закладки"
            >
              <span className="text-base group-hover:scale-110 transition-transform">⭐</span>
              <span className="mt-0.5 truncate">Закладки</span>
              {bookmarkCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск диалогов..."
              className="w-full bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:border-indigo-400 dark:focus:border-indigo-500 transition-all shadow-2xs"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Middle Navigation, Subjects & Chats List */}
        <div className="flex-1 overflow-y-auto px-2.5 py-3 space-y-4">
          
          {/* Daily Streak Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-orange-50/80 to-amber-50/80 dark:from-orange-950/30 dark:to-amber-950/20 border border-orange-200/80 dark:border-orange-800/60 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-orange-900 dark:text-orange-200 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                {streak.count} {streak.count === 1 ? 'день' : 'дня'} в серии!
              </span>
              <span className="text-[10px] font-semibold text-orange-700 dark:text-orange-300">
                {dailyCount}/5 решено
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-orange-200/60 dark:bg-orange-900/60 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full"
                style={{ width: `${Math.min(100, (dailyCount / 5) * 100)}%` }}
              />
            </div>
          </div>

          {/* Section: Subjects shortcuts */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3 h-3 text-indigo-500" />
                Предметы 7 класс
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {SUBJECTS.map((sub) => (
                <button
                  key={sub.name}
                  onClick={() => {
                    if (onNewChatWithSubject) {
                      onNewChatWithSubject(sub.name);
                    } else {
                      onNewChat();
                    }
                    if (window.innerWidth < 1024) setOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl text-left bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 hover:border-indigo-300 dark:hover:border-indigo-500/60 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 text-slate-700 dark:text-slate-200 text-xs font-medium transition-all cursor-pointer group shadow-2xs active:scale-98"
                >
                  <span className="text-sm shrink-0 group-hover:scale-110 transition-transform">{sub.emoji}</span>
                  <span className="truncate">{sub.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section: Chats */}
          <div>
            <div className="flex items-center justify-between px-2 mb-1.5 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              <span>Диалоги</span>
              <span>{filteredChats.length}</span>
            </div>

            {filteredChats.length === 0 ? (
              <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500">
                {search ? 'Ничего не найдено' : 'Нет диалогов'}
              </div>
            ) : (
              <div className="space-y-1">
                {filteredChats.map(chat => {
                  const isActive = chat.id === activeChatId;
                  return (
                    <div
                      key={chat.id}
                      onClick={() => {
                        onSelectChat(chat.id);
                        if (window.innerWidth < 1024) setOpen(false);
                      }}
                      className={`
                        group relative flex items-center justify-between
                        px-2.5 py-2.5 rounded-xl text-xs cursor-pointer transition-all
                        ${isActive
                          ? 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-950 dark:text-indigo-200 font-semibold border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'}
                      `}
                    >
                      <div className="flex items-center gap-2.5 truncate pr-2">
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                        <span className="truncate">{chat.title || 'Новый диалог'}</span>
                      </div>

                      {chats.length > 1 && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteChat(chat.id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 dark:hover:text-red-400 text-slate-400 transition-opacity cursor-pointer"
                          title="Удалить диалог"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Profile / Auth */}
        <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-slate-100/60 dark:bg-slate-900/60">
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-2xs bg-gradient-to-br from-red-500 to-orange-500">
                    {user.avatarLetter || user.name?.[0]?.toUpperCase() || 'Я'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#fc3f1d] text-white flex items-center justify-center font-bold text-[8px] border border-white dark:border-slate-800">
                    Я
                  </div>
                </div>

                <div className="truncate text-left">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
                    {user.email || 'Яндекс ID'}
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Выйти из аккаунта"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <div className="w-4 h-4 rounded-full bg-[#fc3f1d] text-white flex items-center justify-center font-bold text-[9px]">
                Я
              </div>
              <span>Войти через Яндекс ID</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

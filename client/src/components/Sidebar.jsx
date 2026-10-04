import React, { useState } from 'react';
import {
  Plus, MessageSquare, Trash2, Search,
  PanelLeftClose, LogOut, X, BookOpen,
  Star, ChevronDown, Bookmark, HelpCircle
} from 'lucide-react';

export default function Sidebar({
  open, setOpen,
  chats, activeChatId, onSelectChat, onNewChat, onDeleteChat,
  onOpenTextbooks, onOpenCheatSheet, onOpenBookmarks, onOpenReviews,
  user, onLogout, onOpenLogin
}) {
  const [search, setSearch] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

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
        w-64 bg-slate-50 dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800
        flex flex-col justify-between pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]
        transition-all duration-200 ease-in-out select-none
        ${open ? 'translate-x-0' : '-translate-x-full lg:-translate-x-full lg:w-0 lg:border-none overflow-hidden'}
      `}>
        {/* Top Header & Main Navigation (LMSYS Arena / ChatGPT Minimalist Style) */}
        <div className="flex flex-col p-3 space-y-1 border-b border-slate-200/60 dark:border-slate-800/80">
          
          {/* Brand header */}
          <div className="flex items-center justify-between px-2 py-1 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-base">🎓</span>
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-slate-100">
                ClassMate
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-semibold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                AI
              </span>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Свернуть боковую панель"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button (Arena clean style: text row with plus icon) */}
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) setOpen(false);
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200/70 dark:hover:bg-slate-800 transition-colors cursor-pointer group"
          >
            <Plus className="w-4 h-4 text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white transition-colors" />
            <span>Новый диалог</span>
          </button>

          {/* Arena-style navigation items */}
          <button
            onClick={() => {
              if (onOpenReviews) onOpenReviews();
              if (window.innerWidth < 1024) setOpen(false);
            }}
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500/20" />
              <span>Отзывы</span>
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-bold">
              4.9 ★
            </span>
          </button>

          <button
            onClick={() => {
              if (onOpenTextbooks) onOpenTextbooks();
              if (window.innerWidth < 1024) setOpen(false);
            }}
            className="flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2.5">
              <BookOpen className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Учебники (7 класс)</span>
            </span>
            <span className="text-[10px] text-slate-400">PDF</span>
          </button>

          <button
            onClick={() => {
              if (onOpenCheatSheet) onOpenCheatSheet();
              if (window.innerWidth < 1024) setOpen(false);
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span className="text-sm">📐</span>
            <span>Шпаргалка формул</span>
          </button>

          <button
            onClick={() => {
              if (onOpenBookmarks) onOpenBookmarks();
              if (window.innerWidth < 1024) setOpen(false);
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Bookmark className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Мои закладки</span>
          </button>

          {/* Search Toggle / Input */}
          <div className="pt-1">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск диалогов..."
                className="w-full bg-slate-100 dark:bg-slate-800/80 border border-transparent dark:border-slate-800 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 outline-none focus:border-slate-300 dark:focus:border-slate-700 transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Chats History List (Arena Clean List) */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
          <div className="px-2.5 pb-1 flex items-center justify-between text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            <span>Недавние диалоги</span>
            <span>{filteredChats.length}</span>
          </div>

          {filteredChats.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              {search ? 'Ничего не найдено' : 'Нет диалогов'}
            </div>
          ) : (
            filteredChats.map(chat => {
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
                    px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-colors
                    ${isActive
                      ? 'bg-slate-200/90 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'}
                  `}
                >
                  <div className="flex items-center gap-2.5 truncate pr-2">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{chat.title || 'Новый диалог'}</span>
                  </div>

                  {chats.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(chat.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-500 text-slate-400 transition-opacity cursor-pointer shrink-0"
                      title="Удалить"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Profile / Auth (Arena Style Clean Card) */}
        <div className="border-t border-slate-200/80 dark:border-slate-800 p-2.5 bg-slate-50 dark:bg-slate-900">
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-2xs bg-gradient-to-br from-red-500 to-orange-500">
                    {user.avatarLetter || user.name?.[0]?.toUpperCase() || 'Я'}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#fc3f1d] text-white flex items-center justify-center font-bold text-[7px] border border-white dark:border-slate-800">
                    Я
                  </div>
                </div>

                <div className="truncate text-left">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {user.email || 'Яндекс ID'}
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700/60 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Выйти"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 dark:bg-white hover:bg-black dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold transition-all cursor-pointer"
            >
              <div className="w-4 h-4 rounded-full bg-[#fc3f1d] text-white flex items-center justify-center font-bold text-[9px]">
                Я
              </div>
              <span>Войти через Яндекс ID</span>
            </button>
          )}

          {/* Subtle footer label */}
          <div className="pt-2 px-1 text-[10px] text-slate-400 flex items-center justify-between">
            <span>ClassMate AI</span>
            <span>Школьный репетитор</span>
          </div>
        </div>
      </aside>
    </>
  );
}

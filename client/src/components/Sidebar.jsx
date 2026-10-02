import {
  Home, Plus, MessageSquare, Trash2, Search,
  PanelLeftClose, ChevronDown, Layers, Zap,
  Settings, CreditCard, Sparkles, Image as ImgIcon, LogOut
} from 'lucide-react';

export default function Sidebar({
  open, setOpen,
  chats, activeChatId, onSelectChat, onNewChat, onDeleteChat,
  user, onLogout, onOpenLogin
}) {
  return (
    <>
      {/* Mobile backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/20 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static top-0 bottom-0 left-0 z-50
        w-64 bg-slate-50 border-r border-slate-200
        flex flex-col justify-between
        transition-all duration-200 ease-in-out
        ${open ? 'translate-x-0' : '-translate-x-full lg:-translate-x-full lg:w-0 lg:border-none'}
      `}>
        {/* Top Header */}
        <div className="flex flex-col border-b border-slate-200/80 p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm tracking-tight">
              {/* Brand Logo */}
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                🎓
              </div>
              <span className="font-bold text-slate-900">ClassMate</span>
              <span className="text-[10px] px-1 py-0.2 rounded bg-indigo-50 text-indigo-600 font-semibold border border-indigo-200">AI</span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
                title="Свернуть меню"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* New Chat Button */}
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) setOpen(false);
            }}
            className="mt-3 flex items-center justify-center gap-2 w-full py-2 px-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-xs font-medium rounded-lg shadow-2xs hover:bg-slate-50 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-orange-500" />
            <span>Новый диалог</span>
          </button>
        </div>

        {/* Middle Navigation & Chats List */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {/* Main quick links */}
          <div className="space-y-0.5">
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-700 hover:bg-slate-200/50 transition-colors"
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>Главная</span>
            </button>
          </div>

          {/* Section: Chats */}
          <div>
            <div className="px-2.5 mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Диалоги ({chats.length})
            </div>
            <div className="space-y-0.5">
              {chats.map(chat => {
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
                      px-2.5 py-2 rounded-md text-xs cursor-pointer transition-all
                      ${isActive
                        ? 'bg-orange-50 text-orange-950 font-medium border border-orange-200/60'
                        : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'}
                    `}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-orange-500' : 'text-slate-400'}`} />
                      <span className="truncate">{chat.title || 'Новый диалог'}</span>
                    </div>

                    {chats.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(chat.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-600 text-slate-400 transition-opacity"
                        title="Удалить"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Features info */}
          <div className="pt-2 border-t border-slate-200/60">
            <div className="px-2.5 mb-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Возможности
            </div>
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex items-center gap-2 px-2.5 py-1.5 text-slate-600">
                <ImgIcon className="w-3.5 h-3.5 text-orange-500" />
                <span>Распознавание фото</span>
              </div>
              <div className="flex items-center gap-2 px-2.5 py-1.5 text-slate-600">
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                <span>Без VPN в РФ</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Profile / Workspace */}
        <div className="border-t border-slate-200 p-2.5 bg-slate-50 space-y-2">
          {/* User Profile or Login */}
          {user ? (
            <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-2xs ${
                    user.provider === 'vk' 
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600' 
                      : 'bg-gradient-to-br from-red-500 to-orange-500'
                  }`}>
                    {user.avatarLetter || user.name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  {/* Badge: VK or Yandex */}
                  {user.provider === 'vk' ? (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#0077ff] text-white flex items-center justify-center font-bold text-[7px] border border-white">
                      VK
                    </div>
                  ) : (
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#fc3f1d] text-white flex items-center justify-center font-bold text-[8px] border border-white">
                      Я
                    </div>
                  )}
                </div>

                <div className="truncate text-left">
                  <div className="text-xs font-semibold text-slate-800 truncate">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {user.email || (user.provider === 'vk' ? 'VK ID' : 'Яндекс ID')}
                  </div>
                </div>
              </div>

              {/* Logout button */}
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer shrink-0"
                title="Выйти из аккаунта"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              <div className="flex items-center -space-x-1">
                <div className="w-4 h-4 rounded-full bg-[#0077ff] text-white flex items-center justify-center font-bold text-[8px] border border-slate-900">
                  VK
                </div>
                <div className="w-4 h-4 rounded-full bg-[#fc3f1d] text-white flex items-center justify-center font-bold text-[9px] border border-slate-900">
                  Я
                </div>
              </div>
              <span>Войти (VK / Яндекс)</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
}

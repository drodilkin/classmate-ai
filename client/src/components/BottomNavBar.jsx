import React from 'react';
import { MessageSquare, BookOpen, Sparkles, Star, User } from 'lucide-react';
import { triggerHaptic } from '../utils/haptics.js';

export default function BottomNavBar({
  activeTab = 'chat',
  onSelectTab,
  user,
  streaming = false,
  reviewsCount = 0
}) {
  const tabs = [
    {
      id: 'chat',
      label: 'Чат',
      icon: MessageSquare,
      badge: streaming ? '...' : null,
      badgeColor: 'bg-indigo-500 text-white animate-pulse'
    },
    {
      id: 'textbooks',
      label: 'Учебники',
      icon: BookOpen,
      badge: 'PDF',
      badgeColor: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
    },
    {
      id: 'formulas',
      label: 'Формулы',
      icon: Sparkles,
      badge: null
    },
    {
      id: 'reviews',
      label: 'Отзывы',
      icon: Star,
      badge: '4.9★',
      badgeColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
    },
    {
      id: 'profile',
      label: 'Профиль',
      icon: User,
      badge: user ? '✓' : null,
      badgeColor: 'bg-emerald-500 text-white'
    }
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800/90 flex items-center justify-around px-2 pt-1 pb-[max(0.4rem,env(safe-area-inset-bottom))] shadow-lg select-none native-surface">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onSelectTab(tab.id);
            }}
            className={`
              relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-150 cursor-pointer native-touch
              active:scale-90
              ${isActive 
                ? 'text-indigo-600 dark:text-indigo-400 font-semibold' 
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}
            `}
          >
            {/* Active Pill Glow Indicator */}
            {isActive && (
              <span className="absolute -top-1 w-8 h-1 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" />
            )}

            <div className="relative">
              <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
              
              {tab.badge && (
                <span className={`absolute -top-1.5 -right-3 text-[9px] font-bold px-1 py-0.2 rounded-full leading-none shadow-xs ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </div>

            <span className="text-[10px] tracking-tight mt-0.5">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

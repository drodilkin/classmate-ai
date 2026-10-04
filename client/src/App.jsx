import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import MessageItem from './components/MessageItem.jsx';
import ChatInput from './components/ChatInput.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import TextbooksModal from './components/TextbooksModal.jsx';
import CheatSheetModal from './components/CheatSheetModal.jsx';
import BookmarksModal from './components/BookmarksModal.jsx';
import ReviewsModal from './components/ReviewsModal.jsx';
import BottomNavBar from './components/BottomNavBar.jsx';
import { MODELS } from './constants/models.js';
import { streamChat } from './services/chatStream.js';
import AuthModal from './components/AuthModal.jsx';
import { checkAndHandleYandexToken } from './services/yandexAuth.js';
import { ArrowRight, Image as ImgIcon, Zap, Sparkles, Plus, Camera, Send } from 'lucide-react';
import { detectExerciseInQuery } from './constants/exerciseIndex.js';
import { renderPdfPageToDataUrl } from './services/pdfRenderer.js';
import { Capacitor } from '@capacitor/core';
import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';

const STORAGE_CHATS = 'mistral_chats_v1';
const STORAGE_MODEL = 'mistral_model_v1';
const STORAGE_USER  = 'yandex_user_v1';
const STORAGE_THEME = 'classmate_theme';
const STORAGE_PROMPT = 'classmate_system_prompt';

function createChat(modelId, title = 'Новый диалог') {
  return {
    id: 'c_' + Date.now(),
    title,
    model: modelId || 'mistral/pixtral-12b-2409',
    messages: [],
    createdAt: new Date().toISOString()
  };
}

export default function App() {
  // Theme State
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem(STORAGE_THEME) === 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem(STORAGE_THEME, darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Settings Modal State
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Textbooks Library Modal State
  const [textbooksOpen, setTextbooksOpen] = useState(false);
  // CheatSheet Formulas Modal State
  const [cheatSheetOpen, setCheatSheetOpen] = useState(false);
  // Bookmarks Modal State
  const [bookmarksOpen, setBookmarksOpen] = useState(false);
  // Reviews Modal State
  const [reviewsOpen, setReviewsOpen] = useState(false);
  // Mobile Bottom Navigation active tab ('chat', 'textbooks', 'formulas', 'reviews', 'profile')
  const [mobileTab, setMobileTab] = useState('chat');

  const handleSelectMobileTab = (tab) => {
    setMobileTab(tab);
    if (tab === 'chat') {
      setTextbooksOpen(false);
      setCheatSheetOpen(false);
      setBookmarksOpen(false);
      setReviewsOpen(false);
      setSettingsOpen(false);
    } else if (tab === 'textbooks') {
      setTextbooksOpen(true);
      setCheatSheetOpen(false);
      setReviewsOpen(false);
      setSettingsOpen(false);
    } else if (tab === 'formulas') {
      setCheatSheetOpen(true);
      setTextbooksOpen(false);
      setReviewsOpen(false);
      setSettingsOpen(false);
    } else if (tab === 'reviews') {
      setReviewsOpen(true);
      setTextbooksOpen(false);
      setCheatSheetOpen(false);
      setSettingsOpen(false);
    } else if (tab === 'profile') {
      setSettingsOpen(true);
      setTextbooksOpen(false);
      setCheatSheetOpen(false);
      setReviewsOpen(false);
    }
  };

  // Arena Centered Hero input state
  const [heroPrompt, setHeroPrompt] = useState('');

  const [modelId, setModelId] = useState(() => {
    return localStorage.getItem(STORAGE_MODEL) || 'mistral/pixtral-12b-2409';
  });

  const [chats, setChats] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_CHATS));
      if (Array.isArray(saved) && saved.length > 0) return saved;
    } catch {}
    return [createChat('mistral/pixtral-12b-2409')];
  });

  const [activeChatId, setActiveChatId] = useState(() => chats[0]?.id);
  const [streaming, setStreaming] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 1024 : false;
  });

  // Yandex ID User State
  const [user, setUser] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_USER));
      if (saved && saved.name) return saved;
    } catch {}
    return null;
  });

  // Open modal if user is not authenticated yet
  const [authModalOpen, setAuthModalOpen] = useState(() => {
    try {
      return !localStorage.getItem(STORAGE_USER);
    } catch {
      return false;
    }
  });

  const handleLogin = (newUser) => {
    setUser(newUser);
    setAuthModalOpen(false);
    try {
      localStorage.setItem(STORAGE_USER, JSON.stringify(newUser));
    } catch {}
  };

  const handleLogout = () => {
    setUser(null);
    setAuthModalOpen(true);
    try {
      localStorage.removeItem(STORAGE_USER);
    } catch {}
  };

  // Check for Yandex OAuth callback on mount + 24h session expiry
  useEffect(() => {
    async function checkAuth() {
      // Check 24h session expiry
      try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_USER));
        if (saved && saved.signedAt) {
          const elapsed = Date.now() - new Date(saved.signedAt).getTime();
          if (elapsed > 24 * 60 * 60 * 1000) {
            handleLogout();
            return;
          }
        }
      } catch {}

      // Check Yandex OAuth callback
      const yandexUser = await checkAndHandleYandexToken();
      if (yandexUser) {
        handleLogin(yandexUser);
        return;
      }
    }
    checkAuth();
  }, []);

  // Native Capacitor Status Bar & Splash Screen
  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      try {
        SplashScreen.hide().catch(() => {});
        StatusBar.setStyle({ style: darkMode ? Style.Dark : Style.Light }).catch(() => {});
        StatusBar.setBackgroundColor({ color: darkMode ? '#0f172a' : '#ffffff' }).catch(() => {});
      } catch {}
    }
  }, [darkMode]);

  // Android Native Hardware Back Button Handler
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let sub;
    try {
      sub = CapApp.addListener('backButton', () => {
        if (textbooksOpen) { setTextbooksOpen(false); setMobileTab('chat'); return; }
        if (cheatSheetOpen) { setCheatSheetOpen(false); setMobileTab('chat'); return; }
        if (bookmarksOpen) { setBookmarksOpen(false); setMobileTab('chat'); return; }
        if (reviewsOpen) { setReviewsOpen(false); setMobileTab('chat'); return; }
        if (settingsOpen) { setSettingsOpen(false); setMobileTab('chat'); return; }
        if (authModalOpen) { setAuthModalOpen(false); return; }
        if (sidebarOpen && window.innerWidth < 1024) { setSidebarOpen(false); return; }

        // Exit App if on root chat
        CapApp.exitApp();
      });
    } catch {}

    return () => {
      if (sub && sub.remove) sub.remove();
    };
  }, [textbooksOpen, cheatSheetOpen, bookmarksOpen, reviewsOpen, settingsOpen, authModalOpen, sidebarOpen]);

  const abortRef = useRef(null);
  const bottomRef = useRef(null);
  const scrollRef = useRef(null);

  const activeChat = chats.find(c => c.id === activeChatId) || chats[0];

  // Save chats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_CHATS, JSON.stringify(chats));
    } catch {}
  }, [chats]);

  // Save active model
  useEffect(() => {
    localStorage.setItem(STORAGE_MODEL, modelId);
  }, [modelId]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeChat?.messages, streaming]);

  // Handle New Chat
  const handleNewChat = () => {
    const c = createChat(modelId);
    setChats(prev => [c, ...prev]);
    setActiveChatId(c.id);
  };

  // Handle New Chat with Subject
  const handleNewChatWithSubject = (subjectName) => {
    let subjKey = null;
    if (/алгебр|математ/i.test(subjectName)) subjKey = 'algebra_7';
    else if (/геометр/i.test(subjectName)) subjKey = 'geometry_7_9';
    else if (/русск/i.test(subjectName)) subjKey = 'russian_7_1';

    const c = { ...createChat(modelId, subjectName), subject: subjKey };
    setChats(prev => [c, ...prev]);
    setActiveChatId(c.id);
  };

  // Handle Delete Chat
  const handleDeleteChat = (id) => {
    setChats(prev => {
      const filtered = prev.filter(c => c.id !== id);
      if (filtered.length === 0) {
        const fresh = createChat(modelId);
        setActiveChatId(fresh.id);
        return [fresh];
      }
      if (id === activeChatId) {
        setActiveChatId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Handle Clear Chat Messages
  const handleClearChat = () => {
    setChats(prev =>
      prev.map(c => (c.id === activeChatId ? { ...c, messages: [] } : c))
    );
  };

  // Handle Clear All Chats
  const handleClearAllChats = () => {
    const fresh = createChat(modelId);
    setChats([fresh]);
    setActiveChatId(fresh.id);
    setSettingsOpen(false);
  };

  // Handle Export Chat
  const handleExport = () => {
    if (!activeChat || activeChat.messages.length === 0) return;
    const txt = activeChat.messages
      .map(m => `${m.role === 'user' ? 'Вы' : 'ClassMate AI'}:\n${m.content}\n\n`)
      .join('---\n\n');
    const blob = new Blob([txt], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat_${activeChat.title || 'dialog'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Send Message
  const handleSend = async (userText, images = [], chosenExercise = null) => {
    if ((!userText && images.length === 0) || streaming) return;

    let finalImages = [...images];
    let promptContext = '';
    let autoDetected = chosenExercise;

    // Auto-detect if user requested a textbook exercise and didn't provide a photo
    if (finalImages.length === 0 && userText) {
      if (!autoDetected) {
        autoDetected = detectExerciseInQuery(userText, activeChat?.subject);
      }
      if (autoDetected) {
        try {
          const rendered = await renderPdfPageToDataUrl(autoDetected.bookFile, autoDetected.page, 1.5);
          finalImages = [rendered.dataUrl];
          const name = autoDetected.fullName || autoDetected.subjectName || 'Учебник';
          promptContext = `[Прикреплена страница ${autoDetected.page} учебника «${name}» с заданием №${autoDetected.number}. Внимательно посмотри на фото страницы, найди номер ${autoDetected.number} и реши его полностью и пошагово:]\n`;
        } catch (err) {
          console.warn('Auto textbook page render failed:', err);
        }
      }
    }

    // Create user message object (displays the attached textbook page in the chat!)
    const userMsg = {
      role: 'user',
      content: userText,
      images: finalImages.length > 0 ? finalImages : undefined,
      timestamp: new Date().toISOString()
    };

    // Auto-update chat title on first message
    const updatedTitle =
      activeChat.messages.length === 0
        ? (userText ? userText.slice(0, 32) : 'Анализ фото')
        : activeChat.title;

    // Append user message + empty assistant placeholder
    const assistantMsg = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString()
    };

    const newMsgs = [...activeChat.messages, userMsg];

    setChats(prev =>
      prev.map(c =>
        c.id === activeChatId
          ? { ...c, title: updatedTitle, messages: [...newMsgs, assistantMsg] }
          : c
      )
    );

    setStreaming(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    // Prepare messages with system prompt & textbook context
    const customPrompt = localStorage.getItem(STORAGE_PROMPT);
    const textbookPrompt = `Ты — ClassMate AI, лучший школьный помощник и репетитор для 7 класса (ФГОС).
В приложение встроены официальные школьные учебники:
1) АЛГЕБРА 7 класс (Ю.Н. Макарычев, Н.Г. Миндюк, под ред. С.А. Теляковского, Просвещение 2023): выражения, тождества, линейные уравнения с одной переменной, функции y=kx+b, степень, одночлены, многочлены, формулы сокращенного умножения, системы линейных уравнений.
2) ГЕОМЕТРИЯ 7-9 классы (Л.С. Атанасян, В.Ф. Бутузов и др.): отрезки, лучи, углы, признаки равенства треугольников, медианы/биссектрисы/высоты, параллельные прямые, сумма углов треугольника (180°), прямоугольные треугольники.
3) РУССКИЙ ЯЗЫК 7 класс Часть 1 (М.Т. Баранов, Т.А. Ладыженская, Л.А. Тростенцова, Просвещение 2023): причастия (суффиксы, Н и НН, НЕ с причастиями, причастный оборот), деепричастия (суффиксы, деепричастный оборот), наречия (степени сравнения, НЕ и НИ, Н и НН, дефис, О/А на конце).

ПРАВИЛА РЕШЕНИЯ ЗАДАНИЙ:
- Если к сообщению прикреплено фото страницы учебника: внимательно найди на фото нужный номер упражнения/задачи.
- Прочитай точный текст задания со страницы и реши все пункты (а, б, в, г...) по порядку.
- Все формулы пиши в LaTeX ($x^2$, \\frac{a}{b}, \\sqrt{x}, \\angle ABC, ^\\circ).
- Оформляй решение аккуратно: "Дано", "Решение", "Ответ". Объясняй каждый шаг, как в образцовой школьной тетради.`;

    const fullSystemPrompt = customPrompt && customPrompt.trim()
      ? `${customPrompt.trim()}\n\n[База знаний учебников:]\n${textbookPrompt}`
      : textbookPrompt;

    // If auto-detected, inject context into the last user message for API
    const messagesToSend = [{ role: 'system', content: fullSystemPrompt }];
    for (let i = 0; i < newMsgs.length; i++) {
      const msg = newMsgs[i];
      if (i === newMsgs.length - 1 && promptContext) {
        messagesToSend.push({
          role: 'user',
          content: `${promptContext}${msg.content}`
        });
      } else {
        messagesToSend.push({ role: msg.role, content: msg.content });
      }
    }

    // Ensure vision-capable model is used if images are attached
    let effectiveModel = modelId;
    if (finalImages.length > 0) {
      const currentModelObj = MODELS.find(m => m.id === modelId);
      if (!currentModelObj || !currentModelObj.vision) {
        effectiveModel = 'mistral/pixtral-12b-2409';
      }
    }

    try {
      await streamChat({
        modelId: effectiveModel,
        messages: messagesToSend,
        images: finalImages,
        signal: ctrl.signal,
        onChunk: (chunk) => {
          setChats(prev =>
            prev.map(c => {
              if (c.id !== activeChatId) return c;
              const msgs = [...c.messages];
              const last = msgs[msgs.length - 1];
              if (last && last.role === 'assistant') {
                msgs[msgs.length - 1] = {
                  ...last,
                  content: last.content + chunk
                };
              }
              return { ...c, messages: msgs };
            })
          );
        }
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        setChats(prev =>
          prev.map(c => {
            if (c.id !== activeChatId) return c;
            const msgs = [...c.messages];
            msgs[msgs.length - 1] = {
              role: 'assistant',
              content: `⚠️ Ошибка: ${err.message}`,
              timestamp: new Date().toISOString()
            };
            return { ...c, messages: msgs };
          })
        );
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  };

  // Stop Generation
  const handleStop = () => {
    if (abortRef.current) {
      abortRef.current.abort();
      setStreaming(false);
    }
  };

  return (
    <div className="flex h-[100dvh] w-full bg-white dark:bg-slate-900 overflow-hidden text-slate-900 dark:text-slate-100 font-sans transition-colors">
      {/* Left Sidebar */}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
        onNewChatWithSubject={handleNewChatWithSubject}
        onOpenTextbooks={() => setTextbooksOpen(true)}
        onOpenCheatSheet={() => setCheatSheetOpen(true)}
        onOpenBookmarks={() => setBookmarksOpen(true)}
        onOpenReviews={() => setReviewsOpen(true)}
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-slate-950 transition-colors">
        {/* Top Header */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          modelId={modelId}
          onModel={setModelId}
          onClear={handleClearChat}
          onExport={handleExport}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onSettings={() => setSettingsOpen(true)}
          onOpenCheatSheet={() => setCheatSheetOpen(true)}
          onOpenBookmarks={() => setBookmarksOpen(true)}
          onOpenTextbooks={() => setTextbooksOpen(true)}
          onOpenReviews={() => setReviewsOpen(true)}
        />

        {/* Chat / Messages Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain min-h-0 touch-pan-y pb-24 md:pb-4"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >

          {activeChat.messages.length === 0 ? (
            /* LMSYS Arena Style Centered Hero & Prompt Card */
            <div className="max-w-3xl mx-auto px-4 py-8 sm:py-16 space-y-8 animate-msg-in flex flex-col items-center justify-center min-h-[75vh]">
              
              {/* Branding (Arena Style: Logo + Serif Italic Highlight) */}
              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center text-base font-bold shadow-sm">
                    🎓
                  </span>
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white font-sans">
                    ClassMate
                  </span>
                </div>
                
                <h1 className="text-2xl sm:text-4xl font-normal text-slate-800 dark:text-slate-100 tracking-tight">
                  Твой персональный{' '}
                  <span className="font-serif italic bg-amber-300 dark:bg-amber-400 text-slate-950 px-2 py-0.5 rounded-md font-semibold inline-block transform -rotate-1 shadow-2xs">
                    репетитор
                  </span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  Решай задания по фото, учись по учебникам 7 класса и получай объяснения по шагам
                </p>
              </div>

              {/* Big Centered Search & Prompt Box (Like Arena) */}
              <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-3 sm:p-4 shadow-lg shadow-slate-200/40 dark:shadow-black/40 space-y-3 transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/10">
                <textarea
                  value={heroPrompt}
                  onChange={(e) => setHeroPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (heroPrompt.trim()) {
                        handleSend(heroPrompt.trim());
                        setHeroPrompt('');
                      }
                    }
                  }}
                  rows={2}
                  placeholder="Спроси что угодно, сфотографируй задачу или напиши номер (например: упр 89)..."
                  className="w-full bg-transparent border-none outline-none resize-none text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 leading-relaxed"
                />

                {/* Bottom toolbar inside card */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-center gap-1.5">
                    {/* Add Photo Button */}
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.createElement('input');
                        input.type = 'file';
                        input.accept = 'image/*';
                        input.onchange = (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              handleSend(heroPrompt.trim() || 'Помоги решить задание с фото:', [ev.target.result]);
                              setHeroPrompt('');
                            };
                            reader.readAsDataURL(file);
                          }
                        };
                        input.click();
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                      title="Прикрепить фото задачи"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {/* Mode pill */}
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                      <Sparkles className="w-3 h-3 text-indigo-500" />
                      <span>7 класс</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setTextbooksOpen(true)}
                      className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200 text-[11px] font-semibold border border-amber-200/60 dark:border-amber-800/60 hover:bg-amber-100 transition-colors cursor-pointer"
                    >
                      <span>📚</span>
                      <span>Учебники</span>
                    </button>
                  </div>

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => {
                      if (heroPrompt.trim()) {
                        handleSend(heroPrompt.trim());
                        setHeroPrompt('');
                      }
                    }}
                    disabled={!heroPrompt.trim()}
                    className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-100 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xs active:scale-95"
                    title="Отправить"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Get started Section (Arena Minimalist Cards Grid) */}
              <div className="w-full space-y-3">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-left px-1">
                  Начни с этого (Быстрый выбор)
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {/* 1. Geometry */}
                  <button
                    type="button"
                    onClick={() => handleSend('Помоги решить задачу по геометрии (Атанасян 7-9 класс): ')}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xs transition-all text-left space-y-1 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        📐 Геометрия 7 класс
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Признаки треугольников, углы и теоремы
                    </p>
                  </button>

                  {/* 2. Algebra */}
                  <button
                    type="button"
                    onClick={() => handleSend('номер 148 алгебра')}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xs transition-all text-left space-y-1 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        🔢 Алгебра: номер 148
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Уравнения, ФСУ и разбор по Макарычеву
                    </p>
                  </button>

                  {/* 3. Russian */}
                  <button
                    type="button"
                    onClick={() => handleSend('упр 89')}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xs transition-all text-left space-y-1 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        🇷🇺 Русский: упр 89
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Баранов, причастия и орфография
                    </p>
                  </button>

                  {/* 4. Textbooks */}
                  <button
                    type="button"
                    onClick={() => setTextbooksOpen(true)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xs transition-all text-left space-y-1 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        📚 Учебники 7 класс
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Открыть онлайн PDF и читать страницы
                    </p>
                  </button>

                  {/* 5. Formulas */}
                  <button
                    type="button"
                    onClick={() => setCheatSheetOpen(true)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xs transition-all text-left space-y-1 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        📐 Шпаргалка формул
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      ФСУ, степени, правила в 1 клик
                    </p>
                  </button>

                  {/* 6. Reviews */}
                  <button
                    type="button"
                    onClick={() => setReviewsOpen(true)}
                    className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 hover:shadow-xs transition-all text-left space-y-1 cursor-pointer group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                        ⭐ Отзывы учеников
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-bold">
                        4.9 ★
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                      Оценки школьников и отзывы о решении
                    </p>
                  </button>
                </div>
              </div>

            </div>
          ) : (
            /* Active Messages List */
            <div className="py-2 space-y-1">
              {activeChat.messages.map((msg, i) => (
                <MessageItem
                  key={i}
                  message={msg}
                  isLast={i === activeChat.messages.length - 1}
                  streaming={streaming}
                  onFollowUp={(followUpText) => handleSend(followUpText)}
                />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Input Bar (When in active chat or pinned at bottom) */}
        {activeChat.messages.length > 0 && (
          <div className="pb-14 md:pb-0 shrink-0">
            <ChatInput
              onSend={handleSend}
              onStop={handleStop}
              streaming={streaming}
              activeSubject={activeChat?.subject}
              onOpenTextbooks={() => {
                setTextbooksOpen(true);
                setMobileTab('textbooks');
              }}
            />
          </div>
        )}
      </div>

      {/* Native Bottom Navigation Bar on Mobile / Android APK */}
      <BottomNavBar
        activeTab={mobileTab}
        onSelectTab={handleSelectMobileTab}
        user={user}
        streaming={streaming}
      />

      {/* Yandex ID Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen || !user}
        onLogin={handleLogin}
      />

      {/* Settings & Profile Sheet */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => {
          setSettingsOpen(false);
          setMobileTab('chat');
        }}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onClearAll={handleClearAllChats}
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setAuthModalOpen(true)}
      />

      {/* Textbooks Library Modal */}
      <TextbooksModal
        isOpen={textbooksOpen}
        onClose={() => {
          setTextbooksOpen(false);
          setMobileTab('chat');
        }}
        onAskBookTopic={(prompt) => {
          handleSend(prompt);
          setMobileTab('chat');
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
        onSendBookPage={(prompt, imgs) => {
          handleSend(prompt, imgs);
          setMobileTab('chat');
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
      />

      {/* CheatSheet Formulas Modal */}
      <CheatSheetModal
        isOpen={cheatSheetOpen}
        onClose={() => {
          setCheatSheetOpen(false);
          setMobileTab('chat');
        }}
        onInsertToChat={(prompt) => {
          handleSend(prompt);
          setMobileTab('chat');
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
      />

      {/* Bookmarks Modal */}
      <BookmarksModal
        isOpen={bookmarksOpen}
        onClose={() => {
          setBookmarksOpen(false);
          setMobileTab('chat');
        }}
        onOpenInChat={(content) => {
          handleSend(`Поясни этот сохраненный конспект или решение:\n${content}`);
          setMobileTab('chat');
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
      />

      {/* Reviews Modal */}
      <ReviewsModal
        isOpen={reviewsOpen}
        onClose={() => {
          setReviewsOpen(false);
          setMobileTab('chat');
        }}
        user={user}
      />
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import MessageItem from './components/MessageItem.jsx';
import ChatInput from './components/ChatInput.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import TextbooksModal from './components/TextbooksModal.jsx';
import CheatSheetModal from './components/CheatSheetModal.jsx';
import BookmarksModal from './components/BookmarksModal.jsx';
import { MODELS } from './constants/models.js';
import { streamChat } from './services/chatStream.js';
import AuthModal from './components/AuthModal.jsx';
import { checkAndHandleYandexToken } from './services/yandexAuth.js';
import { ArrowRight, Image as ImgIcon, Zap, Sparkles } from 'lucide-react';
import { detectExerciseInQuery } from './constants/exerciseIndex.js';
import { renderPdfPageToDataUrl } from './services/pdfRenderer.js';

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
        user={user}
        onLogout={handleLogout}
        onOpenLogin={() => setAuthModalOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white dark:bg-slate-900 transition-colors ambient-mesh">
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
        />

        {/* Chat / Messages Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain min-h-0 touch-pan-y"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >

          {activeChat.messages.length === 0 ? (
            /* ClassMate AI Empty State - Human & Interactive Design */
            <div className="max-w-4xl mx-auto px-4 py-6 sm:py-10 space-y-6 sm:space-y-8 animate-msg-in">
              {/* Main Title Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-indigo-50/80 via-purple-50/60 to-pink-50/40 dark:from-slate-800/80 dark:via-indigo-950/40 dark:to-purple-950/30 border border-indigo-200/80 dark:border-indigo-800/60 shadow-xs">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white flex items-center justify-center text-lg font-bold shadow-md shadow-indigo-500/20 ring-2 ring-white/20">
                      🎓
                    </span>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                      Твой персональный репетитор
                    </h1>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl">
                    Решай домашку по фото, учись по реальным учебникам 7 класса, изучай формулы и готовься к контрольным на «отлично».
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setTextbooksOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-400 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-95"
                  >
                    <span>📚</span>
                    <span>Учебники</span>
                  </button>
                  <button
                    onClick={() => setCheatSheetOpen(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20 cursor-pointer active:scale-95"
                  >
                    <span>📐</span>
                    <span>Формулы</span>
                  </button>
                </div>
              </div>

              {/* Main Feature Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Study & Tasks Card */}
                <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-800/50 backdrop-blur-xs hover:border-indigo-300 dark:hover:border-indigo-600/60 transition-all space-y-3.5 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg">
                      📚
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Домашка & Учёба</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Помощь с любыми предметами и правилами
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    <button
                      onClick={() => handleSend('Помоги решить задачу и объясни решение пошагово: ')}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-all text-left text-slate-700 dark:text-slate-200 font-medium cursor-pointer shadow-2xs group"
                    >
                      <span className="flex items-center gap-2">
                        <span>💡</span>
                        <span>Решить задачу с пошаговым объяснением</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => handleSend('Объясни мне подробно тему с формулами и примерами: ')}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-500 hover:bg-indigo-50/40 dark:hover:bg-indigo-950/30 transition-all text-left text-slate-700 dark:text-slate-200 font-medium cursor-pointer shadow-2xs group"
                    >
                      <span className="flex items-center gap-2">
                        <span>📖</span>
                        <span>Разобрать непонятную школьную тему</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
                </div>

                {/* Photo HW Card (Vision) */}
                <div className="p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-800/50 backdrop-blur-xs hover:border-purple-300 dark:hover:border-purple-600/60 transition-all space-y-3.5 shadow-2xs">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
                      📸
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">Решение по фото & Номеру</h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Сделай фото или просто напиши номер задания
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-700/60 text-xs">
                    <button
                      onClick={() => handleSend('упр 89')}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 transition-all text-left text-slate-700 dark:text-slate-200 font-medium cursor-pointer shadow-2xs group"
                    >
                      <span className="flex items-center gap-2">
                        <span>🇷🇺</span>
                        <span>Например: «упр 89» (Русский язык)</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    <button
                      onClick={() => handleSend('номер 148 алгебра')}
                      className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-500 hover:bg-purple-50/40 dark:hover:bg-purple-950/30 transition-all text-left text-slate-700 dark:text-slate-200 font-medium cursor-pointer shadow-2xs group"
                    >
                      <span className="flex items-center gap-2">
                        <span>🔢</span>
                        <span>Например: «номер 148 алгебра»</span>
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-purple-500 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  </div>
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

        {/* Input Bar */}
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          streaming={streaming}
          activeSubject={activeChat?.subject}
          onOpenTextbooks={() => setTextbooksOpen(true)}
        />

        {/* Mobile Bottom Navigation Dock (Native App Feel on Smartphones) */}
        <div className="sm:hidden flex items-center justify-around py-2 px-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800 z-20 shrink-0 select-none">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="flex flex-col items-center gap-0.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-[10px] font-semibold transition-colors"
          >
            <span className="text-base">💬</span>
            <span>Диалоги</span>
          </button>
          <button
            type="button"
            onClick={() => setTextbooksOpen(true)}
            className="flex flex-col items-center gap-0.5 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 text-[10px] font-semibold transition-colors"
          >
            <span className="text-base">📚</span>
            <span>Учебники</span>
          </button>
          <button
            type="button"
            onClick={() => setCheatSheetOpen(true)}
            className="flex flex-col items-center gap-0.5 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 text-[10px] font-semibold transition-colors"
          >
            <span className="text-base">📐</span>
            <span>Формулы</span>
          </button>
          <button
            type="button"
            onClick={() => setBookmarksOpen(true)}
            className="flex flex-col items-center gap-0.5 text-slate-600 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 text-[10px] font-semibold transition-colors"
          >
            <span className="text-base">⭐</span>
            <span>Закладки</span>
          </button>
          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="flex flex-col items-center gap-0.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-[10px] font-semibold transition-colors"
          >
            <span className="text-base">⚙️</span>
            <span>Опции</span>
          </button>
        </div>
      </div>

      {/* Yandex ID Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen || !user}
        onLogin={handleLogin}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onClearAll={handleClearAllChats}
      />

      {/* Textbooks Library Modal */}
      <TextbooksModal
        isOpen={textbooksOpen}
        onClose={() => setTextbooksOpen(false)}
        onAskBookTopic={(prompt) => {
          handleSend(prompt);
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
        onSendBookPage={(prompt, imgs) => {
          handleSend(prompt, imgs);
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
      />

      {/* CheatSheet Formulas Modal */}
      <CheatSheetModal
        isOpen={cheatSheetOpen}
        onClose={() => setCheatSheetOpen(false)}
        onInsertToChat={(prompt) => {
          handleSend(prompt);
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
      />

      {/* Bookmarks Modal */}
      <BookmarksModal
        isOpen={bookmarksOpen}
        onClose={() => setBookmarksOpen(false)}
        onOpenInChat={(content) => {
          handleSend(`Поясни этот сохраненный конспект или решение:\n${content}`);
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
      />
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header.jsx';
import Sidebar from './components/Sidebar.jsx';
import MessageItem from './components/MessageItem.jsx';
import ChatInput from './components/ChatInput.jsx';
import { MODELS } from './constants/models.js';
import {
  Code, Eye, Sparkles, ArrowRight,
  Cpu, FileText, Image as ImgIcon, Zap, CheckCircle2
} from 'lucide-react';

const STORAGE_CHATS = 'mistral_chats_v1';
const STORAGE_MODEL = 'mistral_model_v1';

function createChat(modelId) {
  return {
    id: 'c_' + Date.now(),
    title: 'Новый диалог',
    model: modelId || 'mistral/pixtral-12b-2409',
    messages: [],
    createdAt: new Date().toISOString()
  };
}

export default function App() {
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
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  // Handle Export Chat
  const handleExport = () => {
    if (!activeChat || activeChat.messages.length === 0) return;
    const txt = activeChat.messages
      .map(m => `${m.role === 'user' ? 'Вы' : 'Mistral AI'}:\n${m.content}\n\n`)
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
  const handleSend = async (userText, images = []) => {
    if ((!userText && images.length === 0) || streaming) return;

    // Create user message object
    const userMsg = {
      role: 'user',
      content: userText,
      images: images.length > 0 ? images : undefined,
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

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: modelId,
          messages: newMsgs.map(m => ({ role: m.role, content: m.content })),
          images: images
        }),
        signal: ctrl.signal
      });

      if (!res.ok) {
        throw new Error(`Ошибка сервера ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed === 'data: [DONE]') continue;
          if (trimmed.startsWith('data: ')) {
            try {
              const data = JSON.parse(trimmed.slice(6));
              if (data.content) {
                setChats(prev =>
                  prev.map(c => {
                    if (c.id !== activeChatId) return c;
                    const msgs = [...c.messages];
                    const last = msgs[msgs.length - 1];
                    if (last && last.role === 'assistant') {
                      msgs[msgs.length - 1] = {
                        ...last,
                        content: last.content + data.content
                      };
                    }
                    return { ...c, messages: msgs };
                  })
                );
              }
            } catch {}
          }
        }
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setChats(prev =>
          prev.map(c => {
            if (c.id !== activeChatId) return c;
            const msgs = [...c.messages];
            msgs[msgs.length - 1] = {
              role: 'assistant',
              content: `⚠️ Не удалось связаться с сервером: ${err.message}`,
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
    <div className="flex h-[100dvh] w-full bg-white overflow-hidden text-slate-900 font-sans">
      {/* Left Sidebar (ClassMate AI) */}
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        chats={chats}
        activeChatId={activeChatId}
        onSelectChat={setActiveChatId}
        onNewChat={handleNewChat}
        onDeleteChat={handleDeleteChat}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 bg-white">
        {/* Top Header */}
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          modelId={modelId}
          onModel={setModelId}
          onClear={handleClearChat}
          onExport={handleExport}
        />

        {/* Chat / Messages Area */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto overscroll-contain"
          style={{ WebkitOverflowScrolling: 'touch' }}
        >

          {activeChat.messages.length === 0 ? (
            /* ClassMate AI Empty State */
            <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8 animate-msg-in">
              {/* Main Title */}
              <div className="space-y-1.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 text-white flex items-center justify-center text-base font-bold shadow-xs">
                    🎓
                  </span>
                  ClassMate AI
                </h1>
                <p className="text-sm text-slate-500 max-w-xl">
                  Умный помощник для школы, домашки, решения задач по фото и подготовки к контрольным.
                </p>
              </div>

              {/* Two Main Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Study & Tasks Card */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-lg">
                      📚
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">Домашка & Учёба</h2>
                      <p className="text-xs text-slate-500">
                        Помощь с любыми школьными предметами и проектами
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs">
                    <button
                      onClick={() => handleSend('Помоги решить задачу и объясни пошагово: ')}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left text-slate-700 font-medium cursor-pointer"
                    >
                      <span>💡 Решить задачу с пошаговым объяснением</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    </button>

                    <button
                      onClick={() => handleSend('Напиши план сочинения на тему: ')}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all text-left text-slate-700 font-medium cursor-pointer"
                    >
                      <span>✍️ Написать сочинение или доклад</span>
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    </button>
                  </div>
                </div>

                {/* Photo HW Card (Vision) */}
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300 transition-all space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg">
                      📸
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-slate-900">Решение по фото (Vision)</h2>
                      <p className="text-xs text-slate-500">
                        Скинь фото страницы из учебника или тетради
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-slate-200/60 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-start gap-2">
                      <ImgIcon className="w-4 h-4 text-orange-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800">Прикрепи фото задания</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Нажми на скрепку внизу или просто вставь фото через Ctrl+V
                        </p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-slate-600 flex items-start gap-2">
                      <Zap className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <div>
                        <span className="font-semibold text-slate-800">Быстро и без VPN</span>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Работает прямо в школьной сети или с мобильного интернета
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Active Messages List */
            <div className="divide-y divide-slate-100 pb-4">
              {activeChat.messages.map((msg, i) => (
                <MessageItem
                  key={i}
                  message={msg}
                  isLast={i === activeChat.messages.length - 1}
                  streaming={streaming}
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
        />
      </div>
    </div>
  );
}

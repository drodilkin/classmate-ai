import React, { useState, useEffect, useRef } from 'react';
import { X, Mic, MicOff, Volume2, VolumeX, Sparkles, MessageSquare, AlertCircle } from 'lucide-react';
import { streamChat } from '../services/chatStream.js';
import { triggerHaptic } from '../utils/haptics.js';

export default function VoiceChatModal({ isOpen, onClose, modelId = 'hf/llama-3.1-8b' }) {
  const [status, setStatus] = useState('idle'); // 'idle' | 'listening' | 'thinking' | 'speaking'
  const [userTranscript, setUserTranscript] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [errorMsg, setErrorMsg] = useState(null);
  const [isMuted, setIsMuted] = useState(false);

  const recognitionRef = useRef(null);
  const synthRef = useRef(null);
  const abortCtrlRef = useRef(null);
  const silenceTimerRef = useRef(null);
  const isListeningActive = useRef(false);

  // Initialize Speech Recognition & Synthesis
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'ru-RU';

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript.trim()) {
          setUserTranscript(transcript);
          // Auto-send after 1.8s of silence
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            handleSendVoiceQuery(transcript);
          }, 1800);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Voice recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Разрешите доступ к микрофону в настройках браузера/приложения');
        }
        setStatus('idle');
        isListeningActive.current = false;
      };

      recognition.onend = () => {
        if (isListeningActive.current) {
          try { recognition.start(); } catch {}
        }
      };

      recognitionRef.current = recognition;
    } else {
      setErrorMsg('Голосовой ввод не поддерживается вашим устройством');
    }

    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    return () => {
      stopVoice();
    };
  }, []);

  // Auto-start listening when modal opens
  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopVoice();
    }
  }, [isOpen]);

  const startListening = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    setErrorMsg(null);
    setUserTranscript('');
    setAiResponse('');
    setStatus('listening');
    triggerHaptic('medium');

    if (recognitionRef.current) {
      isListeningActive.current = true;
      try {
        recognitionRef.current.start();
      } catch (e) {
        // Already started
      }
    }
  };

  const stopVoice = () => {
    isListeningActive.current = false;
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (synthRef.current) {
      try { synthRef.current.cancel(); } catch {}
    }
    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
    }
    setStatus('idle');
  };

  const handleSendVoiceQuery = async (queryText) => {
    if (!queryText.trim()) return;
    
    // Stop listening while thinking
    isListeningActive.current = false;
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);

    setStatus('thinking');
    triggerHaptic('light');

    abortCtrlRef.current = new AbortController();
    let accumulated = '';

    try {
      await streamChat({
        modelId: 'hf/llama-3.1-8b', // Fast low-latency voice model
        messages: [
          {
            role: 'system',
            content: 'Ты — голосовой помощник ClassMate AI. Отвечай кратко, понятно, живым разговорным русским языком (не более 2-4 предложений). Без сложной markdown-разметки, формулы проговаривай словами, чтобы ответ легко читался вслух.'
          },
          { role: 'user', content: queryText }
        ],
        onChunk: (chunk) => {
          accumulated += chunk;
          setAiResponse(accumulated);
        },
        signal: abortCtrlRef.current.signal
      });

      if (accumulated.trim() && !isMuted) {
        speakResponse(accumulated.trim());
      } else {
        setStatus('idle');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setErrorMsg('Ошибка получения ответа: ' + err.message);
      }
      setStatus('idle');
    }
  };

  const speakResponse = (text) => {
    if (!synthRef.current) {
      setStatus('idle');
      return;
    }

    synthRef.current.cancel();
    // Clean text for speech
    const cleanText = text
      .replace(/[*#`_~]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.05;
    utterance.pitch = 1.0;

    // Pick Russian voice if available
    const voices = synthRef.current.getVoices();
    const ruVoice = voices.find(v => v.lang.startsWith('ru'));
    if (ruVoice) utterance.voice = ruVoice;

    setStatus('speaking');

    utterance.onend = () => {
      setStatus('idle');
      // Auto resume listening after AI finishes speaking
      setTimeout(() => {
        if (isOpen) startListening();
      }, 400);
    };

    utterance.onerror = () => {
      setStatus('idle');
    };

    synthRef.current.speak(utterance);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-2xl animate-fade-in p-4 select-none">
      <div className="relative w-full max-w-lg h-[85vh] max-h-[700px] bg-gradient-to-b from-slate-900 via-[#0a0d14] to-black rounded-3xl border border-slate-800/90 shadow-2xl flex flex-col items-center justify-between p-6 overflow-hidden">
        
        {/* Background Ambient Glow */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full blur-3xl pointer-events-none transition-all duration-700 ${
          status === 'listening' ? 'bg-indigo-600/30 scale-125' :
          status === 'thinking' ? 'bg-purple-600/30 animate-pulse scale-100' :
          status === 'speaking' ? 'bg-emerald-500/30 scale-125' : 'bg-slate-700/10 scale-90'
        }`} />

        {/* Top Header */}
        <div className="w-full flex items-center justify-between z-10">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-sm text-white tracking-wide">Голосовой диалог</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-300 border border-indigo-800/60 font-semibold">
              Claude Style
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                triggerHaptic('light');
                setIsMuted(!isMuted);
                if (!isMuted && synthRef.current) synthRef.current.cancel();
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title={isMuted ? 'Включить звук' : 'Без звука'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                stopVoice();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Закрыть"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Center Interactive Animated Orb */}
        <div className="flex flex-col items-center justify-center my-auto z-10 cursor-pointer" onClick={() => {
          if (status === 'speaking') {
            if (synthRef.current) synthRef.current.cancel();
            startListening();
          } else if (status === 'listening') {
            if (userTranscript.trim()) handleSendVoiceQuery(userTranscript);
          } else {
            startListening();
          }
        }}>
          {/* Animated Pulsing Sound Sphere */}
          <div className="relative flex items-center justify-center">
            {/* Outer rings */}
            <div className={`absolute w-44 h-44 rounded-full border-2 transition-all duration-500 ${
              status === 'listening' ? 'border-indigo-500/40 animate-ping' :
              status === 'speaking' ? 'border-emerald-500/40 animate-pulse' :
              status === 'thinking' ? 'border-purple-500/40 animate-spin' : 'border-slate-800'
            }`} />

            <div className={`absolute w-36 h-36 rounded-full border transition-all duration-500 ${
              status === 'listening' ? 'border-indigo-400/60 scale-110' :
              status === 'speaking' ? 'border-emerald-400/60 scale-110' :
              status === 'thinking' ? 'border-purple-400/60 scale-95' : 'border-slate-700'
            }`} />

            {/* Core Orb */}
            <div className={`w-28 h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 active:scale-90 ${
              status === 'listening' ? 'bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-indigo-500/50 scale-105' :
              status === 'thinking' ? 'bg-gradient-to-tr from-purple-600 to-pink-500 shadow-purple-500/50 animate-pulse' :
              status === 'speaking' ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 shadow-emerald-500/50 scale-105' :
              'bg-gradient-to-tr from-slate-700 to-slate-800 shadow-black'
            }`}>
              {status === 'listening' && <Mic className="w-10 h-10 text-white animate-bounce" />}
              {status === 'thinking' && <Sparkles className="w-10 h-10 text-white animate-spin" />}
              {status === 'speaking' && <Volume2 className="w-10 h-10 text-white animate-pulse" />}
              {status === 'idle' && <MicOff className="w-10 h-10 text-slate-400" />}
            </div>
          </div>

          {/* Status Label */}
          <div className="mt-7 text-center">
            <h3 className="text-base font-bold text-white tracking-wide">
              {status === 'listening' && 'Слушаю вас... Говорите'}
              {status === 'thinking' && 'Думаю над ответом...'}
              {status === 'speaking' && 'Отвечаю вслух...'}
              {status === 'idle' && 'Нажмите, чтобы начать'}
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs">
              {status === 'listening' && 'Сделайте паузу, и ИИ сразу ответит'}
              {status === 'speaking' && 'Нажмите на сферу, чтобы перебить'}
              {status === 'idle' && 'Коснитесь сферы для активации микрофона'}
            </p>
          </div>
        </div>

        {/* Live Speech Subtitles Box */}
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-4 z-10 max-h-36 overflow-y-auto space-y-2">
          {errorMsg ? (
            <div className="flex items-center gap-2 text-rose-400 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : (
            <>
              {userTranscript && (
                <div className="text-xs text-slate-300">
                  <span className="text-indigo-400 font-semibold">Вы: </span>
                  <span>«{userTranscript}»</span>
                </div>
              )}
              {aiResponse && (
                <div className="text-xs text-slate-200">
                  <span className="text-emerald-400 font-semibold">ИИ: </span>
                  <span>{aiResponse}</span>
                </div>
              )}
              {!userTranscript && !aiResponse && (
                <div className="text-xs text-slate-500 text-center py-2">
                  Задайте любой вопрос голосом — по учёбе, коду, формулам или текстам...
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Quick Controls */}
        <div className="w-full flex items-center justify-center gap-3 pt-4 z-10">
          <button
            type="button"
            onClick={() => {
              if (status === 'listening') {
                stopVoice();
              } else {
                startListening();
              }
            }}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
              status === 'listening'
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30'
            }`}
          >
            {status === 'listening' ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            <span>{status === 'listening' ? 'Остановить' : 'Начать запись'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}

import React, { useState } from 'react';
import {
  Menu, ChevronDown, Check, Trash2, Download,
  Sparkles, Camera, ShieldCheck, Zap
} from 'lucide-react';
import { MODELS } from '../constants/models.js';

export default function Header({
  sidebarOpen, setSidebarOpen,
  modelId, onModel,
  onClear, onExport
}) {
  const [modelOpen, setModelOpen] = useState(false);
  const activeModel = MODELS.find(m => m.id === modelId) || MODELS[0];

  return (
    <header className="h-14 border-b border-slate-200 bg-white/95 backdrop-blur-sm px-4 flex items-center justify-between z-30 shrink-0">
      {/* Left section: Toggle & Model Selector */}
      <div className="flex items-center gap-2">
        {!sidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors mr-1 cursor-pointer"
            title="Открыть меню"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Model dropdown */}
        <div className="relative">
          <button
            onClick={() => setModelOpen(!modelOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/80 hover:bg-slate-100/80 transition-all text-xs font-medium text-slate-800 cursor-pointer shadow-2xs"
          >
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
            <span className="font-semibold">{activeModel.name}</span>
            <span className="hidden sm:inline text-slate-400 font-normal">| {activeModel.badge}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {modelOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setModelOpen(false)}
              />
              <div className="absolute left-0 mt-1.5 w-64 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50 animate-msg-in">
                <div className="px-2 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Выбор нейросети
                </div>

                {MODELS.map(m => {
                  const isCur = m.id === modelId;
                  return (
                    <button
                      key={m.id}
                      onClick={() => {
                        onModel(m.id);
                        setModelOpen(false);
                      }}
                      className={`
                        w-full flex items-start gap-2.5 p-2 rounded-lg text-left text-xs transition-colors cursor-pointer
                        ${isCur ? 'bg-orange-50 text-orange-950 font-medium' : 'text-slate-700 hover:bg-slate-50'}
                      `}
                    >
                      <div className="mt-0.5 w-4 h-4 shrink-0 flex items-center justify-center">
                        {isCur ? (
                          <Check className="w-4 h-4 text-orange-600" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-900">{m.name}</span>
                          <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 text-slate-600">
                            {m.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {m.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right section: Status & Actions */}
      <div className="flex items-center gap-2">
        {/* Status badges */}
        <div className="hidden md:flex items-center gap-2">
          <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-2 py-1 rounded-md">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            РФ Без VPN
          </span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-orange-700 bg-orange-50 border border-orange-200/80 px-2 py-1 rounded-md">
            <Camera className="w-3.5 h-3.5 text-orange-600" />
            Фото-зрение
          </span>
        </div>

        {/* Clear chat */}
        <button
          onClick={onClear}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          title="Очистить диалог"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Export */}
        <button
          onClick={onExport}
          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          title="Экспорт диалога"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

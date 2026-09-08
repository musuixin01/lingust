import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Search,
  Star,
  Trash2,
  Clock,
  Volume2,
  Maximize2,
  Minus,
  Sparkles,
} from 'lucide-react';
import { TranslationResult } from '../../types';
import { speakText } from '../../utils/speech';

export interface HistoryWindowProps {
  isOpen: boolean;
  onClose: () => void;
  history: TranslationResult[];
  onSelectResult: (result: TranslationResult) => void;
  onToggleFavorite: (id: string) => void;
  onClearHistory: () => void;
  isDark?: boolean;
}

export const HistoryWindow: React.FC<HistoryWindowProps> = ({
  isOpen,
  onClose,
  history,
  onSelectResult,
  onToggleFavorite,
  onClearHistory,
}) => {
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const defaultX = Math.max(20, window.innerWidth - 440);
    const defaultY = Math.max(50, Math.min(120, (window.innerHeight - 560) / 2));
    return { x: defaultX, y: defaultY };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);

  const [filter, setFilter] = useState<'all' | 'favorites'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 260, e.clientX - dragOffset.x));
      const newY = Math.max(30, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const filteredHistory = history
    .filter((item) => {
      if (filter === 'favorites' && !item.isFavorite) return false;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return (
        item.sourceText.toLowerCase().includes(query) ||
        item.translatedText.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => b.timestamp - a.timestamp);

  if (!isOpen) return null;

  // Minimized Pill Mode
  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 8990,
        }}
        onMouseDown={handleMouseDown}
        className="select-none animate-in zoom-in-95 duration-150 rounded-full backdrop-blur-3xl bg-slate-900/90 border border-white/20 text-white shadow-2xl flex items-center px-3 py-1.5 gap-2 cursor-grab active:cursor-grabbing hover:border-amber-400/40 transition-all group"
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span className="text-xs font-semibold">
            生词与历史 ({history.length})
          </span>
        </div>
        <div className="no-drag flex items-center gap-1 ml-1 pl-2 border-l border-white/10">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
            title="还原窗口"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-white/60 hover:text-rose-400 hover:bg-white/10 transition"
            title="关闭"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '400px',
        maxWidth: 'calc(100vw - 24px)',
        height: '560px',
        maxHeight: 'calc(100vh - 60px)',
        zIndex: 8990,
        boxShadow:
          '0 30px 80px -10px rgba(0,0,0,0.85), 0 10px 30px rgba(0,0,0,0.5), 0 0 30px rgba(245,158,11,0.12)',
      }}
      className={`select-none rounded-[26px] backdrop-blur-3xl bg-slate-900/92 border border-white/20 text-white flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 transition-[box-shadow,border-color] ${
        isDragging ? 'border-amber-400/50 ring-1 ring-amber-400/30' : ''
      }`}
    >
      {/* Title Bar with Traffic Lights */}
      <div
        onMouseDown={handleMouseDown}
        className={`px-4 py-3 border-b border-white/10 bg-slate-950/40 flex items-center justify-between shrink-0 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Left: Traffic Lights */}
        <div className="no-drag flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 shadow-xs transition-opacity cursor-pointer"
            title="关闭窗口"
          />
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 shadow-xs transition-opacity cursor-pointer"
            title="收起为药丸"
          />
          <button
            type="button"
            onClick={() => {
              setPosition({
                x: Math.max(20, window.innerWidth - 440),
                y: Math.max(50, (window.innerHeight - 560) / 2),
              });
            }}
            className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 shadow-xs transition-opacity cursor-pointer"
            title="重置居右"
          />
        </div>

        {/* Center: Title */}
        <div className="flex items-center gap-1.5 font-semibold text-xs text-white/90">
          <Clock className="w-3.5 h-3.5 text-blue-400" />
          <span>翻译历史与生词本</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white/60 font-mono">
            {history.length}
          </span>
        </div>

        {/* Right: Close button */}
        <div className="no-drag flex items-center gap-1 text-white/60">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="no-drag p-3 border-b border-white/10 bg-white/5 space-y-2 shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-white/40" />
          <input
            type="text"
            placeholder="搜索历史记录与生词..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-white/15 bg-black/40 text-white placeholder-white/40 outline-hidden focus:border-blue-400 transition-all font-sans"
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1 p-0.5 rounded-xl bg-black/30 border border-white/10 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition-all duration-200 ease-out interactive-button cursor-pointer ${
                filter === 'all'
                  ? 'bg-blue-500/25 border border-blue-400/40 text-blue-300 font-semibold shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              全部 ({history.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('favorites')}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all duration-200 ease-out interactive-button cursor-pointer ${
                filter === 'favorites'
                  ? 'bg-amber-500/25 border border-amber-400/40 text-amber-300 font-semibold shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Star className="w-3 h-3 fill-current text-amber-400" />
              <span>生词本 ({history.filter((i) => i.isFavorite).length})</span>
            </button>
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-[11px] text-rose-400 hover:text-rose-300 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-500/15 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer"
            >
              <Trash2 className="w-3 h-3" />
              <span>清空</span>
            </button>
          )}
        </div>
      </div>

      {/* History List */}
      <div key={filter} className="no-drag flex-1 overflow-y-auto p-3 space-y-2 select-text animate-view-scale">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-16 text-white/40 text-xs flex flex-col items-center gap-2">
            <Sparkles className="w-6 h-6 text-white/20" />
            <span>{searchQuery ? '没有找到匹配的翻译记录' : '暂无历史记录，去划词或输入查词吧！'}</span>
          </div>
        ) : (
          filteredHistory.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onSelectResult(item);
              }}
              className="p-3 rounded-2xl border border-white/10 bg-white/5 hover:border-blue-400/40 hover:bg-white/10 text-xs cursor-pointer group transition-all duration-200 ease-out active:scale-[0.985]"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-bold text-white truncate">{item.sourceText}</span>
                    {(() => {
                      const raw =
                        typeof item.phonetic === 'string'
                          ? item.phonetic
                          : item.phonetic?.us || item.phonetic?.uk || item.phonetic?.general;
                      if (!raw) return null;
                      const clean = raw.replace(/^\/|\/$/g, '');
                      return (
                        <span className="text-[10px] font-mono text-white/50">
                          /{clean}/
                        </span>
                      );
                    })()}
                  </div>
                  <div className="text-blue-300 text-[11px] truncate mt-0.5">
                    {item.translatedText}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => speakText(item.sourceText, item.sourceLang)}
                    className="p-1 rounded-lg text-white/50 hover:text-blue-400 hover:bg-white/10 transition-colors"
                    title="朗读发音"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(item.id)}
                    className={`p-1 rounded-lg transition-colors ${
                      item.isFavorite
                        ? 'text-amber-400 fill-amber-400 bg-amber-500/15'
                        : 'text-white/40 hover:text-amber-400 hover:bg-white/10'
                    }`}
                    title={item.isFavorite ? '移出生词本' : '收藏到生词本'}
                  >
                    <Star className={`w-3.5 h-3.5 ${item.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] text-white/40 mt-2 pt-1.5 border-t border-white/5">
                <span className="font-mono">
                  {item.sourceLang} → {item.targetLang}
                </span>
                <span>{new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-white/10 bg-slate-950/40 flex items-center justify-between shrink-0 text-[11px] text-white/40">
        <span>点击词条可即刻在主卡片查看详情</span>
        <button
          type="button"
          onClick={onClose}
          className="text-white/70 hover:text-white px-2 py-0.5 rounded-lg hover:bg-white/10 transition"
        >
          收起
        </button>
      </div>
    </div>
  );
};

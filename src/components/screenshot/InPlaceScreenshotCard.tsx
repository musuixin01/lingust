import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  Pin,
  Move,
  X,
  Copy,
  Check,
  Volume2,
  Sparkles,
  RotateCcw,
  Image as ImageIcon,
  FileText,
  Layers,
  ZoomIn,
  Sliders,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { InPlaceScreenshotTranslation } from '../../types';
import { speakText } from '../../utils/speech';
import { AppleAIBreathingGlow } from '../common/AppleAIBreathingGlow';

interface InPlaceScreenshotCardProps {
  item: InPlaceScreenshotTranslation;
  onUpdate: (updated: Partial<InPlaceScreenshotTranslation>) => void;
  onClose: () => void;
  onRetake?: () => void;
  isDark?: boolean;
}

interface MinSizeLimit {
  width: number;
  height: number;
}

const STORAGE_KEY_MIN_SIZE = 'linguist_card_min_size_limit';

export const InPlaceScreenshotCard: React.FC<InPlaceScreenshotCardProps> = ({
  item,
  onUpdate,
  onClose,
  onRetake,
  isDark = true,
}) => {
  const [copied, setCopied] = useState(false);
  // View mode: 'both' (原图 + 一句一对照), 'text-only' (纯双语对照), 'image-only' (纯图片)
  const [viewMode, setViewMode] = useState<'both' | 'text-only' | 'image-only'>('both');
  const [imageExpanded, setImageExpanded] = useState(false);
  const [showMinSizeModal, setShowMinSizeModal] = useState(false);

  // Load customizable minimum size limit (default: 240x140)
  const [minSizeLimit, setMinSizeLimit] = useState<MinSizeLimit>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_MIN_SIZE);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.width >= 160 && parsed.height >= 100) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return { width: 240, height: 140 };
  });

  // Save min size changes
  const updateMinSizeLimit = (newLimit: MinSizeLimit) => {
    const validated = {
      width: Math.max(180, Math.min(450, newLimit.width)),
      height: Math.max(110, Math.min(380, newLimit.height)),
    };
    setMinSizeLimit(validated);
    try {
      localStorage.setItem(STORAGE_KEY_MIN_SIZE, JSON.stringify(validated));
    } catch {
      // ignore
    }
    // If current width/height is smaller than new min limit, adjust it
    if (item.width < validated.width || item.height < validated.height) {
      onUpdate({
        width: Math.max(item.width, validated.width),
        height: Math.max(item.height, validated.height),
      });
    }
  };

  // Position, dimensions & data synced from item
  const {
    x,
    y,
    width,
    height,
    isPinned,
    loading,
    lines,
    originalText,
    translatedText,
    sourceLang,
    targetLang,
    imageDataUrl,
  } = item;

  // Adaptive content scale tiers based on current dynamic card size
  const isVeryCompact = width < 310 || height < 230;
  const isCompact = width < 390 || height < 300;
  const isUltraSmall = width <= minSizeLimit.width + 25 || height <= minSizeLimit.height + 25;

  // Build clean sentence-by-sentence bilingual pairs (bold original + interleaved translation)
  const bilingualPairs = useMemo(() => {
    if (lines && lines.length > 0) {
      return lines
        .map((l) => ({
          src: l.src.trim(),
          dst: l.dst.trim(),
        }))
        .filter((p) => p.src.length > 0 || p.dst.length > 0);
    }

    if (originalText && translatedText) {
      const origs = originalText.split('\n').map((s) => s.trim()).filter(Boolean);
      const trans = translatedText.split('\n').map((s) => s.trim()).filter(Boolean);
      const maxLen = Math.max(origs.length, trans.length);
      const result: { src: string; dst: string }[] = [];
      for (let i = 0; i < maxLen; i++) {
        result.push({
          src: origs[i] || '',
          dst: trans[i] || '',
        });
      }
      return result;
    }

    return [];
  }, [lines, originalText, translatedText]);

  // Dragging state
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  // Resizing state (8-direction: nw, ne, sw, se, n, s, e, w)
  const isResizingRef = useRef(false);
  const resizeStartRef = useRef<{
    dir: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
    mouseX: number;
    mouseY: number;
    startX: number;
    startY: number;
    startWidth: number;
    startHeight: number;
  }>({
    dir: 'se',
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
  });

  // Copy all bilingual text in interleaved format
  const handleCopyBilingual = () => {
    if (bilingualPairs.length === 0) {
      const fallback = `${originalText || ''}\n\n${translatedText || ''}`;
      navigator.clipboard.writeText(fallback);
    } else {
      const full = bilingualPairs
        .map((pair) => `${pair.src}\n${pair.dst}`)
        .join('\n\n');
      navigator.clipboard.writeText(full);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Speak text
  const handleSpeak = () => {
    const textToSpeak = bilingualPairs.map((p) => p.src).join('. ') || originalText || '';
    if (textToSpeak) {
      speakText(textToSpeak, sourceLang);
    }
  };

  // Toggle fixed / movable state
  const handleTogglePin = () => {
    onUpdate({ isPinned: !isPinned });
  };

  // Dragging handlers (for moving position anywhere without affecting content)
  const handleDragStart = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('.control-box') ||
      target.closest('.min-size-panel')
    ) {
      return;
    }

    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: x,
      startY: y,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = moveEvent.clientX - dragStartRef.current.mouseX;
      const deltaY = moveEvent.clientY - dragStartRef.current.mouseY;

      const newX = Math.max(0, Math.min(window.innerWidth - width, dragStartRef.current.startX + deltaX));
      const newY = Math.max(0, Math.min(window.innerHeight - height, dragStartRef.current.startY + deltaY));

      onUpdate({ x: newX, y: newY, isPinned: false });
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Resize handler (all 4 corners + 4 edges, strictly constrained by customizable minSizeLimit)
  const handleResizeStart = (
    dir: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw',
    e: React.MouseEvent
  ) => {
    e.stopPropagation();
    e.preventDefault();

    isResizingRef.current = true;
    resizeStartRef.current = {
      dir,
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: x,
      startY: y,
      startWidth: width,
      startHeight: height,
    };

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isResizingRef.current) return;
      const deltaX = moveEvent.clientX - resizeStartRef.current.mouseX;
      const deltaY = moveEvent.clientY - resizeStartRef.current.mouseY;

      const minW = minSizeLimit.width;
      const minH = minSizeLimit.height;
      const maxW = Math.min(window.innerWidth - 10, 960);
      const maxH = Math.min(window.innerHeight - 10, 960);

      let targetWidth = resizeStartRef.current.startWidth;
      let targetHeight = resizeStartRef.current.startHeight;
      let targetX = resizeStartRef.current.startX;
      let targetY = resizeStartRef.current.startY;

      // Handle horizontal scaling
      if (dir.includes('e')) {
        targetWidth = Math.max(minW, Math.min(maxW, resizeStartRef.current.startWidth + deltaX));
      } else if (dir.includes('w')) {
        const potentialW = resizeStartRef.current.startWidth - deltaX;
        const clampedW = Math.max(minW, Math.min(maxW, potentialW));
        targetWidth = clampedW;
        targetX = resizeStartRef.current.startX + (resizeStartRef.current.startWidth - clampedW);
      }

      // Handle vertical scaling
      if (dir.includes('s')) {
        targetHeight = Math.max(minH, Math.min(maxH, resizeStartRef.current.startHeight + deltaY));
      } else if (dir.includes('n')) {
        const potentialH = resizeStartRef.current.startHeight - deltaY;
        const clampedH = Math.max(minH, Math.min(maxH, potentialH));
        targetHeight = clampedH;
        targetY = resizeStartRef.current.startY + (resizeStartRef.current.startHeight - clampedH);
      }

      onUpdate({
        x: Math.max(0, targetX),
        y: Math.max(0, targetY),
        width: targetWidth,
        height: targetHeight,
      });
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        maxWidth: 'calc(100vw - 16px)',
        maxHeight: 'calc(100vh - 16px)',
        zIndex: isPinned ? 9999 : 9998,
      }}
      className={`bg-slate-900/92 dark:bg-slate-900/94 backdrop-blur-2xl border ${
        loading
          ? 'border-white/20 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.68)]'
          : !isPinned
          ? 'border-emerald-400/40 shadow-[0_25px_60px_-15px_rgba(16,185,129,0.3)] ring-1 ring-emerald-400/20'
          : 'border-white/12 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.65)]'
      } rounded-2xl flex flex-col relative z-10 transition-[box-shadow,border-color] duration-500 overflow-hidden text-slate-100 select-text`}
    >
      {/* 翻译中：Apple AI 风格向内呼吸流光与内边缘微光 (预缓存硬件合成图层，自然破晓唤醒) */}
      <AppleAIBreathingGlow active={loading} />
      {/* 极简顶栏：自适应缩放（微型状态圆点 + 简洁语言胶囊） */}
      <div
        onMouseDown={handleDragStart}
        className={`px-2.5 py-1.5 flex items-center justify-between border-b border-white/10 shrink-0 select-none ${
          !isPinned ? 'cursor-move bg-emerald-500/10' : 'cursor-default bg-white/5'
        }`}
        title={!isPinned ? '按住此处可自由拖拽挪动卡片' : '已固定在截屏位置'}
      >
        {/* 左侧：交通灯状态小圆点 */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onClose}
            className="w-2.5 h-2.5 rounded-full bg-rose-500/80 hover:opacity-100 opacity-75 transition-opacity cursor-pointer"
            title="关闭卡片"
          />
          <button
            type="button"
            onClick={handleTogglePin}
            className={`w-2.5 h-2.5 rounded-full transition-opacity cursor-pointer ${
              !isPinned ? 'bg-emerald-400 opacity-100 animate-pulse' : 'bg-amber-400/80 opacity-75 hover:opacity-100'
            }`}
            title={isPinned ? '已固定在此处，点击解锁自由拖动' : '当前可自由挪动，点击锁定'}
          />
          {onRetake && !isVeryCompact && (
            <button
              type="button"
              onClick={onRetake}
              className="w-2.5 h-2.5 rounded-full bg-blue-400/80 hover:opacity-100 opacity-75 transition-opacity cursor-pointer"
              title="重新框选截图"
            />
          )}
        </div>

        {/* 中间：简洁语言指示胶囊（窄小时自动精简字符） */}
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-[10px] font-medium text-white/80">
          <span>{sourceLang === 'auto' ? '自动' : sourceLang}</span>
          <span className="text-white/40">➔</span>
          <span className="text-blue-300 font-semibold">{targetLang === 'ZH' ? '中文' : targetLang}</span>
        </div>

        {/* 右侧：尺寸提示与自定义最小限制小图标 */}
        <div className="flex items-center gap-1 text-[10px] text-white/40 font-mono">
          {!isVeryCompact && (
            <span>{Math.round(width)}×{Math.round(height)}</span>
          )}
          <button
            type="button"
            onClick={() => setShowMinSizeModal(!showMinSizeModal)}
            className={`p-1 rounded-md transition-colors cursor-pointer ${
              showMinSizeModal ? 'text-blue-300 bg-white/20' : 'text-white/40 hover:text-white hover:bg-white/10'
            }`}
            title="自定义卡片最小尺寸限制"
          >
            <Sliders className="w-2.5 h-2.5" />
          </button>
        </div>
      </div>

      {/* 自定义最小尺寸限制调节面板（小到一定大小就不能再小，可自由设定） */}
      {showMinSizeModal && (
        <div className="min-size-panel absolute top-8 right-2 z-50 p-3 rounded-xl bg-slate-900/98 border border-blue-400/30 shadow-2xl text-xs space-y-2.5 w-64 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
            <span className="font-semibold text-white flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-blue-400" />
              自定义最小尺寸限制
            </span>
            <button
              type="button"
              onClick={() => setShowMinSizeModal(false)}
              className="text-white/40 hover:text-white p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[11px] text-slate-400 leading-tight">
            拖拽缩小卡片至此尺寸时将无法再缩小，保护内容完整清晰。
          </div>

          {/* 预设快捷选项 */}
          <div className="grid grid-cols-3 gap-1 pt-1">
            <button
              type="button"
              onClick={() => updateMinSizeLimit({ width: 200, height: 120 })}
              className={`px-1.5 py-1 rounded-lg border text-[10px] transition-all cursor-pointer text-center ${
                minSizeLimit.width === 200 && minSizeLimit.height === 120
                  ? 'bg-blue-500/25 text-blue-300 border-blue-400/40'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
            >
              极紧凑 (200)
            </button>
            <button
              type="button"
              onClick={() => updateMinSizeLimit({ width: 250, height: 150 })}
              className={`px-1.5 py-1 rounded-lg border text-[10px] transition-all cursor-pointer text-center ${
                minSizeLimit.width === 250 && minSizeLimit.height === 150
                  ? 'bg-blue-500/25 text-blue-300 border-blue-400/40'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
            >
              标准 (250)
            </button>
            <button
              type="button"
              onClick={() => updateMinSizeLimit({ width: 320, height: 210 })}
              className={`px-1.5 py-1 rounded-lg border text-[10px] transition-all cursor-pointer text-center ${
                minSizeLimit.width === 320 && minSizeLimit.height === 210
                  ? 'bg-blue-500/25 text-blue-300 border-blue-400/40'
                  : 'bg-white/5 text-white/70 border-white/10 hover:bg-white/10'
              }`}
            >
              宽松 (320)
            </button>
          </div>

          {/* 自定义滑块数值微调 */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-white/60">最小宽度:</span>
              <span className="font-mono text-blue-300">{minSizeLimit.width}px</span>
            </div>
            <input
              type="range"
              min={180}
              max={380}
              step={10}
              value={minSizeLimit.width}
              onChange={(e) => updateMinSizeLimit({ ...minSizeLimit, width: Number(e.target.value) })}
              className="w-full accent-blue-500 h-1 bg-white/15 rounded-lg appearance-none cursor-pointer"
            />

            <div className="flex items-center justify-between text-[11px] pt-1">
              <span className="text-white/60">最小高度:</span>
              <span className="font-mono text-blue-300">{minSizeLimit.height}px</span>
            </div>
            <input
              type="range"
              min={110}
              max={300}
              step={10}
              value={minSizeLimit.height}
              onChange={(e) => updateMinSizeLimit({ ...minSizeLimit, height: Number(e.target.value) })}
              className="w-full accent-blue-500 h-1 bg-white/15 rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 主展示区：图片在上 + 一列控制小框 + 一句一对照（全自动自适应缩放） */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col p-2.5 sm:p-3.5 space-y-2.5 select-text">
        {/* 1. 截图原图展示（自适应规则：当卡片高度较小或紧凑模式时，自动折叠为单行微型胶囊，避免挤压文字；大尺寸时展开） */}
        {imageDataUrl && viewMode !== 'text-only' && (
          <div>
            {/* 当高度极小（< 230）或超紧凑时，自动转换为轻量微型折叠按钮，把空间完整留给双语文字 */}
            {isVeryCompact && !imageExpanded ? (
              <button
                type="button"
                onClick={() => setImageExpanded(true)}
                className="w-full py-1 px-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-white/60 flex items-center justify-center gap-1 transition-colors cursor-pointer"
                title="展开查看原截图"
              >
                <ImageIcon className="w-3 h-3 text-blue-400" />
                <span>原截图 (点击展开)</span>
              </button>
            ) : (
              <div className="relative group shrink-0 rounded-xl overflow-hidden bg-black/40 flex items-center justify-center border border-white/10">
                <img
                  src={imageDataUrl}
                  alt="截图原图"
                  className={`w-full object-contain transition-all duration-200 ${
                    viewMode === 'image-only'
                      ? 'max-h-[75vh]'
                      : isVeryCompact
                      ? 'max-h-24'
                      : isCompact
                      ? 'max-h-32 sm:max-h-40'
                      : 'max-h-52 sm:max-h-60'
                  }`}
                />
                {/* 展开/缩小切换按钮 */}
                <button
                  type="button"
                  onClick={() => setImageExpanded(!imageExpanded)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-black/60 hover:bg-black/80 text-white/70 hover:text-white border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title={imageExpanded ? '收起原图预览' : '展开原图预览'}
                >
                  {imageExpanded ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                </button>
              </div>
            )}
          </div>
        )}

        {/* 2. 一列小框控制条（自适应精简：小尺寸时自动只保留核心小框，大尺寸展现完整功能） */}
        <div className="flex items-center justify-between py-0.5 px-0.5 shrink-0 select-none">
          {/* 左侧说明（极小时隐藏文字，保留微光图标） */}
          <div className="flex items-center gap-1 text-[11px] text-white/40 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            {!isVeryCompact && <span>截屏对照</span>}
          </div>

          {/* 一列控制小框：自适应展示 */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {/* 核心小框 1：固定 / 自由拖拽挪动 (任何尺寸下均保留) */}
            <button
              type="button"
              onClick={handleTogglePin}
              className={`control-box w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer shadow-xs ${
                isPinned
                  ? 'bg-white/10 hover:bg-white/15 text-amber-300 border-white/15'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border-emerald-400/40 ring-1 ring-emerald-400/30'
              }`}
              title={
                isPinned
                  ? '当前已固定在截屏位置。点击解锁自由拖拽（拖拽挪动后内容保持不变）'
                  : '当前可自由挪动。按住顶栏即可拖拽到屏幕任意位置'
              }
            >
              {isPinned ? <Pin className="w-3 h-3 fill-current" /> : <Move className="w-3 h-3" />}
            </button>

            {/* 核心小框 2：复制双语对照 (任何尺寸下均保留) */}
            <button
              type="button"
              onClick={handleCopyBilingual}
              className={`control-box w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center border transition-all cursor-pointer shadow-xs ${
                copied
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                  : 'bg-white/10 hover:bg-white/15 text-white/80 border-white/15 hover:text-white'
              }`}
              title="复制一句一对照双语文本"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>

            {/* 次要小框 3：朗读 (在中等偏大尺寸时展现) */}
            {!isUltraSmall && (
              <button
                type="button"
                onClick={handleSpeak}
                className="control-box w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                title="朗读原文"
              >
                <Volume2 className="w-3 h-3" />
              </button>
            )}

            {/* 次要小框 4：视图模式切换 (仅在宽度充裕时展现) */}
            {!isVeryCompact && (
              <button
                type="button"
                onClick={() => {
                  if (viewMode === 'both') setViewMode('text-only');
                  else if (viewMode === 'text-only') setViewMode('image-only');
                  else setViewMode('both');
                }}
                className="control-box w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/10 hover:bg-white/15 text-blue-300 border border-blue-400/30 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                title={
                  viewMode === 'both'
                    ? '当前：原图+双语。点击切换为纯双语文本'
                    : viewMode === 'text-only'
                    ? '当前：纯双语文本。点击切换为纯原图'
                    : '当前：纯原图。点击切换为原图+双语对照'
                }
              >
                {viewMode === 'both' ? (
                  <Layers className="w-3 h-3" />
                ) : viewMode === 'text-only' ? (
                  <FileText className="w-3 h-3" />
                ) : (
                  <ImageIcon className="w-3 h-3" />
                )}
              </button>
            )}

            {/* 次要小框 5：重新截屏 (宽度充裕时展现) */}
            {onRetake && !isCompact && (
              <button
                type="button"
                onClick={onRetake}
                className="control-box w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-xs"
                title="重新框选截图"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            )}

            {/* 核心小框 6：关闭卡片 (任何尺寸下均保留) */}
            <button
              type="button"
              onClick={onClose}
              className="control-box w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/10 hover:bg-rose-500/20 text-white/70 hover:text-rose-300 border border-white/15 flex items-center justify-center transition-all cursor-pointer shadow-xs"
              title="关闭卡片"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* 3. 一句一对照（核心最高优先级内容，字号行距自动随卡片宽高自适应） */}
        {viewMode !== 'image-only' && (
          <div className="flex-1 pt-0.5 select-text">
            {loading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-2 text-white/50 text-center animate-soft-fade">
                <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
                <span className="text-xs text-blue-300 tracking-wide">
                  正在智能识别与逐句对照翻译...
                </span>
              </div>
            ) : bilingualPairs.length > 0 ? (
              /* =========================================================================
                 自适应字号与间距：
                 - 紧凑尺寸：优雅小号，紧致间距
                 - 正常尺寸：舒展阅读，清晰高对比度
                 ========================================================================= */
              <div
                className={`animate-view-scale font-sans leading-relaxed text-slate-100 ${
                  isVeryCompact ? 'space-y-2.5' : isCompact ? 'space-y-3.5' : 'space-y-4'
                }`}
              >
                {bilingualPairs.map((pair, idx) => (
                  <div key={idx} className="space-y-0.5 group">
                    {/* 原文句子：粗体，保持高清晰度与原换行 */}
                    <div
                      className={`font-semibold text-white tracking-normal selection:bg-blue-500/40 ${
                        isVeryCompact
                          ? 'text-xs sm:text-[13px] leading-snug'
                          : isCompact
                          ? 'text-[13px] sm:text-sm leading-snug'
                          : 'text-sm sm:text-base leading-normal'
                      }`}
                    >
                      {pair.src}
                    </div>
                    {/* 中文翻译：紧贴其下，不拆开盒子，自然连贯 */}
                    <div
                      className={`text-slate-300 selection:bg-blue-500/40 ${
                        isVeryCompact
                          ? 'text-[11px] sm:text-xs leading-tight'
                          : isCompact
                          ? 'text-xs sm:text-[13px] leading-relaxed'
                          : 'text-xs sm:text-sm leading-relaxed'
                      }`}
                    >
                      {pair.dst}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className={`font-semibold text-white ${isVeryCompact ? 'text-xs' : 'text-sm'}`}>
                  {originalText || '未检测到清晰文字'}
                </div>
                <div className={`text-slate-300 ${isVeryCompact ? 'text-[11px]' : 'text-xs'}`}>
                  {translatedText || '中文翻译生成中...'}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          8 方向全角度拉伸与四角缩放手柄（高灵敏拖动调节尺寸）
          四个角配有清晰的微弧形导向光标与视觉指示点
          ========================================================================= */}
      {/* 1. 四个角 (NW, NE, SW, SE) 隐藏尖尖标记，纯净玻璃外观 */}
      {/* 东南角 (右下角 SE) */}
      <div
        onMouseDown={(e) => handleResizeStart('se', e)}
        className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize rounded-br-2xl transition-all z-40"
        title="拖动右下角调节大小"
      />

      {/* 西南角 (左下角 SW) */}
      <div
        onMouseDown={(e) => handleResizeStart('sw', e)}
        className="absolute bottom-0 left-0 w-6 h-6 cursor-nesw-resize rounded-bl-2xl transition-all z-40"
        title="拖动左下角调节大小"
      />

      {/* 东北角 (右上角 NE) */}
      <div
        onMouseDown={(e) => handleResizeStart('ne', e)}
        className="absolute top-0 right-0 w-6 h-6 cursor-nesw-resize rounded-tr-2xl transition-all z-40"
        title="拖动右上角调节大小"
      />

      {/* 西北角 (左上角 NW) */}
      <div
        onMouseDown={(e) => handleResizeStart('nw', e)}
        className="absolute top-0 left-0 w-6 h-6 cursor-nwse-resize rounded-tl-2xl transition-all z-40"
        title="拖动左上角调节大小"
      />

      {/* 2. 四条边 (E, W, S, N) */}
      {/* 右侧边 (E) */}
      <div
        onMouseDown={(e) => handleResizeStart('e', e)}
        className="absolute top-4 right-0 bottom-4 w-2 cursor-ew-resize hover:bg-blue-400/30 active:bg-blue-400/50 transition-colors z-30"
        title="向左右拉伸调节宽度"
      />
      {/* 底部边 (S) */}
      <div
        onMouseDown={(e) => handleResizeStart('s', e)}
        className="absolute left-4 right-4 bottom-0 h-2 cursor-ns-resize hover:bg-blue-400/30 active:bg-blue-400/50 transition-colors z-30"
        title="向上下拉伸调节高度"
      />
      {/* 左侧边 (W) */}
      <div
        onMouseDown={(e) => handleResizeStart('w', e)}
        className="absolute top-4 left-0 bottom-4 w-2 cursor-ew-resize hover:bg-blue-400/30 active:bg-blue-400/50 transition-colors z-30"
        title="向左右拉伸调节宽度"
      />
      {/* 顶部边 (N) */}
      <div
        onMouseDown={(e) => handleResizeStart('n', e)}
        className="absolute left-4 right-4 top-0 h-2 cursor-ns-resize hover:bg-blue-400/30 active:bg-blue-400/50 transition-colors z-30"
        title="向上下拉伸调节高度"
      />
    </div>
  );
};

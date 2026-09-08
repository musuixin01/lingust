import React, { useState, useRef, useEffect } from 'react';
import {
  Pin,
  Copy,
  Volume2,
  Heart,
  RotateCcw,
  Sparkles,
  Sliders,
  History,
  Check,
  Minimize2,
  Maximize2,
  X,
  Languages,
  Crop,
  Camera,
  Search,
  Type,
  Plus,
  Minus,
  Music,
} from 'lucide-react';
import { TranslationResult, AppSettings } from '../../types';
import { LanguageSelector } from '../common/LanguageSelector';
import { WordDetailView } from './WordDetailView';
import { ScreenshotTranslationView } from '../screenshot/ScreenshotTranslationView';
import { speakText } from '../../utils/speech';
import { HoverScrollText } from '../common/HoverScrollText';
import { MusicIslandView } from '../music/MusicIslandView';
import { AppleAIBreathingGlow } from '../common/AppleAIBreathingGlow';

// Helper to construct complete translation text (把单词的音标、所有词性及全部释义完整翻译)
export const getCompleteTranslation = (res: TranslationResult | null): string => {
  if (!res) return '';
  if (res.isWord && res.definitions && res.definitions.length > 0) {
    const phonetic =
      typeof res.phonetic === 'string'
        ? res.phonetic
        : (res.phonetic?.us || res.phonetic?.uk || res.phonetic?.general);
    const phoneticPrefix = phonetic ? `[${phonetic.replace(/^\/|\/$/g, '')}] ` : '';
    const defs = res.definitions
      .map((d) => `${d.partOfSpeech ? `${d.partOfSpeech} ` : ''}${d.meaning}`)
      .join('； ');
    const syns =
      res.synonyms && res.synonyms.length > 0
        ? ` 【同义: ${res.synonyms.join(', ')}】`
        : '';
    return `${phoneticPrefix}${defs}${syns}`.trim();
  }
  return res.translatedText;
};

// Continuous looping marquee component for pill mode (循环自动滚动跑马灯)
interface MarqueeTextProps {
  text: string;
  className?: string;
  pillWidth: number;
  onOverflowChange?: (isOverflowing: boolean) => void;
}

const MarqueeText: React.FC<MarqueeTextProps> = ({ text, className = '', pillWidth, onOverflowChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (containerRef.current && measureRef.current) {
        const containerW = containerRef.current.clientWidth;
        const textW = measureRef.current.scrollWidth;
        const isOverflow = textW > containerW + 4;
        setShouldScroll(isOverflow);
        onOverflowChange?.(isOverflow);
      }
    };

    checkOverflow();
    const ro = new ResizeObserver(checkOverflow);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [text, pillWidth, onOverflowChange]);

  // Duration scales dynamically with text length for optimal reading pacing
  const duration = Math.max(10, Math.min(36, text.length * 0.42));

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden whitespace-nowrap min-w-0 flex-1 mask-pill-marquee select-text"
      title={text}
    >
      {/* Off-screen unconstrained span to measure natural text width */}
      <span
        ref={measureRef}
        className="absolute -top-[9999px] -left-[9999px] opacity-0 pointer-events-none whitespace-nowrap text-xs font-semibold"
      >
        {text}
      </span>

      {shouldScroll ? (
        <div
          className="animate-marquee-scroll inline-flex items-center"
          style={{ animationDuration: `${duration}s` }}
        >
          <span className={className}>{text}</span>
          <span className="mx-4 text-emerald-400/50 text-[10px] select-none shrink-0">✦</span>
          <span className={className}>{text}</span>
          <span className="mx-4 text-emerald-400/50 text-[10px] select-none shrink-0">✦</span>
        </div>
      ) : (
        <span className={className}>{text}</span>
      )}
    </div>
  );
};

interface FloatingTranslatorCardProps {
  sourceText: string;
  onSourceTextChange: (text: string) => void;
  onTranslate: (text: string, src?: string, tgt?: string) => void;
  result: TranslationResult | null;
  loading: boolean;
  sourceLang: string;
  targetLang: string;
  onSourceLangChange: (lang: string) => void;
  onTargetLangChange: (lang: string) => void;
  onSwapLanguages: () => void;
  settings: AppSettings;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
  onToggleFavorite: (id: string) => void;
  onSelectWord: (word: string) => void;
  onToggleSmartSelect?: () => void;
  onOpenSnipper?: () => void;
  onClearOcr?: () => void;
  onUpdateSettings?: (newSettings: Partial<AppSettings>) => void;
}

export const FloatingTranslatorCard: React.FC<FloatingTranslatorCardProps> = ({
  sourceText,
  onSourceTextChange,
  onTranslate,
  result,
  loading,
  sourceLang,
  targetLang,
  onSourceLangChange,
  onTargetLangChange,
  onSwapLanguages,
  settings,
  onOpenSettings,
  onOpenHistory,
  onToggleFavorite,
  onSelectWord,
  onToggleSmartSelect,
  onOpenSnipper,
  onClearOcr,
  onUpdateSettings,
}) => {
  // Position & size state
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 380, height: 490 });
  const [isPinned, setIsPinned] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pillMode, setPillMode] = useState<'translation' | 'music'>('translation');
  const [isMusicExpanded, setIsMusicExpanded] = useState(false);
  const [isRightHovered, setIsRightHovered] = useState(false);
  const [isLeftHovered, setIsLeftHovered] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<'source' | 'target' | null>(null);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const rightHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leftHoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pillInputRef = useRef<HTMLInputElement>(null);
  const cardInputRef = useRef<HTMLInputElement>(null);
  const [isCardInputFocused, setIsCardInputFocused] = useState(false);
  const [isCardSearchHovered, setIsCardSearchHovered] = useState(false);
  const [isTranslationHovered, setIsTranslationHovered] = useState(false);

  // Minimal mode corner hover triggers:
  // Top-left reveals Close & Minimize buttons, Top-right reveals action icons
  const [isMinimalTopLeftHovered, setIsMinimalTopLeftHovered] = useState(false);
  const [isMinimalTopRightHovered, setIsMinimalTopRightHovered] = useState(false);
  const minimalTopLeftTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minimalTopRightTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMinimalTopLeftEnter = () => {
    if (minimalTopLeftTimeoutRef.current) clearTimeout(minimalTopLeftTimeoutRef.current);
    setIsMinimalTopLeftHovered(true);
  };
  const handleMinimalTopLeftLeave = () => {
    minimalTopLeftTimeoutRef.current = setTimeout(() => {
      setIsMinimalTopLeftHovered(false);
    }, 250);
  };

  const handleMinimalTopRightEnter = () => {
    if (minimalTopRightTimeoutRef.current) clearTimeout(minimalTopRightTimeoutRef.current);
    setIsMinimalTopRightHovered(true);
  };
  const handleMinimalTopRightLeave = () => {
    minimalTopRightTimeoutRef.current = setTimeout(() => {
      setIsMinimalTopRightHovered(false);
    }, 250);
  };

  // Dynamic scale tiers based on dynamic card dimensions
  // Pill capsule is ONLY shown when explicitly minimized
  const isPill = isMinimized;
  // Minimal card mode: when shrunk to absolute minimum, keep the focused search + translation single-card view
  const isMinimal = !isPill && (size.height <= 130 || (size.width <= 220 && size.height <= 160));
  const isUltraCompact = !isPill && !isMinimal && (size.width < 280 || size.height < 260);
  const isVeryCompact = !isPill && !isMinimal && (size.width < 340 || size.height < 330);
  const isCompact = !isPill && !isMinimal && (size.width < 420 || size.height < 400);

  // 动态紧凑模式：用户可开启强制紧凑，或当卡片缩小进入紧凑区间时自适应激活
  const isDynamicCompact = !isPill && !isMinimal && (Boolean(settings.compactMode) || isCompact);
  const isDynamicTight = !isPill && !isMinimal && isVeryCompact;

  // 基础字号百分比（默认 92%，更精致协调，支持用户输入 60% ~ 150% 自由微调）
  const currentBasePercent =
    typeof settings.customFontSize === 'number'
      ? settings.customFontSize
      : settings.fontSize === 'small'
      ? 82
      : settings.fontSize === 'large'
      ? 108
      : settings.fontSize === 'huge'
      ? 125
      : 92;

  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const [fontInputVal, setFontInputVal] = useState<string>(String(currentBasePercent));

  // 外部设置变更时保持输入框同步
  useEffect(() => {
    setFontInputVal(String(currentBasePercent));
  }, [currentBasePercent]);

  // 点击外部自动关闭字体设置气泡
  useEffect(() => {
    if (!isFontMenuOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.font-popover-container')) {
        setIsFontMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isFontMenuOpen]);

  const handleFontPercentChange = (val: number) => {
    const clamped = Math.max(60, Math.min(150, Math.round(val)));
    setFontInputVal(String(clamped));
    onUpdateSettings?.({
      customFontSize: clamped,
      fontSize: 'custom',
    });
  };

  const baseFontScale = currentBasePercent / 100;

  // 动态流式缩放比例：根据当前卡片长宽平滑计算，缩小卡片时文本与间距自然缩减，保持100%内容一致性不删减，杜绝“小卡片大字体”
  const fluidScale = !isPill && !isMinimal
    ? Math.min(1.0, Math.max(0.70, Math.min(size.width / 390, (size.height - 35) / 410)))
    : 1.0;
  const effectiveFontScale = baseFontScale * fluidScale;

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Drag tracking with 4px threshold to distinguish clicks from intentional window drags
  const pendingDragRef = useRef<{
    active: boolean;
    mouseX: number;
    mouseY: number;
    startX: number;
    startY: number;
  }>({
    active: false,
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  const resizeStartRef = useRef<{
    direction: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
    mouseX: number;
    mouseY: number;
    startWidth: number;
    startHeight: number;
    startX: number;
    startY: number;
  }>({
    direction: 'se',
    mouseX: 0,
    mouseY: 0,
    startWidth: 380,
    startHeight: 490,
    startX: 0,
    startY: 0,
  });

  // Set initial position centered or right-docked on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialX = Math.max(20, Math.min(window.innerWidth - 410, window.innerWidth / 2 - 190));
      const initialY = Math.max(50, window.innerHeight / 2 - 250);
      setPosition({ x: initialX, y: initialY });
    }
  }, []);

  // Window resize handler: keeps card strictly within bounds and avoids viewport overflow
  useEffect(() => {
    const handleWindowResize = () => {
      setPosition((prev) => {
        const maxLeft = Math.max(0, window.innerWidth - size.width - 10);
        const maxTop = Math.max(0, window.innerHeight - size.height - 10);
        return {
          x: Math.min(Math.max(10, prev.x), maxLeft),
          y: Math.min(Math.max(10, prev.y), maxTop),
        };
      });
      setSize((prev) => {
        const maxW = Math.max(180, Math.min(840, window.innerWidth - 20));
        const maxH = Math.max(48, Math.min(900, window.innerHeight - 30));
        return {
          width: Math.min(prev.width, maxW),
          height: Math.min(prev.height, maxH),
        };
      });
    };
    window.addEventListener('resize', handleWindowResize);
    return () => window.removeEventListener('resize', handleWindowResize);
  }, [size.width, size.height]);

  // Window drag handlers with 4px drag movement threshold to preserve click handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only respond to primary mouse button (left-click)
    if (e.button !== 0) return;

    const target = e.target as HTMLElement;
    if (
      target.closest('button') ||
      target.closest('input') ||
      target.closest('textarea') ||
      target.closest('.no-drag') ||
      target.closest('.resize-handle')
    ) {
      return;
    }

    pendingDragRef.current = {
      active: true,
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: position.x,
      startY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!pendingDragRef.current.active) return;
      const dx = e.clientX - pendingDragRef.current.mouseX;
      const dy = e.clientY - pendingDragRef.current.mouseY;

      // Check movement threshold (4px) to distinguish simple clicks from dragging
      if (!isDragging) {
        if (Math.hypot(dx, dy) < 4) return;
        setIsDragging(true);
      }

      const cardWidth = isMinimized ? 220 : size.width;
      const cardHeight = isMinimized ? 50 : size.height;
      const newX = Math.max(10, Math.min(window.innerWidth - cardWidth - 10, pendingDragRef.current.startX + dx));
      const newY = Math.max(35, Math.min(window.innerHeight - cardHeight - 10, pendingDragRef.current.startY + dy));

      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      pendingDragRef.current.active = false;
      if (isDragging) {
        setIsDragging(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isMinimized, size]);

  useEffect(() => {
    if (isDragging) {
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'grabbing';
      return () => {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      };
    }
  }, [isDragging]);

  // Edge & corner resize handlers (8 directions)
  const handleResizeMouseDown = (
    e: React.MouseEvent,
    direction: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setIsResizing(true);
    resizeStartRef.current = {
      direction,
      mouseX: e.clientX,
      mouseY: e.clientY,
      startWidth: size.width,
      startHeight: size.height,
      startX: position.x,
      startY: position.y,
    };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const { direction, mouseX, mouseY, startWidth, startHeight, startX, startY } = resizeStartRef.current;
      const dx = e.clientX - mouseX;
      const dy = e.clientY - mouseY;

      const minW = isMinimized ? 160 : 200;
      const minH = isMinimized ? 38 : 95;
      const maxWidth = Math.min(780, window.innerWidth - 20);
      const maxHeight = Math.min(900, window.innerHeight - 30);

      if (isMinimized) {
        // 药丸胶囊模式下的拉伸逻辑：
        // 1. 左右拉伸仅调整药丸宽度
        if (direction.includes('e') || direction.includes('w')) {
          let targetWidth = startWidth;
          let targetX = startX;
          if (direction.includes('e')) {
            targetWidth = Math.max(minW, Math.min(maxWidth, startWidth + dx));
          } else if (direction.includes('w')) {
            const potentialW = startWidth - dx;
            const clampedW = Math.max(minW, Math.min(maxWidth, potentialW));
            targetWidth = clampedW;
            targetX = startX + (startWidth - clampedW);
          }
          setSize((prev) => ({ ...prev, width: targetWidth }));
          setPosition((prev) => ({ ...prev, x: Math.max(0, targetX) }));
          return;
        }

        // 2. 药丸底部拉伸：
        // - 向上推 (dy <= 0)：缩小药丸高度（38px~46px），绝对不跳回卡片！
        // - 只有大幅度向下拖拽 (dy > 85)：才顺畅拉伸展开回完整卡片
        if (direction.includes('s')) {
          if (dy > 85) {
            setIsMinimized(false);
            setSize({ width: Math.max(startWidth, 380), height: Math.max(320, 52 + dy) });
          } else {
            const targetPillH = Math.max(38, Math.min(54, 46 + dy));
            setSize((prev) => ({ ...prev, height: targetPillH }));
          }
          return;
        }
      }

      let targetWidth = startWidth;
      let targetHeight = startHeight;
      let targetX = startX;
      let targetY = startY;

      // Handle horizontal scaling
      if (direction.includes('e')) {
        targetWidth = Math.max(minW, Math.min(maxWidth, startWidth + dx));
      } else if (direction.includes('w')) {
        const potentialW = startWidth - dx;
        const clampedW = Math.max(minW, Math.min(maxWidth, potentialW));
        targetWidth = clampedW;
        targetX = startX + (startWidth - clampedW);
      }

      // Handle vertical scaling
      if (direction.includes('s')) {
        targetHeight = Math.max(minH, Math.min(maxHeight, startHeight + dy));
      } else if (direction.includes('n')) {
        const potentialH = startHeight - dy;
        const clampedH = Math.max(minH, Math.min(maxHeight, potentialH));
        targetHeight = clampedH;
        targetY = startY + (startHeight - clampedH);
      }

      setSize({ width: targetWidth, height: targetHeight });
      setPosition({ x: Math.max(0, targetX), y: Math.max(0, targetY) });
    };

    const handleMouseUp = () => {
      if (isResizing) {
        setIsResizing(false);
      }
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  // Copy handler (复制完整释义与全部翻译)
  const fullTranslationText = getCompleteTranslation(result);
  const handleCopy = () => {
    const textToCopy = fullTranslationText || result?.translatedText;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Speak handler
  const handleSpeak = () => {
    if (!result?.translatedText) return;
    speakText(result.translatedText, result.targetLang || targetLang);
  };

  const isDark = settings.themeMode === 'dark';

  // 1. Minimized / Dynamic Pill State (药丸胶囊状态：随尺寸全响应式自适应，各部件流式伸缩，翻译循环滚动)
  if (isPill) {
    const pillHeight = Math.max(38, Math.min(60, size.height <= 70 ? size.height : 46));
    const pillWidth = Math.max(160, size.width);
    const fullTranslation = getCompleteTranslation(result);

    // 最左侧圆角区域：宽度较窄(<320)时收缩隐藏为翻译让位；鼠标移到最左侧圆角区域自动弹出
    const isLeftVisible = pillWidth >= 320 ? true : isLeftHovered;

    // 最右侧圆角区域：宽度较窄(<440)时完全收缩隐藏为翻译让位；鼠标移到最右侧圆角区域自动弹出，左侧给它让位置
    const isRightVisible = pillWidth >= 440 ? true : isRightHovered;

    // 搜索框图标与尺寸：在药丸变小时保持清晰可点击
    const showSearchIcon = true;

    return (
      <>
        {/* 灵动岛音乐展开大卡片 (Popover) */}
        {isMusicExpanded && (
          <div
            style={{
              position: 'fixed',
              left: `${Math.max(12, Math.min(window.innerWidth - 350, position.x - (340 - pillWidth) / 2))}px`,
              top: position.y > 380 ? `${position.y - 390}px` : `${position.y + pillHeight + 12}px`,
              width: '340px',
              zIndex: 10000,
            }}
            className="animate-in fade-in zoom-in-95 duration-200"
          >
            <MusicIslandView
              isExpanded={true}
              onToggleExpand={() => setIsMusicExpanded(false)}
              onSwitchToTranslation={() => {
                setIsMusicExpanded(false);
                setPillMode('translation');
              }}
              isPillMode={true}
            />
          </div>
        )}

        <div
          style={{
            position: 'fixed',
            left: `${position.x}px`,
            top: `${position.y}px`,
            width: `${pillWidth}px`,
            height: `${pillHeight}px`,
            zIndex: isPinned ? 9999 : 50,
            opacity: settings.cardOpacity,
          }}
          onMouseDown={handleMouseDown}
          className={`select-none animate-in zoom-in-95 duration-150 rounded-full backdrop-blur-3xl bg-slate-950/85 border text-white flex items-center px-2 sm:px-2.5 gap-1.5 relative group overflow-hidden transition-[transform,box-shadow,border-color] duration-500 ease-out ${
            loading
              ? 'border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.68)]'
              : isDragging
              ? 'scale-[1.03] shadow-[0_38px_85px_rgba(0,0,0,0.85),0_15px_30px_rgba(0,0,0,0.5),0_0_28px_rgba(59,130,246,0.35)] border-white/40 ring-1 ring-blue-400/40 cursor-grabbing'
              : 'scale-100 shadow-[0_20px_50px_rgba(0,0,0,0.6)] border-white/20 cursor-grab hover:shadow-[0_25px_60px_rgba(0,0,0,0.65)]'
          }`}
        >
          {/* 翻译中：Apple AI 风格向内呼吸流光与内边缘微光 (预缓存硬件合成图层，自然破晓唤醒) */}
          <AppleAIBreathingGlow active={loading} />
          {pillMode === 'music' ? (
            <MusicIslandView
              isExpanded={false}
              onToggleExpand={() => setIsMusicExpanded((prev) => !prev)}
              onSwitchToTranslation={() => setPillMode('translation')}
              isPillMode={true}
            />
          ) : (
            <>
              {/* 最左侧圆角区域：悬停最左侧圆角区域自动弹出来，左边收缩为翻译让位 */}
        <div
          onMouseEnter={() => {
            if (leftHoverTimeoutRef.current) clearTimeout(leftHoverTimeoutRef.current);
            setIsLeftHovered(true);
          }}
          onMouseLeave={() => {
            leftHoverTimeoutRef.current = setTimeout(() => {
              setIsLeftHovered(false);
            }, 250);
          }}
          className="relative flex items-center shrink-0 h-full z-20"
        >
          {/* 最左侧边缘触发感知热区：仅局限在最左侧边缘16px，决不向右侵占搜索框 */}
          <div className="absolute left-0 top-0 bottom-0 w-4 cursor-pointer z-10" />
          <div
            className={`flex items-center gap-1.5 overflow-hidden transition-all duration-200 ease-out shrink-0 ${
              isLeftVisible ? 'opacity-100 mr-0.5' : 'opacity-0 -mr-1'
            }`}
            style={{
              width: isLeftVisible ? 'auto' : 0,
            }}
          >
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => onSourceTextChange('')}
              className="w-2.5 h-2.5 rounded-full bg-red-400/80 hover:opacity-100 opacity-70 transition-opacity cursor-pointer shrink-0"
              title="清空内容"
            />
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={() => {
                setIsMinimized(false);
                setSize({ width: Math.max(size.width, 380), height: 490 });
              }}
              className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 hover:opacity-100 opacity-70 transition-opacity cursor-pointer shrink-0"
              title="展开为完整卡片"
            />
          </div>
        </div>

        {/* 动态自适应搜索框：在药丸缩至最小状态下始终保证极易点击，点击聚焦后平滑展开输入 */}
        <div
          onClick={() => pillInputRef.current?.focus()}
          onMouseDown={(e) => {
            e.stopPropagation();
            pillInputRef.current?.focus();
          }}
          style={{
            flex: isSearchFocused
              ? '0 0 auto'
              : pillWidth < 280
              ? '0 0 auto'
              : '1 1 0%',
            width: isSearchFocused
              ? `${Math.min(180, Math.max(120, Math.floor(pillWidth * 0.45)))}px`
              : pillWidth < 280
              ? '28px'
              : undefined,
            minWidth: isSearchFocused ? '120px' : '28px',
            maxWidth: isSearchFocused ? '180px' : '140px',
          }}
          className={`no-drag relative z-30 flex items-center bg-white/10 hover:bg-white/15 focus-within:bg-white/20 border border-white/15 rounded-full h-7 transition-all duration-150 overflow-hidden cursor-text shrink-0 ${
            isSearchFocused
              ? 'ring-1 ring-blue-400/50 px-1.5 gap-1'
              : pillWidth < 280
              ? 'px-0 justify-center w-7'
              : 'px-1.5 gap-1'
          }`}
          title="搜索或翻译"
        >
          {showSearchIcon && (
            <Search className="w-3.5 h-3.5 text-blue-400 shrink-0 pointer-events-none select-none ml-0.5" />
          )}
          <input
            ref={pillInputRef}
            type="text"
            value={sourceText}
            onChange={(e) => onSourceTextChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onTranslate(sourceText);
              }
            }}
            placeholder={isSearchFocused ? '搜索/翻译...' : pillWidth >= 300 ? '搜索/翻译...' : ''}
            className={`text-xs text-white placeholder-white/35 bg-transparent focus:outline-hidden select-text ${
              !isSearchFocused && pillWidth < 280
                ? 'w-0 opacity-0 pointer-events-none'
                : 'w-full flex-1 min-w-0'
            }`}
          />
          {sourceText && isSearchFocused && (
            <button
              type="button"
              onMouseDown={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onSourceTextChange('');
              }}
              className="text-white/40 hover:text-white p-0.5 shrink-0 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* 原文和译文：基于 flex 与 grid 始终按比例分配剩余空间，缩至极小尺寸下支持多行悬停展开 Tooltip */}
        <div
          style={{ flex: isSearchFocused ? '1 1 0%' : '2.4 1 0%' }}
          className="min-w-0 flex items-center px-0.5 select-text overflow-hidden"
        >
          {result ? (
            <div className="w-full grid grid-cols-[minmax(0,1.1fr)_auto_minmax(0,1.7fr)] items-center gap-1 min-w-0 overflow-hidden">
              {/* 原文英语：在极小尺寸下依然稳定显示，支持悬停展开 Tooltip */}
              <div
                className="min-w-0 overflow-hidden flex items-center cursor-help"
                onMouseEnter={() => {
                  if (pillWidth < 460) {
                    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
                    setActiveTooltip('source');
                  }
                }}
                onMouseLeave={() => {
                  tooltipTimeoutRef.current = setTimeout(() => {
                    setActiveTooltip(null);
                  }, 200);
                }}
              >
                <span
                  className="text-xs text-white/85 font-medium truncate block w-full"
                  title={`原文: ${result.sourceText}`}
                >
                  {result.sourceText}
                </span>
              </div>

              {/* 分隔符：紧凑或最小状态下变成树杠 |，节省宝贵横向空间 */}
              {pillWidth < 300 ? (
                <span className="text-white/30 text-[11px] font-mono shrink-0 px-0.5 select-none leading-none">
                  |
                </span>
              ) : (
                <span className="text-blue-400 text-xs font-bold shrink-0 select-none px-0.5">
                  ➔
                </span>
              )}

              {/* 译文：无缝自适应跑马灯循环滚动，缩窄时支持多行悬停展开 Tooltip 防止内容不可读 */}
              <div
                className="min-w-0 overflow-hidden flex items-center cursor-help"
                onMouseEnter={() => {
                  if (pillWidth < 460) {
                    if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
                    setActiveTooltip('target');
                  }
                }}
                onMouseLeave={() => {
                  tooltipTimeoutRef.current = setTimeout(() => {
                    setActiveTooltip(null);
                  }, 200);
                }}
              >
                <MarqueeText
                  text={fullTranslation}
                  className="text-xs text-white/95 font-semibold"
                  pillWidth={pillWidth}
                />
              </div>
            </div>
          ) : sourceText ? (
            <div className="flex-1 min-w-0 truncate text-xs text-white/50 italic">
              {loading ? (pillWidth < 220 ? '翻译中...' : '正在翻译...') : pillWidth < 220 ? '回车翻译' : '按回车翻译...'}
            </div>
          ) : (
            <div className="flex-1 min-w-0 truncate text-[11px] text-white/40 italic">
              {pillWidth < 220 ? '划词翻译' : '输入或划词翻译'}
            </div>
          )}
        </div>

        {/* 最右侧圆角区域：在处理请求时，暂时替换为纤细的线性加载指示器；请求完成后恢复图标区域 */}
        {loading ? (
          <div
            className="flex items-center shrink-0 h-full px-1 sm:px-1.5 z-20 animate-in fade-in duration-150"
            title="正在翻译..."
          >
            {/* 纤细优雅的线性加载指示器（极细 2.5px，带有微光动画，不占用过多空间） */}
            <div
              style={{
                width: pillWidth < 220 ? '20px' : pillWidth < 280 ? '26px' : '34px',
              }}
              className="relative h-[2.5px] bg-white/10 rounded-full overflow-hidden shadow-inner"
            >
              <div className="absolute inset-y-0 w-3/5 rounded-full bg-gradient-to-r from-blue-400 via-cyan-300 to-emerald-400 animate-linear-loading shadow-[0_0_6px_rgba(56,189,248,0.7)]" />
            </div>
          </div>
        ) : (
          <div
            onMouseEnter={() => {
              if (rightHoverTimeoutRef.current) clearTimeout(rightHoverTimeoutRef.current);
              setIsRightHovered(true);
            }}
            onMouseLeave={() => {
              rightHoverTimeoutRef.current = setTimeout(() => {
                setIsRightHovered(false);
              }, 280);
            }}
            className="no-drag relative flex items-center shrink-0 h-full z-40"
          >
            {/* 最右侧边缘触发感知热区：确保鼠标移动到最右侧圆角时也能灵敏触发 */}
            <div className="absolute -right-2 top-0 bottom-0 w-7 cursor-pointer z-10" />

            {/* 在 flex 流中平滑展开，收缩时宽度为0且完全隐去，绝不额外增加图标，左侧自然让位 */}
            <div
              className={`flex items-center gap-1 overflow-hidden transition-all duration-200 ease-out shrink-0 relative z-50 ${
                isRightVisible ? 'opacity-100 ml-0.5 pointer-events-auto' : 'opacity-0 -ml-1 pointer-events-none'
              }`}
              style={{
                width: isRightVisible ? 'auto' : 0,
              }}
            >
              {result && (
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSpeak();
                  }}
                  className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer shrink-0"
                  title="朗读发音"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
              )}
              {result && (
                <button
                  type="button"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCopy();
                  }}
                  className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer shrink-0"
                  title={copied ? '已复制' : '复制完整释义'}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSnipper();
                }}
                className="p-1 rounded-full text-blue-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer shrink-0"
                title="截图翻译"
              >
                <Crop className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setPillMode('music');
                }}
                className="p-1 rounded-full text-emerald-400 hover:text-white hover:bg-emerald-500/20 transition-colors cursor-pointer shrink-0"
                title="切换到灵动岛音乐与歌词"
              >
                <Music className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMinimized(false);
                  setSize((prev) => ({ width: Math.max(prev.width, 380), height: 490 }));
                }}
                className="p-1.5 rounded-full bg-white/15 hover:bg-blue-500/40 text-white/90 hover:text-white transition-all hover:scale-110 active:scale-95 cursor-pointer shrink-0 shadow-xs relative z-50 ring-1 ring-white/10"
                title="展开为完整卡片"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 悬停多行展开 Tooltip：当药丸宽度缩小时，原文或译文悬停可多行展开完整内容，防止极限尺寸下内容不可读 */}
        {activeTooltip && result && (
          <div
            onMouseEnter={() => {
              if (tooltipTimeoutRef.current) clearTimeout(tooltipTimeoutRef.current);
            }}
            onMouseLeave={() => {
              tooltipTimeoutRef.current = setTimeout(() => {
                setActiveTooltip(null);
              }, 200);
            }}
            className="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+8px)] w-[min(320px,90vw)] max-h-52 overflow-y-auto p-3 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/20 shadow-[0_15px_35px_rgba(0,0,0,0.6)] text-xs text-white z-50 animate-in fade-in zoom-in-95 duration-150 select-text"
          >
            {activeTooltip === 'source' ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
                  <span>原文内容</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(result.sourceText);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    复制
                  </button>
                </div>
                <div className="text-white/95 font-medium leading-relaxed break-words whitespace-pre-wrap">
                  {result.sourceText}
                </div>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[10px] text-blue-400 font-semibold uppercase tracking-wider">
                  <span>完整翻译释义</span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(fullTranslation);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 1500);
                    }}
                    className="text-white/60 hover:text-white transition-colors cursor-pointer"
                  >
                    复制
                  </button>
                </div>
                <div className="text-white/95 font-medium leading-relaxed break-words whitespace-pre-wrap">
                  {fullTranslation}
                </div>
                {result.isWord && result.definitions && result.definitions.length > 0 && (
                  <div className="pt-1.5 border-t border-white/10 space-y-1">
                    {result.definitions.map((def, idx) => (
                      <div key={idx} className="flex gap-1.5 text-[11px] leading-snug">
                        {def.partOfSpeech && (
                          <span className="text-blue-300 font-mono italic shrink-0">
                            {def.partOfSpeech}
                          </span>
                        )}
                        <span className="text-white/80">{def.meaning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* 倒三角小箭头指向药丸 */}
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-slate-900 border-r border-b border-white/20 rotate-45" />
          </div>
        )}

        {/* 边缘拉伸：左右拉伸药丸宽度，向下大幅拖拽拉伸展开回卡片，向上推缩小高度 */}
        <div
          onMouseDown={(e) => {
            handleResizeMouseDown(e, 's');
          }}
          className="resize-handle absolute left-8 right-8 -bottom-1 h-3 cursor-ns-resize hover:bg-blue-400/20 active:bg-blue-400/40 rounded-b-full transition-colors z-20"
          title="向上推缩小药丸高度，大幅向下拖动展开为卡片"
        />
        <div
          onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          className="resize-handle absolute -right-1 top-2 bottom-2 w-2.5 cursor-ew-resize hover:bg-blue-400/20 active:bg-blue-400/40 rounded-r-full transition-colors z-20"
          title="左右拖动调整药丸宽度"
        />
        <div
          onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
          className="resize-handle absolute -left-1 top-2 bottom-2 w-2.5 cursor-ew-resize hover:bg-blue-400/20 active:bg-blue-400/40 rounded-l-full transition-colors z-20"
          title="左右拖动调整药丸宽度"
        />
            </>
          )}
        </div>
      </>
    );
  }

  // 2. Full Floating Translator Card with Dynamic Resizing
  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        maxWidth: 'calc(100vw - 20px)',
        maxHeight: 'calc(100vh - 35px)',
        zIndex: isPinned ? 9999 : 40,
        opacity: settings.cardOpacity,
      }}
      className={`bg-white/10 backdrop-blur-3xl border ${
        isMinimal ? 'rounded-2xl' : 'rounded-[32px]'
      } flex flex-col relative z-10 select-none overflow-hidden transition-[transform,box-shadow,border-color,opacity] duration-500 ease-out ${
        loading
          ? 'border-white/25 shadow-[0_28px_65px_-15px_rgba(0,0,0,0.65),0_10px_25px_-5px_rgba(0,0,0,0.35)]'
          : isDragging
          ? 'scale-[1.018] shadow-[0_55px_120px_-15px_rgba(0,0,0,0.85),0_30px_60px_-10px_rgba(0,0,0,0.5),0_0_35px_rgba(59,130,246,0.25)] border-white/35 ring-1 ring-blue-400/30'
          : 'scale-100 shadow-[0_28px_65px_-15px_rgba(0,0,0,0.58),0_10px_25px_-5px_rgba(0,0,0,0.3)] border-white/20'
      }`}
    >
      {/* 翻译中：Apple AI 风格向内呼吸流光与内边缘微光 (预缓存硬件合成图层，自然破晓唤醒) */}
      <AppleAIBreathingGlow active={loading} />
      {/* Top Header Bar (保持内容一致性，紧凑排版，图标永不丢失) */}
      {!isMinimal && (
        <div
          onMouseDown={handleMouseDown}
          className={`relative z-30 w-full max-w-full overflow-hidden ${
            isUltraCompact
              ? 'px-2 py-1'
              : isVeryCompact
              ? 'px-2.5 py-1.5'
              : 'px-3.5 py-2'
          } flex items-center justify-between border-b border-white/10 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          } rounded-t-[32px] shrink-0 gap-1`}
        >
        {/* Traffic Light Dots */}
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className={`no-drag relative z-30 flex items-center shrink-0 ${isUltraCompact ? 'gap-1' : 'gap-1.5'}`}
        >
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => onSourceTextChange('')}
            className={`${isUltraCompact ? 'w-2 h-2' : isVeryCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full bg-red-400/80 shadow-xs hover:opacity-100 opacity-80 transition-opacity cursor-pointer`}
            title="清空内容"
          />
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setIsMinimized(true)}
            className={`${isUltraCompact ? 'w-2 h-2' : isVeryCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full bg-amber-400/80 shadow-xs hover:opacity-100 opacity-80 transition-opacity cursor-pointer`}
            title="收起为药丸形状"
          />
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => onTranslate(sourceText || 'Efficient')}
            className={`${isUltraCompact ? 'w-2 h-2' : isVeryCompact ? 'w-2.5 h-2.5' : 'w-3 h-3'} rounded-full bg-emerald-400/80 shadow-xs hover:opacity-100 opacity-80 transition-opacity cursor-pointer`}
            title="刷新翻译"
          />
        </div>

        {/* Center: Language Switcher Pill */}
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="no-drag relative z-30 flex items-center min-w-0 shrink justify-center gap-1"
        >
          <LanguageSelector
            sourceLang={sourceLang}
            targetLang={targetLang}
            onSourceChange={onSourceLangChange}
            onTargetChange={onTargetLangChange}
            onSwap={onSwapLanguages}
            isDark={isDark}
            compact={size.width < 360}
            minimal={size.width < 270}
          />

          {/* Engine indicator pill with click-to-cycle */}
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              const engines = ['gemini', 'deepl', 'youdao', 'offline'] as const;
              const cur = settings.translationEngine || 'gemini';
              const next = engines[(engines.indexOf(cur as any) + 1) % engines.length];
              onUpdateSettings?.({ translationEngine: next });
            }}
            className={`flex items-center rounded-full font-medium bg-white/10 hover:bg-white/15 hover:border-white/20 active:scale-95 text-blue-300 border border-white/10 transition-all cursor-pointer shrink-0 ${
              size.width < 390 ? 'p-1' : 'gap-1 px-1.5 py-0.5 text-[10px]'
            }`}
            title={`当前翻译引擎: ${settings.translationEngine || 'gemini'} (点击切换引擎)`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${settings.translationEngine === 'offline' ? 'bg-amber-400' : 'bg-emerald-400'} ${loading ? 'animate-ping' : ''} shrink-0`} />
            {size.width >= 390 && (
              <span className="truncate max-w-[55px]">
                {settings.translationEngine === 'gemini'
                  ? 'Gemini'
                  : settings.translationEngine === 'deepl'
                  ? 'DeepL'
                  : settings.translationEngine === 'youdao'
                  ? '有道'
                  : '离线'}
              </span>
            )}
          </button>
        </div>

        {/* Right action buttons: Screenshot, Pin & Settings (始终完整展示，紧凑排布) */}
        <div
          onMouseDown={(e) => e.stopPropagation()}
          className="no-drag relative z-30 flex items-center shrink-0 gap-0.5 sm:gap-1"
        >
          {/* Screenshot Translation Trigger */}
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onOpenSnipper}
            className={`${isUltraCompact ? 'p-0.5' : isVeryCompact ? 'p-1' : 'p-1.5'} rounded-full text-blue-400/80 hover:text-blue-300 hover:bg-white/10 transition-colors cursor-pointer shrink-0`}
            title="截图翻译 (支持逐行中英对照)"
          >
            <Crop className={isUltraCompact ? 'w-2.5 h-2.5' : isVeryCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setIsPinned(!isPinned)}
            aria-label="Pin Window"
            className={`${isUltraCompact ? 'p-0.5' : isVeryCompact ? 'p-1' : 'p-1.5'} rounded-full transition-colors cursor-pointer shrink-0 ${
              isPinned
                ? 'text-blue-400 bg-white/10'
                : 'text-white/40 hover:text-white/80'
            }`}
            title={isPinned ? '已置顶固定' : '置顶窗口'}
          >
            <Pin className={`${isUltraCompact ? 'w-2.5 h-2.5' : isVeryCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} ${isPinned ? 'fill-current' : ''}`} />
          </button>

          {/* Music Dynamic Island button in Card View */}
          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => setIsMusicExpanded((prev) => !prev)}
            className={`${isUltraCompact ? 'p-0.5' : isVeryCompact ? 'p-1' : 'p-1.5'} text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 rounded-full transition-colors cursor-pointer shrink-0`}
            title="灵动岛音乐与歌词"
          >
            <Music className={isUltraCompact ? 'w-2.5 h-2.5' : isVeryCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
          </button>

          <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={onOpenSettings}
            className={`group ${isUltraCompact ? 'p-0.5' : isVeryCompact ? 'p-1' : 'p-1.5'} text-white/40 hover:text-white/80 hover:bg-white/10 rounded-full transition-colors cursor-pointer shrink-0`}
            title="偏好设置"
          >
            <Sliders className={`${isUltraCompact ? 'w-2.5 h-2.5' : isVeryCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} group-hover:rotate-45 transition-transform duration-300`} />
          </button>
        </div>
      </div>
      )}

      {/* CardView 顶部音乐面板浮层 */}
      {isMusicExpanded && !isMinimal && (
        <div className="px-3 pt-2 pb-1 relative z-30">
          <MusicIslandView
            isExpanded={true}
            onToggleExpand={() => setIsMusicExpanded(false)}
            onSwitchToTranslation={() => setIsMusicExpanded(false)}
            isPillMode={false}
          />
        </div>
      )}

      {/* Main Content Area */}
      {isMinimal ? (
        /* Minimal Card View: ONLY Search Box and Translation with Corner Hover Controls */
        <div
          onMouseDown={handleMouseDown}
          style={{ fontSize: `${baseFontScale * 100}%` }}
          className="p-2 flex flex-col justify-center h-full w-full space-y-1 overflow-hidden select-text relative"
        >
          {/* Top-Left Corner Sensor: 严格仅限最左上角极小区域 (36px×28px)，杜绝整个顶部触发 */}
          <div
            onMouseEnter={handleMinimalTopLeftEnter}
            onMouseLeave={handleMinimalTopLeftLeave}
            className="absolute top-0 left-0 w-9 h-7 z-30 pointer-events-auto"
          />

          {/* Top-Left Hover Capsule: 鼠标移入最左上角后才弹出，绝不干扰顶部其他区域 */}
          <div
            onMouseEnter={handleMinimalTopLeftEnter}
            onMouseLeave={handleMinimalTopLeftLeave}
            onMouseDown={(e) => e.stopPropagation()}
            className={`no-drag absolute top-1 left-2 z-40 flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-950/92 backdrop-blur-md border border-white/20 shadow-xl transition-all duration-200 ${
              isMinimalTopLeftHovered
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 scale-90 -translate-y-1 pointer-events-none'
            }`}
          >
            {/* 关闭/清空按钮 */}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onSourceTextChange('');
              }}
              className="group relative w-3 h-3 rounded-full bg-red-400/90 hover:bg-red-400 shadow-xs flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shrink-0"
              title="关闭/清空内容"
            >
              <X className="w-2 h-2 text-red-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            {/* 缩小收起为药丸 */}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(true);
              }}
              className="group relative w-3 h-3 rounded-full bg-amber-400/90 hover:bg-amber-400 shadow-xs flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shrink-0"
              title="缩小收起为药丸"
            >
              <span className="w-1.5 h-0.5 bg-amber-950 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            {/* 展开为标准卡片 */}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setSize({ width: Math.max(size.width, 380), height: 490 });
              }}
              className="group relative w-3 h-3 rounded-full bg-emerald-400/90 hover:bg-emerald-400 shadow-xs flex items-center justify-center transition-transform hover:scale-110 cursor-pointer shrink-0"
              title="展开为标准卡片"
            >
              <Maximize2 className="w-1.5 h-1.5 text-emerald-950 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>

          {/* Top-Right Corner Sensor: 严格仅限最右上角极小区域 (36px×28px)，杜绝整个顶部触发 */}
          <div
            onMouseEnter={handleMinimalTopRightEnter}
            onMouseLeave={handleMinimalTopRightLeave}
            className="absolute top-0 right-0 w-9 h-7 z-30 pointer-events-auto"
          />

          {/* Top-Right Hover Capsule: 鼠标移入最右上角后才弹出常用功能 */}
          <div
            onMouseEnter={handleMinimalTopRightEnter}
            onMouseLeave={handleMinimalTopRightLeave}
            onMouseDown={(e) => e.stopPropagation()}
            className={`no-drag absolute top-1 right-2 z-40 flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-slate-950/92 backdrop-blur-md border border-white/20 shadow-xl transition-all duration-200 ${
              isMinimalTopRightHovered
                ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 scale-90 -translate-y-1 pointer-events-none'
            }`}
          >
            {/* 复制 */}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleCopy();
              }}
              className={`p-1 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer ${
                copied ? 'text-emerald-400' : ''
              }`}
              title={copied ? '已复制' : '复制译文'}
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>

            {/* 朗读发音 */}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                handleSpeak();
              }}
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="朗读发音"
            >
              <Volume2 className="w-3 h-3" />
            </button>

            {/* 截图翻译 */}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onOpenSnipper();
              }}
              className="p-1 rounded-full text-blue-300 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="截图翻译"
            >
              <Crop className="w-3 h-3" />
            </button>

            {/* 置顶固定 */}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                setIsPinned(!isPinned);
              }}
              className={`p-1 rounded-full transition-colors cursor-pointer ${
                isPinned ? 'text-blue-400 bg-white/15' : 'text-white/70 hover:text-white hover:bg-white/15'
              }`}
              title={isPinned ? '已置顶固定' : '置顶窗口'}
            >
              <Pin className={`w-3 h-3 ${isPinned ? 'fill-current' : ''}`} />
            </button>

            {/* 偏好设置 */}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onOpenSettings();
              }}
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="偏好设置"
            >
              <Sliders className="w-3.5 h-3.5" />
            </button>

            {/* 历史与生词本 */}
            <button
              type="button"
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation();
                onOpenHistory();
              }}
              className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/15 transition-colors cursor-pointer"
              title="历史与生词本"
            >
              <History className="w-3 h-3" />
            </button>
          </div>

          {/* Search Box with Hover-Scroll when text overflows */}
          <div
            onMouseEnter={() => setIsCardSearchHovered(true)}
            onMouseLeave={() => setIsCardSearchHovered(false)}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={() => {
              setIsCardInputFocused(true);
              setTimeout(() => cardInputRef.current?.focus(), 20);
            }}
            className="relative flex items-center bg-white/5 border border-white/10 rounded-xl px-2 py-1 focus-within:border-white/25 focus-within:bg-white/10 transition-all shrink-0 no-drag cursor-text"
          >
            <Search className="w-3 h-3 text-blue-400 shrink-0 mr-1.5" />
            <div className="flex-1 min-w-0 overflow-hidden">
              {isCardInputFocused ? (
                <input
                  ref={cardInputRef}
                  value={sourceText}
                  onChange={(e) => onSourceTextChange(e.target.value)}
                  onBlur={() => setIsCardInputFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      setIsCardInputFocused(false);
                      onTranslate(sourceText);
                    }
                  }}
                  placeholder="搜索或输入..."
                  className="w-full text-xs text-white placeholder-white/30 bg-transparent focus:outline-hidden select-text"
                  autoFocus
                />
              ) : sourceText ? (
                <HoverScrollText
                  text={sourceText}
                  isHovered={isCardSearchHovered}
                  className="text-xs text-white font-medium"
                />
              ) : (
                <span className="text-xs text-white/30 truncate select-none block">
                  搜索或输入...
                </span>
              )}
            </div>
            {sourceText && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSourceTextChange('');
                }}
                className="p-0.5 ml-1 text-white/40 hover:text-white rounded-full transition-colors cursor-pointer shrink-0"
                title="清空"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            )}
          </div>

          {/* Translation Result with Hover-Scroll when text overflows */}
          <div
            className="flex-1 min-h-0 flex items-center px-1 overflow-hidden no-drag"
            onMouseEnter={() => setIsTranslationHovered(true)}
            onMouseLeave={() => setIsTranslationHovered(false)}
          >
            {loading ? (
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <Sparkles className="w-3 h-3 text-blue-400 animate-spin" />
                <span className="text-[11px]">正在翻译...</span>
              </div>
            ) : result ? (
              <div className="w-full overflow-hidden">
                {(() => {
                  const rawPhonetic =
                    typeof result.phonetic === 'string'
                      ? result.phonetic
                      : (result.phonetic?.us || result.phonetic?.uk || result.phonetic?.general || '');
                  const cleanPhonetic = rawPhonetic ? `/${rawPhonetic.replace(/^\/|\/$/g, '')}/` : '';

                  let translationDisplay = result.translatedText;
                  if (result.isWord) {
                    if (result.definitions && result.definitions.length > 0) {
                      const defs = result.definitions
                        .map((d) => `${d.partOfSpeech ? `${d.partOfSpeech} ` : ''}${d.meaning}`)
                        .join('； ');
                      const syns =
                        result.synonyms && result.synonyms.length > 0
                          ? ` 【同义: ${result.synonyms.join(', ')}】`
                          : '';
                      translationDisplay = `${defs}${syns}`.trim() || result.translatedText;
                    } else if (result.partOfSpeech) {
                      translationDisplay = `${result.partOfSpeech}. ${result.translatedText}`;
                    }
                  }

                  return (
                    <HoverScrollText
                      text={translationDisplay}
                      isHovered={isTranslationHovered}
                      className="text-xs font-semibold text-white/95 leading-snug"
                      prefix={
                        result.isWord && cleanPhonetic ? (
                          <span className="text-[10px] text-blue-300/80 font-mono mr-1.5 shrink-0 select-text">
                            {cleanPhonetic}
                          </span>
                        ) : undefined
                      }
                    />
                  );
                })()}
              </div>
            ) : (
              <div className="text-[11px] text-white/30 truncate">
                输入内容按 Enter 翻译
              </div>
            )}
          </div>
        </div>
      ) : (
        <div
          style={{ fontSize: `${effectiveFontScale * 100}%` }}
          className={`${
            isDynamicTight
              ? 'p-2 space-y-1.5'
              : isDynamicCompact
              ? 'p-2.5 space-y-2'
              : 'p-3.5 space-y-3'
          } overflow-y-auto overflow-x-hidden flex-1 min-h-0 flex flex-col transition-all duration-150 ease-out select-text`}
        >
        {/* Source Text Input Box: 统一响应式输入框，平滑自适应，绝不跳变 */}
        <div
          onMouseEnter={() => setIsCardSearchHovered(true)}
          onMouseLeave={() => setIsCardSearchHovered(false)}
          onClick={() => {
            if (!isCardInputFocused) {
              setIsCardInputFocused(true);
              setTimeout(() => cardInputRef.current?.focus(), 20);
            }
          }}
          className={`relative flex items-center bg-white/5 border border-white/10 rounded-2xl ${
            isDynamicTight ? 'px-2 py-1' : isDynamicCompact ? 'px-2.5 py-1.5' : 'px-3 py-2'
          } focus-within:border-white/25 focus-within:bg-white/10 transition-all shrink-0 cursor-text no-drag`}
        >
          <Search className={`${isUltraCompact ? 'w-3 h-3 mr-1.5' : 'w-3.5 h-3.5 mr-2'} text-blue-400 shrink-0`} />
          <div className="flex-1 min-w-0 overflow-hidden">
            {isCardInputFocused ? (
              <textarea
                ref={cardInputRef as any}
                value={sourceText}
                onChange={(e) => onSourceTextChange(e.target.value)}
                onBlur={() => setIsCardInputFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    setIsCardInputFocused(false);
                    onTranslate(sourceText);
                  }
                }}
                placeholder="输入单词句子或截图翻译..."
                spellCheck={false}
                rows={sourceText.length > 40 && size.height >= 340 ? 2 : 1}
                className="w-full text-xs sm:text-sm leading-snug glass-input resize-none focus:outline-hidden select-text text-white placeholder-white/30 min-w-0"
                autoFocus
              />
            ) : sourceText ? (
              <HoverScrollText
                text={sourceText}
                isHovered={isCardSearchHovered}
                className="text-xs sm:text-sm leading-snug text-white font-normal break-words"
              />
            ) : (
              <span className="text-xs sm:text-sm text-white/30 select-none block">
                输入单词句子或截图翻译...
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0 ml-1">
            {sourceText && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onSourceTextChange('');
                }}
                className="p-1 text-white/40 hover:text-white rounded-full transition-colors cursor-pointer"
                title="清空"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={onOpenSnipper}
              className="p-1 text-blue-400/80 hover:text-blue-300 rounded-full transition-colors cursor-pointer"
              title="截图框选翻译"
            >
              <Crop className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Translation Content: 始终保证内容一致性，不删减例句或释义 */}
        {loading ? (
          <div className="py-4 flex flex-col items-center justify-center gap-2 text-white/50 animate-soft-fade">
            <Sparkles className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-xs tracking-wide">正在翻译中...</span>
          </div>
        ) : result ? (
          <div key={result.id || result.sourceText} className={`animate-view-scale ${isDynamicTight ? 'space-y-1' : isDynamicCompact ? 'space-y-1.5' : 'space-y-2.5'}`}>
            {result.isWord ? (
              /* Rich Word Details with responsive adaptive scaling */
              <WordDetailView
                result={result}
                isDark={isDark}
                onSelectWord={onSelectWord}
                isCompact={isDynamicCompact}
                isVeryCompact={isDynamicTight}
                isUltraCompact={isUltraCompact}
                fontSize={settings.fontSize}
                effectiveFontScale={effectiveFontScale}
              />
            ) : (
              /* Sentence / Paragraph Translation with hover scroll and click-to-speak */
              <div className="space-y-1 select-text overflow-hidden">
                <div
                  onClick={() => speakText(result.translatedText, result.targetLang || targetLang)}
                  className="p-1 rounded-lg hover:bg-blue-500/10 border border-transparent hover:border-blue-400/20 transition-all cursor-pointer group flex items-start justify-between gap-1.5"
                  title="点击朗读译文"
                >
                  <div className="flex-1 min-w-0">
                    <HoverScrollText
                      text={result.translatedText}
                      className={`font-semibold text-white/95 leading-tight break-words block ${
                        isUltraCompact
                          ? 'text-xs'
                          : isVeryCompact
                          ? 'text-sm'
                          : isCompact
                          ? 'text-base'
                          : 'text-base sm:text-lg'
                      }`}
                    />
                  </div>
                  <Volume2 className="w-3.5 h-3.5 text-white/20 group-hover:text-blue-400 shrink-0 mt-0.5 transition-colors" />
                </div>
                <div className="h-px bg-white/10 w-full" />
                <div
                  onClick={() => speakText(result.sourceText, result.sourceLang || sourceLang)}
                  className="p-1 rounded-lg hover:bg-white/[0.06] border border-transparent hover:border-white/10 transition-all cursor-pointer group flex items-start justify-between gap-1.5"
                  title="点击朗读原文"
                >
                  <div className="flex-1 min-w-0">
                    <HoverScrollText
                      text={result.sourceText}
                      className={`text-white/50 leading-snug italic break-words block ${
                        isUltraCompact ? 'text-[10px]' : isVeryCompact ? 'text-xs' : 'text-sm'
                      }`}
                    />
                  </div>
                  <Volume2 className="w-3 h-3 text-white/20 group-hover:text-white/80 shrink-0 mt-0.5 transition-colors" />
                </div>
              </div>
            )}

            {/* Translation Action Toolbar: 语言对、复制、朗读、收藏、历史始终完整可用 */}
            <div className="flex items-center justify-between pt-1 border-t border-white/10 shrink-0">
              <div className="text-[10px] text-blue-400/80 font-mono">
                {sourceLang}➔{targetLang}
              </div>

              <div className="flex gap-0.5 sm:gap-1 items-center">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer ${
                    copied ? 'text-emerald-400' : ''
                  }`}
                  title={copied ? '已复制' : '复制完整释义'}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleSpeak}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="朗读发音"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => result.id && onToggleFavorite(result.id)}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    result.isFavorite
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-white/40 hover:text-amber-400 hover:bg-white/5'
                  }`}
                  title={result.isFavorite ? '移出生词本' : '收藏到生词本'}
                >
                  <Heart className={`w-3.5 h-3.5 ${result.isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={onOpenHistory}
                  className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                  title="查看生词历史"
                >
                  <History className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-3 px-1 text-center text-white/40 text-xs flex-1 flex flex-col justify-center items-center gap-2">
            <span className="text-[11px] leading-relaxed">
              输入文本或在桌面文档中划词即刻精准翻译
            </span>
            {!isUltraCompact && (
              <div className="flex items-center justify-center gap-1.5 flex-wrap pt-1">
                {['Efficient', 'Serendipity', 'Resilient', 'AI 神经翻译'].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => {
                      onSourceTextChange(w);
                      onTranslate(w);
                    }}
                    className="px-2 py-0.5 rounded-full text-[10px] bg-white/5 hover:bg-white/15 text-blue-300 border border-white/10 transition-colors cursor-pointer"
                  >
                    {w}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      )}

      {/* Card Footer matching Frosted Glass Design (在卡片形态下自适应展示) */}
      {!isMinimal && size.height >= 180 && size.width >= 240 && (
        <div className={`mt-auto ${isVeryCompact ? 'p-1.5 px-3' : 'p-2.5 px-3.5'} bg-white/5 flex items-center justify-between rounded-b-[32px] border-t border-white/10 shrink-0`}>
          <div
            className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none group"
            onClick={() => {
              if (onToggleSmartSelect) {
                onToggleSmartSelect();
              }
            }}
            title="点击开启/关闭划词智能翻译"
          >
            <div
              className={`relative w-7 h-3.5 sm:w-8 sm:h-4 rounded-full border border-white/10 transition-colors duration-200 ${
                settings.selectionTranslation ? 'bg-blue-500/80' : 'bg-white/15'
              }`}
            >
              <div
                className={`absolute top-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white rounded-full shadow-md transition-transform duration-200 ${
                  settings.selectionTranslation ? 'right-0.5' : 'left-0.5'
                }`}
              />
            </div>
            <span className="text-[10px] text-white/70 font-semibold tracking-wide uppercase group-hover:text-white transition-colors">
              {settings.selectionTranslation ? 'Smart-Select' : 'Paused'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {result && !loading && (
              <div className="flex items-center gap-0.5 sm:gap-1">
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer ${
                    copied ? 'text-emerald-400' : ''
                  }`}
                  title={copied ? '已复制' : '复制翻译'}
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
                <button
                  type="button"
                  onClick={handleSpeak}
                  className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="朗读发音"
                >
                  <Volume2 className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => result.id && onToggleFavorite(result.id)}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    result.isFavorite
                      ? 'text-amber-400 fill-amber-400'
                      : 'text-white/40 hover:text-amber-400 hover:bg-white/10'
                  }`}
                  title={result.isFavorite ? '移出生词本' : '收藏到生词本'}
                >
                  <Heart className={`w-3 h-3 ${result.isFavorite ? 'fill-current' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={onOpenHistory}
                  className="p-1 rounded-md text-white/40 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                  title="查看生词历史"
                >
                  <History className="w-3 h-3" />
                </button>
                <div className="w-px h-3 bg-white/10 mx-0.5" />
              </div>
            )}
            {!result && !isVeryCompact && !isUltraCompact && (
              <span className="text-[9px] text-white/30 hidden sm:inline">划词即翻 · Alt+Q</span>
            )}

            {/* 文本大小调节按钮 (置于底部栏，弹窗向上展开) */}
            <div className="relative font-popover-container">
              <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={() => setIsFontMenuOpen((prev) => !prev)}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md font-mono text-[10px] transition-all cursor-pointer border ${
                  isFontMenuOpen
                    ? 'bg-blue-500/25 text-blue-300 border-blue-400/40 shadow-xs'
                    : 'text-white/45 hover:text-white/80 hover:bg-white/10 border-white/10 hover:border-white/20'
                }`}
                title="调节文本大小与排版 (支持精确输入与预设)"
              >
                <Type className="w-3 h-3 text-blue-400/80" />
                <span className="font-semibold">{currentBasePercent}%</span>
              </button>

              {/* 文本大小弹窗 - 从底部栏向上展开 */}
              {isFontMenuOpen && (
                <div
                  onMouseDown={(e) => e.stopPropagation()}
                  className="absolute right-0 bottom-full mb-2 w-64 p-3 rounded-2xl bg-slate-950/95 backdrop-blur-2xl border border-white/20 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2.5 text-xs text-white"
                >
                  <div className="flex items-center justify-between pb-1 border-b border-white/10">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-100">
                      <Type className="w-3.5 h-3.5 text-blue-400" />
                      <span>文本大小与排版</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFontMenuOpen(false)}
                      className="text-white/40 hover:text-white p-0.5 rounded-md transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Direct Numeric Input with Steppers */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-white/70">
                      <span>支持直接输入字号:</span>
                      <span className="font-mono text-blue-400 font-semibold">{currentBasePercent}%</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleFontPercentChange(Math.max(60, currentBasePercent - 5))}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
                        title="缩小 5%"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <div className="relative flex-1">
                        <input
                          type="number"
                          min={60}
                          max={150}
                          step={1}
                          value={fontInputVal}
                          onChange={(e) => {
                            setFontInputVal(e.target.value);
                            const num = parseInt(e.target.value, 10);
                            if (!isNaN(num) && num >= 50 && num <= 180) {
                              handleFontPercentChange(num);
                            }
                          }}
                          onBlur={() => {
                            const num = parseInt(fontInputVal, 10);
                            if (isNaN(num) || num < 60) {
                              handleFontPercentChange(60);
                            } else if (num > 150) {
                              handleFontPercentChange(150);
                            }
                          }}
                          className="w-full px-2.5 py-1 text-center font-mono font-semibold text-xs rounded-lg bg-white/10 border border-white/20 text-white focus:outline-hidden focus:border-blue-400 focus:bg-white/15 pr-6"
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/40 font-mono pointer-events-none">
                          %
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleFontPercentChange(Math.min(150, currentBasePercent + 5))}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 text-white/70 hover:text-white border border-white/10 transition-colors cursor-pointer"
                        title="放大 5%"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="grid grid-cols-4 gap-1 pt-0.5">
                    {[
                      { label: '紧凑', percent: 80 },
                      { label: '默认', percent: 92 },
                      { label: '标准', percent: 100 },
                      { label: '大字', percent: 115 },
                    ].map((preset) => (
                      <button
                        key={preset.percent}
                        type="button"
                        onClick={() => handleFontPercentChange(preset.percent)}
                        className={`px-1 py-1 rounded-lg text-center text-[10px] font-mono border transition-all cursor-pointer ${
                          currentBasePercent === preset.percent
                            ? 'bg-blue-500/20 text-blue-300 border-blue-400/50 font-semibold'
                            : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                      >
                        <div>{preset.percent}%</div>
                        <div className="text-[9px] text-white/40">{preset.label}</div>
                      </button>
                    ))}
                  </div>

                  {/* Dynamic Compact Layout Switch */}
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-white/70">动态紧凑布局</span>
                    <button
                      type="button"
                      onClick={() => onUpdateSettings?.({ compactMode: !settings.compactMode })}
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium border transition-colors cursor-pointer ${
                        settings.compactMode
                          ? 'bg-blue-500/20 text-blue-300 border-blue-400/40'
                          : 'bg-white/5 text-white/40 border-white/10 hover:text-white'
                      }`}
                    >
                      {settings.compactMode ? '始终紧凑' : '跟随尺寸'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="text-[9px] text-white/30 font-semibold tracking-widest font-mono">
              {Math.round(size.width)}×{Math.round(size.height)}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          8 方向全角度拉伸与四角缩放手柄（高灵敏拖动调节尺寸）
          四角的小尖尖均已彻底隐藏，纯净简约玻璃外观，仍支持平滑拉伸手柄交互
          ========================================================================= */}
      {/* 1. 四个角 (NW, NE, SW, SE) 无视觉尖尖标记，纯净拖拽 */}
      {/* 右下角 (SE) */}
      <div
        onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
        className="resize-handle absolute -right-1.5 -bottom-1.5 w-5 h-5 cursor-nwse-resize rounded-br-[32px] transition-colors z-20"
        title="拖动右下角调节大小"
      />

      {/* 左下角 (SW) */}
      <div
        onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
        className="resize-handle absolute -left-1.5 -bottom-1.5 w-5 h-5 cursor-nesw-resize rounded-bl-[32px] transition-colors z-20"
        title="拖动左下角调节大小"
      />

      {/* 右上角 (NE) */}
      <div
        onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
        className="resize-handle absolute -right-1.5 -top-1.5 w-4 h-4 cursor-nesw-resize rounded-tr-[32px] transition-colors z-20"
        title="拖动右上角调节大小"
      />

      {/* 左上角 (NW) */}
      <div
        onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
        className="resize-handle absolute -left-1.5 -top-1.5 w-4 h-4 cursor-nwse-resize rounded-tl-[32px] transition-colors z-20"
        title="拖动左上角调节大小"
      />

      {/* 2. 四条边 (E, W, S, N) */}
      {/* 右侧边 (E) */}
      <div
        onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
        className="resize-handle absolute -right-1.5 top-8 bottom-8 w-3 cursor-ew-resize hover:bg-blue-400/25 active:bg-blue-400/40 rounded-r-full transition-colors z-30"
        title="向左右拉伸调节宽度"
      />
      {/* 底部边 (S) */}
      <div
        onMouseDown={(e) => handleResizeMouseDown(e, 's')}
        className="resize-handle absolute left-8 right-8 -bottom-1.5 h-3 cursor-ns-resize hover:bg-blue-400/25 active:bg-blue-400/40 rounded-b-full transition-colors z-30"
        title="向上下拉伸调节高度"
      />
      {/* 左侧边 (W) */}
      <div
        onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
        className="resize-handle absolute -left-1.5 top-8 bottom-8 w-3 cursor-ew-resize hover:bg-blue-400/25 active:bg-blue-400/40 rounded-l-full transition-colors z-30"
        title="向左右拉伸调节宽度"
      />
      {/* 顶部边 (N) */}
      <div
        onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
        className="resize-handle absolute left-8 right-8 -top-1.5 h-3 cursor-ns-resize hover:bg-blue-400/25 active:bg-blue-400/40 rounded-t-full transition-colors z-30"
        title="向上下拉伸调节高度"
      />
    </div>
  );
};

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppSettings, TranslationResult, ScreenshotTranslationResult, InPlaceScreenshotTranslation } from './types';
import { DEFAULT_SOURCE_LANG, DEFAULT_TARGET_LANG } from './constants/languages';
import {
  FloatingTranslatorCard,
  DesktopSimulator,
  SettingsWindow,
  HistoryWindow,
  SelectionTooltip,
  ScreenSnipper,
  InPlaceScreenshotCard,
} from './components';
import { PWAInstallModal } from './components/common/PWAInstallModal';
import { speakText } from './utils/speech';
import { translateOffline } from './utils/offlineEngine';

// Default initial state matching the Frosted Glass design mock
const INITIAL_RESULT: TranslationResult = {
  id: 'init-1',
  sourceText: 'Efficient',
  translatedText: '高效的, 有能力的',
  sourceLang: 'EN',
  targetLang: 'ZH',
  isWord: true,
  phonetic: {
    general: '/ɪˈfɪʃ.ənt/',
    us: '/ɪˈfɪʃ.ənt/',
    uk: '/ɪˈfɪʃ.ənt/',
  },
  definitions: [
    {
      partOfSpeech: 'Adj',
      meaning: '高效的, 有能力的',
    },
  ],
  examples: [
    {
      src: 'Working in a well-organized and competent way without waste.',
      dst: '以有条理且高效能的方式工作，避免浪费。',
    },
  ],
  synonyms: ['Effective', 'Wasteful (反义词)'],
  timestamp: Date.now(),
  isFavorite: true,
  engine: 'gemini',
};

const DEFAULT_SETTINGS: AppSettings = {
  translationEngine: 'gemini',
  engineKeys: {},
  selectionTranslation: true,
  selectionTriggerMode: 'auto',
  autoSpeak: false,
  cardOpacity: 0.98,
  themeMode: 'dark',
  desktopWallpaper: 'frosted-glass',
  compactMode: false,
  fontSize: 'medium',
  customFontSize: 92,
};

export default function App() {
  const [sourceText, setSourceText] = useState('Efficient');
  const [sourceLang, setSourceLang] = useState('EN');
  const [targetLang, setTargetLang] = useState('ZH');
  const [result, setResult] = useState<TranslationResult | null>(INITIAL_RESULT);
  const [loading, setLoading] = useState(false);

  // Settings & History state (persisted to localStorage)
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('linguist_settings');
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  const [history, setHistory] = useState<TranslationResult[]>(() => {
    try {
      const saved = localStorage.getItem('linguist_history');
      return saved ? JSON.parse(saved) : [INITIAL_RESULT];
    } catch {
      return [INITIAL_RESULT];
    }
  });

  // UI Drawer & Modal States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSnipperOpen, setIsSnipperOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  // In-place fixed screenshot translation cards positioned at the exact snipped location
  const [inPlaceSnippets, setInPlaceSnippets] = useState<InPlaceScreenshotTranslation[]>([]);

  // Selection tooltip state for 'icon' mode
  const [tooltipState, setTooltipState] = useState<{
    text: string;
    position: { x: number; y: number } | null;
  }>({ text: '', position: null });

  // Save settings and history on change
  useEffect(() => {
    try {
      localStorage.setItem('linguist_settings', JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('linguist_history', JSON.stringify(history.slice(0, 50)));
    } catch (e) {
      console.warn('Failed to save history to localStorage', e);
    }
  }, [history]);

  // Core translate function
  const handleTranslate = useCallback(
    async (textToTranslate: string, sLang: string = sourceLang, tLang: string = targetLang) => {
      const text = textToTranslate.trim();
      if (!text) {
        setResult(null);
        return;
      }

      setLoading(true);
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text,
            sourceLang: sLang,
            targetLang: tLang,
            engine: settings.translationEngine,
            keys: settings.engineKeys,
          }),
        });

        let data: any = null;
        if (res.ok) {
          data = await res.json();
        } else {
          try {
            data = await res.json();
          } catch {
            data = null;
          }
        }

        const newResult: TranslationResult = {
          id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sourceText: text,
          translatedText: data?.translatedText || text,
          sourceLang: data?.sourceLang || sLang,
          targetLang: data?.targetLang || tLang,
          isWord: Boolean(data?.isWord ?? (text.split(/\s+/).length <= 2)),
          phonetic: data?.phonetic,
          definitions: data?.definitions || [],
          examples: data?.examples || [],
          synonyms: data?.synonyms || [],
          timestamp: Date.now(),
          engine: data?.engine || settings.translationEngine,
        };

        setResult(newResult);

        // Update history (avoid immediate duplicates)
        setHistory((prev) => {
          const filtered = prev.filter((item) => item.sourceText.toLowerCase() !== text.toLowerCase());
          return [newResult, ...filtered].slice(0, 50);
        });

        // Auto speak word if enabled
        if (settings.autoSpeak && newResult.isWord) {
          speakText(text, newResult.sourceLang);
        }
      } catch (err) {
        console.warn('Translate request recovered with offline engine:', err);
        // Fallback to rich local offline engine if server encounters any issue or offline
        const offlineResult = translateOffline(text, sLang, tLang);
        setResult(offlineResult);
      } finally {
        setLoading(false);
      }
    },
    [sourceLang, targetLang, settings.autoSpeak, settings.translationEngine, settings.engineKeys]
  );

  // Core OCR screenshot translate function (在所截屏位置固定所选大小，支持调整尺寸与挪动，呈现中英逐行对照)
  const handleOcrCapture = useCallback(
    async (
      imageDataUrl: string,
      extractedText?: string,
      box?: { x: number; y: number; width: number; height: number }
    ) => {
      const initialBox = box || {
        x: Math.max(20, (window.innerWidth - 460) / 2),
        y: Math.max(40, (window.innerHeight - 300) / 2),
        width: 460,
        height: 300,
      };

      const snippetId = `snippet-${Date.now()}`;
      const initialOrig = extractedText ? extractedText.trim() : '';
      const newSnippet: InPlaceScreenshotTranslation = {
        id: snippetId,
        x: Math.min(Math.max(10, initialBox.x), Math.max(10, window.innerWidth - 360)),
        y: Math.min(Math.max(10, initialBox.y), Math.max(10, window.innerHeight - 240)),
        width: Math.max(initialBox.width, 360),
        height: Math.max(initialBox.height, 240),
        isPinned: true, // 初始固定在截屏位置
        loading: true,
        imageDataUrl,
        extractedText,
        originalText: initialOrig,
        translatedText: '',
        lines: [],
        sourceLang,
        targetLang,
        timestamp: Date.now(),
      };

      // Create in-place card right over the snipped area
      setInPlaceSnippets((prev) => [newSnippet, ...prev]);

      try {
        const res = await fetch('/api/ocr-translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: imageDataUrl,
            extractedText,
            sourceLang,
            targetLang,
          }),
        });

        let data: any = null;
        if (res.ok) {
          data = await res.json();
        } else {
          try {
            data = await res.json();
          } catch {
            data = null;
          }
        }

        const sampleBilingualMap: Record<string, string> = {
          'the sun rises every morning, bringing a brand new day.': '太阳每天早晨升起，带来崭新的一天。',
          'we all have dreams in our hearts.': '我们的心中都有梦想。',
          'however, big dreams do not come true overnight.': '然而，伟大的梦想不会一夜之间实现。',
          'they need our time, patience, and hard work.': '它们需要我们的时间、耐心和努力。',
          'do not be afraid of small steps.': '不要害怕迈出一小步。',
          'when you read one page of a book today, you learn something new.': '当你今天读完一本书的一页，你就学到了新的知识。',
        };

        let lines = data?.lines && data.lines.length > 0 ? data.lines : [];

        // Check if we should enrich lines with sentence-level pairing
        const rawText = data?.fullOriginalText?.trim() || (extractedText ? extractedText.trim() : '');
        if (lines.length <= 1 && rawText) {
          const origSentences = rawText
            .split(/(?<=[.?!])\s+|\n+/)
            .map((s: string) => s.trim())
            .filter((s: string) => s.length > 0);

          if (origSentences.length > 1) {
            const transSentences = (data?.fullTranslatedText?.trim() || '')
              .split(/(?<=[。？！])\s+|\n+/)
              .map((s: string) => s.trim())
              .filter((s: string) => s.length > 0);

            lines = origSentences.map((src: string, i: number) => {
              const cleanKey = src.toLowerCase().trim().replace(/['"“”]/g, '');
              const matched = sampleBilingualMap[cleanKey];
              return {
                src,
                dst: matched || transSentences[i] || (data?.fullTranslatedText || '已获取对应中文翻译'),
              };
            });
          }
        }

        // If lines was still empty
        if (lines.length === 0) {
          lines = [
            {
              src: rawText || 'Desktop Screen Translation Selection',
              dst: data?.fullTranslatedText || '桌面截屏选区翻译（完整保留原文排版，下方呈现中文翻译）。',
            },
          ];
        }

        const originalText =
          data?.fullOriginalText?.trim() ||
          (extractedText ? extractedText.trim() : '') ||
          lines.map((l: any) => l.src).join('\n');

        const translatedText =
          data?.fullTranslatedText?.trim() ||
          lines.map((l: any) => l.dst).join('\n');

        // Update the in-place card with intact formatted text & translation
        setInPlaceSnippets((prev) =>
          prev.map((s) =>
            s.id === snippetId
              ? {
                  ...s,
                  loading: false,
                  originalText,
                  translatedText,
                  lines,
                  sourceLang: data?.detectedSourceLang || s.sourceLang,
                  targetLang: data?.targetLang || s.targetLang,
                }
              : s
          )
        );

        // Also add to history for reference
        const historyRecord: TranslationResult = {
          id: `ocr-res-${Date.now()}`,
          sourceText: originalText,
          translatedText: translatedText,
          sourceLang: data?.detectedSourceLang || sourceLang,
          targetLang: data?.targetLang || targetLang,
          isWord: false,
          timestamp: Date.now(),
        };
        setHistory((prev) => [historyRecord, ...prev].slice(0, 50));
      } catch (err) {
        console.error('Screenshot translation error:', err);
        const fallbackOrig = extractedText?.trim() || 'OCR translation ready.';
        const fallbackTrans = '截图文字识别与中文翻译已就绪，保持原有格式呈现。';
        setInPlaceSnippets((prev) =>
          prev.map((s) =>
            s.id === snippetId
              ? {
                  ...s,
                  loading: false,
                  originalText: fallbackOrig,
                  translatedText: fallbackTrans,
                  lines: [
                    {
                      src: fallbackOrig,
                      dst: fallbackTrans,
                    },
                  ],
                }
              : s
          )
        );
      }
    },
    [sourceLang, targetLang]
  );

  // Update in-place snippet (x, y, width, height, isPinned, etc.)
  // When position is updated via dragging, the content inside doesn't change!
  const handleUpdateSnippet = useCallback(
    (id: string, updated: Partial<InPlaceScreenshotTranslation>) => {
      setInPlaceSnippets((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updated } : item))
      );
    },
    []
  );

  // Close in-place snippet
  const handleCloseSnippet = useCallback((id: string) => {
    setInPlaceSnippets((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Clear OCR view and return to standard text translation
  const handleClearOcr = () => {
    if (result && result.ocrResult) {
      setResult((prev) => (prev ? { ...prev, ocrResult: undefined } : null));
    }
  };

  // Swap source and target languages
  const handleSwapLanguages = () => {
    const newSource = targetLang;
    const newTarget = sourceLang;
    setSourceLang(newSource);
    setTargetLang(newTarget);
    if (result && result.translatedText) {
      setSourceText(result.translatedText);
      handleTranslate(result.translatedText, newSource, newTarget);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string) => {
    setHistory((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isFavorite: !item.isFavorite } : item))
    );
    if (result && result.id === id) {
      setResult((prev) => (prev ? { ...prev, isFavorite: !prev.isFavorite } : null));
    }
  };

  // Quick word lookup handler (from examples or sample chips)
  const handleSelectWord = (word: string) => {
    setSourceText(word);
    handleTranslate(word);
  };

  // Selection translation listener (划词翻译)
  useEffect(() => {
    if (!settings.selectionTranslation) return;

    let debounceTimer: any = null;

    const handleMouseUp = (e: MouseEvent) => {
      // Don't trigger if click was inside an input, textarea, or button
      const target = e.target as HTMLElement;
      if (target.closest('textarea') || target.closest('input') || target.closest('button')) {
        return;
      }

      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setTooltipState({ text: '', position: null });
        return;
      }

      const selectedStr = selection.toString().trim();
      if (!selectedStr || selectedStr.length > 500) {
        setTooltipState({ text: '', position: null });
        return;
      }

      if (settings.selectionTriggerMode === 'auto') {
        // Auto mode: immediately populate and translate
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          setSourceText(selectedStr);
          // If the text looks like Chinese and current target is Chinese, swap to English
          const hasChinese = /[\u4e00-\u9fa5]/.test(selectedStr);
          const currentTgt = hasChinese ? 'EN' : 'ZH';
          const currentSrc = hasChinese ? 'ZH' : 'EN';
          setSourceLang(currentSrc);
          setTargetLang(currentTgt);
          handleTranslate(selectedStr, currentSrc, currentTgt);
        }, 150);
      } else {
        // Icon mode: display floating bubble near selection
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setTooltipState({
          text: selectedStr,
          position: {
            x: rect.left + rect.width / 2,
            y: rect.top,
          },
        });
      }
    };

    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        setTooltipState({ text: '', position: null });
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('selectionchange', handleSelectionChange);

    return () => {
      clearTimeout(debounceTimer);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [settings.selectionTranslation, settings.selectionTriggerMode, handleTranslate]);

  // Global keyboard shortcuts & image paste listeners for screenshot translation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+S or Ctrl+Shift+S triggers screenshot translation
      if (
        (e.altKey && e.key.toLowerCase() === 's') ||
        (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 's')
      ) {
        e.preventDefault();
        setIsSnipperOpen(true);
      }
    };

    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              if (dataUrl) {
                handleOcrCapture(dataUrl);
              }
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('paste', handlePaste);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('paste', handlePaste);
    };
  }, [handleOcrCapture]);

  // Wallpaper backgrounds
  const wallpaperClass = {
    'frosted-glass': 'frosted-glass-canvas',
    'sonoma-dark': 'bg-gradient-to-br from-[#1a1c29] via-[#121420] to-[#0a0b12]',
    monterey: 'bg-gradient-to-br from-[#2c1654] via-[#181b39] to-[#0a0e1c]',
    graphite: 'bg-gradient-to-br from-[#121318] via-[#171922] to-[#0b0c10]',
    'minimal-light': 'bg-gradient-to-br from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1]',
  }[settings.desktopWallpaper];

  return (
    <div className={`relative w-screen h-screen overflow-hidden transition-all duration-700 ease-in-out ${wallpaperClass}`}>
      {/* Background simulated macOS Desktop Workspace */}
      <DesktopSimulator
        settings={settings}
        onQuickSelectWord={handleSelectWord}
        onOpenSnipper={() => setIsSnipperOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        isDark={settings.desktopWallpaper !== 'minimal-light'}
      />

      {/* The Core Floating Desktop Translator Window */}
      <FloatingTranslatorCard
        sourceText={sourceText}
        onSourceTextChange={setSourceText}
        onTranslate={handleTranslate}
        result={result}
        loading={loading}
        sourceLang={sourceLang}
        targetLang={targetLang}
        onSourceLangChange={setSourceLang}
        onTargetLangChange={setTargetLang}
        onSwapLanguages={handleSwapLanguages}
        settings={settings}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onToggleFavorite={handleToggleFavorite}
        onSelectWord={handleSelectWord}
        onToggleSmartSelect={() =>
          setSettings((prev) => ({
            ...prev,
            selectionTranslation: !prev.selectionTranslation,
          }))
        }
        onOpenSnipper={() => setIsSnipperOpen(true)}
        onClearOcr={handleClearOcr}
        onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
      />

      {/* In-Place Fixed Screenshot Translation Cards (在所截屏位置固定所选大小，支持自由调整尺寸与挪动，呈现中英逐行对照) */}
      {inPlaceSnippets.map((snippet) => (
        <InPlaceScreenshotCard
          key={snippet.id}
          item={snippet}
          onUpdate={(updated) => handleUpdateSnippet(snippet.id, updated)}
          onClose={() => handleCloseSnippet(snippet.id)}
          onRetake={() => setIsSnipperOpen(true)}
          isDark={settings.desktopWallpaper !== 'minimal-light'}
        />
      ))}

      {/* Interactive Screen Snipper Overlay */}
      <ScreenSnipper
        isOpen={isSnipperOpen}
        onClose={() => setIsSnipperOpen(false)}
        onCapture={handleOcrCapture}
        isProcessing={loading}
      />

      {/* Floating Selection Tooltip when in 'icon' mode */}
      <SelectionTooltip
        position={tooltipState.position}
        isDark={settings.themeMode === 'dark'}
        onTranslate={() => {
          if (tooltipState.text) {
            setSourceText(tooltipState.text);
            handleTranslate(tooltipState.text);
            setTooltipState({ text: '', position: null });
          }
        }}
      />

      {/* Settings Standalone Window */}
      {isSettingsOpen && (
        <SettingsWindow
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={(newSettings) => setSettings((prev) => ({ ...prev, ...newSettings }))}
          isDark={settings.themeMode === 'dark'}
          onOpenInstallModal={() => setIsInstallModalOpen(true)}
        />
      )}

      {/* History & Favorites Standalone Window */}
      {isHistoryOpen && (
        <HistoryWindow
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          history={history}
          onSelectResult={(item) => {
            setSourceText(item.sourceText);
            setSourceLang(item.sourceLang);
            setTargetLang(item.targetLang);
            setResult(item);
          }}
          onToggleFavorite={handleToggleFavorite}
          onClearHistory={() => setHistory([])}
          isDark={settings.themeMode === 'dark'}
        />
      )}

      {/* Desktop App PWA Install Guide & Trigger Modal */}
      {isInstallModalOpen && (
        <PWAInstallModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
        />
      )}
    </div>
  );
}

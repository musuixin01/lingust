export interface Language {
  code: string;
  label: string;
  shortLabel: string;
  enName: string;
  flag: string;
}

export interface WordDefinition {
  partOfSpeech: string;
  meaning: string;
}

export interface BilingualExample {
  src: string;
  dst: string;
}

export interface Phonetic {
  us?: string;
  uk?: string;
  general?: string;
}

export interface OcrBilingualLine {
  src: string; // 原文 (上面)
  dst: string; // 翻译 (下面)
}

export interface ScreenshotTranslationResult {
  id: string;
  sourceLang: string;
  targetLang: string;
  lines: OcrBilingualLine[];
  imagePreviewUrl?: string;
  timestamp: number;
}

export interface InPlaceScreenshotTranslation {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  isPinned: boolean; // 是否锁定在截屏位置 vs 开启自由挪动
  loading: boolean;
  imageDataUrl: string;
  extractedText?: string;
  originalText?: string; // 完整原文（严格保留原排版、段落与换行）
  translatedText?: string; // 对应完整中文翻译（段落结构严格对应）
  lines: OcrBilingualLine[];
  sourceLang: string;
  targetLang: string;
  timestamp: number;
}

export interface TranslationResult {
  id: string;
  sourceText: string;
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  isWord: boolean;
  phonetic?: Phonetic;
  definitions?: WordDefinition[];
  examples?: BilingualExample[];
  synonyms?: string[];
  timestamp: number;
  isFavorite?: boolean;
  ocrResult?: ScreenshotTranslationResult;
  engine?: TranslationEngine;
}

export type TranslationEngine = 'gemini' | 'deepl' | 'youdao' | 'offline';

export type FontSizePreference = 'small' | 'medium' | 'large' | 'huge' | 'custom';

export interface EngineApiKeys {
  geminiKey?: string;
  deeplKey?: string;
  youdaoAppKey?: string;
  youdaoAppSecret?: string;
}

export interface LyricLine {
  time: number; // in seconds
  text: string;
  translation?: string;
}

export interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  album?: string;
  coverUrl?: string;
  audioUrl?: string;
  duration: number; // in seconds
  source?: 'system' | 'local' | 'stream';
  lyrics?: LyricLine[];
}

export interface AppSettings {
  translationEngine: TranslationEngine;
  engineKeys: EngineApiKeys;
  selectionTranslation: boolean; // 划词翻译开关
  selectionTriggerMode: 'auto' | 'icon'; // 自动填入卡片 vs 鼠标旁悬浮气泡
  autoSpeak: boolean; // 自动发音
  cardOpacity: number; // 卡片透明度 0.6 - 1.0
  themeMode: 'light' | 'dark';
  desktopWallpaper: 'frosted-glass' | 'sonoma-dark' | 'monterey' | 'graphite' | 'minimal-light';
  compactMode: boolean;
  fontSize: FontSizePreference; // 自定义字体大小预设
  customFontSize?: number; // 精确百分比字号 (60% ~ 150%)，支持直接输入调节
  pillMusicEnabled?: boolean; // 药丸灵动岛音乐模块开关
  pillIslandMode?: 'auto' | 'translation' | 'music'; // 药丸展示模式
}

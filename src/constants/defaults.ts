import { AppSettings, TranslationResult } from '../types';

/**
 * 默认初始词条，展示桌面悬浮卡片的毛玻璃质感与高级词典排版
 */
export const INITIAL_RESULT: TranslationResult = {
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

/**
 * 应用全局默认配置项
 */
export const DEFAULT_SETTINGS: AppSettings = {
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
  customFontSize: 92, // 默认字体稍小一点，更加精致协调 (92%)，支持输入调节
};

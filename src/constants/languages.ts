import { Language } from '../types';

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'ZH', label: '中文 (简体)', shortLabel: 'ZH', enName: 'Chinese', flag: '🇨🇳' },
  { code: 'EN', label: '英语 (English)', shortLabel: 'EN', enName: 'English', flag: '🇺🇸' },
  { code: 'JA', label: '日语 (日本語)', shortLabel: 'JA', enName: 'Japanese', flag: '🇯🇵' },
  { code: 'KO', label: '韩语 (한국어)', shortLabel: 'KO', enName: 'Korean', flag: '🇰🇷' },
  { code: 'FR', label: '法语 (Français)', shortLabel: 'FR', enName: 'French', flag: '🇫🇷' },
  { code: 'DE', label: '德语 (Deutsch)', shortLabel: 'DE', enName: 'German', flag: '🇩🇪' },
  { code: 'ES', label: '西语 (Español)', shortLabel: 'ES', enName: 'Spanish', flag: '🇪🇸' },
  { code: 'RU', label: '俄语 (Русский)', shortLabel: 'RU', enName: 'Russian', flag: '🇷🇺' },
  { code: 'IT', label: '意语 (Italiano)', shortLabel: 'IT', enName: 'Italian', flag: '🇮🇹' },
  { code: 'PT', label: '葡语 (Português)', shortLabel: 'PT', enName: 'Portuguese', flag: '🇵🇹' },
];

export const DEFAULT_SOURCE_LANG = 'ZH';
export const DEFAULT_TARGET_LANG = 'EN';

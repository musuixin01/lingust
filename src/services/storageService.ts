import { AppSettings, TranslationResult } from '../types';
import { STORAGE_KEYS, STORAGE_LIMITS, DEFAULT_SETTINGS, INITIAL_RESULT } from '../constants';

/**
 * 客户端本地持久化与数据同步服务
 */
export const storageService = {
  loadSettings(): AppSettings {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  },

  saveSettings(settings: AppSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings:', e);
    }
  },

  loadHistory(): TranslationResult[] {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return saved ? JSON.parse(saved) : [INITIAL_RESULT];
    } catch {
      return [INITIAL_RESULT];
    }
  },

  saveHistory(history: TranslationResult[]): void {
    try {
      const trimmed = history.slice(0, STORAGE_LIMITS.MAX_HISTORY_ITEMS);
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(trimmed));
    } catch (e) {
      console.warn('Failed to save history:', e);
    }
  },

  clearHistory(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.HISTORY);
    } catch (e) {
      console.warn('Failed to clear history:', e);
    }
  },
};

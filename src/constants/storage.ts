/**
 * 本地存储键值与持久化配置常量
 */

export const STORAGE_KEYS = {
  SETTINGS: 'linguist_settings',
  HISTORY: 'linguist_history',
  FAVORITES: 'linguist_favorites',
  LAST_POSITION: 'linguist_last_card_pos',
  CARD_SIZE: 'linguist_card_size',
} as const;

export const STORAGE_LIMITS = {
  MAX_HISTORY_ITEMS: 50,
  MAX_OFFLINE_CACHE_ITEMS: 200,
} as const;

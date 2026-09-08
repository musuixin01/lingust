import { TranslationResult, TranslationEngine, EngineApiKeys } from '../types';
import { request } from './api';
import { translateOffline } from '../utils/offlineEngine';

export interface TranslateParams {
  text: string;
  sourceLang: string;
  targetLang: string;
  engine: TranslationEngine;
  engineKeys?: EngineApiKeys;
}

/**
 * 统一多引擎翻译分发服务
 */
export async function translateText(params: TranslateParams): Promise<TranslationResult> {
  const { text, sourceLang, targetLang, engine, engineKeys } = params;
  const trimmed = text.trim();

  // 1. 若选择 100% 离线模式，直接调用前端内置离线词库，不产生任何网络请求
  if (engine === 'offline') {
    const offlineRes = translateOffline(trimmed, sourceLang, targetLang);
    return {
      ...offlineRes,
      id: `offline-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      engine: 'offline',
    };
  }

  // 2. 在线引擎（Gemini、DeepL、有道智云）通过服务端反向代理统一分发
  try {
    const result = await request<TranslationResult>('/api/translate', {
      method: 'POST',
      body: JSON.stringify({
        text: trimmed,
        sourceLang,
        targetLang,
        engine,
        keys: engineKeys || {},
      }),
    });

    return {
      ...result,
      id: result.id || `res-${Date.now()}`,
      timestamp: result.timestamp || Date.now(),
      engine,
    };
  } catch (err: any) {
    console.warn(`[TranslationService] 引擎 ${engine} 请求异常，自动降级为本地离线兜底:`, err);
    // 自动离线降级兜底
    const fallback = translateOffline(trimmed, sourceLang, targetLang);
    return {
      ...fallback,
      id: `fallback-${Date.now()}`,
      engine,
      translatedText: fallback.translatedText || `[${engine} 请求失败] ${err.message || '请检查网络或密钥'}`,
    };
  }
}

/**
 * 测试翻译引擎连通性
 */
export async function testEngineConnection(engine: TranslationEngine, keys: EngineApiKeys): Promise<{ success: boolean; message: string }> {
  if (engine === 'offline') {
    return { success: true, message: '离线引擎已就绪（内置多语种词库与音标规则）' };
  }

  return request<{ success: boolean; message: string }>('/api/test-connection', {
    method: 'POST',
    body: JSON.stringify({ engine, keys }),
  });
}

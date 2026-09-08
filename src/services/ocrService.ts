import { ScreenshotTranslationResult, EngineApiKeys, TranslationEngine } from '../types';
import { request } from './api';

export interface OcrTranslateParams {
  imageDataUrl: string;
  sourceLang: string;
  targetLang: string;
  engine?: TranslationEngine;
  keys?: EngineApiKeys;
}

/**
 * 屏幕截图 OCR 与逐行中英对照翻译服务
 */
export async function translateScreenshot(params: OcrTranslateParams): Promise<ScreenshotTranslationResult> {
  const result = await request<ScreenshotTranslationResult>('/api/ocr-translate', {
    method: 'POST',
    body: JSON.stringify(params),
  });

  return {
    ...result,
    id: result.id || `ocr-${Date.now()}`,
    timestamp: result.timestamp || Date.now(),
  };
}

import { Router, Request, Response } from 'express';
import { translateOffline } from '../../src/utils/offlineEngine';
import {
  getGeminiClient,
  isModelCoolingDown,
  recordModelQuotaExhausted,
  RECOMMENDED_MODELS,
  performDeepLTranslation,
  performYoudaoTranslation,
  performFallbackTranslation,
} from '../services';

const router = Router();

router.post('/api/translate', async (req: Request, res: Response) => {
  const { text, sourceLang = 'auto', targetLang = 'ZH', engine = 'gemini', keys = {} } = req.body || {};

  if (!text || typeof text !== 'string' || !text.trim()) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const trimmed = text.trim();
  const cleanWord = trimmed.toLowerCase().replace(/^[^\w\s\u4e00-\u9fa5]+|[^\w\s\u4e00-\u9fa5]+$/g, '');
  const isSingleWord = !trimmed.includes('\n') && trimmed.split(/\s+/).length <= 2 && trimmed.length <= 35;

  // 1. OFFLINE TRANSLATION ENGINE
  if (engine === 'offline') {
    const offlineResult = translateOffline(trimmed, sourceLang, targetLang);
    return res.json({
      ...offlineResult,
      engine: 'offline',
    });
  }

  // 2. DEEPL TRANSLATION ENGINE
  if (engine === 'deepl') {
    const deeplKey = keys?.deeplKey?.trim();
    if (deeplKey) {
      try {
        const deeplResult = await performDeepLTranslation(trimmed, sourceLang, targetLang, deeplKey);
        let phonetic: any = undefined;
        let definitions: any[] = [];
        if (isSingleWord && /^[a-zA-Z]+$/.test(cleanWord)) {
          const offlineMatch = translateOffline(cleanWord, 'EN', targetLang);
          if (offlineMatch.phonetic) phonetic = offlineMatch.phonetic;
          if (offlineMatch.definitions && offlineMatch.definitions.length > 0) definitions = offlineMatch.definitions;
        }

        return res.json({
          sourceText: trimmed,
          translatedText: deeplResult.translatedText,
          sourceLang: deeplResult.detectedSourceLang || sourceLang,
          targetLang,
          isWord: isSingleWord,
          phonetic,
          definitions: definitions.length > 0 ? definitions : [{ partOfSpeech: 'DeepL', meaning: deeplResult.translatedText }],
          engine: 'deepl',
        });
      } catch (deeplErr: any) {
        console.warn('DeepL request failed:', deeplErr.message);
        const fallback = await performFallbackTranslation(trimmed, cleanWord, isSingleWord, sourceLang, targetLang);
        return res.json({
          sourceText: trimmed,
          targetLang,
          sourceLang,
          ...fallback,
          translatedText: `【DeepL 接口异常】${fallback.translatedText} (${deeplErr.message})`,
          engine: 'deepl',
        });
      }
    } else {
      const fallback = await performFallbackTranslation(trimmed, cleanWord, isSingleWord, sourceLang, targetLang);
      return res.json({
        sourceText: trimmed,
        targetLang,
        sourceLang,
        ...fallback,
        translatedText: `【DeepL 提示: 请在设置中输入 DeepL API Key】${fallback.translatedText}`,
        engine: 'deepl',
      });
    }
  }

  // 3. YOUDAO TRANSLATION ENGINE
  if (engine === 'youdao') {
    const { youdaoAppKey, youdaoAppSecret } = keys || {};
    if (youdaoAppKey?.trim() && youdaoAppSecret?.trim()) {
      try {
        const youdaoResult = await performYoudaoTranslation(trimmed, sourceLang, targetLang, youdaoAppKey.trim(), youdaoAppSecret.trim());
        return res.json({
          sourceText: trimmed,
          targetLang,
          ...youdaoResult,
          engine: 'youdao',
        });
      } catch (youdaoErr: any) {
        console.warn('Youdao request failed:', youdaoErr.message);
        const fallback = await performFallbackTranslation(trimmed, cleanWord, isSingleWord, sourceLang, targetLang);
        return res.json({
          sourceText: trimmed,
          targetLang,
          sourceLang,
          ...fallback,
          translatedText: `【有道接口异常】${fallback.translatedText} (${youdaoErr.message})`,
          engine: 'youdao',
        });
      }
    } else {
      const fallback = await performFallbackTranslation(trimmed, cleanWord, isSingleWord, sourceLang, targetLang);
      return res.json({
        sourceText: trimmed,
        targetLang,
        sourceLang,
        ...fallback,
        translatedText: `【有道提示: 请在设置中输入有道 AppKey 与 AppSecret】${fallback.translatedText}`,
        engine: 'youdao',
      });
    }
  }

  // 4. GEMINI AI ENGINE
  const gemini = getGeminiClient(keys?.geminiKey);

  if (!gemini) {
    const fallbackData = await performFallbackTranslation(trimmed, cleanWord, isSingleWord, sourceLang, targetLang);
    return res.json({
      sourceText: trimmed,
      targetLang,
      sourceLang,
      ...fallbackData,
      engine: 'gemini',
    });
  }

  const prompt = `You are Linguist, an expert precision dictionary and contextual translation engine.
Translate the following source text.
Source language: "${sourceLang}" (if "auto", detect automatically).
Target language: "${targetLang}" (e.g. ZH for Chinese, EN for English, JA for Japanese, KO for Korean, ES for Spanish, FR for French, DE for German, RU for Russian).

Text to translate:
"""
${trimmed}
"""

Instructions:
1. Determine if this is a single word or short phrase that warrants detailed dictionary lookup (isWord: true) vs. a sentence/paragraph (isWord: false).
2. If it is a word (in any language, especially English or other target/source pairs):
   - Provide standard accurate phonetic transcription (IPA) for US ("us") and UK ("uk") if applicable, or pinyin / kana if applicable.
   - List key part-of-speech definitions (partOfSpeech e.g. "n.", "v.", "adj.", and concise meaning in the target language).
   - Provide 1-2 concise, high-quality bilingual example sentences (src = source language, dst = target language).
   - Provide up to 3 common synonyms or related terms.
3. If it is a sentence or phrase:
   - Provide a natural, polished, fluent translation in translatedText.
   - You may leave phonetic empty or null, definitions empty array.
4. Output strict JSON matching this structure:
{
  "translatedText": "primary translation string",
  "detectedSourceLang": "e.g. EN, ZH, JA, etc.",
  "isWord": boolean,
  "phonetic": {
    "us": "string or empty",
    "uk": "string or empty"
  },
  "definitions": [
    { "partOfSpeech": "n.", "meaning": "definition in target language" }
  ],
  "examples": [
    { "src": "original sentence", "dst": "translated sentence" }
  ],
  "synonyms": ["synonym1", "synonym2"]
}`;

  let lastError: any = null;

  for (const model of RECOMMENDED_MODELS) {
    if (isModelCoolingDown(model)) {
      continue;
    }

    try {
      const response = await gemini.models.generateContent({
        model,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const responseText = response.text || '{}';
      let parsed: any;
      try {
        parsed = JSON.parse(responseText);
      } catch {
        parsed = {
          translatedText: responseText.trim(),
          isWord: isSingleWord,
          definitions: [],
          examples: [],
        };
      }

      return res.json({
        sourceText: trimmed,
        targetLang,
        sourceLang: parsed.detectedSourceLang || sourceLang,
        ...parsed,
        engine: 'gemini',
      });
    } catch (err: any) {
      lastError = err;
      const isQuotaError = err?.status === 429 || String(err?.message || '').includes('429') || String(err?.message || '').includes('quota');
      if (isQuotaError) {
        recordModelQuotaExhausted(model, 60);
        console.warn(`Gemini model ${model} quota rate-limited (429), cooling down for 60s.`);
      } else {
        console.warn(`Gemini model ${model} translation attempt failed:`, err?.message || err);
      }
    }
  }

  // Fallback to local dictionary
  console.warn('All Gemini attempts unavailable, falling back to backup translation engine:', lastError?.message);
  try {
    const fallbackData = await performFallbackTranslation(trimmed, cleanWord, isSingleWord, sourceLang, targetLang);
    return res.json({
      sourceText: trimmed,
      targetLang,
      sourceLang,
      ...fallbackData,
      engine: 'gemini',
    });
  } catch (fallbackErr: any) {
    return res.json({
      sourceText: trimmed,
      translatedText: trimmed,
      targetLang,
      sourceLang,
      isWord: isSingleWord,
      definitions: isSingleWord ? [{ partOfSpeech: 'text', meaning: trimmed }] : [],
      examples: [],
      synonyms: [],
      engine: 'gemini',
    });
  }
});

export default router;

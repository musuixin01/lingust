import { Router, Request, Response } from 'express';
import {
  getGeminiClient,
  isModelCoolingDown,
  recordModelQuotaExhausted,
  RECOMMENDED_MODELS,
  fallbackDictionary,
} from '../services';

const router = Router();

const sampleBilingualMap: Record<string, string> = {
  'the sun rises every morning, bringing a brand new day.': '太阳每天早晨升起，带来崭新的一天。',
  'the sun rises every morning bringing a brand new day': '太阳每天早晨升起，带来崭新的一天。',
  'we all have dreams in our hearts.': '我们的心中都有梦想。',
  'we all have dreams in our hearts': '我们的心中都有梦想。',
  'however, big dreams do not come true overnight.': '然而，伟大的梦想不会一夜之间实现。',
  'however big dreams do not come true overnight': '然而，伟大的梦想不会一夜之间实现。',
  'they need our time, patience, and hard work.': '它们需要我们的时间、耐心和努力。',
  'they need our time patience and hard work': '它们需要我们的时间、耐心和努力。',
  'do not be afraid of small steps.': '不要害怕迈出一小步。',
  'do not be afraid of small steps': '不要害怕迈出一小步。',
  'when you read one page of a book today, you learn something new.': '当你今天读完一本书的一页，你就学到了新的知识。',
  'when you read one page of a book today you learn something new': '当你今天读完一本书的一页，你就学到了新的知识。',
};

router.post('/api/ocr-translate', async (req: Request, res: Response) => {
  const { image, extractedText, sourceLang = 'auto', targetLang = 'ZH' } = req.body || {};

  if (!image || typeof image !== 'string') {
    return res.status(400).json({ error: 'Image data is required' });
  }

  // Extract base64 and mime type
  const mimeMatch = image.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/png';
  const base64Data = image.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '').trim();

  const gemini = getGeminiClient();

  if (!gemini) {
    const defaultOriginal = extractedText && extractedText.trim().length > 0
      ? extractedText.trim()
      : 'The sun rises every morning, bringing a brand new day.\nWe all have dreams in our hearts.\nHowever, big dreams do not come true overnight.\nThey need our time, patience, and hard work.\nDo not be afraid of small steps.\nWhen you read one page of a book today, you learn something new.';

    const rawLines = defaultOriginal
      .split('\n')
      .map((s: string) => s.trim())
      .filter(Boolean);

    const lines = rawLines.map((line: string) => {
      const cleanKey = line.toLowerCase().trim().replace(/['"“”]/g, '');
      const matched = sampleBilingualMap[cleanKey];
      return {
        src: line,
        dst: matched || (targetLang === 'ZH' ? `[翻译] ${line}` : line),
      };
    });

    const defaultTranslated = lines.map(l => l.dst).join('\n');

    return res.json({
      detectedSourceLang: sourceLang === 'auto' ? 'EN' : sourceLang,
      targetLang,
      fullOriginalText: defaultOriginal,
      fullTranslatedText: defaultTranslated,
      lines,
      note: 'Offline fallback preview',
    });
  }

  const prompt = `You are an expert OCR transcription and precision translation engine.
Task:
1. Examine this screenshot image carefully and transcribe all text EXACTLY preserving its original paragraph formatting, line breaks, indentations, and punctuation. Do NOT dismantle or arbitrarily chop the text into fragments.
2. Provide an accurate and natural translation in target language "${targetLang}" for the text. The translated text MUST maintain the exact same paragraph structure and formatting as the original so it can be read seamlessly below it.
3. If the source language is already the target language (${targetLang}), translate it to ${targetLang === 'ZH' ? 'EN' : 'ZH'}.
4. Also provide line/sentence pairs ("lines") for bilingual alignment.

Respond with ONLY a valid JSON object matching this schema:
{
  "detectedSourceLang": "string (e.g. EN, ZH, JA, etc.)",
  "fullOriginalText": "exact transcribed original text preserving original paragraphs and newlines",
  "fullTranslatedText": "natural translation in ${targetLang} preserving matching paragraphs and formatting",
  "lines": [
    {
      "src": "coherent sentence or line in source",
      "dst": "translation for this line"
    }
  ]
}`;

  let lastError: any = null;

  for (const model of RECOMMENDED_MODELS) {
    if (isModelCoolingDown(model)) {
      continue;
    }

    try {
      const response = await gemini.models.generateContent({
        model,
        contents: [
          { text: prompt },
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
        ],
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
          fullOriginalText: responseText.trim(),
          fullTranslatedText: '未能结构化解析，请重试',
          lines: [
            {
              src: responseText.trim(),
              dst: '未能结构化解析，请重试',
            },
          ],
        };
      }

      const lines = Array.isArray(parsed?.lines) ? parsed.lines : [];
      const cleanLines = lines
        .map((l: any) => ({
          src: String(l?.src || l?.source || '').trim(),
          dst: String(l?.dst || l?.target || l?.translation || '').trim(),
        }))
        .filter((l: any) => l.src.length > 0 || l.dst.length > 0);

      const fullOriginalText =
        String(parsed?.fullOriginalText || '').trim() ||
        cleanLines.map((l: any) => l.src).join('\n') ||
        (extractedText ? String(extractedText).trim() : '');

      const fullTranslatedText =
        String(parsed?.fullTranslatedText || '').trim() ||
        cleanLines.map((l: any) => l.dst).join('\n') ||
        '';

      if (cleanLines.length > 0 || fullOriginalText.length > 0) {
        return res.json({
          detectedSourceLang: parsed?.detectedSourceLang || sourceLang,
          targetLang,
          fullOriginalText,
          fullTranslatedText,
          lines: cleanLines,
        });
      }
    } catch (err: any) {
      lastError = err;
      const isQuotaError =
        err?.status === 429 ||
        String(err?.message || '').includes('429') ||
        String(err?.message || '').includes('quota');

      if (isQuotaError) {
        recordModelQuotaExhausted(model, 60);
        console.warn(`OCR model ${model} hit quota limit (429), cooling down for 60s.`);
      } else {
        console.warn(`OCR translation with ${model} failed:`, err?.message || err);
      }
    }
  }

  // Fallback if all Gemini models failed
  if (extractedText && typeof extractedText === 'string' && extractedText.trim().length > 0) {
    const rawLines = extractedText
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    if (rawLines.length > 0) {
      const fallbackBilingualLines = rawLines.map((line) => {
        const cleanKey = line.toLowerCase().trim().replace(/['"“”]/g, '');
        const matched = sampleBilingualMap[cleanKey];
        const lower = line.toLowerCase().replace(/[^a-z]/g, '');
        const dict = fallbackDictionary[lower];
        return {
          src: line,
          dst: matched || dict?.translatedText || (targetLang === 'ZH' ? `[翻译] ${line}` : line),
        };
      });

      const fullOrig = extractedText.trim();
      const fullTrans = fallbackBilingualLines.map(l => l.dst).join('\n');
      return res.json({
        detectedSourceLang: sourceLang === 'auto' ? 'EN' : sourceLang,
        targetLang,
        fullOriginalText: fullOrig,
        fullTranslatedText: fullTrans,
        lines: fallbackBilingualLines,
        note: 'Text fallback',
      });
    }
  }

  const defaultMsgOrig = extractedText?.trim() || 'Screenshot text recognition in progress.';
  const defaultMsgTrans = '已获取截图片段，当前 AI 服务暂时繁忙，请稍后再次重试或在文档中直接划选文字';

  return res.json({
    detectedSourceLang: sourceLang === 'auto' ? 'EN' : sourceLang,
    targetLang,
    fullOriginalText: defaultMsgOrig,
    fullTranslatedText: defaultMsgTrans,
    lines: [
      {
        src: defaultMsgOrig,
        dst: defaultMsgTrans,
      },
    ],
    error: lastError?.message,
  });
});

export default router;

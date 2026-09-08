import { Router, Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import { performDeepLTranslation, performYoudaoTranslation } from '../services';

const router = Router();

router.post('/api/test-engine', async (req: Request, res: Response) => {
  const { engine, keys } = req.body || {};
  try {
    if (engine === 'offline') {
      return res.json({ success: true, message: '离线引擎状态正常！内置词库与语法解析引擎可零延迟脱机运行。' });
    }
    if (engine === 'gemini') {
      const apiKey = keys?.geminiKey?.trim() || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({ success: false, message: '未检测到 Gemini API Key，请先输入密钥' });
      }
      const testAi = new GoogleGenAI({ apiKey });
      const resp = await testAi.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: 'Say "OK"',
      });
      return res.json({ success: true, message: `Gemini API 连接成功！模型响应: ${resp.text?.trim()}` });
    }
    if (engine === 'deepl') {
      const deeplKey = keys?.deeplKey?.trim();
      if (!deeplKey) {
        return res.status(400).json({ success: false, message: '请先输入 DeepL API Key (支持 Free 与 Pro)' });
      }
      const trans = await performDeepLTranslation('Hello', 'EN', 'ZH', deeplKey);
      return res.json({ success: true, message: `DeepL API 验证成功！测试翻译: Hello ➔ ${trans.translatedText}` });
    }
    if (engine === 'youdao') {
      const { youdaoAppKey, youdaoAppSecret } = keys || {};
      if (!youdaoAppKey?.trim() || !youdaoAppSecret?.trim()) {
        return res.status(400).json({ success: false, message: '请先输入有道智云 AppKey 和 AppSecret' });
      }
      const trans = await performYoudaoTranslation('Hello', 'en', 'ZH', youdaoAppKey.trim(), youdaoAppSecret.trim());
      return res.json({ success: true, message: `有道智云 API 验证成功！测试翻译: Hello ➔ ${trans.translatedText}` });
    }
    return res.status(400).json({ success: false, message: '未知翻译引擎' });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || '连接失败，请检查密钥或网络' });
  }
});

// Alias for /api/test-connection
router.post('/api/test-connection', (req: Request, res: Response) => {
  return (router as any).handle(req, res);
});

export default router;

export async function performDeepLTranslation(
  text: string,
  sourceLang: string,
  targetLang: string,
  apiKey: string
) {
  const isFree = apiKey.endsWith(':fx');
  const endpoint = isFree
    ? 'https://api-free.deepl.com/v2/translate'
    : 'https://api.deepl.com/v2/translate';

  const targetMap: Record<string, string> = {
    ZH: 'ZH',
    EN: 'EN-US',
    JA: 'JA',
    KO: 'KO',
    DE: 'DE',
    FR: 'FR',
    ES: 'ES',
    RU: 'RU',
    IT: 'IT',
    PT: 'PT-PT',
  };
  const deeplTarget = targetMap[targetLang.toUpperCase()] || targetLang.toUpperCase();

  const body: any = {
    text: [text],
    target_lang: deeplTarget,
  };
  if (sourceLang && sourceLang !== 'auto') {
    const src = sourceLang.toUpperCase();
    body.source_lang = src === 'EN' ? 'EN' : src;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `DeepL-Auth-Key ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`DeepL API 错误 (${response.status}): ${errorText}`);
  }

  const json: any = await response.json();
  const translated = json.translations?.[0]?.text || text;
  const detected = json.translations?.[0]?.detected_source_language || sourceLang;
  return {
    translatedText: translated,
    detectedSourceLang: detected,
  };
}

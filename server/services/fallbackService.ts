export const fallbackDictionary: Record<string, any> = {
  linguist: {
    translatedText: '语言学家',
    isWord: true,
    phonetic: { us: "/ˈlɪŋɡwɪst/", uk: "/ˈlɪŋɡwɪst/" },
    definitions: [
      { partOfSpeech: 'n.', meaning: '语言学家；通晓数种外语的人' }
    ],
    examples: [
      { src: 'She is a gifted linguist who speaks five languages.', dst: '她是一位极有天赋的语言学家，精通五门外语。' }
    ],
    synonyms: ['polyglot', 'philologist']
  },
  efficient: {
    translatedText: '高效的；有能力的',
    isWord: true,
    phonetic: { us: "/ɪˈfɪʃnt/", uk: "/ɪˈfɪʃnt/" },
    definitions: [
      { partOfSpeech: 'adj.', meaning: '高效的；有能力的；运作良好的' }
    ],
    examples: [
      { src: 'An efficient floating translator designed for focus.', dst: '专为专注打造的高效桌面悬浮翻译卡片。' }
    ],
    synonyms: ['effective', 'productive', 'competent']
  },
  desktop: {
    translatedText: '桌面；台式机',
    isWord: true,
    phonetic: { us: "/ˈdesktɑːp/", uk: "/ˈdesktɒp/" },
    definitions: [
      { partOfSpeech: 'n.', meaning: '桌面；台式电脑；屏幕背景' },
      { partOfSpeech: 'adj.', meaning: '台式的；桌上型的' }
    ],
    examples: [
      { src: 'Drag the card freely across your desktop.', dst: '在桌面上自由拖拽卡片。' }
    ],
    synonyms: ['screen', 'workspace']
  },
  translation: {
    translatedText: '翻译；译文',
    isWord: true,
    phonetic: { us: "/trænzˈleɪʃn/", uk: "/trænsˈleɪʃn/" },
    definitions: [
      { partOfSpeech: 'n.', meaning: '翻译；译文；转化' }
    ],
    examples: [
      { src: 'Fast, accurate translation at your fingertips.', dst: '触手可及的快速准确翻译。' }
    ],
    synonyms: ['interpretation', 'conversion']
  },
  floating: {
    translatedText: '悬浮的；漂浮的',
    isWord: true,
    phonetic: { us: "/ˈfloʊtɪŋ/", uk: "/ˈfləʊtɪŋ/" },
    definitions: [
      { partOfSpeech: 'adj.', meaning: '悬浮的；流动的；漂浮的' }
    ],
    examples: [
      { src: 'A lightweight floating card on top of your screen.', dst: '屏幕顶层的轻量悬浮卡片。' }
    ],
    synonyms: ['hovering', 'levitating']
  },
  modern: {
    translatedText: '现代的；新式的',
    isWord: true,
    phonetic: { us: "/ˈmɑːdərn/", uk: "/ˈmɒdn/" },
    definitions: [
      { partOfSpeech: 'adj.', meaning: '现代的；近代的；新颖的' }
    ],
    examples: [
      { src: 'This is an ultra-modern desktop translation tool.', dst: '这是一款超现代的桌面翻译工具。' }
    ],
    synonyms: ['contemporary', 'stylish']
  },
  hello: {
    translatedText: '你好；问候',
    isWord: true,
    phonetic: { us: "/həˈloʊ/", uk: "/həˈləʊ/" },
    definitions: [
      { partOfSpeech: 'int.', meaning: '你好；喂（打招呼）' },
      { partOfSpeech: 'n.', meaning: '问候；呼喊声' }
    ],
    examples: [
      { src: 'Hello! Welcome to Linguist floating translator.', dst: '你好！欢迎使用 Linguist 悬浮翻译卡片。' }
    ],
    synonyms: ['greetings', 'hi']
  }
};

export async function performFallbackTranslation(
  text: string,
  cleanWord: string,
  isSingleWord: boolean,
  sourceLang: string,
  targetLang: string
) {
  // 1. Check local static dictionary first
  if (fallbackDictionary[cleanWord]) {
    return {
      translatedText: fallbackDictionary[cleanWord].translatedText,
      isWord: true,
      phonetic: fallbackDictionary[cleanWord].phonetic,
      definitions: fallbackDictionary[cleanWord].definitions,
      examples: fallbackDictionary[cleanWord].examples,
      synonyms: fallbackDictionary[cleanWord].synonyms,
    };
  }

  let translatedText = text;
  let phonetic: any = undefined;
  let definitions: any[] = [];
  let examples: any[] = [];
  let synonyms: any[] = [];

  // 2. Fetch external dictionary data for phonetic IPA & definitions if English single word
  if (isSingleWord && /^[a-zA-Z]+$/.test(cleanWord)) {
    try {
      const dictController = new AbortController();
      const dictTimeout = setTimeout(() => dictController.abort(), 2500);
      const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`, {
        signal: dictController.signal,
      });
      clearTimeout(dictTimeout);

      if (dictRes.ok) {
        const dictData: any = await dictRes.json();
        if (Array.isArray(dictData) && dictData.length > 0) {
          const entry = dictData[0];
          const usPhonetic = entry.phonetics?.find((p: any) => p.audio?.includes('-us') || p.text)?.text;
          const ukPhonetic = entry.phonetics?.find((p: any) => p.audio?.includes('-uk') || p.text)?.text;
          const generalPhonetic = entry.phonetic || usPhonetic || ukPhonetic;

          if (generalPhonetic || usPhonetic || ukPhonetic) {
            phonetic = {
              us: usPhonetic || generalPhonetic,
              uk: ukPhonetic || generalPhonetic,
            };
          }

          if (entry.meanings && entry.meanings.length > 0) {
            definitions = entry.meanings.slice(0, 3).map((m: any) => ({
              partOfSpeech: m.partOfSpeech || 'def',
              meaning: m.definitions?.[0]?.definition || '',
            })).filter((d: any) => Boolean(d.meaning));

            const ex = entry.meanings[0]?.definitions?.[0]?.example;
            if (ex) {
              examples.push({ src: ex, dst: '' });
            }

            if (entry.meanings[0]?.synonyms?.length > 0) {
              synonyms = entry.meanings[0].synonyms.slice(0, 4);
            }
          }
        }
      }
    } catch {
      // Ignore dictionary API errors
    }
  }

  // 3. Fetch translation from MyMemory API as backup
  try {
    const src = (sourceLang === 'auto' ? 'en' : sourceLang).toLowerCase();
    const tgt = targetLang.toLowerCase();
    const transController = new AbortController();
    const transTimeout = setTimeout(() => transController.abort(), 3000);
    const transRes = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${src}|${tgt}`, {
      signal: transController.signal,
    });
    clearTimeout(transTimeout);

    if (transRes.ok) {
      const transData: any = await transRes.json();
      if (transData?.responseData?.translatedText) {
        translatedText = transData.responseData.translatedText;
      }
    }
  } catch {
    if (definitions.length > 0 && definitions[0].meaning) {
      translatedText = definitions[0].meaning;
    }
  }

  if (definitions.length === 0 && isSingleWord) {
    definitions = [{ partOfSpeech: '释义', meaning: translatedText }];
  }

  return {
    translatedText,
    isWord: isSingleWord,
    phonetic,
    definitions,
    examples,
    synonyms,
  };
}

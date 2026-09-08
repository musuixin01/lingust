import { TranslationResult, WordDefinition, BilingualExample, Phonetic } from '../types';

export interface OfflineEntry {
  translatedText: string;
  isWord: boolean;
  phonetic?: Phonetic;
  definitions?: WordDefinition[];
  examples?: BilingualExample[];
  synonyms?: string[];
}

export const OFFLINE_DICTIONARY: Record<string, OfflineEntry> = {
  // Common core vocabulary
  efficient: {
    translatedText: '高效的；有能力的',
    isWord: true,
    phonetic: { us: '/ɪˈfɪʃnt/', uk: '/ɪˈfɪʃnt/' },
    definitions: [
      { partOfSpeech: 'adj.', meaning: '高效的；有能力的；运作良好的' },
      { partOfSpeech: 'adj.', meaning: '（人）能胜任的；称职的' },
    ],
    examples: [
      { src: 'An efficient floating translator designed for focus.', dst: '专为专注打造的高效桌面悬浮翻译卡片。' },
      { src: 'We need to find a more efficient way to process data.', dst: '我们需要找到一种更高效的数据处理方式。' },
    ],
    synonyms: ['effective', 'productive', 'competent', 'capable'],
  },
  linguist: {
    translatedText: '语言学家；通晓数种外语的人',
    isWord: true,
    phonetic: { us: '/ˈlɪŋɡwɪst/', uk: '/ˈlɪŋɡwɪst/' },
    definitions: [
      { partOfSpeech: 'n.', meaning: '语言学家；从事语言研究的人' },
      { partOfSpeech: 'n.', meaning: '通晓数国语言者' },
    ],
    examples: [
      { src: 'She is a gifted linguist who speaks five languages.', dst: '她是一位极有天赋的语言学家，精通五门外语。' },
      { src: 'As a linguist, he analyzes the evolution of grammar.', dst: '作为一名语言学者，他深入分析语法的演变。' },
    ],
    synonyms: ['polyglot', 'philologist', 'grammarian'],
  },
  translate: {
    translatedText: '翻译；转化；解释',
    isWord: true,
    phonetic: { us: '/trænzˈleɪt/', uk: '/trænsˈleɪt/' },
    definitions: [
      { partOfSpeech: 'v.', meaning: '翻译；将……译成另一种语言' },
      { partOfSpeech: 'v.', meaning: '转变；转化为（某种形式）' },
    ],
    examples: [
      { src: 'Can you translate this document into Chinese?', dst: '你能把这份文件翻译成中文吗？' },
      { src: 'Good ideas do not always translate into success.', dst: '好想法并不总能转化为成功。' },
    ],
    synonyms: ['interpret', 'render', 'convert', 'transcribe'],
  },
  translation: {
    translatedText: '翻译；译文；转化',
    isWord: true,
    phonetic: { us: '/trænzˈleɪʃn/', uk: '/trænsˈleɪʃn/' },
    definitions: [
      { partOfSpeech: 'n.', meaning: '翻译；翻译作品；译文' },
      { partOfSpeech: 'n.', meaning: '转化；转变' },
    ],
    examples: [
      { src: 'Fast, accurate translation at your fingertips.', dst: '触手可及的快速准确翻译。' },
      { src: 'The book was published in English translation.', dst: '这本书出版了英译本。' },
    ],
    synonyms: ['rendering', 'interpretation', 'conversion'],
  },
  translator: {
    translatedText: '翻译员；翻译器；译者',
    isWord: true,
    phonetic: { us: '/trænzˈleɪtər/', uk: '/trænsˈleɪtə/' },
    definitions: [
      { partOfSpeech: 'n.', meaning: '译员；笔译工作者' },
      { partOfSpeech: 'n.', meaning: '（计算机）翻译程序；转换器' },
    ],
    examples: [
      { src: 'He works as a freelance literary translator.', dst: '他是一名自由文学翻译工作者。' },
    ],
    synonyms: ['interpreter', 'linguist'],
  },
  floating: {
    translatedText: '悬浮的；漂浮的；流动的',
    isWord: true,
    phonetic: { us: '/ˈfloʊtɪŋ/', uk: '/ˈfləʊtɪŋ/' },
    definitions: [
      { partOfSpeech: 'adj.', meaning: '悬浮的；漂浮的；飘动的' },
      { partOfSpeech: 'adj.', meaning: '不固定的；流动的' },
    ],
    examples: [
      { src: 'A lightweight floating card on top of your screen.', dst: '屏幕顶层的轻量悬浮卡片。' },
    ],
    synonyms: ['hovering', 'buoyant', 'levitating', 'drifting'],
  },
  desktop: {
    translatedText: '桌面；台式电脑',
    isWord: true,
    phonetic: { us: '/ˈdesktɑːp/', uk: '/ˈdesktɒp/' },
    definitions: [
      { partOfSpeech: 'n.', meaning: '桌面；工作桌面；操作环境' },
      { partOfSpeech: 'adj.', meaning: '台式的；桌上型的' },
    ],
    examples: [
      { src: 'Drag the card freely across your desktop.', dst: '在桌面上自由拖拽卡片。' },
    ],
    synonyms: ['workspace', 'screen'],
  },
  modern: {
    translatedText: '现代的；新式的；时尚的',
    isWord: true,
    phonetic: { us: '/ˈmɑːdərn/', uk: '/ˈmɒdn/' },
    definitions: [
      { partOfSpeech: 'adj.', meaning: '现代的；当代的；近代的新颖事物' },
    ],
    examples: [
      { src: 'This is an ultra-modern desktop translation tool.', dst: '这是一款超现代的桌面翻译工具。' },
    ],
    synonyms: ['contemporary', 'current', 'advanced'],
  },
  hello: {
    translatedText: '你好；问候',
    isWord: true,
    phonetic: { us: '/həˈloʊ/', uk: '/həˈləʊ/' },
    definitions: [
      { partOfSpeech: 'int.', meaning: '你好；喂（用于打招呼或引起注意）' },
      { partOfSpeech: 'n.', meaning: '问候；招呼' },
    ],
    examples: [
      { src: 'Hello! Welcome to Linguist floating translator.', dst: '你好！欢迎使用 Linguist 悬浮翻译卡片。' },
    ],
    synonyms: ['greetings', 'hi', 'welcome'],
  },
  world: {
    translatedText: '世界；地球；领域',
    isWord: true,
    phonetic: { us: '/wɜːrld/', uk: '/wɜːld/' },
    definitions: [
      { partOfSpeech: 'n.', meaning: '地球；世界；天下' },
      { partOfSpeech: 'n.', meaning: '领域；界；世面' },
    ],
    examples: [
      { src: 'Languages connect people around the world.', dst: '语言将全世界的人们连接在一起。' },
    ],
    synonyms: ['earth', 'globe', 'universe'],
  },
  engine: {
    translatedText: '引擎；发动机；工具机',
    isWord: true,
    phonetic: { us: '/ˈendʒɪn/', uk: '/ˈendʒɪn/' },
    definitions: [
      { partOfSpeech: 'n.', meaning: '发动机；引擎' },
      { partOfSpeech: 'n.', meaning: '（软件中的）核心引擎，如翻译引擎、搜索引擎' },
    ],
    examples: [
      { src: 'Switch translation engines between Gemini, DeepL and Youdao.', dst: '在 Gemini、DeepL 和有道之间自由切换翻译引擎。' },
    ],
    synonyms: ['motor', 'mechanism', 'core'],
  },
  offline: {
    translatedText: '离线的；未联机的',
    isWord: true,
    phonetic: { us: '/ˌɔːfˈlaɪn/', uk: '/ˌɒfˈlaɪn/' },
    definitions: [
      { partOfSpeech: 'adj.', meaning: '离线的；脱机的；无需网络的' },
      { partOfSpeech: 'adv.', meaning: '在离线状态下' },
    ],
    examples: [
      { src: 'Enjoy fast offline translation without internet connection.', dst: '在没有网络连接的情况下享受高速离线翻译。' },
    ],
    synonyms: ['disconnected', 'standalone', 'local'],
  },
  accurate: {
    translatedText: '准确的；精确的',
    isWord: true,
    phonetic: { us: '/ˈækjərət/', uk: '/ˈækjərət/' },
    definitions: [
      { partOfSpeech: 'adj.', meaning: '正确无误的；精准的；严谨的' },
    ],
    examples: [
      { src: 'DeepL is renowned for its accurate translation.', dst: 'DeepL 以其精确的翻译而闻名。' },
    ],
    synonyms: ['precise', 'correct', 'exact', 'flawless'],
  },
  diversity: {
    translatedText: '多样性；多元化',
    isWord: true,
    phonetic: { us: '/daɪˈvɜːrsəti/', uk: '/daɪˈvɜːsəti/' },
    definitions: [
      { partOfSpeech: 'n.', meaning: '多样性；差异；多变性' },
    ],
    examples: [
      { src: 'Multiple translation engines enhance diversity and accuracy.', dst: '多种翻译引擎增强了多样性与准确性。' },
    ],
    synonyms: ['variety', 'multiplicity', 'assortment'],
  },
  settings: {
    translatedText: '设置；环境；配置',
    isWord: true,
    phonetic: { us: '/ˈsetɪŋz/', uk: '/ˈsetɪŋz/' },
    definitions: [
      { partOfSpeech: 'n.', meaning: '（软件或设备的）设置；选项；参数配置' },
      { partOfSpeech: 'n.', meaning: '环境；背景' },
    ],
    examples: [
      { src: 'Configure your API keys in the settings modal.', dst: '在偏好设置中配置您的 API 密钥。' },
    ],
    synonyms: ['preferences', 'configurations', 'options'],
  },
  developer: {
    translatedText: '开发者；程序员；开发商',
    isWord: true,
    phonetic: { us: '/dɪˈveləpər/', uk: '/dɪˈveləpə/' },
    definitions: [
      { partOfSpeech: 'n.', meaning: '开发者；软件工程师' },
    ],
    examples: [
      { src: 'Designed for developers, researchers and readers.', dst: '专为开发者、研究人员及读者设计。' },
    ],
    synonyms: ['programmer', 'creator', 'engineer'],
  },
  intelligent: {
    translatedText: '智能的；聪颖的；明智的',
    isWord: true,
    phonetic: { us: '/ɪnˈtelɪdʒənt/', uk: '/ɪnˈtelɪdʒənt/' },
    definitions: [
      { partOfSpeech: 'adj.', meaning: '有智慧的；聪明的；智能化的' },
    ],
    examples: [
      { src: 'Gemini provides intelligent contextual translation.', dst: 'Gemini 提供智能语境翻译。' },
    ],
    synonyms: ['smart', 'clever', 'brilliant', 'wise'],
  },
  focus: {
    translatedText: '专注；焦点；聚焦',
    isWord: true,
    phonetic: { us: '/ˈfoʊkəs/', uk: '/ˈfəʊkəs/' },
    definitions: [
      { partOfSpeech: 'n.', meaning: '焦点；专注的核心' },
      { partOfSpeech: 'v.', meaning: '使集中；聚焦；特别关注' },
    ],
    examples: [
      { src: 'Stay focused on your reading without interruption.', dst: '保持沉浸阅读，不受繁琐打扰。' },
    ],
    synonyms: ['concentrate', 'center', 'highlight'],
  },
  convenient: {
    translatedText: '方便的；便利的；合宜的',
    isWord: true,
    phonetic: { us: '/kənˈviːniənt/', uk: '/kənˈviːniənt/' },
    definitions: [
      { partOfSpeech: 'adj.', meaning: '省时省力的；便利的；临近方便的' },
    ],
    examples: [
      { src: 'Floating cards are very convenient for quick reference.', dst: '悬浮卡片在快速查阅时极其方便。' },
    ],
    synonyms: ['handy', 'accessible', 'suitable'],
  },
  language: {
    translatedText: '语言；语系；言辞',
    isWord: true,
    phonetic: { us: '/ˈlæŋɡwɪdʒ/', uk: '/ˈlæŋɡwɪdʒ/' },
    definitions: [
      { partOfSpeech: 'n.', meaning: '语言；人类交际工具' },
      { partOfSpeech: 'n.', meaning: '（计算机）编程语言' },
    ],
    examples: [
      { src: 'English and Chinese are widely used languages.', dst: '英语和中文是被广泛使用的语言。' },
    ],
    synonyms: ['tongue', 'speech', 'dialect'],
  },
  dictionary: {
    translatedText: '词典；字典',
    isWord: true,
    phonetic: { us: '/ˈdɪkʃəneri/', uk: '/ˈdɪkʃənri/' },
    definitions: [
      { partOfSpeech: 'n.', meaning: '词典；字典；专业术语汇编' },
    ],
    examples: [
      { src: 'Look up the word in the offline dictionary.', dst: '在离线词典中查阅该单词。' },
    ],
    synonyms: ['lexicon', 'glossary', 'vocabulary'],
  },
  pronunciation: {
    translatedText: '发音；读音',
    isWord: true,
    phonetic: { us: '/prəˌnʌnsiˈeɪʃn/', uk: '/prəˌnʌnsiˈeɪʃn/' },
    definitions: [
      { partOfSpeech: 'n.', meaning: '发音方式；读音' },
    ],
    examples: [
      { src: 'Click the speaker icon to listen to the pronunciation.', dst: '点击喇叭图标听取标准发音。' },
    ],
    synonyms: ['accent', 'articulation', 'phonetics'],
  },
  example: {
    translatedText: '例子；范例；榜样',
    isWord: true,
    phonetic: { us: '/ɪɡˈzæmpl/', uk: '/ɪɡˈzɑːmpl/' },
    definitions: [
      { partOfSpeech: 'n.', meaning: '例子；实例；样板' },
    ],
    examples: [
      { src: 'This sentence serves as a clear example.', dst: '这个句子是一个清晰的例子。' },
    ],
    synonyms: ['instance', 'sample', 'illustration'],
  },
  synonym: {
    translatedText: '同义词；近义词',
    isWord: true,
    phonetic: { us: '/ˈsɪnənɪm/', uk: '/ˈsɪnənɪm/' },
    definitions: [
      { partOfSpeech: 'n.', meaning: '近义词；同义词' },
    ],
    examples: [
      { src: 'Rich and wealthy are synonyms.', dst: 'Rich 和 wealthy 是同义词。' },
    ],
    synonyms: ['equivalent', 'counterpart'],
  },
  // Common conversational phrases
  'how are you': {
    translatedText: '你好吗？最近怎么样？',
    isWord: false,
    examples: [{ src: 'How are you today?', dst: '你今天好吗？' }],
  },
  'good morning': {
    translatedText: '早上好！',
    isWord: false,
    examples: [{ src: 'Good morning, everyone!', dst: '大家早上好！' }],
  },
  'thank you': {
    translatedText: '谢谢你！多谢！',
    isWord: false,
    examples: [{ src: 'Thank you very much for your help.', dst: '非常感谢你的帮助。' }],
  },
  'you are welcome': {
    translatedText: '不客气；不用谢。',
    isWord: false,
    examples: [{ src: 'You are welcome anytime.', dst: '随时欢迎您。' }],
  },
  'see you later': {
    translatedText: '待会见；回头见。',
    isWord: false,
    examples: [{ src: 'See you later this afternoon.', dst: '今天下午待会见。' }],
  },
  'have a nice day': {
    translatedText: '祝你有美好的一天！',
    isWord: false,
    examples: [{ src: 'Goodbye and have a nice day!', dst: '再见，祝你有美好的一天！' }],
  },
};

// Common Chinese words to English
export const CHINESE_OFFLINE_DICTIONARY: Record<string, OfflineEntry> = {
  你好: {
    translatedText: 'Hello; Hi; Greetings',
    isWord: true,
    phonetic: { general: 'nǐ hǎo' },
    definitions: [
      { partOfSpeech: 'int.', meaning: 'Hello / Hi (common greeting)' },
    ],
    examples: [
      { src: '你好！很高兴见到你。', dst: 'Hello! Nice to meet you.' },
    ],
    synonyms: ['您好', '嗨'],
  },
  世界: {
    translatedText: 'World; Earth; Globe',
    isWord: true,
    phonetic: { general: 'shì jiè' },
    definitions: [
      { partOfSpeech: 'n.', meaning: 'The world; the Earth; domain' },
    ],
    examples: [
      { src: '世界如此广阔。', dst: 'The world is so vast.' },
    ],
    synonyms: ['地球', '天下'],
  },
  翻译: {
    translatedText: 'Translate; Translation; Interpreter',
    isWord: true,
    phonetic: { general: 'fān yì' },
    definitions: [
      { partOfSpeech: 'v.', meaning: 'To translate; to interpret' },
      { partOfSpeech: 'n.', meaning: 'Translation; translator' },
    ],
    examples: [
      { src: '精准的桌面翻译。', dst: 'Precision desktop translation.' },
    ],
    synonyms: ['口译', '笔译', '转换'],
  },
  高效: {
    translatedText: 'Efficient; Highly effective; Productive',
    isWord: true,
    phonetic: { general: 'gāo xiào' },
    definitions: [
      { partOfSpeech: 'adj.', meaning: 'Efficient; high-efficiency' },
    ],
    examples: [
      { src: '高效的学习方法。', dst: 'An efficient study method.' },
    ],
    synonyms: ['神速', '灵捷'],
  },
  设置: {
    translatedText: 'Settings; Preferences; Options',
    isWord: true,
    phonetic: { general: 'shè zhì' },
    definitions: [
      { partOfSpeech: 'n.', meaning: 'Settings; configurations; preferences' },
      { partOfSpeech: 'v.', meaning: 'To set up; to establish' },
    ],
    examples: [
      { src: '打开偏好设置。', dst: 'Open preferences / settings.' },
    ],
  },
  引擎: {
    translatedText: 'Engine; Motor; Core mechanism',
    isWord: true,
    phonetic: { general: 'yǐn qíng' },
    definitions: [
      { partOfSpeech: 'n.', meaning: 'Engine (translation engine, search engine)' },
    ],
    examples: [
      { src: '切换不同的翻译引擎。', dst: 'Switch between different translation engines.' },
    ],
  },
  离线: {
    translatedText: 'Offline; Disconnected; Standalone',
    isWord: true,
    phonetic: { general: 'lí xiàn' },
    definitions: [
      { partOfSpeech: 'adj.', meaning: 'Offline; not connected to the network' },
    ],
    examples: [
      { src: '支持离线翻译模式。', dst: 'Supports offline translation mode.' },
    ],
  },
};

// Word stemming / lemmatization helper
function getWordCandidateStems(word: string): string[] {
  const stems: string[] = [word];
  if (word.endsWith('ies') && word.length > 4) stems.push(word.slice(0, -3) + 'y');
  if (word.endsWith('es') && word.length > 3) stems.push(word.slice(0, -2));
  if (word.endsWith('s') && word.length > 2) stems.push(word.slice(0, -1));
  if (word.endsWith('ing') && word.length > 4) {
    stems.push(word.slice(0, -3));
    stems.push(word.slice(0, -3) + 'e');
  }
  if (word.endsWith('ed') && word.length > 3) {
    stems.push(word.slice(0, -2));
    stems.push(word.slice(0, -1));
  }
  if (word.endsWith('ly') && word.length > 3) stems.push(word.slice(0, -2));
  if (word.endsWith('er') && word.length > 3) stems.push(word.slice(0, -2));
  if (word.endsWith('est') && word.length > 4) stems.push(word.slice(0, -3));
  return Array.from(new Set(stems));
}

/**
 * Perform 100% offline lexical & grammatical translation without any network API
 */
export function translateOffline(
  text: string,
  sourceLang: string = 'auto',
  targetLang: string = 'ZH'
): TranslationResult {
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  const cleanWord = lower.replace(/^[^\w\s\u4e00-\u9fa5]+|[^\w\s\u4e00-\u9fa5]+$/g, '');
  const isSingleWord = !trimmed.includes('\n') && trimmed.split(/\s+/).length <= 2 && trimmed.length <= 35;

  // 1. Direct dictionary lookup (English)
  if (OFFLINE_DICTIONARY[cleanWord]) {
    const entry = OFFLINE_DICTIONARY[cleanWord];
    return {
      id: `offline-${Date.now()}`,
      sourceText: trimmed,
      translatedText: entry.translatedText,
      sourceLang: 'EN',
      targetLang: targetLang === 'auto' ? 'ZH' : targetLang,
      isWord: entry.isWord,
      phonetic: entry.phonetic,
      definitions: entry.definitions || [{ partOfSpeech: '释义', meaning: entry.translatedText }],
      examples: entry.examples,
      synonyms: entry.synonyms,
      timestamp: Date.now(),
      engine: 'offline',
    };
  }

  // 2. Direct dictionary lookup (Chinese)
  if (CHINESE_OFFLINE_DICTIONARY[cleanWord]) {
    const entry = CHINESE_OFFLINE_DICTIONARY[cleanWord];
    return {
      id: `offline-${Date.now()}`,
      sourceText: trimmed,
      translatedText: entry.translatedText,
      sourceLang: 'ZH',
      targetLang: targetLang === 'auto' ? 'EN' : targetLang,
      isWord: entry.isWord,
      phonetic: entry.phonetic,
      definitions: entry.definitions,
      examples: entry.examples,
      synonyms: entry.synonyms,
      timestamp: Date.now(),
      engine: 'offline',
    };
  }

  // 3. Try inflection / stemming lookup
  if (isSingleWord) {
    const stems = getWordCandidateStems(cleanWord);
    for (const stem of stems) {
      if (OFFLINE_DICTIONARY[stem]) {
        const entry = OFFLINE_DICTIONARY[stem];
        return {
          id: `offline-${Date.now()}`,
          sourceText: trimmed,
          translatedText: entry.translatedText,
          sourceLang: 'EN',
          targetLang: targetLang === 'auto' ? 'ZH' : targetLang,
          isWord: true,
          phonetic: entry.phonetic,
          definitions: entry.definitions?.map((d) => ({
            partOfSpeech: d.partOfSpeech,
            meaning: `[原形: ${stem}] ${d.meaning}`,
          })) || [{ partOfSpeech: '释义', meaning: `[原形: ${stem}] ${entry.translatedText}` }],
          examples: entry.examples,
          synonyms: entry.synonyms,
          timestamp: Date.now(),
          engine: 'offline',
        };
      }
    }
  }

  // 4. Tokenized multi-word translation fallback
  const tokens = trimmed.split(/\s+/);
  if (tokens.length > 1 && tokens.length <= 15) {
    const translatedTokens = tokens.map((token) => {
      const clean = token.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
      if (OFFLINE_DICTIONARY[clean]) {
        return OFFLINE_DICTIONARY[clean].translatedText.split('；')[0].split('，')[0];
      }
      return token;
    });

    const isEnglish = /^[a-zA-Z\s.,!?'"()-]+$/.test(trimmed);
    const synthesized = translatedTokens.join(isEnglish ? ' ' : '');

    return {
      id: `offline-${Date.now()}`,
      sourceText: trimmed,
      translatedText: synthesized || trimmed,
      sourceLang: isEnglish ? 'EN' : 'ZH',
      targetLang: targetLang,
      isWord: false,
      timestamp: Date.now(),
      engine: 'offline',
    };
  }

  // 5. Default graceful return
  return {
    id: `offline-${Date.now()}`,
    sourceText: trimmed,
    translatedText: trimmed,
    sourceLang: sourceLang === 'auto' ? 'EN' : sourceLang,
    targetLang: targetLang,
    isWord: isSingleWord,
    definitions: isSingleWord ? [{ partOfSpeech: '离线', meaning: `【离线词库未收录】已为您呈现原文 "${trimmed}"` }] : [],
    examples: [],
    timestamp: Date.now(),
    engine: 'offline',
  };
}

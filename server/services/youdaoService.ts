import crypto from 'crypto';

export async function performYoudaoTranslation(
  text: string,
  sourceLang: string,
  targetLang: string,
  appKey: string,
  appSecret: string
) {
  const salt = crypto.randomUUID();
  const curtime = Math.round(Date.now() / 1000).toString();

  const truncate = (q: string) => {
    const len = q.length;
    if (len <= 20) return q;
    return q.substring(0, 10) + len + q.substring(len - 10, len);
  };

  const signStr = appKey.trim() + truncate(text) + salt + curtime + appSecret.trim();
  const sign = crypto.createHash('sha256').update(signStr).digest('hex');

  const langMap: Record<string, string> = {
    ZH: 'zh-CHS',
    EN: 'en',
    JA: 'ja',
    KO: 'ko',
    FR: 'fr',
    ES: 'es',
    RU: 'ru',
    DE: 'de',
  };

  const from = sourceLang === 'auto' ? 'auto' : (langMap[sourceLang.toUpperCase()] || sourceLang.toLowerCase());
  const to = langMap[targetLang.toUpperCase()] || targetLang.toLowerCase();

  const params = new URLSearchParams();
  params.append('q', text);
  params.append('from', from);
  params.append('to', to);
  params.append('appKey', appKey.trim());
  params.append('salt', salt);
  params.append('sign', sign);
  params.append('signType', 'v3');
  params.append('curtime', curtime);

  const response = await fetch('https://openapi.youdao.com/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Youdao API HTTP 状态码: ${response.status}`);
  }

  const json: any = await response.json();
  if (json.errorCode !== '0') {
    const errorMessages: Record<string, string> = {
      '101': '缺少必填的参数',
      '102': '不支持的语言类型',
      '103': '翻译文本过长',
      '108': '应用 ID 无效 (appKey)',
      '110': '无相关服务的有效实例',
      '111': '账号欠费或已冻结',
      '113': '缺少有效查询文本',
      '202': '签名检验失败，请检查 appSecret 是否匹配',
      '411': '访问过于频繁',
    };
    const desc = errorMessages[json.errorCode] || `错误代码 ${json.errorCode}`;
    throw new Error(`有道智云错误: ${desc}`);
  }

  const translatedText = json.translation?.join('；') || text;
  const isWord = Boolean(json.basic);
  const phonetic = json.basic
    ? {
        us: json.basic['us-phonetic'] ? `/${json.basic['us-phonetic']}/` : undefined,
        uk: json.basic['uk-phonetic'] ? `/${json.basic['uk-phonetic']}/` : undefined,
        general: json.basic.phonetic ? `/${json.basic.phonetic}/` : undefined,
      }
    : undefined;

  const definitions =
    json.basic?.explains?.map((exp: string) => {
      const posMatch = exp.match(/^([a-z]+\.)\s*(.*)$/i);
      if (posMatch) {
        return { partOfSpeech: posMatch[1], meaning: posMatch[2] };
      }
      return { partOfSpeech: '释义', meaning: exp };
    }) || [];

  const examples =
    json.web?.slice(0, 3).map((w: any) => ({
      src: w.key,
      dst: Array.isArray(w.value) ? w.value.join('；') : String(w.value),
    })) || [];

  return {
    translatedText,
    isWord,
    phonetic,
    definitions,
    examples,
    sourceLang: json.l ? json.l.split('2')[0].toUpperCase() : sourceLang,
  };
}

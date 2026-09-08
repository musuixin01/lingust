export function speakText(text: string, langCode: string = 'EN', accent?: 'us' | 'uk') {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);

  let langTag = 'en-US';
  switch (langCode.toUpperCase()) {
    case 'ZH':
      langTag = 'zh-CN';
      break;
    case 'EN':
      langTag = accent === 'uk' ? 'en-GB' : 'en-US';
      break;
    case 'JA':
      langTag = 'ja-JP';
      break;
    case 'KO':
      langTag = 'ko-KR';
      break;
    case 'FR':
      langTag = 'fr-FR';
      break;
    case 'DE':
      langTag = 'de-DE';
      break;
    case 'ES':
      langTag = 'es-ES';
      break;
    case 'RU':
      langTag = 'ru-RU';
      break;
    case 'IT':
      langTag = 'it-IT';
      break;
    case 'PT':
      langTag = 'pt-PT';
      break;
    default:
      langTag = 'en-US';
  }

  utterance.lang = langTag;
  utterance.rate = 0.95; // Clear and slightly measured for educational dictionary clarity
  utterance.pitch = 1.0;

  // Try to pick a natural sounding voice if available
  const voices = window.speechSynthesis.getVoices();
  const matchedVoice = voices.find(v => v.lang.replace('_', '-').startsWith(langTag.split('-')[0]));
  if (matchedVoice) {
    utterance.voice = matchedVoice;
  }

  window.speechSynthesis.speak(utterance);
}

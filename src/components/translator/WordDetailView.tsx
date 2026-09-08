import React from 'react';
import { Volume2 } from 'lucide-react';
import { TranslationResult, FontSizePreference } from '../../types';
import { speakText } from '../../utils/speech';

export interface WordDetailViewProps {
  result: TranslationResult;
  isDark?: boolean;
  onSelectWord?: (word: string) => void;
  isCompact?: boolean;
  isVeryCompact?: boolean;
  isUltraCompact?: boolean;
  fontSize?: FontSizePreference;
  effectiveFontScale?: number;
}

export const WordDetailView: React.FC<WordDetailViewProps> = ({
  result,
  isDark = true,
  onSelectWord,
  isCompact = false,
  isVeryCompact = false,
  isUltraCompact = false,
  fontSize = 'medium',
  effectiveFontScale,
}) => {
  const { sourceText, translatedText, phonetic, definitions, examples, synonyms, sourceLang } = result;

  const handleSpeak = (text: string, accent?: 'us' | 'uk') => {
    speakText(text, sourceLang || 'EN', accent);
  };

  const primaryPhonetic = phonetic?.us || phonetic?.uk || phonetic?.general || '';
  const formattedPhonetic = primaryPhonetic
    ? primaryPhonetic.startsWith('/')
      ? primaryPhonetic
      : `/${primaryPhonetic}/`
    : '';

  const primaryDef = definitions && definitions.length > 0 ? definitions[0] : null;
  const partOfSpeech = primaryDef?.partOfSpeech || 'Adj';

  return (
    <div
      className={`${
        isUltraCompact
          ? 'space-y-1.5'
          : isVeryCompact
          ? 'space-y-2'
          : isCompact
          ? 'space-y-2.5'
          : 'space-y-3'
      } select-text ${isDark ? 'text-white/90' : 'text-slate-800'} overflow-hidden w-full`}
    >
      {/* Word Header: 精致紧凑排版，字号与卡片尺寸和谐呼应 */}
      <div className="flex items-baseline justify-between gap-1.5 border-b border-white/10 pb-1.5">
        <div className="flex items-baseline gap-1.5 flex-wrap min-w-0">
          <span
            className={`font-bold tracking-tight text-white leading-tight break-words ${
              isUltraCompact
                ? 'text-sm'
                : isVeryCompact
                ? 'text-base'
                : isCompact
                ? 'text-lg'
                : 'text-xl sm:text-2xl'
            }`}
          >
            {sourceText}
          </span>

          {formattedPhonetic && (
            <span
              className={`font-mono text-blue-300/80 leading-none ${
                isUltraCompact
                  ? 'text-[9px]'
                  : isVeryCompact
                  ? 'text-[10px]'
                  : isCompact
                  ? 'text-[11px]'
                  : 'text-xs'
              }`}
            >
              {formattedPhonetic}
            </span>
          )}
        </div>

        {/* Pronunciation Buttons: 紧凑胶囊按钮 */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => handleSpeak(sourceText, 'us')}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all text-[10px] font-medium border border-white/10 cursor-pointer"
            title="美音发音"
          >
            <Volume2 className="w-2.5 h-2.5 text-blue-400" />
            <span>美</span>
          </button>
          <button
            type="button"
            onClick={() => handleSpeak(sourceText, 'uk')}
            className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all text-[10px] font-medium border border-white/10 cursor-pointer"
            title="英音发音"
          >
            <Volume2 className="w-2.5 h-2.5 text-emerald-400" />
            <span>英</span>
          </button>
        </div>
      </div>

      {/* Primary Meaning Card: 紧凑行高与圆角边界 */}
      <div
        className={`bg-white/5 rounded-xl border border-white/10 overflow-hidden ${
          isUltraCompact ? 'p-1.5 space-y-1' : isCompact ? 'p-2 space-y-1.5' : 'p-2.5 space-y-2'
        }`}
      >
        <div className="flex items-start gap-1.5">
          <span className="px-1.5 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-semibold text-[10px] border border-blue-500/30 shrink-0 leading-none mt-0.5">
            {partOfSpeech}
          </span>
          <div className="flex-1 min-w-0">
            <span
              className={`font-semibold text-white/95 leading-tight break-words block ${
                isUltraCompact
                  ? 'text-xs'
                  : isVeryCompact
                  ? 'text-sm'
                  : isCompact
                  ? 'text-base'
                  : 'text-base sm:text-lg'
              }`}
            >
              {translatedText}
            </span>
          </div>
        </div>

        {/* Additional Definitions if available */}
        {definitions && definitions.length > 1 && (
          <div className="space-y-0.5 pt-1 border-t border-white/5 text-[11px] leading-snug text-white/70">
            {definitions.slice(1).map((def, idx) => (
              <div key={idx} className="flex items-baseline gap-1.5">
                <span className="font-mono text-blue-400/80 shrink-0 text-[10px]">{def.partOfSpeech}</span>
                <span className="break-words">{def.meaning}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bilingual Examples: 减小行距与边距，双语对照完整保留 */}
      {examples && examples.length > 0 && (
        <div className="space-y-1 pt-0.5">
          <div className="text-[9px] sm:text-[10px] font-semibold text-white/40 uppercase tracking-wider">
            双语例句
          </div>
          <div className="space-y-1 text-xs">
            {examples.slice(0, 2).map((eg, idx) => (
              <div
                key={idx}
                onClick={() => handleSpeak(eg.src, 'us')}
                className="p-1.5 sm:p-2 rounded-lg bg-white/[0.03] border border-white/5 space-y-0.5 hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer group flex items-start justify-between gap-2"
                title="点击朗读例句"
              >
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="text-white/90 leading-tight font-serif text-[11px] sm:text-xs break-words">
                    {eg.src}
                  </div>
                  <div className="text-white/50 leading-tight text-[10px] sm:text-[11px] break-words">
                    {eg.dst}
                  </div>
                </div>
                <Volume2 className="w-3.5 h-3.5 text-white/30 group-hover:text-white/80 shrink-0 mt-0.5 transition-colors" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Synonyms & Antonyms: 紧凑胶囊，完整保留 */}
      {synonyms && synonyms.length > 0 && (
        <div className="space-y-0.5 pt-0.5">
          <div className="text-[9px] sm:text-[10px] font-semibold text-white/40 uppercase tracking-wider">
            同反义词
          </div>
          <div className="flex flex-wrap gap-1">
            {synonyms.map((syn, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onSelectWord?.(syn.replace(/\s*\(.*?\)/, ''))}
                className="px-1.5 py-0.5 rounded-md bg-white/5 hover:bg-white/15 text-white/80 hover:text-white transition-all text-[10px] sm:text-[11px] border border-white/10 cursor-pointer leading-tight"
              >
                {syn}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

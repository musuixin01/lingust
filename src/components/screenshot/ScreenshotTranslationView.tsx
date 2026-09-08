import React, { useState } from 'react';
import {
  Copy,
  Check,
  Volume2,
  Crop,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Sparkles,
  FileText,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ScreenshotTranslationResult } from '../../types';
import { speakText } from '../../utils/speech';

interface ScreenshotTranslationViewProps {
  ocrResult: ScreenshotTranslationResult;
  onRetake: () => void;
  onBackToText: () => void;
  isDark?: boolean;
}

export const ScreenshotTranslationView: React.FC<ScreenshotTranslationViewProps> = ({
  ocrResult,
  onRetake,
  onBackToText,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Copy single line pair
  const handleCopyLine = (src: string, dst: string, index: number) => {
    const text = `原文: ${src}\n译文: ${dst}`;
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1600);
  };

  // Copy all lines in bilingual format
  const handleCopyAll = () => {
    const allText = ocrResult.lines
      .map((line, i) => `[${i + 1}] 原文: ${line.src}\n    译文: ${line.dst}`)
      .join('\n\n');
    navigator.clipboard.writeText(allText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1800);
  };

  return (
    <div className="space-y-3.5 select-text">
      {/* Top Banner with Stats & Image Preview Toggle */}
      <div className="flex items-center justify-between px-3 py-2 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
            <Crop className="w-3 h-3" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white/90 flex items-center gap-1.5">
              <span>截图翻译</span>
              <span className="px-1.5 py-0.2 text-[10px] rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                中英逐行对照
              </span>
            </div>
            <div className="text-[10px] text-white/40">
              共识别 {ocrResult.lines.length} 行文本 · {ocrResult.sourceLang} → {ocrResult.targetLang}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {ocrResult.imagePreviewUrl && (
            <button
              type="button"
              onClick={() => setShowImagePreview(!showImagePreview)}
              className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors text-xs flex items-center gap-1 cursor-pointer"
              title={showImagePreview ? '收起截图' : '查看原截图'}
            >
              {showImagePreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span className="text-[10px]">{showImagePreview ? '收起图' : '原图'}</span>
            </button>
          )}
          <button
            type="button"
            onClick={onRetake}
            className="p-1.5 text-white/50 hover:text-white rounded-lg hover:bg-white/10 transition-colors text-xs flex items-center gap-1 cursor-pointer"
            title="重新截图"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[10px]">重截</span>
          </button>
        </div>
      </div>

      {/* Optional Screenshot Image Preview Thumbnail */}
      {showImagePreview && ocrResult.imagePreviewUrl && (
        <div className="p-2 rounded-2xl bg-black/40 border border-white/10 overflow-hidden">
          <img
            src={ocrResult.imagePreviewUrl}
            alt="Screenshot capture"
            className="max-h-36 w-full object-contain rounded-lg"
          />
        </div>
      )}

      {/* Bilingual Line-by-Line Comparative List (上面原文，下面翻译) */}
      <div className="space-y-2.5 max-h-[260px] overflow-y-auto pr-1">
        {ocrResult.lines.map((line, index) => (
          <div
            key={index}
            className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 group relative"
          >
            {/* Top: Original Source Text (上面是原文) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                  原文 ({index + 1})
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => speakText(line.src, ocrResult.sourceLang)}
                    className="p-1 text-white/40 hover:text-white rounded transition-colors"
                    title="朗读原文"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyLine(line.src, line.dst, index)}
                    className="p-1 text-white/40 hover:text-white rounded transition-colors"
                    title="复制此行对照"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
              <div className="text-xs font-mono font-medium text-white/95 leading-relaxed break-words">
                {line.src}
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="my-2 flex items-center gap-2">
              <div className="h-px bg-white/10 flex-1" />
              <div className="text-[8px] text-blue-400/50 font-bold tracking-widest uppercase">
                TRANSLATION
              </div>
              <div className="h-px bg-white/10 flex-1" />
            </div>

            {/* Bottom: Translated Target Text (下面是翻译) */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold text-blue-400/80 uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  译文
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => speakText(line.dst, ocrResult.targetLang)}
                    className="p-1 text-blue-300/60 hover:text-blue-300 rounded transition-colors"
                    title="朗读译文"
                  >
                    <Volume2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
              <div className="text-sm font-sans font-medium text-blue-300 leading-relaxed break-words">
                {line.dst}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Action Toolbar */}
      <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
        <button
          type="button"
          onClick={onBackToText}
          className="text-white/40 hover:text-white flex items-center gap-1 text-[11px] transition-colors cursor-pointer"
        >
          <span>返回文本翻译</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyAll}
            className={`px-2.5 py-1 rounded-lg border border-white/15 text-[11px] font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              copiedAll
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                : 'bg-white/10 hover:bg-white/15 text-white/90'
            }`}
          >
            {copiedAll ? <Check className="w-3 h-3 text-emerald-300" /> : <Copy className="w-3 h-3" />}
            <span>{copiedAll ? '已复制全部' : '复制全部中英对照'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftRight, ChevronDown, Check } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../../constants/languages';
import { Language } from '../../types';

export interface LanguageSelectorProps {
  sourceLang: string;
  targetLang: string;
  onSourceChange: (lang: string) => void;
  onTargetChange: (lang: string) => void;
  onSwap: () => void;
  isDark?: boolean;
  compact?: boolean;
  minimal?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  sourceLang,
  targetLang,
  onSourceChange,
  onTargetChange,
  onSwap,
  isDark = false,
  compact = false,
  minimal = false,
}) => {
  const [dropdownSide, setDropdownSide] = useState<'source' | 'target' | null>(null);
  const [swapRotation, setSwapRotation] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentSource = SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang) || SUPPORTED_LANGUAGES[0];
  const currentTarget = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) || SUPPORTED_LANGUAGES[1];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownSide(null);
      }
    };
    if (dropdownSide) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownSide]);

  return (
    <div className="relative select-none shrink-0" ref={dropdownRef}>
      {/* Pill Container matching Frosted Glass Design */}
      <div
        className={`flex items-center bg-white/5 rounded-full border border-white/10 shadow-inner backdrop-blur-md transition-all ${
          minimal
            ? 'gap-1 px-1.5 py-0.5'
            : compact
            ? 'gap-1.5 px-2.5 py-0.5'
            : 'gap-2.5 px-3.5 py-1'
        }`}
      >
        {/* Source Language Button */}
        <button
          type="button"
          onClick={() => setDropdownSide(dropdownSide === 'source' ? null : 'source')}
          className={`flex items-center text-white/90 hover:text-white transition-colors cursor-pointer font-bold ${
            minimal ? 'text-[10px] gap-0.5' : 'text-[11px] gap-1'
          }`}
          title={`源语言: ${currentSource.label}`}
        >
          <span>{currentSource.shortLabel}</span>
          {!minimal && <ChevronDown className="w-2.5 h-2.5 text-white/30 shrink-0" />}
        </button>

        {/* Swap Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setSwapRotation((r) => r + 180);
            onSwap();
          }}
          className="text-white/40 hover:text-white transition-all p-0.5 rounded-full hover:scale-110 active:scale-95 shrink-0"
          title="互换语言"
        >
          <ArrowLeftRight
            style={{ transform: `rotate(${swapRotation}deg)` }}
            className={`${
              minimal ? 'w-2.5 h-2.5' : 'w-3 h-3'
            } text-white/50 hover:text-white transition-transform duration-300 ease-out`}
          />
        </button>

        {/* Target Language Button */}
        <button
          type="button"
          onClick={() => setDropdownSide(dropdownSide === 'target' ? null : 'target')}
          className={`flex items-center text-white/90 hover:text-white transition-colors cursor-pointer font-bold ${
            minimal ? 'text-[10px] gap-0.5' : 'text-[11px] gap-1'
          }`}
          title={`目标语言: ${currentTarget.label}`}
        >
          <span>{currentTarget.shortLabel}</span>
          {!minimal && <ChevronDown className="w-2.5 h-2.5 text-white/30 shrink-0" />}
        </button>
      </div>

      {/* Language Selection Modal / Dropdown */}
      {dropdownSide && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50 p-2 w-48 rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.6)] max-h-64 overflow-y-auto bg-[#0a0a1a]/95 backdrop-blur-2xl border border-white/20 text-slate-100 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-2 py-1 text-[10px] font-bold text-white/40 uppercase tracking-wider mb-1">
            选择{dropdownSide === 'source' ? '源语言' : '目标语言'}
          </div>
          <div className="grid grid-cols-1 gap-0.5">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected =
                dropdownSide === 'source' ? lang.code === sourceLang : lang.code === targetLang;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    if (dropdownSide === 'source') {
                      onSourceChange(lang.code);
                    } else {
                      onTargetChange(lang.code);
                    }
                    setDropdownSide(null);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-500/30 text-blue-300 font-semibold border border-blue-500/30'
                      : 'hover:bg-white/10 text-white/80 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className="font-medium">{lang.label}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-blue-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

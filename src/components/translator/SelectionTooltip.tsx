import React from 'react';
import { Languages } from 'lucide-react';

export interface SelectionTooltipProps {
  position: { x: number; y: number } | null;
  onTranslate: () => void;
  isDark?: boolean;
}

export const SelectionTooltip: React.FC<SelectionTooltipProps> = ({
  position,
  onTranslate,
}) => {
  if (!position) return null;

  return (
    <div
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%) translateY(-10px)',
        zIndex: 9999,
      }}
      className="pointer-events-auto select-none"
    >
      <button
        type="button"
        onMouseDown={(e) => {
          e.preventDefault(); // prevent losing text selection immediately
          onTranslate();
        }}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.6)] border border-white/20 backdrop-blur-2xl text-xs font-semibold transition-all duration-200 hover:scale-105 active:scale-95 animate-in zoom-in-75 bg-slate-900/90 text-blue-300 hover:border-blue-400/50 hover:text-white cursor-pointer"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.25), 0 10px 25px rgba(0, 0, 0, 0.6)',
        }}
      >
        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
        <Languages className="w-3.5 h-3.5 text-blue-400" />
        <span>Linguist 翻译</span>
      </button>
    </div>
  );
};

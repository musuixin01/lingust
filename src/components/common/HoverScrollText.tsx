import React, { useState, useRef, useEffect, useId } from 'react';

export interface HoverScrollTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
  speed?: number; // pixels per second (default: 35)
  pauseDelay?: number; // pause at start/end in ms
  as?: 'div' | 'span' | 'p';
  title?: string;
  onClick?: (e: React.MouseEvent) => void;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  isHovered?: boolean;
}

export const HoverScrollText: React.FC<HoverScrollTextProps> = ({
  text,
  className = '',
  style = {},
  speed = 35,
  as: Component = 'div',
  title,
  onClick,
  prefix,
  suffix,
  isHovered: propHovered,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [internalHovered, setInternalHovered] = useState(false);
  const [isOverflow, setIsOverflow] = useState(false);
  const [overflowDistance, setOverflowDistance] = useState(0);
  const animId = useId().replace(/:/g, '_');

  const isHovered = propHovered !== undefined ? propHovered : internalHovered;

  // Measure overflow accurately whenever text or container changes
  useEffect(() => {
    const checkOverflow = () => {
      if (!containerRef.current || !textRef.current) return;
      const clientW = textRef.current.parentElement?.clientWidth || containerRef.current.clientWidth;
      const scrollW = textRef.current.scrollWidth;
      const overflow = scrollW > clientW + 2;
      setIsOverflow(overflow);
      setOverflowDistance(overflow ? Math.ceil(scrollW - clientW) : 0);
    };

    checkOverflow();

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => {
        checkOverflow();
      });
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [text]);

  // Calculate duration based on distance to ensure consistent reading speed
  const extraPadding = 16;
  const totalDistance = overflowDistance + extraPadding;
  const duration = Math.max(2.5, totalDistance / speed);

  return (
    <Component
      ref={containerRef as any}
      title={title}
      onClick={onClick}
      onMouseEnter={() => setInternalHovered(true)}
      onMouseLeave={() => setInternalHovered(false)}
      style={style}
      className={`relative overflow-hidden whitespace-nowrap select-text ${className}`}
    >
      {/* Keyframes style tag injected dynamically when overflowed */}
      {isOverflow && (
        <style>{`
          @keyframes hoverScroll_${animId} {
            0%, 15% {
              transform: translateX(0px);
            }
            75%, 85% {
              transform: translateX(-${totalDistance}px);
            }
            100% {
              transform: translateX(0px);
            }
          }
        `}</style>
      )}

      <div className="flex items-center w-full">
        {prefix}
        <div className="flex-1 min-w-0 overflow-hidden">
          <span
            ref={textRef}
            style={{
              display: 'inline-block',
              whiteSpace: 'nowrap',
              animation:
                isHovered && isOverflow
                  ? `hoverScroll_${animId} ${duration}s ease-in-out infinite`
                  : 'none',
              transform: isHovered && isOverflow ? undefined : 'translateX(0px)',
              transition: isHovered && isOverflow ? 'none' : 'transform 0.3s ease-out',
            }}
          >
            {text}
          </span>
        </div>
        {suffix}
      </div>
    </Component>
  );
};

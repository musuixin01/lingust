import React, { useEffect, useState, useRef } from 'react';

interface AppleAIBreathingGlowProps {
  /** 是否处于翻译状态 */
  active: boolean;
}

type GlowPhase = 'idle' | 'active' | 'dissolving';

/**
 * AppleAIBreathingGlow
 * 类似苹果 AI（Siri / Apple Intelligence）响应时的向内弥散呼吸流光
 * - 预缓存 GPU 合成层架构：消除初次创建 DOM 时的管线重排与跳帧
 * - 纯自然晨曦唤醒（Active Phase）：700ms 柔和升温对焦，接入 3.8s 静息呼吸节奏
 * - 舒缓温润潮汐退场（Dissolving Phase）：翻译完成时保持 850ms 优雅消融（柔焦融散 + 余晖渐隐），杜绝断崖式暗淡或突兀截断
 * - 静止休眠态（Idle Phase）：非翻译状态下 visibility: hidden 彻底绝缘，零漏光、零事件拦截、零开销
 */
export const AppleAIBreathingGlow: React.FC<AppleAIBreathingGlowProps> = ({ active }) => {
  const [phase, setPhase] = useState<GlowPhase>(active ? 'active' : 'idle');
  const prevActiveRef = useRef(active);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // 状态未发生布尔切换时无需处理
    if (prevActiveRef.current === active) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (active) {
      // 翻译发起：立即切入唤醒阶段（平滑升温对焦）
      setPhase('active');
    } else if (prevActiveRef.current) {
      // 翻译刚完成：切入 850ms 优雅消融阶段（余晖散开，平缓退潮）
      setPhase('dissolving');
      timerRef.current = setTimeout(() => {
        setPhase('idle');
        timerRef.current = null;
      }, 850);
    }

    prevActiveRef.current = active;

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [active]);

  return (
    <div
      className={`pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden z-20 apple-ai-glow-host is-${phase}`}
      aria-hidden="true"
    >
      {/* 1. 向内弥散漫射呼吸光幕 */}
      <div className="apple-ai-inward-bloom" />
      {/* 2. 极精细 1.5px 七彩边框轮廓线 */}
      <div className="apple-ai-edge-line" />
    </div>
  );
};


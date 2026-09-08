import React, { useState } from 'react';
import {
  Globe,
  FileText,
  Search,
  Wifi,
  Sparkles,
  Bookmark,
  ExternalLink,
  HelpCircle,
  Lightbulb,
  MousePointer,
  ChevronRight,
  Zap,
  Crop,
  Download,
  Laptop,
} from 'lucide-react';
import { AppSettings } from '../../types';

interface DesktopSimulatorProps {
  settings: AppSettings;
  onQuickSelectWord: (text: string) => void;
  onOpenSnipper?: () => void;
  onOpenInstallModal?: () => void;
  isDark?: boolean;
}

export const DesktopSimulator: React.FC<DesktopSimulatorProps> = ({
  settings,
  onQuickSelectWord,
  onOpenSnipper,
  onOpenInstallModal,
  isDark = true,
}) => {
  const [activeTab, setActiveTab] = useState<'tech' | 'story' | 'vocab' | 'bilingual'>('bilingual');

  return (
    <div
      id="desktop-simulator-workspace"
      className="w-full h-full flex flex-col relative overflow-hidden select-text"
    >
      {/* macOS Desktop Top Menu Bar */}
      <header className="h-7 w-full bg-black/40 backdrop-blur-md border-b border-white/10 px-3.5 flex items-center justify-between text-xs text-slate-200 z-20 select-none">
        <div className="flex items-center gap-4">
          <div className="font-bold text-[13px] flex items-center gap-1.5 text-white">
            <span className="text-sm"></span>
            <span className="font-semibold text-xs tracking-tight">Linguist</span>
          </div>
          <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-300">
            <span className="hover:text-white cursor-default">File</span>
            <span className="hover:text-white cursor-default">Edit</span>
            <button
              type="button"
              onClick={onOpenSnipper}
              className="hover:text-blue-300 text-blue-400 font-medium flex items-center gap-1 cursor-pointer"
              title="截图翻译"
            >
              <Crop className="w-3 h-3" />
              <span>截图翻译</span>
            </button>
            {onOpenInstallModal && (
              <button
                type="button"
                onClick={onOpenInstallModal}
                className="hover:text-emerald-300 text-emerald-400 font-medium flex items-center gap-1 cursor-pointer"
                title="免重复下载，安装为独立桌面软件"
              >
                <Laptop className="w-3 h-3" />
                <span>安装为桌面端 (PWA)</span>
              </button>
            )}
            <span className="hover:text-white cursor-default">Window</span>
            <span className="hover:text-white cursor-default">Help</span>
          </div>
        </div>

        {/* Right status bar */}
        <div className="flex items-center gap-3 text-[11px] text-slate-300">
          {onOpenInstallModal && (
            <button
              type="button"
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/25 hover:bg-emerald-500/40 text-[10px] text-emerald-200 border border-emerald-400/40 transition-all cursor-pointer shadow-xs active:scale-95"
              title="一键安装为独立桌面软件，免下载秒安装"
            >
              <Download className="w-3 h-3 text-emerald-400" />
              <span>安装桌面版</span>
            </button>
          )}
          <button
            type="button"
            onClick={onOpenSnipper}
            className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 hover:bg-blue-500/30 text-[10px] text-blue-300 border border-blue-400/30 transition-all cursor-pointer"
            title="点击启动截图/框选翻译"
          >
            <Crop className="w-3 h-3 text-blue-400 animate-pulse" />
            <span>截图翻译 (中英逐行)</span>
          </button>
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/10 text-[10px] text-emerald-300 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>划词翻译: {settings.selectionTranslation ? '已就绪' : '已关闭'}</span>
          </div>
          <Wifi className="w-3.5 h-3.5 text-slate-300" />
          <span className="font-mono text-[11px]">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </header>

      {/* Main Desktop Area with Mock Browser / Article Reader Window */}
      <div className="flex-1 p-2 sm:p-4 md:p-6 lg:p-8 flex flex-col items-center justify-start overflow-y-auto z-10 pb-20 w-full max-w-5xl mx-auto">
        {/* Floating guidance banner */}
        <div className="w-full mb-3 p-2.5 sm:p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-slate-100 flex items-center justify-between gap-2.5 shadow-lg">
          <div className="flex items-center gap-2 text-xs min-w-0">
            <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
              <MousePointer className="w-3.5 h-3.5" />
            </div>
            <div className="truncate sm:whitespace-normal">
              <span className="font-semibold text-white">使用指南：</span>
              <span className="text-slate-200 text-[11px] sm:text-xs">
                在文档中划词直接翻译，点击「截图翻译」框选文字逐行对照；拖动卡片边缘可自由拉伸缩小直至药丸胶囊！
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenInstallModal && (
              <button
                type="button"
                onClick={onOpenInstallModal}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors flex items-center gap-1 cursor-pointer shadow-md"
              >
                <Laptop className="w-3 h-3" />
                <span className="hidden xs:inline">安装桌面端</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenSnipper}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors flex items-center gap-1 cursor-pointer shadow-md"
            >
              <Crop className="w-3 h-3" />
              <span className="hidden xs:inline">截屏识字</span>
            </button>
          </div>
        </div>

        {/* Mock Application Window (Safari / Notes / Literature Reader) */}
        <div
          id="mock-browser-document"
          className="w-full rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-white/15 shadow-2xl overflow-hidden text-slate-200 flex flex-col"
        >
          {/* Mock Browser Header */}
          <div className="px-3 sm:px-4 py-2 border-b border-white/10 bg-slate-950/40 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-2 min-w-0">
              <div className="flex gap-1.5 shrink-0">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <div className="ml-1 sm:ml-3 px-2 sm:px-3 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] text-slate-300 flex items-center gap-1.5 max-w-[180px] sm:max-w-xs truncate">
                <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                <span className="truncate">reader.digest/daily</span>
              </div>
            </div>

            {/* Switch tabs with smooth pill animations */}
            <div className="flex items-center gap-1 text-xs overflow-x-auto max-w-full py-0.5 no-scrollbar">
              {[
                { id: 'bilingual', label: '经典双语' },
                { id: 'tech', label: '前沿科技' },
                { id: 'story', label: '双语散文' },
                { id: 'vocab', label: '高频词汇' },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-2.5 py-1 rounded-lg transition-all duration-200 ease-out whitespace-nowrap interactive-button ${
                      isActive
                        ? 'bg-white/20 text-white font-medium shadow-xs ring-1 ring-white/20'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Article Content with smooth micro-transition on tab change */}
          <div key={activeTab} className="p-6 md:p-8 space-y-6 text-sm leading-relaxed animate-view-scale">
            {activeTab === 'bilingual' && (
              <>
                <div className="border-b border-white/10 pb-4 flex items-center justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-1 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3" /> Literature Reader • Interleaved Bilingual Demo
                    </div>
                    <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                      Morning Reflections & Dreams
                    </h1>
                  </div>
                  {onOpenSnipper && (
                    <button
                      type="button"
                      onClick={onOpenSnipper}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                      title="截取下方段落体验一句一对照"
                    >
                      <Crop className="w-3.5 h-3.5" />
                      <span>截此区域</span>
                    </button>
                  )}
                </div>

                {/* The exact passage from user's image */}
                <div className="space-y-4 font-sans text-base leading-relaxed text-slate-100">
                  <p>
                    <strong>The sun rises every morning, bringing a brand new day.</strong>
                  </p>
                  <p>
                    <strong>We all have dreams in our hearts.</strong>
                  </p>
                  <p>
                    <strong>However, big dreams do not come true overnight.</strong>
                  </p>
                  <p>
                    <strong>They need our time, patience, and hard work.</strong>
                  </p>
                  <p>
                    <strong>Do not be afraid of small steps.</strong>
                  </p>
                  <p>
                    <strong>When you read one page of a book today, you learn something new.</strong>
                  </p>
                </div>
              </>
            )}
            {activeTab === 'tech' && (
              <>
                <div className="border-b border-white/10 pb-4">
                  <div className="text-xs uppercase tracking-wider text-blue-400 font-semibold mb-1 flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3" /> Tech Digest • Next-Gen AI & Computational Linguistics
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    The Modern Architectures of Real-Time Desktop Translation
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    Published by AI Systems Review • 5 min read • Try highlighting any phrase below
                  </p>
                </div>

                <p className="text-slate-200">
                  In computational linguistics, an intelligent floating assistant allows researchers and polyglots to
                  read foreign documentation effortlessly. The <mark className="bg-blue-500/30 text-white rounded px-1">linguist</mark> card
                  hovers gently on top of the workspace without obstructing the viewport, granting ubiquitous access to contextual translations.
                </p>

                <p className="text-slate-300">
                  Historically, desktop tools were clunky and intrusive. Contemporary interface design prioritizes
                  translucency, fluid animations, and immediate mouse selection translation. When an engineer selects an unfamiliar keyword like
                  <span className="font-semibold text-blue-300 mx-1">phenomenon</span>,
                  <span className="font-semibold text-blue-300 mx-1">ubiquitous</span>, or
                  <span className="font-semibold text-blue-300 mx-1">serendipity</span>,
                  the desktop translator automatically parses the word, retrieves accurate IPA phonetic symbols, and generates nuanced grammatical definitions.
                </p>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-xs italic text-slate-300">
                  "The limits of my language mean the limits of my world." — Ludwig Wittgenstein
                </div>
              </>
            )}

            {activeTab === 'story' && (
              <>
                <div className="border-b border-white/10 pb-4">
                  <div className="text-xs uppercase tracking-wider text-amber-400 font-semibold mb-1 flex items-center gap-1.5">
                    <Bookmark className="w-3 h-3" /> Literature & Prose • The Poetics of Space
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    An Ode to Ephemeral Moments and Morning Light
                  </h1>
                </div>

                <p className="text-slate-200">
                  There is an undeniable <span className="underline decoration-amber-400/50 underline-offset-4">elegance</span> in quiet contemplation.
                  As dawn breaks across the horizon, the golden light filters through translucent panes of glass, casting delicate reflections upon the wooden desk.
                </p>

                <p className="text-slate-300">
                  Words are vessels of human sentiment. The word <span className="font-semibold text-amber-300">nostalgia</span> evokes bittersweet memories of places once cherished,
                  while <span className="font-semibold text-amber-300">wanderlust</span> ignites the irresistible urge to venture beyond familiar boundaries.
                  Translating literature requires not merely lexical substitution, but capturing the poetic resonance between souls.
                </p>
              </>
            )}

            {activeTab === 'vocab' && (
              <>
                <div className="border-b border-white/10 pb-4">
                  <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold mb-1 flex items-center gap-1.5">
                    <Zap className="w-3 h-3" /> Vocabulary Cards • High Frequency Word Bank
                  </div>
                  <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                    Core Academic & Literary Vocabulary
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">
                    点击或划词选择任意词条，查看卡片精准音标及多重词义
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { word: 'eloquent', meaning: '雄辩的，有说服力的', sample: 'She delivered an eloquent defense of human rights.' },
                    { word: 'meticulous', meaning: '一丝不苟的，缜密的', sample: 'He was meticulous about keeping his records clean.' },
                    { word: 'resilience', meaning: '恢复力，坚韧不拔', sample: 'The team showed tremendous resilience under pressure.' },
                    { word: 'ephemeral', meaning: '短暂的，瞬息即逝的', sample: 'Fame in the digital age is often ephemeral.' },
                  ].map((item) => (
                    <div
                      key={item.word}
                      className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:border-blue-400/40 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-base">{item.word}</span>
                        <button
                          type="button"
                          onClick={() => onQuickSelectWord(item.word)}
                          className="text-[11px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
                        >
                          <span>查词</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 mt-1">{item.meaning}</p>
                      <p className="text-[11px] text-slate-400 mt-1.5 italic">"{item.sample}"</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

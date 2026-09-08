import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Sliders,
  Volume2,
  MousePointerClick,
  Eye,
  Monitor,
  Sparkles,
  Globe,
  BookOpen,
  WifiOff,
  Key,
  CheckCircle2,
  AlertCircle,
  EyeOff,
  RotateCw,
  Cpu,
  Type,
  Laptop,
  Download,
  Music,
  Minus,
  Maximize2,
  Pin,
  Command,
} from 'lucide-react';
import { AppSettings, TranslationEngine, EngineApiKeys } from '../../types';

export interface SettingsWindowProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  isDark?: boolean;
  onOpenInstallModal?: () => void;
}

type SettingsTab = 'engines' | 'selection' | 'appearance' | 'music' | 'desktop';

export const SettingsWindow: React.FC<SettingsWindowProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onOpenInstallModal,
}) => {
  // Standalone window position & drag state
  const [position, setPosition] = useState<{ x: number; y: number }>(() => {
    const defaultX = Math.max(20, window.innerWidth / 2 - 270);
    const defaultY = Math.max(50, Math.min(100, (window.innerHeight - 560) / 2));
    return { x: defaultX, y: defaultY };
  });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>('engines');

  // Local state for password visibility
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showDeeplKey, setShowDeeplKey] = useState(false);
  const [showYoudaoSecret, setShowYoudaoSecret] = useState(false);

  // Test connection state
  const [testingEngine, setTestingEngine] = useState<TranslationEngine | null>(null);
  const [testResult, setTestResult] = useState<{
    engine: TranslationEngine;
    success: boolean;
    message: string;
  } | null>(null);

  const windowRef = useRef<HTMLDivElement>(null);
  const currentEngine = settings.translationEngine || 'gemini';
  const engineKeys = settings.engineKeys || {};

  // Dragging logic
  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const newX = Math.max(10, Math.min(window.innerWidth - 260, e.clientX - dragOffset.x));
      const newY = Math.max(30, Math.min(window.innerHeight - 80, e.clientY - dragOffset.y));
      setPosition({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset]);

  const handleKeyChange = (keyField: keyof EngineApiKeys, value: string) => {
    onUpdateSettings({
      engineKeys: {
        ...engineKeys,
        [keyField]: value,
      },
    });
    if (testResult) setTestResult(null);
  };

  const handleTestConnection = async (engine: TranslationEngine) => {
    setTestingEngine(engine);
    setTestResult(null);
    try {
      const res = await fetch('/api/test-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          engine,
          keys: engineKeys,
        }),
      });
      const data = await res.json();
      setTestResult({
        engine,
        success: Boolean(data.success),
        message: data.message || (data.success ? '连接成功！' : '连接失败'),
      });
    } catch (err: any) {
      setTestResult({
        engine,
        success: false,
        message: `测试异常: ${err.message || '网络连接失败'}`,
      });
    } finally {
      setTestingEngine(null);
    }
  };

  if (!isOpen) return null;

  // Minimized Floating Pill Mode
  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 9000,
        }}
        onMouseDown={handleMouseDown}
        className="select-none animate-in zoom-in-95 duration-150 rounded-full backdrop-blur-3xl bg-slate-900/90 border border-white/20 text-white shadow-2xl flex items-center px-3 py-1.5 gap-2 cursor-grab active:cursor-grabbing hover:border-blue-400/40 transition-all group"
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-semibold">偏好设置 (已最小化)</span>
        </div>
        <div className="no-drag flex items-center gap-1 ml-1 pl-2 border-l border-white/10">
          <button
            type="button"
            onClick={() => setIsMinimized(false)}
            className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition"
            title="还原设置窗口"
          >
            <Maximize2 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-white/60 hover:text-rose-400 hover:bg-white/10 transition"
            title="关闭设置"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={windowRef}
      style={{
        position: 'fixed',
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '540px',
        maxWidth: 'calc(100vw - 24px)',
        maxHeight: 'calc(100vh - 60px)',
        zIndex: 9000,
        boxShadow:
          '0 30px 80px -10px rgba(0,0,0,0.85), 0 10px 30px rgba(0,0,0,0.5), 0 0 30px rgba(59,130,246,0.15)',
      }}
      className={`select-none rounded-[26px] backdrop-blur-3xl bg-slate-900/92 border border-white/20 text-white flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 transition-[box-shadow,border-color] ${
        isDragging ? 'border-blue-400/50 ring-1 ring-blue-400/30' : ''
      }`}
    >
      {/* Window Title Bar with macOS Traffic Lights & Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={`px-4 py-3 border-b border-white/10 bg-slate-950/40 flex items-center justify-between shrink-0 ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* Left: Traffic Lights */}
        <div className="no-drag flex items-center gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 shadow-xs transition-opacity cursor-pointer"
            title="关闭设置窗口"
          />
          <button
            type="button"
            onClick={() => setIsMinimized(true)}
            className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 shadow-xs transition-opacity cursor-pointer"
            title="最小化为桌面药丸"
          />
          <button
            type="button"
            onClick={() => {
              setPosition({
                x: Math.max(20, window.innerWidth / 2 - 270),
                y: Math.max(50, (window.innerHeight - 560) / 2),
              });
            }}
            className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 shadow-xs transition-opacity cursor-pointer"
            title="重置居中窗口"
          />
        </div>

        {/* Center: Title & Engine Badge */}
        <div className="flex items-center gap-2 font-semibold text-xs text-white/90">
          <Sliders className="w-3.5 h-3.5 text-blue-400" />
          <span>Linguist 独立偏好设置</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-blue-300 font-mono">
            {currentEngine.toUpperCase()}
          </span>
        </div>

        {/* Right: Quick actions */}
        <div className="no-drag flex items-center gap-1.5 text-white/60">
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="关闭"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Tab Bar (Frosted Pills) */}
      <div className="no-drag px-3.5 py-2 border-b border-white/10 bg-white/5 flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 text-xs">
        {[
          { id: 'engines', label: '翻译引擎', icon: Cpu },
          { id: 'selection', label: '划词交互', icon: MousePointerClick },
          { id: 'appearance', label: '视觉与字号', icon: Type },
          { id: 'music', label: '灵动岛音乐', icon: Music },
          { id: 'desktop', label: '独立桌面端', icon: Laptop },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as SettingsTab)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-all duration-200 ease-out whitespace-nowrap cursor-pointer interactive-button ${
                isActive
                  ? 'bg-blue-500/25 text-blue-300 border border-blue-400/40 shadow-xs ring-1 ring-blue-500/20'
                  : 'text-white/60 hover:text-white hover:bg-white/10 border border-transparent'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Window Body (Scrollable Content in unified dark frosted glass) */}
      <div className="no-drag flex-1 overflow-y-auto p-4 space-y-4 text-xs select-text">
        {/* TAB 1: 翻译引擎与 API 配置 */}
        {activeTab === 'engines' && (
          <div key="engines" className="space-y-3.5 animate-view-scale">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Cpu className="w-4 h-4 text-blue-400" />
                <span>翻译引擎配置与专属密钥</span>
              </div>
              <span className="text-[11px] text-white/50">
                当前活跃: <strong className="text-blue-400 uppercase">{currentEngine}</strong>
              </span>
            </div>

            {/* Engine Selection Grid */}
            <div className="grid grid-cols-2 gap-2">
              {/* 1. Gemini */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ translationEngine: 'gemini' })}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  currentEngine === 'gemini'
                    ? 'border-blue-400/50 bg-blue-500/15 text-white ring-1 ring-blue-500/30'
                    : 'border-white/10 bg-white/5 text-white/70 hover:border-blue-400/30 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-white">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    <span>Gemini AI</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-medium">
                    深度语境
                  </span>
                </div>
                <p className="text-[10px] text-white/60 leading-snug">
                  Google Gemini 深度理解，详实音标、全词性拆解与双语例句
                </p>
              </button>

              {/* 2. DeepL */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ translationEngine: 'deepl' })}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  currentEngine === 'deepl'
                    ? 'border-indigo-400/50 bg-indigo-500/15 text-white ring-1 ring-indigo-500/30'
                    : 'border-white/10 bg-white/5 text-white/70 hover:border-indigo-400/30 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-white">
                    <Globe className="w-3.5 h-3.5 text-indigo-400" />
                    <span>DeepL 翻译</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-medium">
                    神经流利
                  </span>
                </div>
                <p className="text-[10px] text-white/60 leading-snug">
                  业界顶级流利度，支持 DeepL Free 与 Pro 官方密钥
                </p>
              </button>

              {/* 3. Youdao */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ translationEngine: 'youdao' })}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  currentEngine === 'youdao'
                    ? 'border-emerald-400/50 bg-emerald-500/15 text-white ring-1 ring-emerald-500/30'
                    : 'border-white/10 bg-white/5 text-white/70 hover:border-emerald-400/30 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-white">
                    <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
                    <span>有道词典</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                    权威汉英
                  </span>
                </div>
                <p className="text-[10px] text-white/60 leading-snug">
                  权威中英词典真题释义，全面支持专八/考研权威词义
                </p>
              </button>

              {/* 4. Offline */}
              <button
                type="button"
                onClick={() => onUpdateSettings({ translationEngine: 'offline' })}
                className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                  currentEngine === 'offline'
                    ? 'border-amber-400/50 bg-amber-500/15 text-white ring-1 ring-amber-500/30'
                    : 'border-white/10 bg-white/5 text-white/70 hover:border-amber-400/30 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-white">
                    <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                    <span>离线词库 / 翻译</span>
                  </div>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium">
                    100% 离线
                  </span>
                </div>
                <p className="text-[10px] text-white/60 leading-snug">
                  完全脱机运行，内置高频常用词典与形态识别，零延迟
                </p>
              </button>
            </div>

            {/* Selected Engine Configuration Panel */}
            <div className="p-3.5 rounded-2xl border border-white/10 bg-white/5 space-y-3">
              {currentEngine === 'gemini' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      <Key className="w-3.5 h-3.5 text-blue-400" />
                      <span>Gemini API Key 配置</span>
                    </div>
                    <span className="text-[10px] text-emerald-400 font-medium">
                      {engineKeys.geminiKey ? '● 自定义密钥生效中' : '● 系统默认内置通道生效中'}
                    </span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showGeminiKey ? 'text' : 'password'}
                      value={engineKeys.geminiKey || ''}
                      onChange={(e) => handleKeyChange('geminiKey', e.target.value)}
                      placeholder="留空则自动使用内置 Gemini 密钥"
                      className="w-full pr-16 pl-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs font-mono text-white placeholder-white/40 focus:outline-hidden focus:border-blue-400"
                    />
                    <div className="absolute right-1.5 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                        className="p-1 text-white/50 hover:text-white transition-colors"
                        title={showGeminiKey ? '隐藏' : '显示'}
                      >
                        {showGeminiKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/60">
                    <span>支持配置个人专属 Google Gemini API Key</span>
                    <button
                      type="button"
                      disabled={testingEngine === 'gemini'}
                      onClick={() => handleTestConnection('gemini')}
                      className="px-3 py-1 rounded-lg text-[10px] font-medium bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      {testingEngine === 'gemini' && <RotateCw className="w-2.5 h-2.5 animate-spin" />}
                      测试连通性
                    </button>
                  </div>
                </div>
              )}

              {currentEngine === 'deepl' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      <Key className="w-3.5 h-3.5 text-indigo-400" />
                      <span>DeepL API Key 配置</span>
                    </div>
                    <span className="text-[10px] text-white/50">支持 Free (:fx) 与 Pro</span>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type={showDeeplKey ? 'text' : 'password'}
                      value={engineKeys.deeplKey || ''}
                      onChange={(e) => handleKeyChange('deeplKey', e.target.value)}
                      placeholder="输入 DeepL API Key (例如 12345678-xxxx-...:fx)"
                      className="w-full pr-16 pl-3 py-2 bg-black/40 border border-white/15 rounded-xl text-xs font-mono text-white placeholder-white/40 focus:outline-hidden focus:border-indigo-400"
                    />
                    <div className="absolute right-1.5 flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setShowDeeplKey(!showDeeplKey)}
                        className="p-1 text-white/50 hover:text-white transition-colors"
                        title={showDeeplKey ? '隐藏' : '显示'}
                      >
                        {showDeeplKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/60">
                    <span>前往 deepl.com/pro-api 申请免费或专业密钥</span>
                    <button
                      type="button"
                      disabled={testingEngine === 'deepl'}
                      onClick={() => handleTestConnection('deepl')}
                      className="px-3 py-1 rounded-lg text-[10px] font-medium bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      {testingEngine === 'deepl' && <RotateCw className="w-2.5 h-2.5 animate-spin" />}
                      测试连通性
                    </button>
                  </div>
                </div>
              )}

              {currentEngine === 'youdao' && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-white">
                      <Key className="w-3.5 h-3.5 text-emerald-400" />
                      <span>有道智云凭证配置</span>
                    </div>
                    <span className="text-[10px] text-white/50">openapi.youdao.com</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-white/60 mb-1 block">应用 ID (AppKey)</label>
                      <input
                        type="text"
                        value={engineKeys.youdaoAppKey || ''}
                        onChange={(e) => handleKeyChange('youdaoAppKey', e.target.value)}
                        placeholder="有道智云 AppKey"
                        className="w-full px-3 py-1.5 bg-black/40 border border-white/15 rounded-xl text-xs font-mono text-white placeholder-white/40 focus:outline-hidden focus:border-emerald-400"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-white/60 mb-1 block">应用密钥 (AppSecret)</label>
                      <div className="relative flex items-center">
                        <input
                          type={showYoudaoSecret ? 'text' : 'password'}
                          value={engineKeys.youdaoAppSecret || ''}
                          onChange={(e) => handleKeyChange('youdaoAppSecret', e.target.value)}
                          placeholder="有道智云 AppSecret"
                          className="w-full pr-8 px-3 py-1.5 bg-black/40 border border-white/15 rounded-xl text-xs font-mono text-white placeholder-white/40 focus:outline-hidden focus:border-emerald-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowYoudaoSecret(!showYoudaoSecret)}
                          className="absolute right-1.5 p-1 text-white/50 hover:text-white transition-colors"
                        >
                          {showYoudaoSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-white/60 pt-0.5">
                    <span>登录有道智云控制台创建“文本翻译”应用获取</span>
                    <button
                      type="button"
                      disabled={testingEngine === 'youdao'}
                      onClick={() => handleTestConnection('youdao')}
                      className="px-3 py-1 rounded-lg text-[10px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      {testingEngine === 'youdao' && <RotateCw className="w-2.5 h-2.5 animate-spin" />}
                      测试连通性
                    </button>
                  </div>
                </div>
              )}

              {currentEngine === 'offline' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-semibold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>纯离线词典与形态分析引擎 (100% 离线可用)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-medium">
                      无需网络
                    </span>
                  </div>
                  <p className="text-[11px] text-white/60 leading-relaxed">
                    内置海量高频常用中英词典、国际音标、语法形态词形还原（自动识别复数、过去式、进行时态与副词形式）及日常习惯用语短句。在无网络环境下完全脱机运行，零延迟瞬时响应。
                  </p>
                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      disabled={testingEngine === 'offline'}
                      onClick={() => handleTestConnection('offline')}
                      className="px-3 py-1 rounded-lg text-[10px] font-medium bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                    >
                      {testingEngine === 'offline' && <RotateCw className="w-2.5 h-2.5 animate-spin" />}
                      测试离线词库响应
                    </button>
                  </div>
                </div>
              )}

              {/* Test Result Feedback Banner */}
              {testResult && (
                <div
                  className={`p-2.5 rounded-xl text-xs flex items-start gap-2 animate-in fade-in duration-150 ${
                    testResult.success
                      ? 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-300'
                      : 'bg-rose-500/15 border border-rose-400/30 text-rose-300'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  )}
                  <div className="flex-1 text-[11px] leading-snug break-words">
                    {testResult.message}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: 划词交互 与 触发方式 */}
        {activeTab === 'selection' && (
          <div key="selection" className="space-y-3.5 animate-view-scale">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="space-y-0.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <MousePointerClick className="w-4 h-4 text-blue-400" />
                  <span>开启即时划词翻译</span>
                </div>
                <p className="text-[11px] text-white/60">
                  在任何页面或桌面文档中划词选中，自动或通过气泡触发卡片翻译
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.selectionTranslation}
                  onChange={(e) => onUpdateSettings({ selectionTranslation: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-white/10 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 border border-white/10"></div>
              </label>
            </div>

            {settings.selectionTranslation && (
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ selectionTriggerMode: 'auto' })}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    settings.selectionTriggerMode === 'auto'
                      ? 'border-blue-400/50 bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30'
                      : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold text-white">⚡ 自动填入卡片</div>
                  <div className="text-[10px] mt-1 text-white/60">划词松开即刻静默翻译并展示</div>
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ selectionTriggerMode: 'icon' })}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    settings.selectionTriggerMode === 'icon'
                      ? 'border-blue-400/50 bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30'
                      : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="font-semibold text-white">🎈 鼠标旁悬浮气泡</div>
                  <div className="text-[10px] mt-1 text-white/60">点击气泡图标再弹出翻译，防误触</div>
                </button>
              </div>
            )}

            {/* 自动朗读发音 */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="space-y-0.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 text-blue-400" />
                  <span>查询单字后自动真人发音</span>
                </div>
                <p className="text-[11px] text-white/60">
                  成功获取译文后自动调用系统语音播放英/美原音
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoSpeak}
                  onChange={(e) => onUpdateSettings({ autoSpeak: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-white/10 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 border border-white/10"></div>
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: 视觉与排版 (透明度、字号、壁纸) */}
        {activeTab === 'appearance' && (
          <div key="appearance" className="space-y-3.5 animate-view-scale">
            {/* 卡片透明度 */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-400" />
                  <span>悬浮卡片透明度 (防遮挡)</span>
                </div>
                <span className="font-mono text-xs text-blue-400 font-bold">
                  {Math.round(settings.cardOpacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.55"
                max="1.0"
                step="0.05"
                value={settings.cardOpacity}
                onChange={(e) => onUpdateSettings({ cardOpacity: parseFloat(e.target.value) })}
                className="w-full accent-blue-500 cursor-pointer h-1.5 bg-white/15 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-white/40">
                <span>55% 通透毛玻璃</span>
                <span>80% 平衡质感</span>
                <span>100% 纯黑实体</span>
              </div>
            </div>

            {/* 字体大小 */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Type className="w-4 h-4 text-blue-400" />
                  <span>字体大小与紧凑排版</span>
                </div>
                <span className="font-mono text-xs text-blue-300 font-semibold">
                  {settings.customFontSize
                    ? `${settings.customFontSize}%`
                    : settings.fontSize === 'small'
                    ? '紧凑 (82%)'
                    : settings.fontSize === 'large'
                    ? '大号 (108%)'
                    : '默认 (92%)'}
                </span>
              </div>

              {/* Direct Input Field */}
              <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-black/40 border border-white/10">
                <div className="space-y-0.5 min-w-0">
                  <div className="text-xs font-medium text-white">精确百分比自由输入</div>
                  <div className="text-[10px] text-white/50">
                    默认 92% 解决紧凑卡片字号偏大问题 (范围 60% ~ 150%)
                  </div>
                </div>
                <div className="relative w-24 shrink-0">
                  <input
                    type="number"
                    min={60}
                    max={150}
                    step={1}
                    value={
                      settings.customFontSize ??
                      (settings.fontSize === 'small'
                        ? 82
                        : settings.fontSize === 'large'
                        ? 108
                        : settings.fontSize === 'huge'
                        ? 125
                        : 92)
                    }
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val)) {
                        onUpdateSettings({
                          customFontSize: Math.max(60, Math.min(150, val)),
                          fontSize: 'custom',
                        });
                      }
                    }}
                    className="w-full px-2 py-1 text-center font-mono font-bold text-xs rounded-lg bg-white/10 border border-white/20 text-white focus:outline-hidden focus:border-blue-400 pr-6"
                  />
                  <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-white/40 font-mono pointer-events-none">
                    %
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { id: 'small', percent: 82, label: '小号', scale: '82%', desc: '紧凑自适应' },
                  { id: 'medium', percent: 92, label: '默认', scale: '92%', desc: '精致协调' },
                  { id: 'standard', percent: 100, label: '标准', scale: '100%', desc: '平衡阅读' },
                  { id: 'large', percent: 108, label: '大号', scale: '108%', desc: '舒缓清晰' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() =>
                      onUpdateSettings({
                        customFontSize: f.percent,
                        fontSize: f.id === 'medium' ? 'medium' : f.id === 'small' ? 'small' : 'custom',
                      })
                    }
                    className={`py-2 px-1.5 rounded-xl border text-center transition-all cursor-pointer ${
                      settings.customFontSize === f.percent ||
                      (!settings.customFontSize &&
                        ((f.id === 'medium' && (!settings.fontSize || settings.fontSize === 'medium')) ||
                          settings.fontSize === f.id))
                        ? 'border-blue-400/50 bg-blue-500/20 text-blue-300 font-semibold shadow-xs ring-1 ring-blue-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/25 text-white/70'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white">{f.label}</div>
                    <div className="text-[10px] text-blue-400 font-mono mt-0.5">{f.scale}</div>
                    <div className="text-[9px] text-white/40 mt-0.5">{f.desc}</div>
                  </button>
                ))}
              </div>

              {/* Dynamic Compact Layout Switch */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-white/60 text-[11px]">
                  动态紧凑排版 (拉小卡片时自动收紧行距与外边距)
                </span>
                <button
                  type="button"
                  onClick={() => onUpdateSettings({ compactMode: !settings.compactMode })}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                    settings.compactMode
                      ? 'bg-blue-600 text-white border-blue-500'
                      : 'bg-white/5 text-white/50 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {settings.compactMode ? '已开启' : '自适应尺寸'}
                </button>
              </div>
            </div>

            {/* Desktop Wallpaper Environment */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Monitor className="w-4 h-4 text-blue-400" />
                <span>桌面壁纸氛围</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {[
                  { id: 'frosted-glass', label: '极光夜空', color: 'bg-gradient-to-br from-[#1c1340] via-[#09153a] to-[#0a0a1a]' },
                  { id: 'sonoma-dark', label: '深色 Sonoma', color: 'bg-gradient-to-br from-[#1a1c29] to-[#0d0f18]' },
                  { id: 'monterey', label: 'Monterey 紫晶', color: 'bg-gradient-to-br from-[#2b1055] to-[#7597de]' },
                  { id: 'graphite', label: '石墨深空', color: 'bg-gradient-to-br from-[#121217] to-[#1f222e]' },
                  { id: 'minimal-light', label: '极简白昼', color: 'bg-gradient-to-br from-[#e0e7ff] to-[#f8fafc]' },
                ].map((wp) => (
                  <button
                    key={wp.id}
                    type="button"
                    onClick={() => onUpdateSettings({ desktopWallpaper: wp.id as any })}
                    className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl border transition-all cursor-pointer ${
                      settings.desktopWallpaper === wp.id
                        ? 'border-blue-400 bg-blue-500/20 ring-1 ring-blue-500/40'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className={`w-full h-8 rounded-lg ${wp.color} shadow-xs border border-white/10`} />
                    <span className="text-[9px] text-white/80 truncate max-w-full">{wp.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: 灵动岛音乐与歌词 */}
        {activeTab === 'music' && (
          <div key="music" className="space-y-3.5 animate-view-scale">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/10">
              <div className="space-y-0.5">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Music className="w-4 h-4 text-emerald-400" />
                  <span>启用药丸灵动岛音乐模块</span>
                </div>
                <p className="text-[11px] text-white/60">
                  卡片收缩为药丸胶囊时，呈现如 Dynamic Island 般的黑胶唱片律动与逐句中英双语歌词
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pillMusicEnabled ?? true}
                  onChange={(e) => onUpdateSettings({ pillMusicEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-10 h-5 bg-white/10 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600 border border-white/10"></div>
              </label>
            </div>

            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>药丸展示偏好</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'auto', title: '智能轮播 (自动)', desc: '有歌播放音乐，查词自动切回' },
                  { id: 'translation', title: '专注翻译', desc: '始终固定展示单行/双行跑马灯翻译' },
                  { id: 'music', title: '音乐胶囊', desc: '优先展示黑胶唱片律动与歌词' },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => onUpdateSettings({ pillIslandMode: mode.id as any })}
                    className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                      (settings.pillIslandMode || 'auto') === mode.id
                        ? 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                        : 'border-white/10 bg-white/5 text-white/60 hover:bg-white/10'
                    }`}
                  >
                    <div className="font-semibold text-white text-xs">{mode.title}</div>
                    <div className="text-[10px] text-white/50 mt-0.5 leading-snug">{mode.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: 独立桌面端与快捷键 */}
        {activeTab === 'desktop' && (
          <div key="desktop" className="space-y-3.5 animate-view-scale">
            {/* PWA Section */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/15 via-indigo-500/10 to-transparent border border-blue-400/30 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="font-semibold flex items-center gap-1.5 text-xs text-blue-300">
                  <Laptop className="w-4 h-4 text-blue-400" />
                  <span>独立桌面无边框应用 (PWA)</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-medium">
                  一键秒装 · 自动更新
                </span>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed">
                无需笨重的安装包与漫长等待，通过系统原生 PWA 协议即可将 Linguist 安装为独立的桌面窗口应用。云端代码更新时自动热同步，支持桌面快捷方式启动。
              </p>
              {onOpenInstallModal && (
                <button
                  type="button"
                  onClick={onOpenInstallModal}
                  className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] cursor-pointer"
                >
                  <Download size={14} />
                  <span>打开桌面端安装引导窗口</span>
                </button>
              )}
            </div>

            {/* Shortcut Cheatsheet */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="font-semibold text-white flex items-center gap-1.5">
                <Command className="w-4 h-4 text-blue-400" />
                <span>全局核心快捷交互</span>
              </div>
              <div className="space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-white/70">快速清空 / 重置输入</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-white/10 font-mono text-[10px] text-white/90 border border-white/10">
                    红绿灯红点 / Backspace
                  </kbd>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-white/70">卡片折叠收缩为药丸</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-white/10 font-mono text-[10px] text-white/90 border border-white/10">
                    红绿灯黄点 / 拉至极扁
                  </kbd>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-white/5">
                  <span className="text-white/70">截图翻译 (逐行对照)</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-white/10 font-mono text-[10px] text-white/90 border border-white/10">
                    顶部工具栏「截图翻译」
                  </kbd>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-white/70">取消截图 / 关闭当前窗口</span>
                  <kbd className="px-2 py-0.5 rounded-md bg-white/10 font-mono text-[10px] text-white/90 border border-white/10">
                    ESC
                  </kbd>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Window Footer */}
      <div
        className="px-5 py-3 border-t border-white/10 bg-slate-950/40 flex items-center justify-between shrink-0"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        }}
      >
        <div className="text-[11px] text-white/40">
          设置自动持久化于浏览器本地存储
        </div>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white shadow-md transition-colors cursor-pointer"
        >
          完成
        </button>
      </div>
    </div>
  );
};

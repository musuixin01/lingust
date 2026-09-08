import React, { useState } from 'react';
import {
  Download,
  Monitor,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  X,
  Sparkles,
  Laptop,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [copied, setCopied] = useState(false);
  const currentUrl = window.location.href;

  if (!isOpen) return null;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenStandalone = () => {
    window.open(currentUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-soft-fade">
      <div
        className="relative w-full max-w-md rounded-[26px] bg-slate-900/92 border border-white/20 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.85),0_0_30px_rgba(59,130,246,0.15)] backdrop-blur-3xl text-white select-none overflow-hidden animate-view-scale"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.2), 0 30px 80px rgba(0, 0, 0, 0.85)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar with macOS Traffic Lights */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 shadow-xs cursor-pointer"
              title="关闭"
            />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs font-semibold text-white/90 ml-1.5 flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-blue-400" />
              <span>安装为独立桌面客户端</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition cursor-pointer"
          >
            <X size={15} />
          </button>
        </div>

        {/* Header Hero Banner */}
        <div className="flex items-center gap-3 mb-4 p-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/25 shrink-0 border border-white/20">
            <Monitor className="text-white" size={22} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              Linguist 桌面原生体验
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-500/25 text-blue-300 border border-blue-400/30">
                PWA 免下载
              </span>
            </h3>
            <p className="text-[11px] text-white/60 mt-0.5">
              无需重新编译打包，云端代码修改自动实时热同步
            </p>
          </div>
        </div>

        {/* Installed State */}
        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-400/30 flex items-center gap-3 my-3 text-white">
            <CheckCircle2 className="text-emerald-400 shrink-0" size={22} />
            <div>
              <p className="text-xs font-semibold text-emerald-300">当前已作为独立桌面客户端运行！</p>
              <p className="text-[11px] text-white/70 mt-0.5">
                每次云端或代码有新改动，窗口刷新时自动生效最新功能。
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 my-3 text-xs select-text">
            {/* Direct 1-Click Install if browser prompt is ready */}
            {isInstallable && (
              <button
                type="button"
                onClick={install}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-lg shadow-blue-500/30 transition active:scale-[0.98] cursor-pointer"
              >
                <Download size={15} />
                <span>立即一键安装到 Windows 桌面</span>
              </button>
            )}

            {/* Step-by-step Guide */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2.5">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-500/25 text-blue-300 border border-blue-400/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-semibold text-white text-xs">
                    在新独立标签页中打开本应用
                  </p>
                  <p className="text-white/60 text-[11px] mt-0.5">
                    在当前开发沙箱环境中由于 iframe 限制，请点击下方按钮直接在新标签页打开：
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenStandalone}
                    className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-medium shadow-md transition cursor-pointer"
                  >
                    <ExternalLink size={12} />
                    在新标签页打开应用链接
                  </button>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-white/10">
                <span className="w-5 h-5 rounded-full bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                  2
                </span>
                <div className="space-y-1.5">
                  <p className="font-semibold text-white text-xs">
                    在浏览器中安装为桌面应用（两种方式任选其一）：
                  </p>
                  <div className="space-y-1.5 text-white/70 text-[11px]">
                    <div className="bg-black/30 p-2 rounded-xl border border-white/10">
                      <span className="text-emerald-400 font-semibold">方式一：</span>
                      <span> 新标签页地址栏最右侧，点击<strong>“电脑屏幕 ⬇”</strong>或<strong>“➕”</strong>图标即可一键生成桌面图标。</span>
                    </div>
                    <div className="bg-black/30 p-2 rounded-xl border border-white/10">
                      <span className="text-blue-400 font-semibold">方式二：</span>
                      <span> 点击浏览器右上角三个点 <strong>⋮</strong> ➔ 选择<strong>「保存并共享」</strong>（或<strong>「应用」</strong>）➔ 点击<strong>「安装 Linguist」</strong>。</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Advantages */}
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <p className="font-semibold text-white flex items-center gap-1">
                  <Sparkles size={12} className="text-amber-400" />
                  实时热同步
                </p>
                <p className="text-white/60 text-[10px] mt-0.5">
                  任何功能修改自动生效，无需每次重新编译下载安装包。
                </p>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <p className="font-semibold text-white flex items-center gap-1">
                  <Laptop size={12} className="text-emerald-400" />
                  独立桌面窗口
                </p>
                <p className="text-white/60 text-[10px] mt-0.5">
                  无浏览器多余边框，支持固定到任务栏与开机启动。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <button
            type="button"
            onClick={handleCopyUrl}
            className="flex items-center gap-1.5 text-white/60 hover:text-white transition py-1 px-2.5 rounded-xl hover:bg-white/10 cursor-pointer"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? '已复制网址' : '复制网址'}</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition cursor-pointer border border-white/10"
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  Crop,
  X,
  Upload,
  FileText,
  Sparkles,
  Camera,
  Check,
  MousePointer,
} from 'lucide-react';
import * as htmlToImage from 'html-to-image';

interface ScreenSnipperProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (
    imageDataUrl: string,
    extractedText?: string,
    box?: { x: number; y: number; width: number; height: number }
  ) => void;
  isProcessing?: boolean;
}

export const ScreenSnipper: React.FC<ScreenSnipperProps> = ({
  isOpen,
  onClose,
  onCapture,
  isProcessing = false,
}) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);
  const [capturing, setCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle ESC key to cancel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Calculate bounding box
  const getSelectionBox = () => {
    if (!startPoint || !currentPoint) return null;
    const x = Math.min(startPoint.x, currentPoint.x);
    const y = Math.min(startPoint.y, currentPoint.y);
    const width = Math.abs(currentPoint.x - startPoint.x);
    const height = Math.abs(currentPoint.y - startPoint.y);
    return { x, y, width, height };
  };

  const selection = getSelectionBox();

  // Mouse drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Ignore clicks on the toolbar
    const target = e.target as HTMLElement;
    if (target.closest('.snipper-toolbar') || target.closest('button')) {
      return;
    }
    setIsDrawing(true);
    setStartPoint({ x: e.clientX, y: e.clientY });
    setCurrentPoint({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    setCurrentPoint({ x: e.clientX, y: e.clientY });
  };

  // Extract overlapping text in DOM selection box as an instant high-fidelity companion
  const extractOverlappingText = (sel: { x: number; y: number; width: number; height: number }): string => {
    try {
      const textPieces: string[] = [];
      const container = document.getElementById('desktop-simulator-workspace') || document.body;
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent) continue;
        if (parent.closest('#screen-snipper-overlay') || parent.closest('.floating-translator-card')) continue;
        const rect = parent.getBoundingClientRect();
        // Check if overlaps with selection rectangle
        const overlaps =
          rect.left < sel.x + sel.width &&
          rect.right > sel.x &&
          rect.top < sel.y + sel.height &&
          rect.bottom > sel.y;

        if (overlaps) {
          const text = node.textContent?.trim();
          if (text && text.length > 0 && !textPieces.includes(text)) {
            textPieces.push(text);
          }
        }
      }
      return textPieces.join('\n');
    } catch {
      return '';
    }
  };

  const handleMouseUp = async () => {
    if (!isDrawing || !selection) {
      setIsDrawing(false);
      return;
    }
    setIsDrawing(false);

    // Minimum size check (must be at least 30x20)
    if (selection.width < 30 || selection.height < 20) {
      setStartPoint(null);
      setCurrentPoint(null);
      return;
    }

    try {
      setCapturing(true);

      // Extract overlapping text directly from the DOM under selection
      const extractedText = extractOverlappingText(selection);

      // Temporarily hide the snipper overlay so it isn't captured
      const overlay = document.getElementById('screen-snipper-overlay');
      if (overlay) overlay.style.display = 'none';

      let dataUrl: string | null = null;
      const rootElement = document.getElementById('desktop-simulator-workspace') || document.body;

      try {
        const fullCanvas = await htmlToImage.toCanvas(rootElement, {
          skipFonts: true,
          filter: (node) => {
            const el = node as HTMLElement;
            return el?.id !== 'screen-snipper-overlay';
          },
        });

        const rootRect = rootElement.getBoundingClientRect();
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = selection.width;
        cropCanvas.height = selection.height;
        const ctx = cropCanvas.getContext('2d');
        if (ctx) {
          const sourceX = Math.max(0, selection.x - rootRect.left);
          const sourceY = Math.max(0, selection.y - rootRect.top);
          ctx.drawImage(
            fullCanvas,
            sourceX,
            sourceY,
            selection.width,
            selection.height,
            0,
            0,
            selection.width,
            selection.height
          );
          dataUrl = cropCanvas.toDataURL('image/png');
        }
      } catch (imgErr) {
        console.warn('html-to-image capture fallback:', imgErr);
      }

      if (overlay) overlay.style.display = 'block';

      const selBox = {
        x: selection.x,
        y: selection.y,
        width: Math.max(selection.width, 320),
        height: Math.max(selection.height, 180),
      };

      if (dataUrl) {
        onCapture(dataUrl, extractedText, selBox);
        onClose();
      } else {
        // High-res synthetic snapshot fallback with extracted text
        generateTextSnapshot(extractedText, selBox);
      }
    } catch (err) {
      console.error('Capture error:', err);
      generateSampleSnapshot();
    } finally {
      setCapturing(false);
      setStartPoint(null);
      setCurrentPoint(null);
    }
  };

  // Quick action: capture the whole simulated document reader
  const handleCaptureDocument = async () => {
    try {
      setCapturing(true);
      const docElement = document.getElementById('mock-browser-document') || document.body;
      const rect = docElement.getBoundingClientRect();
      const docBox = {
        x: Math.max(20, rect.left),
        y: Math.max(30, rect.top),
        width: Math.max(360, rect.width),
        height: Math.max(260, rect.height),
      };

      const overlay = document.getElementById('screen-snipper-overlay');
      if (overlay) overlay.style.display = 'none';

      let dataUrl: string | null = null;
      try {
        const canvas = await htmlToImage.toCanvas(docElement, {
          skipFonts: true,
          filter: (node) => {
            const el = node as HTMLElement;
            return el?.id !== 'screen-snipper-overlay';
          },
        });
        dataUrl = canvas.toDataURL('image/png');
      } catch (err) {
        console.warn('Doc capture fallback:', err);
      }

      if (overlay) overlay.style.display = 'block';

      if (dataUrl) {
        onCapture(dataUrl, (docElement as HTMLElement).innerText, docBox);
        onClose();
      } else {
        generateSampleSnapshot();
      }
    } catch (err) {
      console.warn('Doc capture fallback:', err);
      generateSampleSnapshot();
    } finally {
      setCapturing(false);
    }
  };

  // Generate crisp snapshot from detected text
  const generateTextSnapshot = (
    text?: string,
    box?: { x: number; y: number; width: number; height: number }
  ) => {
    const lines = (text || 'Linguist Precision Desktop Translation Card\nSelect any text for real-time translation')
      .split('\n')
      .filter((s) => s.trim().length > 0)
      .slice(0, 6);

    const canvas = document.createElement('canvas');
    canvas.width = 650;
    canvas.height = Math.max(160, 50 + lines.length * 36);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(0, 0, canvas.width, 3);

    ctx.fillStyle = '#f8fafc';
    ctx.font = '15px sans-serif';
    lines.forEach((line, idx) => {
      ctx.fillText(line.slice(0, 70), 24, 40 + idx * 32);
    });

    const fallbackBox = box || {
      x: Math.max(20, (window.innerWidth - 500) / 2),
      y: Math.max(40, (window.innerHeight - 320) / 2),
      width: 500,
      height: 320,
    };

    const dataUrl = canvas.toDataURL('image/png');
    onCapture(dataUrl, text, fallbackBox);
    onClose();
  };

  // Quick action: generate a crisp test snapshot with English technical text
  const generateSampleSnapshot = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 650;
    canvas.height = 240;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Dark sleek background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Decorative gradient bar
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#3b82f6');
    gradient.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, 4);

    // Text content
    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('Linguist: Next-Generation Floating Translation Card', 24, 45);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px monospace';
    ctx.fillText('1. Supports effortless dragging and resizing into a pill shape.', 24, 85);
    ctx.fillText('2. Intelligent screenshot translation with bilingual line-by-line display.', 24, 120);
    ctx.fillText('3. Powered by multi-tier Gemini AI models for lightning fast response.', 24, 155);

    ctx.fillStyle = '#38bdf8';
    ctx.font = 'italic 13px sans-serif';
    ctx.fillText('Precision OCR & Contextual Alignment Engine', 24, 200);

    const sampleText =
      'Linguist: Next-Generation Floating Translation Card\n1. Supports effortless dragging and resizing into a pill shape.\n2. Intelligent screenshot translation with bilingual line-by-line display.\n3. Powered by multi-tier Gemini AI models for lightning fast response.';

    const sampleBox = {
      x: Math.max(20, (window.innerWidth - 520) / 2),
      y: Math.max(40, (window.innerHeight - 340) / 2),
      width: 520,
      height: 340,
    };

    const dataUrl = canvas.toDataURL('image/png');
    onCapture(dataUrl, sampleText, sampleBox);
    onClose();
  };

  // Upload custom screenshot file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const fileBox = {
          x: Math.max(20, (window.innerWidth - 500) / 2),
          y: Math.max(40, (window.innerHeight - 340) / 2),
          width: 500,
          height: 340,
        };
        onCapture(dataUrl, undefined, fileBox);
        onClose();
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      id="screen-snipper-overlay"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      className="fixed inset-0 z-[99999] cursor-crosshair select-none bg-black/40 backdrop-blur-[2px]"
      style={{ userSelect: 'none' }}
    >
      {/* Top Floating Control Toolbar */}
      <div className="snipper-toolbar fixed top-6 left-1/2 -translate-x-1/2 z-[100000] px-4 py-2.5 rounded-full bg-slate-900/90 border border-white/20 shadow-2xl backdrop-blur-xl flex items-center gap-3 text-xs text-white">
        <div className="flex items-center gap-2 font-medium pr-2 border-r border-white/10">
          <Crop className="w-4 h-4 text-blue-400 animate-pulse" />
          <span className="font-semibold">截图翻译模式</span>
        </div>

        <span className="text-white/60 hidden sm:inline">
          按住鼠标左键在屏幕任意区域拖拽框选
        </span>

        {/* Quick buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleCaptureDocument}
            className="px-2.5 py-1 rounded-full bg-blue-500/20 hover:bg-blue-500 text-blue-300 hover:text-white border border-blue-400/30 transition-all flex items-center gap-1 cursor-pointer"
            title="直接截取桌面当前文档"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>截取文档</span>
          </button>

          <button
            type="button"
            onClick={generateSampleSnapshot}
            className="px-2.5 py-1 rounded-full bg-purple-500/20 hover:bg-purple-500 text-purple-300 hover:text-white border border-purple-400/30 transition-all flex items-center gap-1 cursor-pointer"
            title="使用预置双语测试图立即体验"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>示例截图</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-all flex items-center gap-1 cursor-pointer"
            title="上传本地截屏图片"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>上传图片</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full text-white/50 hover:text-white hover:bg-white/10 transition-colors ml-1 cursor-pointer"
            title="取消截图 (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rubber-band Selection Box */}
      {selection && selection.width > 0 && selection.height > 0 && (
        <div
          style={{
            position: 'absolute',
            left: `${selection.x}px`,
            top: `${selection.y}px`,
            width: `${selection.width}px`,
            height: `${selection.height}px`,
            boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
          }}
          className="border-2 border-blue-400 bg-blue-500/10 pointer-events-none rounded-lg"
        >
          {/* Dimension Tag */}
          <div className="absolute -top-7 left-0 px-2 py-0.5 rounded bg-blue-600 text-[10px] font-mono font-bold text-white shadow-md">
            {Math.round(selection.width)} × {Math.round(selection.height)} px
          </div>
        </div>
      )}

      {/* Capturing Status Banner */}
      {capturing && (
        <div className="fixed inset-0 flex items-center justify-center z-[100001] bg-black/60 backdrop-blur-sm">
          <div className="px-5 py-3 rounded-2xl bg-slate-900/90 border border-white/20 text-white flex items-center gap-3 shadow-2xl">
            <Sparkles className="w-5 h-5 text-blue-400 animate-spin" />
            <span className="text-sm font-medium">正在截取选区并启动 AI 识别...</span>
          </div>
        </div>
      )}
    </div>
  );
};

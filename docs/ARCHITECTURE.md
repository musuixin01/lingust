# Linguist 桌面版系统架构

> **版本**：v0.1.0
> **最后更新**：2026-09-05

## 1. 分层架构

```
┌─────────────────────────────────────────────────────────┐
│                   UI 层 (Qt Quick / QML)                 │
│  PillView / CardView / WordDetailView / HistoryView     │
│  SettingsView / OverlayWindow / GlassSurface / Tokens   │
└──────────────────────────┬──────────────────────────────┘
                           │ property binding / signals
┌──────────────────────────▼──────────────────────────────┐
│              Core 核心层 (C++20)                         │
│  AppState / TranslationManager / SelectionManager        │
│  OCRManager / CaptureManager / WindowManager             │
│  ShortcutManager / MediaManager                          │
└──────────────────────────┬──────────────────────────────┘
                           │ Platform Interfaces
┌──────────────────────────▼──────────────────────────────┐
│         Provider 服务层 (可插拔)                          │
│  ITranslationProvider / IOcrProvider / ISelectionProvider│
│  Gemini / DeepL / 有道 / OpenAI / Local / PaddleOCR     │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│        Windows 平台层 (C++/WinRT + Win32)                │
│  UI Automation / Graphics.Capture / Clipboard            │
│  Global Hotkey / Mouse Hook / GSMTC / DWM / DPI         │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│        Infrastructure 基础设施                            │
│  SQLite / Config / Cache / Logging / Updater             │
└─────────────────────────────────────────────────────────┘
```

## 2. 窗口管理

### 2.1 窗口清单

| 窗口 | 类型 | DWM 背景 | 生命周期 |
|---|---|---|---|
| TranslatorWindow | QQuickWindow | Desktop Acrylic | 常驻（药丸/卡片状态切换） |
| OverlayWindow | QQuickWindow | 半透明遮罩 | 截图时创建 |
| SettingsWindow | QQuickWindow | Mica | 设置时创建 |
| HistoryWindow | QQuickWindow | Mica | 历史记录时创建 |

### 2.2 透明窗口实现

```cpp
// TranslatorWindow 核心设置
setFlag(Qt::FramelessWindowHint);
setAttribute(Qt::WA_TranslucentBackground);
setFlag(Qt::WindowStaysOnTopHint);
setColor(Qt::transparent);

// DWM Desktop Acrylic (Windows 11 22621+)
DWM_SYSTEMBACKDROP_TYPE backdrop = DWMSBT_TRANSIENTWINDOW;
DwmSetWindowAttribute(hwnd, DWMWA_SYSTEMBACKDROP_TYPE, &backdrop, sizeof(backdrop));
MARGINS margins = {-1};
DwmExtendFrameIntoClientArea(hwnd, &margins);
```

- QML 根元素 `color: "transparent"`，DWM Acrylic 自动模糊桌面背景
- QML `GlassSurface` 组件叠加半透明颜色 + 圆角 + 边框 + 阴影
- 圆角外 alpha=0 区域由 Windows layered window 自动实现鼠标穿透

### 2.3 状态机

```
Pill (380×46)
  ↓ 点击展开 / 底部下拖 >85px
Card (380×490)
  ↓ 点击黄色最小化 / 顶部上推
Pill
```

- C++ `TranslatorWindow` 管理 `currentMode` 属性和窗口几何
- QML `main.qml` 通过 States + Transitions 做视图切换动画
- 窗口尺寸变化通过 `widthChanged/heightChanged` 信号同步 QML 内容

## 3. 翻译架构

### 3.1 统一接口

```cpp
class ITranslationProvider {
public:
    virtual ~ITranslationProvider() = default;
    virtual QString name() const = 0;
    virtual Task<TranslationResult> translate(
        const QString &text,
        const QString &sourceLang,
        const QString &targetLang) = 0;
    virtual bool isAvailable() const = 0;
};
```

### 3.2 提供商实现

| Provider | 类型 | 说明 |
|---|---|---|
| GeminiProvider | 云端 | Google GenAI SDK，多模型熔断降级池 |
| DeepLProvider | 云端 | Free / Pro 密钥 |
| YoudaoProvider | 云端 | 有道智云 OpenAPI |
| OpenAIProvider | 云端 | GPT-4o 翻译 |
| LocalProvider | 离线 | 内置高频双语词库 |

### 3.3 429 熔断降级池

```
gemini-3.1-flash-lite → gemini-3.5-flash → gemini-flash-lite-latest → gemini-3.8-flash
    ↓ 全部 429
LocalProvider 离线兜底
```

- 捕获 429 后标记模型冷却 60 秒，自动切换下一个候选
- 全部不可用时降级到离线词库，确保前端永远有响应

## 4. 全局划词

### 4.1 三级降级策略

```
用户划词
    ↓
1. UI Automation (ISelectionProvider / TextPattern)
   覆盖：Chrome / Edge / Office / PDF 阅读器 / IDE / 传统 Win32
    ↓ 失败
2. Clipboard (模拟 Ctrl+C + GetClipboardSequenceNumber 安全恢复)
   覆盖：部分自绘软件、不支持 UIA 的应用
    ↓ 失败
3. OCR (框选区域文字识别)
   覆盖：游戏、视频、图片等无法获取文本的场景
```

### 4.2 Clipboard 安全恢复

```
记录 GetClipboardSequenceNumber() → seq0
    ↓
模拟 Ctrl+C
    ↓
异步等待 sequence 变化（短超时）
    ↓
读取文本
    ↓
比对 sequence：
  - 仍是我们的修改 → 恢复原剪贴板
  - 被用户插队修改 → 不恢复，避免覆盖用户新内容
```

## 5. 截图 OCR

### 5.1 流程

```
快捷键触发
    ↓
OverlayWindow 全屏透明遮罩
    ↓
鼠标框选区域 (X, Y, W, H)
    ↓
Windows.Graphics.Capture 捕获显示器
    ↓
裁剪到框选区域
    ↓
OCRManager → IOcrProvider
    ↓
TranslationManager 翻译
    ↓
InPlaceScreenshotCard 原位显示对照结果
```

### 5.2 OCR Provider

| Provider | 要求 | 说明 |
|---|---|---|
| WindowsOcr | Windows 10+ | `Windows.Media.Ocr.OcrEngine`，系统内置，默认 |
| WindowsAiOcr | NPU 设备 | `Microsoft.Windows.AI.Imaging.TextRecognizer`，高精度可选 |
| PaddleOcr | 本地运行库 | 高精度离线 OCR，可选分发 |

## 6. 线程模型

```
Main Thread (UI)
├── QML 渲染
├── Window 管理
└── AppState 状态

Worker Thread Pool (QThreadPool)
├── OCR 识别
├── 截图图像处理
├── API 网络请求
└── SQLite 数据库

可选 Worker Process
├── 本地 AI 推理
├── PaddleOCR
└── 大模型本地推理
```

- UI 线程绝不执行 OCR、网络请求和图片处理
- 所有耗时操作通过 `QThreadPool` + `QRunnable` 或 `QtConcurrent` 执行
- 结果通过信号槽回传 UI 线程

## 7. 跨平台预留

当前仅实现 Windows 平台，但架构预留跨平台能力：

```
platform/
├── interfaces/       # 纯虚接口，平台无关
├── windows/          # Windows 实现
└── macos/            # 未来 macOS 实现（预留）
```

QML UI + C++ Core + Providers 三层完全平台无关，新增平台只需实现 `platform/<os>/` 目录。

## 8. 灵动岛音乐与 Windows 系统音频媒体总线架构 (GSMTC Integration)

### 8.1 架构拓扑

```
┌─────────────────────────────────────────────────────────┐
│              UI 层 (PillView & MusicIslandCard)          │
│  - 唱片旋转动画 / 3柱动态音频均衡器 / 双语歌词同步跑马灯  │
│  - 交互进度条 / 上下曲 / 播放暂停 / 翻译-音乐一键互换    │
└──────────────────────────┬──────────────────────────────┘
                           │ Q_PROPERTY bindings / Q_INVOKABLE calls
┌──────────────────────────▼──────────────────────────────┐
│             Core 核心层: MediaSessionService             │
│  - 状态机控制 (Play / Pause / Next / Seek)              │
│  - 歌词时间戳解析器 (Timestamp Lyric Parser)            │
│  - 内置白噪音/专注歌单 (Lofi / Coding Beats)            │
└──────────────────────────┬──────────────────────────────┘
                           │ GSMTC Platform Adapter
┌──────────────────────────▼──────────────────────────────┐
│      Platform 平台层: WindowsMediaManager (C++/WinRT)   │
│  - Windows.Media.Control                                │
│  - GlobalSystemMediaTransportControlsSessionManager     │
│  - 监听网易云/QQ音乐/Spotify/Apple Music/Edge 浏览器音频 │
└─────────────────────────────────────────────────────────┘
```

### 8.2 核心机制
- **零侵入监听**：无需用户登录各音乐平台账号即可通过 Windows 10/11 系统的 GSMTC 广播自动截获当前播放曲目、歌手、封面与播放状态；
- **自包含离线回退**：未开启第三方音乐软件时，系统内置 Lofi 学习与午夜专注双语音乐会话，随时提供沉浸式心流体验。

## 9. Web PWA 与桌面端多窗口对齐架构 (Window Management Alignment)

为恪守「设置/截图/历史记录使用独立窗口」的铁律，Web PWA 客户端全面对齐原生桌面多窗口机制：

```
┌─────────────────────────────────────────────────────────┐
│              App.tsx 全局多窗口与视图调度器             │
├───────────────────┬───────────────────┬─────────────────┤
│ FloatingCard      │ SettingsWindow    │ HistoryWindow   │
│ (TranslatorWindow)│ (独立设置窗口)    │ (独立生词窗口)  │
│ - 药丸/卡片切换   │ - 自由拖拽平移    │ - 自由拖拽平移  │
│ - 词典/中英对照   │ - macOS红绿灯     │ - macOS红绿灯   │
│ - 灵动岛音乐      │ - 最小化为药丸    │ - 最小化为药丸  │
│ - 8向边缘拉伸     │ - 5大分类选项卡   │ - 实时检索收藏  │
└───────────────────┴───────────────────┴─────────────────┘
```

- **非阻塞多任务体验**：各窗口无强制全屏暗色 Backdrop 遮挡，用户可并列排布查词卡片、设置面板与生词记录，获得与桌面双屏/多窗口操作无异的高效体验；
- **自包含最小化**：支持将设置与历史记录独立收敛为桌面微型药丸胶囊，随用随展。



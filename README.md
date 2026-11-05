# Linguist 桌面悬浮翻译卡片 (Desktop Edition)

> **版本**：v0.1.0 (UI Preview)
> **状态**：开发中
> **技术栈**：Qt 6 Quick / QML + C++20 + C++/WinRT

轻量优雅、毛玻璃质感的桌面悬浮翻译卡片。支持多态药丸/卡片形态、四核翻译引擎、原地截图 OCR、全局划词与双语发音。

---

## 架构总览

<p align="center">
  <img src="public/icon.svg" alt="Linguist 应用图标" width="88">
</p>
<p align="center">
  <img src="docs/assets/lingust-architecture.svg" alt="Linguist Qt Quick、C++ 核心与 Windows 平台层架构图" width="100%">
</p>

<sub>该图对应本仓库 v0.1.0 UI Preview 的架构，不应与后续 AetherDict 项目的实现状态混为一谈。</sub>

## 核心特性

| 模块 | 功能 |
|---|---|
| 多态悬浮卡片 | 药丸 (Pill) ↔ 完整卡片 (Card) 平滑状态切换，自由拖拽与八向拉伸 |
| 四核翻译引擎 | Gemini AI / DeepL / 有道智云 / 100% 离线词库，统一 Provider 接口 |
| 原地截图翻译 | Windows.Graphics.Capture 全屏框选，逐行中英对照 |
| 全局划词 | UI Automation → Clipboard 安全兜底 → OCR 三级降级 |
| 生词本与历史 | SQLite 持久化，收藏标记、关键词检索、双语发音 |
| 灵动岛音乐与歌词 | 类似 iOS 灵动岛胶囊交互，旋转黑胶唱片律动、3柱音频均衡器跳动、实时双语歌词、Windows GSMTC 系统音频监听与直接切歌/暂停 |

---

## 技术架构

```
Qt Quick/QML (UI 层)
    ↓ property binding / signals
C++20 Core (AppState, TranslationManager, SelectionManager,
    OCRManager, CaptureManager, WindowManager, ShortcutManager)
    ↓ Platform Interfaces (ITranslationProvider, IOcrProvider, ...)
    ↓
C++/WinRT + Win32 (Windows 平台实现)
```

### 窗口设计原则
- **透明矩形 QQuickWindow**，QML 负责圆角/阴影/描边/动画
- Windows 层负责 Frameless / AlwaysOnTop / DWM Acrylic / 多屏 DPI
- **独立紧贴窗口**：TranslatorWindow（Pill↔Card）/ OverlayWindow / SettingsWindow
- 不使用 SetWindowRgn，避免圆角锯齿和失焦边框问题

---

## 快速开始

### 环境要求
- Qt 6.5+（**MSVC 2019/2022 64-bit** 版本，非 MinGW）
- Visual Studio 2022（含 C++ 桌面开发工作负载，已确认安装在 `D:\VisualStudio2022`）
- CMake 3.16+（Qt 安装器或 VS 自带）
- C++20 编译器（MSVC 14.4+）
- Windows 10 1809+（DWM Acrylic 需要 Windows 11 22621+）

### Qt 安装指引

运行浏览器中已打开的 Qt 在线安装器，安装时选择：

1. **Qt 版本**：Qt 6.5.x 或 6.7.x（LTS）
2. **编译器组件**：勾选 **MSVC 2022 64-bit**（`win64_msvc2022_64`），**不要**选 MinGW
3. **附加模块**：
   - Qt 5 Compatibility Module（`qt5compat`，用于 GraphicalEffects）
   - Qt Network、Qt SQL（通常包含在 Qt Base 中）
4. **开发工具**：
   - CMake
   - Ninja
   - Qt Creator（推荐，用于编辑 QML 和调试）

安装路径建议：`D:\Qt\6.5.3\msvc2022_64`

### 构建

**方式一：Qt Creator（推荐）**
1. 打开 Qt Creator
2. 文件 → 打开文件或项目 → 选择 `CMakeLists.txt`
3. 配置 Kit：选择 **Desktop Qt 6.5.3 MSVC2022 64bit**
4. 点击左下角运行按钮（或 Ctrl+R）

**方式二：命令行（Developer Command Prompt for VS 2022）**

```bash
# 打开 "x64 Native Tools Command Prompt for VS 2022"
cd "D:\AI Lab\AI Library\Doubao Workspace\lingust-desktop"

# 配置（使用 Ninja 或 NMake）
cmake -B build -G "Ninja" -DCMAKE_PREFIX_PATH="D:/Qt/6.5.3/msvc2022_64" -DCMAKE_BUILD_TYPE=Release

# 编译
cmake --build build

# 运行
.\build\bin\lingust.exe
```

如果没有 Ninja，用 NMake：
```bash
cmake -B build -G "NMake Makefiles" -DCMAKE_PREFIX_PATH="D:/Qt/6.5.3/msvc2022_64"
cmake --build build
```

---

## 项目目录

```
lingust-desktop/
├── app/                    # 应用入口
│   ├── main.cpp
│   └── Application.h/cpp
├── ui/                     # QML 界面
│   ├── main.qml            # 主入口（状态机）
│   ├── components/         # 基础组件（DesignTokens, GlassSurface, ...）
│   ├── pill/               # 药丸视图
│   ├── card/               # 卡片视图
│   ├── overlay/            # 截图遮罩
│   └── settings/           # 设置页面
├── core/                   # C++ 核心层
│   ├── state/              # AppState 状态管理
│   ├── window/             # TranslatorWindow 窗口管理
│   ├── translation/        # 翻译调度
│   ├── selection/          # 划词管理
│   ├── ocr/                # OCR 调度
│   ├── capture/            # 截图管理
│   └── media/              # 音乐控制
├── platform/               # 平台抽象
│   ├── interfaces/         # ITranslationProvider, IOcrProvider, ...
│   └── windows/            # Windows 平台实现
├── providers/              # 翻译/OCR 提供商
├── infrastructure/         # 基础设施（SQLite/Config/Logging/Updater）
├── resources/              # 图标等资源
├── docs/                   # 项目文档
└── CMakeLists.txt
```

---

## 文档索引

- [架构设计](./docs/ARCHITECTURE.md)
- [设计规范](./docs/DESIGN_SYSTEM.md)
- [更新日志](./docs/CHANGELOG.md)

---

## 许可证

MIT License

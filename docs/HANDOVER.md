# Linguist 桌面悬浮翻译卡片 - 企业级项目交接文档

> **版本**：v1.2.0-enterprise  
> **交接状态**：生产就绪 (Production Ready)  
> **最后维护时间**：2026-09-03  
> **适用对象**：前端工程师、全栈工程师、运维人员、产品技术负责人

---

## 1. 业务背景与系统定位

Linguist 是一款面向现代化桌面场景打造的轻量、高效、极简悬浮翻译与词典工具。它结合了桌面毛玻璃拟物化设计与前沿大语言模型语境理解能力，具备以下核心特性：

1. **四核翻译与词典引擎调度体系**：
   - **Google Gemini AI 语境引擎**：深度上下文感知、双语地道释义、多国音标 (IPA) 及真实双语例句。内置多模型并发池与 429 速率限制冷却熔断。
   - **DeepL 神经机器翻译引擎**：支持 Free 及 Pro 密钥，具备高水准语法翻译。
   - **有道智云引擎**：国内权威词典库，具备词性分级与专业考试词频。
   - **100% 本地离线脱机引擎**：内置海量高频双语词条、音标转换规则与词缀解析，断网/离线环境下毫秒级响应。
2. **多态自适应卡片几何引擎**：
   - 支持自由无边界拖拽、八向边缘拉伸。
   - 动态判定尺寸断点：完整毛玻璃卡片 $\rightarrow$ 紧凑视图 $\rightarrow$ 极简模式 $\rightarrow$ 胶囊药丸 (Pill Mode)。
   - 最小模式（保留搜索框与翻译）下支持溢出文字平滑跑马灯（Hover-Scroll）。
3. **高精度原地框选截图翻译 (In-Place Snippet)**：
   - 无缝框选屏幕内容，原位固定悬浮卡片。
   - 视觉多模态精准转录，保持原文段落格式，呈现中英逐行严密排版对照。

---

## 2. 系统技术架构与分层设计

### 2.1 技术栈全景

| 层次 | 技术选型 | 版本/规范 | 说明 |
| :--- | :--- | :--- | :--- |
| **运行时** | Node.js / tsx | Node 20+ | 全栈 ESM / TypeScript 原生执行 |
| **构建工具** | Vite + esbuild | Vite 6.x / esbuild 0.25 | 极速热重载，生产端一体化打包 CommonJS |
| **前端视图** | React + TypeScript | React 19.x / TS 5.8 | 函数式组件，并发渲染与严格类型安全 |
| **CSS 引擎** | Tailwind CSS | v4.x (@tailwindcss/vite) | 现代 CSS 原子化框架，零运行时开销 |
| **交互动效** | Motion + Canvas | motion/react | 丝滑弹簧动效与轻量渲染 |
| **图标库** | Lucide React | 最新稳定版 | 统一符合规范的矢量图标体系 |
| **服务端** | Express | Express 4.x | 高性能轻量 API 代理网关与静态资源托管 |
| **AI SDK** | @google/genai | v2.4+ | 官方最新 Gen AI SDK，支持多模型回退策略 |

### 2.2 目录拓扑说明

```
/
├── .env.example                     # 环境变量定义与示例
├── metadata.json                    # 应用元数据与平台声明
├── package.json                     # 项目依赖与执行脚本
├── server.ts                        # 服务端启动装配入口（极简装配中间件与路由）
├── server/                          # 服务端企业级模块化拆分
│   ├── config.ts                    # 端口、超时、跨域等服务配置
│   ├── routes/                      # API 路由层
│   │   ├── translateRoute.ts        # /api/translate 核心多引擎翻译
│   │   ├── ocrRoute.ts              # /api/ocr-translate 截图视觉解析
│   │   ├── testConnectionRoute.ts   # /api/test-engine 引擎连通性探测
│   │   └── index.ts                 # 路由聚合器
│   └── services/                    # 引擎适配与业务服务层
│       ├── geminiService.ts         # Gemini 多模型轮询与 429 熔断池
│       ├── deeplService.ts          # DeepL 官方 REST 接入适配
│       ├── youdaoService.ts         # 有道智云 API 签名计算与请求
│       ├── fallbackService.ts       # 高频本地应急兜底双语词典
│       └── index.ts
├── src/                             # 前端源码
│   ├── components/                  # 语义化组件模块
│   │   ├── common/                  # 通用原子组件 (HoverScrollText, LanguageSelector)
│   │   ├── translator/              # 核心悬浮卡片体系 (FloatingTranslatorCard, WordDetailView, SelectionTooltip)
│   │   ├── screenshot/              # 截图识别与原位卡片 (ScreenSnipper, InPlaceScreenshotCard, ScreenshotTranslationView)
│   │   ├── settings/                # 配置中心模态窗 (SettingsModal)
│   │   ├── history/                 # 历史生词本抽屉 (HistoryDrawer)
│   │   ├── desktop/                 # macOS 桌面模拟与测试长文 (DesktopSimulator)
│   │   └── index.ts                 # 组件对外统一导出
│   ├── constants/                   # 全局常量配置
│   │   ├── languages.ts             # 10 种主流多语种映射
│   │   ├── storage.ts               # LocalStorage 统一 Key 声明
│   │   ├── defaults.ts              # 默认配置与初始卡片词条
│   │   └── index.ts
│   ├── services/                    # 前端 API 与网络服务层
│   │   ├── api.ts                   # 统一 HTTP 请求与错误封装
│   │   ├── translationService.ts    # 翻译网络调度与降级兜底
│   │   ├── ocrService.ts            # 截图请求与解析服务
│   │   ├── storageService.ts        # 本地配置与历史记录持久化
│   │   └── index.ts
│   ├── hooks/                       # 自定义 React Hooks
│   │   ├── useDraggable.ts          # 悬浮窗口边界拖拽逻辑
│   │   └── index.ts
│   ├── utils/                       # 核心通用函数
│   │   ├── offlineEngine.ts         # 纯本地 100% 离线脱机词典引擎
│   │   └── speech.ts                # Web Speech 语音朗读与英美发音
│   ├── types.ts                     # TypeScript 全局接口与类型声明
│   ├── App.tsx                      # 根应用主视图与状态中枢
│   ├── main.tsx                     # React 根挂载入口
│   └── index.css                    # Tailwind CSS 入口配置
└── docs/                            # 企业级技术交接与规范文档
    ├── CHANGELOG.md                 # 实时版本更新变更日志
    ├── DESIGN_SYSTEM.md             # 全局 UI 风格规范与设计系统指南
    ├── HANDOVER.md                  # 本文档
    ├── ARCHITECTURE.md              # 架构拓扑与设计规约
    └── API.md                       # RESTful 接口规范
```

---

## 3. 核心功能与模块交互时序

### 3.1 翻译请求与容灾降级流程

```
[用户输入 / 划选词句]
         │
         ▼
[前端 handleTranslate()]
         │
         ├── 引擎 === 'offline' ───────────────► [直接调用 offlineEngine.ts (零延迟)]
         │
         └── 引擎 === 'gemini' | 'deepl' | 'youdao'
                     │
                     ▼
          [POST /api/translate]
                     │
          ┌──────────┴─────────────────────────┐
          │ 引擎健康探测与执行                 │
          │ 1. 优先调用当前指定在线引擎       │
          │ 2. 若遇 429 配额耗尽 ─────────────┐│
          │    自动将当前模型降权冷却 60 秒   ││
          │    轮询下一备选模型 (Flash-Lite)  ││
          │ 3. 若全部在线引擎不可用 ──────────┘│
          │    自动使用 fallbackService 兜底   │
          └──────────────────┬─────────────────┘
                             │ (200 OK 结构化 JSON)
                             ▼
               [返回统一数据模型 TranslationResult]
                             │
            ┌────────────────┴────────────────┐
            ▼                                 ▼
   [写入 LocalStorage 历史]        [UI 动态渲染卡片内容]
```

### 3.2 自适应卡片多态变化模型

主卡片组件 `FloatingTranslatorCard` 通过实时监听宽高尺寸变化（$W \times H$），触发以下响应式断点行为：

1. **标准展开态（$W \ge 340, H \ge 240$）**：
   - 展示完整红绿灯标题栏、固定/移动按钮、语言选择器、输入框、音标发音、词性释义、双语例句、同反义词与底部状态栏。
2. **紧凑模式（$W < 340$ 或 $H < 320$）**：
   - 自动隐藏非必要修饰性元素，折叠双语例句至 1 条，紧凑化音标和内边距。
3. **极小化模式（$H \le 145$ 或 $W \le 240 \ \&\ H \le 190$）**：
   - **保留核心元素**：仅保留搜索输入框与核心翻译结果。
   - **自动隐藏**：隐藏红绿灯控制条、语言选择胶囊与底部状态条。
   - **文字平滑滚动**：搜索框内容与译文超出卡片边界时，鼠标 Hover 即触发横向平滑来回滚动，保证极端小尺寸下仍可完整阅览。
4. **胶囊药丸模式（Pill Mode）**：
   - 高度极薄（$\sim 38\text{px}$）或点击右上角最小化按钮，变为轻盈的桌面悬浮药丸，以无限循环跑马灯呈现当前核心释义，双击或点击展开还原。

---

## 4. 环境变量与安全密钥接入

在 `.env` 或平台设置中配置以下变量：

```ini
# 服务端 Gemini API 密钥（生产环境必须保留在服务端，不可暴露至浏览器客户端）
GEMINI_API_KEY=AIzaSy...

# 开发环境与服务端口（容器标准硬编码 3000）
PORT=3000
NODE_ENV=production
```

> **注意**：
> - DeepL 与有道智云密钥由用户在前端设置弹窗中自主配置，保存在客户端 LocalStorage (`linguist_settings`)，并在请求时通过请求体发送给服务端代理完成签名与调用，服务端不持久化存储用户私有密钥。

---

## 5. 本地启动与构建发布

### 5.1 本地开发

```bash
# 安装依赖
npm install

# 启动全栈开发服务（同时启动 tsx 服务端与 Vite 前端中间件，端口 3000）
npm run dev
```

### 5.2 语法校验与 Lint

```bash
npm run lint
```

### 5.3 生产构建与启动

```bash
# 生产打包（同时执行前端 vite build 与后端 esbuild server.ts -> dist/server.cjs）
npm run build

# 启动生产服务
npm start
```

---

## 6. 故障排查手册 (Troubleshooting)

| 故障现象 | 可能原因 | 解决建议 |
| :--- | :--- | :--- |
| **Gemini 提示 429 频繁** | 免费层配额用尽或突发并发过高 | 服务端已内置自动 60 秒降权与模型自动回退（按顺序尝试 `3.1-flash-lite` $\rightarrow$ `3.5-flash` $\rightarrow$ `flash-lite-latest` $\rightarrow$ `3.8-flash`）。若均不可用将自动触发高质量兜底字典。 |
| **DeepL 翻译报错 403** | 密钥类型与 Endpoint 不匹配 | 检查 Key 是否带有 `:fx` 后缀。DeepL 免费版需接入 `api-free.deepl.com`，Pro 版接入 `api.deepl.com`，后端已根据后缀自动适配。 |
| **有道接口提示 202 签名失败** | AppKey 与 AppSecret 不匹配或系统时间偏差 | 检查配置中是否有前后多余空格；确认服务器当前时间与 NTP 同步（签名含当前 UTC 时间戳）。 |
| **截图 OCR 未能识别字符** | 截图区域过小或文本分辨率不足 | 建议在截图遮罩层内框选完整清晰段落；或在原网页/文档中直接通过鼠标划选，自动触发悬浮翻译气泡。 |
| **React 提示 Objects are not valid as React child ({general, us, uk})** | 多引擎音标数据结构为复合对象，若直接放入 JSX 将导致崩溃 | 在渲染层强制使用音标提取器获取字符串（兼顾字符串与对象），规范化拼接为 `/[IPA]/` 纯文本后渲染。 |

---

## 7. 待办与技术演进路线 (Roadmap)

1. **跨平台桌面客户端封装**：可基于现有全栈架构通过 Electron / Tauri 快速构建原生 macOS (.dmg) 与 Windows (.exe) 客户端，绑定全局快捷键（如 `Option + Space` 取词，`Option + A` 截屏）。
2. **多模态音频发音升级**：接入 Gemini Multimodal Live 或专用神经网络 TTS 引擎，获得更地道真实的自然对话发音。
3. **生词本云端同步**：后续如需跨设备多端协同，可无缝接入 Firebase Firestore 模块，实现历史与生词本秒级同步。

---

## 8. 文档实时维护与变更同步规约 (Real-time Documentation Protocol)

为了确保工程生命周期内“代码与文档严格一致”，团队与 AI 协同开发均严格遵循以下强制性纪律：

1. **实时记录每一处变动**：
   - 任何代码修复、功能演进、架构拆分或配置调整，必须在交付本轮修改前，同步将变动详情记录于 `docs/CHANGELOG.md`；
   - 变更记录须包含：变更类别（`[Added]` / `[Changed]` / `[Refactored]` / `[Fixed]` / `[Docs]`）、修改的具体功能点、涉及的文件路径及变更原因。
2. **相关技术文档联动更新**：
   - **UI 风格统一**：新增或修改任何前端组件、卡片、模态窗或动效时，必须严格对照 `docs/DESIGN_SYSTEM.md` 规范，确保全局材质、间距、圆角与色彩 Token 高度统一。
   - **接口变动**：修改或增减任何 HTTP/WebSocket 接口时，实时同步更新 `docs/API.md`。
   - **架构演进**：调整组件拓扑、服务层拆分或状态流时，实时同步更新 `docs/ARCHITECTURE.md` 与本文档。
   - **快速启动与部署**：调整构建脚本、依赖或环境变量时，实时同步更新 `README.md` 与 `.env.example`。
3. **持久化系统指令生效**：
   - 该规约已写入项目根目录 `AGENTS.md`，由系统级 Agent 自动加载并持久化执行。


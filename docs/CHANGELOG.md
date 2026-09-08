# Linguist 桌面版更新日志

本项目严格遵循 [Semantic Versioning 2.0.0](https://semver.org/lang/zh-CN/) 语义化版本规范。

---

## [Unreleased] - 开发中

### [Changed]
- **翻译完成后流光消散全面自然化，引入三阶段潮汐缓退消融状态机 (Tri-phase Organic Dissolve & Seamless Decay Transition)**：
  - **根除退场断崖式暗淡与硬切**：
    - 剖析翻译完成时单纯依赖 Ease-Out 曲线与无延迟 `visibility: hidden` 导致的光芒突然“塌陷一大截”、被浏览器提前隐匿的生硬体验；
    - 在 `<AppleAIBreathingGlow />` 中设计三阶段生命周期状态机：`'idle'`（静止休眠） ➔ `'active'`（晨曦唤醒） ➔ `'dissolving'`（优雅消融）；
  - **850ms 正弦缓降余晖退潮 (`.is-dissolving`)**：
    - 翻译完成（`loading: false`）瞬间，光芒绝不断崖式熄灭，而是保持温润余晖；
    - 采用符合自然光衰减规律的 **Ease-In-Out 正弦缓降曲线**（`cubic-bezier(0.37, 0, 0.63, 1)`），前段柔和释怀，中后段如水墨散入毛玻璃底色般自然蒸发；
    - 边缘高精细线（`.apple-ai-edge-line`）同步轻度柔焦弥散（`filter: blur(2px)`），内向呼吸光幕（`.apple-ai-inward-bloom`）扩展漫散至 `blur(16px)`，双层复合消融；
    - 退场全程 850ms 严格锁定 `visibility: visible`，直至完全消融隐入底色后才平滑切回 `'idle'` 休眠，实现与刚生成的译文呈现无缝视觉交接；
  - **涉及文件**：
    - `src/components/common/AppleAIBreathingGlow.tsx`
    - `src/index.css`
    - `docs/CHANGELOG.md`
    - `docs/DESIGN_SYSTEM.md`

- **解决点击翻译瞬间动效生硬问题，重构为常驻合成层与柔焦破晓唤醒通道 (Organic Pre-cached Wake-up Bloom & Frictionless Activation)**：
  - **根除 DOM 挂载引发的跳帧与硬切**：
    - 剖析动态 `setShouldRender` 卸载/挂载导致浏览器渲染引擎丢失过渡、触发 Transition Cancellation 导致光晕突兀跳出的根本原因；
    - 采用**预缓存 GPU 合成层架构（Pre-cached GPU Compositor Layer）**，光效节点常驻 DOM 树，配合 `will-change: opacity, transform, filter, visibility`；
    - **非激活态**：`opacity: 0; visibility: hidden; filter: blur(12px) brightness(0.6); transform: scale(0.992);`，由 CSS `visibility: hidden` 在零开销下实现 100% 物理隐形，彻底杜绝任何漏光与点击阻挡；
  - **750ms 晨曦柔焦破晓对焦唤醒（Soft-Focus Wake Bloom）**：
    - 点击翻译瞬间，触发 Apple 阻尼缓动曲线（`cubic-bezier(0.22, 1, 0.36, 1)`）；
    - 光线并非瞬间高亮跳出，而是从深层朦胧微光（`blur(12px)`、低亮度）在 750ms 内自然平稳升温、舒展对焦至晶莹剔透的高精琉璃光晕，无缝融入 3.8s 静息呼吸节奏；
    - 翻译完成隐退同样以 750ms 舒缓退出，过渡如丝绸般连贯顺畅；
  - **消除卡片容器边框色彩突变**：
    - 去除卡片与药丸在 `loading` 时将边框生硬切换为 `border-transparent` 的类名跳变，保留恒定精致的磨砂玻璃边框底色，由流光层在上方自然绽放，消除任何底色突褪；
  - **涉及文件**：
    - `src/components/common/AppleAIBreathingGlow.tsx`
    - `src/index.css`
    - `src/components/translator/FloatingTranslatorCard.tsx`
    - `src/components/screenshot/InPlaceScreenshotCard.tsx`
    - `docs/CHANGELOG.md`
    - `docs/DESIGN_SYSTEM.md`

- **流光呼吸严格受控仅在翻译时出现，过渡体验全面自然化 (Strict Translation-Only Lifecycle & Fluid Organic Transitions)**：
  - **根除误显隐患（生命周期严格受控）**：
    - 针对原生 CSS 关键帧动画 `opacity` 会无视并覆盖 Tailwind `opacity-0` 从而导致非翻译状态偶发微光的底层机制缺陷，专门重构封装独立受控组件 `<AppleAIBreathingGlow active={loading} />`；
    - **非翻译状态**：彻底从 DOM 树卸载（`return null`），确保在未发起翻译时 100% 纯净无残留，绝不漏出一丝光芒；
    - **翻译发起时**：通过 `requestAnimationFrame` 在 600ms 内以 Apple 人体工学贝塞尔曲线（`cubic-bezier(0.16, 1, 0.3, 1)`）平滑由 0 渐进至 100% 晨曦般苏醒漫射；
    - **翻译完成时**：触发 600ms 舒缓退出过渡，光晕柔和隐退后干净卸载 DOM，彻底消除生硬截断；
  - **呼吸律动物理曲线自然化**：
    - 将呼吸周期由急促的 2.8s 拉长至悠扬舒适的 **3.8s 人体静息正弦周期**（`cubic-bezier(0.37, 0, 0.63, 1)`），流光周期同步调整为 4.8s；
    - 向内收聚幅度由生硬的 `scale(0.965)` 优化为极为细腻轻柔的 `scale(0.982)` 配合 `14px` 柔光漫射，使光芒向内轻抚卡片内壁的吸气动效如同丝绸般顺滑自然；
  - **涉及文件**：
    - `src/components/common/AppleAIBreathingGlow.tsx` (新建)
    - `src/index.css`
    - `src/components/translator/FloatingTranslatorCard.tsx`
    - `src/components/screenshot/InPlaceScreenshotCard.tsx`
    - `docs/CHANGELOG.md`
    - `docs/DESIGN_SYSTEM.md`

- **翻译中流光呼吸动效重构为 Apple AI 风格向内呼吸体系 (Apple Intelligence Inward Breathing Bloom)**：
  - **由外向内呼吸流转**：彻底消除向外膨胀的 `scale(1.002)` 和刺眼的外向 `drop-shadow` / 紫色向外发光阴影，将呼吸光效全面重构为类似 Apple Intelligence（Siri 响应态）的向内弥散光幕（`apple-ai-inward-bloom`）；
  - **向内呼吸物理曲线**：
    - 平静态（0%/100%）：光芒收束在贴近边缘处，向内渗透深度较浅，中心 60%+ 彻底通透保护正文阅读；
    - 呼吸吸气态（50%）：动画触发向内收缩聚拢（`transform: scale(0.965)` + `filter: blur(14px)`），宛如智能内核向内吸入能量，光雾柔和轻抚卡片内壁，产生极为逼真的内向渗透呼吸流体感；
  - **双层精细结构**：
    - 外轮廓：`.apple-ai-edge-line` 紧贴 `inset: 0` 勾勒 1.5px 高精七彩边框，伴随 9 色色相平滑流转，绝不向外突出生硬边角；
    - 内侧光幕：`.apple-ai-inward-bloom` 使用径向遮罩（`radial-gradient ellipse 96% 90%`）实现从外边框向内部平滑衰减的流光弥散；
  - **多形态完美贴合**：药丸模式（`rounded-full`）、卡片模式（`rounded-[32px]` / `rounded-2xl`）与截屏对照卡（`rounded-2xl`）均添加 `overflow-hidden`，保证内边缘光幕精准贴合圆角且外部阴影保持原生深色沉稳投影；
  - **涉及文件**：
    - `src/index.css`
    - `src/components/translator/FloatingTranslatorCard.tsx`
    - `src/components/screenshot/InPlaceScreenshotCard.tsx`
    - `docs/CHANGELOG.md`
    - `docs/DESIGN_SYSTEM.md`

### [Added]
- **全应用自然动画与丝滑交互微过渡体系 (Natural Fluid Animation & Smooth Micro-Transitions)**：
  - **七彩流光呼吸边框自然淡入淡出 (Organic Fade In/Out for Rainbow Aura)**：
    - 消除请求开始/结束时七彩流光的突兀断崖式闪烁，引入 `transition-opacity duration-500 ease-out` 渐变通道；
    - 翻译开始时如黎明朝霞般柔和绽放，翻译结束或取消时平滑淡出并回归通透毛玻璃边缘；
    - 优化呼吸与流动物理曲线为 Apple 人体工学贝塞尔曲线（`4.2s ease-in-out` 流光 + `2.6s cubic-bezier(0.4, 0, 0.2, 1)` 呼吸），并开启 GPU `will-change: opacity, transform, filter` 硬件加速；
  - **内容与页面切换轻微微缩放过渡 (Subtle View & Content Micro-Transitions)**：
    - 新增 `.animate-view-scale`（`cubic-bezier(0.16, 1, 0.3, 1)`，从 0.985 缩放与 3px 轻位移丝滑落定）与 `.animate-soft-fade`；
    - 翻译卡片结果生成时平滑展开展现，替换原有突兀的内容替换；
    - 模拟桌面 Reader 切换选项卡（经典双语、前沿科技、双语散文、高频词汇）时，内容区增加轻量过渡与按键触觉弹性反馈；
    - 设置独立窗口与历史记录窗口在切换标签页、搜索筛选及列表悬浮时，均应用自然缓动微交互与点击轻量回弹（`active:scale-[0.965]`）；
    - 桌面壁纸切换时引入 `duration-700 ease-in-out` 背景色阶柔和渐变；
  - **涉及文件**：
    - `src/index.css`
    - `src/components/translator/FloatingTranslatorCard.tsx`
    - `src/components/screenshot/InPlaceScreenshotCard.tsx`
    - `src/components/desktop/DesktopSimulator.tsx`
    - `src/components/settings/SettingsWindow.tsx`
    - `src/components/history/HistoryWindow.tsx`
    - `src/components/common/PWAInstallModal.tsx`
    - `src/App.tsx`
    - `docs/CHANGELOG.md`
    - `docs/DESIGN_SYSTEM.md`

- **翻译中七彩流光呼吸边框与环境光晕动效 (Rainbow Breathing Border & Aura Effect)**：
  - **视觉呈现**：在文本翻译请求与截屏 OCR 翻译过程中（`loading === true`），窗口边框自动激活炫彩流动呼吸特效；
  - **色彩构成**：精准应用苹果 Apple Intelligence / macOS 顶级色彩阵列（Coral Red `#ff3b30`、Orange `#ff9500`、Gold `#ffcc00`、Emerald `#34c759`、Teal `#00c7be`、Azure `#007aff`、Indigo `#5856d6`、Violet `#af52de`、Pink `#ff2d55`）；
  - **双层光晕架构 (Dual-Layer Bloom Architecture)**：
    - **内层高精流光线 (`.rainbow-breathing-border`)**：采用 CSS 遮罩内容盒排除技术（`-webkit-mask-composite: xor` / `mask-composite: exclude`），形成锐利清澈的 2px 七彩外框，中心绝对镂空透明，0 遮挡内部文字与控件；
    - **外层漫反射呼吸光环 (`.rainbow-breathing-aura`)**：3.5px 软化微光晕配合 2.2s 人体静息呼吸节奏律动，伴随多层 `drop-shadow` 产生向外辐射的通透霓虹光雾；
  - **全形态自适应覆盖**：
    - **药丸模式 (`FloatingTranslatorCard` - Pill Mode)**：无缝契合 `rounded-full` 胶囊曲线，消除旧容器截断；
    - **完整卡片模式 (`FloatingTranslatorCard` - Card Mode)**：自适应匹配 `rounded-[32px]` / `rounded-2xl`，提供奢华呼吸光圈；
    - **原地截屏对照卡 (`InPlaceScreenshotCard`)**：在 OCR 与排版对照生成中同步呼吸，给予强有力的操作反馈；
  - **涉及文件**：
    - `src/index.css`
    - `src/components/translator/FloatingTranslatorCard.tsx`
    - `src/components/screenshot/InPlaceScreenshotCard.tsx`
    - `docs/CHANGELOG.md`
    - `docs/DESIGN_SYSTEM.md`

### [Fixed]
- **修复 React Hook 顺序引发的 Internal React error (Expected static flag was missing)**：
  - **根本原因**：`SettingsWindow` 与 `HistoryWindow` 组件在挂载时首行存在 `if (!isOpen) return null;` 提前退出逻辑，导致未打开时调用 0 个 Hook、打开时调用多个 Hook，违反了 React Hook 调用顺序铁律（Rules of Hooks），触发 React 19 Fiber 协调器抛出 `Internal React error: Expected static flag was missing`；
  - **解决方案**：
    - 将 `SettingsWindow.tsx` 与 `HistoryWindow.tsx` 内部的所有 `useState`、`useRef`、`useEffect` 无条件置于函数顶层统一调用，确保每次渲染 Hook 调用链绝对一致；
    - 在 `App.tsx` 中对独立浮动窗口实施按需挂载渲染 (`{isSettingsOpen && <SettingsWindow ... />}`, `{isHistoryOpen && <HistoryWindow ... />}`)，彻底根除 Hook 计数器失配与无意义的后台监听消耗；
  - **涉及文件**：
    - `src/components/settings/SettingsWindow.tsx`
    - `src/components/history/HistoryWindow.tsx`
    - `src/App.tsx`
    - `docs/CHANGELOG.md`

### [Changed]
- **设置与历史记录独立窗口化重构与全界面主题统一 (Settings & History Standalone Floating Windows & Global Theme Unification)**：
  - **设置独立窗口化 (Settings Standalone Window)**：
    - 将原有的全屏阻塞式模态抽屉重构为符合 Windows/macOS 桌面规范的**独立浮动窗口 (`SettingsWindow`)**；
    - 配备标准的 macOS 三色红绿灯控制（红灯关闭、黄灯收缩为浮动药丸、绿灯居中复位）；
    - 顶部支持流畅鼠标拖拽平移，取消背景遮罩层，允许用户在边看文档/使用翻译卡片的同时并列开启设置进行调试；
    - 支持一键最小化为轻量桌面胶囊药丸，需要时随时还原；
    - 全面规整五大分类选项卡：🤖 翻译引擎与专属密钥、⚡ 划词交互与触发方式、🎨 视觉排版与字号调节、🎵 灵动岛音乐与歌词律动、💻 独立桌面端与全局快捷键；
  - **历史记录与生词本独立窗口化 (History Standalone Window)**：
    - 将右侧固定抽屉升级为**独立浮动桌面窗口 (`HistoryWindow`)**，遵循 `设置/截图/历史记录使用独立窗口` 规范；
    - 支持自由挪动、最小化收纳、实时搜索、生词本收藏筛选与一键清空；
    - 摒弃旧版浅色背景类名，全面应用深邃星空磨砂玻璃（Deep Midnight Frosted Acrylic）质感；
  - **全界面视觉主题 100% 统一度强化**：
    - 重构 `PWAInstallModal` 桌面安装弹窗，全面适配红绿灯标题栏、磨砂玻璃高光阴影与精致发光按钮；
    - 统一 `SelectionTooltip` 划词翻译悬浮气泡，彻底消除浅色模式下的突兀白底，始终保持深色通透毛玻璃与发光指示灯质感；
    - 消除所有界面在深色 Sonoma / 极光壁纸下的样式反差，确保全局一致的奢华质感。
  - **涉及文件**：
    - `src/components/settings/SettingsWindow.tsx`
    - `src/components/settings/SettingsModal.tsx`
    - `src/components/settings/index.ts`
    - `src/components/history/HistoryWindow.tsx`
    - `src/components/history/HistoryDrawer.tsx`
    - `src/components/history/index.ts`
    - `src/components/common/PWAInstallModal.tsx`
    - `src/components/translator/SelectionTooltip.tsx`
    - `src/App.tsx`
    - `docs/CHANGELOG.md`
    - `docs/DESIGN_SYSTEM.md`
    - `docs/ARCHITECTURE.md`

### [Added]
- **桌面独立客户端免下载即用模式 (PWA Standalone Desktop Integration)**：
  - 集成 `vite-plugin-pwa` 规范化 Service Worker 与 Web App Manifest；
  - 自动注册 `display: standalone` 桌面无边框窗口模式；
  - 生成 `192x192`、`512x512`、`maskable` 高清品牌图标及 `apple-touch-icon`；
  - 新增 `usePWAInstall` 桌面安装响应机制与 `PWAInstallModal` 引导弹窗；
  - 在顶部模拟菜单栏、系统状态栏、快捷操作条及偏好设置中提供一键安装入口；
  - 彻底解决传统桌面应用“改动一次需重新下载打包一次”的痛点，支持云端代码修改全自动热重载与实时生效。

### [Fixed]
- **浏览器 PWA 安装协议链修复与离线 Service Worker 就绪 (PWA Installability & Service Worker Activation)**：
  - 修复 `index.html` 缺失 `<link rel="manifest" href="/manifest.webmanifest">` 导致浏览器无法识别渐进式 Web 应用的问题；
  - 在 `server.ts` 补充 `express.static('public')` 静态文件服务中间件及 `application/manifest+json`、`application/javascript`（`Service-Worker-Allowed: /`）响应头，解决请求 `/manifest.webmanifest` 与 `/sw.js` 时错误回退为 HTML 的问题；
  - 补全持久化静态 Web App Manifest 配置与完整缓存策略的 `public/sw.js` Service Worker，并在 `src/main.tsx` 完成自启动注册，彻底满足 Chromium / Edge 的标准 PWA 安装门槛；
  - 将顶部模拟器状态栏的「安装桌面版」按钮优化为全尺寸可见，并在 `PWAInstallModal` 中补充 Chrome / Edge 浏览器菜单「保存并共享 / 应用 ➔ 安装 Linguist」多通路引导。
  - **涉及文件**：`index.html`, `server.ts`, `src/main.tsx`, `public/manifest.webmanifest`, `public/sw.js`, `src/components/desktop/DesktopSimulator.tsx`, `src/components/common/PWAInstallModal.tsx`。

- **Vite 客户端 HMR WebSocket 错误与 PWA 资产补齐 (Vite Client Error & PWA Assets Fix)**：
  - 针对沙箱容器与禁用 HMR 环境下 `vite-plugin-pwa` 在开发模式下注入 `registerDevSW` 并通过已断开的 WebSocket 发送 `vite-plugin-pwa:dev-ready` 导致浏览器抛出 `[vite]` 控制台异常的问题，优化 `vite.config.ts` 中的 `devOptions.enabled: false`，彻底消除前端运行时错误；
  - 运行 `scripts/generate_icons.py` 完整生成缺失的 PWA 图标资源（`pwa-192x192.png`、`pwa-512x512.png`、`pwa-maskable-512x512.png`、`apple-touch-icon.png`），避免网页引用不存在的图标导致 404/HTML 回退；
  - 清理 `server.ts` 中未使用的 `fileURLToPath` 与 `__filename`/`__dirname` 声明，消除 esbuild 编译为 CommonJS 格式时的警告。
  - **涉及文件**：`vite.config.ts`, `server.ts`, `public/apple-touch-icon.png`, `public/pwa-*.png`。

- **开发服务依赖完整性修复与热重载恢复 (Dev Server Dependency & Service Restoration)**：
  - 修复开发容器环境内 `node_modules` 依赖包同步缺失的问题，完成完整依赖重新拉取与链接；
  - 成功重启并恢复本地 3000 端口全栈服务（Express 后端 API + Vite 中间件），经验证 `/api/health` 探针及静态页面路由均已恢复 200 正常响应。

### [Changed]
- **顶部栏与底部栏布局重构与极致视觉优化 (Top Bar & Bottom Bar Layout Refactoring & UI Polish)**：
  - **顶部栏瘦身降噪 (Top Bar Cleanliness)**：
    - 移除顶部栏生词本/历史记录按钮，消除与底部动作栏中已有历史入口的重复冗余，释放顶部标题栏呼吸感与横向空间；
    - 顶部栏精简为核心操作群：图钉置顶（Pin）、灵动岛音乐（Music）、设置（Settings），彻底告别图标拥挤；
  - **文本大小调节迁移至底部栏 (Font Size Adjuster Relocation to Bottom Bar)**：
    - 将字体字号调节按钮从顶部工具栏下移至底部工具条，紧随翻译结果操作动作组，排布更符合自上而下阅读、自下而上调控的直觉动线；
    - 弹窗改为自底向上平滑展开动效（`BottomRight` 变换原点，向上弹出），不遮挡核心原文与主译文展示区；
    - 完整保留直接数值输入、百分比步进（60%~150%）、四档快捷预设（紧凑 80%、默认 92%、标准 100%、大字 115%）以及动态紧凑布局切换开关；
  - **跨端 100% 同步实现**：
    - Web 端：`src/components/translator/FloatingTranslatorCard.tsx`；
    - 桌面端：`ui/card/CardView.qml`。

### [Added]
- **药丸集成灵动岛音乐与系统音频媒体总线监听 (Dynamic Island Music & Windows GSMTC Media Integration)**：
  - **灵动岛胶囊交互模式 (Pill Dynamic Island Mode)**：
    - 在药丸模式右侧工具条新增绿色音乐图标（🎵），点击即可无缝在“极简翻译模式”与“灵动岛音乐模式”之间自由切换；
    - **极小胶囊形态 (Compact Pill State)**：
      - 360° 匀速旋转黑胶唱片微缩唱盘（播放时转动、暂停时驻留）；
      - 动态跳动 3 柱音频均衡器跳律动（带随机平滑缓动阻尼）；
      - 歌曲标题、演唱者与当前行实时双语歌词跑马灯展示；
      - 即时播放/暂停、下一首切歌与一键快速切回翻译；
    - **展开大卡片形态 (Expanded Island Popover)**：
      - 点击胶囊或卡片顶部音乐按钮，向上平滑呼出磨砂玻璃大卡片 `MusicIslandCard`；
      - 展示高分辨率黑胶唱片唱针转动视效、歌曲名、艺术家、所属专辑；
      - 沉浸式双语实时歌词卡片（中英对照同步滚动高亮）；
      - 交互式播放进度条（支持鼠标任意拖动 Seek 跳进度与实时时长倒计时）；
      - 全套播放控制按钮（上一曲、播放/暂停、下一曲）；
  - **核心系统服务与 Windows 原生适配 (Core & Platform Layers)**：
    - **Core 层**：新增 `core/media/MediaSessionService.h/.cpp`，负责媒体播放状态机、内置预设歌单（Lofi Rain & Coffee、Midnight Coding Flow 等）、歌词解析匹配与进度定时器；
    - **Platform 层**：新增 `platform/windows/media/WindowsMediaManager.h/.cpp`，封装 Windows GSMTC (`GlobalSystemMediaTransportControlsSessionManager`)，监听系统活跃播放器（网易云音乐、QQ音乐、Spotify、Apple Music 与 Chrome/Edge 网页音频等）的播放状态与音轨元数据；
    - **状态总线打通**：在 `AppState` 扩展 `musicPlaying`, `trackTitle`, `trackArtist`, `trackAlbum`, `trackDuration`, `trackPosition`, `currentLyric`, `currentLyricTranslation`, `pillMusicMode`，并提供 QML `Q_INVOKABLE` 控制接口；
  - **Web 端与桌面端 100% 同步交付**：
    - Web 端新增 `src/components/music/MusicIslandView.tsx`，与 `FloatingTranslatorCard.tsx` 完美集成；
    - 桌面端新增 `ui/pill/MusicIslandCard.qml`，与 `PillView.qml` 和 `CardView.qml` 深度打通，并引入 `music.svg`, `play.svg`, `pause.svg`, `skip-back.svg`, `skip-forward.svg`, `disc.svg` 6 组矢量图标资源。

### [Changed]
- **顶部与底部栏 UI 动效与交互体验深度重构与对齐 (Top & Bottom Bar UI Animation & Interaction Polish)**：
  - **顶部栏 (Top Bar)**：
    - **统一动效缓动标准**：全面推行 120ms~150ms `Easing.OutCubic`，彻底取代原线性 `Easing.Linear`，带来丝滑物理惯性阻尼感；
    - **翻译引擎胶囊 (Engine Indicator)**：
      - 增加动态呼吸指示灯（翻译时加载闪烁、离线模式琥珀色、在线模式薄荷绿）；
      - 悬停平滑高亮微缩放，支持鼠标点击直接顺次循环切换引擎（Gemini ➔ DeepL ➔ 有道 ➔ 离线）；
    - **语言选择胶囊 (Language Selector)**：
      - 双向互换按钮（`ArrowLeftRight`）支持 180° 平滑旋转动效与触控手型反馈；
      - 语言下拉触发与切换增加微光反馈；
    - **功能图标组 (Top Actions)**：
      - 全平台顶部栏新增 **生词本/历史记录快捷入口**（History 图标），一键呼出历史抽屉；
      - 设置齿轮按钮增加悬停旋转微动效，带来灵动的桌面级质感；
    - **基础控件精修**：`IconButton.qml`、`TrafficLights.qml` 均标配手型光标（`Qt.PointingHandCursor`）、`scale: 1.08` 弹性悬停放大与激活光晕；
  - **底部栏 (Unified Bottom Bar)**：
    - **重构为单层一体化磨砂玻璃工具条**：将原分散的操作工具栏与尺寸底部栏合并为高度 36px 的统一轻量化栏目，消除双层边框堆叠割裂感；
    - **Smart-Select 划词感知开关**：配置平滑缓动滑块与手型光标，开启/暂停状态实时色彩反馈；
    - **右侧智能自适应功能组**：
      - 翻译完成状态下：平滑展开复制（带绿色对勾成功反馈）、即时发音、生词本收藏、历史抽屉；
      - 空状态下：自适应展现 `划词即翻 · Alt+Q` 极简热键提示；
      - 窗口尺寸规格微标（如 `340×420`）以等宽字体低对比度雅致融入；
  - **跨平台双端 100% 对齐**：Qt QML 桌面端（`CardView.qml`, `IconButton.qml`, `LanguageSelector.qml`, `TrafficLights.qml`）与 Web 端（`FloatingTranslatorCard.tsx`, `LanguageSelector.tsx`）全线同步交付。

### [Added]
- **鼠标点击句子即时朗读发音 (Click-to-Speak Sentences)**：
  - **长句翻译面板**：
    - 点击译文句子：自动触发对应目标语言（如中文）即时朗读；
    - 点击原文句子：自动触发对应源语言（如英文）即时朗读；
    - 交互视觉反馈：鼠标悬停显示轻微微透卡片光晕、手型指针与音量小喇叭渐显，带来直观灵敏的听音体验；
  - **单词深度视图 (WordDetailView)**：
    - 双语例句（Bilingual Examples）卡片支持鼠标直接点击整句朗读，右侧常驻/悬停提示音量图标，方便随时跟读例句；
  - **双端 100% 对齐**：Qt QML 桌面端（`CardView.qml`、`WordDetailView.qml`）与 Web 端（`FloatingTranslatorCard.tsx`、`WordDetailView.tsx`）全线同步支持。
- **划词模式支持独立关气泡直达卡片 (SelectionTriggerMode)**：
  - `AppState` 扩展 `selectionTriggerMode` 属性（支持 `"auto"` 与 `"icon"` 两种模式）；
  - 设置面板与状态彻底打通：用户选择 **“立即弹出卡片”** 时，即可彻底关闭悬浮微型小气泡，鼠标划词直接呼出主翻译卡片，流畅无阻；
  - 划词翻译功能与小气泡解耦：关闭气泡后划词翻译完全可用，满足用户“只要划词翻译、不要中间小气泡遮挡”的需求。
- **生词本与历史抽屉新增单项一键发音**：
  - 在 `HistoryView.qml` 每条历史记录卡片右上角增加发音小喇叭按钮，点击即可直接听取历史单词/短语的原声发音。

### [Fixed]
- **全面排查并修复 Windows 桌面端发音异常 (AppState::speak)**：
  - **参数签名自适应**：为 `speak(text, lang, accent)` 提供默认实参，支持 QML 侧直接无参调用 `appState.speak()`（自动提取当前译文或源词朗读，修复 `PillView.qml` 药丸模式下因缺省实参导致的方法匹配失败）；
  - **VBScript 语法死锁修复**：修复原 VBScript 单行 `If ... Then ... : End If` 导致的语法解析异常；
  - **升级为 Windows 原生 PowerShell + SAPI 双引擎发音系统**：
    - 优先采用 Windows .NET 原生 `System.Speech.Synthesis.SpeechSynthesizer`，全面支持英式发音（Hazel / George 等 `en-GB`）与美式发音（Zira / David 等 `en-US`）以及中文（Huihui / Yaoyao 等 `zh-CN`）；
    - 文本传输全面采用 **Base64** 编解码穿透，彻底根治多行文本换行截断、双引号转义冲突以及中文字符集乱码问题；
    - 在极端或受限 Windows 权限环境下自动回退到 `SAPI.SpVoice` COM 接口，保证 100% 发音成功率；
    - 保持全异步无黑框后台运行（`-WindowStyle Hidden -NoProfile`），绝不阻塞 QML 界面渲染与动效。
- **Web 端 1:1 复刻 - 截图框选逐行中英对照翻译 (ScreenshotTranslationView.qml)**：
  - 深度对齐 Web 端 `ScreenshotTranslationView`，实现全屏/区域截图后的逐行双语对照展示；
  - 顶部状态横幅：显示识别行数与语言方向（如 `共识别 3 行文本 · EN ➔ ZH`），附带 `逐行中英对照` 胶囊徽章；
  - 原图缩略图预览：支持查看原截图与一键收起折叠；
  - 逐行双语卡片结构：每一行独立卡片展示，包含上方原文（带蓝色序号圆点、发音朗读与复制按钮）与下方译文（带薄荷绿圆点、发音朗读与复制按钮）；
  - 底部操作栏：支持 `一键复制全部对照`（带对勾反馈状态）、`朗读全部` 与 `返回文本` 快速切换回常规翻译。
- **Web 端 1:1 复刻 - 完整偏好设置面板 (SettingsView.qml)**：
  - **4-Grid 引擎选择卡片**：Gemini AI（深度语境）、DeepL（高自然度）、有道智云（考试词典）、100% 离线脱机词典（零网络依赖），带激活蓝圈与动态高亮；
  - **动态 API 密钥配置与连通性测试**：
    - Gemini/DeepL/有道专属密钥输入框，配备眼睛图标（Eye/EyeOff）密码明密文切换；
    - 各引擎官方获取密钥外部超链接（支持一键调起默认浏览器访问官方控制台）；
    - API 连通性测试按钮，内置旋转动画与成功/失败实时状态横幅；
    - 离线引擎专属免配置绿色就绪提示；
  - **划词与交互偏好**：全局划词翻译（Smart-Select）开关、划词触发方式（立即弹出卡片 / 显示悬浮快捷图标）选项卡、翻译完成自动发音开关、紧凑布局模式开关；
  - **外观与排版**：悬浮卡片透明度调节滑块（60%~100% 带百分比实时读数）、全局排版字号比例调节滑块（70%~150%）及 80%/100%/120% 快速预设按钮；
  - **快捷键速查指引**：Alt+Q（唤起/隐藏主卡片）、Alt+W（截图框选翻译）、Alt+E（选中文本翻译）、Esc（折叠极简药丸）；
  - **底部控制**：支持一键恢复默认偏好设置，以及平滑关闭设置浮层。
- **新增 Lucide 矢量图标资源**：
  - `resources/icons/camera.svg`（相机图标）
  - `resources/icons/sliders.svg`（偏好设置滑块图标）
  - `resources/icons/eye.svg` 与 `eye-off.svg`（密码显隐图标）
  - `resources/icons/external-link.svg`（外部链接跳转图标）
  - `resources/icons/rotate-ccw.svg`（重载与测试刷新图标）
- **Web 端对齐 - 字体缩放面板 (Font Scaling Popover)**：在 CardView 顶部栏集成与 Web 端相同的动态字号排版弹出层，支持 70%~150% 步进调节（±5%）与 80%/100%/120% 快捷预设标签，支持全局动态字号缩放。
- **Web 端对齐 - 生词本与历史抽屉 (HistoryView.qml)**：桌面端新增仿 Web 端 `HistoryDrawer` 的半透明玻璃抽屉层，支持按关键词实时过滤、全部与生词本标签快速切换、历史单项快速删除、清空全部历史，以及点击历史记录一键装载并发起即时翻译。
- **AppState 动态字号与历史管理 API**：
  - `fontSizePercent` (int, 70~150)：通知全局 QML 计算字号阶梯；
  - `setFontSizePercent(int)`：设置并持久化字号偏好；
  - `deleteHistory(int id)`：根据记录唯一 ID 删除对应项；
  - `clearText()`：便捷清空当前源词与翻译缓冲。

### [Changed]
- **CardView 主卡片多模态整合**：
  - 引入 `showScreenshotView` 状态，实现常规单词/句子翻译与截图逐行对照翻译之间的平滑无缝切换；
  - 搜索栏右侧截图按钮直通截图逐行视图；
  - 工具栏和滚动视图在截图翻译激活时自动优化隐匿，避免遮挡。
- **SearchInput 交互升级**：
  - 新增 `screenshotClicked` 信号，点击截图按钮即刻触发截图逐行对照展示及选区识别逻辑。
- **CMakeLists.txt 构建配置同步**：
  - 在 `QML_FILES` 中注册 `ScreenshotTranslationView.qml`；
  - 在 `RESOURCES` 中注册所有新增 SVG 矢量图资源，确保跨平台部署无遗漏。

### [Changed]
- **DesignTokens 视觉 Token 全面对齐 Web 端**：
  - 玻璃材质色谱：更新为 `#0c0d18` / `#16192a` / `#1e2238` 配合漫反射高光与 macOS 物理倒角刻痕；
  - 动态字号比例因子：引入 `fontScale: (appState ? appState.fontSizePercent : 100) / 100.0`；
  - 边框与输入态 Token：重构为 `borderSubtle` (`#14ffffff`)、`borderNormal` (`#26ffffff`)、`borderInput` (`#26ffffff`)、`borderInputFocus` (`#60a5fa`)。
- **WordDetailView 词汇卡片深度对齐 Web 端**：
  - 顶部标题行：新增高对比度单词粗体标题（`font.bold: true`）与淡蓝音标，整合美/英（US/UK）发音胶囊按钮；
  - 多词性释义支持：对齐 Web 端 `definitions.slice(1)` 展开次要词性与释义；
  - 交互增强：同义词与反义词点击直接触发当前词汇查询与翻译；
  - 动态字号适配：所有字号使用 `DesignTokens.fontScale` 动态联动。
- **SearchInput 交互优化**：
  - 支持双向文本绑定与输入清空（Clear）；
  - 截图按钮与清空按钮指针手势规范化（`cursorShape: Qt.PointingHandCursor`）；
  - 截图按钮直连 `appState.triggerSelectionTranslation()`。
- **CardView 主卡片整合**：
  - 顶部截图按钮与字体调节按钮完整连通；
  - 底部栏历史记录图标与生词收藏高亮状态精准同步；
  - 动态挂载 `HistoryView` 抽屉与 `fontPopover` 浮层。

### [Refactored]
- 规范化 QML 资源表 `CMakeLists.txt`：加入 `ui/card/HistoryView.qml`，确保构建与资源打包顺利通过。
- 退出动画：缩放 0.95 + 淡出 0.0（250-300ms InQuad），动画完成后退出
- 最小化到任务栏：`minimizeToTaskbar()`，先移除 AlwaysOnTop 再 showMinimized，恢复时重新设置置顶
- 右上角图标逐个吸入动画：窗口缩小时图标从右到左依次收缩宽度+淡出，250ms InOutCubic
- TrafficLights macOS 风格：悬停显示功能图标（×/−/⤢），150ms 淡入，原生配色
- 底部 Smart-Select 开关：替换原 en➔zh 语言对，蓝色滑块 + SMART-SELECT/PAUSED 状态文字
- isPinned 属性：窗口固定状态，QML 可绑定

### [Changed]
- 左上角按钮功能重定义：红色=退出应用，黄色=最小化到任务栏，绿色=缩小到药丸
- UI 整体边距优化：内容区左右 20px/上下 18px，顶部栏左右 18px，元素间距 14px
- 顶部分割线：添加左右边距（与内容对齐）
- 底部栏：合并操作工具栏和底部栏，左边 Smart-Select 开关，右边操作按钮
- 右上角图标：右边距 10px，图标容器 26×26，吸入阈值 430/390/350px
- 操作按钮图标：13px，40% 透明度白，悬停提亮

### [Fixed]
- 搜索框与音标行重叠：移除 WordDetailView 和句子翻译的手动 `y` 属性（ColumnLayout 中手动设 y 导致偏移）
- QML 调用 C++ 方法失败：`setSourceText`/`setSelectionTranslation`/`setSourceLang`/`setTargetLang`/`setIsFavorite`/`setCompactMode`/`setAutoSpeak`/`setCardOpacity` 添加 `Q_INVOKABLE` 标记
- 最小化到任务栏崩溃：frameless + AlwaysOnTop 窗口直接 showMinimized() 崩溃，改为先移除置顶再最小化
- 右上角图标缩小被裁切：移除 `clip: true`，增加右边距，调整吸入阈值
- 音标行高度不稳定：添加 `Layout.preferredHeight: 24`
- 顶部栏布局重构：去掉第二个弹簧，图标组固定在右边（12px边距）；按钮先缩小（13→11→10px）再逐个吸走；中间组先缩小再隐藏（<300px）
- 顶部栏布局二次优化：去掉中间组整体隐藏动画（避免弹簧跳动），语言选择器<250px隐藏、引擎状态<280px隐藏；图标按钮先缩小（13→11→9px，容器26→24→20px）再逐个吸走（截图>450/固定>410/字体>370）；图标组绝对固定右边
- 顶部栏布局三次优化：按钮先跟随窗口缩小到最小（13→11→9→8px，容器26→24→20→18px），缩到最小后才逐个隐藏（截图>300/固定>270/字体>240）；语言选择器<220px隐藏、引擎状态<240px隐藏
- 顶部栏布局四次优化：从 RowLayout 改为绝对定位，TrafficLights 左对齐、中间组居中、图标组右对齐（12px边距），彻底消除弹簧跳动；所有元素大小/宽度变化带 Behavior 动画，丝滑流畅
- 顶部栏布局五次优化：增加顶部栏高度（34/36/42px）避免与内容重叠；图标缩小范围调整为13→11→10px（缩到中等程度即开始隐藏）；按钮隐藏阈值调整为截图>360/固定>330/字体>300
- 顶部栏布局六次优化（全面重构）：LanguageSelector 合并 EN/Zh 到一个胶囊；顶部栏高度增至40/44/50px；引擎状态默认小绿点（居中+发光），悬浮展开显示名称；截图/固定按钮始终显示，字体/设置按钮 hover 弹出；内容区域边距间距更紧凑；所有动画丝滑流畅
- 顶部栏布局七次优化：正常状态全部按钮显示；缩小到<380px进入compactMode，字体/设置按钮隐藏；hover检测范围缩小到一个图标大小(26px)，仅在compactMode时启用；鼠标移到最右边图标位置自动弹出隐藏按钮
- 顶部栏布局八次优化：引擎状态默认展开（小绿点+名称），不再默认小绿点；图标按钮缩小后一个一个被吸进去（设置>400px先吸，字体>360px后吸，截图+固定始终显示）；hover弹出所有隐藏按钮
- 顶部栏布局九次优化（动画丝滑化）：图标大小改为连续线性插值（10-13px）避免离散跳动；按钮隐藏用宽度收缩+clip而非位移；动画时长增至300ms InOutCubic；窗口根据内容自动变换大小（adjustHeightToContent，200-800px范围，300ms延迟防抖）
- 顶部栏布局十次优化：撤销整体窗口自动大小（用户要求）；引擎状态框宽度根据内容自动变化（engineContent.width + 16px左右边距），内部Row布局小绿点+文字居中，200ms宽度动画
- 顶部栏布局十一次优化：修复引擎状态框文字未被包裹问题（发光效果Rectangle占了Row宽度）；将发光效果放入小绿点Item内部，Row宽度只算小绿点+间距+文字
- 顶部栏布局十二次优化（全面恢复先缩小再隐藏逻辑）：引擎状态框正常展开，窗口<380px缩小为18px圆点，悬浮自动展开；语言选择器添加iconOnly模式，窗口<320px缩小为交换图标，悬浮展开；图标按钮保持先缩小（10-13px连续插值）再隐藏（宽度收缩）逻辑；所有动画250ms InOutCubic丝滑流畅
- 顶部栏布局十三次优化：状态框和选择器最后不隐藏；语言选择器最终变为文字->单向（EN->ZH），窗口<300px触发textOnly模式，悬浮展开为完整模式；状态框保持圆点模式不隐藏
- 顶部栏布局十四次优化：修复缩到最窄中间组消失问题（middleGroup opacity改为始终1）；语言选择器textOnly模式改为蓝色无边框（#60a5fa，EN➔ZH），使用➔符号替代->
- 顶部栏布局十五次优化：中间组间距从8px增至10px，添加spacing动画；确保展开时其他元素自动让步（Row布局自动调整位置）；所有动画丝滑流畅
- 顶部栏布局十六次优化：TrafficLights默认小紧凑（10px按钮+4px间距），hover后变正常（12px+6px间距）；中间组间距动态调整（<280px=4px,<340px=6px,其他=10px）；TrafficLights与中间组重叠时自动隐藏，谁也不遮挡谁
- 顶部栏布局十七次优化：TrafficLights改为胶囊框（Rectangle根元素，圆角半透明背景+边框）；只有两种状态：紧凑（9px按钮+4px间距+16px高）和宽松（11px+6px+20px高）；左上角三个按钮固定显示不隐藏；其他元素根据展开情况隐藏确保不重叠；全部动画200ms OutCubic丝滑流畅
- 顶部栏布局十八次优化：修复TrafficLights不显示问题（根元素id从lightsContainer改为lights，修复属性和信号引用错误）；中间组与红绿灯或图标组重叠时自动隐藏，确保谁也不遮挡谁
- 药丸视图优化：红绿灯换成TrafficLights胶囊框（和卡片一致），hover自动放大；降低显示阈值（左侧280px/右侧360px）；音量和复制按钮添加点击事件；翻译结果正常显示
- 顶部栏逻辑重构（按用户要求）：红绿灯去掉compact，初始最小状态不变，只有hover才变大；选择器和状态框始终显示不隐藏；调整缩小阈值（先缩小尺寸，缩到没空间再继续缩小，然后才隐藏）；展开时三个元素互相让步
- 顶部栏动画优化（按用户要求）：红绿灯初始更小（8px按钮+3px间距+14px高），hover线性放大（10px+5px+18px）；宽度直接计算不依赖子元素，确保宽高同时线性变化；所有动画统一为Linear缓动，时长180ms，消除弹簧感；缩小同时收紧间距
- 方向感知缩放（按用户要求）：检测窗口缩放方向（左/右边缘），从左边缩小就左边先变紧凑，从右边缩小就右边先变紧凑；动态调整左右边距，留出最小空隙6px；放大时反向恢复；全部线性动画，过渡自然丝滑流畅
- 顶部栏紧凑优化（按用户要求）：缩到最小时状态框和选择器间距更紧凑（最小0px）；右边工具页面缩小时也变紧凑（图标9-13px/按钮22-26px线性插值）；状态框圆点模式去掉外面的边框
- 顶部栏逻辑优化（按用户要求）：选择器各模式宽度更紧凑（textOnly 44px/minimal 64px/compact 78px/完整 90px）；图标组隐藏阈值调整（设置360px/字体320px），确保先整体缩小紧凑到最小再隐藏；全部线性动画丝滑流畅
- 顶部栏紧凑度再优化（按用户要求）：选择器和状态框间距再小一点（<240=0/<300=1/<360=2/<420=4/其他=8px）；右边功能图标缩小同时更紧凑（图标8-13px/按钮20-26px，缩小更快）；放大时边上的先出来然后放大，左右边同理
- 右边图标固定大小（按用户要求）：右边的图标在页面放大缩小时都保持正常大小（图标13px/按钮26px固定），不随窗口缩放；隐藏逻辑保留（设置>360px/字体>320px）
- 选择器边距再优化（按用户要求）：页面最小时选择器两边边距再小一点，各模式宽度收紧（textOnly 40px/minimal 60px/compact 74px/完整 86px）
- 顶部间距+底部栏统一逻辑（按用户要求）：状态框和选择器间距再小一点（<260=0/<320=1/<380=2/<440=3/其他=6px）；底部栏图标采用和顶部一样的逻辑（固定大小13px/26px，宽度收缩隐藏，180ms Linear动画，hover弹出，放大时边上的先出来）；复制+音量始终显示，收藏>340px，历史>380px
- 顶部/底部逻辑再调整（按用户要求）：页面最小时选择器更紧凑（textOnly 36px/minimal 56px/compact 70px/完整 82px）；顶部逻辑中间先缩小然后两边隐藏（选择器textOnly<260/状态框圆点<300/字体隐藏<260/设置隐藏<300）；底部只要有空间就不隐藏没空间再一一隐藏（收藏<260/历史<300），确保不被遮挡
- 顶部栏动态空间分配（按用户要求）：实现智能空间分配算法，中间组检查两边空间，有空间就不动，没空间再缩小；缩小后两边有空间了再继续缩小；中间缩到最小后没空间了右边图标才开始隐藏；在状态框右边设置一道墙，右边图标不能超过；全部线性动画丝滑流畅
- 顶部栏三盒子逻辑重构（按用户要求）：给红绿灯/中间组/图标组都加盒子，谁都不能超过谁；页面缩小时先同时减小盒子间空间，没空间就先给中间盒子缩小，又有空间就继续缩小空间，还没空间就右边盒子缩小（隐藏按钮），左边盒子一直不变；全部线性动画丝滑流畅
- 三盒子重叠修复（按用户要求）：右边宽度用全部按钮宽度计算而非当前显示宽度，确保中间先缩到最小；右边在中间没变到最小前绝对不变（去掉iconOverWall提前隐藏）；middleNaturalWidth改回硬编码避免绑定循环；确保盒子不能越过盒子
- 永远不重叠修复（按用户要求）：middleNaturalWidth用安全最大值(90+80+8=178)覆盖状态框展开最大宽度；调整缩小阈值(compactWidth/minimalWidth/textOnlyWidth逐级判断)，确保每个模式下都不重叠；整个逻辑全部线性动画，右边和中间无论什么状态都不重叠
- 顶部栏三盒子空间分配算法重构（按用户要求，联网搜索最佳实践后）：删除旧逻辑，用清晰的统一空间分配算法重新实现；固定宽度定义(leftWidth/rightFullWidth/rightMinWidth/middleNatural/middleCompact/middleMinimal/middleMin)；第一步计算间距(有空间就同时减小)，第二步计算中间盒子宽度(间距缩到0后没空间就缩小中间)，第三步计算右边盒子宽度(中间缩到最小还不够才缩小右边)；右边按钮平滑收缩隐藏(settingsBtnW/fontBtnW)；永远不重叠，全部线性动画
- 顶部栏墙碰撞检测重构（按用户要求的新思路）：删除宽度计算逻辑，改用墙碰撞检测；左墙=红绿灯右边+间隙，右墙=图标左边+间隙(用右边全部显示宽度)；中间盒子在两墙之间，碰到墙就缩小(compact/minimal/textOnly)；中间缩到最小还被墙推→右边开始隐藏；右边按钮平滑收缩隐藏；永远不重叠，全部线性动画
- 不重叠最高优先级修复（按用户要求）：右边在中间没变到最小前正常不变，但不变会导致重叠时也要隐藏；添加重叠检测(middleRightEdge vs rightLeftEdge)；rightShouldShrink = 中间缩到最小还被推 || 检测到重叠；重叠时右边收缩量增加重叠部分+4px；确保不重叠是最高优先级
- 稳定重叠逻辑修复（避免绑定循环）：右墙用右边全部显示时的宽度计算(rightWallFull)，不依赖当前rightWidth；重叠检测用"假设右边全部显示时中间右边界是否超过右墙"；右边宽度=中间没缩到最小则不重叠保持full/重叠则收缩到不重叠，中间缩到最小则根据空间收缩；不重叠最高优先级，右边在中间没变到最小前正常不变但不变会重叠时也要隐藏
- 直接计算不重叠修复（按用户要求）：右边宽度直接根据中间实际宽度计算，maxRightWidthNoOverlap = width - rightMargin - (width+middleGroup.width)/2 - wallGap，rightWidth = max(52, min(104, maxRightWidthNoOverlap))；确保右边图标不会超过状态框；缩小页面优先减小空间(间距)再缩小盒子，spacing=空间>自然宽度时从6px减小，空间<=自然宽度时间距为0盒子开始缩小
- 顶部栏Row+弹簧重构（按用户建议）：整个顶部用Row+弹簧结构，红绿灯|左弹簧|中间组|右弹簧|右边图标；Row自动排列天然不重叠；弹簧先减小(间距)减到0后盒子再缩小；左右弹簧一样宽保持中间居中；简化属性计算；优先减小空间再缩小盒子；不重叠最高优先级
- 动画全面优化（按用户要求）：去掉弹簧改用绝对定位；所有动画统一为150ms Linear缓动；IconButton点击缩放150ms Linear(0.90)、悬停透明度150ms Linear、背景色150ms Linear；顶部栏所有宽度/间距/透明度动画统一150ms Linear；底部栏开关动画150ms Linear；整体交互动画丝滑流畅线性
- 顶部栏Row框架重构（按用户要求）：改用Row框架+左右弹簧；所有动画缩短到100ms，变化更及时无延迟；右边图标组改用Row排列，隐藏时一个一个被吸进去（宽度收缩+clip）；右边图标组添加clip:true确保不超过圆角边框；图标透明度阈值改为10更平滑；整体交互动画丝滑流畅
- 图标隐藏动画增强（按用户要求）：字体按钮和设置按钮隐藏时添加scale缩放动画（1.0→0.0）；同时保持opacity淡出动画（1→0）；容器宽度收缩动画（26→0）；三个动画同时进行100ms Linear，形成"被吸进去"的视觉效果
- 顶部栏去弹簧绝对定位（按用户要求）：去掉leftSpring/rightSpring弹簧元素，改用绝对定位；红绿灯anchors.left+leftMargin；中间组anchors.horizontalCenter居中；右边图标anchors.right+rightMargin；右边图标组width=min(childrenRect.width,可用空间)双重保障不超出边框；所有动画保持100ms Linear及时响应；无弹簧结构，变化丝滑流畅
- 顶部栏Row+线性弹簧（按用户要求解决重叠问题）：改回Row结构，Row自动排列元素不会重叠；红绿灯+左弹簧+中间组+右弹簧+右边图标；弹簧动画用线性100ms Linear，无弹簧感；右边图标组clip:true确保不超出边框；解决绝对定位导致的右边图标覆盖状态框问题；所有动画保持100ms Linear及时响应
- 底部栏Row结构（按用户要求）：操作工具栏和底部栏从RowLayout改为Row结构，和顶部栏保持一致；操作工具栏：语言方向+弹簧+操作按钮组（复制/音量/收藏/历史）；底部栏：Smart-Select开关+弹簧+窗口尺寸；所有动画保持100ms Linear；底部切换按钮正常显示
- 底部栏布局修正（按用户要求）：操作工具栏左边改为Smart-Select切换按钮（不是EN➔ZH），右边操作图标在最右边；底部栏左边改为EN➔ZH，右边窗口尺寸；避免smartSelectGroup重名；操作图标固定在最右边；切换按钮正确显示Smart-Select开关
- 离线翻译修复（按用户反馈）：修复选择offline引擎时离线翻译用不了的问题；之前只有源语言为英文时才查离线词库，选择offline引擎时直接返回原文；现在选择offline引擎时始终使用离线词库查询；命中返回完整单词详情（音标/释义/词形变化/考试标签）；未命中或不支持该语言返回原文；不调用在线翻译；离线词库811.9MB ECDICT 340万词条正常加载

### 项目骨架初始化：CMake + Qt 6 Quick + C++20
- 透明窗口实现：Frameless + per-pixel alpha 圆角
- TranslatorWindow 窗口管理类：药丸/卡片状态机、窗口几何管理、尺寸动画
- AppState 状态管理：翻译结果、设置、收藏、字号等 QML 上下文属性
- QML 设计系统：DesignTokens 单例（颜色/间距/圆角/字号/动画 Token）
- GlassSurface 毛玻璃表面组件：半透明背景 + 圆角 + 边框 + 投影 + 自动漫游高光
- TrafficLights 红绿灯组件：清空/最小化/刷新
- HoverScrollText 悬停滚动文本组件：溢出检测 + 双向平滑滚动
- MarqueeText 循环跑马灯组件：药丸模式译文无限滚动
- IconButton 圆形图标按钮组件
- LanguageSelector 语言选择器组件
- SearchInput 搜索输入框组件
- WordDetailView 单词详情组件：音标/词性/释义/例句/同反义词/美英发音
- PillView 药丸视图：全圆角纯黑 + 搜索框 + 原文|译文跑马灯 + 操作按钮
- CardView 卡片视图：顶部栏 + Flickable 内容区 + 操作工具栏 + 底部栏 + 8向拉伸手柄
- SettingsView 设置页面：引擎选择/API密钥/划词开关/自动发音/紧凑模式/透明度/字体大小
- Main.qml 状态机：pill ↔ card 视图切换过渡动画 + 尺寸动画
- 16 个 SVG 图标资源（lucide 风格描边图标）
- Demo 翻译数据：Efficient 单词完整释义

### 翻译引擎
- TranslationManager 翻译管理器：统一 Provider 接口，可插拔引擎
- GeminiProvider：Gemini 2.0 Flash API，支持单词详情 JSON 解析
- DeepLProvider：DeepL API（Free/Pro 自动识别）
- YoudaoProvider：有道翻译 API，SHA256 签名，单词详情解析
- 离线模式：原文回退

### 数据持久化
- DatabaseManager：SQLite 数据库管理
- 历史记录表：自动保存翻译记录，支持查询/清空/删除
- 收藏表：生词收藏，支持添加/删除/查询
- 数据库路径：%APPDATA%/Linguist/lingust.db

### 全局划词
- SelectionManager：Clipboard 方案全局划词翻译
- 模拟 Ctrl+C 复制选中文本
- GetClipboardSequenceNumber 安全恢复剪贴板
- 异步等待剪贴板变化（短超时轮询）

### TTS 发音
- SAPI.SpVoice 语音合成（mshta vbscript 调用，启动快）
- 美式英语：Microsoft Zira Desktop
- 英式英语：Microsoft Hazel Desktop
- 中文：Microsoft Huihui Desktop
- 美音/英音按钮切换

### 系统集成
- TrayManager：系统托盘图标 + 右键菜单
- 托盘菜单：显示主窗口/截图翻译/设置/退出
- 开机启动：注册表 HKCU\...\Run
- QApplication 替代 QGuiApplication（支持 Widgets/托盘）
- setQuitOnLastWindowClosed(false)：关窗不退出

### 截图 OCR 框架
- CaptureManager：全屏截图（QScreen::grabWindow）
- OcrManager：OCR 引擎管理
- IOcrProvider：OCR Provider 接口（可插拔）
- 待实现：截图覆盖层、区域选择、Windows OCR / PaddleOCR

### [Fixed]
- GlassSurface.qml: `Qt5Compat.GraphicalEffects` → `QtQuick.Effects`（Qt 6.11 内置，无需 5Compat 模块）
- CMakeLists.txt: 移除 `Qt6::5Compat` 依赖（用户未安装该模块）
- TranslatorWindow.cpp: 移除 `setAttribute(Qt::WA_TranslucentBackground)`（QWindow 无此方法，改用 `setColor(Qt::transparent)`）
- TranslatorWindow.cpp: 手动定义 Windows 11 DWM 常量（`DWMWA_SYSTEMBACKDROP_TYPE`/`DWMSBT_TRANSIENTWINDOW` 等），兼容 MinGW 旧版头文件
- Application.cpp: 添加 `#include <QQuickItem>`（修复 qobject_cast 不完全类型错误）
- CMakeLists.txt: 添加 MSVC `/utf-8` 编译选项、输出目录配置
- 全部 QML 文件: Row/Column → RowLayout/ColumnLayout，修复布局属性误用
- 窗口圆角：放弃系统级毛玻璃（DWM Acrylic 与 per-pixel alpha 冲突），改用 QML 模拟毛玻璃质感
- QML 颜色：全部改用十六进制 `#aarrggbb`（Qt 6.11 rgba() 字符串解析报错）
- Singleton 注册：C++ qmlRegisterSingletonType 手动注册（QTP0004 自动识别漏识别 pragma Singleton）
- moc 崩溃：SelectionManager.h 移除 Windows 特定类型声明（HWND/DWORD 导致 moc 访问冲突）
- include 路径：统一相对路径，修复跨目录引用

### [Docs]
- README.md 项目说明与构建指南（含 MSVC/MinGW 双路径）
- docs/ARCHITECTURE.md 系统架构设计
- docs/CHANGELOG.md 更新日志
- AGENTS.md 项目规约

### [Build]
- Qt 6.11.2 + MinGW 13.1 + Ninja，输出 `build/bin/lingust.exe`
- 依赖模块：Core/Gui/Qml/Quick/QuickControls2/Network/Sql/Widgets
- 编译参数：-j 2（避免 cc1plus out of memory）

---

## 版本说明

- **v0.1.x**：UI 预览阶段，实现药丸/卡片视觉效果与状态切换
- **v0.2.x**：接入翻译引擎（Gemini/DeepL/有道/离线）✅
- **v0.3.x**：全局划词（UIA + Clipboard + OCR）✅（Clipboard 方案）
- **v0.4.x**：截图 OCR 与原地对照（框架已搭，待完善）
- **v0.5.x**：生词本、历史记录、TTS 发音 ✅
- **v0.6.x**：音乐控制（GSMTC）（待实现）
- **v1.0.0**：托盘、开机启动、自动更新、崩溃恢复，正式发布（托盘/开机启动 ✅）

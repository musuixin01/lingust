# Agent Working Guidelines & Project Conventions

## 核心工作规约

### 变动与文档实时同步规约

**在任何代码修改、功能新增、重构或缺陷修复时，必须同步更新项目文档：**

1. **变动记录日志 (`docs/CHANGELOG.md`)**
   - 每次代码变更按最新版本号/日期追加记录
   - 语义化分类：`[Added]` / `[Changed]` / `[Refactored]` / `[Fixed]` / `[Docs]`
   - 清晰列出涉及的文件与影响范围

2. **核心业务文档同步**
   - UI 视觉/交互/颜色/排版调整 → `docs/DESIGN_SYSTEM.md`
   - API 新增/修改 → `docs/API.md`
   - 系统拓扑/组件拆分/架构演进 → `docs/ARCHITECTURE.md`
   - 用户端功能入口/安装配置变动 → `README.md`

### 技术栈约束

- **UI 层**：QML 只管界面，禁止直接调用 Win32 API
- **Core 层**：C++20 管逻辑，平台无关
- **Platform 层**：C++/WinRT + Win32 管 Windows 系统调用
- **新增翻译/OCR 引擎**：必须实现对应 Provider 接口，不得修改 UI 层

### 窗口设计铁律

- 不使用 `SetWindowRgn` 裁剪圆角
- 不创建巨大透明窗口做局部点击穿透
- 每个窗口尺寸紧贴自身内容
- 药丸/卡片共用 TranslatorWindow，通过状态机切换
- 设置/截图/历史记录使用独立窗口

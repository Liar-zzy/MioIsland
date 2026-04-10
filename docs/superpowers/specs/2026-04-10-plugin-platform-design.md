# CodeIsland Plugin Platform — Design Spec

**Date:** 2026-04-10
**Status:** Draft
**Author:** Ying + Claude

---

## 1. Overview

CodeIsland 开放插件平台，让任何开发者（通过 AI 工具）都能为 CodeIsland 创建插件，经审核后上架，用户付费下载，利益分成。

### 核心流程

```
开发者 fork codeisland-plugin-template
  → AI (Claude Code / Codex) 读取 CLAUDE.md，生成插件
  → 开发者提交 PR 到 codeisland-plugin-registry
  → 维护者审核（功能、安全、质量）
  → 合并后自动上架
  → 用户在 CodeIsland app 内浏览/安装
  → 付费插件通过 Stripe 结算，70/30 分成
```

---

## 2. 插件类型（第一批）

### 2.1 主题包 (Theme Plugin)

**格式：** 声明式 JSON，模板填空。

```json
{
  "type": "theme",
  "id": "ocean-night",
  "name": "Ocean Night",
  "version": "1.0.0",
  "author": { "name": "Dev Name", "url": "https://..." },
  "price": 0,
  "palette": {
    "bg": "#0A1628",
    "fg": "#E0E8F0",
    "secondaryFg": "#6B7D94",
    "accent": "#4FC3F7"
  },
  "preview": "preview.png"
}
```

**约束：**
- bg/fg 对比度 ≥ 4.5:1 (WCAG AA)
- accent 颜色可选，用于高亮元素
- preview.png 必须是 280×200 截图
- 状态色（green/orange/red）不可覆盖，保持语义

### 2.2 Buddy 角色 (Buddy Plugin)

**格式：** 像素网格定义 + 动画帧。

```json
{
  "type": "buddy",
  "id": "shiba-inu",
  "name": "Shiba Inu",
  "version": "1.0.0",
  "author": { "name": "Dev Name" },
  "price": 200,
  "grid": { "width": 13, "height": 11, "cellSize": 4 },
  "frames": {
    "idle": [
      { "duration": 500, "pixels": "base64-encoded-bitmap" },
      { "duration": 500, "pixels": "base64-encoded-bitmap" }
    ],
    "working": [ ... ],
    "needsYou": [ ... ],
    "thinking": [ ... ],
    "error": [ ... ],
    "done": [ ... ]
  },
  "preview": "preview.gif"
}
```

**约束：**
- 必须提供全部 6 种动画状态：idle, working, needsYou, thinking, error, done
- 网格尺寸固定 13×11，cellSize 固定 4px（与现有像素猫一致）
- 每个状态至少 1 帧，最多 8 帧
- 像素数据用 base64 编码的 1-bit bitmap（每像素 1 bit，有/无）
- 颜色由主题 palette.fg 控制，buddy 不自带颜色（保持主题一致性）
- preview.gif 展示 idle 动画，最大 200KB

### 2.3 音效/音乐包 (Sound Plugin)

**格式：** 音频文件 + 配置。

```json
{
  "type": "sound",
  "id": "lofi-coding",
  "name": "Lo-Fi Coding",
  "version": "1.0.0",
  "author": { "name": "Dev Name" },
  "price": 300,
  "category": "music",
  "sounds": {
    "bgm": {
      "file": "lofi-coding.m4a",
      "loop": true,
      "volume": 0.3
    }
  },
  "preview": "preview.m4a"
}
```

**音效类别：**
- `music` — 背景音乐（循环播放）
- `notification` — 提示音（session 完成、需要审批等）
- `ambient` — 环境音（键盘声、白噪音等）

**约束：**
- 格式：m4a 或 mp3
- 单文件最大 5MB，整个插件包最大 20MB
- bgm 必须可无缝循环
- notification 音效长度 ≤ 3 秒
- preview 音频长度 ≤ 15 秒
- 必须拥有版权或使用 CC0/MIT 授权音频

---

## 3. 插件包结构

每个插件是一个目录，结构固定：

```
shiba-inu/
├── plugin.json          # 插件元数据（上面定义的格式）
├── CLAUDE.md            # AI 开发说明（模板自带，开发者不改）
├── README.md            # 人类可读说明
├── LICENSE              # 开源或商业许可
├── preview.png/gif/m4a  # 预览素材
└── assets/              # 资源文件（音频、额外图片等）
```

**plugin.json 公共字段：**

```json
{
  "type": "theme | buddy | sound",
  "id": "unique-kebab-case-id",
  "name": "Human Readable Name",
  "version": "semver",
  "minAppVersion": "1.11.0",
  "author": {
    "name": "Developer Name",
    "url": "https://optional-url",
    "github": "username"
  },
  "price": 0,
  "description": "One-line description",
  "tags": ["dark", "minimal"],
  "preview": "preview.png"
}
```

- `price`: 0 = 免费，整数 = 美分（200 = $2.00），货币固定 USD
- `id`: 全局唯一，审核时检查冲突
- `minAppVersion`: 最低兼容版本。app 遇到高于自身版本的插件时显示"需要更新 CodeIsland"

---

## 4. 插件模板仓库 (codeisland-plugin-template)

### 仓库结构

```
codeisland-plugin-template/
├── CLAUDE.md                    # AI 开发指南（核心文档）
├── AGENTS.md                    # 通用 AI agent 指南（CLAUDE.md 的副本，非 symlink，因 GitHub 不渲染 symlink）
├── README.md                    # 人类开发者指南
├── schemas/
│   ├── theme.schema.json        # JSON Schema 校验
│   ├── buddy.schema.json
│   └── sound.schema.json
├── examples/
│   ├── theme-example/
│   │   └── plugin.json
│   ├── buddy-example/
│   │   ├── plugin.json
│   │   └── preview.gif
│   └── sound-example/
│       ├── plugin.json
│       └── assets/notification.m4a
├── tools/
│   └── validate.sh              # 本地校验脚本
└── docs/
    ├── theme-guide.md
    ├── buddy-guide.md
    └── sound-guide.md
```

### CLAUDE.md 内容策略

这是整个平台最关键的文件。AI 读完这一个文件就必须能生成合规插件。

**结构：**

```markdown
# CodeIsland Plugin Development

你正在为 CodeIsland（macOS notch app）开发插件。

## 快速开始

1. 确定插件类型：theme / buddy / sound
2. 复制 examples/<type>-example/ 为你的插件目录
3. 编辑 plugin.json
4. 运行 tools/validate.sh <your-plugin-dir> 校验
5. 完成后提交 PR 到 codeisland-plugin-registry

## 规范（按类型）

### Theme 插件
- [完整 JSON schema 内联]
- [约束条件]
- [示例]

### Buddy 插件
- [像素网格规范]
- [6 种动画状态说明]
- [帧数据编码方式]
- [示例]

### Sound 插件
- [音频格式要求]
- [文件大小限制]
- [示例]

## 常见错误

- ❌ buddy 少了某个动画状态 → 必须全部 6 种
- ❌ 主题对比度不够 → bg/fg 对比度 ≥ 4.5:1
- ❌ 音频文件太大 → 单文件 ≤ 5MB
- ❌ id 用了大写或空格 → 只允许 kebab-case

## 校验

运行 `./tools/validate.sh my-plugin/` 会检查：
- JSON schema 合规性
- 必需文件是否存在
- 图片/音频格式和大小
- 对比度计算（主题）
- 动画状态完整性（buddy）
```

---

## 5. 插件 Registry (codeisland-plugin-registry)

### 仓库结构

```
codeisland-plugin-registry/
├── plugins/
│   ├── themes/
│   │   ├── ocean-night/
│   │   │   ├── plugin.json
│   │   │   └── preview.png
│   │   └── ...
│   ├── buddies/
│   │   ├── shiba-inu/
│   │   │   ├── plugin.json
│   │   │   ├── preview.gif
│   │   │   └── assets/
│   │   └── ...
│   └── sounds/
│       └── ...
├── registry.json                # 自动生成的索引
├── .github/
│   └── workflows/
│       ├── validate-pr.yml      # PR 自动校验
│       └── build-registry.yml   # 合并后重建索引
└── CONTRIBUTING.md
```

### registry.json（app 拉取的索引）

```json
{
  "version": 1,
  "updatedAt": "2026-04-10T00:00:00Z",
  "plugins": [
    {
      "id": "ocean-night",
      "type": "theme",
      "name": "Ocean Night",
      "version": "1.0.0",
      "author": "Dev Name",
      "price": 0,
      "description": "Deep ocean dark theme",
      "tags": ["dark", "blue"],
      "downloadUrl": "https://raw.githubusercontent.com/IsleOS/codeisland-plugin-registry/main/plugins/themes/ocean-night/",
      "previewUrl": "https://raw.githubusercontent.com/IsleOS/codeisland-plugin-registry/main/plugins/themes/ocean-night/preview.png"
    }
  ]
}
```

### PR 审核流程

```
开发者提交 PR（添加 plugins/<type>/<id>/ 目录）
  → GitHub Actions 自动运行 validate
  → 校验通过：标记 ✅ ready-for-review
  → 校验失败：评论具体错误，开发者修复
  → 你人工审核：质量、创意、安全
  → 合并 → CI 自动重建 registry.json
  → app 下次刷新时看到新插件
```

---

## 6. CodeIsland App 内插件系统

### 6.1 插件加载器 (PluginManager)

```
~/.config/codeisland/plugins/
├── installed.json           # 已安装插件列表
├── themes/
│   └── ocean-night/
│       └── plugin.json
├── buddies/
│   └── shiba-inu/
│       └── plugin.json
└── sounds/
    └── lofi-coding/
        ├── plugin.json
        └── assets/lofi-coding.m4a
```

**PluginManager 职责：**
- 启动时扫描 `~/.config/codeisland/plugins/`
- 解析每个 plugin.json，校验 schema
- 注册主题到 NotchCustomizationStore（扩展 NotchThemeID）
- 注册 buddy 到 BuddyRegistry（新建）
- 注册音效到 SoundManager（新建）
- 定期检查 registry.json 更新

### 6.2 插件商店 UI

在 SystemSettingsView 中新增 "Plugins" tab：

```
┌─────────────────────────────────┐
│  Plugins                        │
├─────────────────────────────────┤
│  [Themes] [Buddies] [Sounds]    │  ← 分类 tab
│                                 │
│  ┌──────┐  ┌──────┐  ┌──────┐  │
│  │preview│  │preview│  │preview│ │
│  │Ocean  │  │Sunset │  │Mint  │  │
│  │Night  │  │Glow   │  │Fresh │  │
│  │Free   │  │$2.00  │  │$1.00 │  │
│  │[Install]│[Buy]  │  │[Buy] │  │
│  └──────┘  └──────┘  └──────┘  │
│                                 │
│  Installed (3)                  │
│  ├ Classic (built-in)           │
│  ├ Ocean Night ✓                │
│  └ Shiba Inu ✓                  │
└─────────────────────────────────┘
```

### 6.3 主题插件集成

当前 `NotchThemeID` 是 enum（编译时固定）。需要改为运行时可扩展。

**迁移策略：** 内置主题 ID 必须与当前 `NotchThemeID.rawValue` 完全一致（`"classic"`, `"paper"`, `"neonLime"`, `"cyber"`, `"mint"`, `"sunset"`），这样 `NotchCustomization.theme` 从 enum 改为 String 后，现有 UserDefaults 中 `notchCustomization.v1` 的 JSON 自然兼容，无需数据迁移。

```swift
// NotchCustomization.theme 从 NotchThemeID 改为 String
struct NotchCustomization: Codable, Equatable {
    var theme: String  // 原来是 NotchThemeID，现在是 String
    // ... 其他字段不变
}

struct ThemeDefinition: Codable, Identifiable {
    let id: String          // 内置主题用原 rawValue，插件用 plugin.json 的 id
    let name: String
    let palette: PaletteDefinition
    let isBuiltIn: Bool
}

@MainActor
final class ThemeRegistry: ObservableObject {
    static let shared = ThemeRegistry()
    @Published private(set) var themes: [ThemeDefinition] = []

    init() {
        // 注册 6 个内置主题，ID 必须匹配旧 enum rawValue
        registerBuiltInThemes()
    }

    func register(_ theme: ThemeDefinition) {
        themes.append(theme)
    }

    func palette(for id: String) -> NotchPalette {
        guard let theme = themes.first(where: { $0.id == id }) else {
            return .classic  // fallback 到经典主题
        }
        return theme.palette.toNotchPalette()
    }
}
```

**受影响的调用点：**
- `NotchPalette.for(_ id:)` → 改为从 ThemeRegistry 查询
- `NotchPaletteModifier` 中的 animation value → String 仍支持 Equatable，动画正常
- 设置界面主题选择器 → 从 `NotchThemeID.allCases` 改为 `ThemeRegistry.shared.themes`

### 6.4 Buddy 插件集成

**重要：** 内置像素猫是程序化渲染（多色、逐像素动画、正弦呼吸等），远超简单位图。插件 buddy 使用简化的索引色位图格式，两者共存。

```swift
struct BuddyDefinition: Codable, Identifiable {
    let id: String
    let name: String
    let grid: GridSpec           // { width: 13, height: 11, cellSize: 4 }
    let palette: [String]        // 索引色板，如 ["#FFFFFF", "#888888", "#FF6B6B"]，最多 8 色
    let frames: [String: [FrameData]]  // animationState -> frames
    let isBuiltIn: Bool
}

struct FrameData: Codable {
    let duration: Int            // 毫秒
    let pixels: String           // base64 编码，每像素 4 bit（索引值 0-15，0=透明）
                                 // 行优先，每行 ceil(width/2) 字节，高半字节在前
}

@MainActor
final class BuddyRegistry: ObservableObject {
    static let shared = BuddyRegistry()
    @Published private(set) var buddies: [BuddyDefinition] = []
    @Published var activeBuddyId: String = "pixel-cat"  // 持久化到 UserDefaults

    init() {
        registerBuiltIn()  // 像素猫标记为 isBuiltIn
    }
}
```

**渲染分支：**
- `activeBuddyId == "pixel-cat"` → 走现有 PixelCharacterView 程序化渲染（保持完整动画质量）
- 其他 → 新建 `PluginBuddyView`，用 Canvas + TimelineView 渲染 FrameData 位图，帧切换用 duration 定时器

这样内置猫的精细度不会降级，插件 buddy 用更简单但仍有表现力的格式（最多 8 色 + 多帧动画）。

### 6.5 Sound 插件集成

**重要：** 现有 SoundManager 使用 AVAudioEngine 程序化合成音效（无音频文件）。插件音效使用 AVAudioPlayer 播放文件。两者共存。

```swift
// 现有 SoundManager 保留，改名为 SynthSoundEngine（内置合成音效）
// 新增 PluginSoundManager 处理插件音频文件

@MainActor
final class PluginSoundManager: ObservableObject {
    static let shared = PluginSoundManager()

    @Published var activeBGMPlugin: String? = nil
    @Published var activeNotificationPlugin: String? = nil  // nil = 用内置合成音

    private var bgmPlayer: AVAudioPlayer?

    func playBGM(_ pluginId: String) { ... }
    func stopBGM() { ... }
    func playNotification(_ pluginId: String, event: SoundEvent) { ... }
}
```

**音效事件映射：** notification 类插件必须为以下事件提供音频文件：

```json
"sounds": {
  "session_start": { "file": "start.m4a" },
  "needs_approval": { "file": "alert.m4a" },
  "session_complete": { "file": "done.m4a" },
  "error": { "file": "error.m4a" }
}
```

缺少的事件 fallback 到内置合成音。

**优先级逻辑：**
- 用户选了插件音效包 → 用 PluginSoundManager 播放文件
- 用户选"Default" → 用现有 SynthSoundEngine 合成
- BGM 和通知音效独立选择，互不影响

---

### 6.6 插件更新与卸载

**更新：**
- app 每次启动 + 每 6 小时拉取 registry.json
- 对比已安装插件版本，版本号低于 registry 的标记"Update Available"
- 用户在 Plugins tab 点击 [Update] 手动更新（不自动更新，避免意外）
- 更新 = 下载新版本覆盖旧目录

**卸载：**
- 卸载当前激活的主题/buddy/音效 → 自动切回内置默认（classic/pixel-cat/default）
- 删除 `~/.config/codeisland/plugins/<type>/<id>/` 目录
- 更新 installed.json

**离线处理：**
- 无法连接 GitHub 时，插件商店显示已缓存的 registry + "offline" 标记
- 已安装的插件完全离线可用

---

## 7. 支付系统

### 早期方案（GitHub + Stripe）

```
用户点击 [Buy $2.00]
  → app 打开浏览器 → Stripe Checkout 页面
  → 用户支付（微信/支付宝/信用卡）
  → Stripe webhook → 你的服务器记录购买
  → 服务器返回 license key
  → 用户在 app 输入 license key → 解锁插件
```

**License 激活（零摩擦）：**
- Stripe Checkout 成功后重定向到 `codeisland://license?key=xxx&plugin=ocean-night`
- app 注册 `codeisland://` URL scheme，自动接收 license key
- 用户无需手动复制粘贴，支付完成即自动解锁
- 备用方案：Stripe 成功页面也显示 license key，用户可手动输入
- License key 绑定设备 Hardware UUID，最多激活 3 台 Mac
- 存储在 `~/.config/codeisland/licenses.json`
- 离线容忍：验证通过后缓存 30 天，不需要持续联网

### 分成结算

- Stripe 自动扣除手续费（~2.9% + $0.30）
- 剩余金额：平台 25%，开发者 75%
- 月结，通过 Stripe Connect 自动打款给开发者

---

## 8. 安全考虑

- **插件只有声明式数据**（JSON + 媒体文件），无可执行代码，无安全风险
- **审核检查：** plugin.json schema 合规、媒体文件无恶意（格式校验）、预览素材与实际一致
- **沙箱隔离：** 插件文件存储在 `~/.config/codeisland/plugins/`，app 只读取不执行
- **License 防盗：** license key 绑定设备 ID（Hardware UUID），一个 key 最多激活 3 台设备

---

## 9. 实施阶段

### Phase 1：基础设施（2-3 周）
- 创建 codeisland-plugin-template 仓库 + CLAUDE.md
- 定义 JSON schema（theme/buddy/sound）
- 写 validate.sh 校验工具
- 创建 codeisland-plugin-registry 仓库 + CI

### Phase 2：App 插件加载（2-3 周）
- 实现 PluginManager（扫描、解析、注册）
- 重构 NotchThemeID → ThemeRegistry
- 新建 BuddyRegistry + SoundManager
- PixelCharacterView 支持外部 buddy 定义

### Phase 3：插件商店 UI（1-2 周）
- SystemSettingsView 新增 Plugins tab
- 插件列表、预览、安装/卸载
- registry.json 定期拉取

### Phase 4：支付集成（1-2 周）
- Stripe Checkout 集成
- License key 生成和验证
- 购买流程打通

### Phase 5：开发者文档 + 示例插件（1 周）
- 完善文档站
- 发布 3-5 个官方示例插件
- 发布公告，邀请开发者

---

## 10. 成功指标

| 指标 | 3 个月目标 |
|------|-----------|
| Registry 插件数量 | 20+ |
| 付费插件数量 | 5+ |
| 付费用户数 | 50+ |
| 插件开发者数 | 10+ |
| 月收入 | $500+ |

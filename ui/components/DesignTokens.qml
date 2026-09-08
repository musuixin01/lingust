pragma Singleton
import QtQuick

QtObject {
    id: tokens

    // === Surfaces (清透拟物·毛玻璃白 / 冰雾冷调暗夜) ===
    readonly property color bgCard: "#1affffff"       // 10% 白，与 Web 端 bg-white/10 一致
    readonly property color bgCardBase: "#d8101420"   // 底层深空微蓝冷调高透黑，沉稳通透，消除发灰泥泞感
    readonly property color bgCardDeep: "#e60d111a"
    readonly property color bgSubtle: "#0dffffff"     // 5% 白微透容器
    readonly property color bgPill: "#f0090d16"       // 药丸深邃通透
    readonly property color bgDark: "#f0090d16"
    readonly property color bgInput: "#0dffffff"      // Web 输入框容器微透白 5%
    readonly property color bgInputFocus: "#1fffffff" // 聚焦微透白 12%

    // === Borders (细腻高级·与 Web 对齐) ===
    readonly property color borderNormal: "#33ffffff" // border-white/20
    readonly property color borderActive: "#59ffffff" // border-white/35
    readonly property color borderSubtle: "#1affffff" // border-white/10
    readonly property color borderInput: "#26ffffff"  // border-white/15
    readonly property color borderInputFocus: "#6660a5fa"

    // === Text ===
    readonly property color textPrimary: "#ffffff"
    readonly property color textSecondary: "#f1f5f9"
    readonly property color textTertiary: "#94a3b8"
    readonly property color textPlaceholder: "#64748b"

    // === Accent Colors ===
    readonly property color accentBlue: "#60a5fa"
    readonly property color accentBlueDim: "#8060a5fa"
    readonly property color accentEmerald: "#34d399"
    readonly property color accentAmber: "#fbbf24"
    readonly property color accentRed: "#f87171"
    readonly property color accentPurple: "#c084fc"

    // === Traffic Lights ===
    readonly property color lightRed: "#ccf87171"
    readonly property color lightAmber: "#ccfbbf24"
    readonly property color lightEmerald: "#cc34d399"

    // === Radii ===
    readonly property int radiusCard: 32
    readonly property int radiusInner: 20
    readonly property int radiusMinimal: 16
    readonly property int radiusPill: 9999

    // === Spacing (8pt grid) ===
    readonly property int spaceXs: 4
    readonly property int spaceSm: 6
    readonly property int spaceMd: 8
    readonly property int spaceLg: 12
    readonly property int spaceXl: 16
    readonly property int space2xl: 24

    // === Font Sizes ===
    readonly property real fontScale: (typeof appState !== "undefined" && appState && appState.fontSizePercent) ? appState.fontSizePercent / 100.0 : 1.0
    readonly property int fontSizeMicro: 9
    readonly property int fontSizeXs: 11
    readonly property int fontSizeSm: 13
    readonly property int fontSizeBase: 15
    readonly property int fontSizeLg: 18
    readonly property int fontSizeXl: 20

    // === Animation ===
    readonly property int durationFast: 150
    readonly property int durationNormal: 250
    readonly property int durationSlow: 300
    readonly property string easingOut: "OutCubic"
    readonly property string easingSpring: "OutBack"

    // === Shadows (厚实深度) ===
    readonly property color shadowColor: "#a0000000"
    readonly property real shadowBlur: 70
    readonly property real shadowY: 30
}

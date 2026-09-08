import QtQuick

Item {
    id: surface

    property bool isPill: false
    property bool isDragging: false
    property bool showShadow: true

    // 自动漫游高光
    property real targetX: 190
    property real targetY: 245

    // === 第一层：深色底层（沉稳通透，深空暗夜基底）===
    Rectangle {
        id: bgBase
        anchors.fill: parent
        radius: surface.isPill ? DesignTokens.radiusPill : DesignTokens.radiusCard
        color: surface.isPill ? DesignTokens.bgPill : DesignTokens.bgCardBase
        opacity: (typeof appState !== "undefined" && appState && appState.cardOpacity) ? appState.cardOpacity : 0.96
    }

    // === 第二层：均匀磨砂层（10% 清透白，与 Web 端完全一致）===
    Rectangle {
        id: bgFrost
        anchors.fill: parent
        radius: bgBase.radius
        color: DesignTokens.bgCard
    }

    // === 第三层：动态柔光（大面积柔和弥散，无明显边界）===
    Rectangle {
        id: dynamicGlow
        width: 800
        height: 800
        radius: 400
        visible: !surface.isPill
        opacity: 0.4
        x: surface.targetX - 400
        y: surface.targetY - 400
        gradient: Gradient {
            GradientStop { position: 0.0; color: "#18ffffff" }
            GradientStop { position: 0.3; color: "#0cffffff" }
            GradientStop { position: 0.6; color: "#04ffffff" }
            GradientStop { position: 1.0; color: "#00000000" }
        }
        Behavior on x { NumberAnimation { duration: 6000; easing.type: Easing.InOutSine } }
        Behavior on y { NumberAnimation { duration: 6000; easing.type: Easing.InOutSine } }
        z: 1
    }

    // 随机漫游定时器
    Timer {
        interval: 5000
        running: !surface.isPill
        repeat: true
        onTriggered: {
            surface.targetX = surface.width * 0.2 + Math.random() * surface.width * 0.6
            surface.targetY = surface.height * 0.2 + Math.random() * surface.height * 0.6
        }
    }

    // === 玻璃边缘：外高光（模拟玻璃边缘光线折射）===
    Rectangle {
        anchors.fill: parent
        radius: bgBase.radius
        color: "transparent"
        border.color: surface.isDragging ? DesignTokens.borderActive : DesignTokens.borderNormal
        border.width: 1
        Behavior on border.color { ColorAnimation { duration: DesignTokens.durationNormal } }
        z: 2
    }

    // === 玻璃边缘：内阴影（模拟玻璃厚度）===
    Rectangle {
        anchors.fill: parent
        anchors.margins: 1
        radius: bgBase.radius - 1
        color: "transparent"
        border.color: "#1a000000"
        border.width: 1
        z: 3
    }

    // === 顶部玻璃高光（物理光照，柔和过渡）===
    Rectangle {
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.top: parent.top
        height: 50
        radius: bgBase.radius
        gradient: Gradient {
            orientation: Gradient.TopBottom
            GradientStop { position: 0.0; color: "#26ffffff" }
            GradientStop { position: 0.4; color: "#0dffffff" }
            GradientStop { position: 1.0; color: "#00000000" }
        }
        opacity: surface.isPill ? 0.5 : 0.35
        z: 4
    }

    // === 底部玻璃阴影（增加厚度）===
    Rectangle {
        anchors.left: parent.left
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        height: 30
        radius: bgBase.radius
        gradient: Gradient {
            orientation: Gradient.BottomTop
            GradientStop { position: 0.0; color: "#1a000000" }
            GradientStop { position: 1.0; color: "#00000000" }
        }
        opacity: surface.isPill ? 0.4 : 0.3
        z: 4
    }

    // === 拖拽蓝色轮廓环 ===
    Rectangle {
        anchors.fill: parent
        radius: bgBase.radius
        color: "transparent"
        border.color: "#4d60a5fa"
        border.width: 1.5
        opacity: surface.isDragging ? 1.0 : 0.0
        Behavior on opacity { NumberAnimation { duration: 200 } }
        z: 5
    }
}

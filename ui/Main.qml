import QtQuick
import Linguist

Item {
    id: root

    anchors.fill: parent

    property string currentMode: translatorWindow ? translatorWindow.currentMode : "pill"
    property bool isDragging: false
    property bool showSettings: false
    property real entryScale: 0.92
    property real entryOpacity: 0
    property string resizeEdge: "none" // 记录当前缩放边缘：left/right/none

    // 入场动画
    Component.onCompleted: {
        entryAnimation.start()
    }

    // 退出动画
    function quitApp() {
        quitAnimation.start()
    }

    ParallelAnimation {
        id: entryAnimation
        NumberAnimation { target: root; property: "entryScale"; to: 1.0; duration: 400; easing.type: Easing.OutCubic }
        NumberAnimation { target: root; property: "entryOpacity"; to: 1.0; duration: 500; easing.type: Easing.OutCubic }
    }

    ParallelAnimation {
        id: quitAnimation
        NumberAnimation { target: root; property: "entryScale"; to: 0.95; duration: 250; easing.type: Easing.InQuad }
        NumberAnimation { target: root; property: "entryOpacity"; to: 0.0; duration: 300; easing.type: Easing.InQuad }
        onFinished: Qt.quit()
    }

    // 整体缩放容器（入场动画用）
    Item {
        id: contentContainer
        anchors.fill: parent
        scale: root.entryScale
        opacity: root.entryOpacity

        // === 状态机：pill ↔ card ===
        states: [
            State {
                name: "pill"
                when: root.currentMode === "pill"
                PropertyChanges { target: pillView; opacity: 1.0; visible: true; scale: 1.0 }
                PropertyChanges { target: cardView; opacity: 0.0; visible: false; scale: 0.96 }
            },
            State {
                name: "card"
                when: root.currentMode === "card"
                PropertyChanges { target: pillView; opacity: 0.0; visible: false; scale: 0.96 }
                PropertyChanges { target: cardView; opacity: 1.0; visible: true; scale: 1.0 }
            }
        ]

        transitions: [
            Transition {
                from: "pill"; to: "card"
                ParallelAnimation {
                    NumberAnimation { target: pillView; property: "opacity"; to: 0; duration: 120; easing.type: Easing.InQuad }
                    NumberAnimation { target: pillView; property: "scale"; to: 0.96; duration: 200; easing.type: Easing.InQuad }
                    NumberAnimation { target: cardView; property: "opacity"; to: 1; duration: 250; easing.type: Easing.OutCubic }
                    NumberAnimation { target: cardView; property: "scale"; to: 1.0; duration: 280; easing.type: Easing.OutCubic }
                }
            },
            Transition {
                from: "card"; to: "pill"
                ParallelAnimation {
                    NumberAnimation { target: cardView; property: "opacity"; to: 0; duration: 120; easing.type: Easing.InQuad }
                    NumberAnimation { target: cardView; property: "scale"; to: 0.96; duration: 200; easing.type: Easing.InQuad }
                    NumberAnimation { target: pillView; property: "opacity"; to: 1; duration: 250; easing.type: Easing.OutCubic }
                    NumberAnimation { target: pillView; property: "scale"; to: 1.0; duration: 280; easing.type: Easing.OutCubic }
                }
            }
        ]

        // === 药丸视图 ===
        PillView {
            id: pillView
            anchors.fill: parent
            isDragging: root.isDragging
            visible: root.currentMode === "pill"
            onExpandRequested: translatorWindow.expandToCard()
        }

        // === 卡片视图 ===
        CardView {
            id: cardView
            anchors.fill: parent
            isDragging: root.isDragging
            resizeEdge: root.resizeEdge
            visible: root.currentMode === "card" && !root.showSettings
            onCollapseRequested: translatorWindow.collapseToPill()
            onTranslateRequested: appState.translate()
            onSettingsRequested: root.showSettings = true
            onQuitRequested: root.quitApp()
            onMinimizeToTaskbarRequested: translatorWindow.minimizeToTaskbar()
        }

        // 设置页面 - 缩放淡入动画
        Item {
            id: settingsContainer
            anchors.fill: parent
            visible: root.showSettings
            opacity: root.showSettings ? 1.0 : 0.0
            scale: root.showSettings ? 1.0 : 0.9
            Behavior on opacity { NumberAnimation { duration: 200; easing.type: Easing.OutCubic } }
            Behavior on scale { NumberAnimation { duration: 250; easing.type: Easing.OutCubic } }

            // 半透明遮罩
            Rectangle {
                anchors.fill: parent
                color: "#80000000"
                opacity: root.showSettings ? 0.5 : 0.0
                Behavior on opacity { NumberAnimation { duration: 200 } }
                MouseArea {
                    anchors.fill: parent
                    onClicked: root.showSettings = false
                }
            }

            SettingsView {
                id: settingsView
                anchors.centerIn: parent
                width: Math.min(parent.width - 20, 420)
                height: Math.min(parent.height - 20, 560)
                z: 100
                onCloseRequested: root.showSettings = false
            }
        }
    }

    // === 拖拽区域（仅顶部栏，不遮挡按钮）===
    MouseArea {
        id: dragArea
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.right: parent.right
        height: root.currentMode === "pill" ? parent.height : 38
        z: 1

        propagateComposedEvents: true
        hoverEnabled: false

        onPressed: function(mouse) {
            if (mouse.button === Qt.LeftButton) {
                root.isDragging = true
                if (translatorWindow) translatorWindow.startSystemMove()
            }
        }
        onReleased: function() {
            root.isDragging = false
        }
    }

    // === 8向缩放手柄（顶层，确保在拖拽区域之上）===
    // 右下角
    Rectangle {
        anchors.right: parent.right
        anchors.bottom: parent.bottom
        width: 18; height: 18
        color: "transparent"
        z: 100
        visible: root.currentMode === "card"
        MouseArea {
            anchors.fill: parent
            cursorShape: Qt.SizeFDiagCursor
            onPressed: function(m) {
                if (m.button === Qt.LeftButton && translatorWindow) {
                    root.resizeEdge = "right"
                    translatorWindow.startSystemResize(Qt.RightEdge | Qt.BottomEdge)
                }
            }
            onReleased: root.resizeEdge = "none"
        }
    }
    // 左下角
    Rectangle {
        anchors.left: parent.left
        anchors.bottom: parent.bottom
        width: 18; height: 18
        color: "transparent"
        z: 100
        visible: root.currentMode === "card"
        MouseArea {
            anchors.fill: parent
            cursorShape: Qt.SizeBDiagCursor
            onPressed: function(m) {
                if (m.button === Qt.LeftButton && translatorWindow) {
                    root.resizeEdge = "left"
                    translatorWindow.startSystemResize(Qt.LeftEdge | Qt.BottomEdge)
                }
            }
            onReleased: root.resizeEdge = "none"
        }
    }
    // 右上角
    Rectangle {
        anchors.right: parent.right
        anchors.top: parent.top
        width: 18; height: 18
        color: "transparent"
        z: 100
        visible: root.currentMode === "card"
        MouseArea {
            anchors.fill: parent
            cursorShape: Qt.SizeBDiagCursor
            onPressed: function(m) {
                if (m.button === Qt.LeftButton && translatorWindow) {
                    root.resizeEdge = "right"
                    translatorWindow.startSystemResize(Qt.RightEdge | Qt.TopEdge)
                }
            }
            onReleased: root.resizeEdge = "none"
        }
    }
    // 左上角
    Rectangle {
        anchors.left: parent.left
        anchors.top: parent.top
        width: 18; height: 18
        color: "transparent"
        z: 100
        visible: root.currentMode === "card"
        MouseArea {
            anchors.fill: parent
            cursorShape: Qt.SizeFDiagCursor
            onPressed: function(m) {
                if (m.button === Qt.LeftButton && translatorWindow) {
                    root.resizeEdge = "left"
                    translatorWindow.startSystemResize(Qt.LeftEdge | Qt.TopEdge)
                }
            }
            onReleased: root.resizeEdge = "none"
        }
    }
    // 右边缘
    Rectangle {
        anchors.right: parent.right
        anchors.top: parent.top
        anchors.topMargin: 24
        anchors.bottom: parent.bottom
        anchors.bottomMargin: 24
        width: 10
        color: "transparent"
        z: 100
        visible: root.currentMode === "card"
        MouseArea {
            anchors.fill: parent
            cursorShape: Qt.SizeHorCursor
            onPressed: function(m) {
                if (m.button === Qt.LeftButton && translatorWindow) {
                    root.resizeEdge = "right"
                    translatorWindow.startSystemResize(Qt.RightEdge)
                }
            }
            onReleased: root.resizeEdge = "none"
        }
    }
    // 左边缘
    Rectangle {
        anchors.left: parent.left
        anchors.top: parent.top
        anchors.topMargin: 24
        anchors.bottom: parent.bottom
        anchors.bottomMargin: 24
        width: 10
        color: "transparent"
        z: 100
        visible: root.currentMode === "card"
        MouseArea {
            anchors.fill: parent
            cursorShape: Qt.SizeHorCursor
            onPressed: function(m) {
                if (m.button === Qt.LeftButton && translatorWindow) {
                    root.resizeEdge = "left"
                    translatorWindow.startSystemResize(Qt.LeftEdge)
                }
            }
            onReleased: root.resizeEdge = "none"
        }
    }
    // 下边缘
    Rectangle {
        anchors.bottom: parent.bottom
        anchors.left: parent.left
        anchors.leftMargin: 24
        anchors.right: parent.right
        anchors.rightMargin: 24
        height: 10
        color: "transparent"
        z: 100
        visible: root.currentMode === "card"
        MouseArea {
            anchors.fill: parent
            cursorShape: Qt.SizeVerCursor
            onPressed: function(m) {
                if (m.button === Qt.LeftButton && translatorWindow)
                    translatorWindow.startSystemResize(Qt.BottomEdge)
            }
        }
    }
    // 上边缘（避开顶部拖拽区域的中间部分，只在两侧）
    Rectangle {
        anchors.top: parent.top
        anchors.left: parent.left
        anchors.leftMargin: 120
        anchors.right: parent.right
        anchors.rightMargin: 120
        height: 8
        color: "transparent"
        z: 100
        visible: root.currentMode === "card"
        MouseArea {
            anchors.fill: parent
            cursorShape: Qt.SizeVerCursor
            onPressed: function(m) {
                if (m.button === Qt.LeftButton && translatorWindow)
                    translatorWindow.startSystemResize(Qt.TopEdge)
            }
        }
    }
}

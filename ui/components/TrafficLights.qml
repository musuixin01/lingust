import QtQuick

Rectangle {
    id: lights
    // 直接计算宽度，不依赖子元素，确保线性同时变化
    width: lights.hovered ? 48 : 38
    height: lights.hovered ? 18 : 14
    radius: height / 2
    color: "#1affffff"
    border.color: "#2bffffff"
    border.width: 1

    property bool hovered: false

    signal closeClicked()
    signal minimizeClicked()
    signal collapseClicked()

    Row {
        id: lightsRow
        anchors.centerIn: parent
        spacing: lights.hovered ? 5 : 3

        Repeater {
            model: [
                { color: "#ff5f57", action: "close", icon: "qrc:/qt/qml/Linguist/resources/icons/close.svg" },
                { color: "#febc2e", action: "minimize", icon: "qrc:/qt/qml/Linguist/resources/icons/minus.svg" },
                { color: "#28c840", action: "collapse", icon: "qrc:/qt/qml/Linguist/resources/icons/maximize.svg" }
            ]

            delegate: Rectangle {
                // 初始更小，hover线性放大
                width: lights.hovered ? 10 : 8
                height: width
                radius: width / 2
                color: modelData.color
                opacity: 0.9

                Image {
                    anchors.centerIn: parent
                    source: modelData.icon
                    sourceSize.width: parent.width * 0.6
                    sourceSize.height: parent.width * 0.6
                    opacity: buttonMouse.containsMouse ? 0.8 : 0.0
                    Behavior on opacity { NumberAnimation { duration: 150; easing.type: Easing.Linear } }
                }

                MouseArea {
                    id: buttonMouse
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        if (modelData.action === "close") lights.closeClicked()
                        else if (modelData.action === "minimize") lights.minimizeClicked()
                        else lights.collapseClicked()
                    }
                    onEntered: {
                        parent.opacity = 1.0
                        lights.hovered = true
                    }
                    onExited: {
                        parent.opacity = 0.9
                        lights.hovered = false
                    }
                }

                // 平滑动画
                Behavior on width { NumberAnimation { duration: 180; easing.type: Easing.OutCubic } }
                Behavior on opacity { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }
            }
        }
    }

    // 整个胶囊的hover检测
    MouseArea {
        anchors.fill: parent
        hoverEnabled: true
        onEntered: lights.hovered = true
        onExited: lights.hovered = false
        propagateComposedEvents: true
    }

    // 平滑动画，宽高同时变化
    Behavior on width { NumberAnimation { duration: 180; easing.type: Easing.OutCubic } }
    Behavior on height { NumberAnimation { duration: 180; easing.type: Easing.OutCubic } }
}

import QtQuick

Rectangle {
    id: selector
    width: selector.textOnly ? 36 : (selector.iconOnly ? 24 : (selector.minimal ? 56 : (selector.compact ? 70 : 82)))
    height: 24
    radius: 12
    color: "transparent"
    // textOnly模式下无边框
    border.color: selector.textOnly ? "transparent" : DesignTokens.borderInput
    border.width: selector.textOnly ? 0 : 1

    property string sourceLang: "EN"
    property string targetLang: "ZH"
    property bool compact: false
    property bool minimal: false
    property bool iconOnly: false
    property bool textOnly: false
    property bool hovered: false

    signal sourceClicked()
    signal targetClicked()
    signal swapClicked()

    // 完整模式：EN ⇄ ZH
    Item {
        anchors.fill: parent
        visible: !selector.iconOnly && !selector.textOnly

        // 源语言
        Text {
            id: sourceText
            anchors.left: parent.left
            anchors.leftMargin: 10
            anchors.verticalCenter: parent.verticalCenter
            text: selector.sourceLang
            color: srcMouse.containsMouse ? "#ffffff" : DesignTokens.textSecondary
            font.pixelSize: selector.minimal ? 9 : 10
            font.weight: Font.Medium
            font.family: "Segoe UI"

            Behavior on color { ColorAnimation { duration: 150; easing.type: Easing.OutCubic } }

            MouseArea {
                id: srcMouse
                anchors.fill: parent
                anchors.margins: -4
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: selector.sourceClicked()
            }
        }

        // 交换按钮
        Rectangle {
            id: swapBtn
            anchors.centerIn: parent
            width: 18
            height: 18
            radius: 9
            color: swapMouse.containsMouse ? "#26ffffff" : "transparent"
            scale: swapMouse.pressed ? 0.88 : (swapMouse.containsMouse ? 1.10 : 1.0)

            Behavior on color { ColorAnimation { duration: 150; easing.type: Easing.OutCubic } }
            Behavior on scale { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }

            Image {
                id: swapIcon
                anchors.centerIn: parent
                source: "qrc:/qt/qml/Linguist/resources/icons/swap.svg"
                sourceSize.width: 11
                sourceSize.height: 11
                property real rot: 0
                rotation: rot
                Behavior on rot { NumberAnimation { duration: 250; easing.type: Easing.OutCubic } }
            }

            MouseArea {
                id: swapMouse
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: {
                    swapIcon.rot += 180;
                    selector.swapClicked();
                }
            }
        }

        // 目标语言
        Text {
            id: targetText
            anchors.right: parent.right
            anchors.rightMargin: 10
            anchors.verticalCenter: parent.verticalCenter
            text: selector.targetLang
            color: tgtMouse.containsMouse ? "#ffffff" : DesignTokens.textSecondary
            font.pixelSize: selector.minimal ? 9 : 10
            font.weight: Font.Medium
            font.family: "Segoe UI"

            Behavior on color { ColorAnimation { duration: 150; easing.type: Easing.OutCubic } }

            MouseArea {
                id: tgtMouse
                anchors.fill: parent
                anchors.margins: -4
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: selector.targetClicked()
            }
        }
    }

    // iconOnly模式：只显示交换图标
    Item {
        anchors.fill: parent
        visible: selector.iconOnly && !selector.textOnly

        Rectangle {
            anchors.centerIn: parent
            width: 18
            height: 18
            radius: 9
            color: "transparent"

            Image {
                anchors.centerIn: parent
                source: "qrc:/qt/qml/Linguist/resources/icons/swap.svg"
                sourceSize.width: 11
                sourceSize.height: 11
            }

            MouseArea {
                anchors.fill: parent
                hoverEnabled: true
                onClicked: selector.swapClicked()
                onEntered: parent.color = "#1affffff"
                onExited: parent.color = "transparent"
            }
        }
    }

    // textOnly模式：EN➔ZH 蓝色无边框
    Text {
        anchors.centerIn: parent
        visible: selector.textOnly
        text: selector.sourceLang + "➔" + selector.targetLang
        color: "#60a5fa"
        font.pixelSize: 10
        font.weight: Font.Medium
        font.family: "Segoe UI"

        MouseArea {
            anchors.fill: parent
            anchors.margins: -4
            hoverEnabled: true
            onClicked: selector.swapClicked()
        }
    }

    // hover检测（缩小模式下悬浮展开）
    MouseArea {
        anchors.fill: parent
        hoverEnabled: true
        onEntered: selector.hovered = true
        onExited: selector.hovered = false
        propagateComposedEvents: true
    }

    // 线性动画，无弹簧感
    Behavior on width { NumberAnimation { duration: 180; easing.type: Easing.Linear } }
}

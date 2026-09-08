import QtQuick

Item {
    id: root

    property string text: ""
    property color textColor: DesignTokens.textSecondary
    property int fontSize: DesignTokens.fontSizeSm
    property real speed: 35
    property bool hovered: false
    property string prefix: ""
    property color prefixColor: DesignTokens.accentBlueDim

    clip: true

    Text {
        id: measurer
        visible: false
        text: root.text
        font.pixelSize: root.fontSize
        font.family: "Segoe UI"
    }

    property bool isOverflow: measurer.implicitWidth > root.width - 4
    property real overflowDistance: Math.max(0, measurer.implicitWidth - root.width + 16)
    property real scrollDuration: Math.max(2.5, overflowDistance / speed)

    Row {
        id: contentRow
        anchors.verticalCenter: parent.verticalCenter
        anchors.left: parent.left
        anchors.leftMargin: root.prefix ? 4 : 0
        spacing: 6

        Text {
            text: root.prefix
            color: root.prefixColor
            font.pixelSize: root.fontSize - 1
            font.family: "Consolas"
            visible: root.prefix.length > 0
        }

        Text {
            id: scrollText
            text: root.text
            color: root.textColor
            font.pixelSize: root.fontSize
            font.family: "Segoe UI"
            font.weight: root.textColor === DesignTokens.textPrimary ? Font.DemiBold : Font.Normal
            x: 0

            NumberAnimation on x {
                id: scrollAnim
                running: false
                from: 0
                to: -root.overflowDistance
                duration: root.scrollDuration * 1000 * 0.7
                easing.type: Easing.InOutSine
            }
        }
    }

    // 悬停时启动滚动动画序列
    Timer {
        id: scrollTimer
        interval: 300
        repeat: false
        onTriggered: {
            if (root.hovered && root.isOverflow) {
                scrollAnim.start()
            }
        }
    }

    onHoveredChanged: {
        if (root.hovered && root.isOverflow) {
            scrollTimer.start()
        } else {
            scrollTimer.stop()
            scrollAnim.stop()
            scrollText.x = 0
        }
    }

    MouseArea {
        anchors.fill: parent
        hoverEnabled: true
        onEntered: root.hovered = true
        onExited: root.hovered = false
        z: 3
    }
}

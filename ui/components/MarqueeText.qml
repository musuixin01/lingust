import QtQuick

Item {
    id: root

    property string text: ""
    property color textColor: DesignTokens.textPrimary
    property int fontSize: DesignTokens.fontSizeSm

    clip: true

    Text {
        id: measurer
        visible: false
        text: root.text
        font.pixelSize: root.fontSize
        font.weight: Font.DemiBold
        font.family: "Segoe UI"
    }

    property bool shouldScroll: measurer.implicitWidth > root.width + 4
    property real scrollDuration: Math.max(10, Math.min(36, root.text.length * 0.42))

    // 渐变遮罩
    Item {
        anchors.fill: parent
        visible: root.shouldScroll
        layer.enabled: true
        opacity: 0.0
    }

    Row {
        id: marqueeRow
        anchors.verticalCenter: parent.verticalCenter
        spacing: 0

        // 复制两份文本实现无缝循环
        Repeater {
            model: 2
            delegate: Row {
                spacing: 0
                Text {
                    text: root.text
                    color: root.textColor
                    font.pixelSize: root.fontSize
                    font.weight: Font.DemiBold
                    font.family: "Segoe UI"
                }
                Text {
                    text: "  ✦  "
                    color: "#8034d399"
                    font.pixelSize: root.fontSize - 2
                    font.family: "Segoe UI"
                }
            }
        }

        NumberAnimation on x {
            id: marqueeAnim
            running: root.shouldScroll
            loops: Animation.Infinite
            from: 0
            to: -(marqueeRow.width / 2)
            duration: root.scrollDuration * 1000
            easing.type: Easing.Linear
        }

        MouseArea {
            anchors.fill: parent
            hoverEnabled: true
            onEntered: marqueeAnim.pause()
            onExited: marqueeAnim.resume()
            z: 5
        }
    }
}

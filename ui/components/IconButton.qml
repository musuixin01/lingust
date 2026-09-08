import QtQuick

Rectangle {
    id: btn

    property string iconSource: ""
    property color iconColor: "#99ffffff"
    property color hoverColor: "#ffffff"
    property color hoverBg: "#1affffff"
    property bool active: false
    property color activeColor: "#60a5fa"
    property int iconSize: 14
    property string tooltip: ""

    width: 28
    height: 28
    radius: width / 2
    color: active ? "#263b82f6" : "transparent"
    border.color: active ? "#4d60a5fa" : "transparent"
    border.width: active ? 1 : 0
    scale: mouseArea.pressed ? 0.90 : (mouseArea.containsMouse ? 1.08 : 1.0)

    signal clicked()

    Behavior on scale { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }
    Behavior on color { ColorAnimation { duration: 150; easing.type: Easing.OutCubic } }
    Behavior on border.color { ColorAnimation { duration: 150; easing.type: Easing.OutCubic } }

    Image {
        anchors.centerIn: parent
        source: btn.iconSource
        sourceSize.width: btn.iconSize
        sourceSize.height: btn.iconSize
        opacity: active ? 1.0 : (mouseArea.containsMouse ? 1.0 : 0.75)

        Behavior on opacity { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }
    }

    MouseArea {
        id: mouseArea
        anchors.fill: parent
        hoverEnabled: true
        cursorShape: Qt.PointingHandCursor
        onClicked: btn.clicked()
    }

    states: [
        State {
            name: "hover"
            when: mouseArea.containsMouse && !btn.active
            PropertyChanges { target: btn; color: btn.hoverBg }
        }
    ]
}

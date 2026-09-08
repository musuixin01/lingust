import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Rectangle {
    id: searchBox

    property string text: ""
    property string placeholder: "输入单词句子或截图翻译..."
    property bool multiLine: false
    property bool compact: false
    property bool focused: false
    signal userTextChanged(string newText)
    signal submitted()
    signal screenshotClicked()

    radius: searchBox.compact ? 12 : 16
    color: searchBox.focused ? DesignTokens.bgInputFocus : DesignTokens.bgInput
    border.color: searchBox.focused ? DesignTokens.borderInputFocus : DesignTokens.borderInput
    border.width: 1

    implicitHeight: searchBox.compact ? 28 : 36

    RowLayout {
        anchors.fill: parent
        anchors.leftMargin: searchBox.compact ? 8 : 12
        anchors.rightMargin: 8
        anchors.topMargin: searchBox.compact ? 4 : 6
        anchors.bottomMargin: searchBox.compact ? 4 : 6
        spacing: 6

        Image {
            Layout.alignment: Qt.AlignVCenter
            source: "qrc:/qt/qml/Linguist/resources/icons/search.svg"
            sourceSize.width: searchBox.compact ? 12 : 14
            sourceSize.height: searchBox.compact ? 12 : 14
        }

        TextField {
            Layout.fillWidth: true
            Layout.fillHeight: true
            Layout.alignment: Qt.AlignVCenter
            text: searchBox.text
            placeholderText: searchBox.placeholder
            color: DesignTokens.textSecondary
            selectionColor: "#400070eb"
            font.pixelSize: searchBox.compact ? 12 : 13
            font.family: "Segoe UI"
            background: Rectangle { color: "transparent" }
            verticalAlignment: TextInput.AlignVCenter

            onTextChanged: {
                if (searchBox.text !== text) {
                    searchBox.text = text;
                    searchBox.userTextChanged(text);
                }
            }
            onAccepted: searchBox.submitted()
            onFocusChanged: searchBox.focused = focus
        }

        // 清空按钮
        Rectangle {
            Layout.alignment: Qt.AlignVCenter
            width: 20; height: 20; radius: 10
            color: "transparent"
            visible: searchBox.text.length > 0

            Image {
                anchors.centerIn: parent
                source: "qrc:/qt/qml/Linguist/resources/icons/close.svg"
                sourceSize.width: 10; sourceSize.height: 10
            }

            MouseArea {
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: {
                    searchBox.text = "";
                    searchBox.userTextChanged("");
                    if (typeof appState !== "undefined" && appState) {
                        appState.setSourceText("");
                    }
                }
                onEntered: parent.color = "#1affffff"
                onExited: parent.color = "transparent"
            }
        }

        // 截图按钮
        Rectangle {
            Layout.alignment: Qt.AlignVCenter
            width: 24; height: 24; radius: 12
            color: "transparent"

            Image {
                anchors.centerIn: parent
                source: "qrc:/qt/qml/Linguist/resources/icons/crop.svg"
                sourceSize.width: 14; sourceSize.height: 14
                opacity: 0.8
            }

            MouseArea {
                anchors.fill: parent
                hoverEnabled: true
                cursorShape: Qt.PointingHandCursor
                onClicked: {
                    searchBox.screenshotClicked();
                    if (typeof appState !== "undefined" && appState) {
                        appState.triggerSelectionTranslation();
                    }
                }
                onEntered: parent.color = "#1affffff"
                onExited: parent.color = "transparent"
            }
        }
    }

    Behavior on color { ColorAnimation { duration: 150 } }
    Behavior on border.color { ColorAnimation { duration: 150 } }

    MouseArea {
        anchors.fill: parent
        onPressed: {}
        z: -1
    }
}

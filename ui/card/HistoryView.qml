import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Linguist

Rectangle {
    id: historyView

    property string searchQuery: ""
    property string currentFilter: "all" // "all" | "favorites"

    signal closeRequested()

    radius: DesignTokens.radiusCard
    color: DesignTokens.bgCardBase
    border.color: DesignTokens.borderNormal
    border.width: 1
    clip: true

    // 毛玻璃磨砂层
    Rectangle {
        anchors.fill: parent
        radius: parent.radius
        color: DesignTokens.bgCard
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 14
        spacing: 10

        // === 标题栏 ===
        RowLayout {
            Layout.fillWidth: true
            spacing: 8

            Image {
                source: "qrc:/qt/qml/Linguist/resources/icons/history.svg"
                sourceSize.width: 16; sourceSize.height: 16
                Layout.alignment: Qt.AlignVCenter
            }

            Text {
                text: "翻译历史与生词本"
                color: DesignTokens.textPrimary
                font.pixelSize: 14
                font.bold: true
                font.family: "Segoe UI"
                Layout.alignment: Qt.AlignVCenter
            }

            Item { Layout.fillWidth: true }

            Rectangle {
                width: 26; height: 26; radius: 13
                color: "#1affffff"

                Image {
                    anchors.centerIn: parent
                    source: "qrc:/qt/qml/Linguist/resources/icons/close.svg"
                    sourceSize.width: 10; sourceSize.height: 10
                }

                MouseArea {
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onEntered: parent.color = "#33ffffff"
                    onExited: parent.color = "#1affffff"
                    onClicked: historyView.closeRequested()
                }
            }
        }

        // === 搜索输入框 ===
        Rectangle {
            Layout.fillWidth: true
            height: 32
            radius: 10
            color: "#0dffffff"
            border.color: searchField.activeFocus ? DesignTokens.borderInputFocus : DesignTokens.borderInput
            border.width: 1

            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 8
                anchors.rightMargin: 8
                spacing: 6

                Image {
                    source: "qrc:/qt/qml/Linguist/resources/icons/search.svg"
                    sourceSize.width: 12; sourceSize.height: 12
                    opacity: 0.6
                }

                TextField {
                    id: searchField
                    Layout.fillWidth: true
                    placeholderText: "搜索历史词汇与短语..."
                    color: DesignTokens.textSecondary
                    font.pixelSize: 12
                    font.family: "Segoe UI"
                    background: Rectangle { color: "transparent" }
                    onTextChanged: historyView.searchQuery = text.toLowerCase()
                }

                Rectangle {
                    width: 16; height: 16; radius: 8
                    color: "transparent"
                    visible: searchField.text.length > 0

                    Image {
                        anchors.centerIn: parent
                        source: "qrc:/qt/qml/Linguist/resources/icons/close.svg"
                        sourceSize.width: 8; sourceSize.height: 8
                    }

                    MouseArea {
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: { searchField.text = ""; historyView.searchQuery = ""; }
                    }
                }
            }
        }

        // === 筛选标签栏 (全部 / 生词本) ===
        RowLayout {
            Layout.fillWidth: true
            spacing: 6

            Rectangle {
                Layout.fillWidth: true
                height: 28
                radius: 8
                color: historyView.currentFilter === "all" ? "#333b82f6" : "#0dffffff"
                border.color: historyView.currentFilter === "all" ? "#60a5fa" : DesignTokens.borderSubtle
                border.width: 1

                Row {
                    anchors.centerIn: parent
                    spacing: 4
                    Text {
                        text: "全部 (" + (appState ? appState.history.length : 0) + ")"
                        color: historyView.currentFilter === "all" ? "#ffffff" : DesignTokens.textTertiary
                        font.pixelSize: 11
                        font.bold: historyView.currentFilter === "all"
                    }
                }

                MouseArea {
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: historyView.currentFilter = "all"
                }
            }

            Rectangle {
                Layout.fillWidth: true
                height: 28
                radius: 8
                color: historyView.currentFilter === "favorites" ? "#33f59e0b" : "#0dffffff"
                border.color: historyView.currentFilter === "favorites" ? "#fbbf24" : DesignTokens.borderSubtle
                border.width: 1

                Row {
                    anchors.centerIn: parent
                    spacing: 4
                    Image {
                        source: "qrc:/qt/qml/Linguist/resources/icons/heart.svg"
                        sourceSize.width: 10; sourceSize.height: 10
                        anchors.verticalCenter: parent.verticalCenter
                    }
                    Text {
                        text: "生词本 (" + (appState ? appState.favorites.length : 0) + ")"
                        color: historyView.currentFilter === "favorites" ? "#ffffff" : DesignTokens.textTertiary
                        font.pixelSize: 11
                        font.bold: historyView.currentFilter === "favorites"
                        anchors.verticalCenter: parent.verticalCenter
                    }
                }

                MouseArea {
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: historyView.currentFilter = "favorites"
                }
            }
        }

        Rectangle { Layout.fillWidth: true; height: 1; color: DesignTokens.borderSubtle }

        // === 列表视图 ===
        ScrollView {
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            ScrollBar.vertical.policy: ScrollBar.AsNeeded

            ListView {
                id: listView
                width: parent.width
                spacing: 6

                model: {
                    var sourceList = (historyView.currentFilter === "favorites")
                        ? (appState ? appState.favorites : [])
                        : (appState ? appState.history : []);

                    if (!historyView.searchQuery) return sourceList;

                    var q = historyView.searchQuery;
                    var filtered = [];
                    for (var i = 0; i < sourceList.length; i++) {
                        var item = sourceList[i];
                        var src = (item.sourceText || "").toLowerCase();
                        var dst = (item.translatedText || "").toLowerCase();
                        if (src.indexOf(q) !== -1 || dst.indexOf(q) !== -1) {
                            filtered.push(item);
                        }
                    }
                    return filtered;
                }

                delegate: Rectangle {
                    width: listView.width - 4
                    height: itemCol.implicitHeight + 14
                    radius: 10
                    color: itemMouse.containsMouse ? "#1affffff" : "#08ffffff"
                    border.color: itemMouse.containsMouse ? "#33ffffff" : DesignTokens.borderSubtle
                    border.width: 1

                    Behavior on color { ColorAnimation { duration: 100 } }

                    ColumnLayout {
                        id: itemCol
                        anchors.fill: parent
                        anchors.margins: 8
                        spacing: 4

                        // 顶部行：源词 + 语言方向 + 操作
                        RowLayout {
                            Layout.fillWidth: true
                            spacing: 6

                            Text {
                                text: modelData.sourceText || ""
                                color: DesignTokens.textPrimary
                                font.bold: true
                                font.pixelSize: 12
                                font.family: "Segoe UI"
                                elide: Text.ElideRight
                                Layout.fillWidth: true
                            }

                            // 语言标签
                            Rectangle {
                                radius: 4
                                color: "#143b82f6"
                                implicitWidth: langLabel.implicitWidth + 8
                                height: 16
                                Text {
                                    id: langLabel
                                    anchors.centerIn: parent
                                    text: ((modelData.sourceLang || "en") + " → " + (modelData.targetLang || "zh")).toUpperCase()
                                    color: "#93c5fd"
                                    font.pixelSize: 8
                                    font.bold: true
                                }
                            }

                            // 单词发音
                            Rectangle {
                                width: 18; height: 18; radius: 9
                                color: speakItemMouse.containsMouse ? "#26ffffff" : "transparent"

                                Image {
                                    anchors.centerIn: parent
                                    source: "qrc:/qt/qml/Linguist/resources/icons/volume.svg"
                                    sourceSize.width: 10; sourceSize.height: 10
                                    opacity: speakItemMouse.containsMouse ? 1.0 : 0.6
                                }

                                MouseArea {
                                    id: speakItemMouse
                                    anchors.fill: parent
                                    hoverEnabled: true
                                    cursorShape: Qt.PointingHandCursor
                                    onClicked: {
                                        if (appState && modelData.sourceText) {
                                            appState.speak(modelData.sourceText, modelData.sourceLang || "en");
                                        }
                                    }
                                }
                            }

                            // 删除单项
                            Rectangle {
                                width: 18; height: 18; radius: 9
                                color: "transparent"
                                visible: itemMouse.containsMouse && historyView.currentFilter === "all"

                                Image {
                                    anchors.centerIn: parent
                                    source: "qrc:/qt/qml/Linguist/resources/icons/close.svg"
                                    sourceSize.width: 8; sourceSize.height: 8
                                }

                                MouseArea {
                                    anchors.fill: parent
                                    hoverEnabled: true
                                    cursorShape: Qt.PointingHandCursor
                                    onClicked: {
                                        if (appState && modelData.id !== undefined) {
                                            appState.deleteHistory(modelData.id);
                                        }
                                    }
                                }
                            }
                        }

                        // 译文
                        Text {
                            Layout.fillWidth: true
                            text: modelData.translatedText || ""
                            color: "#93c5fd"
                            font.pixelSize: 11
                            font.family: "Segoe UI"
                            wrapMode: Text.Wrap
                            elide: Text.ElideRight
                            maximumLineCount: 2
                        }
                    }

                    MouseArea {
                        id: itemMouse
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: {
                            if (appState && modelData.sourceText) {
                                appState.setSourceText(modelData.sourceText);
                                appState.translate();
                                historyView.closeRequested();
                            }
                        }
                    }
                }

                // 空状态占位
                Item {
                    anchors.centerIn: parent
                    visible: listView.count === 0
                    width: parent.width
                    height: 120

                    ColumnLayout {
                        anchors.centerIn: parent
                        spacing: 8

                        Image {
                            Layout.alignment: Qt.AlignHCenter
                            source: "qrc:/qt/qml/Linguist/resources/icons/history.svg"
                            sourceSize.width: 24; sourceSize.height: 24
                            opacity: 0.3
                        }

                        Text {
                            Layout.alignment: Qt.AlignHCenter
                            text: historyView.searchQuery ? "无匹配的历史记录" : "暂无历史翻译记录"
                            color: DesignTokens.textPlaceholder
                            font.pixelSize: 12
                        }
                    }
                }
            }
        }

        // === 底部工具栏 ===
        Rectangle { Layout.fillWidth: true; height: 1; color: DesignTokens.borderSubtle }

        RowLayout {
            Layout.fillWidth: true
            spacing: 8

            Rectangle {
                Layout.fillWidth: true
                height: 26
                radius: 8
                color: "#0dffffff"
                border.color: DesignTokens.borderSubtle
                border.width: 1

                Text {
                    anchors.centerIn: parent
                    text: "清空历史记录"
                    color: "#f87171"
                    font.pixelSize: 11
                }

                MouseArea {
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onEntered: parent.color = "#1af87171"
                    onExited: parent.color = "#0dffffff"
                    onClicked: {
                        if (appState) {
                            appState.clearHistory();
                        }
                    }
                }
            }
        }
    }
}

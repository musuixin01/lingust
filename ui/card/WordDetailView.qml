import QtQuick
import QtQuick.Layouts

ColumnLayout {
    id: wordDetail

    property string word: "Efficient"
    property string phonetic: ""
    property string translatedText: "高效的；有能力的"
    property string englishDefinition: ""
    property var definitions: []
    property var examples: []
    property var synonyms: []
    property var antonyms: []
    property var wordForms: []
    property var tags: []
    property bool compact: false
    property bool veryCompact: false
    property bool ultraCompact: false

    spacing: wordDetail.ultraCompact ? 6 : (wordDetail.veryCompact ? 8 : (wordDetail.compact ? 10 : 12))

    // === 单词标题 + 音标 + 发音按钮行 (对齐 Web 端) ===
    RowLayout {
        Layout.fillWidth: true
        spacing: 8

        // 单词 + 音标
        RowLayout {
            Layout.fillWidth: true
            spacing: 8

            Text {
                text: wordDetail.word
                color: DesignTokens.textPrimary
                font.bold: true
                font.pixelSize: Math.round((wordDetail.ultraCompact ? 15 : (wordDetail.compact ? 17 : 20)) * DesignTokens.fontScale)
                font.family: "Segoe UI"
                elide: Text.ElideRight
                visible: wordDetail.word.length > 0
            }

            Text {
                Layout.fillWidth: true
                text: wordDetail.phonetic.length > 0 ? (wordDetail.phonetic.startsWith("/") ? wordDetail.phonetic : "/" + wordDetail.phonetic + "/") : ""
                color: "#93c5fd"
                font.pixelSize: Math.round((wordDetail.ultraCompact ? 10 : (wordDetail.compact ? 11 : 12)) * DesignTokens.fontScale)
                font.family: "Consolas"
                verticalAlignment: Text.AlignVCenter
                visible: wordDetail.phonetic.length > 0
            }
        }

        // 发音按钮 (美 / 英)
        Row {
            Layout.alignment: Qt.AlignVCenter
            spacing: 4

            Repeater {
                model: [
                    { label: "美", accent: "#60a5fa", langAccent: "us" },
                    { label: "英", accent: "#34d399", langAccent: "uk" }
                ]

                delegate: Rectangle {
                    width: 38; height: 22; radius: 6
                    color: "#14ffffff"
                    border.color: DesignTokens.borderSubtle
                    border.width: 1

                    Row {
                        anchors.centerIn: parent
                        spacing: 3
                        Image {
                            source: "qrc:/qt/qml/Linguist/resources/icons/volume.svg"
                            sourceSize.width: 10; sourceSize.height: 10
                            anchors.verticalCenter: parent.verticalCenter
                        }
                        Text {
                            text: modelData.label
                            color: modelData.accent
                            font.pixelSize: 10
                            font.weight: Font.SemiBold
                            anchors.verticalCenter: parent.verticalCenter
                        }
                    }

                    MouseArea {
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onEntered: parent.color = "#26ffffff"
                        onExited: parent.color = "#14ffffff"
                        onClicked: {
                            if (typeof appState !== "undefined" && appState) {
                                appState.speak(wordDetail.word, "en", modelData.langAccent);
                            }
                        }
                    }
                    Behavior on color { ColorAnimation { duration: 150 } }
                }
            }
        }
    }

    // === 考试标签行 ===
    Flow {
        Layout.fillWidth: true
        visible: wordDetail.tags.length > 0
        spacing: 4
        Repeater {
            model: wordDetail.tags
            delegate: Rectangle {
                radius: 4
                color: "#1a3b82f6"
                implicitWidth: tagText.implicitWidth + 8
                height: 16
                Text {
                    id: tagText
                    anchors.centerIn: parent
                    text: modelData
                    color: "#93c5fd"
                    font.pixelSize: 9
                    font.weight: Font.Medium
                }
            }
        }
    }

    // 英文释义
    Text {
        Layout.fillWidth: true
        text: wordDetail.englishDefinition
        color: "#80ffffff"
        font.pixelSize: wordDetail.compact ? 11 : 12
        font.family: "Georgia"
        font.italic: true
        wrapMode: Text.Wrap
        visible: wordDetail.englishDefinition.length > 0
    }

    // 分隔线
    Rectangle { Layout.fillWidth: true; height: 1; color: DesignTokens.borderSubtle }

    // === 主释义卡片 ===
    Rectangle {
        Layout.fillWidth: true
        radius: 12
        color: "#0dffffff"
        border.color: DesignTokens.borderSubtle
        border.width: 1
        implicitHeight: defColumn.implicitHeight + (wordDetail.compact ? 14 : 18)

        ColumnLayout {
            id: defColumn
            anchors.fill: parent
            anchors.margins: wordDetail.compact ? 8 : 10
            spacing: 6

            // 第一释义（只显示一个）
            RowLayout {
                Layout.fillWidth: true
                spacing: 8

                Rectangle {
                    radius: 6
                    color: "#263b82f6"
                    border.color: "#403b82f6"
                    border.width: 1
                    implicitWidth: posText.implicitWidth + 14
                    height: 20

                    Text {
                        id: posText
                        anchors.centerIn: parent
                        text: wordDetail.definitions.length > 0 && wordDetail.definitions[0].partOfSpeech.length > 0
                              ? wordDetail.definitions[0].partOfSpeech : "adj."
                        color: "#93c5fd"
                        font.pixelSize: 10
                        font.weight: Font.SemiBold
                    }
                }

                Text {
                    Layout.fillWidth: true
                    text: wordDetail.definitions.length > 0 ? wordDetail.definitions[0].meaning : wordDetail.translatedText
                    color: "#f2ffffff"
                    font.pixelSize: Math.round((wordDetail.ultraCompact ? 12 : (wordDetail.compact ? 14 : 15)) * DesignTokens.fontScale)
                    font.weight: Font.SemiBold
                    font.family: "Segoe UI"
                    wrapMode: Text.Wrap
                }
            }

            // 补充释义（对齐 Web 端 definitions.slice(1)）
            ColumnLayout {
                Layout.fillWidth: true
                spacing: 4
                visible: wordDetail.definitions && wordDetail.definitions.length > 1

                Rectangle {
                    Layout.fillWidth: true
                    height: 1
                    color: "#14ffffff"
                    Layout.topMargin: 2
                    Layout.bottomMargin: 2
                }

                Repeater {
                    model: wordDetail.definitions && wordDetail.definitions.length > 1 ? wordDetail.definitions.slice(1) : []
                    delegate: RowLayout {
                        Layout.fillWidth: true
                        spacing: 6

                        Text {
                            text: modelData.partOfSpeech ? modelData.partOfSpeech : ""
                            color: "#60a5fa"
                            font.pixelSize: 10
                            font.family: "Consolas"
                            font.bold: true
                            visible: text.length > 0
                        }

                        Text {
                            Layout.fillWidth: true
                            text: modelData.meaning ? modelData.meaning : ""
                            color: "#ccffffff"
                            font.pixelSize: Math.round((wordDetail.ultraCompact ? 11 : 12) * DesignTokens.fontScale)
                            font.family: "Segoe UI"
                            wrapMode: Text.Wrap
                        }
                    }
                }
            }
        }
    }

    // === 词形变化 ===
    ColumnLayout {
        Layout.fillWidth: true
        spacing: 4
        visible: wordDetail.wordForms.length > 0

        Text {
            text: "词形变化"
            color: DesignTokens.textPlaceholder
            font.pixelSize: 9
            font.weight: Font.SemiBold
            font.letterSpacing: 1
            font.capitalization: Font.AllUppercase
        }

        Flow {
            Layout.fillWidth: true
            spacing: 6

            Repeater {
                model: wordDetail.wordForms
                delegate: Rectangle {
                    radius: 6
                    color: "#08ffffff"
                    border.color: DesignTokens.borderSubtle
                    border.width: 1
                    implicitWidth: formRow.implicitWidth + 12
                    height: 22

                    Row {
                        id: formRow
                        anchors.centerIn: parent
                        spacing: 4
                        Text {
                            text: modelData.name + ":"
                            color: "#80ffffff"
                            font.pixelSize: 9
                            font.weight: Font.Medium
                            anchors.verticalCenter: parent.verticalCenter
                        }
                        Text {
                            text: modelData.value
                            color: "#e6ffffff"
                            font.pixelSize: 10
                            font.weight: Font.Medium
                            anchors.verticalCenter: parent.verticalCenter
                        }
                    }
                }
            }
        }
    }

    // === 双语例句 ===
    ColumnLayout {
        Layout.fillWidth: true
        spacing: 4
        visible: wordDetail.examples.length > 0

        Text {
            text: "双语例句"
            color: DesignTokens.textPlaceholder
            font.pixelSize: 9
            font.weight: Font.SemiBold
            font.letterSpacing: 1
            font.capitalization: Font.AllUppercase
        }

        Repeater {
            model: wordDetail.examples.slice(0, 2)
            delegate: Rectangle {
                id: egCard
                Layout.fillWidth: true
                radius: 8
                color: egMouse.containsMouse ? "#14ffffff" : "#08ffffff"
                border.color: egMouse.containsMouse ? "#33ffffff" : DesignTokens.borderSubtle
                border.width: 1
                implicitHeight: exampleRow.implicitHeight + 14

                Behavior on color { ColorAnimation { duration: 150 } }

                RowLayout {
                    id: exampleRow
                    anchors.fill: parent
                    anchors.margins: 8
                    spacing: 8

                    ColumnLayout {
                        id: exampleColumn
                        Layout.fillWidth: true
                        spacing: 2

                        Text {
                            Layout.fillWidth: true
                            text: modelData.src
                            color: "#e6ffffff"
                            font.pixelSize: 11
                            font.family: "Georgia"
                            wrapMode: Text.Wrap
                        }
                        Text {
                            Layout.fillWidth: true
                            text: modelData.dst
                            color: "#80ffffff"
                            font.pixelSize: 10
                            font.family: "Segoe UI"
                            wrapMode: Text.Wrap
                        }
                    }

                    Image {
                        source: "qrc:/qt/qml/Linguist/resources/icons/volume.svg"
                        sourceSize.width: 12; sourceSize.height: 12
                        opacity: egMouse.containsMouse ? 0.9 : 0.3
                        Behavior on opacity { NumberAnimation { duration: 150 } }
                    }
                }

                MouseArea {
                    id: egMouse
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        if (typeof appState !== "undefined" && appState && modelData.src) {
                            appState.speak(modelData.src, "en");
                        }
                    }
                }
            }
        }
    }

    // === 同义词 ===
    ColumnLayout {
        Layout.fillWidth: true
        spacing: 4
        visible: wordDetail.synonyms.length > 0

        Text {
            text: "同义词"
            color: DesignTokens.textPlaceholder
            font.pixelSize: 9
            font.weight: Font.SemiBold
            font.letterSpacing: 1
            font.capitalization: Font.AllUppercase
        }

        Flow {
            Layout.fillWidth: true
            spacing: 4

            Repeater {
                model: wordDetail.synonyms
                delegate: Rectangle {
                    radius: 6
                    color: "#0dffffff"
                    border.color: DesignTokens.borderSubtle
                    border.width: 1
                    implicitWidth: synText.implicitWidth + 12
                    height: 20

                    Text {
                        id: synText
                        anchors.centerIn: parent
                        text: modelData
                        color: "#ccffffff"
                        font.pixelSize: 10
                    }

                    MouseArea {
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onEntered: parent.color = "#26ffffff"
                        onExited: parent.color = "#0dffffff"
                        onClicked: {
                            if (typeof appState !== "undefined" && appState) {
                                appState.setSourceText(modelData);
                                appState.translate();
                            }
                        }
                    }
                    Behavior on color { ColorAnimation { duration: 150 } }
                }
            }
        }
    }

    // === 反义词 ===
    ColumnLayout {
        Layout.fillWidth: true
        spacing: 4
        visible: wordDetail.antonyms.length > 0

        Text {
            text: "反义词"
            color: DesignTokens.textPlaceholder
            font.pixelSize: 9
            font.weight: Font.SemiBold
            font.letterSpacing: 1
            font.capitalization: Font.AllUppercase
        }

        Flow {
            Layout.fillWidth: true
            spacing: 4

            Repeater {
                model: wordDetail.antonyms
                delegate: Rectangle {
                    radius: 6
                    color: "#0dffffff"
                    border.color: DesignTokens.borderSubtle
                    border.width: 1
                    implicitWidth: antText.implicitWidth + 12
                    height: 20

                    Text {
                        id: antText
                        anchors.centerIn: parent
                        text: modelData
                        color: "#f87171"
                        font.pixelSize: 10
                    }

                    MouseArea {
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onEntered: parent.color = "#26ffffff"
                        onExited: parent.color = "#0dffffff"
                        onClicked: {
                            if (typeof appState !== "undefined" && appState) {
                                appState.setSourceText(modelData);
                                appState.translate();
                            }
                        }
                    }
                    Behavior on color { ColorAnimation { duration: 150 } }
                }
            }
        }
    }
}

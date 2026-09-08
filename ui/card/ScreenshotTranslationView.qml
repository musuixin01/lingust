import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Linguist

Item {
    id: screenshotView

    signal retakeRequested()
    signal backToTextRequested()

    property bool showImagePreview: false
    property int copiedLineIndex: -1
    property bool copiedAll: false

    // 默认或从 appState 获取 OCR 数据
    property var lines: (typeof appState !== "undefined" && appState && appState.ocrLines && appState.ocrLines.length > 0)
                        ? appState.ocrLines
                        : [
                            {
                                src: "Accelerate your AI workflows with streamlined inference and local caching.",
                                dst: "通过流线型推理和本地缓存加速您的 AI 工作流。"
                            },
                            {
                                src: "Zero latency desktop floating card provides instantaneous phonetic lookup.",
                                dst: "零延迟桌面悬浮卡片提供即时音标释义查询。"
                            },
                            {
                                src: "Supports multi-engine switching with offline fallback capabilities.",
                                dst: "支持多翻译引擎动态切换与完全脱机回退容灾。"
                            }
                        ]

    ColumnLayout {
        anchors.fill: parent
        spacing: 10

        // ===== 顶部控制 Banner =====
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 46
            radius: 12
            color: "#14ffffff"
            border.color: DesignTokens.borderNormal
            border.width: 1

            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 10
                anchors.rightMargin: 10
                spacing: 8

                Rectangle {
                    width: 26; height: 26; radius: 8
                    color: "#263b82f6"
                    Image {
                        anchors.centerIn: parent
                        source: "qrc:/qt/qml/Linguist/resources/icons/crop.svg"
                        sourceSize.width: 14; sourceSize.height: 14
                    }
                }

                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 2

                    RowLayout {
                        spacing: 6
                        Text {
                            text: "截图翻译"
                            color: DesignTokens.textPrimary
                            font.pixelSize: 12
                            font.bold: true
                        }
                        Rectangle {
                            height: 16
                            radius: 8
                            color: "#333b82f6"
                            border.color: "#4d60a5fa"
                            border.width: 1
                            implicitWidth: badgeText.implicitWidth + 10

                            Text {
                                id: badgeText
                                anchors.centerIn: parent
                                text: "逐行中英对照"
                                color: "#93c5fd"
                                font.pixelSize: 9
                                font.bold: true
                            }
                        }
                    }

                    Text {
                        text: "共识别 " + screenshotView.lines.length + " 行文本 · " + (typeof appState !== "undefined" && appState ? appState.sourceLang.toUpperCase() : "EN") + " ➔ " + (typeof appState !== "undefined" && appState ? appState.targetLang.toUpperCase() : "ZH")
                        color: DesignTokens.textTertiary
                        font.pixelSize: 10
                    }
                }

                // 操作按钮组
                RowLayout {
                    spacing: 4

                    Rectangle {
                        width: 28; height: 24; radius: 6
                        color: screenshotView.showImagePreview ? "#333b82f6" : "#14ffffff"
                        border.color: screenshotView.showImagePreview ? "#60a5fa" : DesignTokens.borderSubtle
                        border.width: 1

                        Image {
                            anchors.centerIn: parent
                            source: screenshotView.showImagePreview ? "qrc:/qt/qml/Linguist/resources/icons/eye-off.svg" : "qrc:/qt/qml/Linguist/resources/icons/eye.svg"
                            sourceSize.width: 13; sourceSize.height: 13
                        }

                        MouseArea {
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: screenshotView.showImagePreview = !screenshotView.showImagePreview
                        }
                    }

                    Rectangle {
                        width: 28; height: 24; radius: 6
                        color: "#14ffffff"
                        border.color: DesignTokens.borderSubtle
                        border.width: 1

                        Image {
                            anchors.centerIn: parent
                            source: "qrc:/qt/qml/Linguist/resources/icons/rotate-ccw.svg"
                            sourceSize.width: 12; sourceSize.height: 12
                        }

                        MouseArea {
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: screenshotView.retakeRequested()
                        }
                    }

                    Rectangle {
                        width: 28; height: 24; radius: 6
                        color: "#14ffffff"
                        border.color: DesignTokens.borderSubtle
                        border.width: 1

                        Image {
                            anchors.centerIn: parent
                            source: "qrc:/qt/qml/Linguist/resources/icons/close.svg"
                            sourceSize.width: 10; sourceSize.height: 10
                        }

                        MouseArea {
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: screenshotView.backToTextRequested()
                        }
                    }
                }
            }
        }

        // ===== 可选的原截图缩略图 =====
        Rectangle {
            Layout.fillWidth: true
            Layout.preferredHeight: 90
            radius: 10
            color: "#1a000000"
            border.color: DesignTokens.borderSubtle
            border.width: 1
            visible: screenshotView.showImagePreview
            clip: true

            Image {
                anchors.centerIn: parent
                fillMode: Image.PreserveAspectFit
                source: (typeof appState !== "undefined" && appState && appState.ocrImagePreview) ? appState.ocrImagePreview : "qrc:/qt/qml/Linguist/resources/icons/crop.svg"
                width: parent.width - 16
                height: parent.height - 16
            }
        }

        // ===== 逐行对照列表区 =====
        Flickable {
            id: lineScroll
            Layout.fillWidth: true
            Layout.fillHeight: true
            contentWidth: width
            contentHeight: lineCol.implicitHeight
            clip: true
            boundsBehavior: Flickable.StopAtBounds

            ColumnLayout {
                id: lineCol
                width: lineScroll.width
                spacing: 8

                Repeater {
                    model: screenshotView.lines

                    delegate: Rectangle {
                        id: lineCard
                        Layout.fillWidth: true
                        radius: 12
                        color: lineMouse.containsMouse ? "#1affffff" : "#0dffffff"
                        border.color: lineMouse.containsMouse ? "#33ffffff" : DesignTokens.borderSubtle
                        border.width: 1
                        implicitHeight: lineCardCol.implicitHeight + 16

                        Behavior on color { ColorAnimation { duration: 150 } }
                        Behavior on border.color { ColorAnimation { duration: 150 } }

                        MouseArea {
                            id: lineMouse
                            anchors.fill: parent
                            hoverEnabled: true
                        }

                        ColumnLayout {
                            id: lineCardCol
                            anchors.fill: parent
                            anchors.margins: 10
                            spacing: 6

                            // 上方：原文
                            RowLayout {
                                Layout.fillWidth: true
                                spacing: 6

                                Rectangle {
                                    width: 6; height: 6; radius: 3
                                    color: "#60a5fa"
                                }

                                Text {
                                    text: "原文 (" + (index + 1) + ")"
                                    color: DesignTokens.textTertiary
                                    font.pixelSize: 10
                                    font.bold: true
                                }

                                Item { Layout.fillWidth: true }

                                // 朗读
                                Rectangle {
                                    width: 20; height: 20; radius: 4
                                    color: "transparent"
                                    opacity: lineMouse.containsMouse ? 1.0 : 0.4

                                    Image {
                                        anchors.centerIn: parent
                                        source: "qrc:/qt/qml/Linguist/resources/icons/volume.svg"
                                        sourceSize.width: 12; sourceSize.height: 12
                                    }

                                    MouseArea {
                                        anchors.fill: parent
                                        hoverEnabled: true
                                        cursorShape: Qt.PointingHandCursor
                                        onClicked: {
                                            if (typeof appState !== "undefined" && appState) {
                                                appState.speak(modelData.src, appState.sourceLang);
                                            }
                                        }
                                    }
                                }

                                // 复制
                                Rectangle {
                                    width: 20; height: 20; radius: 4
                                    color: "transparent"
                                    opacity: lineMouse.containsMouse ? 1.0 : 0.4

                                    Image {
                                        anchors.centerIn: parent
                                        source: screenshotView.copiedLineIndex === index ? "qrc:/qt/qml/Linguist/resources/icons/check.svg" : "qrc:/qt/qml/Linguist/resources/icons/copy.svg"
                                        sourceSize.width: 12; sourceSize.height: 12
                                    }

                                    MouseArea {
                                        anchors.fill: parent
                                        hoverEnabled: true
                                        cursorShape: Qt.PointingHandCursor
                                        onClicked: {
                                            if (typeof appState !== "undefined" && appState) {
                                                appState.setSourceText(modelData.src);
                                                appState.copySourceText();
                                            }
                                            screenshotView.copiedLineIndex = index;
                                            lineCopyTimer.start();
                                        }
                                    }
                                }
                            }

                            Text {
                                Layout.fillWidth: true
                                text: modelData.src
                                color: DesignTokens.textPrimary
                                font.pixelSize: 12
                                wrapMode: Text.Wrap
                                font.family: "Segoe UI"
                            }

                            Rectangle { Layout.fillWidth: true; height: 1; color: DesignTokens.borderSubtle }

                            // 下方：译文
                            RowLayout {
                                Layout.fillWidth: true
                                spacing: 6

                                Rectangle {
                                    width: 6; height: 6; radius: 3
                                    color: "#34d399"
                                }

                                Text {
                                    text: "译文"
                                    color: "#34d399"
                                    font.pixelSize: 10
                                    font.bold: true
                                }

                                Item { Layout.fillWidth: true }

                                // 朗读
                                Rectangle {
                                    width: 20; height: 20; radius: 4
                                    color: "transparent"
                                    opacity: lineMouse.containsMouse ? 1.0 : 0.4

                                    Image {
                                        anchors.centerIn: parent
                                        source: "qrc:/qt/qml/Linguist/resources/icons/volume.svg"
                                        sourceSize.width: 12; sourceSize.height: 12
                                    }

                                    MouseArea {
                                        anchors.fill: parent
                                        hoverEnabled: true
                                        cursorShape: Qt.PointingHandCursor
                                        onClicked: {
                                            if (typeof appState !== "undefined" && appState) {
                                                appState.speak(modelData.dst, appState.targetLang);
                                            }
                                        }
                                    }
                                }
                            }

                            Text {
                                Layout.fillWidth: true
                                text: modelData.dst
                                color: "#6ee7b7"
                                font.pixelSize: 12
                                font.weight: Font.Medium
                                wrapMode: Text.Wrap
                                font.family: "Segoe UI"
                            }
                        }
                    }
                }
            }
        }

        // ===== 底部操作栏 =====
        RowLayout {
            Layout.fillWidth: true
            Layout.preferredHeight: 32
            spacing: 8

            // 复制全部对照
            Rectangle {
                Layout.fillWidth: true
                Layout.preferredHeight: 30
                radius: 8
                color: screenshotView.copiedAll ? "#2610b981" : "#14ffffff"
                border.color: screenshotView.copiedAll ? "#34d399" : DesignTokens.borderNormal
                border.width: 1

                RowLayout {
                    anchors.centerIn: parent
                    spacing: 6

                    Image {
                        source: screenshotView.copiedAll ? "qrc:/qt/qml/Linguist/resources/icons/check.svg" : "qrc:/qt/qml/Linguist/resources/icons/copy.svg"
                        sourceSize.width: 12; sourceSize.height: 12
                    }

                    Text {
                        text: screenshotView.copiedAll ? "已复制全部对照" : "复制全部对照"
                        color: screenshotView.copiedAll ? "#34d399" : DesignTokens.textPrimary
                        font.pixelSize: 11
                        font.bold: true
                    }
                }

                MouseArea {
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        var fullText = "";
                        for (var i = 0; i < screenshotView.lines.length; i++) {
                            fullText += "[" + (i + 1) + "] 原文: " + screenshotView.lines[i].src + "\n    译文: " + screenshotView.lines[i].dst + "\n\n";
                        }
                        if (typeof appState !== "undefined" && appState) {
                            appState.setSourceText(fullText.trim());
                            appState.copySourceText();
                        }
                        screenshotView.copiedAll = true;
                        allCopyTimer.start();
                    }
                }
            }

            // 返回文本
            Rectangle {
                Layout.preferredWidth: 84
                Layout.preferredHeight: 30
                radius: 8
                color: "#1affffff"
                border.color: DesignTokens.borderNormal
                border.width: 1

                Text {
                    anchors.centerIn: parent
                    text: "返回文本"
                    color: DesignTokens.textSecondary
                    font.pixelSize: 11
                }

                MouseArea {
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: screenshotView.backToTextRequested()
                    onEntered: parent.color = "#33ffffff"
                    onExited: parent.color = "#1affffff"
                }
            }
        }
    }

    Timer {
        id: lineCopyTimer
        interval: 1500
        onTriggered: screenshotView.copiedLineIndex = -1
    }

    Timer {
        id: allCopyTimer
        interval: 1800
        onTriggered: screenshotView.copiedAll = false
    }
}

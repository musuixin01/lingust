import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: pill

    property bool isDragging: false
    property bool leftHovered: false
    property bool rightHovered: false
    property bool searchFocused: false
    property bool musicCardExpanded: false

    signal expandRequested()

    readonly property bool isMusicMode: typeof appState !== "undefined" && appState && appState.pillMusicMode
    property bool leftVisible: width >= 280 || leftHovered
    property bool rightVisible: width >= 360 || rightHovered

    // === 灵动岛音乐展开卡片浮层 ===
    MusicIslandCard {
        id: islandCard
        anchors.bottom: parent.top
        anchors.bottomMargin: 10
        anchors.horizontalCenter: parent.horizontalCenter
        visible: musicCardExpanded
        appState: typeof appState !== "undefined" ? appState : null
        onCloseRequested: musicCardExpanded = false
        onSwitchTranslationRequested: {
            musicCardExpanded = false
            if (typeof appState !== "undefined" && appState) {
                appState.setPillMusicMode(false)
            }
        }
        z: 999
    }

    // === 毛玻璃背景 ===
    GlassSurface {
        anchors.fill: parent
        isPill: true
        isDragging: pill.isDragging
    }

    // === 模式 1：灵动岛音乐模式 ===
    RowLayout {
        id: musicRow
        anchors.fill: parent
        anchors.leftMargin: 8
        anchors.rightMargin: 8
        spacing: 8
        visible: isMusicMode

        // 旋转唱片微缩图
        Item {
            Layout.preferredWidth: 28
            Layout.preferredHeight: 28
            Layout.alignment: Qt.AlignVCenter

            Rectangle {
                anchors.fill: parent
                radius: 14
                color: "#0f172a"
                border.width: 1
                border.color: Qt.rgba(0.06, 0.78, 0.55, 0.5)

                Image {
                    id: pillDisc
                    anchors.fill: parent
                    anchors.margins: 2
                    source: "qrc:/qt/qml/Linguist/resources/icons/disc.svg"

                    RotationAnimator {
                        target: pillDisc
                        from: 0
                        to: 360
                        duration: 6000
                        loops: Animation.Infinite
                        running: appState ? appState.musicPlaying : false
                    }
                }

                Rectangle {
                    anchors.centerIn: parent
                    width: 8
                    height: 8
                    radius: 4
                    color: "#10b981"
                }

                MouseArea {
                    anchors.fill: parent
                    cursorShape: Qt.PointingHandCursor
                    onClicked: musicCardExpanded = !musicCardExpanded
                }
            }
        }

        // 跳动的音频均衡器柱 (3 bars)
        Row {
            Layout.alignment: Qt.AlignVCenter
            spacing: 2
            visible: pill.width >= 240

            Repeater {
                model: 3
                Rectangle {
                    width: 2.5
                    height: (appState && appState.musicPlaying) ? (index === 1 ? 16 : (index === 0 ? 10 : 12)) : 4
                    radius: 1.2
                    color: "#34d399"
                    anchors.verticalCenter: parent ? parent.verticalCenter : undefined

                    SequentialAnimation on height {
                        running: appState ? appState.musicPlaying : false
                        loops: Animation.Infinite
                        NumberAnimation { to: index === 1 ? 6 : 14; duration: 250 + index * 80; easing.type: Easing.InOutQuad }
                        NumberAnimation { to: index === 1 ? 16 : 5; duration: 250 + index * 80; easing.type: Easing.InOutQuad }
                    }
                }
            }
        }

        // 歌曲标题与实时歌词
        ColumnLayout {
            Layout.fillWidth: true
            Layout.alignment: Qt.AlignVCenter
            spacing: 0

            Text {
                Layout.fillWidth: true
                text: appState && appState.trackTitle ? appState.trackTitle : "未播放音频"
                color: "white"
                font.pixelSize: 11
                font.weight: Font.Bold
                elide: Text.ElideRight
            }

            Text {
                Layout.fillWidth: true
                text: appState && appState.currentLyric ? appState.currentLyric : (appState && appState.trackArtist ? appState.trackArtist : "Windows GSMTC 媒体监听")
                color: "#a7f3d0"
                font.pixelSize: 10
                elide: Text.ElideRight
            }

            MouseArea {
                anchors.fill: parent
                cursorShape: Qt.PointingHandCursor
                onClicked: musicCardExpanded = !musicCardExpanded
            }
        }

        // 播放控制按钮
        Row {
            Layout.alignment: Qt.AlignVCenter
            spacing: 3

            IconButton {
                iconSource: appState && appState.musicPlaying
                            ? "qrc:/qt/qml/Linguist/resources/icons/pause.svg"
                            : "qrc:/qt/qml/Linguist/resources/icons/play.svg"
                iconSize: 14
                iconColor: "#34d399"
                onClicked: if (appState) appState.toggleMusicPlay()
            }

            IconButton {
                iconSource: "qrc:/qt/qml/Linguist/resources/icons/skip-forward.svg"
                iconSize: 14
                visible: pill.width >= 300
                onClicked: if (appState) appState.nextTrack()
            }

            // 切回翻译药丸按钮
            IconButton {
                iconSource: "qrc:/qt/qml/Linguist/resources/icons/swap.svg"
                iconSize: 14
                iconColor: Qt.rgba(1, 1, 1, 0.7)
                hoverColor: Qt.rgba(1, 1, 1, 0.15)
                onClicked: if (appState) appState.setPillMusicMode(false)
            }
        }
    }

    // === 模式 2：标准翻译药丸模式 ===
    RowLayout {
        id: translationRow
        anchors.fill: parent
        anchors.leftMargin: 8
        anchors.rightMargin: 8
        spacing: 6
        visible: !isMusicMode

        // --- 左侧：红绿灯 ---
        Item {
            id: leftArea
            Layout.preferredWidth: leftVisible ? 56 : 0
            Layout.fillHeight: true
            clip: true

            Behavior on Layout.preferredWidth { NumberAnimation { duration: 200; easing.type: Easing.OutCubic } }

            TrafficLights {
                anchors.verticalCenter: parent.verticalCenter
                anchors.left: parent.left
                anchors.leftMargin: 4
                opacity: leftVisible ? 1.0 : 0.0
                Behavior on opacity { NumberAnimation { duration: 200 } }
                onCloseClicked: appState.clearText()
                onCollapseClicked: pill.expandRequested()
                onMinimizeClicked: pill.expandRequested()
            }

            MouseArea {
                anchors.left: parent.left
                anchors.top: parent.top
                anchors.bottom: parent.bottom
                width: 20
                hoverEnabled: true
                onEntered: leftHovered = true
                onExited: leftHovered = false
                z: 10
            }
        }

        // --- 搜索框 ---
        Rectangle {
            id: searchBox
            Layout.preferredHeight: 28
            Layout.preferredWidth: searchFocused ? Math.min(180, Math.max(120, pill.width * 0.45)) : (pill.width < 280 ? 28 : 100)
            Layout.maximumWidth: searchFocused ? 180 : 140
            radius: 14
            color: searchFocused ? "#33ffffff" : "#1affffff"
            border.color: searchFocused ? "#8060a5fa" : DesignTokens.borderInput
            border.width: 1

            Behavior on color { ColorAnimation { duration: 150 } }

            RowLayout {
                anchors.fill: parent
                anchors.leftMargin: 6
                anchors.rightMargin: 4
                spacing: 4

                Image {
                    Layout.alignment: Qt.AlignVCenter
                    source: "qrc:/qt/qml/Linguist/resources/icons/search.svg"
                    sourceSize.width: 14; sourceSize.height: 14
                }

                TextField {
                    Layout.fillWidth: true
                    Layout.alignment: Qt.AlignVCenter
                    id: pillInput
                    text: appState.sourceText
                    placeholderText: searchFocused ? "搜索/翻译..." : (pill.width >= 300 ? "搜索/翻译..." : "")
                    color: DesignTokens.textSecondary
                    font.pixelSize: 12
                    font.family: "Segoe UI"
                    background: Rectangle { color: "transparent" }
                    visible: searchFocused || pill.width >= 280
                    onTextChanged: appState.setSourceText(text)
                    onAccepted: appState.translate()
                    onFocusChanged: searchFocused = focus
                }

                Image {
                    Layout.alignment: Qt.AlignVCenter
                    source: "qrc:/qt/qml/Linguist/resources/icons/close.svg"
                    sourceSize.width: 12; sourceSize.height: 12
                    visible: appState.sourceText.length > 0 && searchFocused
                    MouseArea { anchors.fill: parent; onClicked: { appState.clearText(); pillInput.focus = true } }
                }
            }

            MouseArea {
                anchors.fill: parent
                onPressed: pillInput.focus = true
                z: -1
            }
        }

        // --- 原文 | 译文 ---
        Item {
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true

            RowLayout {
                anchors.verticalCenter: parent.verticalCenter
                anchors.left: parent.left
                anchors.right: parent.right
                spacing: 4

                Text {
                    Layout.maximumWidth: parent.width * 0.35
                    text: appState.sourceText
                    color: "#d9ffffff"
                    font.pixelSize: 12
                    font.weight: Font.Medium
                    font.family: "Segoe UI"
                    elide: Text.ElideRight
                    visible: appState.sourceText.length > 0
                }

                Text {
                    text: pill.width < 300 ? "|" : "➔"
                    color: pill.width < 300 ? "#4cffffff" : DesignTokens.accentBlue
                    font.pixelSize: 11
                    font.weight: Font.Bold
                }

                MarqueeText {
                    Layout.fillWidth: true
                    text: appState.completeTranslation()
                    textColor: "#f2ffffff"
                    fontSize: 12
                    visible: appState.translatedText.length > 0 && appState.sourceText.length > 0
                }
            }

            Text {
                anchors.verticalCenter: parent.verticalCenter
                anchors.left: parent.left
                text: appState.isLoading ? "翻译中..." : (appState.sourceText ? "按回车翻译..." : "输入或划词翻译")
                color: appState.sourceText ? "#80ffffff" : "#66ffffff"
                font.pixelSize: 11
                font.italic: true
                font.family: "Segoe UI"
                visible: appState.translatedText.length === 0 || appState.sourceText.length === 0
            }
        }

        // --- 右侧：操作按钮 ---
        Item {
            id: rightArea
            Layout.preferredWidth: rightVisible && !appState.isLoading ? 136 : 0
            Layout.fillHeight: true
            clip: true

            Behavior on Layout.preferredWidth { NumberAnimation { duration: 200; easing.type: Easing.OutCubic } }

            MouseArea {
                anchors.right: parent.right
                anchors.top: parent.top
                anchors.bottom: parent.bottom
                width: 20
                hoverEnabled: true
                onEntered: rightHovered = true
                onExited: rightHovered = false
                z: 10
            }

            // 按钮行
            Row {
                anchors.verticalCenter: parent.verticalCenter
                anchors.right: parent.right
                anchors.rightMargin: 4
                spacing: 2
                opacity: rightVisible && !appState.isLoading ? 1.0 : 0.0
                Behavior on opacity { NumberAnimation { duration: 200 } }

                IconButton {
                    iconSource: "qrc:/qt/qml/Linguist/resources/icons/volume.svg"
                    iconSize: 14
                    visible: appState.translatedText.length > 0
                    onClicked: appState.speak()
                }
                IconButton {
                    iconSource: "qrc:/qt/qml/Linguist/resources/icons/copy.svg"
                    iconSize: 14
                    visible: appState.translatedText.length > 0
                    onClicked: appState.copyTranslation()
                }
                IconButton {
                    iconSource: "qrc:/qt/qml/Linguist/resources/icons/crop.svg"
                    iconSize: 14
                    iconColor: "#cc93c5fd"
                    onClicked: {
                        if (typeof appState !== "undefined" && appState) {
                            appState.startScreenshotTranslate()
                        }
                    }
                }
                // 灵动岛音乐模式切换按钮
                IconButton {
                    iconSource: "qrc:/qt/qml/Linguist/resources/icons/music.svg"
                    iconSize: 14
                    iconColor: "#34d399"
                    onClicked: {
                        if (typeof appState !== "undefined" && appState) {
                            appState.togglePillMusicMode()
                        }
                    }
                }
                Rectangle {
                    width: 26; height: 26; radius: 13
                    color: "#26ffffff"
                    border.color: DesignTokens.borderSubtle
                    border.width: 1

                    Image {
                        anchors.centerIn: parent
                        source: "qrc:/qt/qml/Linguist/resources/icons/maximize.svg"
                        sourceSize.width: 14; sourceSize.height: 14
                    }

                    MouseArea {
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: pill.expandRequested()
                        onEntered: { parent.color = "#663b82f6"; parent.scale = 1.1 }
                        onExited: { parent.color = "#26ffffff"; parent.scale = 1.0 }
                    }
                    Behavior on color { ColorAnimation { duration: 150 } }
                    Behavior on scale { NumberAnimation { duration: 150; easing.type: Easing.OutBack } }
                }
            }
        }
    }

    // === 边缘拉伸 ===
    Rectangle {
        anchors.left: parent.left; anchors.leftMargin: 32
        anchors.right: parent.right; anchors.rightMargin: 32
        anchors.bottom: parent.bottom
        height: 12
        color: "transparent"
        z: 20
        MouseArea { anchors.fill: parent; cursorShape: Qt.SizeVerCursor }
    }
    Rectangle {
        anchors.right: parent.right
        anchors.top: parent.top; anchors.topMargin: 8
        anchors.bottom: parent.bottom; anchors.bottomMargin: 8
        width: 10
        color: "transparent"
        z: 20
        MouseArea { anchors.fill: parent; cursorShape: Qt.SizeHorCursor }
    }
    Rectangle {
        anchors.left: parent.left
        anchors.top: parent.top; anchors.topMargin: 8
        anchors.bottom: parent.bottom; anchors.bottomMargin: 8
        width: 10
        color: "transparent"
        z: 20
        MouseArea { anchors.fill: parent; cursorShape: Qt.SizeHorCursor }
    }
}

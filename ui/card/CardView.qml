import QtQuick
import QtQuick.Controls
import QtQuick.Layouts

Item {
    id: card

    property bool isDragging: false
    property string resizeEdge: "none"
    property bool isMinimal: height <= 130 || (width <= 220 && height <= 160)
    property bool isUltraCompact: !isMinimal && (width < 280 || height < 260)
    property bool isVeryCompact: !isMinimal && (width < 340 || height < 330)
    property bool isCompact: !isMinimal && (width < 420 || height < 400)
    property bool dynamicCompact: !isMinimal && (appState.compactMode || isCompact)
    property bool dynamicTight: !isMinimal && isVeryCompact
    property bool showFontPopover: false
    property bool showHistoryDrawer: false
    property bool showScreenshotView: false

    // === 顶部栏动态空间分配 ===
    property real leftMargin: isUltraCompact ? 8 : (isVeryCompact ? 10 : 14)
    property real rightMargin: isUltraCompact ? 8 : (isVeryCompact ? 10 : 14)
    property real rightFullWidth: 104
    property real rightMinWidth: 52
    property real middleNaturalWidth: 178
    property real middleCompactWidth: 152
    property real middleMinimalWidth: 76
    property real middleMinWidth: 54
    property real availableWidth: width - leftMargin - rightMargin - 38
    property real middleAvailable: availableWidth - rightFullWidth
    property real topSpacing: middleAvailable > middleNaturalWidth ? Math.min(6, (middleAvailable - middleNaturalWidth) / 2) : 0
    property real middleWidth: Math.min(middleNaturalWidth, Math.max(middleMinWidth, middleAvailable))
    property bool middleIsCompact: middleWidth <= middleCompactWidth
    property bool middleIsMinimal: middleWidth <= middleMinimalWidth
    property bool middleIsMin: middleWidth <= middleMinWidth
    property real rightWidth: middleIsMin ? Math.max(rightMinWidth, availableWidth - middleMinWidth) : rightFullWidth
    property real settingsBtnW: Math.max(0, Math.min(26, rightWidth - 78))

    signal collapseRequested()
    signal translateRequested()
    signal settingsRequested()
    signal quitRequested()
    signal minimizeToTaskbarRequested()

    // === 毛玻璃背景 ===
    GlassSurface {
        anchors.fill: parent
        isPill: false
        isDragging: card.isDragging
    }

    ColumnLayout {
        anchors.fill: parent
        spacing: 0

        // ========== 顶部栏 ==========
        Rectangle {
            id: topBar
            Layout.fillWidth: true
            Layout.preferredHeight: isUltraCompact ? 40 : (isVeryCompact ? 44 : 50)
            color: "transparent"
            visible: !card.isMinimal

            // Row结构自动排列不重叠，弹簧动画线性(100ms)无弹簧感
            Row {
                id: topRow
                anchors.fill: parent
                anchors.leftMargin: card.leftMargin
                anchors.rightMargin: card.rightMargin
                spacing: 0

                // 1. 红绿灯
                TrafficLights {
                    id: trafficLights
                    anchors.verticalCenter: parent.verticalCenter
                    onCloseClicked: card.quitRequested()
                    onMinimizeClicked: card.minimizeToTaskbarRequested()
                    onCollapseClicked: card.collapseRequested()
                }

                // 2. 左弹簧（线性动画，无弹簧感）
                Item {
                    id: leftSpring
                    height: 1
                    width: Math.max(0, (topRow.width - trafficLights.width - middleGroup.width - iconGroup.width) / 2)
                    Behavior on width { NumberAnimation { duration: 100; easing.type: Easing.Linear } }
                }

                // 3. 中间组
                Row {
                    id: middleGroup
                    anchors.verticalCenter: parent.verticalCenter
                    spacing: card.topSpacing
                    Behavior on spacing { NumberAnimation { duration: 100; easing.type: Easing.Linear } }

                    LanguageSelector {
                        id: langSelector
                        anchors.verticalCenter: parent.verticalCenter
                        sourceLang: appState.sourceLang
                        targetLang: appState.targetLang
                        compact: card.middleIsCompact && !card.middleIsMinimal
                        minimal: card.middleIsMinimal && !card.middleIsMin
                        textOnly: card.middleIsMin && !langSelector.hovered
                        iconOnly: false
                        onSwapClicked: appState.swapLanguages()
                    }

                    // 引擎状态
                    Rectangle {
                        id: engineIndicator
                        anchors.verticalCenter: parent.verticalCenter
                        height: 20
                        radius: 10
                        color: engineMouse.containsMouse ? "#263b82f6" : "#14ffffff"
                        border.color: engineMouse.containsMouse ? "#4d60a5fa" : (engineIndicator.expanded ? DesignTokens.borderInput : "transparent")
                        border.width: 1
                        property bool expanded: (!card.middleIsMinimal || engineMouse.containsMouse)
                        width: expanded ? (engineRow.width + 16) : 20
                        Behavior on width { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }
                        Behavior on border.color { ColorAnimation { duration: 150; easing.type: Easing.OutCubic } }
                        Behavior on color { ColorAnimation { duration: 150; easing.type: Easing.OutCubic } }

                        Row {
                            id: engineRow
                            anchors.centerIn: parent
                            spacing: 5
                            opacity: engineIndicator.expanded ? 1 : 0
                            Behavior on opacity { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }

                            Item {
                                width: 7; height: 7
                                anchors.verticalCenter: parent.verticalCenter
                                Rectangle {
                                    anchors.fill: parent
                                    radius: 3.5
                                    color: appState.engine === "offline" ? DesignTokens.accentAmber : DesignTokens.accentEmerald
                                }
                                Rectangle {
                                    anchors.centerIn: parent
                                    width: 13; height: 13
                                    radius: 6.5
                                    color: appState.engine === "offline" ? DesignTokens.accentAmber : DesignTokens.accentEmerald
                                    opacity: appState.isLoading ? 0.6 : 0.25
                                    SequentialAnimation on scale {
                                        running: appState.isLoading
                                        loops: Animation.Infinite
                                        NumberAnimation { from: 1.0; to: 1.4; duration: 600; easing.type: Easing.InOutQuad }
                                        NumberAnimation { from: 1.4; to: 1.0; duration: 600; easing.type: Easing.InOutQuad }
                                    }
                                }
                            }
                            Text {
                                text: appState.engine === "gemini" ? "Gemini" : appState.engine === "deepl" ? "DeepL" : appState.engine === "youdao" ? "有道" : "离线"
                                color: engineMouse.containsMouse ? "#ffffff" : "#93c5fd"
                                font.pixelSize: 10
                                font.weight: Font.Medium
                                anchors.verticalCenter: parent.verticalCenter
                            }
                        }

                        Item {
                            anchors.centerIn: parent
                            width: 7; height: 7
                            visible: !engineIndicator.expanded
                            Rectangle {
                                anchors.fill: parent
                                radius: 3.5
                                color: appState.engine === "offline" ? DesignTokens.accentAmber : DesignTokens.accentEmerald
                            }
                            Rectangle {
                                anchors.centerIn: parent
                                width: 13; height: 13
                                radius: 6.5
                                color: appState.engine === "offline" ? DesignTokens.accentAmber : DesignTokens.accentEmerald
                                opacity: 0.3
                            }
                        }

                        MouseArea {
                            id: engineMouse
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: {
                                var engines = ["gemini", "deepl", "youdao", "offline"];
                                var cur = appState.engine;
                                var idx = engines.indexOf(cur);
                                var next = engines[(idx + 1) % engines.length];
                                appState.setEngine(next);
                            }
                        }
                    }
                }

                // 4. 右弹簧（平滑居中过度）
                Item {
                    id: rightSpring
                    height: 1
                    width: leftSpring.width
                    Behavior on width { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }
                }

                // 5. 右边图标组（Row自动排列不重叠，clip确保不超出边框）
                Row {
                    id: iconGroup
                    anchors.verticalCenter: parent.verticalCenter
                    spacing: 0
                    clip: true

                    // 截图（始终显示）
                    Item {
                        width: 26; height: 26
                        IconButton {
                            anchors.centerIn: parent
                            iconSource: "qrc:/qt/qml/Linguist/resources/icons/crop.svg"
                            iconColor: card.showScreenshotView ? "#60a5fa" : "#cc60a5fa"
                            active: card.showScreenshotView
                            iconSize: 13
                            onClicked: {
                                if (typeof appState !== "undefined" && appState) {
                                    appState.triggerSelectionTranslation();
                                }
                            }
                        }
                    }

                    // 灵动岛音乐控制
                    Item {
                        width: 26; height: 26
                        IconButton {
                            anchors.centerIn: parent
                            iconSource: "qrc:/qt/qml/Linguist/resources/icons/music.svg"
                            iconColor: (typeof appState !== "undefined" && appState && appState.musicPlaying) ? "#10b981" : "#34d399"
                            iconSize: 13
                            onClicked: {
                                if (typeof appState !== "undefined" && appState) {
                                    appState.toggleMusicPlay();
                                }
                            }
                        }
                    }

                    // 固定（始终显示）
                    Item {
                        width: 26; height: 26
                        IconButton {
                            anchors.centerIn: parent
                            iconSource: "qrc:/qt/qml/Linguist/resources/icons/pin.svg"
                            active: appState.isPinned
                            iconSize: 13
                            onClicked: appState.setIsPinned(!appState.isPinned)
                        }
                    }

                    // 设置（最后收进）
                    Item {
                        id: settingsBtnContainer
                        width: card.settingsBtnW
                        height: 26
                        clip: true
                        Behavior on width { NumberAnimation { duration: 120; easing.type: Easing.OutCubic } }
                        IconButton {
                            anchors.centerIn: parent
                            iconSource: "qrc:/qt/qml/Linguist/resources/icons/settings.svg"
                            iconSize: 13
                            scale: settingsBtnContainer.width > 10 ? 1.0 : 0.0
                            opacity: settingsBtnContainer.width > 10 ? 1 : 0
                            Behavior on scale { NumberAnimation { duration: 120; easing.type: Easing.OutCubic } }
                            Behavior on opacity { NumberAnimation { duration: 120; easing.type: Easing.OutCubic } }
                            onClicked: card.settingsRequested()
                        }
                    }
                }
            }

            Rectangle {
                anchors.left: parent.left; anchors.right: parent.right
                anchors.leftMargin: card.leftMargin; anchors.rightMargin: card.rightMargin
                anchors.bottom: parent.bottom
                height: 1; color: DesignTokens.borderSubtle
            }
        }

        // ========== 内容区 ==========
        Item {
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true

            // --- 截图翻译模式 (对齐 Web 端 ScreenshotTranslationView) ---
            ScreenshotTranslationView {
                anchors.fill: parent
                anchors.margins: dynamicTight ? 6 : (dynamicCompact ? 8 : 12)
                visible: card.showScreenshotView
                onBackToTextRequested: card.showScreenshotView = false
                onRetakeRequested: {
                    if (typeof appState !== "undefined" && appState) {
                        appState.triggerSelectionTranslation();
                    }
                }
            }

            // --- 极简模式 ---
            ColumnLayout {
                anchors.fill: parent
                anchors.margins: 8
                spacing: 4
                visible: card.isMinimal && !card.showScreenshotView

                SearchInput {
                    Layout.fillWidth: true
                    compact: true
                    text: appState.sourceText
                    placeholder: "搜索或输入..."
                    onTextChanged: appState.setSourceText(text)
                    onSubmitted: appState.translate()
                    onScreenshotClicked: card.showScreenshotView = true
                }

                Item {
                    Layout.fillWidth: true
                    Layout.fillHeight: true

                    Row {
                        anchors.centerIn: parent
                        spacing: 6
                        visible: appState.isLoading
                        Image {
                            source: "qrc:/qt/qml/Linguist/resources/icons/sparkles.svg"
                            sourceSize.width: 12; sourceSize.height: 12
                            RotationAnimation on rotation { running: appState.isLoading; loops: Animation.Infinite; from: 0; to: 360; duration: 1000 }
                        }
                        Text { text: "正在翻译..."; color: "#80ffffff"; font.pixelSize: 11; anchors.verticalCenter: parent.verticalCenter }
                    }

                    HoverScrollText {
                        anchors.fill: parent
                        text: appState.completeTranslation()
                        textColor: "#f2ffffff"
                        fontSize: 12
                        prefix: appState.isWord ? (appState.phoneticUs.length > 0 ? appState.phoneticUs : appState.phoneticUk) : ""
                        visible: !appState.isLoading && appState.translatedText.length > 0
                    }
                }
            }

            // --- 标准/紧凑模式 ---
            Flickable {
                id: flickable
                anchors.fill: parent
                clip: true
                visible: !card.isMinimal && !card.showScreenshotView
                contentWidth: width
                contentHeight: contentColumn.implicitHeight + (dynamicTight ? 16 : (dynamicCompact ? 20 : 28))
                boundsBehavior: Flickable.StopAtBounds

                ColumnLayout {
                    id: contentColumn
                    x: dynamicTight ? 8 : (dynamicCompact ? 10 : 14)
                    y: dynamicTight ? 8 : (dynamicCompact ? 10 : 14)
                    width: flickable.width - (dynamicTight ? 16 : (dynamicCompact ? 20 : 28))
                    spacing: dynamicTight ? 4 : (dynamicCompact ? 8 : 12)

                    SearchInput {
                        Layout.fillWidth: true
                        compact: dynamicCompact
                        text: appState.sourceText
                        onTextChanged: appState.setSourceText(text)
                        onSubmitted: appState.translate()
                        onScreenshotClicked: card.showScreenshotView = true
                    }

                    // 加载中
                    ColumnLayout {
                        Layout.fillWidth: true
                        Layout.topMargin: 16
                        Layout.bottomMargin: 16
                        spacing: 8
                        visible: appState.isLoading

                        Image {
                            Layout.alignment: Qt.AlignHCenter
                            source: "qrc:/qt/qml/Linguist/resources/icons/sparkles.svg"
                            sourceSize.width: 20; sourceSize.height: 20
                            RotationAnimation on rotation { running: appState.isLoading; loops: Animation.Infinite; from: 0; to: 360; duration: 1000 }
                        }
                        Text {
                            Layout.alignment: Qt.AlignHCenter
                            text: "正在翻译中..."
                            color: "#80ffffff"
                            font.pixelSize: 12; font.letterSpacing: 1
                        }
                    }

                    // 单词详情
                    WordDetailView {
                        Layout.fillWidth: true
                        word: appState.sourceText
                        phonetic: appState.phoneticUs.length > 0 ? appState.phoneticUs : appState.phoneticUk
                        translatedText: appState.translatedText
                        englishDefinition: appState.englishDefinition
                        definitions: appState.definitions
                        examples: appState.examples
                        synonyms: appState.synonyms
                        antonyms: appState.antonyms
                        wordForms: appState.wordForms
                        tags: appState.tags
                        compact: dynamicCompact
                        veryCompact: dynamicTight
                        ultraCompact: isUltraCompact
                        visible: !appState.isLoading && appState.isWord && appState.translatedText.length > 0
                    }

                    // 句子翻译（点击任意句子均可即时朗读）
                    ColumnLayout {
                        Layout.fillWidth: true
                        spacing: 4
                        visible: !appState.isLoading && !appState.isWord && appState.translatedText.length > 0

                        // 译文卡片：点击朗读译文
                        Rectangle {
                            id: transSentenceCard
                            Layout.fillWidth: true
                            radius: 8
                            color: transMouse.containsMouse ? "#143b82f6" : "transparent"
                            border.color: transMouse.containsMouse ? "#4060a5fa" : "transparent"
                            border.width: 1
                            implicitHeight: transRow.implicitHeight + 8

                            Behavior on color { ColorAnimation { duration: 150 } }

                            RowLayout {
                                id: transRow
                                anchors.fill: parent
                                anchors.margins: 4
                                spacing: 6

                                HoverScrollText {
                                    Layout.fillWidth: true
                                    text: appState.translatedText
                                    textColor: "#f2ffffff"
                                    fontSize: isUltraCompact ? 12 : (isVeryCompact ? 14 : 16)
                                }

                                Image {
                                    source: "qrc:/qt/qml/Linguist/resources/icons/volume.svg"
                                    sourceSize.width: 12; sourceSize.height: 12
                                    opacity: transMouse.containsMouse ? 0.9 : 0.0
                                    Behavior on opacity { NumberAnimation { duration: 150 } }
                                }
                            }

                            MouseArea {
                                id: transMouse
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: Qt.PointingHandCursor
                                onClicked: appState.speak(appState.translatedText, appState.targetLang)
                            }
                        }

                        Rectangle { Layout.fillWidth: true; height: 1; color: DesignTokens.borderSubtle }

                        // 原文卡片：点击朗读原文
                        Rectangle {
                            id: srcSentenceCard
                            Layout.fillWidth: true
                            radius: 8
                            color: srcMouse.containsMouse ? "#14ffffff" : "transparent"
                            border.color: srcMouse.containsMouse ? "#33ffffff" : "transparent"
                            border.width: 1
                            implicitHeight: srcRow.implicitHeight + 8

                            Behavior on color { ColorAnimation { duration: 150 } }

                            RowLayout {
                                id: srcRow
                                anchors.fill: parent
                                anchors.margins: 4
                                spacing: 6

                                HoverScrollText {
                                    Layout.fillWidth: true
                                    text: appState.sourceText
                                    textColor: "#80ffffff"
                                    fontSize: isUltraCompact ? 10 : (isVeryCompact ? 12 : 13)
                                }

                                Image {
                                    source: "qrc:/qt/qml/Linguist/resources/icons/volume.svg"
                                    sourceSize.width: 12; sourceSize.height: 12
                                    opacity: srcMouse.containsMouse ? 0.9 : 0.0
                                    Behavior on opacity { NumberAnimation { duration: 150 } }
                                }
                            }

                            MouseArea {
                                id: srcMouse
                                anchors.fill: parent
                                hoverEnabled: true
                                cursorShape: Qt.PointingHandCursor
                                onClicked: appState.speak(appState.sourceText, appState.sourceLang)
                            }
                        }
                    }

                    // 空状态
                    ColumnLayout {
                        Layout.fillWidth: true
                        Layout.topMargin: 12
                        spacing: 8
                        visible: !appState.isLoading && appState.translatedText.length === 0

                        Text {
                            Layout.alignment: Qt.AlignHCenter
                            text: "输入文本或在桌面文档中划词即刻精准翻译"
                            color: "#66ffffff"
                            font.pixelSize: 11
                            horizontalAlignment: Text.AlignHCenter
                        }

                        Flow {
                            Layout.alignment: Qt.AlignHCenter
                            spacing: 6
                            visible: !isUltraCompact

                            Repeater {
                                model: ["Efficient", "Serendipity", "Resilient", "AI 神经翻译"]
                                delegate: Rectangle {
                                    radius: 10
                                    color: "#0dffffff"
                                    border.color: DesignTokens.borderSubtle
                                    border.width: 1
                                    implicitWidth: demoText.implicitWidth + 16
                                    height: 22

                                    Text {
                                        id: demoText
                                        anchors.centerIn: parent
                                        text: modelData
                                        color: "#93c5fd"
                                        font.pixelSize: 10
                                    }

                                    MouseArea {
                                        anchors.fill: parent
                                        hoverEnabled: true
                                        onClicked: { appState.setSourceText(modelData); appState.translate() }
                                        onEntered: parent.color = "#26ffffff"
                                        onExited: parent.color = "#0dffffff"
                                    }
                                    Behavior on color { ColorAnimation { duration: 150; easing.type: Easing.Linear } }
                                }
                            }
                        }
                    }

                    Item { Layout.fillWidth: true; Layout.preferredHeight: dynamicTight ? 8 : (dynamicCompact ? 10 : 14) }
                }
            }
        }

        // ========== 底部状态与操作栏 (Unified Bottom Bar) ==========
        Rectangle {
            id: bottomBar
            Layout.fillWidth: true
            Layout.preferredHeight: 36
            color: "#0dffffff"
            visible: !card.isMinimal && card.height >= 180

            // 顶部精致分界线
            Rectangle {
                anchors.left: parent.left; anchors.right: parent.right
                anchors.top: parent.top
                height: 1
                color: DesignTokens.borderSubtle
            }

            Row {
                anchors.fill: parent
                anchors.leftMargin: card.leftMargin
                anchors.rightMargin: card.rightMargin
                spacing: 0

                // 左侧：Smart-Select 划词感知开关（常驻且灵敏）
                Row {
                    id: smartSelectGroup
                    anchors.verticalCenter: parent.verticalCenter
                    spacing: 7

                    Rectangle {
                        id: smartTogglePill
                        width: 28; height: 14; radius: 7
                        color: smartMouse.containsMouse ? (appState.selectionTranslation ? "#e63b82f6" : "#40ffffff") : (appState.selectionTranslation ? "#cc3b82f6" : "#26ffffff")
                        anchors.verticalCenter: parent.verticalCenter

                        Behavior on color { ColorAnimation { duration: 150; easing.type: Easing.OutCubic } }

                        Rectangle {
                            width: 10; height: 10; radius: 5
                            color: "#ffffff"
                            anchors.verticalCenter: parent.verticalCenter
                            x: appState.selectionTranslation ? (parent.width - width - 2) : 2
                            Behavior on x { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }
                        }

                        MouseArea {
                            id: smartMouse
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: appState.setSelectionTranslation(!appState.selectionTranslation)
                        }
                    }

                    Text {
                        text: appState.selectionTranslation ? "Smart-Select" : "Paused"
                        color: appState.selectionTranslation ? "#93c5fd" : "#80ffffff"
                        font.pixelSize: 9
                        font.weight: Font.SemiBold
                        font.letterSpacing: 0.5
                        anchors.verticalCenter: parent.verticalCenter

                        MouseArea {
                            anchors.fill: parent
                            cursorShape: Qt.PointingHandCursor
                            onClicked: appState.setSelectionTranslation(!appState.selectionTranslation)
                        }
                    }
                }

                // 中间弹性空间（平滑过渡）
                Item {
                    id: bottomSpring
                    height: 1
                    width: Math.max(0, parent.width - smartSelectGroup.width - rightBottomGroup.width)
                    Behavior on width { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }
                }

                // 右侧：翻译操作组与规格尺寸
                Row {
                    id: rightBottomGroup
                    anchors.verticalCenter: parent.verticalCenter
                    spacing: 6

                    // 操作工具按钮组（有翻译结果时展开）
                    Row {
                        id: bottomActionsRow
                        anchors.verticalCenter: parent.verticalCenter
                        spacing: 2
                        visible: !appState.isLoading && appState.translatedText.length > 0
                        opacity: visible ? 1.0 : 0.0
                        Behavior on opacity { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }

                        // 语言简标 (EN➔ZH)
                        Text {
                            text: appState.sourceLang + "➔" + appState.targetLang
                            color: "#8093c5fd"
                            font.pixelSize: 9
                            font.family: "Consolas"
                            anchors.verticalCenter: parent.verticalCenter
                            visible: card.width >= 350
                        }

                        IconButton {
                            iconSource: appState.justCopied ? "qrc:/qt/qml/Linguist/resources/icons/check.svg" : "qrc:/qt/qml/Linguist/resources/icons/copy.svg"
                            iconSize: 13
                            iconColor: appState.justCopied ? "#4ade80" : "#ccffffff"
                            hoverBg: appState.justCopied ? "#264ade80" : "#1affffff"
                            onClicked: appState.copyTranslation()
                        }

                        IconButton {
                            iconSource: "qrc:/qt/qml/Linguist/resources/icons/volume.svg"
                            iconSize: 13
                            onClicked: appState.speak(appState.sourceText, appState.sourceLang)
                        }

                        IconButton {
                            iconSource: "qrc:/qt/qml/Linguist/resources/icons/heart.svg"
                            iconSize: 13
                            active: appState.isFavorite
                            activeColor: DesignTokens.accentAmber
                            onClicked: appState.setIsFavorite(!appState.isFavorite)
                        }

                        IconButton {
                            iconSource: "qrc:/qt/qml/Linguist/resources/icons/history.svg"
                            iconSize: 13
                            active: card.showHistoryDrawer
                            activeColor: "#60a5fa"
                            onClicked: card.showHistoryDrawer = !card.showHistoryDrawer
                        }

                        Rectangle {
                            width: 1; height: 12
                            color: "#1affffff"
                            anchors.verticalCenter: parent.verticalCenter
                            visible: card.width >= 310
                        }
                    }

                    // 空状态提示
                    Text {
                        text: "划词即翻 · Alt+Q"
                        color: "#40ffffff"
                        font.pixelSize: 9
                        font.weight: Font.Medium
                        anchors.verticalCenter: parent.verticalCenter
                        visible: (!appState.isLoading && appState.translatedText.length === 0) && card.width >= 290
                    }

                    // 文本大小调节按钮 (移动到底部栏)
                    Rectangle {
                        id: bottomFontBtn
                        height: 20
                        width: fontBtnInnerRow.width + 10
                        radius: 6
                        color: card.showFontPopover ? "#333b82f6" : (bottomFontMouse.containsMouse ? "#20ffffff" : "#0dffffff")
                        border.color: card.showFontPopover ? "#60a5fa" : (bottomFontMouse.containsMouse ? "#40ffffff" : "#1affffff")
                        border.width: 1
                        anchors.verticalCenter: parent.verticalCenter

                        Row {
                            id: fontBtnInnerRow
                            anchors.centerIn: parent
                            spacing: 3

                            Image {
                                anchors.verticalCenter: parent.verticalCenter
                                source: "qrc:/qt/qml/Linguist/resources/icons/type.svg"
                                sourceSize.width: 11; sourceSize.height: 11
                            }

                            Text {
                                anchors.verticalCenter: parent.verticalCenter
                                text: (typeof appState !== "undefined" && appState ? appState.fontSizePercent : 100) + "%"
                                color: card.showFontPopover ? "#ffffff" : DesignTokens.textSecondary
                                font.pixelSize: 9
                                font.weight: Font.SemiBold
                                font.family: "Consolas"
                                visible: card.width >= 260
                            }
                        }

                        MouseArea {
                            id: bottomFontMouse
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: card.showFontPopover = !card.showFontPopover
                        }
                    }

                    // 窗口尺寸规格徽标
                    Text {
                        text: Math.round(card.width) + "×" + Math.round(card.height)
                        color: "#40ffffff"
                        font.pixelSize: 9
                        font.weight: Font.SemiBold
                        font.family: "Consolas"
                        anchors.verticalCenter: parent.verticalCenter
                        visible: card.width >= 240
                    }
                }
            }
        }
    }

    // === 字体大小与排版悬浮面板 (对齐 Web 端，从底部栏向上展开) ===
    Rectangle {
        id: fontPopover
        z: 25
        anchors.bottom: parent.bottom
        anchors.bottomMargin: (isUltraCompact ? 28 : (isVeryCompact ? 30 : 34)) + 6
        anchors.right: parent.right
        anchors.rightMargin: card.rightMargin
        width: Math.min(240, card.width - 20)
        height: fontPopCol.implicitHeight + 20
        radius: 14
        color: DesignTokens.bgCardDeep
        border.color: DesignTokens.borderNormal
        border.width: 1
        clip: true

        visible: opacity > 0
        opacity: card.showFontPopover ? 1.0 : 0.0
        scale: card.showFontPopover ? 1.0 : 0.92
        transformOrigin: Item.BottomRight

        Behavior on opacity { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }
        Behavior on scale { NumberAnimation { duration: 180; easing.type: Easing.OutCubic } }

        ColumnLayout {
            id: fontPopCol
            anchors.fill: parent
            anchors.margins: 10
            spacing: 8

            // 标题行
            RowLayout {
                Layout.fillWidth: true
                spacing: 6

                Image {
                    source: "qrc:/qt/qml/Linguist/resources/icons/type.svg"
                    sourceSize.width: 12; sourceSize.height: 12
                }

                Text {
                    text: "字体大小调节"
                    color: DesignTokens.textPrimary
                    font.pixelSize: 11
                    font.bold: true
                    Layout.fillWidth: true
                }

                Rectangle {
                    width: 18; height: 18; radius: 9
                    color: "transparent"

                    Image {
                        anchors.centerIn: parent
                        source: "qrc:/qt/qml/Linguist/resources/icons/close.svg"
                        sourceSize.width: 8; sourceSize.height: 8
                    }

                    MouseArea {
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: card.showFontPopover = false
                    }
                }
            }

            Rectangle { Layout.fillWidth: true; height: 1; color: DesignTokens.borderSubtle }

            // 步进调节 [-] 100% [+]
            RowLayout {
                Layout.fillWidth: true
                spacing: 6

                Rectangle {
                    width: 26; height: 26; radius: 6
                    color: "#14ffffff"
                    border.color: DesignTokens.borderSubtle
                    border.width: 1

                    Image {
                        anchors.centerIn: parent
                        source: "qrc:/qt/qml/Linguist/resources/icons/minus.svg"
                        sourceSize.width: 10; sourceSize.height: 10
                    }

                    MouseArea {
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: {
                            if (typeof appState !== "undefined" && appState) {
                                appState.setFontSizePercent(appState.fontSizePercent - 5);
                            }
                        }
                    }
                }

                Rectangle {
                    Layout.fillWidth: true
                    height: 26
                    radius: 6
                    color: "#0dffffff"
                    border.color: DesignTokens.borderSubtle
                    border.width: 1

                    Text {
                        anchors.centerIn: parent
                        text: (typeof appState !== "undefined" && appState ? appState.fontSizePercent : 100) + "%"
                        color: "#93c5fd"
                        font.pixelSize: 12
                        font.bold: true
                        font.family: "Consolas"
                    }
                }

                Rectangle {
                    width: 26; height: 26; radius: 6
                    color: "#14ffffff"
                    border.color: DesignTokens.borderSubtle
                    border.width: 1

                    Image {
                        anchors.centerIn: parent
                        source: "qrc:/qt/qml/Linguist/resources/icons/plus.svg"
                        sourceSize.width: 10; sourceSize.height: 10
                    }

                    MouseArea {
                        anchors.fill: parent
                        hoverEnabled: true
                        cursorShape: Qt.PointingHandCursor
                        onClicked: {
                            if (typeof appState !== "undefined" && appState) {
                                appState.setFontSizePercent(appState.fontSizePercent + 5);
                            }
                        }
                    }
                }
            }

            // 预设快捷选项
            RowLayout {
                Layout.fillWidth: true
                spacing: 4

                Repeater {
                    model: [
                        { label: "80%", val: 80 },
                        { label: "100%", val: 100 },
                        { label: "120%", val: 120 }
                    ]

                    delegate: Rectangle {
                        Layout.fillWidth: true
                        height: 22
                        radius: 6
                        color: (typeof appState !== "undefined" && appState && appState.fontSizePercent === modelData.val) ? "#333b82f6" : "#0dffffff"
                        border.color: (typeof appState !== "undefined" && appState && appState.fontSizePercent === modelData.val) ? "#60a5fa" : DesignTokens.borderSubtle
                        border.width: 1

                        Text {
                            anchors.centerIn: parent
                            text: modelData.label
                            color: (typeof appState !== "undefined" && appState && appState.fontSizePercent === modelData.val) ? "#ffffff" : DesignTokens.textSecondary
                            font.pixelSize: 10
                            font.bold: typeof appState !== "undefined" && appState && appState.fontSizePercent === modelData.val
                        }

                        MouseArea {
                            anchors.fill: parent
                            hoverEnabled: true
                            cursorShape: Qt.PointingHandCursor
                            onClicked: {
                                if (typeof appState !== "undefined" && appState) {
                                    appState.setFontSizePercent(modelData.val);
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // === 历史记录抽屉遮罩 (对齐 Web 端 HistoryDrawer) ===
    Item {
        id: historyOverlay
        anchors.fill: parent
        anchors.margins: 4
        z: 30
        visible: opacity > 0
        opacity: card.showHistoryDrawer ? 1.0 : 0.0
        scale: card.showHistoryDrawer ? 1.0 : 0.96

        Behavior on opacity { NumberAnimation { duration: 160; easing.type: Easing.OutCubic } }
        Behavior on scale { NumberAnimation { duration: 180; easing.type: Easing.OutCubic } }

        HistoryView {
            anchors.fill: parent
            onCloseRequested: card.showHistoryDrawer = false
        }
    }
}

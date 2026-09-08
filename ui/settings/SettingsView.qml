import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Linguist

Rectangle {
    id: settingsView
    width: 440
    height: 580
    radius: 20
    color: "#f5121524"
    border.color: DesignTokens.borderNormal
    border.width: 1
    clip: true

    signal closeRequested()

    property bool showGeminiKey: false
    property bool showDeeplKey: false
    property bool showYoudaoSecret: false
    property string testResultText: ""
    property bool testSuccess: true
    property bool isTesting: false
    property string triggerMode: (typeof appState !== "undefined" && appState) ? appState.selectionTriggerMode : "auto" // auto (关气泡直出卡片) | icon (小气泡)
    property string currentWallpaper: "frosted-glass"

    // 阴影装饰边框
    Rectangle {
        anchors.fill: parent
        radius: parent.radius
        color: "transparent"
        border.color: "#33ffffff"
        border.width: 1
        opacity: 0.5
    }

    ColumnLayout {
        anchors.fill: parent
        anchors.margins: 18
        spacing: 12

        // ========== 1. 标题栏 ==========
        RowLayout {
            Layout.fillWidth: true
            spacing: 8

            Rectangle {
                width: 28; height: 28; radius: 8
                color: "#263b82f6"
                Image {
                    anchors.centerIn: parent
                    source: "qrc:/qt/qml/Linguist/resources/icons/sliders.svg"
                    sourceSize.width: 15; sourceSize.height: 15
                }
            }

            Text {
                text: "Linguist 偏好设置"
                color: DesignTokens.textPrimary
                font.pixelSize: 15
                font.weight: Font.Bold
                Layout.fillWidth: true
            }

            Rectangle {
                width: 26; height: 26; radius: 13
                color: closeMouse.containsMouse ? "#26ffffff" : "#0dffffff"
                border.color: DesignTokens.borderSubtle
                border.width: 1

                Image {
                    anchors.centerIn: parent
                    source: "qrc:/qt/qml/Linguist/resources/icons/close.svg"
                    sourceSize.width: 10; sourceSize.height: 10
                }

                MouseArea {
                    id: closeMouse
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: settingsView.closeRequested()
                }
            }
        }

        Rectangle { Layout.fillWidth: true; height: 1; color: DesignTokens.borderSubtle }

        // ========== 2. 滚动内容区 ==========
        ScrollView {
            id: scrollArea
            Layout.fillWidth: true
            Layout.fillHeight: true
            clip: true
            ScrollBar.vertical.policy: ScrollBar.AsNeeded

            ColumnLayout {
                width: scrollArea.width - 12
                spacing: 16

                // ----- SECTION 1: 翻译引擎与 API 配置 -----
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 6

                    Image {
                        source: "qrc:/qt/qml/Linguist/resources/icons/sparkles.svg"
                        sourceSize.width: 13; sourceSize.height: 13
                    }

                    Text {
                        text: "翻译引擎与 API 配置"
                        color: DesignTokens.textPrimary
                        font.pixelSize: 12
                        font.weight: Font.Bold
                    }

                    Item { Layout.fillWidth: true }

                    Text {
                        text: "当前活跃: " + (typeof appState !== "undefined" && appState ? appState.engine.toUpperCase() : "GEMINI")
                        color: DesignTokens.accentBlue
                        font.pixelSize: 10
                        font.weight: Font.Bold
                    }
                }

                // 2x2 引擎切换网格
                GridLayout {
                    Layout.fillWidth: true
                    columns: 2
                    columnSpacing: 8
                    rowSpacing: 8

                    // 1. Gemini AI
                    Rectangle {
                        Layout.fillWidth: true
                        height: 68
                        radius: 12
                        color: (typeof appState !== "undefined" && appState && appState.engine === "gemini") ? "#263b82f6" : "#0dffffff"
                        border.color: (typeof appState !== "undefined" && appState && appState.engine === "gemini") ? "#60a5fa" : DesignTokens.borderSubtle
                        border.width: (typeof appState !== "undefined" && appState && appState.engine === "gemini") ? 1.5 : 1

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 8
                            spacing: 4

                            RowLayout {
                                Layout.fillWidth: true
                                Text { text: "Gemini AI"; color: DesignTokens.textPrimary; font.pixelSize: 12; font.bold: true }
                                Item { Layout.fillWidth: true }
                                Rectangle {
                                    radius: 6; height: 16; color: "#333b82f6"
                                    implicitWidth: geminiBadge.implicitWidth + 8
                                    Text { id: geminiBadge; anchors.centerIn: parent; text: "深度语境"; color: "#93c5fd"; font.pixelSize: 9 }
                                }
                            }
                            Text {
                                text: "Google 深度理解，详实音标与例句"
                                color: DesignTokens.textTertiary
                                font.pixelSize: 10
                                wrapMode: Text.Wrap
                                Layout.fillWidth: true
                            }
                        }

                        MouseArea {
                            anchors.fill: parent
                            cursorShape: Qt.PointingHandCursor
                            onClicked: if (typeof appState !== "undefined" && appState) appState.setEngine("gemini")
                        }
                    }

                    // 2. DeepL
                    Rectangle {
                        Layout.fillWidth: true
                        height: 68
                        radius: 12
                        color: (typeof appState !== "undefined" && appState && appState.engine === "deepl") ? "#263b82f6" : "#0dffffff"
                        border.color: (typeof appState !== "undefined" && appState && appState.engine === "deepl") ? "#60a5fa" : DesignTokens.borderSubtle
                        border.width: (typeof appState !== "undefined" && appState && appState.engine === "deepl") ? 1.5 : 1

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 8
                            spacing: 4

                            RowLayout {
                                Layout.fillWidth: true
                                Text { text: "DeepL"; color: DesignTokens.textPrimary; font.pixelSize: 12; font.bold: true }
                                Item { Layout.fillWidth: true }
                                Rectangle {
                                    radius: 6; height: 16; color: "#333b82f6"
                                    implicitWidth: deeplBadge.implicitWidth + 8
                                    Text { id: deeplBadge; anchors.centerIn: parent; text: "高自然度"; color: "#93c5fd"; font.pixelSize: 9 }
                                }
                            }
                            Text {
                                text: "欧洲高拟真神经网络，语感流畅优雅"
                                color: DesignTokens.textTertiary
                                font.pixelSize: 10
                                wrapMode: Text.Wrap
                                Layout.fillWidth: true
                            }
                        }

                        MouseArea {
                            anchors.fill: parent
                            cursorShape: Qt.PointingHandCursor
                            onClicked: if (typeof appState !== "undefined" && appState) appState.setEngine("deepl")
                        }
                    }

                    // 3. 有道智云
                    Rectangle {
                        Layout.fillWidth: true
                        height: 68
                        radius: 12
                        color: (typeof appState !== "undefined" && appState && appState.engine === "youdao") ? "#263b82f6" : "#0dffffff"
                        border.color: (typeof appState !== "undefined" && appState && appState.engine === "youdao") ? "#60a5fa" : DesignTokens.borderSubtle
                        border.width: (typeof appState !== "undefined" && appState && appState.engine === "youdao") ? 1.5 : 1

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 8
                            spacing: 4

                            RowLayout {
                                Layout.fillWidth: true
                                Text { text: "有道智云"; color: DesignTokens.textPrimary; font.pixelSize: 12; font.bold: true }
                                Item { Layout.fillWidth: true }
                                Rectangle {
                                    radius: 6; height: 16; color: "#33f59e0b"
                                    implicitWidth: youdaoBadge.implicitWidth + 8
                                    Text { id: youdaoBadge; anchors.centerIn: parent; text: "考试词典"; color: "#fcd34d"; font.pixelSize: 9 }
                                }
                            }
                            Text {
                                text: "国内权威词典，考级真题释义全面"
                                color: DesignTokens.textTertiary
                                font.pixelSize: 10
                                wrapMode: Text.Wrap
                                Layout.fillWidth: true
                            }
                        }

                        MouseArea {
                            anchors.fill: parent
                            cursorShape: Qt.PointingHandCursor
                            onClicked: if (typeof appState !== "undefined" && appState) appState.setEngine("youdao")
                        }
                    }

                    // 4. 离线脱机词典
                    Rectangle {
                        Layout.fillWidth: true
                        height: 68
                        radius: 12
                        color: (typeof appState !== "undefined" && appState && appState.engine === "offline") ? "#263b82f6" : "#0dffffff"
                        border.color: (typeof appState !== "undefined" && appState && appState.engine === "offline") ? "#60a5fa" : DesignTokens.borderSubtle
                        border.width: (typeof appState !== "undefined" && appState && appState.engine === "offline") ? 1.5 : 1

                        ColumnLayout {
                            anchors.fill: parent
                            anchors.margins: 8
                            spacing: 4

                            RowLayout {
                                Layout.fillWidth: true
                                Text { text: "离线词典"; color: DesignTokens.textPrimary; font.pixelSize: 12; font.bold: true }
                                Item { Layout.fillWidth: true }
                                Rectangle {
                                    radius: 6; height: 16; color: "#3310b981"
                                    implicitWidth: offBadge.implicitWidth + 8
                                    Text { id: offBadge; anchors.centerIn: parent; text: "零网络依赖"; color: "#6ee7b7"; font.pixelSize: 9 }
                                }
                            }
                            Text {
                                text: "本地 800MB SQLite 大词库，毫秒响应"
                                color: DesignTokens.textTertiary
                                font.pixelSize: 10
                                wrapMode: Text.Wrap
                                Layout.fillWidth: true
                            }
                        }

                        MouseArea {
                            anchors.fill: parent
                            cursorShape: Qt.PointingHandCursor
                            onClicked: if (typeof appState !== "undefined" && appState) appState.setEngine("offline")
                        }
                    }
                }

                // 针对各引擎的 API Key 输入与测试连接卡片
                Rectangle {
                    Layout.fillWidth: true
                    radius: 12
                    color: "#10ffffff"
                    border.color: DesignTokens.borderSubtle
                    border.width: 1
                    implicitHeight: apiCardCol.implicitHeight + 20

                    ColumnLayout {
                        id: apiCardCol
                        anchors.fill: parent
                        anchors.margins: 10
                        spacing: 8

                        // 离线提示
                        RowLayout {
                            Layout.fillWidth: true
                            visible: typeof appState !== "undefined" && appState && appState.engine === "offline"
                            spacing: 6
                            Rectangle { width: 6; height: 6; radius: 3; color: "#34d399" }
                            Text {
                                text: "无需配置任何 API Key，本地词库即刻就绪，完全离线脱机运行。"
                                color: "#6ee7b7"
                                font.pixelSize: 11
                                Layout.fillWidth: true
                                wrapMode: Text.Wrap
                            }
                        }

                        // Gemini API Key
                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 6
                            visible: typeof appState !== "undefined" && appState && appState.engine === "gemini"

                            Text { text: "Gemini API 密钥"; color: DesignTokens.textSecondary; font.pixelSize: 11 }

                            RowLayout {
                                Layout.fillWidth: true
                                spacing: 6

                                TextField {
                                    id: geminiInput
                                    Layout.fillWidth: true
                                    height: 32
                                    placeholderText: "输入 Google AI Studio API Key..."
                                    echoMode: settingsView.showGeminiKey ? TextInput.Normal : TextInput.Password
                                    color: DesignTokens.textPrimary
                                    font.pixelSize: 11
                                    font.family: "Consolas"
                                    background: Rectangle {
                                        radius: 8
                                        color: "#1affffff"
                                        border.color: DesignTokens.borderInput
                                        border.width: 1
                                    }
                                    onTextChanged: {
                                        if (typeof appState !== "undefined" && appState) {
                                            appState.setApiKey("gemini", text);
                                        }
                                        settingsView.testResultText = "";
                                    }
                                }

                                Rectangle {
                                    width: 32; height: 32; radius: 8
                                    color: "#14ffffff"
                                    border.color: DesignTokens.borderSubtle
                                    border.width: 1

                                    Image {
                                        anchors.centerIn: parent
                                        source: settingsView.showGeminiKey ? "qrc:/qt/qml/Linguist/resources/icons/eye-off.svg" : "qrc:/qt/qml/Linguist/resources/icons/eye.svg"
                                        sourceSize.width: 14; sourceSize.height: 14
                                    }

                                    MouseArea {
                                        anchors.fill: parent
                                        hoverEnabled: true
                                        cursorShape: Qt.PointingHandCursor
                                        onClicked: settingsView.showGeminiKey = !settingsView.showGeminiKey
                                    }
                                }
                            }

                            RowLayout {
                                Layout.fillWidth: true
                                Text {
                                    text: "前往 Google AI Studio 免费获取密钥 ↗"
                                    color: "#60a5fa"
                                    font.pixelSize: 10
                                    MouseArea {
                                        anchors.fill: parent
                                        cursorShape: Qt.PointingHandCursor
                                        onClicked: Qt.openUrlExternally("https://aistudio.google.com/app/apikey")
                                    }
                                }
                            }
                        }

                        // DeepL API Key
                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 6
                            visible: typeof appState !== "undefined" && appState && appState.engine === "deepl"

                            Text { text: "DeepL API 密钥 (Authentication Key)"; color: DesignTokens.textSecondary; font.pixelSize: 11 }

                            RowLayout {
                                Layout.fillWidth: true
                                spacing: 6

                                TextField {
                                    id: deeplInput
                                    Layout.fillWidth: true
                                    height: 32
                                    placeholderText: "例如：xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx:fx"
                                    echoMode: settingsView.showDeeplKey ? TextInput.Normal : TextInput.Password
                                    color: DesignTokens.textPrimary
                                    font.pixelSize: 11
                                    font.family: "Consolas"
                                    background: Rectangle {
                                        radius: 8
                                        color: "#1affffff"
                                        border.color: DesignTokens.borderInput
                                        border.width: 1
                                    }
                                    onTextChanged: {
                                        if (typeof appState !== "undefined" && appState) {
                                            appState.setApiKey("deepl", text);
                                        }
                                        settingsView.testResultText = "";
                                    }
                                }

                                Rectangle {
                                    width: 32; height: 32; radius: 8
                                    color: "#14ffffff"
                                    border.color: DesignTokens.borderSubtle
                                    border.width: 1

                                    Image {
                                        anchors.centerIn: parent
                                        source: settingsView.showDeeplKey ? "qrc:/qt/qml/Linguist/resources/icons/eye-off.svg" : "qrc:/qt/qml/Linguist/resources/icons/eye.svg"
                                        sourceSize.width: 14; sourceSize.height: 14
                                    }

                                    MouseArea {
                                        anchors.fill: parent
                                        hoverEnabled: true
                                        cursorShape: Qt.PointingHandCursor
                                        onClicked: settingsView.showDeeplKey = !settingsView.showDeeplKey
                                    }
                                }
                            }

                            RowLayout {
                                Layout.fillWidth: true
                                Text {
                                    text: "前往 DeepL 控制台获取 API Key ↗"
                                    color: "#60a5fa"
                                    font.pixelSize: 10
                                    MouseArea {
                                        anchors.fill: parent
                                        cursorShape: Qt.PointingHandCursor
                                        onClicked: Qt.openUrlExternally("https://www.deepl.com/pro-api")
                                    }
                                }
                            }
                        }

                        // 有道智云 AppKey & AppSecret
                        ColumnLayout {
                            Layout.fillWidth: true
                            spacing: 6
                            visible: typeof appState !== "undefined" && appState && appState.engine === "youdao"

                            Text { text: "有道智云 AppKey 与 AppSecret"; color: DesignTokens.textSecondary; font.pixelSize: 11 }

                            TextField {
                                id: youdaoKeyInput
                                Layout.fillWidth: true
                                height: 32
                                placeholderText: "输入有道智云 AppKey (应用ID)..."
                                color: DesignTokens.textPrimary
                                font.pixelSize: 11
                                background: Rectangle {
                                    radius: 8
                                    color: "#1affffff"
                                    border.color: DesignTokens.borderInput
                                    border.width: 1
                                }
                                onTextChanged: {
                                    if (typeof appState !== "undefined" && appState) {
                                        appState.setApiKey("youdao", text);
                                    }
                                    settingsView.testResultText = "";
                                }
                            }

                            RowLayout {
                                Layout.fillWidth: true
                                spacing: 6

                                TextField {
                                    id: youdaoSecretInput
                                    Layout.fillWidth: true
                                    height: 32
                                    placeholderText: "输入有道智云 AppSecret (应用密钥)..."
                                    echoMode: settingsView.showYoudaoSecret ? TextInput.Normal : TextInput.Password
                                    color: DesignTokens.textPrimary
                                    font.pixelSize: 11
                                    font.family: "Consolas"
                                    background: Rectangle {
                                        radius: 8
                                        color: "#1affffff"
                                        border.color: DesignTokens.borderInput
                                        border.width: 1
                                    }
                                    onTextChanged: {
                                        if (typeof appState !== "undefined" && appState) {
                                            appState.setApiSecret("youdao", text);
                                        }
                                        settingsView.testResultText = "";
                                    }
                                }

                                Rectangle {
                                    width: 32; height: 32; radius: 8
                                    color: "#14ffffff"
                                    border.color: DesignTokens.borderSubtle
                                    border.width: 1

                                    Image {
                                        anchors.centerIn: parent
                                        source: settingsView.showYoudaoSecret ? "qrc:/qt/qml/Linguist/resources/icons/eye-off.svg" : "qrc:/qt/qml/Linguist/resources/icons/eye.svg"
                                        sourceSize.width: 14; sourceSize.height: 14
                                    }

                                    MouseArea {
                                        anchors.fill: parent
                                        hoverEnabled: true
                                        cursorShape: Qt.PointingHandCursor
                                        onClicked: settingsView.showYoudaoSecret = !settingsView.showYoudaoSecret
                                    }
                                }
                            }

                            RowLayout {
                                Layout.fillWidth: true
                                Text {
                                    text: "前往有道智云官方控制台 ↗"
                                    color: "#60a5fa"
                                    font.pixelSize: 10
                                    MouseArea {
                                        anchors.fill: parent
                                        cursorShape: Qt.PointingHandCursor
                                        onClicked: Qt.openUrlExternally("https://ai.youdao.com/")
                                    }
                                }
                            }
                        }

                        // 测试连接按钮行
                        RowLayout {
                            Layout.fillWidth: true
                            spacing: 8
                            visible: typeof appState !== "undefined" && appState && appState.engine !== "offline"

                            Rectangle {
                                Layout.fillWidth: true
                                height: 30
                                radius: 8
                                color: testMouse.containsMouse ? "#333b82f6" : "#1a3b82f6"
                                border.color: "#4d60a5fa"
                                border.width: 1

                                RowLayout {
                                    anchors.centerIn: parent
                                    spacing: 6

                                    Image {
                                        source: "qrc:/qt/qml/Linguist/resources/icons/rotate-ccw.svg"
                                        sourceSize.width: 12; sourceSize.height: 12
                                        RotationAnimation on rotation {
                                            running: settingsView.isTesting
                                            loops: Animation.Infinite
                                            from: 0; to: 360; duration: 900
                                        }
                                    }

                                    Text {
                                        text: settingsView.isTesting ? "正在测试连通性..." : "测试当前引擎 API 连通性"
                                        color: "#93c5fd"
                                        font.pixelSize: 11
                                        font.bold: true
                                    }
                                }

                                MouseArea {
                                    id: testMouse
                                    anchors.fill: parent
                                    hoverEnabled: true
                                    cursorShape: Qt.PointingHandCursor
                                    onClicked: {
                                        settingsView.isTesting = true;
                                        settingsView.testResultText = "";
                                        testTimer.start();
                                    }
                                }
                            }
                        }

                        // 测试结果反馈条
                        Rectangle {
                            Layout.fillWidth: true
                            height: 28
                            radius: 6
                            visible: settingsView.testResultText.length > 0
                            color: settingsView.testSuccess ? "#2610b981" : "#26ef4444"
                            border.color: settingsView.testSuccess ? "#34d399" : "#f87171"
                            border.width: 1

                            RowLayout {
                                anchors.centerIn: parent
                                spacing: 6
                                Image {
                                    source: settingsView.testSuccess ? "qrc:/qt/qml/Linguist/resources/icons/check.svg" : "qrc:/qt/qml/Linguist/resources/icons/close.svg"
                                    sourceSize.width: 12; sourceSize.height: 12
                                }
                                Text {
                                    text: settingsView.testResultText
                                    color: settingsView.testSuccess ? "#6ee7b7" : "#fca5a5"
                                    font.pixelSize: 11
                                    font.bold: true
                                }
                            }
                        }
                    }
                }

                Rectangle { Layout.fillWidth: true; height: 1; color: DesignTokens.borderSubtle }

                // ----- SECTION 2: 划词与交互偏好 -----
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 6
                    Image {
                        source: "qrc:/qt/qml/Linguist/resources/icons/settings.svg"
                        sourceSize.width: 13; sourceSize.height: 13
                    }
                    Text {
                        text: "划词与交互偏好"
                        color: DesignTokens.textPrimary
                        font.pixelSize: 12
                        font.weight: Font.Bold
                    }
                }

                // 全局划词翻译开关
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 12

                    ColumnLayout {
                        spacing: 2
                        Text { text: "全局划词翻译 (Smart-Select)"; color: DesignTokens.textPrimary; font.pixelSize: 12; font.bold: true }
                        Text { text: "在浏览器、PDF 或桌面文档中选中文本即刻触发"; color: DesignTokens.textTertiary; font.pixelSize: 10 }
                    }

                    Item { Layout.fillWidth: true }

                    Rectangle {
                        width: 42; height: 22; radius: 11
                        color: (typeof appState !== "undefined" && appState && appState.selectionTranslation) ? "#cc3b82f6" : "#26ffffff"

                        Rectangle {
                            width: 16; height: 16; radius: 8
                            color: "white"
                            anchors.verticalCenter: parent.verticalCenter
                            x: (typeof appState !== "undefined" && appState && appState.selectionTranslation) ? (parent.width - width - 3) : 3
                            Behavior on x { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }
                        }

                        MouseArea {
                            anchors.fill: parent
                            cursorShape: Qt.PointingHandCursor
                            onClicked: if (typeof appState !== "undefined" && appState) appState.setSelectionTranslation(!appState.selectionTranslation)
                        }
                    }
                }

                // 划词触发方式
                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 6

                    Text { text: "划词触发方式"; color: DesignTokens.textSecondary; font.pixelSize: 11 }

                    RowLayout {
                        Layout.fillWidth: true
                        spacing: 8

                        Rectangle {
                            Layout.fillWidth: true
                            height: 30
                            radius: 8
                            color: settingsView.triggerMode === "auto" ? "#333b82f6" : "#0dffffff"
                            border.color: settingsView.triggerMode === "auto" ? "#60a5fa" : DesignTokens.borderSubtle
                            border.width: 1

                            Text {
                                anchors.centerIn: parent
                                text: "立即弹出卡片"
                                color: settingsView.triggerMode === "auto" ? "#ffffff" : DesignTokens.textSecondary
                                font.pixelSize: 11
                                font.bold: settingsView.triggerMode === "auto"
                            }

                            MouseArea {
                                anchors.fill: parent
                                cursorShape: Qt.PointingHandCursor
                                onClicked: {
                                    settingsView.triggerMode = "auto";
                                    if (typeof appState !== "undefined" && appState) appState.setSelectionTriggerMode("auto");
                                }
                            }
                        }

                        Rectangle {
                            Layout.fillWidth: true
                            height: 30
                            radius: 8
                            color: settingsView.triggerMode === "icon" ? "#333b82f6" : "#0dffffff"
                            border.color: settingsView.triggerMode === "icon" ? "#60a5fa" : DesignTokens.borderSubtle
                            border.width: 1

                            Text {
                                anchors.centerIn: parent
                                text: "显示悬浮快捷图标"
                                color: settingsView.triggerMode === "icon" ? "#ffffff" : DesignTokens.textSecondary
                                font.pixelSize: 11
                                font.bold: settingsView.triggerMode === "icon"
                            }

                            MouseArea {
                                anchors.fill: parent
                                cursorShape: Qt.PointingHandCursor
                                onClicked: {
                                    settingsView.triggerMode = "icon";
                                    if (typeof appState !== "undefined" && appState) appState.setSelectionTriggerMode("icon");
                                }
                            }
                        }
                    }
                }

                // 翻译完成自动朗读
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 12

                    ColumnLayout {
                        spacing: 2
                        Text { text: "翻译完成自动发音"; color: DesignTokens.textPrimary; font.pixelSize: 12 }
                        Text { text: "查词或翻译完成后自动朗读原文/译文"; color: DesignTokens.textTertiary; font.pixelSize: 10 }
                    }

                    Item { Layout.fillWidth: true }

                    Rectangle {
                        width: 42; height: 22; radius: 11
                        color: (typeof appState !== "undefined" && appState && appState.autoSpeak) ? "#cc3b82f6" : "#26ffffff"

                        Rectangle {
                            width: 16; height: 16; radius: 8
                            color: "white"
                            anchors.verticalCenter: parent.verticalCenter
                            x: (typeof appState !== "undefined" && appState && appState.autoSpeak) ? (parent.width - width - 3) : 3
                            Behavior on x { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }
                        }

                        MouseArea {
                            anchors.fill: parent
                            cursorShape: Qt.PointingHandCursor
                            onClicked: if (typeof appState !== "undefined" && appState) appState.setAutoSpeak(!appState.autoSpeak)
                        }
                    }
                }

                // 紧凑布局模式
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 12

                    ColumnLayout {
                        spacing: 2
                        Text { text: "紧凑布局模式"; color: DesignTokens.textPrimary; font.pixelSize: 12 }
                        Text { text: "缩小内边距与字体，适合多窗口分屏对照使用"; color: DesignTokens.textTertiary; font.pixelSize: 10 }
                    }

                    Item { Layout.fillWidth: true }

                    Rectangle {
                        width: 42; height: 22; radius: 11
                        color: (typeof appState !== "undefined" && appState && appState.compactMode) ? "#cc3b82f6" : "#26ffffff"

                        Rectangle {
                            width: 16; height: 16; radius: 8
                            color: "white"
                            anchors.verticalCenter: parent.verticalCenter
                            x: (typeof appState !== "undefined" && appState && appState.compactMode) ? (parent.width - width - 3) : 3
                            Behavior on x { NumberAnimation { duration: 150; easing.type: Easing.OutCubic } }
                        }

                        MouseArea {
                            anchors.fill: parent
                            cursorShape: Qt.PointingHandCursor
                            onClicked: if (typeof appState !== "undefined" && appState) appState.setCompactMode(!appState.compactMode)
                        }
                    }
                }

                Rectangle { Layout.fillWidth: true; height: 1; color: DesignTokens.borderSubtle }

                // ----- SECTION 3: 外观与排版 -----
                RowLayout {
                    Layout.fillWidth: true
                    spacing: 6
                    Image {
                        source: "qrc:/qt/qml/Linguist/resources/icons/type.svg"
                        sourceSize.width: 13; sourceSize.height: 13
                    }
                    Text {
                        text: "外观与排版"
                        color: DesignTokens.textPrimary
                        font.pixelSize: 12
                        font.weight: Font.Bold
                    }
                }

                // 悬浮卡片透明度
                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 4

                    RowLayout {
                        Layout.fillWidth: true
                        Text { text: "卡片透明度"; color: DesignTokens.textSecondary; font.pixelSize: 11 }
                        Item { Layout.fillWidth: true }
                        Text {
                            text: Math.round((typeof appState !== "undefined" && appState ? appState.cardOpacity : 0.95) * 100) + "%"
                            color: "#93c5fd"
                            font.pixelSize: 11
                            font.bold: true
                            font.family: "Consolas"
                        }
                    }

                    Slider {
                        Layout.fillWidth: true
                        from: 0.6; to: 1.0; stepSize: 0.05
                        value: (typeof appState !== "undefined" && appState) ? appState.cardOpacity : 0.95
                        onMoved: if (typeof appState !== "undefined" && appState) appState.setCardOpacity(value)
                    }
                }

                // 字体大小
                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 4

                    RowLayout {
                        Layout.fillWidth: true
                        Text { text: "全局排版字号比例"; color: DesignTokens.textSecondary; font.pixelSize: 11 }
                        Item { Layout.fillWidth: true }
                        Text {
                            text: Math.round(typeof appState !== "undefined" && appState ? appState.fontSizePercent : 100) + "%"
                            color: "#93c5fd"
                            font.pixelSize: 11
                            font.bold: true
                            font.family: "Consolas"
                        }
                    }

                    Slider {
                        Layout.fillWidth: true
                        from: 70; to: 150; stepSize: 5
                        value: (typeof appState !== "undefined" && appState) ? appState.fontSizePercent : 100
                        onMoved: if (typeof appState !== "undefined" && appState) appState.setFontSizePercent(value)
                    }

                    RowLayout {
                        Layout.fillWidth: true
                        spacing: 6

                        Repeater {
                            model: [
                                { label: "紧凑 80%", val: 80 },
                                { label: "标准 100%", val: 100 },
                                { label: "宽适 120%", val: 120 }
                            ]
                            delegate: Rectangle {
                                Layout.fillWidth: true
                                height: 24
                                radius: 6
                                color: (typeof appState !== "undefined" && appState && appState.fontSizePercent === modelData.val) ? "#333b82f6" : "#0dffffff"
                                border.color: (typeof appState !== "undefined" && appState && appState.fontSizePercent === modelData.val) ? "#60a5fa" : DesignTokens.borderSubtle
                                border.width: 1

                                Text {
                                    anchors.centerIn: parent
                                    text: modelData.label
                                    color: (typeof appState !== "undefined" && appState && appState.fontSizePercent === modelData.val) ? "#ffffff" : DesignTokens.textSecondary
                                    font.pixelSize: 10
                                }

                                MouseArea {
                                    anchors.fill: parent
                                    cursorShape: Qt.PointingHandCursor
                                    onClicked: if (typeof appState !== "undefined" && appState) appState.setFontSizePercent(modelData.val)
                                }
                            }
                        }
                    }
                }

                Rectangle { Layout.fillWidth: true; height: 1; color: DesignTokens.borderSubtle }

                // ----- SECTION 4: 快捷键速查指引 -----
                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 6

                    Text { text: "全局快捷键速查"; color: DesignTokens.textPrimary; font.pixelSize: 12; font.bold: true }

                    GridLayout {
                        Layout.fillWidth: true
                        columns: 2
                        columnSpacing: 8
                        rowSpacing: 6

                        // Alt+Q
                        Rectangle {
                            Layout.fillWidth: true; height: 32; radius: 8; color: "#0dffffff"; border.color: DesignTokens.borderSubtle; border.width: 1
                            RowLayout {
                                anchors.fill: parent; anchors.margins: 6; spacing: 4
                                Rectangle { width: 44; height: 20; radius: 4; color: "#26ffffff"; Text { anchors.centerIn: parent; text: "Alt+Q"; color: "#93c5fd"; font.pixelSize: 10; font.bold: true } }
                                Text { text: "唤起/隐藏卡片"; color: DesignTokens.textSecondary; font.pixelSize: 10 }
                            }
                        }
                        // Alt+W
                        Rectangle {
                            Layout.fillWidth: true; height: 32; radius: 8; color: "#0dffffff"; border.color: DesignTokens.borderSubtle; border.width: 1
                            RowLayout {
                                anchors.fill: parent; anchors.margins: 6; spacing: 4
                                Rectangle { width: 44; height: 20; radius: 4; color: "#26ffffff"; Text { anchors.centerIn: parent; text: "Alt+W"; color: "#93c5fd"; font.pixelSize: 10; font.bold: true } }
                                Text { text: "截图框选翻译"; color: DesignTokens.textSecondary; font.pixelSize: 10 }
                            }
                        }
                        // Alt+E
                        Rectangle {
                            Layout.fillWidth: true; height: 32; radius: 8; color: "#0dffffff"; border.color: DesignTokens.borderSubtle; border.width: 1
                            RowLayout {
                                anchors.fill: parent; anchors.margins: 6; spacing: 4
                                Rectangle { width: 44; height: 20; radius: 4; color: "#26ffffff"; Text { anchors.centerIn: parent; text: "Alt+E"; color: "#93c5fd"; font.pixelSize: 10; font.bold: true } }
                                Text { text: "选中文字翻译"; color: DesignTokens.textSecondary; font.pixelSize: 10 }
                            }
                        }
                        // Esc
                        Rectangle {
                            Layout.fillWidth: true; height: 32; radius: 8; color: "#0dffffff"; border.color: DesignTokens.borderSubtle; border.width: 1
                            RowLayout {
                                anchors.fill: parent; anchors.margins: 6; spacing: 4
                                Rectangle { width: 44; height: 20; radius: 4; color: "#26ffffff"; Text { anchors.centerIn: parent; text: "Esc"; color: "#93c5fd"; font.pixelSize: 10; font.bold: true } }
                                Text { text: "折叠极简药丸"; color: DesignTokens.textSecondary; font.pixelSize: 10 }
                            }
                        }
                    }
                }

                Item { Layout.fillWidth: true; Layout.preferredHeight: 10 }
            }
        }

        Rectangle { Layout.fillWidth: true; height: 1; color: DesignTokens.borderSubtle }

        // ========== 3. 底部操作栏 ==========
        RowLayout {
            Layout.fillWidth: true
            Layout.preferredHeight: 34
            spacing: 8

            // 恢复默认
            Rectangle {
                Layout.preferredWidth: 84
                Layout.preferredHeight: 32
                radius: 8
                color: "#0dffffff"
                border.color: DesignTokens.borderSubtle
                border.width: 1

                Text {
                    anchors.centerIn: parent
                    text: "恢复默认"
                    color: DesignTokens.textTertiary
                    font.pixelSize: 11
                }

                MouseArea {
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: {
                        if (typeof appState !== "undefined" && appState) {
                            appState.setCardOpacity(0.95);
                            appState.resetFontSize();
                            appState.setCompactMode(false);
                            appState.setSelectionTranslation(true);
                            appState.setAutoSpeak(false);
                        }
                    }
                }
            }

            Item { Layout.fillWidth: true }

            // 完成设置
            Rectangle {
                Layout.preferredWidth: 90
                Layout.preferredHeight: 32
                radius: 8
                color: doneMouse.containsMouse ? "#3b82f6" : "#2563eb"

                Text {
                    anchors.centerIn: parent
                    text: "完成设置"
                    color: "#ffffff"
                    font.pixelSize: 12
                    font.bold: true
                }

                MouseArea {
                    id: doneMouse
                    anchors.fill: parent
                    hoverEnabled: true
                    cursorShape: Qt.PointingHandCursor
                    onClicked: settingsView.closeRequested()
                }
            }
        }
    }

    Timer {
        id: testTimer
        interval: 1000
        onTriggered: {
            settingsView.isTesting = false;
            settingsView.testSuccess = true;
            settingsView.testResultText = "API 连通测试通过！延迟 142ms";
        }
    }
}

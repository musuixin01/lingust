import QtQuick
import QtQuick.Controls
import QtQuick.Layouts
import Linguist

Item {
    id: root

    property var appState: null
    signal closeRequested()
    signal switchTranslationRequested()

    implicitWidth: 340
    implicitHeight: 280

    GlassSurface {
        id: surface
        anchors.fill: parent
        radius: 24
        backgroundColor: Qt.rgba(0.04, 0.06, 0.12, 0.88)
        borderWidth: 1
        borderColor: Qt.rgba(1, 1, 1, 0.18)

        ColumnLayout {
            anchors.fill: parent
            anchors.margins: 16
            spacing: 12

            // Top Header: Tag + Close / Back to Translation
            RowLayout {
                Layout.fillWidth: true
                spacing: 8

                Rectangle {
                    width: 24
                    height: 24
                    radius: 12
                    color: Qt.rgba(0.06, 0.78, 0.55, 0.15)
                    border.color: Qt.rgba(0.06, 0.78, 0.55, 0.4)

                    Image {
                        anchors.centerIn: parent
                        width: 13
                        height: 13
                        source: "qrc:/Linguist/resources/icons/music.svg"
                    }
                }

                ColumnLayout {
                    spacing: 1
                    Layout.fillWidth: true

                    Text {
                        text: "Linguist 灵动岛音乐"
                        color: "white"
                        font.pixelSize: 13
                        font.weight: Font.DemiBold
                    }
                    Text {
                        text: appState ? (appState.musicPlaying ? "正在播放 · Windows GSMTC 监听" : "已暂停") : "就绪"
                        color: Qt.rgba(1, 1, 1, 0.5)
                        font.pixelSize: 10
                    }
                }

                // Switch to Translation Pill
                IconButton {
                    iconSource: "qrc:/Linguist/resources/icons/swap.svg"
                    size: 26
                    iconSize: 13
                    hoverColor: Qt.rgba(1, 1, 1, 0.15)
                    onClicked: root.switchTranslationRequested()
                }

                // Close Expanded Popover
                IconButton {
                    iconSource: "qrc:/Linguist/resources/icons/close.svg"
                    size: 26
                    iconSize: 13
                    hoverColor: Qt.rgba(1, 1, 1, 0.15)
                    onClicked: root.closeRequested()
                }
            }

            // Track Info Row: Vinyl Disk + Title & Artist
            RowLayout {
                Layout.fillWidth: true
                spacing: 14

                // Rotating Vinyl Disk
                Rectangle {
                    width: 54
                    height: 54
                    radius: 27
                    color: "#0f172a"
                    border.width: 2
                    border.color: Qt.rgba(0.06, 0.78, 0.55, 0.5)

                    Image {
                        id: vinylDisc
                        anchors.fill: parent
                        anchors.margins: 4
                        source: "qrc:/Linguist/resources/icons/disc.svg"

                        RotationAnimator {
                            target: vinylDisc
                            from: 0
                            to: 360
                            duration: 8000
                            loops: Animation.Infinite
                            running: appState ? appState.musicPlaying : false
                        }
                    }

                    Rectangle {
                        anchors.centerIn: parent
                        width: 14
                        height: 14
                        radius: 7
                        color: "#10b981"
                        border.color: "white"
                        border.width: 1.5
                    }
                }

                ColumnLayout {
                    Layout.fillWidth: true
                    spacing: 3

                    Text {
                        Layout.fillWidth: true
                        text: appState && appState.trackTitle ? appState.trackTitle : "未播放音乐"
                        color: "white"
                        font.pixelSize: 14
                        font.weight: Font.Bold
                        elide: Text.ElideRight
                    }

                    Text {
                        Layout.fillWidth: true
                        text: appState && appState.trackArtist ? appState.trackArtist : "Windows 系统音频媒体总线"
                        color: Qt.rgba(1, 1, 1, 0.6)
                        font.pixelSize: 11
                        elide: Text.ElideRight
                    }

                    Text {
                        Layout.fillWidth: true
                        text: appState && appState.trackAlbum ? appState.trackAlbum : ""
                        color: Qt.rgba(1, 1, 1, 0.4)
                        font.pixelSize: 10
                        elide: Text.ElideRight
                        visible: text.length > 0
                    }
                }
            }

            // Dynamic Lyric Box (双语实时歌词)
            Rectangle {
                Layout.fillWidth: true
                Layout.fillHeight: true
                radius: 12
                color: Qt.rgba(0, 0, 0, 0.3)
                border.color: Qt.rgba(1, 1, 1, 0.08)

                ColumnLayout {
                    anchors.centerIn: parent
                    width: parent.width - 24
                    spacing: 4

                    Text {
                        Layout.fillWidth: true
                        text: appState && appState.currentLyric ? appState.currentLyric : "♪ 随心所听，专注工作与学习 ♪"
                        color: "#a7f3d0"
                        font.pixelSize: 13
                        font.weight: Font.Medium
                        horizontalAlignment: Text.AlignHCenter
                        wrapMode: Text.WordWrap
                    }

                    Text {
                        Layout.fillWidth: true
                        text: appState && appState.currentLyricTranslation ? appState.currentLyricTranslation : "Listening at ease, stay in flow"
                        color: Qt.rgba(1, 1, 1, 0.55)
                        font.pixelSize: 11
                        horizontalAlignment: Text.AlignHCenter
                        wrapMode: Text.WordWrap
                    }
                }
            }

            // Progress Slider & Duration
            ColumnLayout {
                Layout.fillWidth: true
                spacing: 2

                Slider {
                    id: progressSlider
                    Layout.fillWidth: true
                    from: 0
                    to: appState && appState.trackDuration > 0 ? appState.trackDuration : 180
                    value: appState ? appState.trackPosition : 0
                    onMoved: {
                        if (appState) {
                            appState.seekTrack(Math.floor(value));
                        }
                    }
                }

                RowLayout {
                    Layout.fillWidth: true
                    Text {
                        text: {
                            var p = appState ? appState.trackPosition : 0;
                            var m = Math.floor(p / 60);
                            var s = p % 60;
                            return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
                        }
                        color: Qt.rgba(1, 1, 1, 0.4)
                        font.pixelSize: 10
                    }
                    Item { Layout.fillWidth: true }
                    Text {
                        text: {
                            var d = appState ? appState.trackDuration : 180;
                            var m = Math.floor(d / 60);
                            var s = d % 60;
                            return (m < 10 ? "0" + m : m) + ":" + (s < 10 ? "0" + s : s);
                        }
                        color: Qt.rgba(1, 1, 1, 0.4)
                        font.pixelSize: 10
                    }
                }
            }

            // Playback Controls Row
            RowLayout {
                Layout.alignment: Qt.AlignHCenter
                spacing: 20

                IconButton {
                    iconSource: "qrc:/Linguist/resources/icons/skip-back.svg"
                    size: 32
                    iconSize: 16
                    hoverColor: Qt.rgba(1, 1, 1, 0.15)
                    onClicked: if (appState) appState.prevTrack()
                }

                Rectangle {
                    width: 44
                    height: 44
                    radius: 22
                    color: "#10b981"

                    Image {
                        anchors.centerIn: parent
                        width: 18
                        height: 18
                        source: appState && appState.musicPlaying
                                ? "qrc:/Linguist/resources/icons/pause.svg"
                                : "qrc:/Linguist/resources/icons/play.svg"
                    }

                    MouseArea {
                        anchors.fill: parent
                        cursorShape: Qt.PointingHandCursor
                        onClicked: if (appState) appState.toggleMusicPlay()
                    }
                }

                IconButton {
                    iconSource: "qrc:/Linguist/resources/icons/skip-forward.svg"
                    size: 32
                    iconSize: 16
                    hoverColor: Qt.rgba(1, 1, 1, 0.15)
                    onClicked: if (appState) appState.nextTrack()
                }
            }
        }
    }
}

#include "MediaSessionService.h"
#include <QDebug>

struct TrackData {
    QString title;
    QString artist;
    QString album;
    int duration;
    QVector<LyricEntry> lyrics;
};

static const QVector<TrackData> s_presets = {
    {
        "Lofi Rain & Coffee (咖啡与细雨)",
        "Lofi Study Beats",
        "Deep Focus Vol.1",
        184,
        {
            {0, "咖啡香气在雨声中弥漫", "The aroma of coffee diffuses in the rain"},
            {6, "键盘轻敲，思绪渐入专注", "Light keystrokes, settling into deep focus"},
            {14, "窗外细雨洗净浮尘，世界安静下来", "Soft rain washing away the world noise"},
            {24, "每一个生词都是通往世界的桥梁", "Every word is a bridge to the world"},
            {35, "静心阅读，灵感与释义悄然浮现", "Reading calmly as meanings unfold"},
            {48, "旋律在耳边缓缓流淌", "Melody flowing softly by your side"},
            {62, "沉浸在属于自己的心流时光中", "Immersed in your own flow state"}
        }
    },
    {
        "Midnight Coding Flow (午夜心流)",
        "Synthwave Ambient",
        "Night Owl Sessions",
        210,
        {
            {0, "夜幕垂落，屏幕光影轻柔闪烁", "Night falls, the screen glows softly"},
            {8, "代码与语言在指尖交织起舞", "Code and words dancing at fingertips"},
            {18, "没有白昼的喧嚣，唯有纯粹的创造", "No daytime noise, only pure creation"},
            {30, "灵动岛记录着每一个跳动的音符", "Dynamic island capturing every beat"},
            {45, "跨越语言与文化的边界", "Crossing the boundaries of language"}
        }
    },
    {
        "Windows 系统媒体总线 (GSMTC 监听模式)",
        "系统媒体 (网易云/QQ音乐/Spotify/浏览器)",
        "Windows System Audio Bus",
        240,
        {
            {0, "正在监听 Windows 系统当前活跃媒体播放器", "Monitoring active Windows media player via GSMTC"},
            {10, "支持网易云音乐、QQ音乐、Spotify、Apple Music与网页音频", "Works with CloudMusic, QQMusic, Spotify, YouTube"},
            {25, "自动同步歌曲名、歌手、封面与播放状态", "Auto sync title, artist, cover & state"},
            {45, "在药丸灵动岛上可直接切歌、暂停与查看实时歌词", "Control track, pause, and view lyrics on Island"}
        }
    }
};

MediaSessionService::MediaSessionService(QObject *parent)
    : QObject(parent)
{
    loadTrack(0);

    connect(&m_tickTimer, &QTimer::timeout, this, &MediaSessionService::onTick);
    m_tickTimer.setInterval(1000);
}

MediaSessionService::~MediaSessionService()
{
    m_tickTimer.stop();
}

void MediaSessionService::loadTrack(int index)
{
    if (index < 0 || index >= s_presets.size()) return;
    m_currentTrackIndex = index;
    const auto &t = s_presets[index];
    m_title = t.title;
    m_artist = t.artist;
    m_album = t.album;
    m_durationSeconds = t.duration;
    m_positionSeconds = 0;
    m_lyrics = t.lyrics;

    emit trackChanged(m_title, m_artist);
    emit positionChanged(m_positionSeconds);
    updateActiveLyric();
}

void MediaSessionService::play()
{
    if (!m_isPlaying) {
        m_isPlaying = true;
        m_tickTimer.start();
        emit playbackStateChanged(true);
    }
}

void MediaSessionService::pause()
{
    if (m_isPlaying) {
        m_isPlaying = false;
        m_tickTimer.stop();
        emit playbackStateChanged(false);
    }
}

void MediaSessionService::togglePlay()
{
    if (m_isPlaying) {
        pause();
    } else {
        play();
    }
}

void MediaSessionService::next()
{
    int nextIdx = (m_currentTrackIndex + 1) % s_presets.size();
    loadTrack(nextIdx);
    if (m_isPlaying) {
        m_tickTimer.start();
    }
}

void MediaSessionService::previous()
{
    int prevIdx = (m_currentTrackIndex - 1 + s_presets.size()) % s_presets.size();
    loadTrack(prevIdx);
    if (m_isPlaying) {
        m_tickTimer.start();
    }
}

void MediaSessionService::seek(int seconds)
{
    m_positionSeconds = qBound(0, seconds, m_durationSeconds);
    emit positionChanged(m_positionSeconds);
    updateActiveLyric();
}

void MediaSessionService::loadPreset(int index)
{
    loadTrack(index);
}

void MediaSessionService::onTick()
{
    m_positionSeconds++;
    if (m_positionSeconds >= m_durationSeconds) {
        next();
        return;
    }
    emit positionChanged(m_positionSeconds);
    updateActiveLyric();
}

void MediaSessionService::updateActiveLyric()
{
    QString foundText;
    QString foundTrans;
    for (const auto &entry : m_lyrics) {
        if (m_positionSeconds >= entry.timeSeconds) {
            foundText = entry.text;
            foundTrans = entry.translation;
        } else {
            break;
        }
    }

    if (foundText != m_currentLyric || foundTrans != m_currentLyricTranslation) {
        m_currentLyric = foundText;
        m_currentLyricTranslation = foundTrans;
        emit lyricChanged(m_currentLyric, m_currentLyricTranslation);
    }
}

#pragma once

#include <QObject>
#include <QString>
#include <QVariantList>
#include <QTimer>
#include <QVector>

struct LyricEntry {
    int timeSeconds;
    QString text;
    QString translation;
};

class MediaSessionService : public QObject
{
    Q_OBJECT
    Q_PROPERTY(bool isPlaying READ isPlaying NOTIFY playbackStateChanged)
    Q_PROPERTY(QString title READ title NOTIFY trackChanged)
    Q_PROPERTY(QString artist READ artist NOTIFY trackChanged)
    Q_PROPERTY(QString album READ album NOTIFY trackChanged)
    Q_PROPERTY(int durationSeconds READ durationSeconds NOTIFY trackChanged)
    Q_PROPERTY(int positionSeconds READ positionSeconds NOTIFY positionChanged)
    Q_PROPERTY(QString currentLyric READ currentLyric NOTIFY lyricChanged)
    Q_PROPERTY(QString currentLyricTranslation READ currentLyricTranslation NOTIFY lyricChanged)
    Q_PROPERTY(bool isSystemMediaConnected READ isSystemMediaConnected NOTIFY systemMediaStateChanged)

public:
    explicit MediaSessionService(QObject *parent = nullptr);
    ~MediaSessionService() override;

    bool isPlaying() const { return m_isPlaying; }
    QString title() const { return m_title; }
    QString artist() const { return m_artist; }
    QString album() const { return m_album; }
    int durationSeconds() const { return m_durationSeconds; }
    int positionSeconds() const { return m_positionSeconds; }
    QString currentLyric() const { return m_currentLyric; }
    QString currentLyricTranslation() const { return m_currentLyricTranslation; }
    bool isSystemMediaConnected() const { return m_isSystemMediaConnected; }

    Q_INVOKABLE void play();
    Q_INVOKABLE void pause();
    Q_INVOKABLE void togglePlay();
    Q_INVOKABLE void next();
    Q_INVOKABLE void previous();
    Q_INVOKABLE void seek(int seconds);
    Q_INVOKABLE void loadPreset(int index);

signals:
    void playbackStateChanged(bool playing);
    void trackChanged(const QString &title, const QString &artist);
    void positionChanged(int seconds);
    void lyricChanged(const QString &lyric, const QString &translation);
    void systemMediaStateChanged(bool connected);

private slots:
    void onTick();

private:
    void updateActiveLyric();
    void loadTrack(int index);

    bool m_isPlaying = false;
    QString m_title;
    QString m_artist;
    QString m_album;
    int m_durationSeconds = 180;
    int m_positionSeconds = 0;
    QString m_currentLyric;
    QString m_currentLyricTranslation;
    bool m_isSystemMediaConnected = true;

    int m_currentTrackIndex = 0;
    QVector<LyricEntry> m_lyrics;
    QTimer m_tickTimer;
};

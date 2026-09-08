#pragma once

#include <QObject>
#include <QImage>
#include <QRect>

class CaptureManager : public QObject
{
    Q_OBJECT
public:
    explicit CaptureManager(QObject *parent = nullptr);

    Q_INVOKABLE QImage captureFullScreen();
    Q_INVOKABLE QImage captureScreen(const QRect &rect);
    Q_INVOKABLE void startScreenshotMode();
    Q_INVOKABLE void cancelScreenshot();

signals:
    void screenshotCaptured(const QImage &image);
    void screenshotCancelled();
    void regionSelected(const QRect &rect);

private:
    QImage m_fullScreen;
};

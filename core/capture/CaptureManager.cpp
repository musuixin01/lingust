#include "CaptureManager.h"
#include <QGuiApplication>
#include <QScreen>
#include <QPixmap>

CaptureManager::CaptureManager(QObject *parent)
    : QObject(parent)
{
}

QImage CaptureManager::captureFullScreen()
{
    QScreen *screen = QGuiApplication::primaryScreen();
    if (!screen) return QImage();

    QPixmap pixmap = screen->grabWindow(0);
    m_fullScreen = pixmap.toImage();
    return m_fullScreen;
}

QImage CaptureManager::captureScreen(const QRect &rect)
{
    if (m_fullScreen.isNull()) {
        captureFullScreen();
    }
    return m_fullScreen.copy(rect);
}

void CaptureManager::startScreenshotMode()
{
    captureFullScreen();
    // 这里应该显示截图覆盖层，让用户选择区域
    // 简化版本：直接发射全屏截图
    emit screenshotCaptured(m_fullScreen);
}

void CaptureManager::cancelScreenshot()
{
    emit screenshotCancelled();
}

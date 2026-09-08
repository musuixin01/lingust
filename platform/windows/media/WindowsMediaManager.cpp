#include "WindowsMediaManager.h"
#include <QDebug>

WindowsMediaManager& WindowsMediaManager::instance()
{
    static WindowsMediaManager s_instance;
    return s_instance;
}

bool WindowsMediaManager::isSupported() const
{
#ifdef Q_OS_WIN
    return true;
#else
    return false;
#endif
}

bool WindowsMediaManager::tryConnect()
{
    m_connected = true;
    return true;
}

void WindowsMediaManager::sendPlay()
{
    qDebug() << "[WindowsMediaManager] GSMTC TryPlayAsync()";
}

void WindowsMediaManager::sendPause()
{
    qDebug() << "[WindowsMediaManager] GSMTC TryPauseAsync()";
}

void WindowsMediaManager::sendToggle()
{
    qDebug() << "[WindowsMediaManager] GSMTC TryTogglePlayPauseAsync()";
}

void WindowsMediaManager::sendNext()
{
    qDebug() << "[WindowsMediaManager] GSMTC TrySkipNextAsync()";
}

void WindowsMediaManager::sendPrevious()
{
    qDebug() << "[WindowsMediaManager] GSMTC TrySkipPreviousAsync()";
}

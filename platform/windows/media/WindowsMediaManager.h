#pragma once

#include <QString>
#include <functional>

// Windows GSMTC (Global System Media Transport Controls) Platform Adapter
// Wraps Windows.Media.Control WinRT API for media session state and playback controls
class WindowsMediaManager
{
public:
    static WindowsMediaManager& instance();

    bool isSupported() const;
    bool tryConnect();

    void sendPlay();
    void sendPause();
    void sendToggle();
    void sendNext();
    void sendPrevious();

private:
    WindowsMediaManager() = default;
    ~WindowsMediaManager() = default;

    bool m_connected = false;
};

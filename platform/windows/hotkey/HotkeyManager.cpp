#include "HotkeyManager.h"
#include <QGuiApplication>
#include <QDebug>

HotkeyManager::HotkeyManager(QObject *parent)
    : QObject(parent)
{
    QGuiApplication::instance()->installNativeEventFilter(this);
}

HotkeyManager::~HotkeyManager()
{
    unregisterAll();
}

bool HotkeyManager::registerHotkey(int id, Qt::Key key, Qt::KeyboardModifiers modifiers)
{
#ifdef Q_OS_WIN
    UINT mod = 0;
    if (modifiers & Qt::ControlModifier) mod |= MOD_CONTROL;
    if (modifiers & Qt::AltModifier) mod |= MOD_ALT;
    if (modifiers & Qt::ShiftModifier) mod |= MOD_SHIFT;
    if (modifiers & Qt::MetaModifier) mod |= MOD_WIN;

    BOOL result = RegisterHotKey(nullptr, id, mod, key);
    if (result) {
        m_registered[id] = true;
        return true;
    }
    qWarning() << "Failed to register hotkey" << id << "error:" << GetLastError();
    return false;
#else
    return false;
#endif
}

void HotkeyManager::unregisterHotkey(int id)
{
#ifdef Q_OS_WIN
    if (m_registered.contains(id)) {
        UnregisterHotKey(nullptr, id);
        m_registered.remove(id);
    }
#endif
}

void HotkeyManager::unregisterAll()
{
#ifdef Q_OS_WIN
    for (int id : m_registered.keys()) {
        UnregisterHotKey(nullptr, id);
    }
    m_registered.clear();
#endif
}

bool HotkeyManager::nativeEventFilter(const QByteArray &eventType, void *message, qintptr *result)
{
#ifdef Q_OS_WIN
    if (eventType == "windows_generic_MSG") {
        MSG *msg = static_cast<MSG*>(message);
        if (msg->message == WM_HOTKEY) {
            int id = msg->wParam;
            emit hotkeyTriggered(id);
            if (result) *result = 0;
            return true;
        }
    }
#else
    Q_UNUSED(eventType);
    Q_UNUSED(message);
    Q_UNUSED(result);
#endif
    return false;
}

#include "MouseHookManager.h"
#include <QDebug>

MouseHookManager *MouseHookManager::s_instance = nullptr;

MouseHookManager::MouseHookManager(QObject *parent)
    : QObject(parent)
    , m_enabled(false)
    , m_delay(300)
#ifdef Q_OS_WIN
    , m_hook(nullptr)
#endif
{
    s_instance = this;

    m_delayTimer.setSingleShot(true);
    m_delayTimer.setInterval(m_delay);
    connect(&m_delayTimer, &QTimer::timeout, this, [this]() {
        emit selectionFinished();
    });
}

MouseHookManager::~MouseHookManager()
{
    removeHook();
    if (s_instance == this) {
        s_instance = nullptr;
    }
}

void MouseHookManager::setEnabled(bool enabled)
{
    if (m_enabled == enabled) return;
    m_enabled = enabled;

    if (enabled) {
        installHook();
    } else {
        removeHook();
    }
}

void MouseHookManager::installHook()
{
#ifdef Q_OS_WIN
    if (m_hook) return;

    m_hook = SetWindowsHookEx(
        WH_MOUSE_LL,
        mouseProc,
        GetModuleHandle(nullptr),
        0
    );

    if (!m_hook) {
        qWarning() << "Failed to install mouse hook, error:" << GetLastError();
    } else {
        qDebug() << "Mouse hook installed successfully";
    }
#endif
}

void MouseHookManager::removeHook()
{
#ifdef Q_OS_WIN
    if (m_hook) {
        UnhookWindowsHookEx(m_hook);
        m_hook = nullptr;
        qDebug() << "Mouse hook removed";
    }
#endif
}

LRESULT CALLBACK MouseHookManager::mouseProc(int nCode, WPARAM wParam, LPARAM lParam)
{
#ifdef Q_OS_WIN
    if (nCode >= 0 && s_instance && s_instance->m_enabled) {
        if (wParam == WM_LBUTTONUP) {
            // 鼠标左键释放，延迟触发划词检测
            // 延迟是为了等待文本选择稳定
            s_instance->m_delayTimer.start();
        } else if (wParam == WM_LBUTTONDOWN || wParam == WM_RBUTTONDOWN) {
            // 按下时取消待触发的划词
            s_instance->m_delayTimer.stop();
        }
    }
    return CallNextHookEx(nullptr, nCode, wParam, lParam);
#else
    Q_UNUSED(nCode);
    Q_UNUSED(wParam);
    Q_UNUSED(lParam);
    return 0;
#endif
}

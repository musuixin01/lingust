#pragma once

#include <QObject>
#include <QTimer>

#ifdef Q_OS_WIN
#include <windows.h>
#endif

class MouseHookManager : public QObject
{
    Q_OBJECT
public:
    explicit MouseHookManager(QObject *parent = nullptr);
    ~MouseHookManager() override;

    void setEnabled(bool enabled);
    bool isEnabled() const { return m_enabled; }
    void setDelay(int ms) { m_delay = ms; }

signals:
    void selectionFinished();

private:
    void installHook();
    void removeHook();
    static LRESULT CALLBACK mouseProc(int nCode, WPARAM wParam, LPARAM lParam);

    bool m_enabled;
    int m_delay;
    QTimer m_delayTimer;
    static MouseHookManager *s_instance;

#ifdef Q_OS_WIN
    HHOOK m_hook;
#endif
};

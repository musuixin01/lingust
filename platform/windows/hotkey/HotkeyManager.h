#pragma once

#include <QObject>
#include <QAbstractNativeEventFilter>
#include <QHash>

#ifdef Q_OS_WIN
#include <windows.h>
#endif

class HotkeyManager : public QObject, public QAbstractNativeEventFilter
{
    Q_OBJECT
public:
    explicit HotkeyManager(QObject *parent = nullptr);
    ~HotkeyManager() override;

    bool registerHotkey(int id, Qt::Key key, Qt::KeyboardModifiers modifiers);
    void unregisterHotkey(int id);
    void unregisterAll();

    bool nativeEventFilter(const QByteArray &eventType, void *message, qintptr *result) override;

signals:
    void hotkeyTriggered(int id);

private:
    QHash<int, bool> m_registered;
};
